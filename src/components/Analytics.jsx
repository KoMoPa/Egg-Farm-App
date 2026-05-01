import AnalyticsChart from './analytics/AnalyticsChart'

export default function Analytics() {
  return (
    <div className="analytics">
      <h2 className="analytics-title">📈 Analytics</h2>
      
      <div className="analytics-charts-grid">
        <section className="analytics-segment analytics-segment--chart">
          <h3 className="analytics-segment-title">⚙️ Auger Run Time</h3>
          <AnalyticsChart
            table="feed_water_daily"
            dataColumn="auger_run_time_minutes"
            threshold={3}
            icon="⚙️"
            warningMsg="{deviation} min ({pct}%) vs average"
          />
        </section>
        
        <section className="analytics-segment analytics-segment--chart">
          <h3 className="analytics-segment-title">🌾 Feed</h3>
          <AnalyticsChart
            table="feed_water_daily"
            dataColumn="feed_actual"
            targetColumn="feed_daily"
            threshold={10}
            icon="🌾"
            warningMsg="{pct}% {deviation} target"
          />
        </section>

        <section className="analytics-segment analytics-segment--chart">
          <h3 className="analytics-segment-title">💧 Water</h3>
          <AnalyticsChart
            table="feed_water_daily"
            dataColumn="water_actual"
            targetColumn="water_daily"
            threshold={10}
            icon="💧"
            warningMsg="{pct}% {deviation} target"
          />
        </section>
      </div>
    </div>
  )
}
