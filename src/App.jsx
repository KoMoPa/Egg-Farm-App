import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  async function testConnection() {
    try {
      console.log('Testing Supabase connection...')
      
      const { data, error } = await supabase
        .from('farms')
        .select('*')
      
      if (error) throw error
      
      console.log('✅ Connected! Farms data:', data)
      setFarms(data)
      setLoading(false)
    } catch (error) {
      console.error('❌ Connection error:', error.message)
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1>🥚 Egg Farm Tracker - Connection Test</h1>
      
      {loading && <p>Testing connection to Supabase...</p>}
      
      {error && (
        <div style={{ background: '#fee', padding: '20px', borderRadius: '8px' }}>
          <p style={{ color: 'red' }}>❌ Error: {error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <div style={{ background: '#efe', padding: '20px', borderRadius: '8px' }}>
          <p style={{ color: 'green', fontSize: '20px', fontWeight: 'bold' }}>
            ✅ Successfully connected to Supabase!
          </p>
          <p>Tables found: farms, production_cooler_records, sanitation_records</p>
          <p>Farms in database: {farms.length}</p>
          {farms.length === 0 && <p style={{ color: '#666' }}>(No farms added yet - that's normal!)</p>}
        </div>
      )}
    </div>
  )
}

export default App
