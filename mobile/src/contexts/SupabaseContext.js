import React, { createContext, useContext } from 'react'
import { supabase } from '../supabaseClient'

const SupabaseContext = createContext()

export function SupabaseProvider({ children }) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const client = useContext(SupabaseContext)
  if (!client) throw new Error('useSupabase must be used within a SupabaseProvider')
  return client
}
