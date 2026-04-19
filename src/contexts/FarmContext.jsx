import React, { createContext, useState, useEffect } from 'react'
import { useSupabase } from './SupabaseContext'
import { getOrCreateUserFarm, getFarmBarns } from '../utils/farmBarnOps'

export const FarmContext = createContext()

export function FarmProvider({ children, user }) {
  const supabase = useSupabase()
  const [farm, setFarm] = useState(null)
  const [barns, setBarns] = useState([])
  const [selectedBarn, setSelectedBarn] = useState(null)
  const [monthYear, setMonthYear] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize user's farm on user change
  useEffect(() => {
    if (user?.id) {
      // Add small delay to ensure session is fully established
      const timer = setTimeout(() => {
        initializeFarm()
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setFarm(null)
      setBarns([])
      setSelectedBarn(null)
      setLoading(false)
    }
  }, [user?.id])

  // Load barns when farm changes
  useEffect(() => {
    if (farm?.id) {
      loadBarns()
    }
  }, [farm?.id])

  const initializeFarm = async () => {
    try {
      setLoading(true)
      const { farm: userFarm } = await getOrCreateUserFarm(user.id)
      setFarm(userFarm)
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
