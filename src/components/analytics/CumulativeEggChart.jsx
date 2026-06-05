import { useState, useEffect } from 'react'
import { useSupabase } from '../../contexts/SupabaseContext'
import { useFarmContext } from '../../contexts/FarmContext'
import BarChart from './BarChart'

/**
 * Shows daily egg production for the selected month as a bar chart,
 * using production_egg_output joined through production_cooler_records.
 */
export default function CumulativeEggChart() {
  const supabase = useSupabase()
  const { selectedBarn, monthYear } = useFarmContext()
  const [rows, setRows] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedBarn?.id || !monthYear) {
      setRows(null)
      return
    }

    // Parse monthYear (format: "YYYY-MM-01")
    const [year, month] = monthYear.split('-').map(Number)
    const firstOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
    
    // Determine end of month: either last day of the month or today, whichever is earlier
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1
    
    let endOfMonth
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      // Past month: show entire month
      const lastDay = new Date(year, month, 0).getDate()
      endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    } else {
      // Current or future month: show up to today
      endOfMonth = today.toISOString().split('T')[0]
    }

    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('production_egg_output')
        .select('record_date, egg_production_daily, production_cooler_records!inner(barn_id)')
        .eq('production_cooler_records.barn_id', selectedBarn.id)
        .gte('record_date', firstOfMonth)
        .lte('record_date', endOfMonth)
        .not('egg_production_daily', 'is', null)
        .order('record_date', { ascending: true })

      if (error) console.error(error)
      setRows(data || [])
      setLoading(false)
    }

    load()
  }, [selectedBarn?.id, monthYear])

  if (!selectedBarn) {
    return <p className="analytics-info">Select a barn</p>
  }
  if (loading) {
    return <p className="analytics-info">Loading…</p>
  }
  if (!rows || rows.length === 0) {
    return <p className="analytics-info">No production data this month</p>
  }

  const dailyValues = rows.map(r => r.egg_production_daily || 0)
  const dayLabels = rows.map(r => new Date(r.record_date + 'T00:00:00').getDate())

  const totalSoFar = dailyValues.reduce((a, b) => a + b, 0)
  const latestDayCount = dailyValues[dailyValues.length - 1]
  const daysRecorded = rows.length

  return (
    <>
      <div className="chart-mini-stats">
        <div className="chart-mini-stat">
          <div className="chart-mini-val">{totalSoFar.toLocaleString()}</div>
          <div className="chart-mini-lbl">Total so far</div>
        </div>
        <div className="chart-mini-stat">
          <div className="chart-mini-val">{latestDayCount.toLocaleString()}</div>
          <div className="chart-mini-lbl">Latest day</div>
        </div>
        <div className="chart-mini-stat">
          <div className="chart-mini-val">{daysRecorded}</div>
          <div className="chart-mini-lbl">Days recorded</div>
        </div>
      </div>
      <BarChart data={dailyValues} labels={dayLabels} height={90} />
    </>
  )
}
