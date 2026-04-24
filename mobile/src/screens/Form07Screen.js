import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Switch
} from 'react-native'
import { useFarmContext } from '../contexts/FarmContext'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreateProductionRecord } from '../utils/farmBarnOps'

const INITIAL_FORM = {
  age: '',
  floorEggs1: '', floorEggs2: '',
  eggProduction1: '', eggProduction2: '', eggProductionPercent: '',
  coolerTempHi: '', coolerTempLo: '', coolerRhHi: '', coolerRhLo: '', coolerCheckTime: '',
  dirtyTrays: '',
  eggCoolerCleaned: false, packRoomCleaned: false, tablesPackingEquipCleaned: false,
  correctiveActions: '',
}

const INITIAL_MONTHLY = {
  thermCalDate: '', thermCalMethod: 'A', thermCalPass: true,
  thermCalInitials: '', thermCalNotes: '',
  monthlyCorrectiveActions: '', monthlyComments: '',
}

function LabeledInput({ label, value, onChangeText, keyboardType = 'default', placeholder = '', locked = false }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, locked && styles.inputLocked]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        editable={!locked}
      />
    </View>
  )
}

function SwitchRow({ label, value, onValueChange, locked = false }) {
  return (
    <View style={[styles.switchRow, locked && styles.rowLocked]}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: '#28a745' }} disabled={locked} />
    </View>
  )
}

