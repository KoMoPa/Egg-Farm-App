import { useMemo } from 'react'

/**
 * SVG-free bar chart using CSS flex bars.
 * @param {number[]} props.data - Array of numeric values (one per bar)
 * @param {number[]} props.labels - Optional day-of-month labels matching data length
 * @param {number} props.height - Height of the bar plot area in px (default: 90)
 * @param {boolean} props.highlightLast - Highlight the final bar (default: true)
 */
export default function BarChart({ data, labels = [], height = 90, highlightLast = true }) {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null
    const max = Math.max(...data)
    const avg = data.reduce((a, b) => a + b, 0) / data.length
    return { max, avg }
  }, [data])

  if (!stats) return <div className="bar-chart-empty">No data</div>

  const { max, avg } = stats

  return (
    <div className="bar-chart-container">
      <div className="bar-chart-plot" style={{ height: `${height}px` }}>
        {data.map((value, i) => (
          <div
            key={i}
            className={`bar-chart-bar${highlightLast && i === data.length - 1 ? ' bar-chart-bar--latest' : ''}`}
            style={{
              height: `${(value / max) * 100}%`,
              animationDelay: `${i * 0.012}s`,
            }}
            title={labels[i] != null ? `Day ${labels[i]}: ${value.toLocaleString()}` : value.toLocaleString()}
          />
        ))}
      </div>

      <div className="bar-chart-x-labels">
        {data.map((_, i) => (
          <div key={i} className="bar-chart-x-label">
            {labels[i] != null && (i % 5 === 0 || i === data.length - 1) ? labels[i] : ''}
          </div>
        ))}
      </div>

      <div className="bar-chart-legend">
        <span>Avg: {Math.round(avg).toLocaleString()}</span>
        <span className="bar-chart-legend-max">Max: {max.toLocaleString()}</span>
      </div>
    </div>
  )
}
