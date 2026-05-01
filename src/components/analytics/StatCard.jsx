/**
 * Reusable stat card component
 * @param {Object} props
 * @param {string|number} props.value - The stat value to display
 * @param {string} props.label - Label describing the stat
 * @param {string} props.variant - Optional CSS variant: 'normal' | 'over' | 'under' (default: 'normal')
 */
export default function StatCard({ value, label, variant = 'normal' }) {
  return (
    <div className="stat-card">
      <div className={`stat-card-value stat-card-value--${variant}`}>{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  )
}
