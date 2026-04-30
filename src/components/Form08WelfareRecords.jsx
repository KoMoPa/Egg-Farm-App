import { useState } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreateWelfareRecord } from '../utils/farmBarnOps'
import { useFarmContext } from '../contexts/FarmContext'

// DAY VIEW COMPONENT
const INSPECTION_CRITERIA_FIELDS = [
  'overallAppearance', 'generalSound', 'abnormalBehavior', 'signsOfDisease',
  'injuredBirds', 'respiratoryProblems', 'pantingHuddling', 'lameness',
  'featherPecking', 'trappedBirds', 'deadBirds', 'feedWaterAvailable',
  'equipmentOperating', 'amenitiesCondition', 'layFacilityEnvironment',
]

const DayViewForm = ({ day, data, onDayChange, onDayCheckbox, onSelectAllCriteria }) => (
  <div style={{ marginBottom: '30px' }}>
    <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '2px solid #666', paddingBottom: '10px' }}>
      Daily Tracking - Day {day}
    </h3>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Barn Temp HI (°C)</label>
        <input type="number" step="0.1" value={data.barnTempHi}
          onChange={(e) => onDayChange(day, 'barnTempHi', e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Barn Temp LO (°C)</label>
        <input type="number" step="0.1" value={data.barnTempLo}
          onChange={(e) => onDayChange(day, 'barnTempLo', e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Exterior Temp (°C)</label>
        <input type="number" step="0.1" value={data.exteriorTemp}
          onChange={(e) => onDayChange(day, 'exteriorTemp', e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
      </div>
    </div>

    <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Sanitation Checks</h4>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.floorsChecked}
          onChange={() => onDayCheckbox(day, 'floorsChecked')} />
        Floors Checked
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.wallsFansCeilingChecked}
          onChange={() => onDayCheckbox(day, 'wallsFansCeilingChecked')} />
        Walls/Fans/Ceiling Checked
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.manureChecked}
          onChange={() => onDayCheckbox(day, 'manureChecked')} />
        Manure Checked
      </label>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bedding Used</label>
        <select value={data.beddingUsed ? 'true' : 'false'}
          onChange={(e) => onDayChange(day, 'beddingUsed', e.target.value === 'true')}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}>
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Chemicals Used</label>
        <select value={data.chemicalsUsed ? 'true' : 'false'}
          onChange={(e) => onDayChange(day, 'chemicalsUsed', e.target.value === 'true')}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}>
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
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>1st Daily</label>
        <input type="text" maxLength="3" value={data.routineHenEquip1stDaily}
          onChange={(e) => onDayChange(day, 'routineHenEquip1stDaily', e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>2nd Initial</label>
        <input type="text" maxLength="3" value={data.routineHenEquip2ndInitial}
          onChange={(e) => onDayChange(day, 'routineHenEquip2ndInitial', e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>2nd Daily</label>
        <input type="text" maxLength="3" value={data.routineHenEquip2ndDaily}
          onChange={(e) => onDayChange(day, 'routineHenEquip2ndDaily', e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
      <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Inspection Criteria (Check as applicable)</h4>
      <button type="button" onClick={() => onSelectAllCriteria(day)}
        style={{ fontSize: '12px', padding: '4px 10px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Select All
      </button>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.overallAppearance}
          onChange={() => onDayCheckbox(day, 'overallAppearance')} />
        Overall appearance of birds
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.generalSound}
          onChange={() => onDayCheckbox(day, 'generalSound')} />
        General sound of flock
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.abnormalBehavior}
          onChange={() => onDayCheckbox(day, 'abnormalBehavior')} />
        Abnormal Behavior
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.signsOfDisease}
          onChange={() => onDayCheckbox(day, 'signsOfDisease')} />
        Signs of Disease/Illness
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.injuredBirds}
          onChange={() => onDayCheckbox(day, 'injuredBirds')} />
        Injured Birds
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.respiratoryProblems}
          onChange={() => onDayCheckbox(day, 'respiratoryProblems')} />
        Respiratory Problems
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.pantingHuddling}
          onChange={() => onDayCheckbox(day, 'pantingHuddling')} />
        Panting/Huddling
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.lameness}
          onChange={() => onDayCheckbox(day, 'lameness')} />
        Lameness
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.featherPecking}
          onChange={() => onDayCheckbox(day, 'featherPecking')} />
        Signs of Feather Pecking/Cannibalism
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.trappedBirds}
          onChange={() => onDayCheckbox(day, 'trappedBirds')} />
        Trapped Birds
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.deadBirds}
          onChange={() => onDayCheckbox(day, 'deadBirds')} />
        Dead Birds
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.feedWaterAvailable}
          onChange={() => onDayCheckbox(day, 'feedWaterAvailable')} />
        Feed & Water Available
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.equipmentOperating}
          onChange={() => onDayCheckbox(day, 'equipmentOperating')} />
        Equipment Operating
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.amenitiesCondition}
          onChange={() => onDayCheckbox(day, 'amenitiesCondition')} />
        Condition of Amenities/Housing
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={data.layFacilityEnvironment}
          onChange={() => onDayCheckbox(day, 'layFacilityEnvironment')} />
        Lay Facility Environment
      </label>
    </div>
  </div>
)



