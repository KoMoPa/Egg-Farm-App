import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert
} from 'react-native'
import { useFarmContext } from '../contexts/FarmContext'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreatePestControlRecord } from '../utils/farmBarnOps'

const BLANK_DAY = {
  liveTrapsFindings: '', liveTrapsLocation: '',
  baitProduct: '', baitLocation: '',
  birdsOnRange: '', correctiveActions: '',
  frequencyWeekly: '', frequencyMonthly: '',
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

function SegmentedField({ label, value, onChange, options, locked = false }) {
  return (
    <View style={[styles.field, locked && styles.rowLocked]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segmented}>
        {options.map(([val, lbl]) => (
          <TouchableOpacity
            key={val}
            style={[styles.segBtn, value === val && styles.segBtnActive]}
            onPress={() => !locked && onChange(val)}
            disabled={locked}
          >
            <Text style={[styles.segBtnText, value === val && styles.segBtnTextActive]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

export default function Form10Screen() {
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
        const { data: pcr } = await supabase.from('pest_control_records').select('id')
          .eq('barn_id', selectedBarn.id).eq('audit_id', audit.id).maybeSingle()
        if (!pcr || cancelled) { setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_DAY } })); setLockedDays(p => ({ ...p, [selectedDay]: false })); return }
        const { data: pdo } = await supabase.from('pest_daily_observations').select('*')
          .eq('pest_id', pcr.id).eq('record_date', recordDate).maybeSingle()
        if (!pdo || cancelled) { setDayData(p => ({ ...p, [selectedDay]: { ...BLANK_DAY } })); setLockedDays(p => ({ ...p, [selectedDay]: false })); return }
        setDayData(p => ({
          ...p,
          [selectedDay]: {
            liveTrapsFindings: pdo.trap_findings_notes || '',
            liveTrapsLocation: pdo.trap_location || '',
            baitProduct: pdo.bait_product || '',
            baitLocation: pdo.bait_location || '',
            birdsOnRange: pdo.birds_on_range || '',
            correctiveActions: pdo.corrective_actions || '',
            frequencyWeekly: pdo.traps_checked ? 'checked' : '',
            frequencyMonthly: '',
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
      const { record: pestControl } = await getOrCreatePestControlRecord(selectedBarn.id, audit.id)
      const pestControlId = pestControl.id
      const monthPrefix = monthYear.substring(0, 7)
      const recordDate = `${monthPrefix}-${String(selectedDay).padStart(2, '0')}`

      const { error } = await supabase.from('pest_daily_observations').upsert([{
        pest_id: pestControlId,
        record_date: recordDate,
        trap_findings_notes: currentDayData.liveTrapsFindings || null,
        trap_location: currentDayData.liveTrapsLocation || null,
        bait_product: currentDayData.baitProduct || null,
        bait_location: currentDayData.baitLocation || null,
        birds_on_range: currentDayData.birdsOnRange || null,
        corrective_actions: currentDayData.correctiveActions || null,
        traps_checked: currentDayData.frequencyWeekly === 'checked' ? 1 : null,
      }], { onConflict: 'pest_id,record_date' })
      if (error) throw error

      await supabase.from('monthly_audits').update({
        form_10_completed: true, form_10_completed_date: new Date().toISOString(),
      }).eq('id', audit.id)

      Alert.alert('Saved', `Day ${selectedDay} pest control record saved!`)
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
        <Text style={styles.formTitle}>Form 10 – Pest Control Records</Text>
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

        <Text style={styles.sectionHeader}>Live Traps</Text>
        <LabeledInput label="Findings" value={currentDayData.liveTrapsFindings} onChangeText={v => setField('liveTrapsFindings', v)} locked={isLocked} />
        <LabeledInput label="Location" value={currentDayData.liveTrapsLocation} onChangeText={v => setField('liveTrapsLocation', v)} locked={isLocked} />

        <Text style={styles.sectionHeader}>Bait Stations</Text>
        <LabeledInput label="Product" value={currentDayData.baitProduct} onChangeText={v => setField('baitProduct', v)} locked={isLocked} />
        <LabeledInput label="Location" value={currentDayData.baitLocation} onChangeText={v => setField('baitLocation', v)} locked={isLocked} />

        <Text style={styles.sectionHeader}>Range & Actions</Text>
        <SegmentedField
          label="Birds on Range?"
          value={currentDayData.birdsOnRange}
          onChange={v => setField('birdsOnRange', v)}
          options={[['', 'N/A'], ['yes', 'Yes'], ['no', 'No']]}
          locked={isLocked}
        />
        <LabeledInput label="Corrective Actions" value={currentDayData.correctiveActions} onChangeText={v => setField('correctiveActions', v)} locked={isLocked} />

        <Text style={styles.sectionHeader}>Inspection Frequency</Text>
        <SegmentedField
          label="At Least Weekly"
          value={currentDayData.frequencyWeekly}
          onChange={v => setField('frequencyWeekly', v)}
          options={[['', 'N/A'], ['checked', 'Checked'], ['not-checked', 'Not Checked']]}
          locked={isLocked}
        />
        <SegmentedField
          label="At Least Monthly"
          value={currentDayData.frequencyMonthly}
          onChange={v => setField('frequencyMonthly', v)}
          options={[['', 'N/A'], ['checked', 'Checked'], ['not-checked', 'Not Checked']]}
          locked={isLocked}
        />

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
