import { useState } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreateWelfareRecord } from '../utils/farmBarnOps'
import { useFarmContext } from '../contexts/FarmContext'

// DAY VIEW COMPONENT
const DayViewForm = ({ day, data, onDayChange, onDayCheckbox }) => (
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

    <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Inspection Criteria (Check as applicable)</h4>
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

// WEEK VIEW TABLE
const WeekViewTable = ({ startDay, dayData, onDayChange, onDayCheckbox }) => {
  const endDay = Math.min(startDay + 6, 31)
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #333', fontSize: '12px' }}>
        <thead>
          <tr style={{ backgroundColor: '#e8e8e8' }}>
            <th style={{ border: '1px solid #333', padding: '6px' }}>Day</th>
            <th style={{ border: '1px solid #333', padding: '6px' }}>Barn HI</th>
            <th style={{ border: '1px solid #333', padding: '6px' }}>Barn LO</th>
            <th style={{ border: '1px solid #333', padding: '6px' }}>Ext Temp</th>
            <th style={{ border: '1px solid #333', padding: '6px' }}>Floors</th>
            <th style={{ border: '1px solid #333', padding: '6px' }}>Walls</th>
            <th style={{ border: '1px solid #333', padding: '6px' }}>Manure</th>
            <th style={{ border: '1px solid #333', padding: '6px' }}>Bedding</th>
            <th style={{ border: '1px solid #333', padding: '6px' }}>Chemicals</th>
            <th style={{ border: '1px solid #333', padding: '6px' }}>Ammonia</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(endDay - startDay + 1)].map((_, i) => {
            const day = startDay + i
            const data = dayData[day]
            return (
              <tr key={day}>
                <td style={{ border: '1px solid #333', padding: '4px', fontWeight: 'bold' }}>{day}</td>
                <td style={{ border: '1px solid #333', padding: '2px' }}>
                  <input type="number" step="0.1" value={data.barnTempHi}
                    onChange={(e) => onDayChange(day, 'barnTempHi', e.target.value)}
                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
                </td>
                <td style={{ border: '1px solid #333', padding: '2px' }}>
                  <input type="number" step="0.1" value={data.barnTempLo}
                    onChange={(e) => onDayChange(day, 'barnTempLo', e.target.value)}
                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
                </td>
                <td style={{ border: '1px solid #333', padding: '2px' }}>
                  <input type="number" step="0.1" value={data.exteriorTemp}
                    onChange={(e) => onDayChange(day, 'exteriorTemp', e.target.value)}
                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
                </td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>
                  <input type="checkbox" checked={data.floorsChecked}
                    onChange={() => onDayCheckbox(day, 'floorsChecked')} />
                </td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>
                  <input type="checkbox" checked={data.wallsFansCeilingChecked}
                    onChange={() => onDayCheckbox(day, 'wallsFansCeilingChecked')} />
                </td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>
                  <input type="checkbox" checked={data.manureChecked}
                    onChange={() => onDayCheckbox(day, 'manureChecked')} />
                </td>
                <td style={{ border: '1px solid #333', padding: '2px' }}>
                  <input type="text" value={data.beddingUsed}
                    onChange={(e) => onDayChange(day, 'beddingUsed', e.target.value)}
                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
                </td>
                <td style={{ border: '1px solid #333', padding: '2px' }}>
                  <input type="text" value={data.chemicalsUsed}
                    onChange={(e) => onDayChange(day, 'chemicalsUsed', e.target.value)}
                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// MONTH VIEW TABLE
const MonthViewTable = ({ dayData, onDayChange, onDayCheckbox }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #333', fontSize: '11px' }}>
      <thead>
        <tr style={{ backgroundColor: '#e8e8e8' }}>
          <th style={{ border: '1px solid #333', padding: '6px' }}>Day</th>
          <th style={{ border: '1px solid #333', padding: '6px' }}>Barn HI</th>
          <th style={{ border: '1px solid #333', padding: '6px' }}>Barn LO</th>
          <th style={{ border: '1px solid #333', padding: '6px' }}>Ext</th>
          <th style={{ border: '1px solid #333', padding: '6px' }}>Floors</th>
          <th style={{ border: '1px solid #333', padding: '6px' }}>Walls</th>
          <th style={{ border: '1px solid #333', padding: '6px' }}>Manure</th>
          <th style={{ border: '1px solid #333', padding: '6px' }}>Bedding</th>
          <th style={{ border: '1px solid #333', padding: '6px' }}>Chemicals</th>
        </tr>
      </thead>
      <tbody>
        {[...Array(31)].map((_, i) => {
          const day = i + 1
          const data = dayData[day]
          return (
            <tr key={day}>
              <td style={{ border: '1px solid #333', padding: '4px', fontWeight: 'bold' }}>{day}</td>
              <td style={{ border: '1px solid #333', padding: '2px' }}>
                <input type="number" step="0.1" value={data.barnTempHi}
                  onChange={(e) => onDayChange(day, 'barnTempHi', e.target.value)}
                  style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
              </td>
              <td style={{ border: '1px solid #333', padding: '2px' }}>
                <input type="number" step="0.1" value={data.barnTempLo}
                  onChange={(e) => onDayChange(day, 'barnTempLo', e.target.value)}
                  style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
              </td>
              <td style={{ border: '1px solid #333', padding: '2px' }}>
                <input type="number" step="0.1" value={data.exteriorTemp}
                  onChange={(e) => onDayChange(day, 'exteriorTemp', e.target.value)}
                  style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
              </td>
              <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>
                <input type="checkbox" checked={data.floorsChecked}
                  onChange={() => onDayCheckbox(day, 'floorsChecked')} />
              </td>
              <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>
                <input type="checkbox" checked={data.wallsFansCeilingChecked}
                  onChange={() => onDayCheckbox(day, 'wallsFansCeilingChecked')} />
              </td>
              <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>
                <input type="checkbox" checked={data.manureChecked}
                  onChange={() => onDayCheckbox(day, 'manureChecked')} />
              </td>
              <td style={{ border: '1px solid #333', padding: '2px' }}>
                <input type="text" value={data.beddingUsed}
                  onChange={(e) => onDayChange(day, 'beddingUsed', e.target.value)}
                  style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
              </td>
              <td style={{ border: '1px solid #333', padding: '2px' }}>
                <input type="text" value={data.chemicalsUsed}
                  onChange={(e) => onDayChange(day, 'chemicalsUsed', e.target.value)}
                  style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
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
  const [comments, setComments] = useState('')
  const [recordDate, setRecordDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [saved, setSaved] = useState(false)

  // View toggle: 'day', 'week', 'month'
  const [viewMode, setViewMode] = useState('day')
  const [selectedDay, setSelectedDay] = useState(1)

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
          .update({ monthly_comments: comments })
          .eq('id', welfareId)
      } else {
        const { data: newWelfare, error: createError } = await supabase
          .from('welfare_records')
          .insert([{ barn_id: barnId, audit_id: auditId, monthly_comments: comments }])
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
        .filter(([, day]) => day.barnTempHi || day.barnTempLo || day.exteriorTemp || day.floorsChecked || day.wallsFansCeilingChecked || day.manureChecked)
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
        .filter(([, day]) => day.overallAppearance || day.generalSound || day.abnormalBehavior || day.signsOfDisease || day.injuredBirds || day.trappedBirds || day.deadBirds || day.feedWaterAvailable || day.equipmentOperating || day.amenitiesCondition || day.layFacilityEnvironment)
        .map(([dayNum, day]) => ({
          welfare_id: welfareId,
          inspection_date: `${monthPrefix}-${String(dayNum).padStart(2, '0')}`,
          check_overall_appearance: day.overallAppearance || false,
          check_general_sound: day.generalSound || false,
          check_abnormal_behavior: day.abnormalBehavior || false,
          check_disease_illness: day.signsOfDisease || false,
          check_injured_birds: day.injuredBirds || false,
          check_trapped_birds: day.trappedBirds || false,
          check_dead_birds: day.deadBirds || false,
          check_feed_water_available: day.feedWaterAvailable || false,
          check_equipment_operating: day.equipmentOperating || false,
          check_amenities_condition: day.amenitiesCondition || false,
          check_lay_facility: day.layFacilityEnvironment || false,
          weekly_initials: day.routineHenEquip1stInitial || null,
          comments: comments || null,
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
            onClick={() => setViewMode('month')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: viewMode === 'month' ? '#0066cc' : '#ddd',
              color: viewMode === 'month' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Month View
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
            onDayCheckbox={handleDayCheckbox} />
        </div>
      )}

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <MonthViewTable
          dayData={dayData}
          onDayChange={handleDayChange}
          onDayCheckbox={handleDayCheckbox} />
      )}

      {/* PAGE 2: FORM-LEVEL DATA */}
      <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '2px solid #666' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '30px', textAlign: 'center' }}>Form-Level Data</h3>

        <div style={{ marginBottom: '30px', maxWidth: '600px', margin: '0 auto' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Comments</label>
          <textarea value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows="4"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'Arial' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
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
            Save Form 08 - Welfare Records
          </button>
          {saved && (
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
    </form>
  )
}
