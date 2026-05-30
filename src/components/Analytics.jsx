import { useState } from 'react'
import AnalyticsChart from './analytics/AnalyticsChart'

const CHARTS = [
  {
    key: 'auger_run_time_minutes',
    title: 'Auger Run Time',
    table: 'feed_water_daily',
    dataColumn: 'auger_run_time_minutes',
    threshold: 3,
    iconSrc: '/auger-icon.png',
    warningMsg: '{deviation} min ({pct}%) vs average',
  },
  {
    key: 'feed_actual',
    title: 'Feed',
    table: 'feed_water_daily',
    dataColumn: 'feed_actual',
    targetColumn: 'feed_daily',
    threshold: 10,
    iconSrc: '/feed-icon.png',
    warningMsg: '{pct}% {deviation} target',
  },
  {
    key: 'water_actual',
    title: 'Water',
    table: 'feed_water_daily',
    dataColumn: 'water_actual',
    targetColumn: 'water_daily',
    threshold: 10,
    iconSrc: '/water-icon.png',
    warningMsg: '{pct}% {deviation} target',
  },
]

function GoalEditor({ chartKey, goal, onSave }) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(goal != null ? String(goal) : '')

  function handleSave() {
    const val = parseFloat(input)
    onSave(isNaN(val) ? null : val)
    setEditing(false)
  }

  function handleClear() {
    onSave(null)
    setInput('')
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="chart-goal-editor">
        <span className="chart-goal-label">Goal:</span>
        <input
          className="chart-goal-input"
          type="number"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
          autoFocus
        />
        <button className="chart-goal-btn chart-goal-btn--save" onClick={handleSave}>✓</button>
        {goal != null && (
          <button className="chart-goal-btn chart-goal-btn--clear" onClick={handleClear}>Clear</button>
        )}
        <button className="chart-goal-btn chart-goal-btn--cancel" onClick={() => setEditing(false)}>✕</button>
      </div>
    )
  }

  return (
    <div className="chart-goal-row">
      {goal != null ? (
        <span className="chart-goal-label">Goal: <strong>{goal}</strong></span>
      ) : (
        <span className="chart-goal-label chart-goal-label--empty">No goal set</span>
      )}
      <button
        className="chart-goal-btn chart-goal-btn--edit"
        onClick={() => { setInput(goal != null ? String(goal) : ''); setEditing(true) }}
      >
        {goal != null ? 'Edit' : 'Set goal'}
      </button>
    </div>
  )
}

export default function Analytics() {
  const [goals, setGoals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('analytics_goals') || '{}')
    } catch {
      return {}
    }
  })

  function updateGoal(key, value) {
    setGoals(prev => {
      const next = { ...prev }
      if (value == null) {
        delete next[key]
      } else {
        next[key] = value
      }
      localStorage.setItem('analytics_goals', JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="analytics">
      <h2 className="analytics-title">
        <img src="/analysis-icon.png" alt="Analytics" className="analytics-title-icon" />
        <span>Analytics</span>
      </h2>

      <div className="analytics-charts-grid">
        {CHARTS.map(chart => (
          <section key={chart.key} className="analytics-segment analytics-segment--chart">
            <h3 className="analytics-segment-title">
              <img src={chart.iconSrc} alt="" className="analytics-segment-title-icon" />
              <span>{chart.title}</span>
            </h3>
            <AnalyticsChart
              table={chart.table}
              dataColumn={chart.dataColumn}
              targetColumn={chart.targetColumn}
              threshold={chart.threshold}
              icon={<img src={chart.iconSrc} alt="" className="warning-banner-icon-image" />}
              warningMsg={chart.warningMsg}
              goal={goals[chart.key] ?? null}
            />
            <GoalEditor
              chartKey={chart.key}
              goal={goals[chart.key] ?? null}
              onSave={val => updateGoal(chart.key, val)}
            />
          </section>
        ))}
      </div>
    </div>
  )
}
