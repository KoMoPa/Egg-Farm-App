import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Switch
} from 'react-native'
import { useFarmContext } from '../contexts/FarmContext'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreateFeedWaterRecord } from '../utils/farmBarnOps'

const BLANK_DAY = {
  feedDaily: '', feedActual: '',
  waterDaily: '', waterActual: '',
  augerRunTimeMinutes: '',
  flush: false, medsVit: false, treatment: false,
  mortalityDaily: '', mortalityReason: '',
  mortalityNotes: '',
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

export default function Form09Screen() {
  const supabase = useSupabase()
  const { farm, selectedBarn, monthYear } = useFarmContext()
  const [selectedDay, setSelectedDay] = useState(1)
  const [dayData, setDayData] = useState({})
  const [lockedDays, setLockedDays] = useState({})
  const [loadingDay, setLoadingDay] = useState(false)
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
        if (!audit || cancelled) { setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_DAY } })); setLockedDays(p => ({ ...p, [selectedDay]: false })); return }
        const { data: fwr } = await supabase.from('feed_water_records').select('id')
          .eq('barn_id', selectedBarn.id).eq('audit_id', audit.id).maybeSingle()
        if (!fwr || cancelled) { setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_DAY } })); setLockedDays(p => ({ ...p, [selectedDay]: false })); return }
        const { data: fwd } = await supabase.from('feed_water_daily').select('*')
          .eq('fw_id', fwr.id).eq('record_date', recordDate).maybeSingle()
        if (!fwd || cancelled) { setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_DAY } })); setLockedDays(p => ({ ...p, [selectedDay]: false })); return }
        const { data: fwh } = await supabase.from('feed_water_health').select('*')
          .eq('fw_id', fwr.id).eq('record_date', recordDate).maybeSingle()
        if (cancelled) return
        setDayData(p => ({
          ...p,
          [selectedDay]: {
            feedDaily: fwd.feed_daily?.toString() || '',
            feedActual: fwd.feed_actual?.toString() || '',
            waterDaily: fwd.water_daily?.toString() || '',
            waterActual: fwd.water_actual?.toString() || '',
            augerRunTimeMinutes: fwd.auger_run_time_minutes?.toString() || '',
            flush: !!fwd.flush_notes,
            medsVit: !!fwd.meds_vit_notes,
            treatment: !!fwd.treatment_notes,
            mortalityDaily: fwh?.mortality_daily?.toString() || '',
            mortalityReason: fwh?.mortality_reason || '',
            mortalityNotes: fwh?.hospital_pen_monitoring || '',
          },
        }))
        setLockedDays(p => ({ ...p, [selectedDay]: true }))
      } catch (e) {
        if (!cancelled) { console.error('Error loading day:', e); setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_DAY } })); setLockedDays(p => ({ ...p, [selectedDay]: false })) }
      } finally {
        if (!cancelled) setLoadingDay(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [selectedDay, selectedBarn?.id, monthYear])

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

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
      const { record: feedWater } = await getOrCreateFeedWaterRecord(selectedBarn.id, audit.id)
      const feedWaterId = feedWater.id
      const monthPrefix = monthYear.substring(0, 7)
      const recordDate = `${monthPrefix}-${String(selectedDay).padStart(2, '0')}`

      const { error: feedError } = await supabase.from('feed_water_daily').upsert([{
        fw_id: feedWaterId, record_date: recordDate,
        feed_daily: currentDayData.feedDaily ? parseFloat(currentDayData.feedDaily) : null,
        feed_actual: currentDayData.feedActual ? parseFloat(currentDayData.feedActual) : null,
        water_daily: currentDayData.waterDaily ? parseFloat(currentDayData.waterDaily) : null,
        water_actual: currentDayData.waterActual ? parseFloat(currentDayData.waterActual) : null,
        auger_run_time_minutes: currentDayData.augerRunTimeMinutes ? parseInt(currentDayData.augerRunTimeMinutes) : null,
        flush_notes: currentDayData.flush ? 'Yes' : null,
        meds_vit_notes: currentDayData.medsVit ? 'Yes' : null,
        treatment_notes: currentDayData.treatment ? 'Yes' : null,
      }], { onConflict: 'fw_id,record_date' })
      if (feedError) throw feedError

      if (currentDayData.mortalityDaily) {
        const { error: mortError } = await supabase.from('feed_water_health').upsert([{
          fw_id: feedWaterId, record_date: recordDate,
          mortality_daily: parseInt(currentDayData.mortalityDaily) || 0,
          mortality_reason: currentDayData.mortalityReason || null,
          hospital_pen_monitoring: currentDayData.mortalityNotes || null,
        }], { onConflict: 'fw_id,record_date' })
        if (mortError) throw mortError
      }

      await supabase.from('monthly_audits').update({
        form_09_completed: true, form_09_completed_date: new Date().toISOString(),
      }).eq('id', audit.id)

      Alert.alert('Saved', `Day ${selectedDay} feed/water record saved!`)
      setLockedDays(p => ({ ...p, [selectedDay]: true }))
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
        <Text style={styles.formTitle}>Form 09 – Feed & Water Records</Text>
        <Text style={styles.formMeta}>
          {farm?.farm_name} · {selectedBarn?.barn_name} · {monthYear.substring(0, 7)}
        </Text>
      </View>

      <View style={styles.section}>
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

        <Text style={styles.sectionHeader}>Feed Consumption</Text>
        <LabeledInput label="Feed Daily Target" value={currentDayData.feedDaily} onChangeText={v => setField('feedDaily', v)} keyboardType="decimal-pad" locked={isLocked} />
        <LabeledInput label="Feed Actual" value={currentDayData.feedActual} onChangeText={v => setField('feedActual', v)} keyboardType="decimal-pad" locked={isLocked} />

        <Text style={styles.sectionHeader}>Water Consumption</Text>
        <LabeledInput label="Water Daily Target" value={currentDayData.waterDaily} onChangeText={v => setField('waterDaily', v)} keyboardType="decimal-pad" locked={isLocked} />
        <LabeledInput label="Water Actual" value={currentDayData.waterActual} onChangeText={v => setField('waterActual', v)} keyboardType="decimal-pad" locked={isLocked} />
        <LabeledInput label="Auger Run Time (minutes)" value={currentDayData.augerRunTimeMinutes} onChangeText={v => setField('augerRunTimeMinutes', v)} keyboardType="numeric" locked={isLocked} />

        <Text style={styles.sectionHeader}>Water Treatments</Text>
        <SwitchRow label="Flush" value={currentDayData.flush} onValueChange={v => setField('flush', v)} locked={isLocked} />
        <SwitchRow label="Meds/Vit" value={currentDayData.medsVit} onValueChange={v => setField('medsVit', v)} locked={isLocked} />
        <SwitchRow label="Treatment" value={currentDayData.treatment} onValueChange={v => setField('treatment', v)} locked={isLocked} />

        <Text style={styles.sectionHeader}>Mortality Records</Text>
        <LabeledInput label="Daily Mortality Count" value={currentDayData.mortalityDaily} onChangeText={v => setField('mortalityDaily', v)} keyboardType="numeric" locked={isLocked} />

        <View style={[styles.field, isLocked && styles.rowLocked]}>
          <Text style={styles.label}>Mortality Reason</Text>
          <View style={styles.segmented}>
            {[['', 'None'], ['natural', 'Natural'], ['euthanized', 'Euthanized']].map(([val, lbl]) => (
              <TouchableOpacity
                key={val}
                style={[styles.segBtn, currentDayData.mortalityReason === val && styles.segBtnActive]}
                onPress={() => !isLocked && setField('mortalityReason', val)}
                disabled={isLocked}
              >
                <Text style={[styles.segBtnText, currentDayData.mortalityReason === val && styles.segBtnTextActive]}>{lbl}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <LabeledInput label="Notes" value={currentDayData.mortalityNotes} onChangeText={v => setField('mortalityNotes', v)} locked={isLocked} />

        {!isLocked && (
          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            <Text style={styles.submitBtnText}>{saving ? 'Saving…' : `Save Day ${selectedDay} Record`}</Text>
          </TouchableOpacity>
        )}
      </View>
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
  segmented: { flexDirection: 'row', gap: 8 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', backgroundColor: 'white' },
  segBtnActive: { backgroundColor: '#0066cc', borderColor: '#0066cc' },
  segBtnText: { fontSize: 13, color: '#555', fontWeight: '600' },
  segBtnTextActive: { color: 'white' },
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
