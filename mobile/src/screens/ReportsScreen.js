import React, { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, FlatList, TextInput,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { useFarmContext } from '../contexts/FarmContext'
import { useSupabase } from '../contexts/SupabaseContext'

function FormBadge({ completed, formName }) {
  return (
    <View style={[styles.badge, completed ? styles.badgeComplete : styles.badgePending]}>
      <Text style={[styles.badgeText, completed ? styles.badgeTextComplete : styles.badgeTextPending]}>
        {formName}: {completed ? '✓ Done' : 'Pending'}
      </Text>
    </View>
  )
}

function AuditCard({ audit, farmName, onExportPDF, exporting }) {
  const date = new Date(audit.month_year + 'T00:00:00')
  const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

  return (
    <View style={styles.auditCard}>
      <View style={styles.auditCardHeader}>
        <Text style={styles.auditMonth}>{monthLabel}</Text>
        <TouchableOpacity
          style={styles.pdfButton}
          onPress={() => onExportPDF(audit)}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.pdfButtonText}>⬇ PDF</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.badgeRow}>
        <FormBadge completed={audit.form_07_completed} formName="Form 07" />
        <FormBadge completed={audit.form_08_completed} formName="Form 08" />
        <FormBadge completed={audit.form_09_completed} formName="Form 09" />
        <FormBadge completed={audit.form_10_completed} formName="Form 10" />
      </View>
      {audit.form_07_completed_date && (
        <Text style={styles.completedDate}>
          Form 07 completed: {new Date(audit.form_07_completed_date).toLocaleDateString()}
        </Text>
      )}
    </View>
  )
}

function buildAuditHTML(audit, farmName) {
  const date = new Date(audit.month_year + 'T00:00:00')
  const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  const forms = [
    { name: 'Form 07 – Daily Production', completed: audit.form_07_completed, date: audit.form_07_completed_date },
    { name: 'Form 08 – Welfare Records', completed: audit.form_08_completed, date: audit.form_08_completed_date },
    { name: 'Form 09 – Feed & Water', completed: audit.form_09_completed, date: audit.form_09_completed_date },
    { name: 'Form 10 – Pest Control', completed: audit.form_10_completed, date: audit.form_10_completed_date },
  ]
  const completedCount = forms.filter(f => f.completed).length
  const progressPct = Math.round((completedCount / 4) * 100)

  const formRows = forms.map(f => `
    <tr>
      <td>${f.name}</td>
      <td style="text-align:center; color:${f.completed ? '#155724' : '#856404'}; font-weight:bold;">
        ${f.completed ? '✓ Completed' : 'Pending'}
      </td>
      <td style="text-align:center; color:#666;">
        ${f.date ? new Date(f.date).toLocaleDateString() : '—'}
      </td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        h1 { color: #0066cc; font-size: 22px; margin-bottom: 4px; }
        h2 { font-size: 16px; color: #555; margin-top: 0; margin-bottom: 24px; }
        .progress-bar { background: #e9ecef; border-radius: 6px; height: 16px; margin-bottom: 8px; overflow: hidden; }
        .progress-fill { background: #28a745; height: 100%; width: ${progressPct}%; }
        .progress-label { font-size: 13px; color: #666; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #0066cc; color: white; padding: 10px 14px; text-align: left; font-size: 14px; }
        td { padding: 10px 14px; border-bottom: 1px solid #eee; font-size: 14px; }
        tr:nth-child(even) td { background: #f8f9fa; }
        .footer { margin-top: 40px; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
      </style>
    </head>
    <body>
      <h1>Monthly Audit Report</h1>
      <h2>${farmName} &mdash; ${monthLabel}</h2>
      <div class="progress-bar"><div class="progress-fill"></div></div>
      <div class="progress-label">${completedCount} / 4 forms completed (${progressPct}%)</div>
      <table>
        <thead>
          <tr><th>Form</th><th style="text-align:center;">Status</th><th style="text-align:center;">Completion Date</th></tr>
        </thead>
        <tbody>${formRows}</tbody>
      </table>
      <div class="footer">Generated ${new Date().toLocaleString()} &bull; Egg Farm Compliance App</div>
    </body>
    </html>
  `
}

export default function ReportsScreen() {
  const supabase = useSupabase()
  const { farm } = useFarmContext()
  const [audits, setAudits] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [exportingId, setExportingId] = useState(null)

  useEffect(() => {
    if (!farm?.id) return
    const fetchAudits = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('monthly_audits')
          .select('*')
          .eq('farm_id', farm.id)
          .order('month_year', { ascending: false })

        if (error) throw error
        setAudits(data || [])
        setFiltered(data || [])
      } catch (err) {
        console.error('Error fetching audits:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAudits()
  }, [farm?.id])

  const handleSearch = (text) => {
    setSearch(text)
    if (!text) {
      setFiltered(audits)
    } else {
      setFiltered(audits.filter(a => a.month_year.includes(text)))
    }
  }

  const handleExportPDF = async (audit) => {
    setExportingId(audit.id)
    try {
      const html = buildAuditHTML(audit, farm?.farm_name || 'Farm')
      const { uri } = await Print.printToFileAsync({ html, base64: false })
      const canShare = await Sharing.isAvailableAsync()
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export Audit Report' })
      } else {
        Alert.alert('PDF Saved', `PDF saved to:\n${uri}`)
      }
    } catch (err) {
      Alert.alert('Error', 'Could not generate PDF: ' + err.message)
    } finally {
      setExportingId(null)
    }
  }

  const completedCount = (audit) =>
    [audit.form_07_completed, audit.form_08_completed, audit.form_09_completed, audit.form_10_completed]
      .filter(Boolean).length

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading reports…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={handleSearch}
          placeholder="Search by month (e.g. 2026-03)"
          placeholderTextColor="#aaa"
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No audit records found.</Text>
          <Text style={styles.emptySubText}>Records appear here after you submit any form for a month.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id?.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View>
              <AuditCard
                audit={item}
                farmName={farm?.farm_name || 'Farm'}
                onExportPDF={handleExportPDF}
                exporting={exportingId === item.id}
              />
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(completedCount(item) / 4) * 100}%` }]} />
              </View>
              <Text style={styles.progressLabel}>{completedCount(item)}/4 forms completed</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#666' },
  searchBar: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 15, color: '#000', backgroundColor: '#fafafa' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#888', textAlign: 'center' },
  auditCard: {
    backgroundColor: 'white', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  auditCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  auditMonth: { fontSize: 18, fontWeight: 'bold', color: '#0066cc', flex: 1 },
  pdfButton: {
    backgroundColor: '#0066cc', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 8, minWidth: 72, alignItems: 'center',
  },
  pdfButtonText: { color: 'white', fontWeight: '600', fontSize: 13 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  badgeComplete: { backgroundColor: '#d4edda', borderColor: '#28a745' },
  badgePending: { backgroundColor: '#fff3cd', borderColor: '#ffc107' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextComplete: { color: '#155724' },
  badgeTextPending: { color: '#856404' },
  completedDate: { fontSize: 11, color: '#999', marginTop: 8 },
  progressBar: { height: 6, backgroundColor: '#e9ecef', borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#28a745', borderRadius: 3 },
  progressLabel: { fontSize: 12, color: '#666', marginTop: 4, marginBottom: 2 },
})
