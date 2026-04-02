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
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Live Traps - Findings</label>
                <input type="text" value={data.liveTrapsFindings}
                    onChange={(e) => onDayChange(day, 'liveTrapsFindings', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Live Traps - Location</label>
                <input type="text" value={data.liveTrapsLocation}
                    onChange={(e) => onDayChange(day, 'liveTrapsLocation', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bait - Product</label>
                <input type="text" value={data.baitProduct}
                    onChange={(e) => onDayChange(day, 'baitProduct', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bait - Location</label>
                <input type="text" value={data.baitLocation}
                    onChange={(e) => onDayChange(day, 'baitLocation', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Birds on Range?</label>
                <select value={data.birdsOnRange}
                    onChange={(e) => onDayChange(day, 'birdsOnRange', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}>
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="na">N/A</option>
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Corrective Actions</label>
                <input type="text" value={data.correctiveActions}
                    onChange={(e) => onDayChange(day, 'correctiveActions', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>At Least Weekly</label>
                <select value={data.frequencyWeekly}
                    onChange={(e) => onDayChange(day, 'frequencyWeekly', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}>
                    <option value="">Select...</option>
                    <option value="checked">Checked</option>
                    <option value="not-checked">Not Checked</option>
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>At Least Monthly</label>
                <select value={data.frequencyMonthly}
                    onChange={(e) => onDayChange(day, 'frequencyMonthly', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}>
                    <option value="">Select...</option>
                    <option value="checked">Checked</option>
                    <option value="not-checked">Not Checked</option>
                </select>
            </div>
        </div>
    </div>
)

// WEEK VIEW TABLE
const WeekViewTable = ({ startDay, dayData, onDayChange }) => {
    const endDay = Math.min(startDay + 6, 31)
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #333', fontSize: '11px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#e8e8e8' }}>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Day</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Traps Findings</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Traps Location</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Bait Product</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Bait Location</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Birds?</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Corrective</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Weekly</th>
                        <th style={{ border: '1px solid #333', padding: '6px' }}>Monthly</th>
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
                                    <input type="text" value={data.liveTrapsFindings}
                                        onChange={(e) => onDayChange(day, 'liveTrapsFindings', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '10px' }} />
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <input type="text" value={data.liveTrapsLocation}
                                        onChange={(e) => onDayChange(day, 'liveTrapsLocation', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '10px' }} />
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <input type="text" value={data.baitProduct}
                                        onChange={(e) => onDayChange(day, 'baitProduct', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '10px' }} />
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <input type="text" value={data.baitLocation}
                                        onChange={(e) => onDayChange(day, 'baitLocation', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '10px' }} />
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <select value={data.birdsOnRange}
                                        onChange={(e) => onDayChange(day, 'birdsOnRange', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '10px' }}>
                                        <option value="">--</option>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                        <option value="na">N/A</option>
                                    </select>
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <input type="text" value={data.correctiveActions}
                                        onChange={(e) => onDayChange(day, 'correctiveActions', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '10px' }} />
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <select value={data.frequencyWeekly}
                                        onChange={(e) => onDayChange(day, 'frequencyWeekly', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '10px' }}>
                                        <option value="">--</option>
                                        <option value="checked">✓</option>
                                        <option value="not-checked">✗</option>
                                    </select>
                                </td>
                                <td style={{ border: '1px solid #333', padding: '2px' }}>
                                    <select value={data.frequencyMonthly}
                                        onChange={(e) => onDayChange(day, 'frequencyMonthly', e.target.value)}
                                        style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '10px' }}>
                                        <option value="">--</option>
                                        <option value="checked">✓</option>
                                        <option value="not-checked">✗</option>
                                    </select>
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
        <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #333', fontSize: '9px' }}>
            <thead>
                <tr style={{ backgroundColor: '#e8e8e8' }}>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Day</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Traps</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Location</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Bait</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Location</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Birds?</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>Actions</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>W</th>
                    <th style={{ border: '1px solid #333', padding: '4px' }}>M</th>
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
                                <input type="text" value={data.liveTrapsFindings}
                                    onChange={(e) => onDayChange(day, 'liveTrapsFindings', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '8px' }} />
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px' }}>
                                <input type="text" value={data.liveTrapsLocation}
                                    onChange={(e) => onDayChange(day, 'liveTrapsLocation', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '8px' }} />
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px' }}>
                                <input type="text" value={data.baitProduct}
                                    onChange={(e) => onDayChange(day, 'baitProduct', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '8px' }} />
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px' }}>
                                <input type="text" value={data.baitLocation}
                                    onChange={(e) => onDayChange(day, 'baitLocation', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '8px' }} />
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px' }}>
                                <select value={data.birdsOnRange}
                                    onChange={(e) => onDayChange(day, 'birdsOnRange', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '8px' }}>
                                    <option value="">--</option>
                                    <option value="yes">Y</option>
                                    <option value="no">N</option>
                                </select>
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px' }}>
                                <input type="text" value={data.correctiveActions}
                                    onChange={(e) => onDayChange(day, 'correctiveActions', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '8px' }} />
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px' }}>
                                <select value={data.frequencyWeekly}
                                    onChange={(e) => onDayChange(day, 'frequencyWeekly', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '8px' }}>
                                    <option value="">-</option>
                                    <option value="checked">✓</option>
                                    <option value="not-checked">✗</option>
                                </select>
                            </td>
                            <td style={{ border: '1px solid #333', padding: '2px' }}>
                                <select value={data.frequencyMonthly}
                                    onChange={(e) => onDayChange(day, 'frequencyMonthly', e.target.value)}
                                    style={{ width: '100%', padding: '2px', border: '1px solid #ccc', fontSize: '8px' }}>
                                    <option value="">-</option>
                                    <option value="checked">✓</option>
                                    <option value="not-checked">✗</option>
                                </select>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    </div>
)

export default function Form10PestControlRecords({ farmId, farmName, barnNumber, monthYear }) {
    // Initialize 31 days of data
    const initializeDayData = () => {
        const days = {}
        for (let i = 1; i <= 31; i++) {
            days[i] = {
                liveTrapsFindings: '',
                liveTrapsLocation: '',
                baitProduct: '',
                baitLocation: '',
                birdsOnRange: '',
                correctiveActions: '',
                frequencyWeekly: '',
                frequencyMonthly: '',
            }
        }
        return days
    }

    const [dayData, setDayData] = useState(initializeDayData())
    const [viewMode, setViewMode] = useState('day')
    const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedDay, setSelectedDay] = useState(1)

    // SIDE AUDIT SECTIONS
    const [exteriorInspectionDate, setExteriorInspectionDate] = useState('')
    const [exteriorInspectionObservation, setExteriorInspectionObservation] = useState('')
    const [wildBirdsObservation, setWildBirdsObservation] = useState('')
    const [flyMonitoring, setFlyMonitoring] = useState('')
    const [rangeGrass, setRangeGrass] = useState('')
    const [rangePondingWater, setRangePondingWater] = useState('')
    const [rangeRotationHarrow, setRangeRotationHarrow] = useState('')
    const [rangeWildBirdDeterrents, setRangeWildBirdDeterrents] = useState('')
    const [rangeGravelFences, setRangeGravelFences] = useState('')
    const [rangeOther, setRangeOther] = useState('')
    const [interiorInspectionDate, setInteriorInspectionDate] = useState('')
    const [interiorInspectionObservation, setInteriorInspectionObservation] = useState('')
    const [rodentIndex, setRodentIndex] = useState('')
    const [comments, setComments] = useState('')
    const [signature, setSignature] = useState('')
    const [signatureDate, setSignatureDate] = useState('')

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
                        form_10_completed: false,
                    }])
                    .select()

                if (newAuditError) throw newAuditError
                auditId = newAudit[0].id
            }

            // Step 2: Filter out empty days
            const daysWithData = Object.keys(dayData)
                .filter(day => {
                    const d = dayData[day]
                    return d.liveTrapsFindings || d.liveTrapsLocation || d.baitProduct || d.baitLocation || d.correctiveActions
                }).map(day => parseInt(day))

            // Step 3: Prepare daily records
            const pestControlRecords = daysWithData.map(day => ({
                farm_id: farmId,
                audit_id: auditId,
                day_of_month: day,
                live_traps_findings: dayData[day].liveTrapsFindings || null,
                live_traps_location: dayData[day].liveTrapsLocation || null,
                bait_product: dayData[day].baitProduct || null,
                bait_location: dayData[day].baitLocation || null,
                birds_on_range: dayData[day].birdsOnRange || null,
                corrective_actions: dayData[day].correctiveActions || null,
                frequency_weekly: dayData[day].frequencyWeekly || null,
                frequency_monthly: dayData[day].frequencyMonthly || null,
            }))

            // Step 4: Save daily records
            const { error: recordError } = await supabase
                .from('pest_control_records')
                .insert(pestControlRecords)

            if (recordError) throw recordError

            // Step 5: Save audit sections
            const { error: auditError } = await supabase
                .from('pest_control_audit_sections')
                .insert([{
                    farm_id: farmId,
                    audit_id: auditId,
                    exterior_inspection_date: exteriorInspectionDate || null,
                    exterior_inspection_observation: exteriorInspectionObservation || null,
                    wild_birds_observation: wildBirdsObservation || null,
                    fly_monitoring: flyMonitoring || null,
                    range_grass: rangeGrass || null,
                    range_ponding_water: rangePondingWater || null,
                    range_rotation_harrow: rangeRotationHarrow || null,
                    range_wild_bird_deterrents: rangeWildBirdDeterrents || null,
                    range_gravel_fences: rangeGravelFences || null,
                    range_other: rangeOther || null,
                    interior_inspection_date: interiorInspectionDate || null,
                    interior_inspection_observation: interiorInspectionObservation || null,
                    rodent_index: rodentIndex || null,
                    comments: comments || null,
                    signature: signature || null,
                    signature_date: signatureDate || null,
                }])

            if (auditError) throw auditError

            // Step 6: Update audit record as completed
            if (!existingAudit) {
                const { error: updateError } = await supabase
                    .from('monthly_audits')
                    .update({
                        form_10_completed: true,
                        form_10_completed_date: new Date().toISOString(),
                    })
                    .eq('id', auditId)

                if (updateError) throw updateError
            }

            alert('✅ Form 10 records saved for month!')
        } catch (error) {
            alert('Error: ' + error.message)
            console.error(error)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', background: 'white', borderRadius: '8px' }}>

            {/* FORM HEADER */}
            <div style={{ borderBottom: '3px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', textAlign: 'center', color: '#000' }}>
                    Form 10 - Pest Control Records
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

            {/* SIDE AUDIT SECTIONS */}
            <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '2px solid #666' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '30px', textAlign: 'center' }}>Side Audit Sections</h3>

                {/* Exterior Inspection */}
                <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Exterior Inspection</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Date</label>
                            <input type="date" value={exteriorInspectionDate}
                                onChange={(e) => setExteriorInspectionDate(e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Observation</label>
                            <textarea value={exteriorInspectionObservation}
                                onChange={(e) => setExteriorInspectionObservation(e.target.value)}
                                maxLength="500"
                                rows="3"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'Arial' }} />
                        </div>
                    </div>
                </div>

                {/* Wild Birds */}
                <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Wild Birds</h4>
                    <textarea value={wildBirdsObservation}
                        onChange={(e) => setWildBirdsObservation(e.target.value)}
                        maxLength="500"
                        rows="3"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'Arial' }} />
                </div>

                {/* Fly Monitoring */}
                <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Fly Monitoring</h4>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="radio" name="flyMonitoring" value="very-few"
                                checked={flyMonitoring === 'very-few'}
                                onChange={(e) => setFlyMonitoring(e.target.value)} />
                            Very Few
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="radio" name="flyMonitoring" value="moderate"
                                checked={flyMonitoring === 'moderate'}
                                onChange={(e) => setFlyMonitoring(e.target.value)} />
                            Moderate
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="radio" name="flyMonitoring" value="severe"
                                checked={flyMonitoring === 'severe'}
                                onChange={(e) => setFlyMonitoring(e.target.value)} />
                            Severe
                        </label>
                    </div>
                </div>

                {/* Range Management */}
                <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Range Management</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Grass:</label>
                            <input type="text" value={rangeGrass}
                                onChange={(e) => setRangeGrass(e.target.value)}
                                maxLength="500"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ponding Water:</label>
                            <input type="text" value={rangePondingWater}
                                onChange={(e) => setRangePondingWater(e.target.value)}
                                maxLength="500"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Rotation/Harrow:</label>
                            <input type="text" value={rangeRotationHarrow}
                                onChange={(e) => setRangeRotationHarrow(e.target.value)}
                                maxLength="500"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Wild Bird Deterrents:</label>
                            <input type="text" value={rangeWildBirdDeterrents}
                                onChange={(e) => setRangeWildBirdDeterrents(e.target.value)}
                                maxLength="500"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Gravel/Fences:</label>
                            <input type="text" value={rangeGravelFences}
                                onChange={(e) => setRangeGravelFences(e.target.value)}
                                maxLength="500"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Other:</label>
                            <input type="text" value={rangeOther}
                                onChange={(e) => setRangeOther(e.target.value)}
                                maxLength="500"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                        </div>
                    </div>
                </div>

                {/* Interior Inspection */}
                <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Interior Inspection</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Date</label>
                            <input type="date" value={interiorInspectionDate}
                                onChange={(e) => setInteriorInspectionDate(e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Observation</label>
                            <textarea value={interiorInspectionObservation}
                                onChange={(e) => setInteriorInspectionObservation(e.target.value)}
                                maxLength="500"
                                rows="3"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'Arial' }} />
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Summary</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Rodent Index</label>
                            <input type="text" value={rodentIndex}
                                onChange={(e) => setRodentIndex(e.target.value)}
                                maxLength="500"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Comments</label>
                        <textarea value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            maxLength="500"
                            rows="4"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontFamily: 'Arial' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Signature</label>
                            <input type="text" value={signature}
                                onChange={(e) => setSignature(e.target.value)}
                                maxLength="500"
                                placeholder="Print name here"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Date</label>
                            <input type="date" value={signatureDate}
                                onChange={(e) => setSignatureDate(e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
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
                        Save Form 10 - Pest Control Records
                    </button>
                </div>
            </div>
        </form>
    )
}
