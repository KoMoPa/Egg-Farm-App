import { useState } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { getOrCreateMonthlyAudit, getOrCreateFeedWaterRecord } from '../utils/farmBarnOps'
import { useFarmContext } from '../contexts/FarmContext'

// DAY VIEW COMPONENT
const DayViewForm = ({ day, data, onDayChange }) => (
    <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '2px solid #666', paddingBottom: '10px' }}>
            Daily Tracking - Day {day}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Feed Daily Target</label>
                <input type="number" step="0.1" value={data.feedDaily}
                    onChange={(e) => onDayChange(day, 'feedDaily', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Feed Actual</label>
                <input type="number" step="0.1" value={data.feedActual}
                    onChange={(e) => onDayChange(day, 'feedActual', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Water Daily Target</label>
                <input type="number" step="0.1" value={data.waterDaily}
                    onChange={(e) => onDayChange(day, 'waterDaily', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Water Actual</label>
                <input type="number" step="0.1" value={data.waterActual}
                    onChange={(e) => onDayChange(day, 'waterActual', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Auger Run Time (minutes)</label>
                <input type="number" value={data.augerRunTimeMinutes}
                    onChange={(e) => onDayChange(day, 'augerRunTimeMinutes', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
            </div>
        </div>

        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Water Treatments</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Flush</label>
                <select value={data.flush ? 'true' : 'false'}
                    onChange={(e) => onDayChange(day, 'flush', e.target.value === 'true')}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Meds/Vit</label>
                <select value={data.medsVit ? 'true' : 'false'}
                    onChange={(e) => onDayChange(day, 'medsVit', e.target.value === 'true')}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Treatment</label>
                <select value={data.treatment ? 'true' : 'false'}
                    onChange={(e) => onDayChange(day, 'treatment', e.target.value === 'true')}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>
        </div>

        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Mortality Records</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Daily Mortality Count</label>
                <input type="number" value={data.mortalityDaily}
                    onChange={(e) => onDayChange(day, 'mortalityDaily', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Reason</label>
                <select value={data.mortalityReason}
                    onChange={(e) => onDayChange(day, 'mortalityReason', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}>
                    <option value="">Select...</option>
                    <option value="natural">Natural</option>
                    <option value="euthanized">Euthanized</option>
                </select>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hospital Pen Monitoring</label>
                <select value={data.hospitalPenMonitoring}
                    onChange={(e) => onDayChange(day, 'hospitalPenMonitoring', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}>
                    <option value="">Select...</option>
                    <option value="improved">Improved</option>
                    <option value="euthanized">Euthanized</option>
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Inventory</label>
                <input type="number" value={data.inventory}
                    onChange={(e) => onDayChange(day, 'inventory', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
            </div>
        </div>
    </div>
)

// WEEK VIEW TABLE
const WeekViewTable = ({ startDay, dayData, onDayChange }) => {
    const endDay = Math.min(startDay + 6, 31)
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #333', fontSize: '12px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#e8e8e8' }}>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Day</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Feed Daily</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Feed Actual</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Water Daily</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Water Actual</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Flush</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Meds/Vit</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Treatment</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Mortality</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Inventory</th>
                    </tr>
                </thead>
                <tbody>
                    {[...Array(endDay - startDay + 1)].map((_, i) => {
                        const day = startDay + i
                        const data = dayData[day]
                        return (
                            <tr key={day}>
                                <td style={{ border: '1px solid #333', padding: '4px', fontWeight: 'bold' }}>{day}</td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <input type="number" step="0.1" value={data.feedDaily}
                                        onChange={(e) => onDayChange(day, 'feedDaily', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <input type="number" step="0.1" value={data.feedActual}
                                        onChange={(e) => onDayChange(day, 'feedActual', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <input type="number" step="0.1" value={data.waterDaily}
                                        onChange={(e) => onDayChange(day, 'waterDaily', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <input type="number" step="0.1" value={data.waterActual}
                                        onChange={(e) => onDayChange(day, 'waterActual', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <select value={data.flush ? 'true' : 'false'}
                                        onChange={(e) => onDayChange(day, 'flush', e.target.value === 'true')}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '11px' }}>
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <select value={data.medsVit ? 'true' : 'false'}
                                        onChange={(e) => onDayChange(day, 'medsVit', e.target.value === 'true')}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '11px' }}>
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <select value={data.treatment ? 'true' : 'false'}
                                        onChange={(e) => onDayChange(day, 'treatment', e.target.value === 'true')}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '11px' }}>
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <input type="number" value={data.mortalityDaily}
                                        onChange={(e) => onDayChange(day, 'mortalityDaily', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <input type="number" value={data.inventory}
                                        onChange={(e) => onDayChange(day, 'inventory', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc' }} />
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}



export default function Form09FeedWaterRecords() {
    const supabase = useSupabase()
    const { farm, selectedBarn, monthYear } = useFarmContext()
    // Initialize 31 days of data
    const initializeDayData = () => {
        const days = {}
        for (let i = 1; i <= 31; i++) {
            days[i] = {
                feedDaily: '',
                feedActual: '',
                waterDaily: '',
                waterActual: '',
                augerRunTimeMinutes: '',
                flush: false,
                medsVit: false,
                treatment: false,
                mortalityDaily: '',
                mortalityReason: '',
                hospitalPenMonitoring: '',
                inventory: '',
            }
        }
        return days
    }

    const [dayData, setDayData] = useState(initializeDayData())
    const [viewMode, setViewMode] = useState('day')
    const [selectedDay, setSelectedDay] = useState(1)
    const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0])
    const [feedTarget, setFeedTarget] = useState('')
    const [monthlyMortalityPercent, setMonthlyMortalityPercent] = useState('')
    const [comments, setComments] = useState('')
    const [monthlySaved, setMonthlySaved] = useState(false)

    const handleDayChange = (day, field, value) => {
        setDayData(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // Step 1: Get or create monthly audit record
            const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
            const auditId = audit.id

            // Step 2: Get or create feed/water records parent
            const { record: feedWaterRecord } = await getOrCreateFeedWaterRecord(selectedBarn.id, auditId)
            const fwId = feedWaterRecord.id

            // Step 3: Filter out empty days and prepare daily records
            const daysWithData = Object.keys(dayData)
                .filter(day => {
                    const d = dayData[day]
                    return d.feedDaily || d.feedActual || d.waterDaily || d.waterActual || d.mortalityDaily || d.inventory
                })

            // Step 4: Insert daily feed/water records
            const feedWaterDailyData = daysWithData.map(day => {
                const dateObj = new Date(monthYear)
                dateObj.setDate(parseInt(day))
                const recordDateForDay = dateObj.toISOString().split('T')[0]
                const d = dayData[day]

                return {
                    fw_id: fwId,
                    record_date: recordDateForDay,
                    feed_daily: d.feedDaily ? parseFloat(d.feedDaily) : null,
                    feed_actual: d.feedActual ? parseFloat(d.feedActual) : null,
                    water_daily: d.waterDaily ? parseFloat(d.waterDaily) : null,
                    water_actual: d.waterActual ? parseFloat(d.waterActual) : null,
                    auger_run_time_minutes: d.augerRunTimeMinutes ? parseInt(d.augerRunTimeMinutes) : null,
                    flush_notes: d.flush ? 'Flushed' : null,
                    meds_vit_notes: d.medsVit ? 'Applied' : null,
                    treatment_notes: d.treatment ? 'Applied' : null
                }
            })

            if (feedWaterDailyData.length > 0) {
                const { error: dailyError } = await supabase
                    .from('feed_water_daily')
                    .upsert(feedWaterDailyData, { onConflict: 'fw_id, record_date' })

                if (dailyError) throw dailyError
            }

            // Step 5: Insert health records (mortality, inventory)
            const feedWaterHealthData = daysWithData.map(day => {
                const dateObj = new Date(monthYear)
                dateObj.setDate(parseInt(day))
                const recordDateForDay = dateObj.toISOString().split('T')[0]
                const d = dayData[day]

                return {
                    fw_id: fwId,
                    record_date: recordDateForDay,
                    mortality_daily: d.mortalityDaily ? parseInt(d.mortalityDaily) : 0,
                    pileup_count: d.pileupCount ? parseInt(d.pileupCount) : null,
                    efo_notified: false,
                    mortality_reason: d.mortalityReason || null,
                    hospital_pen_monitoring: d.hospitalPenMonitoring || null,
                    inventory: d.inventory ? parseInt(d.inventory) : null
                }
            })

            if (feedWaterHealthData.length > 0) {
                const { error: healthError } = await supabase
                    .from('feed_water_health')
                    .upsert(feedWaterHealthData, { onConflict: 'fw_id, record_date' })

                if (healthError) throw healthError
            }

            // Step 6: Update monthly metadata (if provided)
            if (feedTarget || monthlyMortalityPercent || comments) {
                const { error: metaError } = await supabase
                    .from('feed_water_monthly_metadata')
                    .upsert([{
                        fw_id: fwId,
                        feed_target: feedTarget || null,
                        monthly_mortality_percent: monthlyMortalityPercent ? parseFloat(monthlyMortalityPercent) : null,
                        comments: comments || null
                    }], { onConflict: 'fw_id' })

                if (metaError) throw metaError
            }

            // Step 7: Mark form as completed
            const { error: auditUpdateError } = await supabase
                .from('monthly_audits')
                .update({
                    form_09_completed: true,
                    form_09_completed_date: new Date().toISOString()
                })
                .eq('id', auditId)

            if (auditUpdateError) throw auditUpdateError

            alert('✅ Form 09 records saved successfully!')
        } catch (error) {
            alert('Error saving: ' + error.message)
            console.error('Error:', error)
        }
    }

    const handleMonthlySubmit = async (e) => {
        e.preventDefault()
        try {
            const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
            const { record: feedWaterRecord } = await getOrCreateFeedWaterRecord(selectedBarn.id, audit.id)
            const fwId = feedWaterRecord.id

            const { error } = await supabase
                .from('feed_water_monthly_metadata')
                .upsert([{
                    fw_id: fwId,
                    feed_target: feedTarget || null,
                    monthly_mortality_percent: monthlyMortalityPercent ? parseFloat(monthlyMortalityPercent) : null,
                    comments: comments || null
                }], { onConflict: 'fw_id' })

            if (error) throw error
            setMonthlySaved(true)
            setTimeout(() => setMonthlySaved(false), 3000)
        } catch (err) {
            alert('Error saving monthly checks: ' + err.message)
        }
    }

    const handleMarkMonthComplete = async () => {
        try {
            const { audit } = await getOrCreateMonthlyAudit(farm.id, monthYear)
            const { error } = await supabase
                .from('monthly_audits')
                .update({
                    form_09_completed: true,
                    form_09_completed_date: new Date().toISOString()
                })
                .eq('id', audit.id)

            if (error) throw error
            alert('✅ Form 09 marked as complete for ' + monthYear)
        } catch (err) {
            alert('Error marking complete: ' + err.message)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', background: 'white', borderRadius: '8px' }}>

            {/* FORM HEADER */}
            <div style={{ borderBottom: '3px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', textAlign: 'center', color: '#000' }}>
                    Form 09 - Feed Water Records
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', fontSize: '16px', marginBottom: '20px' }}>
                    <div><strong>Farm Name:</strong> {farm?.farm_name}</div>
                    <div><strong>Barn:</strong> {selectedBarn?.barn_name}</div>
                    <div><strong>Month/Year:</strong> {monthYear.substring(0, 7)}</div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date</label>
                        <input type="date" value={recordDate}
                            onChange={(e) => setRecordDate(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                    </div>
                </div>

                {/* VIEW TOGGLE */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {['day', 'monthly'].map(mode => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => setViewMode(mode)}
                            style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                backgroundColor: viewMode === mode ? '#0066cc' : '#ddd',
                                color: viewMode === mode ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}>
                            {mode === 'day' ? 'Day View' : 'Monthly Checks'}
                        </button>
                    ))}
                </div>
            </div>

            {/* DAY VIEW */}
            {viewMode === 'day' && (
                <div>
                    <DayViewForm
                        day={parseInt(recordDate.split('-')[2])}
                        data={dayData[parseInt(recordDate.split('-')[2])]}
                        onDayChange={handleDayChange} />
                </div>
            )}

            {/* MONTHLY CHECKS TAB */}
            {viewMode === 'monthly' && (
                <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '10px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '24px', borderBottom: '2px solid #666', paddingBottom: '10px' }}>
                        Monthly Checks
                    </h3>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Feed Target</label>
                        <input type="text" value={feedTarget}
                            onChange={(e) => setFeedTarget(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Monthly Mortality %</label>
                        <input type="number" step="0.01" value={monthlyMortalityPercent}
                            onChange={(e) => setMonthlyMortalityPercent(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                        <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>If greater than 0.5%, notify EFO</p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Comments</label>
                        <textarea value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            rows={4}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button type="button" onClick={handleMonthlySubmit} style={{
                            padding: '10px 32px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>
                            💾 Save Monthly Checks
                        </button>
                        {monthlySaved && <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Saved!</span>}
                    </div>
                </div>
            )}

            {/* DAILY SAVE BUTTON — shown on day/month views */}
            {viewMode !== 'monthly' && (
                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <button type="submit" style={{
                        padding: '12px 40px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        💾 Save Daily Records
                    </button>
                </div>
            )}
        </form>
    )
}
