import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, FlatList, TextInput,
  StyleSheet, Alert, Modal, ActivityIndicator
} from 'react-native'
import { useFarmContext } from '../contexts/FarmContext'
import { createBarn } from '../utils/farmBarnOps'
import { useAuth } from '../contexts/AuthContext'

export default function HomeScreen() {
  const { user, signOut } = useAuth()
  const { farm, barns, selectedBarn, setSelectedBarn, setBarns, loading, error, monthYear, setMonthYear } = useFarmContext()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBarnName, setNewBarnName] = useState('')
  const [newBarnNumber, setNewBarnNumber] = useState('')
  const [adding, setAdding] = useState(false)

  // Month picker state
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const monthYearDisplay = monthYear.substring(0, 7)

  const handleAddBarn = async () => {
    if (!newBarnName.trim() || !newBarnNumber.trim()) {
      Alert.alert('Error', 'Please enter barn name and number')
      return
    }
    setAdding(true)
    try {
      const newBarn = await createBarn(farm.id, newBarnName.trim(), newBarnNumber.trim())
      setBarns([...barns, newBarn])
      setSelectedBarn(newBarn)
      setNewBarnName('')
      setNewBarnNumber('')
      setShowAddModal(false)
      Alert.alert('Success', `Barn "${newBarn.barn_name}" created!`)
    } catch (err) {
      Alert.alert('Error', err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleMonthChange = (direction) => {
    const d = new Date(monthYear)
    d.setMonth(d.getMonth() + direction)
    setMonthYear(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`)
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading farm data…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Farm Header */}
      <View style={styles.farmHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.farmName}>{farm?.farm_name || 'My Farm'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Month Selector */}
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={() => handleMonthChange(-1)} style={styles.monthArrow}>
          <Text style={styles.monthArrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthYearDisplay}</Text>
        <TouchableOpacity onPress={() => handleMonthChange(1)} style={styles.monthArrow}>
          <Text style={styles.monthArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Barns */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Select a Barn</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Barn</Text>
        </TouchableOpacity>
      </View>

      {barns.length === 0 ? (
        <Text style={styles.emptyText}>No barns yet. Add one to get started!</Text>
      ) : (
        <FlatList
          data={barns}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.barnRow}
          renderItem={({ item }) => {
            const selected = selectedBarn?.id === item.id
            return (
              <TouchableOpacity
                style={[styles.barnCard, selected && styles.barnCardSelected]}
                onPress={() => setSelectedBarn(item)}
              >
                <Text style={[styles.barnCardTitle, selected && styles.barnCardTitleSelected]}>
                  {selected ? '✓ ' : ''}{item.barn_name}
                </Text>
                <Text style={[styles.barnCardSub, selected && { color: '#155724' }]}>
                  #{item.barn_number}
                </Text>
              </TouchableOpacity>
            )
          }}
        />
      )}

      {/* Add Barn Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New Barn</Text>

            <Text style={styles.label}>Barn Name</Text>
            <TextInput
              style={styles.input}
              value={newBarnName}
              onChangeText={setNewBarnName}
              placeholder="e.g. Main Barn"
              placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>Barn Number</Text>
            <TextInput
              style={styles.input}
              value={newBarnNumber}
              onChangeText={setNewBarnNumber}
              placeholder="e.g. 1"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => { setShowAddModal(false); setNewBarnName(''); setNewBarnNumber('') }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn, adding && styles.buttonDisabled]}
                onPress={handleAddBarn}
                disabled={adding}
              >
                <Text style={styles.saveBtnText}>{adding ? 'Saving…' : 'Add Barn'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 16 },
  farmHeader: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 10, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  farmName: { fontSize: 20, fontWeight: 'bold', color: '#0066cc' },
  userEmail: { fontSize: 12, color: '#888', marginTop: 2 },
  logoutBtn: { backgroundColor: '#dc3545', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  logoutText: { color: 'white', fontSize: 13, fontWeight: '600' },
  monthRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'white', borderRadius: 10, padding: 12, marginBottom: 12,
  },
  monthArrow: { paddingHorizontal: 20 },
  monthArrowText: { fontSize: 28, color: '#0066cc', fontWeight: 'bold' },
  monthLabel: { fontSize: 18, fontWeight: '600', color: '#333' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  addBtn: { backgroundColor: '#0066cc', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6 },
  addBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
  barnRow: { justifyContent: 'space-between', marginBottom: 10 },
  barnCard: {
    flex: 1, backgroundColor: 'white', borderRadius: 10, padding: 16,
    marginHorizontal: 4, borderWidth: 2, borderColor: '#ddd',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  barnCardSelected: { borderColor: '#28a745', backgroundColor: '#d4edda' },
  barnCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  barnCardTitleSelected: { color: '#155724' },
  barnCardSub: { fontSize: 13, color: '#666', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 15, padding: 30 },
  errorText: { color: '#dc3545', marginBottom: 10, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: 'white', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, fontSize: 16, marginBottom: 16, color: '#000', backgroundColor: '#fafafa',
  },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { borderWidth: 1, borderColor: '#ccc' },
  cancelBtnText: { color: '#666', fontSize: 15, fontWeight: '600' },
  saveBtn: { backgroundColor: '#0066cc' },
  saveBtnText: { color: 'white', fontSize: 15, fontWeight: '600' },
  buttonDisabled: { backgroundColor: '#aaa' },
})
