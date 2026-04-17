import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Form07DailyProduction from './components/Form07DailyProduction'
import Form08WelfareRecords from './components/Form08WelfareRecords'
import Form09FeedWaterRecords from './components/Form09FeedWaterRecords'
import Form10PestControlRecords from './components/Form10PestControlRecords'
import Reports from './components/Reports'
import './App.css'

function App() {
  const [currentForm, setCurrentForm] = useState('form07')
  const { user, signOut } = useAuth()

  // Test data (will be replaced with real farms from DB in future)
  const testFarmId = 'fbb40bbc-bbaf-40e7-833a-712bbbb65b11'
  const testFarmName = 'Test Egg Farm'
  const testBarnNumber = 1  // Changed from 'Barn 1' to just the number
  const testMonthYear = '2026-04'

  // If not logged in, show login page
  if (!user) {
    return <Login />
  }

  // User is logged in, show forms
  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header with user info and logout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '32px' }}>
              🥚 SCSC Compliance Tracker
            </h1>
            <p style={{ color: '#666', margin: 0 }}>
              Start Clean - Stay Clean On-Farm Food Safety Program
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
              Logged in as: <strong>{user.email}</strong>
            </p>
            <button
              onClick={signOut}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
              Logout
            </button>
          </div>
        </div>

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

          <button
            onClick={() => setCurrentForm('form09')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: currentForm === 'form09' ? '#0066cc' : '#ccc',
              color: currentForm === 'form09' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Form 09 - Feed Water
          </button>
          <button
            onClick={() => setCurrentForm('form10')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: currentForm === 'form10' ? '#0066cc' : '#ccc',
              color: currentForm === 'form10' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Form 10 - Pest Control
          </button>
          <button
            onClick={() => setCurrentForm('reports')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: currentForm === 'reports' ? '#28a745' : '#ccc',
              color: currentForm === 'reports' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            📊 Reports
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
            auditId={1}
            farmName={testFarmName}
          />
        )}

        {currentForm === 'form09' && (
          <Form09FeedWaterRecords
            farmId={testFarmId}
            farmName={testFarmName}
            barnNumber={testBarnNumber}
            monthYear={testMonthYear}
          />
        )}

        {currentForm === 'form10' && (
          <Form10PestControlRecords
            farmId={testFarmId}
            farmName={testFarmName}
            barnNumber={testBarnNumber}
            monthYear={testMonthYear}
          />
        )}

        {currentForm === 'reports' && (
          <Reports
            farmId={testFarmId}
            farmName={testFarmName}
          />
        )}

      </div>
    </div>
  )
}

export default App