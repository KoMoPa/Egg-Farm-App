import { useState, useEffect } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreateProductionRecord } from '../utils/farmBarnOps'
import { useFarmContext } from '../contexts/FarmContext'
import DaySelector from './DaySelector'

const BLANK_FORM = {
    age: '',
    floorEggs1: '',
    floorEggs2: '',
    eggProduction1: '',
    eggProduction2: '',
    eggProductionPercent: '',
    coolerTempHi: '',
    coolerTempLo: '',
    coolerRhHi: '',
    coolerRhLo: '',
    coolerCheckTime: '',
    dirtyTrays: '',
    eggCoolerCleaned: false,
    packRoomCleaned: false,
    tablesPackingEquipCleaned: false,
    correctiveActions: '',
}

const inputLocked = { backgroundColor: '#f5f5f5', color: '#666' }

export default function Form07DailyProduction() {
    const supabase = useSupabase()
    const { farm, selectedBarn, monthYear } = useFarmContext()
    const [viewMode, setViewMode] = useState('day')

    // Monthly Checks state
    const [thermCalDate, setThermCalDate] = useState('')
    const [thermCalMethod, setThermCalMethod] = useState('A')
    const [thermCalPass, setThermCalPass] = useState(true)
    const [thermCalInitials, setThermCalInitials] = useState('')
    const [thermCalNotes, setThermCalNotes] = useState('')
    const [monthlyCorrectiveActions, setMonthlyCorrectiveActions] = useState('')
    const [monthlyComments, setMonthlyComments] = useState('')
    const [monthlySaved, setMonthlySaved] = useState(false)
    const [monthlyLocked, setMonthlyLocked] = useState(false)

    // Day state
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
        setThermCalDate('')
        setThermCalMethod('A')
        setThermCalPass(true)
        setThermCalInitials('')
        setThermCalNotes('')
        setMonthlyCorrectiveActions('')
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
                const { data: audit } = await supabase.from('monthly_audits').select('id')
                    .eq('farm_id', farm.id).eq('month_year', monthStr + '-01').maybeSingle()
                if (!audit || cancelled) return
                const { data: prodRec } = await supabase.from('production_cooler_records')
                    .select('id, monthly_corrective_actions, monthly_comments')
                    .eq('barn_id', selectedBarn.id).eq('audit_id', audit.id).maybeSingle()
                if (!prodRec || cancelled) return
                const { data: tc } = await supabase.from('production_thermometer_calibration')
                    .select('*').eq('production_id', prodRec.id)
                    .order('calibration_date', { ascending: false }).limit(1).maybeSingle()
                if (cancelled) return
                if (tc) {
                    setThermCalDate(tc.calibration_date ?? '')
                    setThermCalMethod(tc.method ?? 'A')
                    setThermCalPass(tc.result_pass ?? true)
                    setThermCalInitials(tc.initials ?? '')
                    setThermCalNotes(tc.notes ?? '')
                }
                setMonthlyCorrectiveActions(prodRec.monthly_corrective_actions ?? '')
                setMonthlyComments(prodRec.monthly_comments ?? '')
                if (tc || prodRec.monthly_corrective_actions || prodRec.monthly_comments) {
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
                        setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_FORM } }))
                        setLockedDays(p => ({ ...p, [selectedDay]: false }))
                    }
                    return
                }

                const { data: prod } = await supabase
                    .from('production_cooler_records').select('id')
                    .eq('barn_id', selectedBarn.id).eq('audit_id', audit.id).maybeSingle()

                if (!prod || cancelled) {
                    if (!cancelled) {
                        setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_FORM } }))
                        setLockedDays(p => ({ ...p, [selectedDay]: false }))
                    }
                    return
                }

                const [
                    { data: floorEggs },
                    { data: eggOutput },
                    { data: coolerTemps },
                    { data: sanitation },
                    { data: flockAge },
                ] = await Promise.all([
                    supabase.from('production_floor_eggs').select('*').eq('production_id', prod.id).eq('record_date', recDate).maybeSingle(),
                    supabase.from('production_egg_output').select('*').eq('production_id', prod.id).eq('record_date', recDate).maybeSingle(),
                    supabase.from('production_cooler_temps').select('*').eq('production_id', prod.id).eq('record_date', recDate).maybeSingle(),
                    supabase.from('production_sanitation').select('*').eq('production_id', prod.id).eq('record_date', recDate).maybeSingle(),
                    supabase.from('production_flock_age').select('*').eq('production_id', prod.id).eq('record_date', recDate).maybeSingle(),
                ])

                if (!floorEggs || cancelled) {
                    if (!cancelled) {
                        setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_FORM } }))
                        setLockedDays(p => ({ ...p, [selectedDay]: false }))
                    }
                    return
                }
                if (cancelled) return

                setDayData(p => ({
                    ...p,
                    [selectedDay]: {
                        age: flockAge?.flock_age_weeks?.toString() ?? '',
                        floorEggs1: floorEggs?.collection_1?.toString() ?? '',
                        floorEggs2: floorEggs?.collection_2?.toString() ?? '',
                        eggProduction1: eggOutput?.egg_production_1?.toString() ?? '',
                        eggProduction2: eggOutput?.egg_production_2?.toString() ?? '',
                        eggProductionPercent: eggOutput?.egg_production_percent?.toString() ?? '',
                        coolerTempHi: coolerTemps?.cooler_temp_hi_celsius?.toString() ?? '',
                        coolerTempLo: coolerTemps?.cooler_temp_lo_celsius?.toString() ?? '',
                        coolerRhHi: coolerTemps?.cooler_rh_hi_percent?.toString() ?? '',
                        coolerRhLo: coolerTemps?.cooler_rh_lo_percent?.toString() ?? '',
                        coolerCheckTime: coolerTemps?.cooler_check_time ?? '',
                        dirtyTrays: sanitation?.dirty_trays_count?.toString() ?? '',
                        eggCoolerCleaned: !!sanitation?.egg_cooler_sanitation_code,
                        packRoomCleaned: !!sanitation?.pack_room_sanitation_code,
                        tablesPackingEquipCleaned: !!sanitation?.equip_sanitation_code,
                        correctiveActions: sanitation?.corrective_actions ?? '',
                    },
                }))
                setLockedDays(p => ({ ...p, [selectedDay]: true }))
            } catch (e) {
                if (!cancelled) {
                    console.error('Error loading day:', e)
                    setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_FORM } }))
                    setLockedDays(p => ({ ...p, [selectedDay]: false }))
                }
            } finally {
                if (!cancelled) setLoadingDay(false)
            }
        }

        load()
        return () => { cancelled = true }
    }, [selectedDay, selectedBarn?.id, monthYear])

    const currentDayData = dayData[selectedDay] ?? { ...BLANK_FORM }
    const isLocked = lockedDays[selectedDay] === true

    const setField = (field, value) => setDayData(p => ({
        ...p,
        [selectedDay]: { ...(p[selectedDay] ?? BLANK_FORM), [field]: value }
    }))

    // Auto-calculate totals
    const floorEggsTotal =
        (parseInt(currentDayData.floorEggs1) || 0) +
        (parseInt(currentDayData.floorEggs2) || 0)

    const eggProductionDaily =
        (parseInt(currentDayData.eggProduction1) || 0) +
        (parseInt(currentDayData.eggProduction2) || 0)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        const toNumber = (val) => {
            if (!val) return null
            const num = parseFloat(val)
            return isNaN(num) ? null : num
        }
        try {
            const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
            const { record: productionRecord } = await getOrCreateProductionRecord(selectedBarn.id, audit.id)
            const productionId = productionRecord.id
            const monthPrefix = monthYear.substring(0, 7)
            const recDate = `${monthPrefix}-${String(selectedDay).padStart(2, '0')}`
            const d = currentDayData

            const { error: floorEggsError } = await supabase
                .from('production_floor_eggs')
                .upsert([{
                    production_id: productionId,
                    record_date: recDate,
                    collection_1: parseInt(d.floorEggs1) || null,
                    collection_2: parseInt(d.floorEggs2) || null,
                    floor_eggs_total: floorEggsTotal
                }], { onConflict: 'production_id,record_date' })
            if (floorEggsError) throw floorEggsError

            const { error: eggOutputError } = await supabase
                .from('production_egg_output')
                .upsert([{
                    production_id: productionId,
                    record_date: recDate,
                    egg_production_1: parseInt(d.eggProduction1) || null,
                    egg_production_2: parseInt(d.eggProduction2) || null,
                    egg_production_daily: eggProductionDaily,
                    egg_production_percent: toNumber(d.eggProductionPercent)
                }], { onConflict: 'production_id,record_date' })
            if (eggOutputError) throw eggOutputError

            const { error: coolerTempsError } = await supabase
                .from('production_cooler_temps')
                .upsert([{
                    production_id: productionId,
                    record_date: recDate,
                    cooler_temp_hi_celsius: toNumber(d.coolerTempHi),
                    cooler_temp_lo_celsius: toNumber(d.coolerTempLo),
                    cooler_rh_hi_percent: toNumber(d.coolerRhHi),
                    cooler_rh_lo_percent: toNumber(d.coolerRhLo),
                    cooler_check_time: d.coolerCheckTime || null
                }], { onConflict: 'production_id,record_date' })
            if (coolerTempsError) throw coolerTempsError

            const { error: sanitationError } = await supabase
                .from('production_sanitation')
                .upsert([{
                    production_id: productionId,
                    record_date: recDate,
                    dirty_trays_count: parseInt(d.dirtyTrays) || 0,
                    egg_cooler_sanitation_code: d.eggCoolerCleaned ? 'B' : null,
                    pack_room_sanitation_code: d.packRoomCleaned ? 'W' : null,
                    equip_sanitation_code: d.tablesPackingEquipCleaned ? 'S' : null,
                    corrective_actions: d.correctiveActions || null
                }], { onConflict: 'production_id,record_date' })
            if (sanitationError) throw sanitationError

            if (d.age) {
                const { error: flockAgeError } = await supabase
                    .from('production_flock_age')
                    .upsert([{
                        production_id: productionId,
                        record_date: recDate,
                        flock_age_weeks: parseInt(d.age)
                    }], { onConflict: 'production_id,record_date' })
                if (flockAgeError) throw flockAgeError
            }

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
            const { record: productionRecord } = await getOrCreateProductionRecord(selectedBarn.id, audit.id)
            const productionId = productionRecord.id

            if (thermCalDate) {
                const { error: thermError } = await supabase
                    .from('production_thermometer_calibration')
                    .insert([{
                        production_id: productionId,
                        calibration_date: thermCalDate,
                        method: thermCalMethod,
                        result_pass: thermCalPass,
                        initials: thermCalInitials || null,
                        notes: thermCalNotes || null
                    }])
                if (thermError) throw thermError
            }

            const { error: updateError } = await supabase
                .from('production_cooler_records')
                .update({
                    monthly_corrective_actions: monthlyCorrectiveActions || null,
                    monthly_comments: monthlyComments || null
                })
                .eq('id', productionId)
            if (updateError) throw updateError

            setMonthlySaved(true)
            setMonthlyLocked(true)
            alert('✅ Monthly checks saved!')
        } catch (err) {
            alert('Error saving monthly checks: ' + err.message)
            console.error(err)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', background: 'white', borderRadius: '8px' }}>

            {/* FORM HEADER */}
            <div style={{ borderBottom: '3px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', textAlign: 'center', color: '#000' }}>
                    Form 07 – Egg Production &amp; Cooler Records
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '16px' }}>
                    <div><strong>Farm Name:</strong> {farm?.farm_name}</div>
                    <div><strong>Barn:</strong> {selectedBarn?.barn_name}</div>
                    <div><strong>Month/Year:</strong> {monthYear.substring(0, 7)}</div>
                </div>
            </div>

            {/* TAB TOGGLE */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['day', 'monthly'].map(mode => (
                    <button
                        key={mode}
                        type="button"
                        onClick={() => setViewMode(mode)}
                        style={{
                            padding: '10px 24px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            border: '2px solid #28a745',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: viewMode === mode ? '#28a745' : 'white',
                            color: viewMode === mode ? 'white' : '#28a745'
                        }}
                    >
                        {mode === 'day' ? 'Day View' : 'Monthly Checks'}
                    </button>
                ))}
            </div>

            {/* ============ DAY VIEW ============ */}
            {viewMode === 'day' && (<>

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

                {/* ============ PAGE 1 FIELDS ============ */}

                {/* Age */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Age (weeks)
                    </label>
                    <input
                        type="number"
                        value={currentDayData.age}
                        onChange={(e) => setField('age', e.target.value)}
                        disabled={isLocked}
                        style={{ width: '200px', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                        placeholder="25"
                    />
                </div>

                {/* Floor Eggs */}
                <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #ffc107', paddingBottom: '8px' }}>
                        Floor Eggs
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>#1</label>
                            <input
                                type="number"
                                value={currentDayData.floorEggs1}
                                onChange={(e) => setField('floorEggs1', e.target.value)}
                                disabled={isLocked}
                                style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                                placeholder="150"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>#2</label>
                            <input
                                type="number"
                                value={currentDayData.floorEggs2}
                                onChange={(e) => setField('floorEggs2', e.target.value)}
                                disabled={isLocked}
                                style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                                placeholder="120"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>Total</label>
                            <div style={{ padding: '12px', fontSize: '20px', fontWeight: 'bold', background: '#ffc107', borderRadius: '8px', textAlign: 'center' }}>
                                {floorEggsTotal}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Egg Production */}
                <div style={{ background: '#d4edda', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #28a745', paddingBottom: '8px' }}>
                        Egg Production
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>#1</label>
                            <input
                                type="number"
                                value={currentDayData.eggProduction1}
                                onChange={(e) => setField('eggProduction1', e.target.value)}
                                disabled={isLocked}
                                style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                                placeholder="6000"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>#2</label>
                            <input
                                type="number"
                                value={currentDayData.eggProduction2}
                                onChange={(e) => setField('eggProduction2', e.target.value)}
                                disabled={isLocked}
                                style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                                placeholder="6500"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>Daily</label>
                            <div style={{ padding: '12px', fontSize: '20px', fontWeight: 'bold', background: '#28a745', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
                                {eggProductionDaily}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>% Daily</label>
                            <input
                                type="number"
                                step="0.1"
                                value={currentDayData.eggProductionPercent}
                                onChange={(e) => setField('eggProductionPercent', e.target.value)}
                                disabled={isLocked}
                                style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                                placeholder="92.5"
                            />
                        </div>
                    </div>
                </div>

                {/* Cooler Temperature & Humidity */}
                <div style={{ background: '#d1ecf1', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #0c5460', paddingBottom: '8px' }}>
                        Cooler Temperature &amp; RH%
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>Temp HI (°C)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={currentDayData.coolerTempHi}
                                onChange={(e) => setField('coolerTempHi', e.target.value)}
                                disabled={isLocked}
                                style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                                placeholder="4.5"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>Temp LO (°C)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={currentDayData.coolerTempLo}
                                onChange={(e) => setField('coolerTempLo', e.target.value)}
                                disabled={isLocked}
                                style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                                placeholder="3.8"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>RH% HI</label>
                            <input
                                type="number"
                                step="0.1"
                                value={currentDayData.coolerRhHi}
                                onChange={(e) => setField('coolerRhHi', e.target.value)}
                                disabled={isLocked}
                                style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                                placeholder="75.0"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>RH% LO</label>
                            <input
                                type="number"
                                step="0.1"
                                value={currentDayData.coolerRhLo}
                                onChange={(e) => setField('coolerRhLo', e.target.value)}
                                disabled={isLocked}
                                style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                                placeholder="70.0"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>Time</label>
                            <input
                                type="time"
                                value={currentDayData.coolerCheckTime}
                                onChange={(e) => setField('coolerCheckTime', e.target.value)}
                                disabled={isLocked}
                                style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                            />
                        </div>
                    </div>
                </div>

                {/* PAGE BREAK VISUAL */}
                <div style={{ borderTop: '4px dashed #999', margin: '40px 0', padding: '20px 0', textAlign: 'center', color: '#666', fontSize: '18px', fontWeight: 'bold' }}>
                    ═══ PAGE 2: SANITATION ═══
                </div>

                {/* ============ PAGE 2 FIELDS ============ */}

                {/* Dirty Trays */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Dirty Trays (Daily count)
                    </label>
                    <input
                        type="number"
                        value={currentDayData.dirtyTrays}
                        onChange={(e) => setField('dirtyTrays', e.target.value)}
                        disabled={isLocked}
                        style={{ width: '200px', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px', ...(isLocked && inputLocked) }}
                        placeholder="5"
                    />
                </div>

                {/* Sanitation - As Completed */}
                <div style={{ background: '#e7f3ff', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #0066cc', paddingBottom: '8px' }}>
                        Sanitation - As Completed
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #ddd', cursor: isLocked ? 'default' : 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={currentDayData.eggCoolerCleaned}
                                onChange={(e) => setField('eggCoolerCleaned', e.target.checked)}
                                disabled={isLocked}
                                style={{ width: '24px', height: '24px', marginRight: '12px' }}
                            />
                            <span style={{ fontSize: '18px' }}>Egg Cooler</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #ddd', cursor: isLocked ? 'default' : 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={currentDayData.packRoomCleaned}
                                onChange={(e) => setField('packRoomCleaned', e.target.checked)}
                                disabled={isLocked}
                                style={{ width: '24px', height: '24px', marginRight: '12px' }}
                            />
                            <span style={{ fontSize: '18px' }}>Pack Room</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #ddd', cursor: isLocked ? 'default' : 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={currentDayData.tablesPackingEquipCleaned}
                                onChange={(e) => setField('tablesPackingEquipCleaned', e.target.checked)}
                                disabled={isLocked}
                                style={{ width: '24px', height: '24px', marginRight: '12px' }}
                            />
                            <span style={{ fontSize: '18px' }}>Tables/Packing Equip</span>
                        </label>
                    </div>
                </div>

                {/* Corrective Actions */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Corrective Actions
                    </label>
                    <textarea
                        value={currentDayData.correctiveActions}
                        onChange={(e) => setField('correctiveActions', e.target.value)}
                        disabled={isLocked}
                        style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #ddd', borderRadius: '8px', fontFamily: 'inherit', ...(isLocked && inputLocked) }}
                        rows="4"
                        placeholder="Describe any issues found and corrective actions taken..."
                    />
                </div>

                {/* Submit Button */}
                {!isLocked && (
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            width: '100%',
                            padding: '20px',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            background: saving ? '#aaa' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: saving ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {saving ? 'Saving…' : `💾 Save Day ${selectedDay} Record`}
                    </button>
                )}

            </>)}

            {/* ============ MONTHLY CHECKS TAB ============ */}
            {viewMode === 'monthly' && (
                <div>
                    <fieldset disabled={monthlyLocked} style={{ border: 'none', padding: 0, margin: 0 }}>
                    {/* Thermometer Calibration */}
                    <div style={{ background: '#d1ecf1', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '2px solid #0c5460', paddingBottom: '8px' }}>
                            Thermometer Calibration (twice annually)
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Calibration Date</label>
                                <input type="date" value={thermCalDate}
                                    onChange={e => setThermCalDate(e.target.value)}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontSize: '15px', ...(monthlyLocked && inputLocked) }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Method</label>
                                <select value={thermCalMethod} onChange={e => setThermCalMethod(e.target.value)}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontSize: '15px', ...(monthlyLocked && inputLocked) }}>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Result</label>
                                <select value={thermCalPass ? 'pass' : 'fail'} onChange={e => setThermCalPass(e.target.value === 'pass')}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontSize: '15px', ...(monthlyLocked && inputLocked) }}>
                                    <option value="pass">Pass</option>
                                    <option value="fail">Fail</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Initials</label>
                                <input type="text" value={thermCalInitials}
                                    onChange={e => setThermCalInitials(e.target.value)}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontSize: '15px', ...(monthlyLocked && inputLocked) }}
                                    placeholder="AB" maxLength={20} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Notes</label>
                                <input type="text" value={thermCalNotes}
                                    onChange={e => setThermCalNotes(e.target.value)}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontSize: '15px', ...(monthlyLocked && inputLocked) }}
                                    placeholder="Optional notes" />
                            </div>
                        </div>
                    </div>

                    {/* Monthly Corrective Actions */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                            Corrective Actions (Monthly)
                        </label>
                        <textarea value={monthlyCorrectiveActions}
                            onChange={e => setMonthlyCorrectiveActions(e.target.value)}
                            rows={3}
                            style={{ width: '100%', padding: '12px', fontSize: '15px', border: '2px solid #ddd', borderRadius: '8px', fontFamily: 'inherit', ...(monthlyLocked && inputLocked) }}
                            placeholder="Monthly corrective actions summary..." />
                    </div>

                    {/* Comments */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                            Comments
                        </label>
                        <textarea value={monthlyComments}
                            onChange={e => setMonthlyComments(e.target.value)}
                            rows={3}
                            style={{ width: '100%', padding: '12px', fontSize: '15px', border: '2px solid #ddd', borderRadius: '8px', fontFamily: 'inherit', ...(monthlyLocked && inputLocked) }}
                            placeholder="Monthly comments..." />
                    </div>

                    </fieldset>

                    {monthlyLocked ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setMonthlyLocked(false)}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    background: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                ✏️ Edit Monthly Checks
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
                                        const { error } = await supabase
                                            .from('monthly_audits')
                                            .update({ form_07_completed: true, form_07_completed_date: new Date().toISOString() })
                                            .eq('id', audit.id)
                                        if (error) throw error
                                        alert('✅ Month marked complete!')
                                    } catch (err) {
                                        alert('Error: ' + err.message)
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    marginTop: '12px',
                                    padding: '18px',
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    background: '#155724',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                ✅ Mark Month Complete
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={handleMonthlySubmit}
                            style={{
                                width: '100%',
                                padding: '18px',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                background: '#0c5460',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            💾 Save Monthly Checks
                        </button>
                    )}
                </div>
            )}

        </form>
    )
}
