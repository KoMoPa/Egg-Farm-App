import { useState, useEffect } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreateFeedWaterRecord } from '../utils/farmBarnOps'
import { useFarmContext } from '../contexts/FarmContext'
import Form09DayView from './Form09DayView'
import MonthSelector from './MonthSelector'

const BLANK_DAY = {
    feedDaily: '', feedActual: '',
    waterDaily: '', waterActual: '',
    augerRunTimeMinutes: '',
    flush: false, medsVit: false, treatment: false,
    notes: '',
    mortalityDaily: '', mortalityReason: '',
    hospitalPenMonitoring: '',
    inventory: '',
}

const inputLocked = { backgroundColor: '#f0f0f0', color: '#888', cursor: 'not-allowed' }
const selectLocked = { backgroundColor: '#f0f0f0', color: '#888', cursor: 'not-allowed' }

// DAY VIEW COMPONENT

export default function Form09FeedWaterRecords() {
    const supabase = useSupabase()
    const { farm, selectedBarn, monthYear, setMonthYear } = useFarmContext()

    // isCurrentMonth: true when the selected month is the current real-world month
    const today = new Date()
    const isCurrentMonth = monthYear === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`

    const [dayData, setDayData] = useState({})
    const [lockedDays, setLockedDays] = useState({})
    const [selectedDay, setSelectedDay] = useState(() => {
        const t = new Date()
        const [y, m] = monthYear.split('-')
        return parseInt(y) === t.getFullYear() && parseInt(m) === t.getMonth() + 1 ? t.getDate() : 1
    })
    const [loadingDay, setLoadingDay] = useState(false)
    const [saving, setSaving] = useState(false)
    const [viewMode, setViewMode] = useState('day')

    // Monthly state
    const [feedTarget, setFeedTarget] = useState('')
    const [startingInventory, setStartingInventory] = useState('')
    const [waterResidualMonthly, setWaterResidualMonthly] = useState('')
    const [calculatedMortalityTotal, setCalculatedMortalityTotal] = useState(null)
    const [monthlyEfoNotified, setMonthlyEfoNotified] = useState(false)
    const [comments, setComments] = useState('')
    const [monthlySaved, setMonthlySaved] = useState(false)
    const [monthlyLocked, setMonthlyLocked] = useState(false)

    const daysInMonth = new Date(
        parseInt(monthYear.substring(0, 4)),
        parseInt(monthYear.substring(5, 7)),
        0
    ).getDate()

    // Scroll to top on view/month changes
    useEffect(() => {
        const contentEl = document.querySelector('.app-content')
        if (contentEl) contentEl.scrollTop = 0
    }, [viewMode, monthYear])

    // Reset when barn or month changes
    useEffect(() => {
        setDayData({})
        setLockedDays({})
        const t = new Date()
        const [y, m] = monthYear.split('-')
        setSelectedDay(parseInt(y) === t.getFullYear() && parseInt(m) === t.getMonth() + 1 ? t.getDate() : 1)
        setFeedTarget('')
        setStartingInventory('')
        setWaterResidualMonthly('')
        setCalculatedMortalityTotal(null)
        setMonthlyEfoNotified(false)
        setComments('')
        setMonthlySaved(false)
        setMonthlyLocked(false)
    }, [selectedBarn?.id, monthYear])

    // Load monthly checks data from DB
    useEffect(() => {
        if (!farm?.id || !selectedBarn?.id) return
        let cancelled = false
        const load = async () => {
            try {
                const monthStr = monthYear.substring(0, 7)
                const { data: audit } = await supabase.from('monthly_audits').select('id')
                    .eq('farm_id', farm.id).eq('month_year', monthStr + '-01').maybeSingle()
                if (!audit || cancelled) return
                const { data: fwr } = await supabase.from('feed_water_records').select('id')
                    .eq('barn_id', selectedBarn.id).eq('audit_id', audit.id).maybeSingle()
                if (!fwr || cancelled) return
                const { data: meta } = await supabase.from('feed_water_monthly_metadata').select('*')
                    .eq('fw_id', fwr.id).maybeSingle()
                if (cancelled) return
                if (meta) {
                    setFeedTarget(meta.feed_target ?? '')
                    setStartingInventory(meta.starting_inventory?.toString() ?? '')
                    setWaterResidualMonthly(meta.water_residual_monthly ?? '')
                    setMonthlyEfoNotified(meta.monthly_efo_notified ?? false)
                    setComments(meta.comments ?? '')
                    setMonthlySaved(true)
                    setMonthlyLocked(true)
                }
            } catch (e) { /* silent */ }
        }
        load()
        return () => { cancelled = true }
    }, [selectedBarn?.id, monthYear])

    // Auto-calculate monthly mortality total from all daily records
    useEffect(() => {
        if (!farm?.id || !selectedBarn?.id || viewMode !== 'monthly') return
        let cancelled = false
        const fetchSum = async () => {
            try {
                const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
                const { record: fwr } = await getOrCreateFeedWaterRecord(selectedBarn.id, audit.id)
                const { data } = await supabase
                    .from('feed_water_health')
                    .select('mortality_daily')
                    .eq('fw_id', fwr.id)
                if (cancelled) return
                const total = (data || []).reduce((sum, r) => sum + (r.mortality_daily || 0), 0)
                setCalculatedMortalityTotal(total)
            } catch (e) { /* silent */ }
        }
        fetchSum()
        return () => { cancelled = true }
    }, [viewMode, selectedBarn?.id, monthYear])

    // Lazy-load selected day data from DB
    useEffect(() => {
        if (!farm?.id || !selectedBarn?.id) return
        if (dayData[selectedDay] !== undefined) return
        let cancelled = false

        const load = async () => {
            setLoadingDay(true)
            try {
                const monthStr = monthYear.substring(0, 7)
                const recDate = `${monthStr}-${String(selectedDay).padStart(2, '0')}`

                const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
                if (!audit || cancelled) {
                    if (!cancelled) {
                        setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_DAY } }))
                        setLockedDays(p => ({ ...p, [selectedDay]: false }))
                    }
                    return
                }

                const { record: fwr } = await getOrCreateFeedWaterRecord(selectedBarn.id, audit.id)

                if (!fwr || cancelled) {
                    if (!cancelled) {
                        setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_DAY } }))
                        setLockedDays(p => ({ ...p, [selectedDay]: false }))
                    }
                    return
                }

                const [{ data: fwd }, { data: fwh }] = await Promise.all([
                    supabase.from('feed_water_daily').select('*')
                        .eq('fw_id', fwr.id).eq('record_date', recDate).maybeSingle(),
                    supabase.from('feed_water_health').select('*')
                        .eq('fw_id', fwr.id).eq('record_date', recDate).maybeSingle(),
                ])

                if (!fwd || cancelled) {
                    if (!cancelled) {
                        setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_DAY } }))
                        setLockedDays(p => ({ ...p, [selectedDay]: false }))
                    }
                    return
                }
                if (cancelled) return

                setDayData(p => ({
                    ...p,
                    [selectedDay]: {
                        feedDaily: fwd.feed_daily?.toString() ?? '',
                        feedActual: fwd.feed_actual?.toString() ?? '',
                        waterDaily: fwd.water_daily?.toString() ?? '',
                        waterActual: fwd.water_actual?.toString() ?? '',
                        augerRunTimeMinutes: fwd.auger_run_time_minutes?.toString() ?? '',
                        flush: !!fwd.flush_notes,
                        medsVit: !!fwd.meds_vit_notes,
                        treatment: !!fwd.treatment_notes,
                        notes: fwd.notes ?? '',
                        mortalityDaily: fwh?.mortality_daily?.toString() ?? '',
                        mortalityReason: fwh?.mortality_reason ?? '',
                        hospitalPenMonitoring: fwh?.hospital_pen_monitoring ?? '',
                        inventory: fwh?.inventory?.toString() ?? '',
                    },
                }))
                setLockedDays(p => ({ ...p, [selectedDay]: true }))
            } catch (e) {
                if (!cancelled) {
                    console.error('Error loading day:', e)
                    setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_DAY } }))
                    setLockedDays(p => ({ ...p, [selectedDay]: false }))
                }
            } finally {
                if (!cancelled) setLoadingDay(false)
            }
        }

        load()
        return () => { cancelled = true }
    }, [selectedDay, selectedBarn?.id, monthYear])

    const currentDayData = dayData[selectedDay] ?? { ...BLANK_DAY }
    const isLocked = lockedDays[selectedDay] === true

    const handleDayChange = (day, field, value) => {
        setDayData(prev => ({
            ...prev,
            [day]: { ...(prev[day] ?? BLANK_DAY), [field]: value }
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
            const { record: feedWaterRecord } = await getOrCreateFeedWaterRecord(selectedBarn.id, audit.id)
            const fwId = feedWaterRecord.id
            const monthPrefix = monthYear.substring(0, 7)
            const recDate = `${monthPrefix}-${String(selectedDay).padStart(2, '0')}`
            const d = dayData[selectedDay] ?? BLANK_DAY

            const { error: feedError } = await supabase.from('feed_water_daily').upsert([{
                fw_id: fwId,
                record_date: recDate,
                feed_daily: d.feedDaily ? parseFloat(d.feedDaily) : null,
                feed_actual: d.feedActual ? parseFloat(d.feedActual) : null,
                water_daily: d.waterDaily ? parseFloat(d.waterDaily) : null,
                water_actual: d.waterActual ? parseFloat(d.waterActual) : null,
                auger_run_time_minutes: d.augerRunTimeMinutes ? parseInt(d.augerRunTimeMinutes) : null,
                flush_notes: d.flush ? 'Yes' : null,
                meds_vit_notes: d.medsVit ? 'Yes' : null,
                treatment_notes: d.treatment ? 'Yes' : null,
                notes: d.notes || null,
            }], { onConflict: 'fw_id,record_date' })
            if (feedError) throw feedError

            const { error: healthError } = await supabase.from('feed_water_health').upsert([{
                fw_id: fwId,
                record_date: recDate,
                mortality_daily: d.mortalityDaily ? parseInt(d.mortalityDaily) : 0,
                mortality_reason: d.mortalityReason || null,
                hospital_pen_monitoring: d.hospitalPenMonitoring || null,
                inventory: d.inventory ? parseInt(d.inventory) : null,
            }], { onConflict: 'fw_id,record_date' })
            if (healthError) throw healthError

            alert(`✅ Day ${selectedDay} record saved!`)
            setLockedDays(p => ({ ...p, [selectedDay]: true }))
        } catch (err) {
            alert('Error saving: ' + err.message)
            console.error('Error:', err)
        } finally {
            setSaving(false)
        }
    }

    const computedMortalityPct = (startingInventory && calculatedMortalityTotal !== null)
        ? (calculatedMortalityTotal / parseInt(startingInventory)) * 100
        : null

    const handleMonthlySubmit = async (e) => {
        e.preventDefault()
        try {
            const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
            const { record: feedWaterRecord } = await getOrCreateFeedWaterRecord(selectedBarn.id, audit.id)
            const fwId = feedWaterRecord.id

            const { error } = await supabase
                .from('feed_water_monthly_metadata')
                .upsert([{
                    fw_id: fwId,
                    feed_target: feedTarget || null,
                    starting_inventory: startingInventory ? parseInt(startingInventory) : null,
                    water_residual_monthly: waterResidualMonthly || null,
                    monthly_mortality_percent: computedMortalityPct !== null ? parseFloat(computedMortalityPct.toFixed(2)) : null,
                    monthly_efo_notified: monthlyEfoNotified,
                    comments: comments || null
                }], { onConflict: 'fw_id' })

            if (error) throw error
            setMonthlySaved(true)
            setMonthlyLocked(true)
        } catch (err) {
            alert('Error saving monthly checks: ' + err.message)
        }
    }

    const handleMarkMonthComplete = async () => {
        try {
            const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
            const { error } = await supabase
                .from('monthly_audits')
                .update({
                    form_09_completed: true,
                    form_09_completed_date: new Date().toISOString()
                })
                .eq('id', audit.id)

            if (error) throw error
            alert('✅ Form 09 marked as complete for ' + monthYear)
        } catch (err) {
            alert('Error marking complete: ' + err.message)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', background: 'white', borderRadius: '8px' }}>

            {/* FORM HEADER */}
            <div style={{ borderBottom: '3px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', textAlign: 'center', color: '#000' }}>
                    Form 09 – Feed &amp; Water Records
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '16px' }}>
                    <div><strong>Farm Name:</strong> {farm?.farm_name}</div>
                    <div><strong>Barn:</strong> {selectedBarn?.barn_name}</div>
                </div>
            </div>

            {/* VIEW TOGGLE */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                {['day', 'monthly'].map(mode => (
                    <button
                        key={mode}
                        type="button"
                        onClick={() => setViewMode(mode)}
                        style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            backgroundColor: viewMode === mode ? '#2D855B' : '#ddd',
                            color: viewMode === mode ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>
                        {mode === 'day' ? 'Day View' : 'Monthly Checks'}
                    </button>
                ))}
            </div>

            {/* MONTH SELECTOR */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', gap: '4px' }}>
                <MonthSelector value={monthYear} onChange={setMonthYear} />
                {!isCurrentMonth && (
                    <span style={{ fontSize: '11px', color: '#999' }}>Viewing past month</span>
                )}
            </div>

            {/* DAY VIEW */}
            {viewMode === 'day' && (
                <Form09DayView
                    day={selectedDay}
                    data={currentDayData}
                    isLocked={isLocked}
                    saving={saving}
                    onDayChange={handleDayChange}
                    onUnlock={() => setLockedDays(p => ({ ...p, [selectedDay]: false }))}
                    monthYear={monthYear}
                    lockedDays={lockedDays}
                    loadingDay={loadingDay}
                    onSelectDay={setSelectedDay}
                />
            )}

            {/* MONTHLY CHECKS TAB */}
            {viewMode === 'monthly' && (
                <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '10px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '24px', borderBottom: '2px solid #666', paddingBottom: '10px' }}>
                        Monthly Checks
                    </h3>

                    <fieldset disabled={monthlyLocked} style={{ border: 'none', padding: 0, margin: 0 }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Starting Inventory</label>
                            <input type="number" value={startingInventory}
                                onChange={(e) => setStartingInventory(e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', ...(monthlyLocked && inputLocked) }} />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Feed Target</label>
                            <input type="text" value={feedTarget}
                                onChange={(e) => setFeedTarget(e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', ...(monthlyLocked && inputLocked) }} />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Monthly Mortality %</label>
                            <div style={{
                                padding: '10px 12px',
                                background: '#f5f5f5',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: computedMortalityPct !== null && computedMortalityPct > 0.5 ? '#cc0000' : '#333'
                            }}>
                                {computedMortalityPct !== null
                                    ? `${computedMortalityPct.toFixed(2)}%`
                                    : startingInventory
                                        ? '0.00%'
                                        : 'Enter starting inventory to calculate'}
                            </div>
                            <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                                Auto-calculated from daily mortality ÷ starting inventory
                            </p>
                            {computedMortalityPct !== null && computedMortalityPct > 0.5 && (
                                <div style={{
                                    marginTop: '10px',
                                    padding: '12px',
                                    backgroundColor: '#fff3cd',
                                    border: '1px solid #ffc107',
                                    borderRadius: '4px'
                                }}>
                                    <p style={{ margin: '0 0 8px', fontWeight: 'bold', color: '#856404' }}>
                                        ⚠️ Monthly mortality exceeds 0.5% — EFO notification required
                                    </p>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: monthlyLocked ? 'default' : 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={monthlyEfoNotified}
                                            onChange={(e) => setMonthlyEfoNotified(e.target.checked)}
                                            disabled={monthlyLocked}
                                        />
                                        EFO Notified
                                    </label>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Water Residual (Monthly)</label>
                            <input type="text" value={waterResidualMonthly}
                                onChange={(e) => setWaterResidualMonthly(e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', ...(monthlyLocked && inputLocked) }} />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Comments</label>
                            <textarea value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                rows={4}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit', boxSizing: 'border-box', ...(monthlyLocked && inputLocked) }} />
                        </div>
                    </fieldset>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {monthlyLocked ? (
                            <>
                                <button type="button" onClick={() => setMonthlyLocked(false)} style={{
                                    padding: '10px 32px',
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}>
                                    ✏️ Edit Monthly Checks
                                </button>
                                <button type="button" onClick={handleMarkMonthComplete} style={{
                                    padding: '10px 32px',
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#155724',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}>
                                    ✓ Mark Month Complete
                                </button>
                            </>
                        ) : (
                            <button type="button" onClick={handleMonthlySubmit} style={{
                                padding: '10px 32px',
                                fontSize: '15px',
                                fontWeight: 'bold',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}>
                                💾 Save Monthly Checks
                            </button>
                        )}
                    </div>
                </div>
            )}
        </form>
    )
}
