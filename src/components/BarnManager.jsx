import { useState, useEffect } from 'react'
import { getFarmBarns, createBarn } from '../utils/farmBarnOps'
import { useSupabase } from '../contexts/SupabaseContext'
import { useFarmContext } from '../contexts/FarmContext'

export default function BarnManager() {
  const supabase = useSupabase()
  const { farm, barns, selectedBarn, setSelectedBarn, setBarns } = useFarmContext()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showBarnSelector, setShowBarnSelector] = useState(!selectedBarn)
  const [newBarnName, setNewBarnName] = useState('')
  const [newHasFloorEggs, setNewHasFloorEggs] = useState(false)
  const [newTwoCollections, setNewTwoCollections] = useState(false)
  const [newHasBedding, setNewHasBedding] = useState(false)
  const [newHasChemicals, setNewHasChemicals] = useState(false)
  const [editingBarn, setEditingBarn] = useState(null)
  const [editName, setEditName] = useState('')
  const [editHasFloorEggs, setEditHasFloorEggs] = useState(false)
  const [editTwoCollections, setEditTwoCollections] = useState(false)
  const [editHasBedding, setEditHasBedding] = useState(false)
  const [editHasChemicals, setEditHasChemicals] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAddBarn = async (e) => {
    e.preventDefault()
    if (!newBarnName.trim()) {
      alert('Please enter a barn name')
      return
    }

    try {
      const newBarn = await createBarn(farm.id, newBarnName, {
        has_floor_eggs: newHasFloorEggs,
        two_collections_per_day: newTwoCollections,
        has_bedding: newHasBedding,
        has_chemicals: newHasChemicals,
      })
      setBarns([...barns, newBarn])
      setNewBarnName('')
      setNewHasFloorEggs(false)
      setNewTwoCollections(false)
      setNewHasBedding(false)
      setNewHasChemicals(false)
      setShowAddForm(false)
      setSelectedBarn(newBarn)
      setShowBarnSelector(false)
      alert(`✅ Barn "${newBarnName}" created successfully!`)
    } catch (err) {
      alert('Error creating barn: ' + err.message)
      console.error(err)
    }
  }

  const handleEditBarn = (barn, e) => {
    e.stopPropagation()
    setEditingBarn(barn)
    setEditName(barn.barn_name)
    setEditHasFloorEggs(barn.has_floor_eggs ?? false)
    setEditTwoCollections(barn.two_collections_per_day ?? false)
    setEditHasBedding(barn.has_bedding ?? false)
    setEditHasChemicals(barn.has_chemicals ?? false)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editName.trim()) return
    try {
      const { data: updated, error } = await supabase
        .from('barns')
        .update({
          barn_name: editName,
          has_floor_eggs: editHasFloorEggs,
          two_collections_per_day: editTwoCollections,
          has_bedding: editHasBedding,
          has_chemicals: editHasChemicals,
        })
        .eq('id', editingBarn.id)
        .select()
        .single()
      if (error) throw error
      setBarns(barns.map(b => b.id === updated.id ? updated : b))
      if (selectedBarn?.id === updated.id) setSelectedBarn(updated)
      setEditingBarn(null)
    } catch (err) {
      alert('Error updating barn: ' + err.message)
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
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2D855B' }}>
              {selectedBarn.barn_name}
            </div>
          </div>
          <button
            onClick={() => setShowBarnSelector(true)}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: '#2D855B',
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
                  style={{ position: 'relative' }}
                >
                  <div className="barn-selector-card-name">
                    {selectedBarn?.id === barn.id ? '✓ ' : ''}
                    {barn.barn_name}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleEditBarn(barn, e)}
                    style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '11px', padding: '3px 8px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Edit Barn
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Barn Button / Form */}
          {farm && (!showAddForm ? (
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
                  placeholder="Barn Name (e.g., Barn 1, Main Barn)"
                  value={newBarnName}
                  onChange={(e) => setNewBarnName(e.target.value)}
                  className="barn-manager-input"
                  maxLength={35}
                  autoFocus
                />
                {newBarnName.length > 28 && (
                  <div style={{ fontSize: '12px', color: newBarnName.length === 35 ? '#dc3545' : '#fd7e14' }}>
                    {newBarnName.length}/35 characters{newBarnName.length === 35 ? ' — limit reached' : ''}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '12px 0', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '4px' }}>BARN CONFIGURATION</div>
                {[
                  [newHasFloorEggs, setNewHasFloorEggs, 'Do you collect floor eggs? (Form 07)'],
                  [newTwoCollections, setNewTwoCollections, 'Do you collect eggs 2x a day? (Form 07)'],
                  [newHasBedding, setNewHasBedding, 'Do you use bedding? (Form 08)'],
                  [newHasChemicals, setNewHasChemicals, 'Do you use chemicals? (Form 08)'],
                ].map(([value, setter, label]) => (
                  <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                    <input type="checkbox" checked={value} onChange={(e) => setter(e.target.checked)} />
                    {label}
                  </label>
                ))}
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
          ))}

          {/* Close Selector Button */}
          <button
            onClick={() => setShowBarnSelector(false)}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#73C48E',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Close
          </button>
        </>
      )}

      {/* Edit Barn Modal */}
      {editingBarn && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSaveEdit} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '360px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Edit Barn</h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="barn-manager-input"
              placeholder="Barn Name"
              maxLength={35}
              autoFocus
            />
            {editName.length > 28 && (
              <div style={{ fontSize: '12px', color: editName.length === 35 ? '#dc3545' : '#fd7e14' }}>
                {editName.length}/35 characters{editName.length === 35 ? ' — limit reached' : ''}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '4px' }}>BARN CONFIGURATION</div>
              {[
                [editHasFloorEggs, setEditHasFloorEggs, 'Do you collect floor eggs? (Form 07)'],
                [editTwoCollections, setEditTwoCollections, 'Do you collect eggs 2x a day? (Form 07)'],
                [editHasBedding, setEditHasBedding, 'Do you use bedding? (Form 08)'], [editHasChemicals, setEditHasChemicals, 'Do you use chemicals? (Form 08)'],].map(([value, setter, label]) => (
                  <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                    <input type="checkbox" checked={value} onChange={(e) => setter(e.target.checked)} />
                    {label}
                  </label>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', fontWeight: 'bold', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Save
              </button>
              <button type="button" onClick={() => setEditingBarn(null)} style={{ flex: 1, padding: '10px', fontWeight: 'bold', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
