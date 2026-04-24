import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Switch
} from 'react-native'
import { useFarmContext } from '../contexts/FarmContext'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreateWelfareRecord } from '../utils/farmBarnOps'

const INSPECTION_CHECKS = [
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
]

const BLANK_DAY = {
  barnTempHi: '', barnTempLo: '', exteriorTemp: '',
  floorsChecked: false, wallsFansCeilingChecked: false, manureChecked: false,
  beddingUsed: false, chemicalsUsed: false,
  routineHenEquip1stInitial: '', routineHenEquip1stDaily: '',
  routineHenEquip2ndInitial: '', routineHenEquip2ndDaily: '',
  overallAppearance: false, generalSound: false, abnormalBehavior: false,
  signsOfDisease: false, injuredBirds: false, respiratoryProblems: false,
  pantingHuddling: false, lameness: false, featherPecking: false,
  trappedBirds: false, deadBirds: false, feedWaterAvailable: false,
  equipmentOperating: false, amenitiesCondition: false, layFacilityEnvironment: false,
}

function LabeledInput({ label, value, onChangeText, keyboardType = 'default', locked = false }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, locked && styles.inputLocked]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
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

export default function Form08Screen() {
  const supabase = useSupabase()
  const { farm, selectedBarn, monthYear } = useFarmContext()
  const [viewMode, setViewMode] = useState('day')
  const [selectedDay, setSelectedDay] = useState(1)
  const [dayData, setDayData] = useState({})
  const [lockedDays, setLockedDays] = useState({})
  const [loadingDay, setLoadingDay] = useState(false)

  // Monthly state
  const [ammoniaRange, setAmmoniaRange] = useState('')
  const [alarmCheckDate, setAlarmCheckDate] = useState('')
  const [alarmCheckInitials, setAlarmCheckInitials] = useState('')
  const [generatorCheckDate, setGeneratorCheckDate] = useState('')
  const [generatorCheckInitials, setGeneratorCheckInitials] = useState('')
  const [monthlyComments, setMonthlyComments] = useState('')
  const [saving, setSaving] = useState(false)

  // Reset when barn or month changes
  useEffect(() => {
    setDayData({})
    setLockedDays({})
    setSelectedDay(1)
  }, [selectedBarn?.id, monthYear])

  // Load day data from DB when day is selected
  useEffect(() => {
    if (!farm?.id || !selectedBarn?.id) return
    if (dayData[selectedDay] !== undefined) return
    let cancelled = false
    const load = async () => {
      setLoadingDay(true)
      try {
        const monthStr = monthYear.substring(0, 7)
        const recordDate = `${monthStr}-${String(selectedDay).padStart(2, '0')}`
        const { data: audit } = await supabase.from('monthly_audits').select('id')
          .eq('farm_id', farm.id).eq('month_year', monthStr + '-01').maybeSingle()
        if (!audit || cancelled) { unlock(selectedDay); return }
        const { data: welfare } = await supabase.from('welfare_records').select('id')
          .eq('barn_id', selectedBarn.id).eq('audit_id', audit.id).maybeSingle()
        if (!welfare || cancelled) { unlock(selectedDay); return }
        const { data: dc } = await supabase.from('welfare_daily_checks').select('*')
          .eq('welfare_id', welfare.id).eq('record_date', recordDate).maybeSingle()
        if (!dc || cancelled) { unlock(selectedDay); return }
        const { data: wi } = await supabase.from('welfare_weekly_inspections').select('*')
          .eq('welfare_id', welfare.id).eq('inspection_date', recordDate).maybeSingle()
        if (cancelled) return
        setDayData(p => ({
          ...p,
          [selectedDay]: {
            barnTempHi: dc.barn_temp_hi?.toString() || '',
            barnTempLo: dc.barn_temp_lo?.toString() || '',
            exteriorTemp: dc.exterior_temp?.toString() || '',
            floorsChecked: !!dc.floor_sanitation_code,
            wallsFansCeilingChecked: !!dc.walls_sanitation_code,
            manureChecked: !!dc.manure_sanitation_code,
            beddingUsed: !!dc.bedding_notes,
            chemicalsUsed: !!dc.chemicals_notes,
            routineHenEquip1stInitial: dc.hen_inspection_am || '',
            routineHenEquip1stDaily: '',
            routineHenEquip2ndInitial: dc.hen_inspection_pm || '',
            routineHenEquip2ndDaily: '',
            overallAppearance: wi?.check_overall_appearance || false,
            generalSound: wi?.check_general_sound || false,
            abnormalBehavior: wi?.check_abnormal_behavior || false,
            signsOfDisease: wi?.check_disease_illness || false,
            injuredBirds: wi?.check_injured_birds || false,
            respiratoryProblems: wi?.check_respiratory || false,
            pantingHuddling: wi?.check_panting_huddling || false,
            lameness: wi?.check_lameness || false,
            featherPecking: wi?.check_feather_pecking || false,
            trappedBirds: wi?.check_trapped_birds || false,
            deadBirds: wi?.check_dead_birds || false,
            feedWaterAvailable: wi?.check_feed_water_available || false,
            equipmentOperating: wi?.check_equipment_operating || false,
            amenitiesCondition: wi?.check_amenities_condition || false,
            layFacilityEnvironment: wi?.check_lay_facility || false,
          },
        }))
        setLockedDays(p => ({ ...p, [selectedDay]: true }))
      } catch (e) {
        if (!cancelled) { console.error('Error loading day:', e); unlock(selectedDay) }
      } finally {
        if (!cancelled) setLoadingDay(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [selectedDay, selectedBarn?.id, monthYear])

  const unlock = (day) => {
    setDayData(p => ({ ...p, [day]: { ...BLANK_DAY } }))
    setLockedDays(p => ({ ...p, [day]: false }))
  }

  if (!selectedBarn) {
    return (
      <View style={styles.noBarn}>
        <Text style={styles.noBarnText}>Please select a barn from the Home tab first.</Text>
      </View>
    )
  }

  const currentDayData = dayData[selectedDay] || { ...BLANK_DAY }
  const isLocked = lockedDays[selectedDay] === true

  const setField = (field, value) => {
    setDayData(prev => ({
      ...prev,
      [selectedDay]: { ...(prev[selectedDay] || BLANK_DAY), [field]: value }
    }))
  }

  const handleDaySubmit = async () => {
    setSaving(true)
    try {
      const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
      const { record: welfare } = await getOrCreateWelfareRecord(selectedBarn.id, audit.id)
      const welfareId = welfare.id
      const monthPrefix = monthYear.substring(0, 7)
      const recordDate = `${monthPrefix}-${String(selectedDay).padStart(2, '0')}`

      await supabase.from('welfare_daily_checks').upsert([{
        welfare_id: welfareId, record_date: recordDate,
        barn_temp_hi: currentDayData.barnTempHi ? parseFloat(currentDayData.barnTempHi) : null,
        barn_temp_lo: currentDayData.barnTempLo ? parseFloat(currentDayData.barnTempLo) : null,
        exterior_temp: currentDayData.exteriorTemp ? parseFloat(currentDayData.exteriorTemp) : null,
        floor_sanitation_code: currentDayData.floorsChecked ? 'Y' : null,
        walls_sanitation_code: currentDayData.wallsFansCeilingChecked ? 'Y' : null,
        manure_sanitation_code: currentDayData.manureChecked ? 'Y' : null,
        bedding_notes: currentDayData.beddingUsed || null,
        chemicals_notes: currentDayData.chemicalsUsed || null,
        hen_inspection_am: currentDayData.routineHenEquip1stInitial || null,
        hen_inspection_pm: currentDayData.routineHenEquip2ndInitial || null,
      }], { onConflict: 'welfare_id,record_date' })

      await supabase.from('welfare_weekly_inspections').upsert([{
        welfare_id: welfareId, inspection_date: recordDate,
        check_overall_appearance: currentDayData.overallAppearance,
        check_general_sound: currentDayData.generalSound,
        check_abnormal_behavior: currentDayData.abnormalBehavior,
        check_disease_illness: currentDayData.signsOfDisease,
        check_injured_birds: currentDayData.injuredBirds,
        check_respiratory: currentDayData.respiratoryProblems,
        check_panting_huddling: currentDayData.pantingHuddling,
        check_lameness: currentDayData.lameness,
        check_feather_pecking: currentDayData.featherPecking,
        check_trapped_birds: currentDayData.trappedBirds,
        check_dead_birds: currentDayData.deadBirds,
        check_feed_water_available: currentDayData.feedWaterAvailable,
        check_equipment_operating: currentDayData.equipmentOperating,
        check_amenities_condition: currentDayData.amenitiesCondition,
        check_lay_facility: currentDayData.layFacilityEnvironment,
      }], { onConflict: 'welfare_id,inspection_date' })

      await supabase.from('monthly_audits').update({
        form_08_completed: true, form_08_completed_date: new Date().toISOString(),
      }).eq('id', audit.id)

      Alert.alert('Saved', `Day ${selectedDay} welfare record saved!`)
      setLockedDays(p => ({ ...p, [selectedDay]: true }))
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
      const { record: welfare } = await getOrCreateWelfareRecord(selectedBarn.id, audit.id)
      const welfareId = welfare.id
      const monthFirstDate = monthYear.substring(0, 7) + '-01'

      await supabase.from('welfare_records').update({ monthly_comments: monthlyComments || null }).eq('id', welfareId)

      if (ammoniaRange) {
        await supabase.from('welfare_ammonia_tests').upsert([{
          welfare_id: welfareId, test_date: monthFirstDate, ppm_range: ammoniaRange,
        }], { onConflict: 'welfare_id,test_date' })
      }

      if (alarmCheckDate || generatorCheckDate) {
        // alarm/generator fields live on welfare_weekly_inspections — upsert on month-first-date
        await supabase.from('welfare_weekly_inspections').upsert([{
          welfare_id: welfareId,
          inspection_date: monthFirstDate,
          alarm_check_date: alarmCheckDate || null,
          alarm_check_initials: alarmCheckInitials || null,
          generator_check_date: generatorCheckDate || null,
          generator_check_initials: generatorCheckInitials || null,
        }], { onConflict: 'welfare_id,inspection_date' })
      }

      Alert.alert('Saved', 'Monthly welfare checks saved!')
    } catch (err) {
      Alert.alert('Error', err.message)
    } finally {
      setSaving(false)
    }
  }

  const daysInMonth = new Date(
    parseInt(monthYear.substring(0, 4)),
    parseInt(monthYear.substring(5, 7)),
    0
  ).getDate()

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.formTitle}>Form 08 – Welfare Records</Text>
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
              {mode === 'day' ? 'Day Entry' : 'Monthly Checks'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {viewMode === 'day' ? (
        <View style={styles.section}>
          {/* Day selector */}
          <Text style={styles.sectionHeader}>Select Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.dayBtn, selectedDay === d && styles.dayBtnActive, lockedDays[d] === true && selectedDay !== d && styles.dayBtnSaved]}
                onPress={() => setSelectedDay(d)}
              >
                <Text style={[styles.dayBtnText, selectedDay === d && styles.dayBtnTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {isLocked && (
            <View style={styles.lockedBanner}>
              <Text style={styles.lockedBannerText}>✓ Already recorded for Day {selectedDay}</Text>
              <TouchableOpacity style={styles.redoBtn} onPress={() => setLockedDays(p => ({ ...p, [selectedDay]: false }))}>
                <Text style={styles.redoBtnText}>Redo this day</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionHeader}>Temperatures</Text>
          <LabeledInput label="Barn Temp Hi (°C)" value={currentDayData.barnTempHi} onChangeText={v => setField('barnTempHi', v)} keyboardType="decimal-pad" locked={isLocked} />
          <LabeledInput label="Barn Temp Lo (°C)" value={currentDayData.barnTempLo} onChangeText={v => setField('barnTempLo', v)} keyboardType="decimal-pad" locked={isLocked} />
          <LabeledInput label="Exterior Temp (°C)" value={currentDayData.exteriorTemp} onChangeText={v => setField('exteriorTemp', v)} keyboardType="decimal-pad" locked={isLocked} />

          <Text style={styles.sectionHeader}>Sanitation Checks</Text>
          <SwitchRow label="Floors Checked" value={currentDayData.floorsChecked} onValueChange={v => setField('floorsChecked', v)} locked={isLocked} />
          <SwitchRow label="Walls/Fans/Ceiling Checked" value={currentDayData.wallsFansCeilingChecked} onValueChange={v => setField('wallsFansCeilingChecked', v)} />
          <SwitchRow label="Manure Checked" value={currentDayData.manureChecked} onValueChange={v => setField('manureChecked', v)} />
          <SwitchRow label="Bedding Used" value={currentDayData.beddingUsed} onValueChange={v => setField('beddingUsed', v)} />
          <SwitchRow label="Chemicals Used" value={currentDayData.chemicalsUsed} onValueChange={v => setField('chemicalsUsed', v)} />

          <Text style={styles.sectionHeader}>Weekly Welfare Inspection</Text>
          <LabeledInput label="1st Check Initials" value={currentDayData.routineHenEquip1stInitial} onChangeText={v => setField('routineHenEquip1stInitial', v)} />
          <LabeledInput label="2nd Check Initials" value={currentDayData.routineHenEquip2ndInitial} onChangeText={v => setField('routineHenEquip2ndInitial', v)} />

          <Text style={styles.sectionHeader}>Inspection Criteria</Text>
          {INSPECTION_CHECKS.map(([key, label]) => (
            <SwitchRow key={key} label={label} value={currentDayData[key]} onValueChange={v => setField(key, v)} />
          ))}

          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.buttonDisabled]}
            onPress={handleDaySubmit}
            disabled={saving}
          >
            <Text style={styles.submitBtnText}>{saving ? 'Saving…' : `Save Day ${selectedDay} Record`}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Ammonia Test</Text>
          <LabeledInput label="Ammonia PPM Range" value={ammoniaRange} onChangeText={setAmmoniaRange} />

          <Text style={styles.sectionHeader}>Alarm Check</Text>
          <LabeledInput label="Alarm Check Date (YYYY-MM-DD)" value={alarmCheckDate} onChangeText={setAlarmCheckDate} />
          <LabeledInput label="Alarm Check Initials" value={alarmCheckInitials} onChangeText={setAlarmCheckInitials} />

          <Text style={styles.sectionHeader}>Generator Check</Text>
          <LabeledInput label="Generator Check Date (YYYY-MM-DD)" value={generatorCheckDate} onChangeText={setGeneratorCheckDate} />
          <LabeledInput label="Generator Check Initials" value={generatorCheckInitials} onChangeText={setGeneratorCheckInitials} />

          <Text style={styles.sectionHeader}>Monthly Comments</Text>
          <LabeledInput label="Comments" value={monthlyComments} onChangeText={setMonthlyComments} />

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
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 2, borderColor: '#28a745', alignItems: 'center' },
  tabActive: { backgroundColor: '#28a745' },
  tabText: { color: '#28a745', fontWeight: '600', fontSize: 15 },
  tabTextActive: { color: 'white' },
  section: { paddingHorizontal: 16 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 6 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 11, fontSize: 15, color: '#000', backgroundColor: 'white' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  switchLabel: { fontSize: 14, color: '#333', flex: 1, marginRight: 8 },
  dayBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  dayBtnActive: { backgroundColor: '#0066cc', borderColor: '#0066cc' },
  dayBtnText: { fontSize: 13, color: '#333', fontWeight: '600' },
  dayBtnTextActive: { color: 'white' },
  submitBtn: { backgroundColor: '#0066cc', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { backgroundColor: '#aaa' },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  inputLocked: { backgroundColor: '#f0f0f0', borderColor: '#ddd', color: '#888' },
  rowLocked: { opacity: 0.6 },
  dayBtnSaved: { borderColor: '#28a745', borderWidth: 2 },
  lockedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#d4edda', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#28a745' },
  lockedBannerText: { color: '#155724', fontWeight: '600', fontSize: 13, flex: 1 },
  redoBtn: { backgroundColor: '#0066cc', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 7 },
  redoBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
})
