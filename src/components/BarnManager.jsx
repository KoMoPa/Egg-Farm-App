import { useState, useEffect } from 'react'
import { getFarmBarns, createBarn } from '../utils/farmBarnOps'
import { useFarmContext } from '../contexts/FarmContext'

export default function BarnManager() {
  const { farm, barns, selectedBarn, setSelectedBarn, setBarns } = useFarmContext()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showBarnSelector, setShowBarnSelector] = useState(!selectedBarn)
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
      // Auto-select the newly created barn and collapse selector
      setSelectedBarn(newBarn)
      setShowBarnSelector(false)
      alert(`✅ Barn "${newBarnName}" created successfully!`)
    } catch (err) {
      alert('Error creating barn: ' + err.message)
      console.error(err)
    }
  }

  const handleSelectBarn = (barn) => {
    setSelectedBarn(barn)
    setShowBarnSelector(false)
  }

  // When selectedBarn changes, collapse the selector
  useEffect(() => {
    if (selectedBarn) {
      setShowBarnSelector(false)
    } else {
      setShowBarnSelector(true)
    }
  }, [selectedBarn])

  return (
    <div className="barn-manager">
      {/* Collapsed View - When Barn is Selected */}
      {selectedBarn && !showBarnSelector && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: '#f0f7ff',
          borderRadius: '8px',
          border: '1px solid #d0e8ff',
          marginBottom: '20px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>
              CURRENT BARN
            </div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0066cc' }}>
              {selectedBarn.barn_name} (#{selectedBarn.barn_number})
            </div>
          </div>
          <button
            onClick={() => setShowBarnSelector(true)}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Change Barn
          </button>
        </div>
      )}

      {/* Expanded View - Barn Selector */}
      {showBarnSelector && (
        <>
          {/* Farm Info Header */}
          <div className="barn-manager-header">
            <h2 className="barn-manager-title">
              {farm?.farm_name || 'Farm'}
            </h2>
            <p className="barn-manager-subtitle">
              Select a barn or create a new one
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
                  onClick={() => handleSelectBarn(barn)}
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

          {/* Close Selector Button */}
          <button
            onClick={() => setShowBarnSelector(false)}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Close
          </button>
        </>
      )}
    </div>
  )
}
