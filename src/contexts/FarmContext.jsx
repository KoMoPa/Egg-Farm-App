import React, { createContext, useState, useEffect } from 'react'
import { useSupabase } from './SupabaseContext'
import { getOrCreateUserFarm, getFarmBarns } from '../utils/farmBarnOps'

export const FarmContext = createContext()

const cacheKey = userId => `farm_cache_${userId}`

export function FarmProvider({ children, user }) {
  const supabase = useSupabase()
  const [farm, setFarm] = useState(null)
  const [barns, setBarns] = useState([])
  const [selectedBarn, setSelectedBarn] = useState(null)
  const today = new Date()
  const [monthYear, setMonthYear] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize user's farm on user change
  useEffect(() => {
    if (user?.id) {
      initializeFarm()
    } else {
      setFarm(null)
      setBarns([])
      setSelectedBarn(null)
      setLoading(false)
    }
  }, [user?.id])

  // Load barns when farm changes — removed: initializeFarm now handles both in one pass

  const initializeFarm = async () => {
    // Paint from cache instantly — no spinner if we have recent data
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey(user.id)))
      if (cached?.farm && Array.isArray(cached.barns)) {
        setFarm(cached.farm)
        setBarns(cached.barns)
        setLoading(false)
      }
    } catch {}

    // Fetch fresh farm + barns in one async chain, update cache
    try {
      setLoading(prev => prev) // keep loading true only if cache was empty
      const { farm: userFarm } = await getOrCreateUserFarm(user.id, 'My Farm', user.email)
      const farmBarns = await getFarmBarns(userFarm.id)
      setFarm(userFarm)
      setBarns(farmBarns)
      localStorage.setItem(cacheKey(user.id), JSON.stringify({ farm: userFarm, barns: farmBarns }))
      setError(null)
    } catch (err) {
      setError('Error loading farm: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadBarns = async () => {
    if (!farm?.id) return
    try {
      const farmBarns = await getFarmBarns(farm.id)
      setBarns(farmBarns)
      // Keep cache in sync
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey(user.id)) || '{}')
        localStorage.setItem(cacheKey(user.id), JSON.stringify({ ...cached, barns: farmBarns }))
      } catch {}
      setError(null)
    } catch (err) {
      setError('Error loading barns: ' + err.message)
      console.error(err)
    }
  }

  const selectBarn = (barn) => {
    setSelectedBarn(barn)
  }

  const updateBarns = (newBarns) => {
    setBarns(newBarns)
  }

  const value = {
    // State
    farm,
    barns,
    selectedBarn,
    monthYear,
    loading,
    error,

    // Actions
    setSelectedBarn: selectBarn,
    setMonthYear,
    setBarns: updateBarns,
    reloadBarns: loadBarns,
    reloadFarm: initializeFarm,
  }

  return (
    <FarmContext.Provider value={value}>
      {children}
    </FarmContext.Provider>
  )
}

// Custom hook to use the context
export function useFarmContext() {
  const context = React.useContext(FarmContext)
  if (!context) {
    throw new Error('useFarmContext must be used within a FarmProvider')
  }
  return context
}
