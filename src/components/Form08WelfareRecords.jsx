import { useState, useEffect } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreateWelfareRecord } from '../utils/farmBarnOps'
import { useFarmContext } from '../contexts/FarmContext'
import DaySelector from './DaySelector'

const BLANK_DAY = {
    barnTempHi: '',
    barnTempLo: '',
    exteriorTemp: '',
    floorsChecked: false,
    wallsFansCeilingChecked: false,
    manureChecked: false,
    beddingUsed: false,
    chemicalsUsed: false,
    routineHenEquip1stInitial: '',
    routineHenEquip1stDaily: '',
    routineHenEquip2ndInitial: '',
    routineHenEquip2ndDaily: '',
    overallAppearance: false,
    generalSound: false,
    abnormalBehavior: false,
    signsOfDisease: false,
    injuredBirds: false,
    respiratoryProblems: false,
    pantingHuddling: false,
    lameness: false,
    featherPecking: false,
    trappedBirds: false,
    deadBirds: false,
    feedWaterAvailable: false,
    equipmentOperating: false,
    amenitiesCondition: false,
    layFacilityEnvironment: false,
}

const inputLocked = { backgroundColor: '#f5f5f5', color: '#666' }

// DAY VIEW COMPONENT
const DayViewForm = ({ day, data, onDayChange, locked = false }) => (
    <div style={{ marginBottom: '30px', opacity: locked ? 0.8 : 1 }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '2px solid #666', paddingBottom: '10px' }}>
            Daily Tracking - Day {day}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Barn Temp HI (°C)</label>
                <input type="number" step="0.1" value={data.barnTempHi}
                    onChange={(e) => onDayChange(day, 'barnTempHi', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Barn Temp LO (°C)</label>
                <input type="number" step="0.1" value={data.barnTempLo}
                    onChange={(e) => onDayChange(day, 'barnTempLo', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Exterior Temp (°C)</label>
                <input type="number" step="0.1" value={data.exteriorTemp}
                    onChange={(e) => onDayChange(day, 'exteriorTemp', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
            </div>
        </div>

        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Sanitation Checks</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: locked ? 'default' : 'pointer' }}>
                <input type="checkbox" checked={data.floorsChecked}
                    onChange={(e) => onDayChange(day, 'floorsChecked', e.target.checked)}
                    disabled={locked} />
                Floors Checked
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: locked ? 'default' : 'pointer' }}>
                <input type="checkbox" checked={data.wallsFansCeilingChecked}
                    onChange={(e) => onDayChange(day, 'wallsFansCeilingChecked', e.target.checked)}
                    disabled={locked} />
                Walls/Fans/Ceiling Checked
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: locked ? 'default' : 'pointer' }}>
                <input type="checkbox" checked={data.manureChecked}
                    onChange={(e) => onDayChange(day, 'manureChecked', e.target.checked)}
                    disabled={locked} />
                Manure Checked
            </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bedding Used</label>
                <select value={data.beddingUsed ? 'true' : 'false'}
                    onChange={(e) => onDayChange(day, 'beddingUsed', e.target.value === 'true')}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Chemicals Used</label>
                <select value={data.chemicalsUsed ? 'true' : 'false'}
                    onChange={(e) => onDayChange(day, 'chemicalsUsed', e.target.value === 'true')}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>
        </div>

        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Weekly Welfare Inspection</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>1st Initial</label>
                <input type="text" maxLength="3" value={data.routineHenEquip1stInitial}
                    onChange={(e) => onDayChange(day, 'routineHenEquip1stInitial', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>1st Daily</label>
                <input type="text" maxLength="3" value={data.routineHenEquip1stDaily}
                    onChange={(e) => onDayChange(day, 'routineHenEquip1stDaily', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>2nd Initial</label>
                <input type="text" maxLength="3" value={data.routineHenEquip2ndInitial}
                    onChange={(e) => onDayChange(day, 'routineHenEquip2ndInitial', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>2nd Daily</label>
                <input type="text" maxLength="3" value={data.routineHenEquip2ndDaily}
                    onChange={(e) => onDayChange(day, 'routineHenEquip2ndDaily', e.target.value)}
                    disabled={locked}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', ...(locked && inputLocked) }} />
            </div>
        </div>

        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Inspection Criteria (Check as applicable)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            {[
                ['overallAppearance', 'Overall appearance of birds'],
                ['generalSound', 'General sound of flock'],
                ['abnormalBehavior', 'Abnormal Behavior'],
                ['signsOfDisease', 'Signs of Disease/Illness'],
                ['injuredBirds', 'Injured Birds'],
                ['respiratoryProblems', 'Respiratory Problems'],
                ['pantingHuddling', 'Panting/Huddling'],
                ['lameness', 'Lameness'],
                ['featherPecking', 'Signs of Feather Pecking/Cannibalism'],
                ['trappedBirds', 'Trapped Birds'],
                ['deadBirds', 'Dead Birds'],
                ['feedWaterAvailable', 'Feed & Water Available'],
                ['equipmentOperating', 'Equipment Operating'],
                ['amenitiesCondition', 'Condition of Amenities/Housing'],
                ['layFacilityEnvironment', 'Lay Facility Environment'],
            ].map(([field, label]) => (
                <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: locked ? 'default' : 'pointer' }}>
                    <input type="checkbox" checked={data[field]}
                        onChange={(e) => onDayChange(day, field, e.target.checked)}
                        disabled={locked} />
                    {label}
                </label>
            ))}
        </div>
    </div>
)



export default function Form08WelfareRecords() {
    const { farm, selectedBarn, monthYear } = useFarmContext()
    const supabase = useSupabase()

    // Monthly checks state
    const [ammoniaRange, setAmmoniaRange] = useState('')
    const [alarmCheckDate, setAlarmCheckDate] = useState('')
    const [alarmCheckInitials, setAlarmCheckInitials] = useState('')
    const [generatorCheckDate, setGeneratorCheckDate] = useState('')
    const [generatorCheckInitials, setGeneratorCheckInitials] = useState('')
    const [monthlyComments, setMonthlyComments] = useState('')
    const [monthlySaved, setMonthlySaved] = useState(false)
    const [monthlyLocked, setMonthlyLocked] = useState(false)

    // View toggle
    const [viewMode, setViewMode] = useState('day')

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
        setAmmoniaRange('')
        setAlarmCheckDate('')
        setAlarmCheckInitials('')
        setGeneratorCheckDate('')
        setGeneratorCheckInitials('')
        setMonthlyComments('')
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
                const monthFirstDate = monthStr + '-01'
                const { data: audit } = await supabase.from('monthly_audits').select('id')
                    .eq('farm_id', farm.id).eq('month_year', monthFirstDate).maybeSingle()
                if (!audit || cancelled) return
                const { data: wr } = await supabase.from('welfare_records')
                    .select('id, monthly_comments')
                    .eq('barn_id', selectedBarn.id).eq('audit_id', audit.id).maybeSingle()
                if (!wr || cancelled) return
                const [{ data: ammonia }, { data: alarmGen }] = await Promise.all([
                    supabase.from('welfare_ammonia_tests').select('ppm_range')
                        .eq('welfare_id', wr.id).eq('test_date', monthFirstDate).maybeSingle(),
                    supabase.from('welfare_weekly_inspections')
                        .select('alarm_check_date, alarm_check_initials, generator_check_date, generator_check_initials')
                        .eq('welfare_id', wr.id).eq('inspection_date', monthFirstDate).maybeSingle(),
                ])
                if (cancelled) return
                setMonthlyComments(wr.monthly_comments ?? '')
                setAmmoniaRange(ammonia?.ppm_range ?? '')
                setAlarmCheckDate(alarmGen?.alarm_check_date ?? '')
                setAlarmCheckInitials(alarmGen?.alarm_check_initials ?? '')
                setGeneratorCheckDate(alarmGen?.generator_check_date ?? '')
                setGeneratorCheckInitials(alarmGen?.generator_check_initials ?? '')
                if (ammonia || alarmGen || wr.monthly_comments) {
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

                const { data: wr } = await supabase
                    .from('welfare_records').select('id')
                    .eq('barn_id', selectedBarn.id).eq('audit_id', audit.id).maybeSingle()

                if (!wr || cancelled) {
                    if (!cancelled) {
                        setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_DAY } }))
                        setLockedDays(p => ({ ...p, [selectedDay]: false }))
                    }
                    return
                }

                const [{ data: daily }, { data: weekly }] = await Promise.all([
                    supabase.from('welfare_daily_checks').select('*')
                        .eq('welfare_id', wr.id).eq('record_date', recDate).maybeSingle(),
                    supabase.from('welfare_weekly_inspections').select('*')
                        .eq('welfare_id', wr.id).eq('inspection_date', recDate).maybeSingle(),
                ])

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
                        barnTempHi: daily.barn_temp_hi?.toString() ?? '',
                        barnTempLo: daily.barn_temp_lo?.toString() ?? '',
                        exteriorTemp: daily.exterior_temp?.toString() ?? '',
                        floorsChecked: !!daily.floor_sanitation_code,
                        wallsFansCeilingChecked: !!daily.walls_sanitation_code,
                        manureChecked: !!daily.manure_sanitation_code,
                        beddingUsed: !!daily.bedding_notes,
                        chemicalsUsed: !!daily.chemicals_notes,
                        routineHenEquip1stInitial: daily.hen_inspection_am ?? '',
                        routineHenEquip1stDaily: '',
                        routineHenEquip2ndInitial: daily.hen_inspection_pm ?? '',
                        routineHenEquip2ndDaily: '',
                        overallAppearance: !!weekly?.check_overall_appearance,
                        generalSound: !!weekly?.check_general_sound,
                        abnormalBehavior: !!weekly?.check_abnormal_behavior,
                        signsOfDisease: !!weekly?.check_disease_illness,
                        injuredBirds: !!weekly?.check_injured_birds,
                        respiratoryProblems: !!weekly?.check_respiratory,
                        pantingHuddling: !!weekly?.check_panting_huddling,
                        lameness: !!weekly?.check_lameness,
                        featherPecking: !!weekly?.check_feather_pecking,
                        trappedBirds: !!weekly?.check_trapped_birds,
                        deadBirds: !!weekly?.check_dead_birds,
                        feedWaterAvailable: !!weekly?.check_feed_water_available,
                        equipmentOperating: !!weekly?.check_equipment_operating,
                        amenitiesCondition: !!weekly?.check_amenities_condition,
                        layFacilityEnvironment: !!weekly?.check_lay_facility,
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
            const { record: welfareRecord } = await getOrCreateWelfareRecord(selectedBarn.id, audit.id)
            const welfareId = welfareRecord.id
            const monthPrefix = monthYear.substring(0, 7)
            const recDate = `${monthPrefix}-${String(selectedDay).padStart(2, '0')}`
            const d = currentDayData

            const { error: dailyError } = await supabase
                .from('welfare_daily_checks')
                .upsert([{
                    welfare_id: welfareId,
                    record_date: recDate,
                    barn_temp_hi: d.barnTempHi ? parseFloat(d.barnTempHi) : null,
                    barn_temp_lo: d.barnTempLo ? parseFloat(d.barnTempLo) : null,
                    exterior_temp: d.exteriorTemp ? parseFloat(d.exteriorTemp) : null,
                    floor_sanitation_code: d.floorsChecked ? 'Y' : null,
                    walls_sanitation_code: d.wallsFansCeilingChecked ? 'Y' : null,
                    manure_sanitation_code: d.manureChecked ? 'Y' : null,
                    bedding_notes: d.beddingUsed ? 'Yes' : null,
                    chemicals_notes: d.chemicalsUsed ? 'Yes' : null,
                    hen_inspection_am: d.routineHenEquip1stInitial || null,
                    hen_inspection_pm: d.routineHenEquip2ndInitial || null,
                }], { onConflict: 'welfare_id,record_date' })
            if (dailyError) throw dailyError

            const { error: weeklyError } = await supabase
                .from('welfare_weekly_inspections')
                .upsert([{
                    welfare_id: welfareId,
                    inspection_date: recDate,
                    check_overall_appearance: d.overallAppearance,
                    check_general_sound: d.generalSound,
                    check_abnormal_behavior: d.abnormalBehavior,
                    check_disease_illness: d.signsOfDisease,
                    check_injured_birds: d.injuredBirds,
                    check_respiratory: d.respiratoryProblems,
                    check_panting_huddling: d.pantingHuddling,
                    check_lameness: d.lameness,
                    check_feather_pecking: d.featherPecking,
                    check_trapped_birds: d.trappedBirds,
                    check_dead_birds: d.deadBirds,
                    check_feed_water_available: d.feedWaterAvailable,
                    check_equipment_operating: d.equipmentOperating,
                    check_amenities_condition: d.amenitiesCondition,
                    check_lay_facility: d.layFacilityEnvironment,
                }], { onConflict: 'welfare_id,inspection_date' })
            if (weeklyError) throw weeklyError

            alert(`✅ Day ${selectedDay} welfare record saved!`)
            setLockedDays(p => ({ ...p, [selectedDay]: true }))
        } catch (err) {
            alert('Error saving: ' + err.message)
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleMonthlySubmit = async () => {
        try {
            if (!selectedBarn?.id) {
                alert('Error: Barn is missing. Please select a barn.')
                return
            }

            const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
            const { record: welfareRecord } = await getOrCreateWelfareRecord(selectedBarn.id, audit.id)
            const welfareId = welfareRecord.id
            const monthFirstDate = monthYear.substring(0, 7) + '-01'

            // Update monthly comments
            const { error: commentError } = await supabase
                .from('welfare_records')
                .update({ monthly_comments: monthlyComments || null })
                .eq('id', welfareId)
            if (commentError) throw commentError

            // Save ammonia test
            if (ammoniaRange) {
                const { error: ammoniaError } = await supabase
                    .from('welfare_ammonia_tests')
                    .upsert([{ welfare_id: welfareId, test_date: monthFirstDate, ppm_range: ammoniaRange }],
                        { onConflict: 'welfare_id,test_date' })
                if (ammoniaError) throw ammoniaError
            }

            // Save alarm/generator checks
            if (alarmCheckDate || alarmCheckInitials || generatorCheckDate || generatorCheckInitials) {
                const alarmGenFields = {
                    alarm_check_date: alarmCheckDate || null,
                    alarm_check_initials: alarmCheckInitials || null,
                    generator_check_date: generatorCheckDate || null,
                    generator_check_initials: generatorCheckInitials || null,
                }
                const { data: existingInspection } = await supabase
                    .from('welfare_weekly_inspections').select('welfare_id')
                    .eq('welfare_id', welfareId).eq('inspection_date', monthFirstDate).maybeSingle()

                if (existingInspection) {
                    const { error } = await supabase.from('welfare_weekly_inspections')
                        .update(alarmGenFields).eq('welfare_id', welfareId).eq('inspection_date', monthFirstDate)
                    if (error) throw error
                } else {
                    const { error } = await supabase.from('welfare_weekly_inspections')
                        .insert([{ welfare_id: welfareId, inspection_date: monthFirstDate, ...alarmGenFields }])
                    if (error) throw error
                }
            }

            setMonthlySaved(true)
            setMonthlyLocked(true)
            alert('✅ Monthly checks saved!')
        } catch (error) {
            alert('Error: ' + error.message)
            console.error(error)
        }
    }

    const handleMarkMonthComplete = async () => {
        if (!window.confirm('Mark Form 08 as complete for ' + monthYear + '? This confirms all records for the month have been entered.')) return
        try {
            const { data: audit, error: findError } = await supabase
                .from('monthly_audits').select('id')
                .eq('farm_id', farm.id).eq('month_year', monthYear).maybeSingle()

            if (findError) throw findError
            if (!audit) {
                alert('No audit record found. Please save records first.')
                return
            }

            const { error } = await supabase
                .from('monthly_audits')
                .update({
                    form_08_completed: true,
                    form_08_completed_date: new Date().toISOString()
                })
                .eq('id', audit.id)

            if (error) throw error
            alert('✅ Form 08 marked as complete for ' + monthYear)
        } catch (err) {
            alert('Error marking complete: ' + err.message)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', background: 'white', borderRadius: '8px' }}>

            {/* FORM HEADER */}
            <div style={{ borderBottom: '3px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', textAlign: 'center', color: '#000' }}>
                    Form 08 – Welfare Records
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
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '25px', borderBottom: '2px solid #666', paddingBottom: '10px' }}>
                        Monthly Checks
                    </h3>

                    <fieldset disabled={monthlyLocked} style={{ border: 'none', padding: 0, margin: 0 }}>
                    {/* Ammonia Range */}
                    <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '6px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>
                            Ammonia Test (Oct–March only)
                        </h4>
                        <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
                            Circle the PPM range at bird height (average of at least 3 locations):
                        </p>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            {['0-5', '5-10', '10-15', '15-20', '20+'].map(range => (
                                <label key={range} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="ammoniaRange"
                                        value={range}
                                        checked={ammoniaRange === range}
                                        onChange={(e) => setAmmoniaRange(e.target.value)}
                                    />
                                    {range} ppm
                                </label>
                            ))}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', color: '#888' }}>
                                <input
                                    type="radio"
                                    name="ammoniaRange"
                                    value=""
                                    checked={ammoniaRange === ''}
                                    onChange={() => setAmmoniaRange('')}
                                />
                                N/A
                            </label>
                        </div>
                    </div>

                    {/* Alarm Check */}
                    <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '6px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Alarm Check</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Date</label>
                                <input type="date" value={alarmCheckDate}
                                    onChange={(e) => setAlarmCheckDate(e.target.value)}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', ...(monthlyLocked && inputLocked) }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Initials</label>
                                <input type="text" maxLength="10" value={alarmCheckInitials}
                                    onChange={(e) => setAlarmCheckInitials(e.target.value)}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', ...(monthlyLocked && inputLocked) }} />
                            </div>
                        </div>
                    </div>

                    {/* Generator Check */}
                    <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '6px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Generator Check</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Date</label>
                                <input type="date" value={generatorCheckDate}
                                    onChange={(e) => setGeneratorCheckDate(e.target.value)}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', ...(monthlyLocked && inputLocked) }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Initials</label>
                                <input type="text" maxLength="10" value={generatorCheckInitials}
                                    onChange={(e) => setGeneratorCheckInitials(e.target.value)}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', ...(monthlyLocked && inputLocked) }} />
                            </div>
                        </div>
                    </div>

                    {/* Comments */}
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Comments / Corrective Actions
                        </label>
                        <textarea value={monthlyComments}
                            onChange={(e) => setMonthlyComments(e.target.value)}
                            rows="4"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'Arial', boxSizing: 'border-box', ...(monthlyLocked && inputLocked) }} />
                    </div>

                    </fieldset>

                    {/* Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        {monthlyLocked ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setMonthlyLocked(false)}
                                    style={{
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
                                <button
                                    type="button"
                                    onClick={handleMarkMonthComplete}
                                    style={{
                                        padding: '12px 40px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        backgroundColor: '#0066cc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}>
                                    ✅ Mark Month Complete
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={handleMonthlySubmit}
                                style={{
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
