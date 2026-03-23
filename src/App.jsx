import Form07DailyProduction from './components/Form07DailyProduction'
import './App.css'

function App() {
  // Test data
  const testFarmId = 'fbb40bbc-bbaf-40e7-833a-712bbbb65b11'
  const testFarmName = 'Test Egg Farm'
  const testBarnNumber = 'Barn 1'
  const testMonthYear = '2026-03-01' // March 2026

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '32px' }}>
          🥚 SCSC Compliance Tracker
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          Start Clean - Stay Clean On-Farm Food Safety Program
        </p>

        <Form07DailyProduction
          farmId={testFarmId}
          farmName={testFarmName}
          barnNumber={testBarnNumber}
          monthYear={testMonthYear}
        />
      </div>
    </div>
  )
}

export default App