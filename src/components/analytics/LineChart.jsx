import { useMemo } from 'react'

/**
 * Lightweight SVG line chart for 4 data points
 * @param {Object} props
 * @param {number[]} props.data - Array of 4 numeric values
 * @param {number} props.height - SVG height in pixels (default: 120)
 * @param {number} props.width - SVG width in pixels (default: 100%)
 * @param {string} props.label - Chart label (e.g., "Auger Time (min)")
 */
export default function LineChart({ data, height = 120, width = '100%', label = '' }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const padding = 12
    const plotHeight = height - padding * 2

    // Normalize points to SVG coordinates
    const points = data.map((value, i) => {
      const x = (i / (data.length - 1)) * (300 - padding * 2) + padding
      const y = height - padding - ((value - min) / range) * plotHeight
      return { x, y, value }
    })

    // Generate SVG path string
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    return {
      pathData,
      points,
      min: min.toFixed(1),
      max: max.toFixed(1),
      current: data[data.length - 1].toFixed(1),
    }
  }, [data, height])

  if (!chartData) {
    return <div className="line-chart-empty">No data</div>
  }

  return (
    <div className="line-chart-container">
      {label && <div className="line-chart-label">{label}</div>}
      <svg
        className="line-chart-svg"
        viewBox={`0 0 300 ${height}`}
        preserveAspectRatio="none"
        style={{ width, height: `${height}px` }}
      >
        {/* Grid lines (optional, very light) */}
        <line x1="0" y1={height * 0.5} x2="300" y2={height * 0.5} className="line-chart-grid" />

        {/* Animated path */}
        <path d={chartData.pathData} className="line-chart-path" />

        {/* Data points */}
        {chartData.points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" className="line-chart-point" />
        ))}
      </svg>

      {/* Legend */}
      <div className="line-chart-legend">
        <span>Min: {chartData.min}</span>
        <span>Max: {chartData.max}</span>
        <span className="line-chart-current">Now: {chartData.current}</span>
      </div>
    </div>
  )
}
