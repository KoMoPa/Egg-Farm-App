import { useState, useEffect } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { useFarmContext } from '../contexts/FarmContext'
import { getCurrentFlockForBarn, createNewFlock, updateBarnCurrentFlockId } from '../utils/farmBarnOps'

export default function FlockData() {
  const supabase = useSupabase()
  const { selectedBarn, barns, setBarns, setSelectedBarn } = useFarmContext()

  const [arrivalDate, setArrivalDate] = useState('')
  const [ageAtArrival, setAgeAtArrival] = useState('')
  const [flockCount, setFlockCount] = useState('')
  const [activeFlockId, setActiveFlockId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  // Sync local state when selected barn changes
  useEffect(() => {
    if (!selectedBarn) {
      setArrivalDate('')
      setAgeAtArrival('')
      setFlockCount('')
      setActiveFlockId(null)
      setSaved(false)
      return
    }

    let cancelled = false

    const loadFlockData = async () => {
      const fallbackArrival = selectedBarn.flock_arrival_date ?? ''
      const fallbackAge = selectedBarn.flock_age_at_arrival_weeks?.toString() ?? ''
      const fallbackCount = ''

      setArrivalDate(fallbackArrival)
      setAgeAtArrival(fallbackAge)
      setFlockCount(fallbackCount)
      setActiveFlockId(selectedBarn.current_flock_id ?? null)
      setSaved(!!(fallbackArrival && fallbackAge !== '' && fallbackCount !== ''))

      if (!selectedBarn.current_flock_id) return

      try {
        const { data: flock, error } = await supabase
          .from('flocks')
          .select('*')
          .eq('id', selectedBarn.current_flock_id)
          .maybeSingle()
        if (error) throw error
        if (!flock || cancelled) return

        setActiveFlockId(flock.id)
        setArrivalDate(flock.arrival_date ?? fallbackArrival)
        setAgeAtArrival((flock.age_at_arrival_weeks ?? selectedBarn.flock_age_at_arrival_weeks ?? '')?.toString())

        const resolvedCount =
          flock.current_count ??
          flock.initial_count ??
          ''
        setFlockCount(resolvedCount?.toString() ?? '')
        setSaved(!!((flock.arrival_date ?? fallbackArrival) && resolvedCount !== ''))
      } catch (err) {
        console.error('Error loading active flock data:', err)
      }
    }

    loadFlockData()
    return () => { cancelled = true }
  }, [selectedBarn?.id, selectedBarn?.current_flock_id, refreshTick])

  useEffect(() => {
    const handleFlockDataUpdated = (event) => {
      if (event?.detail?.barnId && event.detail.barnId !== selectedBarn?.id) return
      setRefreshTick(tick => tick + 1)
    }

    window.addEventListener('flock-data-updated', handleFlockDataUpdated)
    return () => window.removeEventListener('flock-data-updated', handleFlockDataUpdated)
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
      const parsedAge = ageAtArrival !== '' ? parseInt(ageAtArrival, 10) : null
      const parsedCount = flockCount !== '' ? parseInt(flockCount, 10) : null

      let flockIdToUpdate = activeFlockId
      if (!flockIdToUpdate) {
        const { flockId } = await getCurrentFlockForBarn(selectedBarn.id)
        flockIdToUpdate = flockId ?? null
      }

      if (!flockIdToUpdate) {
        const { flock: newFlock } = await createNewFlock(selectedBarn.id)
        flockIdToUpdate = newFlock.id
        await updateBarnCurrentFlockId(selectedBarn.id, flockIdToUpdate)
      }

      const { data: updated, error } = await supabase
        .from('barns')
        .update({
          flock_arrival_date: arrivalDate || null,
          flock_age_at_arrival_weeks: parsedAge,
        })
        .eq('id', selectedBarn.id)
        .select()
        .single()
      if (error) throw error

      const flockPayload = {
        arrival_date: arrivalDate || null,
        status: 'active',
        age_at_arrival_weeks: parsedAge,
        initial_count: parsedCount,
        current_count: parsedCount,
      }

      if (flockIdToUpdate) {
        const { error: flockUpdateError } = await supabase
          .from('flocks')
          .update(flockPayload)
          .eq('id', flockIdToUpdate)
        if (flockUpdateError) throw flockUpdateError
      }

      setActiveFlockId(flockIdToUpdate)

      // Propagate updated barn into context so Form07 picks it up
      setBarns(barns.map(b => b.id === updated.id ? updated : b))
      setSelectedBarn(updated)
      window.dispatchEvent(new CustomEvent('flock-data-updated', {
        detail: {
          barnId: selectedBarn.id,
          flockId: flockIdToUpdate,
        },
      }))
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
        {flockCount === '' && (
          <div style={{
            backgroundColor: '#fff4e5',
            border: '1px solid #f0ad4e',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '14px',
            color: '#8a5a00',
            fontSize: '13px',
            fontWeight: '600',
          }}>
            Enter Flock Count to enable Form 09 inventory auto-calculation.
          </div>
        )}

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
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
              Flock Count
            </label>
            <input
              type="number"
              min="0"
              value={flockCount}
              onChange={(e) => { setFlockCount(e.target.value); setSaved(false) }}
              placeholder="e.g. 10000"
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
            disabled={saving || !arrivalDate || ageAtArrival === '' || flockCount === ''}
            style={{
              backgroundColor: saving || !arrivalDate || ageAtArrival === '' || flockCount === '' ? '#ccc' : '#2D855B',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: saving || !arrivalDate || ageAtArrival === '' || flockCount === '' ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save Flock Data'}
          </button>
          {saved && (
            <span style={{ fontSize: '14px', color: '#28a745', fontWeight: '600' }}>✓ Saved</span>
          )}
        </div>

        {arrivalDate && ageAtArrival !== '' && flockCount !== '' && (
          <p style={{ fontSize: '13px', color: '#666', marginTop: '10px', marginBottom: 0 }}>
            Flock count is used to auto-calculate Form 09 inventory and monthly mortality percentage.
          </p>
        )}
      </form>
    </>
  )
}
