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

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
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
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ammonia Level</label>
        <select value={data.ammoniaLevel}
          onChange={(e) => onDayChange(day, 'ammoniaLevel', e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}>
          <option value="">Select...</option>
          <option value="0-5">0-5</option>
          <option value="5-10">5-10</option>
          <option value="10-15">10-15</option>
          <option value="15-20">15-20</option>
          <option value="20+">20+</option>
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
                <td style={{ border: '1px solid #333', padding: '2px' }}>
                  <select value={data.ammoniaLevel}
                    onChange={(e) => onDayChange(day, 'ammoniaLevel', e.target.value)}
                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '11px' }}>
                    <option value="">--</option>
                    <option value="0-5">0-5</option>
                    <option value="5-10">5-10</option>
                    <option value="10-15">10-15</option>
                    <option value="15-20">15-20</option>
                    <option value="20+">20+</option>
                  </select>
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
          <th style={{ border: '1px solid #333', padding: '6px' }}>Ammonia</th>
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
              <td style={{ border: '1px solid #333', padding: '2px' }}>
                <select value={data.ammoniaLevel}
                  onChange={(e) => onDayChange(day, 'ammoniaLevel', e.target.value)}
                  style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '10px' }}>
                  <option value="">--</option>
                  <option value="0-5">0-5</option>
                  <option value="5-10">5-10</option>
                  <option value="10-15">10-15</option>
                  <option value="15-20">15-20</option>
                  <option value="20+">20+</option>
                </select>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)

