import { useState } from 'react'
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

const TABS = [
  { key: 'home', label: 'Farm & Barns', emoji: '🏠' },
  { key: 'form07', label: 'Production', emoji: '🥚' },
  { key: 'form08', label: 'Welfare', emoji: '🐔' },
  { key: 'form09', label: 'Feed/Water', emoji: '🌾' },
  { key: 'form10', label: 'Pest Control', emoji: '🐀' },
  { key: 'reports', label: 'Reports', emoji: '📋' },
]

function App() {
  const { user, signOut } = useAuth()

  if (!user) return <Login />

  return (
    <FarmProvider user={user}>
      <AppContent signOut={signOut} user={user} />
    </FarmProvider>
  )
}

function AppContent({ signOut, user }) {
  const [activeTab, setActiveTab] = useState('home')
  const { farm, monthYear, setMonthYear, selectedBarn } = useFarmContext()

  const activeTabDef = TABS.find(t => t.key === activeTab)

  // Month/year helpers
  const [year, month] = monthYear.split('-')
  const selectedDate = new Date(parseInt(year), parseInt(month) - 1)
  const handleDateChange = (date) => {
    if (date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      setMonthYear(`${y}-${m}-01`)
    }
  }
  const renderMonthContent = (month, shortMonth, longMonth, day) => {
    const fullYear = new Date(day).getFullYear()
    return <span title={`${longMonth} ${fullYear}`}>{shortMonth}</span>
  }

  return (
    <div className="app-shell">
      {/* ── Top header bar ── */}
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-header-title">{activeTabDef.emoji} {activeTabDef.label}</span>
          {farm?.farm_name && (
            <span className="app-header-farm">{farm.farm_name}</span>
          )}
        </div>
        <div className="app-header-right">
          <span className="app-header-email">{user.email}</span>
          <button onClick={signOut} className="app-logout-btn">Logout</button>
        </div>
      </header>

      {/* ── Scrollable content area ── */}
      <main className="app-content">
        <div className="app-content-inner">

          {/* Home / barn manager tab */}
          {activeTab === 'home' && <BarnManager />}

          {/* Form tabs */}
          {activeTab !== 'home' && activeTab !== 'reports' && (
            <>
              {!selectedBarn ? (
                <div className="app-no-barn-card">
                  <p className="app-no-barn-text">👈 Select or create a barn on the <strong>Farm &amp; Barns</strong> tab first</p>
                </div>
              ) : (
                <>
                  {/* Month picker */}
                  <div className="app-month-bar">
                    <label className="app-month-label">Month / Year:</label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      renderMonthContent={renderMonthContent}
                      showMonthYearPicker
                      dateFormat="MM/yyyy"
                    />
                  </div>

                  {activeTab === 'form07' && <Form07DailyProduction />}
                  {activeTab === 'form08' && <Form08WelfareRecords />}
                  {activeTab === 'form09' && <Form09FeedWaterRecords />}
                  {activeTab === 'form10' && <Form10PestControlRecords />}
                </>
              )}
            </>
          )}

          {activeTab === 'reports' && <Reports />}
        </div>
      </main>

      {/* ── Bottom tab bar ── */}
      <nav className="app-tab-bar">
        {TABS.map(tab => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`app-tab-item${active ? ' active' : ''}`}
            >
              <span className="app-tab-emoji">{tab.emoji}</span>
              <span className="app-tab-label">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default App