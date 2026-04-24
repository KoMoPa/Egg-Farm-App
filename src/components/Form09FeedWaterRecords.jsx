import { useState, useEffect } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreateFeedWaterRecord } from '../utils/farmBarnOps'
import { useFarmContext } from '../contexts/FarmContext'
import DaySelector from './DaySelector'

const BLANK_DAY = {
    feedDaily: '', feedActual: '',
    waterDaily: '', waterActual: '',
    augerRunTimeMinutes: '',
    flush: false, medsVit: false, treatment: false,
    mortalityDaily: '', mortalityReason: '',
    hospitalPenMonitoring: '',
    inventory: '',
}

const inputLocked = { backgroundColor: '#f0f0f0', color: '#888', cursor: 'not-allowed' }
const selectLocked = { backgroundColor: '#f0f0f0', color: '#888', cursor: 'not-allowed' }

// DAY VIEW COMPONENT
const DayViewForm = ({ day, data, onDayChange, locked = false }) => (
    <div style={{ marginBottom: '30px', opacity: locked ? 0.8 : 1 }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '2px solid #666', paddingBottom: '10px' }}>
            Daily Tracking – Day {day}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Feed Daily Target</label>
                <input type="number" step="0.1" value={data.feedDaily}
                    onChange={(e) => onDayChange(day, 'feedDaily', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Feed Actual</label>
                <input type="number" step="0.1" value={data.feedActual}
                    onChange={(e) => onDayChange(day, 'feedActual', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Water Daily Target</label>
                <input type="number" step="0.1" value={data.waterDaily}
                    onChange={(e) => onDayChange(day, 'waterDaily', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Water Actual</label>
                <input type="number" step="0.1" value={data.waterActual}
                    onChange={(e) => onDayChange(day, 'waterActual', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Auger Run Time (minutes)</label>
                <input type="number" value={data.augerRunTimeMinutes}
                    onChange={(e) => onDayChange(day, 'augerRunTimeMinutes', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
            </div>
        </div>

        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Water Treatments</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Flush</label>
                <select value={data.flush ? 'true' : 'false'}
                    onChange={(e) => onDayChange(day, 'flush', e.target.value === 'true')}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && selectLocked) }}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Meds/Vit</label>
                <select value={data.medsVit ? 'true' : 'false'}
                    onChange={(e) => onDayChange(day, 'medsVit', e.target.value === 'true')}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && selectLocked) }}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Treatment</label>
                <select value={data.treatment ? 'true' : 'false'}
                    onChange={(e) => onDayChange(day, 'treatment', e.target.value === 'true')}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && selectLocked) }}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>
        </div>

        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Mortality Records</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Daily Mortality Count</label>
                <input type="number" value={data.mortalityDaily}
                    onChange={(e) => onDayChange(day, 'mortalityDaily', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Reason</label>
                <select value={data.mortalityReason}
                    onChange={(e) => onDayChange(day, 'mortalityReason', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && selectLocked) }}>
                    <option value="">Select...</option>
                    <option value="natural">Natural</option>
                    <option value="euthanized">Euthanized</option>
                </select>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hospital Pen Monitoring</label>
                <select value={data.hospitalPenMonitoring}
                    onChange={(e) => onDayChange(day, 'hospitalPenMonitoring', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && selectLocked) }}>
                    <option value="">Select...</option>
                    <option value="improved">Improved</option>
                    <option value="euthanized">Euthanized</option>
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Inventory</label>
                <input type="number" value={data.inventory}
                    onChange={(e) => onDayChange(day, 'inventory', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box', ...(locked && inputLocked) }} />
            </div>
        </div>
    </div>
)

export default function Form09FeedWaterRecords() {
    const supabase = useSupabase()
    const { farm, selectedBarn, monthYear } = useFarmContext()

    const [dayData, setDayData] = useState({})
    const [lockedDays, setLockedDays] = useState({})
    const [selectedDay, setSelectedDay] = useState(1)
    const [loadingDay, setLoadingDay] = useState(false)
    const [saving, setSaving] = useState(false)
    const [viewMode, setViewMode] = useState('day')

    // Monthly state
    const [feedTarget, setFeedTarget] = useState('')
    const [monthlyMortalityPercent, setMonthlyMortalityPercent] = useState('')
    const [comments, setComments] = useState('')
    const [monthlySaved, setMonthlySaved] = useState(false)

    const daysInMonth = new Date(
        parseInt(monthYear.substring(0, 4)),
        parseInt(monthYear.substring(5, 7)),
        0
    ).getDate()

    // Reset when barn or month changes
    useEffect(() => {
        setDayData({})
        setLockedDays({})
        setSelectedDay(1)
    }, [selectedBarn?.id, monthYear])

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

                const { data: audit } = await supabase
                    .from('monthly_audits').select('id')
                    .eq('farm_id', farm.id).eq('month_year', monthStr + '-01').maybeSingle()

                if (!audit || cancelled) {
                    if (!cancelled) {
                        setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_DAY } }))
                        setLockedDays(p => ({ ...p, [selectedDay]: false }))
                    }
                    return
                }

                const { data: fwr } = await supabase
                    .from('feed_water_records').select('id')
                    .eq('barn_id', selectedBarn.id).eq('audit_id', audit.id).maybeSingle()

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
            }], { onConflict: 'fw_id,record_date' })
            if (feedError) throw feedError

            const { error: healthError } = await supabase.from('feed_water_health').upsert([{
                fw_id: fwId,
                record_date: recDate,
                mortality_daily: d.mortalityDaily ? parseInt(d.mortalityDaily) : 0,
                mortality_reason: d.mortalityReason || null,
                hospital_pen_monitoring: d.hospitalPenMonitoring || null,
                inventory: d.inventory ? parseInt(d.inventory) : null,
                efo_notified: false,
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
                    monthly_mortality_percent: monthlyMortalityPercent ? parseFloat(monthlyMortalityPercent) : null,
                    comments: comments || null
                }], { onConflict: 'fw_id' })

            if (error) throw error
            setMonthlySaved(true)
            setTimeout(() => setMonthlySaved(false), 3000)
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
            <div style={{ borderBottom: '3px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', textAlign: 'center', color: '#000' }}>
                    Form 09 – Feed &amp; Water Records
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '16px', marginBottom: '20px' }}>
                    <div><strong>Farm Name:</strong> {farm?.farm_name}</div>
                    <div><strong>Barn:</strong> {selectedBarn?.barn_name}</div>
                    <div><strong>Month/Year:</strong> {monthYear.substring(0, 7)}</div>
                </div>

                {/* VIEW TOGGLE */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {['day', 'monthly'].map(mode => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => setViewMode(mode)}
                            style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                backgroundColor: viewMode === mode ? '#0066cc' : '#ddd',
                                color: viewMode === mode ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}>
                            {mode === 'day' ? 'Day View' : 'Monthly Checks'}
                        </button>
                    ))}
                </div>
            </div>

            {/* DAY VIEW */}
            {viewMode === 'day' && (
                <div>
                    {/* Scrollable day selector */}
                    <DaySelector
                        daysInMonth={daysInMonth}
                        selectedDay={selectedDay}
                        lockedDays={lockedDays}
                        onSelect={setSelectedDay}
                        loading={loadingDay}
                    />

                    {/* Locked banner */}
                    {isLocked && (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            backgroundColor: '#d4edda', borderRadius: '8px', padding: '12px 16px',
                            marginBottom: '16px', border: '1px solid #28a745'
                        }}>
                            <span style={{ color: '#155724', fontWeight: '600', fontSize: '14px' }}>
                                ✓ Already recorded for Day {selectedDay}
                            </span>
                            <button
                                type="button"
                                onClick={() => setLockedDays(p => ({ ...p, [selectedDay]: false }))}
                                style={{
                                    backgroundColor: '#0066cc', color: 'white', border: 'none',
                                    borderRadius: '6px', padding: '7px 14px',
                                    fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                                }}
                            >
                                Re-enter data
                            </button>
                        </div>
                    )}

                    <DayViewForm
                        day={selectedDay}
                        data={currentDayData}
                        onDayChange={handleDayChange}
                        locked={isLocked}
                    />

                    {!isLocked && (
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    padding: '12px 40px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    backgroundColor: saving ? '#aaa' : '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: saving ? 'not-allowed' : 'pointer'
                                }}>
                                {saving ? 'Saving…' : `💾 Save Day ${selectedDay} Record`}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* MONTHLY CHECKS TAB */}
            {viewMode === 'monthly' && (
                <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '10px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '24px', borderBottom: '2px solid #666', paddingBottom: '10px' }}>
                        Monthly Checks
                    </h3>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Feed Target</label>
                        <input type="text" value={feedTarget}
                            onChange={(e) => setFeedTarget(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Monthly Mortality %</label>
                        <input type="number" step="0.01" value={monthlyMortalityPercent}
                            onChange={(e) => setMonthlyMortalityPercent(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                        <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>If greater than 0.5%, notify EFO</p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Comments</label>
                        <textarea value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            rows={4}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                        {monthlySaved && (
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
                        )}
                        {monthlySaved && <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Saved!</span>}
                    </div>
                </div>
            )}
        </form>
    )
}
