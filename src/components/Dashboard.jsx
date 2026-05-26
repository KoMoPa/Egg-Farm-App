import BarnManager from './BarnManager'
import Reports from './Reports'
import Analytics from './Analytics'
import FlockData from './FlockData'
import { useFarmContext } from '../contexts/FarmContext'

export default function Dashboard() {
  const { selectedBarn } = useFarmContext()

  return (
    <div className="dashboard">
      <div className="dashboard-top-row">
        <section className="dashboard-card">
          <BarnManager />
        </section>
        <section className="dashboard-card">
          <Reports key={selectedBarn?.id ?? 'no-barn'} />
        </section>
      </div>
      <section className="dashboard-card">
        <FlockData key={selectedBarn?.id ?? 'no-barn'} />
      </section>
      <section className="dashboard-card">
        <Analytics key={selectedBarn?.id ?? 'no-barn'} />
      </section>
    </div>
  )
}
