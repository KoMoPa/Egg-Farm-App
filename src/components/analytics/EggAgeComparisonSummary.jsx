import { useEffect, useState } from 'react'
import { useSupabase } from '../../contexts/SupabaseContext'
import { useFarmContext } from '../../contexts/FarmContext'

const MIN_OVERLAP_POINTS = 4

function toNumber(value) {
    const num = Number(value)
    return Number.isFinite(num) ? num : null
}

function averageByAge(eggRows, ageRows) {
    const ageByKey = new Map()
    for (const row of ageRows || []) {
        if (!row?.production_id || !row?.record_date) continue
        if (row.flock_age_weeks == null) continue
        ageByKey.set(`${row.production_id}|${row.record_date}`, Number(row.flock_age_weeks))
    }

    const buckets = new Map()
    for (const row of eggRows || []) {
        if (!row?.production_id || !row?.record_date) continue
        const value = toNumber(row.egg_production_daily)
        if (value == null) continue

        const ageWeek = ageByKey.get(`${row.production_id}|${row.record_date}`)
        if (ageWeek == null || Number.isNaN(ageWeek)) continue

        const prev = buckets.get(ageWeek) || { sum: 0, count: 0 }
        buckets.set(ageWeek, {
            sum: prev.sum + value,
            count: prev.count + 1,
        })
    }

    return [...buckets.entries()]
        .map(([ageWeek, agg]) => ({
            ageWeek,
            avgEggsDaily: agg.count > 0 ? agg.sum / agg.count : 0,
            sampleDays: agg.count,
        }))
        .sort((a, b) => a.ageWeek - b.ageWeek)
}

async function fetchFlockEggAgeSeries(supabase, barnId, flockId) {
    const [eggRes, ageRes] = await Promise.all([
        supabase
            .from('production_egg_output')
            .select('production_id, record_date, egg_production_daily, production_cooler_records(barn_id, flock_id)')
            .eq('production_cooler_records.barn_id', barnId)
            .eq('production_cooler_records.flock_id', flockId)
            .not('egg_production_daily', 'is', null)
            .order('record_date', { ascending: true }),
        supabase
            .from('production_flock_age')
            .select('production_id, record_date, flock_age_weeks, production_cooler_records(barn_id, flock_id)')
            .eq('production_cooler_records.barn_id', barnId)
            .eq('production_cooler_records.flock_id', flockId)
            .not('flock_age_weeks', 'is', null)
            .order('record_date', { ascending: true }),
    ])

    if (eggRes.error) throw eggRes.error
    if (ageRes.error) throw ageRes.error

    return averageByAge(eggRes.data || [], ageRes.data || [])
}

