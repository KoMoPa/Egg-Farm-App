import { useState, useEffect } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { useFarmContext } from '../contexts/FarmContext'

export default function FlockData() {
  const supabase = useSupabase()
  const { selectedBarn, barns, setBarns, setSelectedBarn } = useFarmContext()

  const [arrivalDate, setArrivalDate] = useState('')
  const [ageAtArrival, setAgeAtArrival] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Sync local state when selected barn changes
  useEffect(() => {
    if (selectedBarn) {
      setArrivalDate(selectedBarn.flock_arrival_date ?? '')
      setAgeAtArrival(selectedBarn.flock_age_at_arrival_weeks?.toString() ?? '')
      setSaved(!!(selectedBarn.flock_arrival_date && selectedBarn.flock_age_at_arrival_weeks != null))
    } else {
      setArrivalDate('')
      setAgeAtArrival('')
      setSaved(false)
    }
  }, [selectedBarn?.id])

  // Calculate current flock age in weeks as of today
  const calcCurrentAge = () => {
    if (!arrivalDate || ageAtArrival === '') return null
    const arrival = new Date(arrivalDate + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weeks = Math.floor((today - arrival) / (7 * 24 * 60 * 60 * 1000))
    if (weeks < 0) return null
    return parseInt(ageAtArrival) + weeks
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!selectedBarn) return
    setSaving(true)
    try {
      const { data: updated, error } = await supabase
        .from('barns')
        .update({
          flock_arrival_date: arrivalDate || null,
          flock_age_at_arrival_weeks: ageAtArrival !== '' ? parseInt(ageAtArrival) : null,
        })
        .eq('id', selectedBarn.id)
        .select()
        .single()
      if (error) throw error
      // Propagate updated barn into context so Form07 picks it up
      setBarns(barns.map(b => b.id === updated.id ? updated : b))
      setSelectedBarn(updated)
      setSaved(true)
    } catch (err) {
      alert('Error saving flock data: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const currentAge = calcCurrentAge()

  if (!selectedBarn) {
    return (
      <>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2D855B', marginTop: 0, marginBottom: '12px' }}>
          Flock Data
        </h2>
        <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>Select a barn to manage flock data.</p>
      </>
    )
  }

  return (
    <>
      <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2D855B', marginTop: 0, marginBottom: '16px' }}>
        Flock Data — {selectedBarn.barn_name}
      </h2>

      {currentAge !== null && (
        <div style={{
          backgroundColor: '#e8f4fd',
          border: '1px solid #2D855B',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '14px', color: '#444' }}>Current flock age today:</span>
          <strong style={{ fontSize: '22px', color: '#2D855B' }}>{currentAge} weeks</strong>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
              Flock Arrival Date
            </label>
            <input
              type="date"
              value={arrivalDate}
              onChange={(e) => { setArrivalDate(e.target.value); setSaved(false) }}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '15px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
              Age at Arrival (weeks)
            </label>
            <input
              type="number"
              min="0"
              value={ageAtArrival}
              onChange={(e) => { setAgeAtArrival(e.target.value); setSaved(false) }}
              placeholder="e.g. 18"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '15px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="submit"
            disabled={saving || !arrivalDate || ageAtArrival === ''}
            style={{
              backgroundColor: saving || !arrivalDate || ageAtArrival === '' ? '#ccc' : '#2D855B',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: saving || !arrivalDate || ageAtArrival === '' ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save Flock Data'}
          </button>
          {saved && (
            <span style={{ fontSize: '14px', color: '#28a745', fontWeight: '600' }}>✓ Saved</span>
          )}
        </div>

        {arrivalDate && ageAtArrival !== '' && (
          <p style={{ fontSize: '13px', color: '#666', marginTop: '10px', marginBottom: 0 }}>
            Flock age is auto-calculated for each day in Form 07 based on these values.
          </p>
        )}
      </form>
    </>
  )
}
