import React, { createContext, useContext } from 'react'
import { supabase } from '../supabaseClient'

const SupabaseContext = createContext()

/**
 * SupabaseProvider - Provides Supabase client to all child components
 * This ensures a single instance of the Supabase client is used throughout the app
 */
export function SupabaseProvider({ children }) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
}

/**
 * useSupabase - Hook to access the Supabase client from anywhere in the app
 * @returns {SupabaseClient} The Supabase client instance
 * @throws {Error} If used outside of SupabaseProvider
 */
export function useSupabase() {
  const supabaseClient = useContext(SupabaseContext)
  
  if (!supabaseClient) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  
  return supabaseClient
}
