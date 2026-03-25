import { useState } from 'react'
import Form07DailyProduction from './components/Form07DailyProduction'
import Form08WelfareRecords from './components/Form08WelfareRecords'
import './App.css'

function App() {
  const [currentForm, setCurrentForm] = useState('form07')

  // Test data
  const testFarmId = 'fbb40bbc-bbaf-40e7-833a-712bbbb65b11'
  const testFarmName = 'Test Egg Farm'
  const testBarnNumber = 'Barn 1'
  const testMonthYear = '2026-03-01' // March 2026

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '32px' }}>
          🥚 SCSC Compliance Tracker
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          Start Clean - Stay Clean On-Farm Food Safety Program
        </p>

        {/* Form Navigation */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
          <button 
            onClick={() => setCurrentForm('form07')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: currentForm === 'form07' ? '#0066cc' : '#ccc',
              color: currentForm === 'form07' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Form 07 - Production
          </button>
          <button 
            onClick={() => setCurrentForm('form08')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: currentForm === 'form08' ? '#0066cc' : '#ccc',
              color: currentForm === 'form08' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Form 08 - Welfare
          </button>
        </div>

        {/* Forms */}
        {currentForm === 'form07' && (
          <Form07DailyProduction
            farmId={testFarmId}
            farmName={testFarmName}
            barnNumber={testBarnNumber}
            monthYear={testMonthYear}
          />
        )}

        {currentForm === 'form08' && (
          <Form08WelfareRecords
            farmId={testFarmId}
            farmName={testFarmName}
            barnNumber={testBarnNumber}
            monthYear={testMonthYear}
          />
        )}
      </div>
    </div>
  )
}

export default App