export default function Form07Screen() {
  const supabase = useSupabase()
  const { farm, selectedBarn, monthYear } = useFarmContext()
  const [viewMode, setViewMode] = useState('day')
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0])
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [monthly, setMonthly] = useState(INITIAL_MONTHLY)
  const [saving, setSaving] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [loadingDay, setLoadingDay] = useState(false)

  // Reset when barn or month changes
  useEffect(() => {
    setFormData(INITIAL_FORM)
    setIsLocked(false)
  }, [selectedBarn?.id, monthYear])

  // Load existing data when record date changes
  useEffect(() => {
    if (!recordDate || recordDate.length !== 10 || !selectedBarn?.id || !farm?.id) return
    let cancelled = false
    const check = async () => {
      setLoadingDay(true)
      try {
        const monthStr = recordDate.substring(0, 7)
        const { data: audit } = await supabase.from('monthly_audits').select('id')
          .eq('farm_id', farm.id).eq('month_year', monthStr + '-01').maybeSingle()
        if (!audit || cancelled) { setIsLocked(false); return }
        const { data: prod } = await supabase.from('production_cooler_records').select('id')
          .eq('barn_id', selectedBarn.id).eq('audit_id', audit.id).maybeSingle()
        if (!prod || cancelled) { setIsLocked(false); return }
        const [{ data: fe }, { data: eo }, { data: ct }, { data: san }, { data: fa }] = await Promise.all([
          supabase.from('production_floor_eggs').select('*').eq('production_id', prod.id).eq('record_date', recordDate).maybeSingle(),
          supabase.from('production_egg_output').select('*').eq('production_id', prod.id).eq('record_date', recordDate).maybeSingle(),
          supabase.from('production_cooler_temps').select('*').eq('production_id', prod.id).eq('record_date', recordDate).maybeSingle(),
          supabase.from('production_sanitation').select('*').eq('production_id', prod.id).eq('record_date', recordDate).maybeSingle(),
          supabase.from('production_flock_age').select('*').eq('production_id', prod.id).eq('record_date', recordDate).maybeSingle(),
        ])
        if (cancelled) return
        if (!fe) { setIsLocked(false); return }
        setFormData({
          age: fa?.flock_age_weeks?.toString() || '',
          floorEggs1: fe?.collection_1?.toString() || '',
          floorEggs2: fe?.collection_2?.toString() || '',
          eggProduction1: eo?.egg_production_1?.toString() || '',
          eggProduction2: eo?.egg_production_2?.toString() || '',
          eggProductionPercent: eo?.egg_production_percent?.toString() || '',
          coolerTempHi: ct?.cooler_temp_hi_celsius?.toString() || '',
          coolerTempLo: ct?.cooler_temp_lo_celsius?.toString() || '',
          coolerRhHi: ct?.cooler_rh_hi_percent?.toString() || '',
          coolerRhLo: ct?.cooler_rh_lo_percent?.toString() || '',
          coolerCheckTime: ct?.cooler_check_time || '',
          dirtyTrays: san?.dirty_trays_count?.toString() || '',
          eggCoolerCleaned: !!san?.egg_cooler_sanitation_code,
          packRoomCleaned: !!san?.pack_room_sanitation_code,
          tablesPackingEquipCleaned: !!san?.equip_sanitation_code,
          correctiveActions: san?.corrective_actions || '',
        })
        setIsLocked(true)
      } catch (e) {
        if (!cancelled) { console.error('Error loading day:', e); setIsLocked(false) }
      } finally {
        if (!cancelled) setLoadingDay(false)
      }
    }
    check()
    return () => { cancelled = true }
  }, [recordDate, selectedBarn?.id, monthYear])

  const floorEggsTotal = (parseInt(formData.floorEggs1) || 0) + (parseInt(formData.floorEggs2) || 0)
  const eggProductionDaily = (parseInt(formData.eggProduction1) || 0) + (parseInt(formData.eggProduction2) || 0)

  const setField = (key, val) => setFormData(prev => ({ ...prev, [key]: val }))
  const setMonthlyField = (key, val) => setMonthly(prev => ({ ...prev, [key]: val }))

  const toNumber = (val) => {
    if (!val) return null
    const n = parseFloat(val)
    return isNaN(n) ? null : n
  }

  if (!selectedBarn) {
    return (
      <View style={styles.noBarn}>
        <Text style={styles.noBarnText}>Please select a barn from the Home tab first.</Text>
      </View>
    )
  }

  const handleDaySubmit = async () => {
    setSaving(true)
    try {
      const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
      const { record: productionRecord } = await getOrCreateProductionRecord(selectedBarn.id, audit.id)
      await saveDay(productionRecord.id, audit.id)
    } catch (err) {
      Alert.alert('Error', err.message)
      setSaving(false)
    }
  }

  const saveDay = async (productionId, auditId) => {
    try {
      const conflict = 'production_id,record_date'

      await supabase.from('production_floor_eggs').upsert([{
        production_id: productionId, record_date: recordDate,
        collection_1: parseInt(formData.floorEggs1) || null,
        collection_2: parseInt(formData.floorEggs2) || null,
        floor_eggs_total: floorEggsTotal,
      }], { onConflict: conflict })

      await supabase.from('production_egg_output').upsert([{
        production_id: productionId, record_date: recordDate,
        egg_production_1: parseInt(formData.eggProduction1) || null,
        egg_production_2: parseInt(formData.eggProduction2) || null,
        egg_production_daily: eggProductionDaily,
        egg_production_percent: toNumber(formData.eggProductionPercent),
      }], { onConflict: conflict })

      await supabase.from('production_cooler_temps').upsert([{
        production_id: productionId, record_date: recordDate,
        cooler_temp_hi_celsius: toNumber(formData.coolerTempHi),
        cooler_temp_lo_celsius: toNumber(formData.coolerTempLo),
        cooler_rh_hi_percent: toNumber(formData.coolerRhHi),
        cooler_rh_lo_percent: toNumber(formData.coolerRhLo),
        cooler_check_time: formData.coolerCheckTime || null,
      }], { onConflict: conflict })

      await supabase.from('production_sanitation').upsert([{
        production_id: productionId, record_date: recordDate,
        dirty_trays_count: parseInt(formData.dirtyTrays) || 0,
        egg_cooler_sanitation_code: formData.eggCoolerCleaned ? 'B' : null,
        pack_room_sanitation_code: formData.packRoomCleaned ? 'W' : null,
        equip_sanitation_code: formData.tablesPackingEquipCleaned ? 'S' : null,
        corrective_actions: formData.correctiveActions || null,
      }], { onConflict: conflict })

      if (formData.age) {
        await supabase.from('production_flock_age').upsert([{
          production_id: productionId, record_date: recordDate,
          flock_age_weeks: parseInt(formData.age),
        }], { onConflict: conflict })
      }

      await supabase.from('monthly_audits').update({
        form_07_completed: true,
        form_07_completed_date: new Date().toISOString(),
      }).eq('id', auditId)

      Alert.alert('Saved', `Form 07 record saved for ${recordDate}!`)
      setIsLocked(true)
    } catch (err) {
      Alert.alert('Error', err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleMonthlySubmit = async () => {
    setSaving(true)
    try {
      const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
      const { record: productionRecord } = await getOrCreateProductionRecord(selectedBarn.id, audit.id)
      const productionId = productionRecord.id

      if (monthly.thermCalDate) {
        const { error } = await supabase.from('production_thermometer_calibration').insert([{
          production_id: productionId,
          calibration_date: monthly.thermCalDate,
          method: monthly.thermCalMethod,
          result_pass: monthly.thermCalPass,
          initials: monthly.thermCalInitials || null,
          notes: monthly.thermCalNotes || null,
        }])
        if (error) throw error
      }

      const { error: updateError } = await supabase
        .from('production_cooler_records')
        .update({
          monthly_corrective_actions: monthly.monthlyCorrectiveActions || null,
          monthly_comments: monthly.monthlyComments || null,
        })
        .eq('id', productionId)
      if (updateError) throw updateError

      Alert.alert('Saved', 'Monthly checks saved!')
    } catch (err) {
      Alert.alert('Error', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.formTitle}>Form 07 – Egg Production & Cooler Records</Text>
        <Text style={styles.formMeta}>
          {farm?.farm_name} · {selectedBarn?.barn_name} · {monthYear.substring(0, 7)}
        </Text>
      </View>

      {/* Tab toggle */}
      <View style={styles.tabs}>
        {['day', 'monthly'].map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.tab, viewMode === mode && styles.tabActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[styles.tabText, viewMode === mode && styles.tabTextActive]}>
              {mode === 'day' ? 'Day View' : 'Monthly Checks'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {viewMode === 'day' ? (
        <View style={styles.section}>
          <LabeledInput label="Date (YYYY-MM-DD)" value={recordDate} onChangeText={setRecordDate} />

          {isLocked && (
            <View style={styles.lockedBanner}>
              <Text style={styles.lockedBannerText}>✓ Already recorded for this date</Text>
              <TouchableOpacity style={styles.redoBtn} onPress={() => setIsLocked(false)}>
                <Text style={styles.redoBtnText}>Redo this day</Text>
              </TouchableOpacity>
            </View>
          )}

          <LabeledInput label="Flock Age (weeks)" value={formData.age} onChangeText={v => setField('age', v)} keyboardType="numeric" locked={isLocked} />

          <Text style={styles.sectionHeader}>Floor Eggs</Text>
          <LabeledInput label="Collection 1" value={formData.floorEggs1} onChangeText={v => setField('floorEggs1', v)} keyboardType="numeric" locked={isLocked} />
          <LabeledInput label="Collection 2" value={formData.floorEggs2} onChangeText={v => setField('floorEggs2', v)} keyboardType="numeric" locked={isLocked} />
          <Text style={styles.calcLine}>Total Floor Eggs: {floorEggsTotal}</Text>

          <Text style={styles.sectionHeader}>Egg Production</Text>
          <LabeledInput label="Collection 1" value={formData.eggProduction1} onChangeText={v => setField('eggProduction1', v)} keyboardType="numeric" locked={isLocked} />
          <LabeledInput label="Collection 2" value={formData.eggProduction2} onChangeText={v => setField('eggProduction2', v)} keyboardType="numeric" locked={isLocked} />
          <Text style={styles.calcLine}>Daily Total: {eggProductionDaily}</Text>
          <LabeledInput label="Production %" value={formData.eggProductionPercent} onChangeText={v => setField('eggProductionPercent', v)} keyboardType="decimal-pad" locked={isLocked} />

          <Text style={styles.sectionHeader}>Cooler Monitoring</Text>
          <LabeledInput label="Temp Hi (°C)" value={formData.coolerTempHi} onChangeText={v => setField('coolerTempHi', v)} keyboardType="decimal-pad" locked={isLocked} />
          <LabeledInput label="Temp Lo (°C)" value={formData.coolerTempLo} onChangeText={v => setField('coolerTempLo', v)} keyboardType="decimal-pad" locked={isLocked} />
          <LabeledInput label="RH Hi (%)" value={formData.coolerRhHi} onChangeText={v => setField('coolerRhHi', v)} keyboardType="decimal-pad" locked={isLocked} />
          <LabeledInput label="RH Lo (%)" value={formData.coolerRhLo} onChangeText={v => setField('coolerRhLo', v)} keyboardType="decimal-pad" locked={isLocked} />
          <LabeledInput label="Check Time" value={formData.coolerCheckTime} onChangeText={v => setField('coolerCheckTime', v)} placeholder="HH:MM" locked={isLocked} />

          <Text style={styles.sectionHeader}>Sanitation</Text>
          <LabeledInput label="Dirty Trays Count" value={formData.dirtyTrays} onChangeText={v => setField('dirtyTrays', v)} keyboardType="numeric" locked={isLocked} />
          <SwitchRow label="Egg Cooler Cleaned (B)" value={formData.eggCoolerCleaned} onValueChange={v => setField('eggCoolerCleaned', v)} locked={isLocked} />
          <SwitchRow label="Pack Room Cleaned (W)" value={formData.packRoomCleaned} onValueChange={v => setField('packRoomCleaned', v)} locked={isLocked} />
          <SwitchRow label="Tables/Packing Equip (S)" value={formData.tablesPackingEquipCleaned} onValueChange={v => setField('tablesPackingEquipCleaned', v)} locked={isLocked} />
          <LabeledInput label="Corrective Actions" value={formData.correctiveActions} onChangeText={v => setField('correctiveActions', v)} locked={isLocked} />

          {!isLocked && (
            <TouchableOpacity
              style={[styles.submitBtn, saving && styles.buttonDisabled]}
              onPress={handleDaySubmit}
              disabled={saving}
            >
              <Text style={styles.submitBtnText}>{saving ? 'Saving…' : 'Save Day Record'}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Thermometer Calibration</Text>
          <LabeledInput label="Calibration Date (YYYY-MM-DD)" value={monthly.thermCalDate} onChangeText={v => setMonthlyField('thermCalDate', v)} />
          <LabeledInput label="Method (A/B/C)" value={monthly.thermCalMethod} onChangeText={v => setMonthlyField('thermCalMethod', v)} />
          <SwitchRow label="Result: Pass" value={monthly.thermCalPass} onValueChange={v => setMonthlyField('thermCalPass', v)} />
          <LabeledInput label="Initials" value={monthly.thermCalInitials} onChangeText={v => setMonthlyField('thermCalInitials', v)} />
          <LabeledInput label="Notes" value={monthly.thermCalNotes} onChangeText={v => setMonthlyField('thermCalNotes', v)} />

          <Text style={styles.sectionHeader}>Monthly Summary</Text>
          <LabeledInput label="Monthly Corrective Actions" value={monthly.monthlyCorrectiveActions} onChangeText={v => setMonthlyField('monthlyCorrectiveActions', v)} />
          <LabeledInput label="Monthly Comments" value={monthly.monthlyComments} onChangeText={v => setMonthlyField('monthlyComments', v)} />

          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.buttonDisabled]}
            onPress={handleMonthlySubmit}
            disabled={saving}
          >
            <Text style={styles.submitBtnText}>{saving ? 'Saving…' : 'Save Monthly Checks'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  noBarn: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  noBarnText: { fontSize: 16, color: '#666', textAlign: 'center' },
  header: { backgroundColor: 'white', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  formMeta: { fontSize: 13, color: '#666', marginTop: 4 },
  tabs: { flexDirection: 'row', margin: 16, gap: 8 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 2, borderColor: '#28a745', alignItems: 'center',
  },
  tabActive: { backgroundColor: '#28a745' },
  tabText: { color: '#28a745', fontWeight: '600', fontSize: 15 },
  tabTextActive: { color: 'white' },
  section: { paddingHorizontal: 16 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 6 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 11, fontSize: 15, color: '#000', backgroundColor: 'white',
  },
  calcLine: { fontSize: 14, color: '#28a745', fontWeight: '600', marginBottom: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  switchLabel: { fontSize: 14, color: '#333', flex: 1, marginRight: 8 },
  submitBtn: { backgroundColor: '#0066cc', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { backgroundColor: '#aaa' },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  inputLocked: { backgroundColor: '#f0f0f0', borderColor: '#ddd', color: '#888' },
  rowLocked: { opacity: 0.6 },
  lockedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#d4edda', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#28a745' },
  lockedBannerText: { color: '#155724', fontWeight: '600', fontSize: 13, flex: 1 },
  redoBtn: { backgroundColor: '#0066cc', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 7 },
  redoBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
})
