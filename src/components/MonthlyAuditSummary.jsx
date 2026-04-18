import { useState, useEffect } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'

function MonthlyAuditSummary({ farmId, farmName, auditId, monthYear, onClose }) {
    const supabase = useSupabase()
    const [form07Data, setForm07Data] = useState([])
    const [form08Data, setForm08Data] = useState([])
    const [form09Data, setForm09Data] = useState([])
    const [form10Data, setForm10Data] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Form 07 - Production & Cooler
                const { data: prod } = await supabase
                    .from('production_cooler_records')
                    .select('*')
                    .eq('audit_id', auditId)

                const { data: sanit } = await supabase
                    .from('sanitation_records')
                    .select('*')
                    .eq('audit_id', auditId)

                // Form 08 - Welfare
                const { data: welfare } = await supabase
                    .from('welfare_daily_records')
                    .select('*')
                    .eq('audit_id', auditId)
                    .order('day_of_month')

                // Form 09 - Feed & Water
                const { data: feed } = await supabase
                    .from('feed_water_records')
                    .select('*')
                    .eq('audit_id', auditId)
                    .order('day_of_month')

                // Form 10 - Pest Control
                const { data: pest } = await supabase
                    .from('pest_control_records')
                    .select('*')
                    .eq('audit_id', auditId)
                    .order('day_of_month')

                setForm07Data({ production: prod || [], sanitation: sanit || [] })
                setForm08Data(welfare || [])
                setForm09Data(feed || [])
                setForm10Data(pest || [])
            } catch (err) {
                console.error('Error fetching data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [auditId])

    const formatMonth = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    }

    if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Loading audit data...</p>

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px',
            background: 'white',
            fontFamily: 'Arial, sans-serif',
            fontSize: '11px',
            lineHeight: '1.4'
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
                <h1 style={{ fontSize: '20px', margin: '0 0 5px 0' }}>Monthly Compliance Audit Summary</h1>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666' }}>
                    <strong>Farm:</strong> {farmName} | <strong>Month:</strong> {formatMonth(monthYear)}
                </p>
            </div>

            {/* Form 07 */}
            <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                    Form 07 - Egg Production & Cooler Records
                </h2>
                {form07Data.production && form07Data.production.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '10px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'left', fontWeight: 'bold' }}>Date</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'left', fontWeight: 'bold' }}>Age (wks)</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>Floor Eggs</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>Prod Daily</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>Temp HI</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>Temp LO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form07Data.production.map((record) => (
                                <tr key={record.id}>
                                    <td style={{ border: '1px solid #ccc', padding: '5px' }}>{record.record_date}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px' }}>{record.flock_age_weeks}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{record.floor_eggs_total}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{record.egg_production_daily}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{record.cooler_temp_hi_celsius}°C</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{record.cooler_temp_lo_celsius}°C</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ color: '#999', fontStyle: 'italic' }}>No production records entered</p>
                )}
            </div>

            {/* Form 08 */}
            <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                    Form 08 - Welfare Records ({form08Data.length} days)
                </h2>
                {form08Data.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '10px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>Day</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>Barn HI</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>Barn LO</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>Ext Temp</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>Floors</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>Manure</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form08Data.map((record) => (
                                <tr key={record.id}>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{record.day_of_month}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{record.barn_temp_hi}°C</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{record.barn_temp_lo}°C</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{record.exterior_temp}°C</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{record.floors_checked ? '✓' : ''}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{record.manure_checked ? '✓' : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ color: '#999', fontStyle: 'italic' }}>No welfare records entered</p>
                )}
            </div>

            {/* Form 09 */}
            <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                    Form 09 - Feed & Water Records ({form09Data.length} days)
                </h2>
                {form09Data.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '10px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>Day</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>Feed Actual</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>Water Actual</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>Auger (min)</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>Mortality</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>Meds/Vit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form09Data.map((record) => (
                                <tr key={record.id}>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{record.day_of_month}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{record.feed_actual}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{record.water_actual}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{record.auger_run_time_minutes}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{record.mortality_daily}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{record.meds_vit ? '✓' : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ color: '#999', fontStyle: 'italic' }}>No feed & water records entered</p>
                )}
            </div>

            {/* Form 10 */}
            <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                    Form 10 - Pest Control Records ({form10Data.length} days)
                </h2>
                {form10Data.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '10px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>Day</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'left', fontWeight: 'bold' }}>Traps Findings</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'left', fontWeight: 'bold' }}>Bait Product</th>
                                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'left', fontWeight: 'bold' }}>Corrective Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form10Data.map((record) => (
                                <tr key={record.id}>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{record.day_of_month}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', fontSize: '9px' }}>{record.live_traps_findings}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', fontSize: '9px' }}>{record.bait_product}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '5px', fontSize: '9px' }}>{record.corrective_actions}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ color: '#999', fontStyle: 'italic' }}>No pest control records entered</p>
                )}
            </div>

            {/* Print Button */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px', borderTop: '2px solid #ccc', paddingTop: '20px' }}>
                <button onClick={() => window.print()} style={{
                    padding: '10px 30px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    🖨 Print / Save as PDF
                </button>
                <button onClick={onClose} style={{
                    padding: '10px 30px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    Close
                </button>
            </div>
        </div>
    )
}

export default MonthlyAuditSummary