export default function Form08WelfareRecords() {
  const supabase = useSupabase()
  const { farm, selectedBarn, monthYear } = useFarmContext()
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
        ammoniaLevel: '', // 0-5, 5-10, 10-15, 15-20, 20+

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

  const [dayData, setDayData] = useState(initializeDayData())
  const [commentsPage1, setCommentsPage1] = useState('')
  const [commentsPage2, setCommentsPage2] = useState('')
  const [recordDate, setRecordDate] = useState(
    new Date().toISOString().split('T')[0]
  )

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
      // Step 1: Get or create monthly audit record
      const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
      const auditId = audit.id

      // Step 2: Get or create welfare records parent
      const { record: welfareRecord } = await getOrCreateWelfareRecord(selectedBarn.id, auditId)
      const welfareId = welfareRecord.id

      // Step 3: Insert daily checks for each day with data
      const dailyChecksData = Object.entries(dayData)
        .filter(([, day]) => day.barnTempHi || day.barnTempLo || day.exteriorTemp || day.floorsChecked || day.wallsFansCeilingChecked || day.manureChecked)
        .map(([dayNum, day]) => {
          // Create record_date from dayNum
          const dateObj = new Date(monthYear)
          dateObj.setDate(parseInt(dayNum))
          const recordDateForDay = dateObj.toISOString().split('T')[0]

          // Map sanitation codes: B=blow, C=cleanout, S=sweep, W=wash
          let floorSanitationCode = null
          let wallsSanitationCode = null
          let manureSanitationCode = null
          
          if (day.floorsChecked) floorSanitationCode = 'B'
          if (day.wallsFansCeilingChecked) wallsSanitationCode = 'B'
          if (day.manureChecked) manureSanitationCode = 'B'

          return {
            welfare_id: welfareId,
            record_date: recordDateForDay,
            barn_temp_hi: parseFloat(day.barnTempHi) || null,
            barn_temp_lo: parseFloat(day.barnTempLo) || null,
            exterior_temp: parseFloat(day.exteriorTemp) || null,
            floor_sanitation_code: floorSanitationCode,
            walls_sanitation_code: wallsSanitationCode,
            manure_sanitation_code: manureSanitationCode,
            bedding_notes: day.beddingUsed ? 'Used' : null,
            chemicals_notes: day.chemicalsUsed ? 'Used' : null
          }
        })

      // Insert daily checks
      if (dailyChecksData.length > 0) {
        const { error: dailyError } = await supabase
          .from('welfare_daily_checks')
          .upsert(dailyChecksData, { onConflict: 'welfare_id, record_date' })

        if (dailyError) throw dailyError
      }

      // Step 4: Insert weekly inspections for each day with inspection data
      const weeklyInspectionsData = Object.entries(dayData)
        .filter(([, day]) => day.routineHenEquip1stInitial || day.routineHenEquip1stDaily || day.routineHenEquip2ndInitial || day.routineHenEquip2ndDaily || 
                             day.overallAppearance || day.generalSound || day.abnormalBehavior || day.signsOfDisease)
        .map(([dayNum, day]) => {
          const dateObj = new Date(monthYear)
          dateObj.setDate(parseInt(dayNum))
          const recordDateForDay = dateObj.toISOString().split('T')[0]

          return {
            welfare_id: welfareId,
            inspection_date: recordDateForDay,
            check_overall_appearance: day.overallAppearance,
            check_general_sound: day.generalSound,
            check_abnormal_behavior: day.abnormalBehavior,
            check_disease_illness: day.signsOfDisease,
            check_injured_birds: day.injuredBirds,
            check_respiratory: false,
            check_panting_huddling: false,
            check_lameness: false,
            check_feather_pecking: false,
            check_trapped_birds: day.trappedBirds,
            check_dead_birds: day.deadBirds,
            check_feed_water_available: day.feedWaterAvailable,
            check_equipment_operating: day.equipmentOperating,
            check_amenities_condition: day.amenitiesCondition,
            check_lay_facility: day.layFacilityEnvironment,
            weekly_initials: day.routineHenEquip1stInitial || null,
            comments: commentsPage1 || null
          }
        })

      // Insert weekly inspections
      if (weeklyInspectionsData.length > 0) {
        const { error: weeklyError } = await supabase
          .from('welfare_weekly_inspections')
          .upsert(weeklyInspectionsData, { onConflict: 'welfare_id, inspection_date' })

        if (weeklyError) throw weeklyError
      }

      // Step 5: Handle ammonia tests if ammonia data was recorded
      const ammoniaData = Object.entries(dayData)
        .filter(([, day]) => day.ammoniaLevel)
        .map(([dayNum, day]) => {
          const dateObj = new Date(monthYear)
          dateObj.setDate(parseInt(dayNum))
          const recordDateForDay = dateObj.toISOString().split('T')[0]

          return {
            welfare_id: welfareId,
            test_date: recordDateForDay,
            ppm_range: day.ammoniaLevel,
            distilled_water_used: false,
            initials: null,
            notes: null
          }
        })

      // Insert ammonia tests
      if (ammoniaData.length > 0) {
        const { error: ammoniaError } = await supabase
          .from('welfare_ammonia_tests')
          .upsert(ammoniaData, { onConflict: 'welfare_id, test_date' })

        if (ammoniaError) throw ammoniaError
      }

      // Step 6: Update welfare records with comments
      const { error: updateError } = await supabase
        .from('welfare_records')
        .update({ monthly_comments: commentsPage1 || null })
        .eq('id', welfareId)

      if (updateError) throw updateError

      // Step 7: Mark form as completed
      const { error: auditUpdateError } = await supabase
        .from('monthly_audits')
        .update({
          form_08_completed: true,
          form_08_completed_date: new Date().toISOString()
        })
        .eq('id', auditId)

      if (auditUpdateError) throw auditUpdateError

      alert('✅ Form 08 records saved successfully!')
    } catch (error) {
      alert('Error saving: ' + error.message)
      console.error('Error:', error)
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
          <div><strong>Farm Name:</strong> {farm?.farm_name}</div>
          <div><strong>Barn:</strong> {selectedBarn?.barn_name}</div>
          <div><strong>Month/Year:</strong> {monthYear.substring(0, 7)}</div>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Page 1 Comments</label>
            <textarea value={commentsPage1}
              onChange={(e) => setCommentsPage1(e.target.value)}
              rows="4"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'Arial' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Page 2 Comments</label>
            <textarea value={commentsPage2}
              onChange={(e) => setCommentsPage2(e.target.value)}
              rows="4"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'Arial' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
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
        </div>
      </div>
    </form>
  )
}
