import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useAuth } from './contexts/AuthContext'
import { FarmProvider, useFarmContext } from './contexts/FarmContext'
import Login from './components/Login'
import BarnManager from './components/BarnManager'
import Form07DailyProduction from './components/Form07DailyProduction'
import Form08WelfareRecords from './components/Form08WelfareRecords'
import Form09FeedWaterRecords from './components/Form09FeedWaterRecords'
import Form10PestControlRecords from './components/Form10PestControlRecords'
import Reports from './components/Reports'
import './App.css'

function App() {
  const { user, signOut } = useAuth()

  // If not logged in, show login page
  if (!user) {
    return <Login />
  }

  // Wrap app with FarmProvider to provide farm context to all components
  return (
    <FarmProvider user={user}>
      <AppContent signOut={signOut} user={user} />
    </FarmProvider>
  )
}

function AppContent({ signOut, user }) {
  const [currentForm, setCurrentForm] = useState('form07')

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

        {/* Farm and Barn Manager */}
        <BarnManager />

        {/* Form Navigation and Content */}
        <FormContent currentForm={currentForm} setCurrentForm={setCurrentForm} />
      </div>
    </div>
  )
}

function FormContent({ currentForm, setCurrentForm }) {
  const { selectedBarn, monthYear, setMonthYear } = useFarmContext()

  // Parse monthYear string (YYYY-MM-DD) and create Date for DatePicker
  const [year, month] = monthYear.split('-')
  const selectedDate = new Date(parseInt(year), parseInt(month) - 1)

  // Handle date change and convert back to YYYY-MM-DD format
  const handleDateChange = (date) => {
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      setMonthYear(`${year}-${month}-01`)
    }
  }

  // Custom month content renderer with tooltip
  const renderMonthContent = (month, shortMonth, longMonth, day) => {
    const fullYear = new Date(day).getFullYear()
    const tooltipText = `${longMonth} ${fullYear}`
    return <span title={tooltipText}>{shortMonth}</span>
  }

  if (!selectedBarn) {
    return (
      <div style={{ background: 'white', borderRadius: '8px', padding: '40px', textAlign: 'center', border: '2px dashed #999' }}>
        <h3 style={{ color: '#666', fontSize: '18px' }}>
          👈 Select or create a barn to get started
        </h3>
      </div>
    )
  }

  return (
    <>
      {/* Month/Year Selector */}
      <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <label style={{ fontWeight: 'bold', fontSize: '16px' }}>
          Select Month/Year:
        </label>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          renderMonthContent={renderMonthContent}
          showMonthYearPicker
          dateFormat="MM/yyyy"
          style={{
            padding: '8px 12px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Form Navigation */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
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
      {currentForm === 'form07' && <Form07DailyProduction />}
      {currentForm === 'form08' && <Form08WelfareRecords />}
      {currentForm === 'form09' && <Form09FeedWaterRecords />}
      {currentForm === 'form10' && <Form10PestControlRecords />}
      {currentForm === 'reports' && <Reports />}
    </>
  )
}

export default App