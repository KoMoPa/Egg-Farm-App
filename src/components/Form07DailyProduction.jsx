import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Form07DailyProduction({ farmId, farmName, barnNumber, monthYear }) {
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0])

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
        const { data: newAudit, error: newAuditError } = await supabase
          .from('monthly_audits')
          .insert([{
            farm_id: farmId,
            month_year: monthYear,
            form_07_completed: false,
          }])
          .select()

        if (newAuditError) throw newAuditError
        auditId = newAudit[0].id
      }

      // Step 2: Save Production Cooler Records
      const { data: prodData, error: prodError } = await supabase
        .from('production_cooler_records')
        .insert([{
          farm_id: farmId,
          audit_id: auditId,
          barn_number: barnNumber,
          record_date: recordDate,
          flock_age_weeks: toNumber(formData.age),

          floor_eggs_collection_1: parseInt(formData.floorEggs1) || 0,
          floor_eggs_collection_2: parseInt(formData.floorEggs2) || 0,
          floor_eggs_total: floorEggsTotal,

          egg_production_1: parseInt(formData.eggProduction1) || 0,
          egg_production_2: parseInt(formData.eggProduction2) || 0,
          egg_production_daily: eggProductionDaily,
          egg_production_percent: toNumber(formData.eggProductionPercent),

          cooler_temp_hi_celsius: toNumber(formData.coolerTempHi),
          cooler_temp_lo_celsius: toNumber(formData.coolerTempLo),
          cooler_rh_hi_percent: toNumber(formData.coolerRhHi),
          cooler_rh_lo_percent: toNumber(formData.coolerRhLo),
          cooler_check_time: formData.coolerCheckTime || null
        }])

      if (prodError) throw prodError

      // Step 3: Save Sanitation Records
      const { data: sanitData, error: sanitError } = await supabase
        .from('sanitation_records')
        .insert([{
          farm_id: farmId,
          audit_id: auditId,
          barn_number: barnNumber,
          record_date: recordDate,

          dirty_trays_count: parseInt(formData.dirtyTrays) || 0,
          egg_cooler_cleaned: formData.eggCoolerCleaned,
          pack_room_cleaned: formData.packRoomCleaned,
          tables_packing_equip_cleaned: formData.tablesPackingEquipCleaned,
          corrective_actions: formData.correctiveActions || null
        }])

      if (sanitError) throw sanitError

      // Step 4: Mark form as completed
      const { error: updateError } = await supabase
        .from('monthly_audits')
        .update({
          form_07_completed: true,
          form_07_completed_date: new Date().toISOString()
        })
        .eq('id', auditId)

      if (updateError) throw updateError

      alert('✅ Form 07 record saved for ' + recordDate + '!')
      console.log('Saved production:', prodData)
      console.log('Saved sanitation:', sanitData)
    } catch (err) {
      alert('Error saving: ' + err.message)
      console.error('Error:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', background: 'white', borderRadius: '8px' }}>

      {/* FORM HEADER - Matches top of official form */}
      <div style={{ borderBottom: '3px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', textAlign: 'center', color: '#000' }}>
          Form 07 - Egg Production & Cooler Records
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', fontSize: '16px', marginBottom: '20px' }}>
          <div>
            <strong>Farm Name:</strong> {farmName}
          </div>
          <div>
            <strong>Barn #:</strong> {barnNumber}
          </div>
          <div>
            <strong>Month/Year:</strong> {monthYear}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date</label>
            <input type="date" value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
          </div>
        </div>
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
        💾 Save Complete Form 07 (Day {formData.date})
      </button>
    </form>
  )
}