import { useState, useEffect } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreatePestControlRecord } from '../utils/farmBarnOps'
import { useFarmContext } from '../contexts/FarmContext'
import Form10DayView from './Form10DayView'
import MonthSelector from './MonthSelector'

const BLANK_DAY = {
    micesCaught: '',
    trapsChecked: '',
    baitReplenished: false,
    liveTrapsFindings: '',
    liveTrapsLocation: '',
    baitProduct: '',
    baitLocation: '',
    baitQuantity: '',
    birdsOnRange: '',
    correctiveActions: '',
}

const inputLocked = { backgroundColor: '#f5f5f5', color: '#666' }

export default function Form10PestControlRecords() {
    const supabase = useSupabase()
    const { farm, selectedBarn, monthYear, setMonthYear } = useFarmContext()
    const isRangeHousing = selectedBarn?.housing_type === 'free_run' || selectedBarn?.housing_type === 'free_range'

    // isCurrentMonth: true when the selected month is the current real-world month
    const today = new Date()
    const isCurrentMonth = monthYear === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`

    const [viewMode, setViewMode] = useState('day')

    // Monthly checks state
    const [exteriorInspectionDate, setExteriorInspectionDate] = useState('')
    const [exteriorInspectionObservation, setExteriorInspectionObservation] = useState('')
    const [wildBirdsObservation, setWildBirdsObservation] = useState('')
    const [flyMonitoring, setFlyMonitoring] = useState('')
    const [rangeGrass, setRangeGrass] = useState('')
    const [rangePondingWater, setRangePondingWater] = useState('')
    const [rangeRotationHarrow, setRangeRotationHarrow] = useState('')
    const [rangeWildBirdDeterrents, setRangeWildBirdDeterrents] = useState('')
    const [rangeGravelFences, setRangeGravelFences] = useState('')
    const [rangeOther, setRangeOther] = useState('')
    const [interiorInspectionDate, setInteriorInspectionDate] = useState('')
    const [interiorInspectionObservation, setInteriorInspectionObservation] = useState('')
    const [miceTotal, setMiceTotal] = useState('')
    const [trapsTotal, setTrapsTotal] = useState('')
    const [daysMonitored, setDaysMonitored] = useState('')
    const [signature, setSignature] = useState('')
    const [signatureDate, setSignatureDate] = useState('')
    const [comments, setComments] = useState('')
    const [monthlySaved, setMonthlySaved] = useState(false)
    const [monthlyLocked, setMonthlyLocked] = useState(false)

    // Day state (lazy per-day loading)
    const [dayData, setDayData] = useState({})
    const [lockedDays, setLockedDays] = useState({})
    const [selectedDay, setSelectedDay] = useState(() => {
        const t = new Date()
        const [y, m] = monthYear.split('-')
        return parseInt(y) === t.getFullYear() && parseInt(m) === t.getMonth() + 1 ? t.getDate() : 1
    })
    const [loadingDay, setLoadingDay] = useState(false)
    const [saving, setSaving] = useState(false)

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

    // Reset on barn/month change
    useEffect(() => {
        setDayData({})
        setLockedDays({})
        const t = new Date()
        const [y, m] = monthYear.split('-')
        setSelectedDay(parseInt(y) === t.getFullYear() && parseInt(m) === t.getMonth() + 1 ? t.getDate() : 1)
        setExteriorInspectionDate('')
        setExteriorInspectionObservation('')
        setWildBirdsObservation('')
        setFlyMonitoring('')
        setRangeGrass('')
        setRangePondingWater('')
        setRangeRotationHarrow('')
        setRangeWildBirdDeterrents('')
        setRangeGravelFences('')
        setRangeOther('')
        setInteriorInspectionDate('')
        setInteriorInspectionObservation('')
        setMiceTotal('')
        setTrapsTotal('')
        setDaysMonitored('')
        setSignature('')
        setSignatureDate('')
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
                const { data: pest } = await supabase.from('pest_control_records').select('id')
                    .eq('barn_id', selectedBarn.id).eq('audit_id', audit.id).maybeSingle()
                if (!pest || cancelled) return
                const { data: ma } = await supabase.from('pest_monthly_audit').select('*')
                    .eq('pest_id', pest.id).maybeSingle()
                if (cancelled) return
                if (ma) {
                    setExteriorInspectionDate(ma.exterior_inspection_date ?? '')
                    setExteriorInspectionObservation(ma.exterior_inspection_observation ?? '')
                    setWildBirdsObservation(ma.wild_birds_observation ?? '')
                    setFlyMonitoring(ma.fly_monitoring ?? '')
                    setRangeGrass(ma.range_grass ?? '')
                    setRangePondingWater(ma.range_ponding_water ?? '')
                    setRangeRotationHarrow(ma.range_rotation_harrow ?? '')
                    setRangeWildBirdDeterrents(ma.range_wild_bird_deterrents ?? '')
                    setRangeGravelFences(ma.range_gravel_fences ?? '')
                    setRangeOther(ma.range_other ?? '')
                    setInteriorInspectionDate(ma.interior_inspection_date ?? '')
                    setInteriorInspectionObservation(ma.interior_inspection_observation ?? '')
                    setMiceTotal(ma.mice_total?.toString() ?? '')
                    setTrapsTotal(ma.traps_total?.toString() ?? '')
                    setDaysMonitored(ma.days_monitored?.toString() ?? '')
                    setSignature(ma.signature ?? '')
                    setSignatureDate(ma.signature_date ?? '')
                    setComments(ma.comments ?? '')
                    setMonthlySaved(true)
                    setMonthlyLocked(true)
                }
            } catch (e) { /* silent */ }
        }
        load()
        return () => { cancelled = true }
    }, [selectedBarn?.id, monthYear])

    // Lazy-load selected day
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

                const { record: pest } = await getOrCreatePestControlRecord(selectedBarn.id, audit.id)

                if (!pest || cancelled) {
                    if (!cancelled) {
                        setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_DAY } }))
                        setLockedDays(p => ({ ...p, [selectedDay]: false }))
                    }
                    return
                }

                const { data: daily } = await supabase
                    .from('pest_daily_observations').select('*')
                    .eq('pest_id', pest.id).eq('record_date', recDate).maybeSingle()

                if (!daily || cancelled) {
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
                        micesCaught: daily.mice_caught?.toString() ?? '',
                        trapsChecked: daily.traps_checked?.toString() ?? '',
                        baitReplenished: daily.bait_replenished ?? false,
                        liveTrapsFindings: daily.trap_findings_notes ?? '',
                        liveTrapsLocation: daily.trap_location ?? '',
                        baitProduct: daily.bait_product ?? '',
                        baitLocation: daily.bait_location ?? '',
                        baitQuantity: daily.bait_quantity?.toString() ?? '',
                        birdsOnRange: daily.birds_on_range ?? '',
                        correctiveActions: daily.corrective_actions ?? '',
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
            const { record: pestControlRecord } = await getOrCreatePestControlRecord(selectedBarn.id, audit.id)
            const pestId = pestControlRecord.id
            const monthPrefix = monthYear.substring(0, 7)
            const recDate = `${monthPrefix}-${String(selectedDay).padStart(2, '0')}`
            const d = currentDayData

            const { error: dailyError } = await supabase
                .from('pest_daily_observations')
                .upsert([{
                    pest_id: pestId,
                    record_date: recDate,
                    mice_caught: d.micesCaught ? parseInt(d.micesCaught) : 0,
                    traps_checked: d.trapsChecked ? parseInt(d.trapsChecked) : null,
                    bait_replenished: d.baitReplenished ?? false,
                    trap_findings_notes: d.liveTrapsFindings || null,
                    trap_location: d.liveTrapsLocation || null,
                    bait_product: d.baitProduct || null,
                    bait_location: d.baitLocation || null,
                    bait_quantity: d.baitQuantity ? parseInt(d.baitQuantity) : null,
                    birds_on_range: isRangeHousing ? (d.birdsOnRange || null) : null,
                    corrective_actions: d.correctiveActions || null,
                }], { onConflict: 'pest_id,record_date' })
            if (dailyError) throw dailyError

            alert(`✅ Day ${selectedDay} pest control record saved!`)
            setLockedDays(p => ({ ...p, [selectedDay]: true }))
        } catch (err) {
            alert('Error saving: ' + err.message)
            console.error('Error:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleMarkMonthComplete = async () => {
        try {
            const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
            const { error } = await supabase
                .from('monthly_audits')
                .update({
                    form_10_completed: true,
                    form_10_completed_date: new Date().toISOString()
                })
                .eq('id', audit.id)
            if (error) throw error
            alert('✅ Form 10 marked as complete for ' + monthYear)
        } catch (err) {
            alert('Error marking complete: ' + err.message)
        }
    }

    const handleMonthlySubmit = async () => {
        try {
            const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
            const { record: pestControlRecord } = await getOrCreatePestControlRecord(selectedBarn.id, audit.id)
            const pestId = pestControlRecord.id

            const { error: auditError } = await supabase
                .from('pest_monthly_audit')
                .upsert([{
                    pest_id: pestId,
                    exterior_inspection_date: exteriorInspectionDate ? new Date(exteriorInspectionDate).toISOString().split('T')[0] : null,
                    exterior_inspection_observation: exteriorInspectionObservation || null,
                    wild_birds_observation: wildBirdsObservation || null,
                    fly_monitoring: flyMonitoring || null,
                    range_grass: isRangeHousing ? (rangeGrass || null) : null,
                    range_ponding_water: isRangeHousing ? (rangePondingWater || null) : null,
                    range_rotation_harrow: isRangeHousing ? (rangeRotationHarrow || null) : null,
                    range_wild_bird_deterrents: isRangeHousing ? (rangeWildBirdDeterrents || null) : null,
                    range_gravel_fences: isRangeHousing ? (rangeGravelFences || null) : null,
                    range_other: isRangeHousing ? (rangeOther || null) : null,
                    interior_inspection_date: interiorInspectionDate ? new Date(interiorInspectionDate).toISOString().split('T')[0] : null,
                    interior_inspection_observation: interiorInspectionObservation || null,
                    mice_total: miceTotal ? parseInt(miceTotal) : null,
                    traps_total: trapsTotal ? parseInt(trapsTotal) : null,
                    days_monitored: daysMonitored ? parseInt(daysMonitored) : null,
                    rodent_index: (() => { const m = parseFloat(miceTotal), t = parseFloat(trapsTotal), d = parseFloat(daysMonitored); return (!isNaN(m) && !isNaN(t) && !isNaN(d) && t !== 0 && d !== 0) ? (m / t / d) * 12 * 7 : null })(),
                    comments: comments || null,
                    signature: signature || null,
                    signature_date: signatureDate || null,
                }], { onConflict: 'pest_id' })

            if (auditError) throw auditError

            setMonthlySaved(true)
            setMonthlyLocked(true)
        } catch (error) {
            alert('Error saving monthly checks: ' + error.message)
            console.error('Error:', error)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', background: 'white', borderRadius: '8px' }}>

            {/* FORM HEADER */}
            <div style={{ borderBottom: '3px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', textAlign: 'center', color: '#000' }}>
                    Form 10 – Pest Control Records
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
                <Form10DayView
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
                    showBirdsOnRange={isRangeHousing}
                />
            )}

            {/* MONTHLY CHECKS */}
            {viewMode === 'monthly' && (
                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #666' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '30px', textAlign: 'center' }}>Monthly Checks</h3>

                    <fieldset disabled={monthlyLocked} style={{ border: 'none', padding: 0, margin: 0 }}>
                        {/* Exterior Inspection */}
                        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Exterior Inspection</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Date</label>
                                    <input type="date" value={exteriorInspectionDate}
                                        onChange={(e) => setExteriorInspectionDate(e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(monthlyLocked && inputLocked) }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Observation</label>
                                    <textarea value={exteriorInspectionObservation}
                                        onChange={(e) => setExteriorInspectionObservation(e.target.value)}
                                        maxLength="500"
                                        rows="3"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'Arial', ...(monthlyLocked && inputLocked) }} />
                                </div>
                            </div>
                        </div>

                        {/* Wild Birds */}
                        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Wild Birds</h4>
                            <textarea value={wildBirdsObservation}
                                onChange={(e) => setWildBirdsObservation(e.target.value)}
                                maxLength="500"
                                rows="3"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'Arial', ...(monthlyLocked && inputLocked) }} />
                        </div>

                        {/* Fly Monitoring */}
                        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Fly Monitoring</h4>
                            <select value={flyMonitoring}
                                onChange={(e) => setFlyMonitoring(e.target.value)}
                                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', ...(monthlyLocked && inputLocked) }}>
                                <option value="">-- Select level --</option>
                                <option value="Very Few">Very Few</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Severe">Severe</option>
                            </select>
                        </div>

                        {isRangeHousing && (
                            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Range Management</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    {[
                                        ['Grass:', rangeGrass, setRangeGrass, true],
                                        ['Ponding Water:', rangePondingWater, setRangePondingWater, true],
                                        ['Rotation/Harrow:', rangeRotationHarrow, setRangeRotationHarrow, false],
                                        ['Wild Bird Deterrents:', rangeWildBirdDeterrents, setRangeWildBirdDeterrents, false],
                                        ['Gravel/Fences:', rangeGravelFences, setRangeGravelFences, false],
                                        ['Other:', rangeOther, setRangeOther, false],
                                    ].map(([label, value, setter, useTextarea]) => (
                                        <div key={label}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>{label}</label>
                                            {useTextarea ? (
                                                <textarea value={value}
                                                    onChange={(e) => setter(e.target.value)}
                                                    maxLength="500"
                                                    rows="2"
                                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'Arial', ...(monthlyLocked && inputLocked) }} />
                                            ) : (
                                                <input type="text" value={value}
                                                    onChange={(e) => setter(e.target.value)}
                                                    maxLength="500"
                                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(monthlyLocked && inputLocked) }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Interior Inspection */}
                        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Interior Inspection</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Date</label>
                                    <input type="date" value={interiorInspectionDate}
                                        onChange={(e) => setInteriorInspectionDate(e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(monthlyLocked && inputLocked) }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Observation</label>
                                    <textarea value={interiorInspectionObservation}
                                        onChange={(e) => setInteriorInspectionObservation(e.target.value)}
                                        maxLength="500"
                                        rows="3"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'Arial', ...(monthlyLocked && inputLocked) }} />
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div style={{ marginBottom: '30px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Summary</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Mice Total</label>
                                    <input type="number" value={miceTotal}
                                        onChange={(e) => setMiceTotal(e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(monthlyLocked && inputLocked) }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Traps Total</label>
                                    <input type="number" value={trapsTotal}
                                        onChange={(e) => setTrapsTotal(e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(monthlyLocked && inputLocked) }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Days Monitored</label>
                                    <input type="number" value={daysMonitored}
                                        onChange={(e) => setDaysMonitored(e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(monthlyLocked && inputLocked) }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Rodent Index</label>
                                    <div style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5', fontSize: '16px', fontWeight: 'bold', color: '#333', minHeight: '36px' }}>
                                        {(() => { const m = parseFloat(miceTotal), t = parseFloat(trapsTotal), d = parseFloat(daysMonitored); return (!isNaN(m) && !isNaN(t) && !isNaN(d) && t !== 0 && d !== 0) ? ((m / t / d) * 12 * 7).toFixed(4) : '—' })()}
                                    </div>
                                    <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>(mice ÷ traps ÷ days) × 12 × 7</p>
                                </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Comments</label>
                                <textarea value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    maxLength="500"
                                    rows="4"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'Arial', ...(monthlyLocked && inputLocked) }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Signature</label>
                                    <input type="text" maxLength="200" value={signature}
                                        onChange={(e) => setSignature(e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(monthlyLocked && inputLocked) }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Signature Date</label>
                                    <input type="date" value={signatureDate}
                                        onChange={(e) => setSignatureDate(e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(monthlyLocked && inputLocked) }} />
                                </div>
                            </div>
                        </div>

                    </fieldset>

                    {/* Save / Edit Monthly Checks Button */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
                        {monthlyLocked ? (
                            <>
                                <button type="button" onClick={() => setMonthlyLocked(false)} style={{
                                    padding: '12px 40px',
                                    fontSize: '16px',
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
                                    padding: '12px 40px',
                                    fontSize: '16px',
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
                                padding: '12px 40px',
                                fontSize: '16px',
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
