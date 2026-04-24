import React, { createContext, useContext, useState, useEffect } from 'react'
import { getOrCreateUserFarm, getFarmBarns } from '../utils/farmBarnOps'

const FarmContext = createContext()

export function FarmProvider({ children, user }) {
  const [farm, setFarm] = useState(null)
  const [barns, setBarns] = useState([])
  const [selectedBarn, setSelectedBarn] = useState(null)
  const today = new Date()
  const [monthYear, setMonthYear] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.id) {
      const timer = setTimeout(() => initializeFarm(), 500)
      return () => clearTimeout(timer)
    } else {
      setFarm(null)
      setBarns([])
      setSelectedBarn(null)
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (farm?.id) loadBarns()
  }, [farm?.id])

  const initializeFarm = async () => {
    try {
      setLoading(true)
      const { farm: userFarm } = await getOrCreateUserFarm(user.id)
      setFarm(userFarm)
      setError(null)
    } catch (err) {
      setError('Error loading farm: ' + err.message)
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
    }
  }

  return (
    <FarmContext.Provider value={{
      farm, barns, selectedBarn, monthYear, loading, error,
      setSelectedBarn,
      setMonthYear,
      setBarns,
      reloadBarns: loadBarns,
      reloadFarm: initializeFarm,
    }}>
      {children}
    </FarmContext.Provider>
  )
}

export function useFarmContext() {
  const ctx = useContext(FarmContext)
  if (!ctx) throw new Error('useFarmContext must be used within a FarmProvider')
  return ctx
}
