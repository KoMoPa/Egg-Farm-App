import { useState } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreateProductionRecord } from '../utils/farmBarnOps'
import { useFarmContext } from '../contexts/FarmContext'

export default function Form07DailyProduction() {
  const supabase = useSupabase()
  const { farm, selectedBarn, monthYear } = useFarmContext()
  const [viewMode, setViewMode] = useState('day')
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0])

  // Monthly Checks state
  const [thermCalDate, setThermCalDate] = useState('')
  const [thermCalMethod, setThermCalMethod] = useState('A')
  const [thermCalPass, setThermCalPass] = useState(true)
  const [thermCalInitials, setThermCalInitials] = useState('')
  const [thermCalNotes, setThermCalNotes] = useState('')
  const [monthlyCorrectiveActions, setMonthlyCorrectiveActions] = useState('')
  const [monthlyComments, setMonthlyComments] = useState('')
  const [monthlySaved, setMonthlySaved] = useState(false)

  const [formData, setFormData] = useState({
    age: '',

    // Floor eggs
    floorEggs1: '',
    floorEggs2: '',

    // Nest eggs
    eggProduction1: '',
    eggProduction2: '',
    eggProductionPercent: '',

    // Cooler monitoring
    coolerTempHi: '',
    coolerTempLo: '',
    coolerRhHi: '',
    coolerRhLo: '',
    coolerCheckTime: '',

    // PAGE 2 - Sanitation
    dirtyTrays: '',
    eggCoolerCleaned: false,
    packRoomCleaned: false,
    tablesPackingEquipCleaned: false,
    correctiveActions: ''
  })

  // Auto-calculate totals
  const floorEggsTotal =
    (parseInt(formData.floorEggs1) || 0) +
    (parseInt(formData.floorEggs2) || 0)

  const eggProductionDaily =
    (parseInt(formData.eggProduction1) || 0) +
    (parseInt(formData.eggProduction2) || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Helper to safely convert to number or null
    const toNumber = (val) => {
      if (!val) return null
      const num = parseFloat(val)
      return isNaN(num) ? null : num
    }

    try {
      // Step 1: Get or create monthly audit record
      const { audit, created: auditCreated } = await getOrCreateMonthlyAudit(farm.id, monthYear)
      const auditId = audit.id

      // Step 2: Get or create production cooler records parent
      const { record: productionRecord } = await getOrCreateProductionRecord(selectedBarn.id, auditId)
      const productionId = productionRecord.id

      // Step 3: Insert floor eggs record
      const { error: floorEggsError } = await supabase
        .from('production_floor_eggs')
        .insert([{
          production_id: productionId,
          record_date: recordDate,
          collection_1: parseInt(formData.floorEggs1) || null,
          collection_2: parseInt(formData.floorEggs2) || null,
          floor_eggs_total: floorEggsTotal
        }])

      if (floorEggsError) throw floorEggsError

      // Step 4: Insert egg production record
      const { error: eggOutputError } = await supabase
        .from('production_egg_output')
        .insert([{
          production_id: productionId,
          record_date: recordDate,
          egg_production_1: parseInt(formData.eggProduction1) || null,
          egg_production_2: parseInt(formData.eggProduction2) || null,
          egg_production_daily: eggProductionDaily,
          egg_production_percent: toNumber(formData.eggProductionPercent)
        }])

      if (eggOutputError) throw eggOutputError

      // Step 5: Insert cooler temps record
      const { error: coolerTempsError } = await supabase
        .from('production_cooler_temps')
        .insert([{
          production_id: productionId,
          record_date: recordDate,
          cooler_temp_hi_celsius: toNumber(formData.coolerTempHi),
          cooler_temp_lo_celsius: toNumber(formData.coolerTempLo),
          cooler_rh_hi_percent: toNumber(formData.coolerRhHi),
          cooler_rh_lo_percent: toNumber(formData.coolerRhLo),
          cooler_check_time: formData.coolerCheckTime || null
        }])

      if (coolerTempsError) throw coolerTempsError

      // Step 6: Insert sanitation record
      const sanitationCodes = []
      if (formData.eggCoolerCleaned) sanitationCodes.push('B') // B = blow/cleaned
      if (formData.packRoomCleaned) sanitationCodes.push('W')  // W = wash
      if (formData.tablesPackingEquipCleaned) sanitationCodes.push('S') // S = sweep

      const { error: sanitationError } = await supabase
        .from('production_sanitation')
        .insert([{
          production_id: productionId,
          record_date: recordDate,
          dirty_trays_count: parseInt(formData.dirtyTrays) || 0,
          egg_cooler_sanitation_code: sanitationCodes.includes('B') ? 'B' : null,
          pack_room_sanitation_code: sanitationCodes.includes('W') ? 'W' : null,
          equip_sanitation_code: sanitationCodes.includes('S') ? 'S' : null,
          corrective_actions: formData.correctiveActions || null
        }])

      if (sanitationError) throw sanitationError

      // Step 7: Insert flock age record (if provided)
      if (formData.age) {
        const { error: flockAgeError } = await supabase
          .from('production_flock_age')
          .insert([{
            production_id: productionId,
            record_date: recordDate,
            flock_age_weeks: parseInt(formData.age)
          }])

        if (flockAgeError) throw flockAgeError
      }

      // Step 8: Mark form as completed in monthly audit
      const { error: updateError } = await supabase
        .from('monthly_audits')
        .update({
          form_07_completed: true,
          form_07_completed_date: new Date().toISOString()
        })
        .eq('id', auditId)

      if (updateError) throw updateError

      alert('✅ Form 07 record saved for ' + recordDate + '!')
      // Reset form
      setFormData({
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
        correctiveActions: ''
      })
      setRecordDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      alert('Error saving: ' + err.message)
      console.error('Error:', err)
    }
  }

  const handleMonthlySubmit = async (e) => {
    e.preventDefault()
    try {
      const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
      const { record: productionRecord } = await getOrCreateProductionRecord(selectedBarn.id, audit.id)
      const productionId = productionRecord.id

      // Save thermometer calibration if date is provided
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

      // Save monthly corrective actions and comments to production_cooler_records
      const { error: updateError } = await supabase
        .from('production_cooler_records')
        .update({
          monthly_corrective_actions: monthlyCorrectiveActions || null,
          monthly_comments: monthlyComments || null
        })
        .eq('id', productionId)
      if (updateError) throw updateError

      setMonthlySaved(true)
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
          Form 07 - Egg Production & Cooler Records
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

      {/* Date picker */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '16px' }}>Date</label>
        <input type="date" value={recordDate}
          onChange={(e) => setRecordDate(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', fontSize: '16px' }} />
      </div>

      {/* ============ PAGE 1 FIELDS ============ */}

      {/* Age */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          Age (weeks)
        </label>
        <input
          type="number"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          style={{ width: '200px', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px' }}
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
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>
              #1
            </label>
            <input
              type="number"
              value={formData.floorEggs1}
              onChange={(e) => setFormData({ ...formData, floorEggs1: e.target.value })}
              style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px' }}
              placeholder="150"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>
              #2
            </label>
            <input
              type="number"
              value={formData.floorEggs2}
              onChange={(e) => setFormData({ ...formData, floorEggs2: e.target.value })}
              style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px' }}
              placeholder="120"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>
              Total
            </label>
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
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>
              #1
            </label>
            <input
              type="number"
              value={formData.eggProduction1}
              onChange={(e) => setFormData({ ...formData, eggProduction1: e.target.value })}
              style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px' }}
              placeholder="6000"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>
              #2
            </label>
            <input
              type="number"
              value={formData.eggProduction2}
              onChange={(e) => setFormData({ ...formData, eggProduction2: e.target.value })}
              style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px' }}
              placeholder="6500"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>
              Daily
            </label>
            <div style={{ padding: '12px', fontSize: '20px', fontWeight: 'bold', background: '#28a745', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
              {eggProductionDaily}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>
              % Daily
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.eggProductionPercent}
              onChange={(e) => setFormData({ ...formData, eggProductionPercent: e.target.value })}
              style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px' }}
              placeholder="92.5"
            />
          </div>
        </div>
      </div>

      {/* Cooler Temperature & Humidity */}
      <div style={{ background: '#d1ecf1', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #0c5460', paddingBottom: '8px' }}>
          Cooler Temperature & RH%
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>
              Temp HI (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.coolerTempHi}
              onChange={(e) => setFormData({ ...formData, coolerTempHi: e.target.value })}
              style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px' }}
              placeholder="4.5"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>
              Temp LO (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.coolerTempLo}
              onChange={(e) => setFormData({ ...formData, coolerTempLo: e.target.value })}
              style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px' }}
              placeholder="3.8"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>
              RH% HI
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.coolerRhHi}
              onChange={(e) => setFormData({ ...formData, coolerRhHi: e.target.value })}
              style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px' }}
              placeholder="75.0"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>
              RH% LO
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.coolerRhLo}
              onChange={(e) => setFormData({ ...formData, coolerRhLo: e.target.value })}
              style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px' }}
              placeholder="70.0"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>
              Time
            </label>
            <input
              type="time"
              value={formData.coolerCheckTime}
              onChange={(e) => setFormData({ ...formData, coolerCheckTime: e.target.value })}
              style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px' }}
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
          value={formData.dirtyTrays}
          onChange={(e) => setFormData({ ...formData, dirtyTrays: e.target.value })}
          style={{ width: '200px', padding: '12px', fontSize: '18px', border: '2px solid #ddd', borderRadius: '8px' }}
          placeholder="5"
        />
      </div>

      {/* Sanitation - As Completed */}
      <div style={{ background: '#e7f3ff', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #0066cc', paddingBottom: '8px' }}>
          Sanitation - As Completed
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #ddd', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.eggCoolerCleaned}
              onChange={(e) => setFormData({ ...formData, eggCoolerCleaned: e.target.checked })}
              style={{ width: '24px', height: '24px', marginRight: '12px' }}
            />
            <span style={{ fontSize: '18px' }}>Egg Cooler</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #ddd', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.packRoomCleaned}
              onChange={(e) => setFormData({ ...formData, packRoomCleaned: e.target.checked })}
              style={{ width: '24px', height: '24px', marginRight: '12px' }}
            />
            <span style={{ fontSize: '18px' }}>Pack Room</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #ddd', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.tablesPackingEquipCleaned}
              onChange={(e) => setFormData({ ...formData, tablesPackingEquipCleaned: e.target.checked })}
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
          value={formData.correctiveActions}
          onChange={(e) => setFormData({ ...formData, correctiveActions: e.target.value })}
          style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #ddd', borderRadius: '8px', fontFamily: 'inherit' }}
          rows="4"
          placeholder="Describe any issues found and corrective actions taken..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        style={{
          width: '100%',
          padding: '20px',
          fontSize: '22px',
          fontWeight: 'bold',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        💾 Save Daily Record
      </button>

      </>)}

      {/* ============ MONTHLY CHECKS TAB ============ */}
      {viewMode === 'monthly' && (
        <div>
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
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Method</label>
                <select value={thermCalMethod} onChange={e => setThermCalMethod(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontSize: '15px' }}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Result</label>
                <select value={thermCalPass ? 'pass' : 'fail'} onChange={e => setThermCalPass(e.target.value === 'pass')}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontSize: '15px' }}>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Initials</label>
                <input type="text" value={thermCalInitials}
                  onChange={e => setThermCalInitials(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontSize: '15px' }}
                  placeholder="AB" maxLength={20} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Notes</label>
                <input type="text" value={thermCalNotes}
                  onChange={e => setThermCalNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontSize: '15px' }}
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
              style={{ width: '100%', padding: '12px', fontSize: '15px', border: '2px solid #ddd', borderRadius: '8px', fontFamily: 'inherit' }}
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
              style={{ width: '100%', padding: '12px', fontSize: '15px', border: '2px solid #ddd', borderRadius: '8px', fontFamily: 'inherit' }}
              placeholder="Monthly comments..." />
          </div>

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

          {monthlySaved && (
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
          )}
        </div>
      )}

    </form>
  )
}