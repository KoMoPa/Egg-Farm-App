import { useState, useEffect } from 'react'
import { useSupabase } from '../../contexts/SupabaseContext'
import { useFarmContext } from '../../contexts/FarmContext'
import BarChart from './BarChart'

/**
 * Shows daily egg production for the current month up to today as a bar chart,
 * using production_egg_output joined through production_cooler_records.
 */
export default function CumulativeEggChart() {
  const supabase = useSupabase()
  const { selectedBarn } = useFarmContext()
  const [rows, setRows] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedBarn?.id) {
      setRows(null)
      return
    }

    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const firstOfMonth = `${year}-${month}-01`
    const todayStr = today.toISOString().split('T')[0]

    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('production_egg_output')
        .select('record_date, egg_production_daily, production_cooler_records!inner(barn_id)')
        .eq('production_cooler_records.barn_id', selectedBarn.id)
        .gte('record_date', firstOfMonth)
        .lte('record_date', todayStr)
        .not('egg_production_daily', 'is', null)
        .order('record_date', { ascending: true })

      if (error) console.error(error)
      setRows(data || [])
      setLoading(false)
    }

    load()
  }, [selectedBarn?.id])

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
