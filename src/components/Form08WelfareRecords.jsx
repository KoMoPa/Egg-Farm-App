import { useState } from 'react'
import { supabase } from '../supabaseClient'

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

export default function Form08WelfareRecords({ auditId, farmName }) {
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

  const [dayData, setDayData] = useState(initializeDayData())
  const [comments, setComments] = useState('')
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
      // Validate we have a valid audit ID
      if (!auditId) {
        alert('Error: Could not find audit record for this farm and month. Please reload the page.')
        console.error('auditId is not set')
        return
      }

      // Step 1: Verify audit record exists
      const { data: existingAudit, error: auditCheckError } = await supabase
        .from('monthly_audits')
        .select('id')
        .eq('id', auditId)
        .single()

      if (auditCheckError || !existingAudit) {
        alert('Error: Could not find audit record. Please reload and try again.')
        return
      }

      // Step 2: Prepare consolidated daily records (combines Page 1 + Page 2 data)
      const consolidatedRecords = Object.entries(dayData)
        .filter(([, day]) => day.barnTempHi || day.barnTempLo || day.exteriorTemp || day.floorsChecked || day.wallsFansCeilingChecked || day.manureChecked || day.routineHenEquip1stInitial || day.routineHenEquip1stDaily || day.routineHenEquip2ndInitial || day.routineHenEquip2ndDaily)
        .map(([dayNum, day]) => ({
          audit_id: auditId,
          record_date: recordDate,
          barn_temp_hi: day.barnTempHi ? parseFloat(day.barnTempHi) : null,
          barn_temp_lo: day.barnTempLo ? parseFloat(day.barnTempLo) : null,
          exterior_temp: day.exteriorTemp ? parseFloat(day.exteriorTemp) : null,
          floors_checked: Boolean(day.floorsChecked),
          walls_fans_ceiling_checked: Boolean(day.wallsFansCeilingChecked),
          manure_checked: Boolean(day.manureChecked),
          bedding_used: day.beddingUsed || null,
          chemicals_used: day.chemicalsUsed || null,
          routine_hen_equip_1st_initial: day.routineHenEquip1stInitial || null,
          routine_hen_equip_1st_daily: day.routineHenEquip1stDaily || null,
          routine_hen_equip_2nd_initial: day.routineHenEquip2ndInitial || null,
          routine_hen_equip_2nd_daily: day.routineHenEquip2ndDaily || null,
          overall_appearance: Boolean(day.overallAppearance),
          general_sound: Boolean(day.generalSound),
          abnormal_behavior: Boolean(day.abnormalBehavior),
          signs_of_disease: Boolean(day.signsOfDisease),
          injured_birds: Boolean(day.injuredBirds),
          trapped_birds: Boolean(day.trappedBirds),
          dead_birds: Boolean(day.deadBirds),
          feed_water_available: Boolean(day.feedWaterAvailable),
          equipment_operating: Boolean(day.equipmentOperating),
          amenities_condition: Boolean(day.amenitiesCondition),
          lay_facility_environment: Boolean(day.layFacilityEnvironment),
        }))

      // Step 3: Delete old records for this date then insert new ones
      let dailyError = null
      if (consolidatedRecords.length > 0) {
        // Delete existing records for this date to avoid duplicates
        await supabase
          .from('form_08_daily_records')
          .delete()
          .eq('audit_id', auditId)
          .eq('record_date', recordDate)

        // Insert new records
        const { error: insertError } = await supabase
          .from('form_08_daily_records')
          .insert(consolidatedRecords)
        dailyError = insertError
      }

      // Step 4: Save comments (if any) to form_08_comments table
      let commentsError = null
      if (comments && comments.trim()) {
        const { error: commentInsertError } = await supabase
          .from('form_08_comments')
          .insert([{
            audit_id: auditId,
            comment_date: recordDate,
            comment_text: comments,
          }])
        commentsError = commentInsertError
      }

      // Step 5: Report results
      if (dailyError || commentsError) {
        const errorMsg = dailyError?.message || commentsError?.message || 'Unknown error'
        alert('Error saving: ' + errorMsg)
        console.error('Errors:', { dailyError, commentsError, auditId, recordDate })
      } else if (consolidatedRecords.length === 0) {
        alert('⚠️ No data entered to save. Please fill in at least one field.')
      } else {
        alert('✅ Form 08 records saved for month!')
      }
    } catch (error) {
      alert('Error: ' + error.message)
      console.error(error)
    }
  }

  const handleMarkMonthComplete = async () => {
    try {
      const { error } = await supabase
        .from('monthly_audits')
        .update({
          form_08_completed: true,
          form_08_completed_date: new Date().toISOString()
        })
        .eq('id', auditId)

      if (error) throw error
      alert('✅ Form 08 marked as complete!')
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '16px', marginBottom: '20px' }}>
          <div><strong>Farm Name:</strong> {farmName}</div>
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
          <button type="button" onClick={handleMarkMonthComplete} style={{
            padding: '12px 40px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            ✓ Mark Month Complete
          </button>
        </div>
      </div>
    </form>
  )
}
