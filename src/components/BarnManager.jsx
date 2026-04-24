import { useState, useEffect } from 'react'
import { getFarmBarns, createBarn } from '../utils/farmBarnOps'
import { useFarmContext } from '../contexts/FarmContext'

export default function BarnManager() {
  const { farm, barns, selectedBarn, setSelectedBarn, setBarns } = useFarmContext()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBarnName, setNewBarnName] = useState('')
  const [newBarnNumber, setNewBarnNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAddBarn = async (e) => {
    e.preventDefault()
    if (!newBarnName.trim() || !newBarnNumber.trim()) {
      alert('Please enter barn name and number')
      return
    }

    try {
      const newBarn = await createBarn(farm.id, newBarnName, newBarnNumber)
      setBarns([...barns, newBarn])
      setNewBarnName('')
      setNewBarnNumber('')
      setShowAddForm(false)
      // Auto-select the newly created barn
      setSelectedBarn(newBarn)
      alert(`✅ Barn "${newBarnName}" created successfully!`)
    } catch (err) {
      alert('Error creating barn: ' + err.message)
      console.error(err)
    }
  }

  return (
    <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '30px', border: '2px solid #ddd' }}>
      {/* Farm Info Header */}
      <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #0066cc' }}>
        <h2 style={{ fontSize: '22px', margin: '0 0 5px 0', color: '#0066cc' }}>
          {farm?.farm_name || 'Farm'}
        </h2>
        <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
          Manage barns for your farm
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      {/* Barns List */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Loading barns...</p>
      ) : barns.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', fontSize: '16px', padding: '20px' }}>
          No barns yet. Create one to get started!
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          {barns.map((barn) => (
            <div
              key={barn.id}
              onClick={() => setSelectedBarn(barn)}
              style={{
                padding: '15px',
                border: selectedBarn?.id === barn.id ? '3px solid #28a745' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedBarn?.id === barn.id ? '#d4edda' : '#f9f9f9',
                transition: 'all 0.3s ease',
                boxShadow: selectedBarn?.id === barn.id ? '0 2px 8px rgba(40,167,69,0.3)' : 'none'
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                {selectedBarn?.id === barn.id ? '✓ ' : ''}
                {barn.barn_name}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Barn #{barn.barn_number}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Barn Button / Form */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ➕ Add New Barn
        </button>
      ) : (
        <form onSubmit={handleAddBarn} style={{ background: '#f0f8ff', padding: '15px', borderRadius: '8px', border: '1px solid #0066cc' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Barn Name (e.g., Main Barn)"
              value={newBarnName}
              onChange={(e) => setNewBarnName(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
              autoFocus
            />
            <input
              type="text"
              placeholder="Barn Number (e.g., 1, A, West)"
              value={newBarnNumber}
              onChange={(e) => setNewBarnNumber(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="submit"
              style={{
                padding: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Create Barn
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