export default function Form08WelfareRecords() {
  const { farm, selectedBarn, monthYear } = useFarmContext()
  const farmId = farm?.id
  const farmName = farm?.farm_name
  const barnId = selectedBarn?.id
  const barnNumber = selectedBarn?.barn_number
  // Initialize form data for 31 days
  const initializeDayData = () => {
    const days = {}
    for (let i = 1; i <= 31; i++) {
      days[i] = {
        date: i,

        // PAGE 1 - Daily Tracking
        barnTempHi: '',
        barnTempLo: '',
        exteriorTemp: '',
        floorsChecked: false,
        wallsFansCeilingChecked: false,
        manureChecked: false,
        beddingUsed: false,
        chemicalsUsed: false,

        // PAGE 2 - Weekly Inspections
        routineHenEquip1stInitial: '',
        routineHenEquip1stDaily: '',
        routineHenEquip2ndInitial: '',
        routineHenEquip2ndDaily: '',

        // Inspection criteria checkboxes
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
    }
    return days
  }

  const supabase = useSupabase()

  const [dayData, setDayData] = useState(initializeDayData())
  const [recordDate, setRecordDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [saved, setSaved] = useState(false)

  // Monthly checks state
  const [ammoniaRange, setAmmoniaRange] = useState('')
  const [alarmCheckDate, setAlarmCheckDate] = useState('')
  const [alarmCheckInitials, setAlarmCheckInitials] = useState('')
  const [generatorCheckDate, setGeneratorCheckDate] = useState('')
  const [generatorCheckInitials, setGeneratorCheckInitials] = useState('')
  const [monthlyComments, setMonthlyComments] = useState('')
  const [monthlySaved, setMonthlySaved] = useState(false)

  // View toggle: 'day' | 'monthly'
  const [viewMode, setViewMode] = useState('day')

  const handleDayChange = (day, field, value) => {
    setDayData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleDayCheckbox = (day, field) => {
    setDayData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: !prev[day][field]
      }
    }))
  }

  const handleSelectAllCriteria = (day) => {
    const allChecked = INSPECTION_CRITERIA_FIELDS.every(f => dayData[day][f])
    const newValue = !allChecked
    setDayData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        ...Object.fromEntries(INSPECTION_CRITERIA_FIELDS.map(f => [f, newValue]))
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (!barnId) {
        alert('Error: Barn ID is missing. Please select a barn.')
        return
      }

      // Step 0: Get or create monthly_audits record
      let auditId
      const { data: existingAudit } = await supabase
        .from('monthly_audits')
        .select('id')
        .eq('farm_id', farmId)
        .eq('month_year', monthYear)
        .maybeSingle()

      if (existingAudit) {
        auditId = existingAudit.id
      } else {
        const { data: newAudit, error: auditError } = await supabase
          .from('monthly_audits')
          .insert([{ farm_id: farmId, month_year: monthYear }])
          .select('id')
          .single()
        if (auditError) throw auditError
        auditId = newAudit.id
      }

      // Step 1: Get or create welfare_records entry
      let welfareId
      const { data: existingWelfare } = await supabase
        .from('welfare_records')
        .select('id')
        .eq('barn_id', barnId)
        .eq('audit_id', auditId)
        .maybeSingle()

      if (existingWelfare) {
        welfareId = existingWelfare.id
        await supabase
          .from('welfare_records')
          .update({ monthly_comments: monthlyComments || null })
          .eq('id', welfareId)
      } else {
        const { data: newWelfare, error: createError } = await supabase
          .from('welfare_records')
          .insert([{ barn_id: barnId, audit_id: auditId, monthly_comments: monthlyComments || null }])
          .select('id')
          .single()
        if (createError) throw createError
        welfareId = newWelfare.id
      }

      // Compute actual days in this month so we don't save day 31 for April etc.
      const [year, month] = monthYear.split('-').map(Number)
      const daysInMonth = new Date(year, month, 0).getDate()
      const monthPrefix = monthYear.substring(0, 7) // 'YYYY-MM'

      // Step 2: Save daily checks (one row per day that has any data)
      const dailyChecks = Object.entries(dayData)
        .filter(([dayNum]) => parseInt(dayNum) <= daysInMonth)
        .filter(([, day]) => day.barnTempHi || day.barnTempLo || day.exteriorTemp || day.floorsChecked || day.wallsFansCeilingChecked || day.manureChecked || day.routineHenEquip1stInitial || day.routineHenEquip2ndInitial)
        .map(([dayNum, day]) => ({
          welfare_id: welfareId,
          record_date: `${monthPrefix}-${String(dayNum).padStart(2, '0')}`,
          barn_temp_hi: day.barnTempHi ? parseFloat(day.barnTempHi) : null,
          barn_temp_lo: day.barnTempLo ? parseFloat(day.barnTempLo) : null,
          exterior_temp: day.exteriorTemp ? parseFloat(day.exteriorTemp) : null,
          floor_sanitation_code: day.floorsChecked ? 'Y' : null,
          walls_sanitation_code: day.wallsFansCeilingChecked ? 'Y' : null,
          manure_sanitation_code: day.manureChecked ? 'Y' : null,
          bedding_notes: day.beddingUsed || null,
          chemicals_notes: day.chemicalsUsed || null,
          hen_inspection_am: day.routineHenEquip1stInitial || null,
          hen_inspection_pm: day.routineHenEquip2ndInitial || null,
        }))

      if (dailyChecks.length > 0) {
        const { error: dailyError } = await supabase
          .from('welfare_daily_checks')
          .upsert(dailyChecks, { onConflict: 'welfare_id,record_date' })
        if (dailyError) throw dailyError
      }

      // Step 3: Save weekly inspections (one row per day that has any checkbox checked)
      const weeklyInspections = Object.entries(dayData)
        .filter(([dayNum]) => parseInt(dayNum) <= daysInMonth)
        .filter(([, day]) => day.overallAppearance || day.generalSound || day.abnormalBehavior || day.signsOfDisease || day.injuredBirds || day.respiratoryProblems || day.pantingHuddling || day.lameness || day.featherPecking || day.trappedBirds || day.deadBirds || day.feedWaterAvailable || day.equipmentOperating || day.amenitiesCondition || day.layFacilityEnvironment)
        .map(([dayNum, day]) => ({
          welfare_id: welfareId,
          inspection_date: `${monthPrefix}-${String(dayNum).padStart(2, '0')}`,
          check_overall_appearance: day.overallAppearance || false,
          check_general_sound: day.generalSound || false,
          check_abnormal_behavior: day.abnormalBehavior || false,
          check_disease_illness: day.signsOfDisease || false,
          check_injured_birds: day.injuredBirds || false,
          check_respiratory: day.respiratoryProblems || false,
          check_panting_huddling: day.pantingHuddling || false,
          check_lameness: day.lameness || false,
          check_feather_pecking: day.featherPecking || false,
          check_trapped_birds: day.trappedBirds || false,
          check_dead_birds: day.deadBirds || false,
          check_feed_water_available: day.feedWaterAvailable || false,
          check_equipment_operating: day.equipmentOperating || false,
          check_amenities_condition: day.amenitiesCondition || false,
          check_lay_facility: day.layFacilityEnvironment || false,
        }))

      if (weeklyInspections.length > 0) {
        const { error: weeklyError } = await supabase
          .from('welfare_weekly_inspections')
          .upsert(weeklyInspections, { onConflict: 'welfare_id,inspection_date' })
        if (weeklyError) throw weeklyError
      }

      setSaved(true)
      alert('✅ Form 08 records saved successfully!')
    } catch (error) {
      alert('Error: ' + error.message)
      console.error(error)
    }
  }

  const handleMarkMonthComplete = async () => {
    if (!window.confirm('Mark Form 08 as complete for ' + monthYear + '? This confirms all records for the month have been entered.')) return
    try {
      const { data: audit, error: findError } = await supabase
        .from('monthly_audits')
        .select('id')
        .eq('farm_id', farmId)
        .eq('month_year', monthYear)
        .maybeSingle()

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

  const handleMonthlySubmit = async () => {
    try {
      if (!barnId) {
        alert('Error: Barn ID is missing. Please select a barn.')
        return
      }

      // Step 0: Get or create monthly_audits record
      let auditId
      const { data: existingAudit } = await supabase
        .from('monthly_audits')
        .select('id')
        .eq('farm_id', farmId)
        .eq('month_year', monthYear)
        .maybeSingle()

      if (existingAudit) {
        auditId = existingAudit.id
      } else {
        const { data: newAudit, error: auditError } = await supabase
          .from('monthly_audits')
          .insert([{ farm_id: farmId, month_year: monthYear }])
          .select('id')
          .single()
        if (auditError) throw auditError
        auditId = newAudit.id
      }

      // Step 1: Get or create welfare_records + save monthly comments
      let welfareId
      const { data: existingWelfare } = await supabase
        .from('welfare_records')
        .select('id')
        .eq('barn_id', barnId)
        .eq('audit_id', auditId)
        .maybeSingle()

      if (existingWelfare) {
        welfareId = existingWelfare.id
        await supabase
          .from('welfare_records')
          .update({ monthly_comments: monthlyComments || null })
          .eq('id', welfareId)
      } else {
        const { data: newWelfare, error: createError } = await supabase
          .from('welfare_records')
          .insert([{ barn_id: barnId, audit_id: auditId, monthly_comments: monthlyComments || null }])
          .select('id')
          .single()
        if (createError) throw createError
        welfareId = newWelfare.id
      }

      const monthFirstDate = monthYear.substring(0, 7) + '-01'

      // Step 2: Save ammonia test (upsert keyed on welfare_id + test_date)
      if (ammoniaRange) {
        const { error: ammoniaError } = await supabase
          .from('welfare_ammonia_tests')
          .upsert([{ welfare_id: welfareId, test_date: monthFirstDate, ppm_range: ammoniaRange }],
            { onConflict: 'welfare_id,test_date' })
        if (ammoniaError) throw ammoniaError
      }

      // Step 3: Save alarm/generator checks — update existing row or insert new
      if (alarmCheckDate || alarmCheckInitials || generatorCheckDate || generatorCheckInitials) {
        const alarmGenFields = {
          alarm_check_date: alarmCheckDate || null,
          alarm_check_initials: alarmCheckInitials || null,
          generator_check_date: generatorCheckDate || null,
          generator_check_initials: generatorCheckInitials || null,
        }
        const { data: existingInspection } = await supabase
          .from('welfare_weekly_inspections')
          .select('welfare_id, inspection_date')
          .eq('welfare_id', welfareId)
          .eq('inspection_date', monthFirstDate)
          .maybeSingle()

        if (existingInspection) {
          const { error } = await supabase
            .from('welfare_weekly_inspections')
            .update(alarmGenFields)
            .eq('welfare_id', welfareId)
            .eq('inspection_date', monthFirstDate)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('welfare_weekly_inspections')
            .insert([{ welfare_id: welfareId, inspection_date: monthFirstDate, ...alarmGenFields }])
          if (error) throw error
        }
      }

      setMonthlySaved(true)
      alert('✅ Monthly checks saved!')
    } catch (error) {
      alert('Error: ' + error.message)
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', background: 'white', borderRadius: '8px' }}>

      {/* FORM HEADER */}
      <div style={{ borderBottom: '3px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', textAlign: 'center', color: '#000' }}>
          Form 08 - Welfare Records
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', fontSize: '16px', marginBottom: '20px' }}>
          <div><strong>Farm Name:</strong> {farmName}</div>
          <div><strong>Barn #:</strong> {barnNumber}</div>
          <div><strong>Month/Year:</strong> {monthYear}</div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date</label>
            <input type="date" value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
          </div>
        </div>

        {/* VIEW TOGGLE */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setViewMode('day')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: viewMode === 'day' ? '#0066cc' : '#ddd',
              color: viewMode === 'day' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Day View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('monthly')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: viewMode === 'monthly' ? '#0066cc' : '#ddd',
              color: viewMode === 'monthly' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Monthly Checks
          </button>
        </div>
      </div>

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div>
          <DayViewForm
            day={parseInt(recordDate.split('-')[2])}
            data={dayData[parseInt(recordDate.split('-')[2])]}
            onDayChange={handleDayChange}
            onDayCheckbox={handleDayCheckbox}
            onSelectAllCriteria={handleSelectAllCriteria} />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
            <button type="submit" style={{
              padding: '12px 40px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Save Daily Record
            </button>
          </div>
        </div>
      )}

      {/* MONTHLY CHECKS */}
      {viewMode === 'monthly' && (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '25px', borderBottom: '2px solid #666', paddingBottom: '10px' }}>
            Monthly Checks
          </h3>

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
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Initials</label>
                <input type="text" maxLength="10" value={alarmCheckInitials}
                  onChange={(e) => setAlarmCheckInitials(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
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
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Initials</label>
                <input type="text" maxLength="10" value={generatorCheckInitials}
                  onChange={(e) => setGeneratorCheckInitials(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
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
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'Arial', boxSizing: 'border-box' }} />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
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
              Save Monthly Checks
            </button>
            {monthlySaved && (
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
                Mark Month Complete
              </button>
            )}
          </div>
        </div>
      )}
    </form>
  )
}
