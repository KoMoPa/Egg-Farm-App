import { useState, useEffect } from 'react'
import { useSupabase } from '../../contexts/SupabaseContext'
import { useFarmContext } from '../../contexts/FarmContext'
import LineChart from './LineChart'
import WarningBanner from './WarningBanner'

/**
 * Reusable analytics chart component
 * @param {Object} props
 * @param {string} props.table - Table name (e.g., 'feed_water_daily')
 * @param {string} props.dataColumn - Column to chart (e.g., 'auger_run_time_minutes')
 * @param {string} props.targetColumn - Optional target column for deviation (e.g., 'feed_daily')
 * @param {number} props.threshold - Deviation threshold % (default: 10)
 * @param {string} props.icon - Emoji icon
 * @param {string} props.warningMsg - Warning message template (use {deviation} and {pct} placeholders)
 */
export default function AnalyticsChart({
  table = 'feed_water_daily',
  dataColumn,
  mode = 'default',
  targetColumn = null,
  threshold = 10,
  icon = '📊',
  warningMsg = 'Value {deviation} ({pct}%)',
  goal = null,
}) {
  const supabase = useSupabase()
  const { selectedBarn } = useFarmContext()
  const [rows, setRows] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedBarn?.id) {
      setRows(null)
      return
    }

    const fetch = async () => {
      setLoading(true)

      const isRolling7Baseline = mode === 'rolling7Baseline'

      // Build select columns
      let selectCols = `record_date, ${dataColumn}`
      if (!isRolling7Baseline && targetColumn) {
        selectCols += `, ${targetColumn}`
      }

      // Most tables have a parent reference to a records table
      const joinTable = table === 'feed_water_daily' ? 'feed_water_records!inner' : null
      const joinTableName = table === 'feed_water_daily' ? 'feed_water_records' : null

      if (joinTable) {
        selectCols += `, ${joinTable}(barn_id)`
      }

      let query = supabase
        .from(table)
        .select(selectCols)
        .not(dataColumn, 'is', null)
        .order('record_date', { ascending: false })
        .limit(isRolling7Baseline ? 14 : 4)

      if (joinTableName) {
        query = query.eq(`${joinTableName}.barn_id`, selectedBarn.id)
      }

      const { data, error } = await query

      if (error) console.error(error)
      setRows(data || [])
      setLoading(false)
    }
    fetch()
  }, [selectedBarn?.id, table, dataColumn, targetColumn, mode])

  let content

  if (!selectedBarn) {
    content = <p className="analytics-info">Select a barn</p>
  } else if (loading) {
    content = <p className="analytics-info">Loading…</p>
  } else if (mode === 'rolling7Baseline' && (!rows || rows.length < 14)) {
    content = <p className="analytics-info">Need 14 consecutive days</p>
  } else if (mode !== 'rolling7Baseline' && (!rows || rows.length < 4)) {
    content = <p className="analytics-info">Need 4+ days</p>
  } else {
    const isRolling7Baseline = mode === 'rolling7Baseline'
    const descRows = [...rows]
    const chartValues = descRows.slice().reverse().map(r => r[dataColumn] || 0)

    if (isRolling7Baseline) {
      const newestDate = new Date(descRows[0].record_date)
      const oldestDate = new Date(descRows[13].record_date)
      const daySpan = Math.round((newestDate - oldestDate) / 86400000)

      if (daySpan !== 13) {
        content = <p className="analytics-info">Need 14 consecutive days</p>
        return content
      }

      const currentWindow = descRows.slice(0, 7)
      const previousWindow = descRows.slice(7, 14)

      const currentAvg = currentWindow.reduce((sum, r) => sum + (Number(r[dataColumn]) || 0), 0) / 7
      const previousAvg = previousWindow.reduce((sum, r) => sum + (Number(r[dataColumn]) || 0), 0) / 7

      if (!previousAvg) {
        content = <p className="analytics-info">Insufficient baseline</p>
        return content
      }

      const deviation = currentAvg - previousAvg
      const deviationPct = Math.abs((deviation / previousAvg) * 100)
      const warn = deviationPct >= threshold
      const warnType = deviation > 0 ? 'over' : 'under'
      const warnMsg = warningMsg
        .replace('{deviation}', deviationPct.toFixed(1))
        .replace('{pct}', deviationPct.toFixed(1))

      content = (
        <>
          <div className="chart-mini-stats">
            <div className="chart-mini-stat">
              <div className="chart-mini-val">{previousAvg.toFixed(1)}</div>
              <div className="chart-mini-lbl">Prev 7-day avg</div>
            </div>
            <div className="chart-mini-stat">
              <div className={`chart-mini-val ${warn ? warnType : ''}`}>{currentAvg.toFixed(1)}</div>
              <div className="chart-mini-lbl">Current 7-day avg</div>
            </div>
            {goal != null && (
              <div className="chart-mini-stat chart-mini-stat--goal">
                <div className="chart-mini-val chart-mini-val--goal">{goal}</div>
                <div className="chart-mini-lbl">Goal</div>
              </div>
            )}
          </div>

          <LineChart data={chartValues} height={80} goal={goal} />

          {warn && <WarningBanner message={warnMsg} type={warnType} icon={icon} />}
        </>
      )

      return content
    }

    const today = descRows[0]
    const prior = descRows.slice(1, 4)

    const todayValue = today[dataColumn]

    let stat1 = { val: 0, lbl: '' }
    let stat2 = { val: todayValue, lbl: 'Today' }
    let warn = false
    let warnType = 'info'
    let warnMsg = ''

    if (targetColumn) {
      // Deviation mode (target vs actual)
      const targetVal = today[targetColumn]
      const deviation = todayValue - targetVal
      const deviationPct = targetVal ? ((deviation / targetVal) * 100).toFixed(1) : 0
      warn = Math.abs(deviationPct) >= threshold

      stat1.val = targetVal
      stat1.lbl = 'Target'
      stat2.val = todayValue
      stat2.lbl = 'Actual'

      if (warn) {
        warnType = deviation > 0 ? 'over' : 'under'
        warnMsg = warningMsg
          .replace('{deviation}', Math.abs(deviationPct))
          .replace('{pct}', Math.abs(deviationPct))
      }
    } else {
      // Trend mode (vs 3-day average)
      const avg = prior.reduce((sum, r) => sum + (r[dataColumn] || 0), 0) / prior.length
      const diff = todayValue - avg
      const diffPct = avg ? ((diff / avg) * 100).toFixed(1) : 0
      warn = Math.abs(diff) >= (threshold / 10) // For auger, threshold is minutes, so 3+ min

      stat1.val = avg.toFixed(1)
      stat1.lbl = '3-day avg'
      stat2.val = todayValue
      stat2.lbl = 'Today'

      if (warn) {
        warnType = diff > 0 ? 'over' : 'under'
        warnMsg = warningMsg
          .replace('{deviation}', Math.abs(diff).toFixed(1))
          .replace('{pct}', Math.abs(diffPct))
      }
    }

    content = (
      <>
        <div className="chart-mini-stats">
          <div className="chart-mini-stat">
            <div className="chart-mini-val">
              {typeof stat1.val === 'number' ? stat1.val.toFixed(1) : (stat1.val || '0')}
            </div>
            <div className="chart-mini-lbl">{stat1.lbl}</div>
          </div>
          <div className="chart-mini-stat">
            <div className={`chart-mini-val ${warn && warnType !== 'info' ? warnType : ''}`}>
              {typeof stat2.val === 'number' ? stat2.val.toFixed(1) : (stat2.val || '0')}
            </div>
            <div className="chart-mini-lbl">{stat2.lbl}</div>
          </div>
          {goal != null && (
            <div className="chart-mini-stat chart-mini-stat--goal">
              <div className="chart-mini-val chart-mini-val--goal">{goal}</div>
              <div className="chart-mini-lbl">Goal</div>
            </div>
          )}
        </div>

        <LineChart data={chartValues} height={80} goal={goal} />

        {warn && <WarningBanner message={warnMsg} type={warnType} icon={icon} />}
      </>
    )
  }

  return content
}
