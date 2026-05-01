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
    <div className="barn-manager">
      {/* Farm Info Header */}
      <div className="barn-manager-header">
        <h2 className="barn-manager-title">
          {farm?.farm_name || 'Farm'}
        </h2>
        <p className="barn-manager-subtitle">
          Manage barns for your farm
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="barn-manager-error">
          {error}
        </div>
      )}

      {/* Barns List */}
      {loading ? (
        <p className="barn-manager-loading">Loading barns...</p>
      ) : barns.length === 0 ? (
        <p className="barn-manager-empty">
          No barns yet. Create one to get started!
        </p>
      ) : (
        <div className="barn-selector-grid">
          {barns.map((barn) => (
            <div
              key={barn.id}
              onClick={() => setSelectedBarn(barn)}
              className={`barn-selector-card ${selectedBarn?.id === barn.id ? 'barn-selector-card--selected' : ''}`}
            >
              <div className="barn-selector-card-name">
                {selectedBarn?.id === barn.id ? '✓ ' : ''}
                {barn.barn_name}
              </div>
              <div className="barn-selector-card-number">
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
          className="barn-manager-add-btn"
        >
          ➕ Add New Barn
        </button>
      ) : (
        <form onSubmit={handleAddBarn} className="barn-manager-form">
          <div className="barn-manager-form-inputs">
            <input
              type="text"
              placeholder="Barn Name (e.g., Main Barn)"
              value={newBarnName}
              onChange={(e) => setNewBarnName(e.target.value)}
              className="barn-manager-input"
              autoFocus
            />
            <input
              type="text"
              placeholder="Barn Number (e.g., 1, A, West)"
              value={newBarnNumber}
              onChange={(e) => setNewBarnNumber(e.target.value)}
              className="barn-manager-input"
            />
          </div>
          <div className="barn-manager-form-buttons">
            <button
              type="submit"
              className="barn-manager-form-submit"
            >
              Create Barn
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="barn-manager-form-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
