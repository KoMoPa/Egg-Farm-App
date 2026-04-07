import { useState } from 'react'
import { supabase } from '../supabaseClient'

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

// MONTH VIEW TABLE
const MonthViewTable = ({ dayData, onDayChange }) => (
    <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #333', fontSize: '10px' }}>
            <thead>
                <tr style={{ backgroundColor: '#e8e8e8' }}>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Day</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Feed Daily</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Feed Actual</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Water Daily</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Water Actual</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Flush</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Meds/Vit</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Treatment</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Mortality</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Inventory</th>
                </tr>
            </thead>
            <tbody>
                {[...Array(31)].map((_, i) => {
                    const day = i + 1
                    const data = dayData[day]
                    return (
                        <tr key={day}>
                            <td style={{ border: '1px solid #333', padding: '2px', fontWeight: 'bold' }}>{day}</td>
                            <td style={{ border: '1px solid #333', padding: '2px' }}>
                                <input type="number" step="0.1" value={data.feedDaily}
                                    onChange={(e) => onDayChange(day, 'feedDaily', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '9px' }} />
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px' }}>
                                <input type="number" step="0.1" value={data.feedActual}
                                    onChange={(e) => onDayChange(day, 'feedActual', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '9px' }} />
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px' }}>
                                <input type="number" step="0.1" value={data.waterDaily}
                                    onChange={(e) => onDayChange(day, 'waterDaily', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '9px' }} />
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px' }}>
                                <input type="number" step="0.1" value={data.waterActual}
                                    onChange={(e) => onDayChange(day, 'waterActual', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '9px' }} />
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px', textAlign: 'center' }}>
                                <select value={data.flush ? 'true' : 'false'}
                                    onChange={(e) => onDayChange(day, 'flush', e.target.value === 'true')}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '9px' }}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px', textAlign: 'center' }}>
                                <select value={data.medsVit ? 'true' : 'false'}
                                    onChange={(e) => onDayChange(day, 'medsVit', e.target.value === 'true')}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '9px' }}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px', textAlign: 'center' }}>
                                <select value={data.treatment ? 'true' : 'false'}
                                    onChange={(e) => onDayChange(day, 'treatment', e.target.value === 'true')}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '9px' }}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px' }}>
                                <input type="number" value={data.mortalityDaily}
                                    onChange={(e) => onDayChange(day, 'mortalityDaily', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '9px' }} />
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px' }}>
                                <input type="number" value={data.inventory}
                                    onChange={(e) => onDayChange(day, 'inventory', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '9px' }} />
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    </div>
)

export default function Form09FeedWaterRecords({ farmId, farmName, barnNumber, monthYear }) {
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
            // Step 1: Create or get monthly audit record
            const { data: existingAudit, error: auditCheckError } = await supabase
                .from('monthly_audits')
                .select('id')
                .eq('farm_id', farmId)
                .eq('month_year', monthYear)
                .single()

            let auditId
            if (existingAudit) {
                auditId = existingAudit.id
            } else {
                const { data: newAudit, error: newAuditError } = await supabase
                    .from('monthly_audits')
                    .insert([{
                        farm_id: farmId,
                        month_year: monthYear,
                        form_09_completed: false,
                    }])
                    .select()

                if (newAuditError) throw newAuditError
                auditId = newAudit[0].id
            }

            // Step 2: Filter out empty days and prepare data
            const daysWithData = Object.keys(dayData)
                .filter(day => {
                    const d = dayData[day]
                    return d.feedDaily || d.feedActual || d.waterDaily || d.waterActual || d.mortalityDaily || d.inventory
                }).map(day => parseInt(day))

            // Step 3: Prepare daily records
            const feedWaterRecords = daysWithData.map(day => ({
                farm_id: farmId,
                audit_id: auditId,
                day_of_month: day,
                record_date: recordDate,
                feed_daily: dayData[day].feedDaily || null,
                feed_actual: dayData[day].feedActual || null,
                water_daily: dayData[day].waterDaily || null,
                water_actual: dayData[day].waterActual || null,
                auger_run_time_minutes: dayData[day].augerRunTimeMinutes || null,
                flush: dayData[day].flush,
                meds_vit: dayData[day].medsVit,
                treatment: dayData[day].treatment,
                mortality_daily: dayData[day].mortalityDaily || null,
                mortality_reason: dayData[day].mortalityReason || null,
                hospital_pen_monitoring: dayData[day].hospitalPenMonitoring || null,
                inventory: dayData[day].inventory || null,
            }))

            // Step 4: Save daily records
            const { error: recordError } = await supabase
                .from('feed_water_records')
                .insert(feedWaterRecords)

            if (recordError) throw recordError

            // Step 5: Save form-level metadata
            const { error: metaError } = await supabase
                .from('feed_water_form_metadata')
                .insert([{
                    farm_id: farmId,
                    audit_id: auditId,
                    record_date: recordDate,
                    feed_target: feedTarget || null,
                    monthly_mortality_percent: monthlyMortalityPercent || null,
                    comments: comments || null,
                }])

            // Step 6: Don't auto-complete - user must manually mark as complete
            // This allows users to save daily records without marking month done yet

            if (recordError || metaError) {
                alert('Error saving: ' + (recordError?.message || metaError?.message))
                console.error('Errors:', recordError, metaError)
            } else {
                alert('✅ Form 09 records saved for month!')
            }
        } catch (error) {
            alert('Error: ' + error.message)
            console.error(error)
        }
    }

    const handleMarkMonthComplete = async () => {
        try {
            const { error } = await supabase
                .from('monthly_audits')
                .update({
                    form_09_completed: true,
                    form_09_completed_date: new Date().toISOString()
                })
                .eq('id', auditId)

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
                    <div><strong>Farm Name:</strong> {farmName}</div>
                    <div><strong>Barn #:</strong> {barnNumber}</div>
                    <div><strong>Month/Year:</strong> {monthYear}</div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date</label>
                        <input type="date" value={recordDate}
                            onChange={(e) => setRecordDate(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                    </div>
                </div>

                {/* VIEW TOGGLE */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={() => setViewMode('day')}
                        style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            backgroundColor: viewMode === 'day' ? '#0066cc' : '#ddd',
                            color: viewMode === 'day' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>
                        Day View
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('month')}
                        style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            backgroundColor: viewMode === 'month' ? '#0066cc' : '#ddd',
                            color: viewMode === 'month' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>
                        Month View
                    </button>
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

            {/* MONTH VIEW */}
            {viewMode === 'month' && (
                <MonthViewTable
                    dayData={dayData}
                    onDayChange={handleDayChange} />
            )}

            {/* FORM-LEVEL DATA */}
            <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '2px solid #666' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '30px', textAlign: 'center' }}>Form Summary</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Feed Target</label>
                        <input type="text" value={feedTarget}
                            onChange={(e) => setFeedTarget(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Monthly Mortality %</label>
                        <input type="number" step="0.1" value={monthlyMortalityPercent}
                            onChange={(e) => setMonthlyMortalityPercent(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>If greater than 0.5%, notify EFO</p>
                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Comments</label>
                    <textarea value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows="5"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'Arial' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
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
                        Save Form 09 - Feed Water Records
                    </button>
                    <button type="button" onClick={handleMarkMonthComplete} style={{
                        padding: '12px 40px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        backgroundColor: '#0066cc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        ✓ Mark Month Complete
                    </button>
                </div>
            </div>
        </form>
    )
}
