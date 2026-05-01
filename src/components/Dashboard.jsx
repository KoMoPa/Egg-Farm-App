import BarnManager from './BarnManager'
import Reports from './Reports'
import Analytics from './Analytics'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-top-row">
        <section className="dashboard-card">
          <BarnManager />
        </section>
        <section className="dashboard-card">
          <Reports />
        </section>
      </div>
      <section className="dashboard-card">
        <Analytics />
      </section>
    </div>
  )
}
