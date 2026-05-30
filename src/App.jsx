import { useState, useEffect, useRef } from 'react'
import { useAuth } from './contexts/AuthContext'
import { FarmProvider, useFarmContext } from './contexts/FarmContext'
import Login from './components/Login'
import SetNewPassword from './components/SetNewPassword'
import Dashboard from './components/Dashboard'
import Form07DailyProduction from './components/Form07DailyProduction'
import Form08WelfareRecords from './components/Form08WelfareRecords'
import Form09FeedWaterRecords from './components/Form09FeedWaterRecords'
import Form10PestControlRecords from './components/Form10PestControlRecords'
import Reports from './components/Reports'
import './App.css'

const TABS = [
  {
    key: 'home',
    label: 'Dashboard',
    emoji: '🏠',
    iconInactive: '/home2-icon.png',
    iconActive: '/home-icon.png',
    headerIcon: '/home-icon-rev.png',
  },
  {
    key: 'form07',
    label: 'Production',
    emoji: '🥚',
    iconInactive: '/production2-icon.png',
    iconActive: '/production-icon.png',
  },
  {
    key: 'form08',
    label: 'Welfare',
    emoji: '🐔',
    iconInactive: '/welfare2-icon.png',
    iconActive: '/welfare-icon.png',
  },
  {
    key: 'form09',
    label: 'Feed/Water',
    emoji: '🌾',
    iconInactive: '/feed2-icon.png',
    iconActive: '/feed-icon.png',
  },
  {
    key: 'form10',
    label: 'Pest Control',
    emoji: '🐀',
    iconInactive: '/pest2-icon.png',
    iconActive: '/pest-icon.png',
  },
  {
    key: 'reports',
    label: 'Reports',
    emoji: '📊',
    iconInactive: '/reports2-icon.png',
    iconActive: '/reports-icon.png',
  },
]

function AppIcon({ src, alt, className, fallback }) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return <span className={className}>{fallback}</span>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}

function App() {
  const { user, signOut, signupSuccess, clearSignupSuccess, passwordRecovery } = useAuth()

  if (passwordRecovery) return <SetNewPassword />

  if (!user) return <Login />

  if (signupSuccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', marginBottom: '24px' }}>✅ Signup successful! Your account has been created.</p>
          <button onClick={clearSignupSuccess} style={{ padding: '10px 24px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <FarmProvider user={user}>
      <AppContent signOut={signOut} user={user} />
    </FarmProvider>
  )
}

function AppContent({ signOut, user }) {
  const [activeTab, setActiveTab] = useState('home')
  const { farm, selectedBarn } = useFarmContext()
  const contentRef = useRef(null)

  // Scroll to top when changing tabs
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [activeTab])

  const activeTabDef = TABS.find(t => t.key === activeTab)

  return (
    <div className="app-shell">
      {/* ── Top header bar ── */}
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-header-title">
            <AppIcon
              src={activeTabDef.headerIcon || activeTabDef.iconActive}
              alt={`${activeTabDef.label} icon`}
              className="app-header-icon"
              fallback={activeTabDef.emoji}
            />
            <span>{activeTabDef.label}</span>
          </span>
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
      <main className="app-content" ref={contentRef}>
        <div className="app-content-inner">

          {/* Dashboard tab */}
          {activeTab === 'home' && <Dashboard />}

          {/* Reports tab */}
          {activeTab === 'reports' && <Reports />}

          {/* Form tabs */}
          {activeTab !== 'home' && activeTab !== 'reports' && (
            <>
              {!selectedBarn ? (
                <div className="app-no-barn-card">
                  <p className="app-no-barn-text">👈 Select or create a barn on the <strong>Farm &amp; Barns</strong> tab first</p>
                </div>
              ) : (
                <>
                  {activeTab === 'form07' && <Form07DailyProduction />}
                  {activeTab === 'form08' && <Form08WelfareRecords />}
                  {activeTab === 'form09' && <Form09FeedWaterRecords />}
                  {activeTab === 'form10' && <Form10PestControlRecords />}
                </>
              )}
            </>
          )}


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
              className={`app-tab-item app-tab-item--${tab.key}${active ? ' active' : ''}`}
            >
              <AppIcon
                src={active ? tab.iconActive : tab.iconInactive}
                alt={`${tab.label} icon`}
                className={`app-tab-icon${tab.key === 'home' ? ' app-tab-icon--dashboard' : ''}`}
                fallback={tab.emoji}
              />
              <span className="app-tab-label">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default App