export default function EggAgeComparisonSummary() {
    const supabase = useSupabase()
    const { selectedBarn } = useFarmContext()

    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('idle')
    const [summary, setSummary] = useState(null)

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            if (!selectedBarn?.id) {
                setStatus('no_barn')
                setSummary(null)
                return
            }

            try {
                setLoading(true)
                setStatus('loading')

                const { data: barn, error: barnError } = await supabase
                    .from('barns')
                    .select('current_flock_id')
                    .eq('id', selectedBarn.id)
                    .maybeSingle()

                if (barnError) throw barnError

                const currentFlockId = barn?.current_flock_id
                if (!currentFlockId) {
                    if (!cancelled) {
                        setStatus('no_current_flock')
                        setSummary(null)
                    }
                    return
                }

                const { data: flocks, error: flockError } = await supabase
                    .from('flocks')
                    .select('id, status, arrival_date, depletion_date')
                    .eq('barn_id', selectedBarn.id)
                    .neq('id', currentFlockId)
                    .order('depletion_date', { ascending: false, nullsFirst: false })
                    .order('arrival_date', { ascending: false })

                if (flockError) throw flockError

                const previousFlock = (flocks || []).find(f => f.status === 'closed' || !!f.depletion_date) || flocks?.[0]

                if (!previousFlock?.id) {
                    if (!cancelled) {
                        setStatus('no_previous_flock')
                        setSummary(null)
                    }
                    return
                }

                const [currentSeries, previousSeries] = await Promise.all([
                    fetchFlockEggAgeSeries(supabase, selectedBarn.id, currentFlockId),
                    fetchFlockEggAgeSeries(supabase, selectedBarn.id, previousFlock.id),
                ])

                if (!currentSeries.length) {
                    if (!cancelled) {
                        setStatus('no_current_data')
                        setSummary(null)
                    }
                    return
                }

                if (!previousSeries.length) {
                    if (!cancelled) {
                        setStatus('no_previous_data')
                        setSummary(null)
                    }
                    return
                }

                const previousByAge = new Map(previousSeries.map(p => [p.ageWeek, p]))
                const comparison = currentSeries
                    .filter(c => previousByAge.has(c.ageWeek))
                    .map(c => {
                        const prev = previousByAge.get(c.ageWeek)
                        const delta = c.avgEggsDaily - prev.avgEggsDaily
                        return {
                            ageWeek: c.ageWeek,
                            currentAvgEggsDaily: c.avgEggsDaily,
                            previousAvgEggsDaily: prev.avgEggsDaily,
                            deltaEggsDaily: delta,
                            deltaPct: prev.avgEggsDaily ? (delta / prev.avgEggsDaily) * 100 : null,
                            currentSampleDays: c.sampleDays,
                            previousSampleDays: prev.sampleDays,
                        }
                    })

                if (!comparison.length) {
                    if (!cancelled) {
                        setStatus('no_overlap')
                        setSummary(null)
                    }
                    return
                }

                const latest = comparison[comparison.length - 1]
                if (!cancelled) {
                    setSummary({
                        overlapCount: comparison.length,
                        latest,
                        recent: comparison.slice(-3).reverse(),
                    })
                    setStatus(comparison.length < MIN_OVERLAP_POINTS ? 'insufficient_data' : 'ok')
                }
            } catch (err) {
                console.error('Error loading egg age comparison summary:', err)
                if (!cancelled) {
                    setStatus('error')
                    setSummary(null)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [selectedBarn?.id])

    if (status === 'no_barn') return <p className="analytics-info">Select a barn</p>
    if (loading || status === 'loading') return <p className="analytics-info">Loading comparison...</p>
    if (status === 'no_current_flock') return <p className="analytics-info">No active flock selected for this barn yet.</p>
    if (status === 'no_previous_flock') return <p className="analytics-info">Need a previous flock to compare against.</p>
    if (status === 'no_current_data') return <p className="analytics-info">Current flock has no egg production + age data yet.</p>
    if (status === 'no_previous_data') return <p className="analytics-info">Previous flock has no egg production + age data yet.</p>
    if (status === 'no_overlap') return <p className="analytics-info">No shared flock ages yet between current and previous flocks.</p>
    if (status === 'error') return <p className="analytics-info">Could not load egg age comparison right now.</p>

    const latest = summary?.latest
    const deltaClass = latest?.deltaEggsDaily > 0 ? 'over' : latest?.deltaEggsDaily < 0 ? 'under' : ''

    return (
        <>
            {status === 'insufficient_data' && (
                <p className="analytics-info" style={{ marginBottom: '10px' }}>
                    Early comparison: fewer than {MIN_OVERLAP_POINTS} shared flock-age weeks.
                </p>
            )}

            <div className="chart-mini-stats">
                <div className="chart-mini-stat">
                    <div className="chart-mini-val">{latest?.ageWeek ?? '-'}</div>
                    <div className="chart-mini-lbl">Latest shared age (weeks)</div>
                </div>
                <div className="chart-mini-stat">
                    <div className="chart-mini-val">{latest?.currentAvgEggsDaily?.toFixed(1) ?? '-'}</div>
                    <div className="chart-mini-lbl">Current flock avg eggs/day</div>
                </div>
                <div className="chart-mini-stat">
                    <div className="chart-mini-val">{latest?.previousAvgEggsDaily?.toFixed(1) ?? '-'}</div>
                    <div className="chart-mini-lbl">Previous flock avg eggs/day</div>
                </div>
                <div className="chart-mini-stat">
                    <div className={`chart-mini-val ${deltaClass}`}>{latest?.deltaEggsDaily?.toFixed(1) ?? '-'}</div>
                    <div className="chart-mini-lbl">Difference (eggs/day)</div>
                </div>
            </div>

            <p className="analytics-info" style={{ marginBottom: '10px' }}>
                Based on {summary?.overlapCount ?? 0} shared flock-age week(s) between current and previous flocks.
            </p>

            <div style={{ display: 'grid', gap: '6px' }}>
                {(summary?.recent || []).map(row => (
                    <div
                        key={row.ageWeek}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '140px 1fr',
                            gap: '8px',
                            fontSize: '12px',
                            color: '#555',
                            background: '#f8f9fa',
                            borderRadius: '4px',
                            padding: '8px 10px',
                        }}
                    >
                        <strong>Age week {row.ageWeek}</strong>
                        <span>
                            Current flock {row.currentAvgEggsDaily.toFixed(1)} vs Previous flock {row.previousAvgEggsDaily.toFixed(1)}
                            {' '}({row.deltaEggsDaily >= 0 ? '+' : ''}{row.deltaEggsDaily.toFixed(1)} / {row.deltaPct == null ? '-' : `${row.deltaPct.toFixed(1)}%`})
                        </span>
                    </div>
                ))}
            </div>
        </>
    )
}
