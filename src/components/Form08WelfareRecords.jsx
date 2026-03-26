import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Form08WelfareRecords({ farmId, farmName, barnNumber, monthYear }) {
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
        beddingUsed: '',
        chemicalsUsed: '',
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
  const [alarmCheckDate, setAlarmCheckDate] = useState('')
  const [alarmCheckInitials, setAlarmCheckInitials] = useState('')
  const [generatorCheckDate, setGeneratorCheckDate] = useState('')
  const [generatorCheckInitials, setGeneratorCheckInitials] = useState('')
  const [commentsPage1, setCommentsPage1] = useState('')
  const [commentsPage2, setCommentsPage2] = useState('')
  const [signatureDate, setSignatureDate] = useState('')
  
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
          <input type="text" value={data.beddingUsed}
            onChange={(e) => onDayChange(day, 'beddingUsed', e.target.value)}
            placeholder="eg. straw"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Chemicals Used</label>
          <input type="text" value={data.chemicalsUsed}
            onChange={(e) => onDayChange(day, 'chemicalsUsed', e.target.value)}
            placeholder="eg. disinfectant"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Step 1: Create or get monthly audit record
      const { data: existingAudit, error: auditCheckError } = await supabase
        .from('monthly_audits')
        .select('id')
        .eq('farm_id', farmId)
        .eq('month_year', monthYear)
        .single()

      let auditId
      if (existingAudit) {
        auditId = existingAudit.id
      } else {
        // Create new audit record
        const { data: newAudit, error: auditCreateError } = await supabase
          .from('monthly_audits')
          .insert([{
            farm_id: farmId,
            month_year: monthYear,
            form_08_completed: true,
            form_08_completed_date: new Date().toISOString(),
            final_signature_date: signatureDate || null,
            final_comments: commentsPage1 || null,
          }])
          .select('id')
          .single()

        if (auditCreateError) throw auditCreateError
        auditId = newAudit.id
      }

      // Step 2: Prepare daily records data (Page 1)
      const dailyRecords = Object.values(dayData).map(day => ({
        farm_id: farmId,
        audit_id: auditId,
        barn_number: barnNumber,
        date: day.date,
        barn_temp_hi: parseFloat(day.barnTempHi) || null,
        barn_temp_lo: parseFloat(day.barnTempLo) || null,
        exterior_temp: parseFloat(day.exteriorTemp) || null,
        floors_checked: day.floorsChecked,
        walls_fans_ceiling_checked: day.wallsFansCeilingChecked,
        manure_checked: day.manureChecked,
        bedding_used: day.beddingUsed || null,
        chemicals_used: day.chemicalsUsed || null,
        ammonia_level: day.ammoniaLevel || null,
      }))

      // Step 3: Prepare equipment inspection records data (Page 2)
      const equipmentRecords = Object.values(dayData).map(day => ({
        farm_id: farmId,
        audit_id: auditId,
        barn_number: barnNumber,
        date: day.date,
        routine_hen_equip_1st_initial: day.routineHenEquip1stInitial || null,
        routine_hen_equip_1st_daily: day.routineHenEquip1stDaily || null,
        routine_hen_equip_2nd_initial: day.routineHenEquip2ndInitial || null,
        routine_hen_equip_2nd_daily: day.routineHenEquip2ndDaily || null,
        overall_appearance: day.overallAppearance,
        general_sound: day.generalSound,
        abnormal_behavior: day.abnormalBehavior,
        signs_of_disease: day.signsOfDisease,
        injured_birds: day.injuredBirds,
        trapped_birds: day.trappedBirds,
        dead_birds: day.deadBirds,
        feed_water_available: day.feedWaterAvailable,
        equipment_operating: day.equipmentOperating,
        amenities_condition: day.amenitiesCondition,
        lay_facility_environment: day.layFacilityEnvironment,
      }))

      // Step 4: Save Page 1 data
      const { error: dailyError } = await supabase
        .from('welfare_daily_records')
        .insert(dailyRecords)

      // Step 5: Save Page 2 data
      const { error: equipmentError } = await supabase
        .from('welfare_equipment_inspection')
        .insert(equipmentRecords)

      // Step 6: Save form-level metadata
      const { error: formError } = await supabase
        .from('welfare_form_metadata')
        .insert([{
          farm_id: farmId,
          audit_id: auditId,
          alarm_check_date: alarmCheckDate || null,
          alarm_check_initials: alarmCheckInitials || null,
          generator_check_date: generatorCheckDate || null,
          generator_check_initials: generatorCheckInitials || null,
          comments_page_1: commentsPage1 || null,
          comments_page_2: commentsPage2 || null,
          signature_date: signatureDate || null,
        }])

      // Step 7: Update audit record as completed
      if (!existingAudit) {
        const { error: updateError } = await supabase
          .from('monthly_audits')
          .update({
            form_08_completed: true,
            form_08_completed_date: new Date().toISOString(),
          })
          .eq('id', auditId)
        
        if (updateError) throw updateError
      }

      if (dailyError || equipmentError || formError) {
        alert('Error saving: ' + (dailyError?.message || equipmentError?.message || formError?.message))
        console.error('Errors:', dailyError, equipmentError, formError)
      } else {
        alert('✅ Form 08 records saved for month!')
      }
    } catch (error) {
      alert('Error: ' + error.message)
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', background: 'white', borderRadius: '8px' }}>
      
      {/* FORM HEADER */}
      <div style={{ borderBottom: '3px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', textAlign: 'center' }}>
          Form 08 - Welfare Records
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '16px', marginBottom: '20px' }}>
          <div><strong>Farm Name:</strong> {farmName}</div>
          <div><strong>Barn #:</strong> {barnNumber}</div>
          <div><strong>Month/Year:</strong> {monthYear}</div>
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
            onClick={() => setViewMode('week')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: viewMode === 'week' ? '#0066cc' : '#ddd',
              color: viewMode === 'week' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Week View
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
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Select Day:</label>
            <select value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value))}
              style={{ padding: '8px', border: '1px solid #ccc', fontSize: '14px' }}>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Day {i + 1}</option>
              ))}
            </select>
          </div>

          <DayViewForm 
            day={selectedDay} 
            data={dayData[selectedDay]} 
            onDayChange={handleDayChange}
            onDayCheckbox={handleDayCheckbox} />
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Select Week Start Day:</label>
            <select defaultValue="1"
              onChange={(e) => setSelectedDay(parseInt(e.target.value))}
              style={{ padding: '8px', border: '1px solid #ccc', fontSize: '14px' }}>
              {[1, 8, 15, 22, 29].map(day => (
                <option key={day} value={day}>Week of Day {day}</option>
              ))}
            </select>
          </div>

          <WeekViewTable 
            startDay={selectedDay} 
            dayData={dayData} 
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

      {/* FORM FOOTER - Always visible */}
      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #333' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Form Metadata</h3>

        <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Alarm Checks</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input type="date" value={alarmCheckDate}
                onChange={(e) => setAlarmCheckDate(e.target.value)}
                style={{ padding: '8px', border: '1px solid #ccc' }} />
              <input type="text" value={alarmCheckInitials}
                onChange={(e) => setAlarmCheckInitials(e.target.value)}
                placeholder="Initials"
                maxLength="3"
                style={{ padding: '8px', border: '1px solid #ccc' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Generator Checks</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input type="date" value={generatorCheckDate}
                onChange={(e) => setGeneratorCheckDate(e.target.value)}
                style={{ padding: '8px', border: '1px solid #ccc' }} />
              <input type="text" value={generatorCheckInitials}
                onChange={(e) => setGeneratorCheckInitials(e.target.value)}
                placeholder="Initials"
                maxLength="3"
                style={{ padding: '8px', border: '1px solid #ccc' }} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Comments/Corrective Actions (All)</label>
          <textarea value={commentsPage1}
            onChange={(e) => setCommentsPage1(e.target.value)}
            style={{ width: '100%', minHeight: '80px', padding: '8px', border: '1px solid #ccc', fontFamily: 'monospace' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', paddingTop: '20px' }}>
          <div>
            <p style={{ marginBottom: '30px', minHeight: '20px' }}>_________________________</p>
            <p style={{ fontSize: '14px', color: '#666' }}>Signature</p>
          </div>
          <div>
            <input type="date" value={signatureDate}
              onChange={(e) => setSignatureDate(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ccc', marginBottom: '20px', width: '200px' }} />
            <p style={{ fontSize: '14px', color: '#666' }}>Date</p>
          </div>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button type="submit" style={{
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#0066cc',
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
