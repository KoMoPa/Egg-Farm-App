import { useState, useEffect } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreatePestControlRecord } from '../utils/farmBarnOps'
import { useFarmContext } from '../contexts/FarmContext'
import DaySelector from './DaySelector'

const BLANK_DAY = {
    liveTrapsFindings: '',
    liveTrapsLocation: '',
    baitProduct: '',
    baitLocation: '',
    birdsOnRange: '',
    correctiveActions: '',
    frequencyWeekly: '',
    frequencyMonthly: '',
}

const inputLocked = { backgroundColor: '#f5f5f5', color: '#666' }

// DAY VIEW COMPONENT
const DayViewForm = ({ day, data, onDayChange, locked = false }) => (
    <div style={{ marginBottom: '30px', opacity: locked ? 0.8 : 1 }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '2px solid #666', paddingBottom: '10px' }}>
            Daily Tracking - Day {day}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Live Traps - Findings</label>
                <input type="text" value={data.liveTrapsFindings}
                    onChange={(e) => onDayChange(day, 'liveTrapsFindings', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Live Traps - Location</label>
                <input type="text" value={data.liveTrapsLocation}
                    onChange={(e) => onDayChange(day, 'liveTrapsLocation', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bait - Product</label>
                <input type="text" value={data.baitProduct}
                    onChange={(e) => onDayChange(day, 'baitProduct', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bait - Location</label>
                <input type="text" value={data.baitLocation}
                    onChange={(e) => onDayChange(day, 'baitLocation', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Birds on Range?</label>
                <select value={data.birdsOnRange}
                    onChange={(e) => onDayChange(day, 'birdsOnRange', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }}>
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="na">N/A</option>
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Corrective Actions</label>
                <input type="text" value={data.correctiveActions}
                    onChange={(e) => onDayChange(day, 'correctiveActions', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>At Least Weekly</label>
                <select value={data.frequencyWeekly}
                    onChange={(e) => onDayChange(day, 'frequencyWeekly', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }}>
                    <option value="">Select...</option>
                    <option value="checked">Checked</option>
                    <option value="not-checked">Not Checked</option>
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>At Least Monthly</label>
                <select value={data.frequencyMonthly}
                    onChange={(e) => onDayChange(day, 'frequencyMonthly', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }}>
                    <option value="">Select...</option>
                    <option value="checked">Checked</option>
                    <option value="not-checked">Not Checked</option>
                </select>
            </div>
        </div>
    </div>
)

export default function Form10PestControlRecords() {
    const supabase = useSupabase()
    const { farm, selectedBarn, monthYear } = useFarmContext()

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
    const [rodentIndex, setRodentIndex] = useState('')
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
        setRodentIndex('')
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
                    setRodentIndex(ma.rodent_index?.toString() ?? '')
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

                const { data: pest } = await supabase
                    .from('pest_control_records').select('id')
                    .eq('barn_id', selectedBarn.id).eq('audit_id', audit.id).maybeSingle()

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
                        liveTrapsFindings: daily.trap_findings_notes ?? '',
                        liveTrapsLocation: daily.trap_location ?? '',
                        baitProduct: daily.bait_product ?? '',
                        baitLocation: daily.bait_location ?? '',
                        birdsOnRange: daily.birds_on_range ?? '',
                        correctiveActions: daily.corrective_actions ?? '',
                        frequencyWeekly: '',
                        frequencyMonthly: '',
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
                    trap_findings_notes: d.liveTrapsFindings || null,
                    trap_location: d.liveTrapsLocation || null,
                    bait_product: d.baitProduct || null,
                    bait_location: d.baitLocation || null,
                    birds_on_range: d.birdsOnRange || null,
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
                    range_grass: rangeGrass || null,
                    range_ponding_water: rangePondingWater || null,
                    range_rotation_harrow: rangeRotationHarrow || null,
                    range_wild_bird_deterrents: rangeWildBirdDeterrents || null,
                    range_gravel_fences: rangeGravelFences || null,
                    range_other: rangeOther || null,
                    interior_inspection_date: interiorInspectionDate ? new Date(interiorInspectionDate).toISOString().split('T')[0] : null,
                    interior_inspection_observation: interiorInspectionObservation || null,
                    comments: comments || null,
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
            <div style={{ borderBottom: '3px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', textAlign: 'center', color: '#000' }}>
                    Form 10 – Pest Control Records
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
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                            <button type="submit" disabled={saving} style={{
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
                        <div style={{ display: 'flex', gap: '20px' }}>
                            {['Very Few', 'Moderate', 'Severe'].map(level => (
                                <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="radio" name="flyMonitoring" value={level}
                                        checked={flyMonitoring === level}
                                        onChange={(e) => setFlyMonitoring(e.target.value)} />
                                    {level}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Range Management */}
                    <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Range Management</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {[
                                ['Grass:', rangeGrass, setRangeGrass],
                                ['Ponding Water:', rangePondingWater, setRangePondingWater],
                                ['Rotation/Harrow:', rangeRotationHarrow, setRangeRotationHarrow],
                                ['Wild Bird Deterrents:', rangeWildBirdDeterrents, setRangeWildBirdDeterrents],
                                ['Gravel/Fences:', rangeGravelFences, setRangeGravelFences],
                                ['Other:', rangeOther, setRangeOther],
                            ].map(([label, value, setter]) => (
                                <div key={label}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>{label}</label>
                                    <input type="text" value={value}
                                        onChange={(e) => setter(e.target.value)}
                                        maxLength="500"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(monthlyLocked && inputLocked) }} />
                                </div>
                            ))}
                        </div>
                    </div>

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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Rodent Index</label>
                                <input type="text" value={rodentIndex}
                                    onChange={(e) => setRodentIndex(e.target.value)}
                                    maxLength="500"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(monthlyLocked && inputLocked) }} />
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
                    </div>

                    </fieldset>

                    {/* Save / Edit Monthly Checks Button */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
                        {monthlyLocked ? (
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
