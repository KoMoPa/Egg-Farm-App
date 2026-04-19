import { useState, useEffect } from 'react'
import { pdf } from '@react-pdf/renderer'
import { useSupabase } from '../contexts/SupabaseContext'
import { AuditReportPDF } from './AuditReportPDF'

function MonthlyAuditSummary({ farmId, farmName, auditId, monthYear, onClose }) {
    const supabase = useSupabase()
    const [form07Data, setForm07Data] = useState([])
    const [form08Data, setForm08Data] = useState([])
    const [form08Comments, setForm08Comments] = useState([])
    const [form08MonthlyInspections, setForm08MonthlyInspections] = useState(null)
    const [form09Data, setForm09Data] = useState([])
    const [form10Data, setForm10Data] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedForm, setSelectedForm] = useState('form08')

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Form 07 - Production & Cooler
                const { data: prod } = await supabase
                    .from('production_cooler_records')
                    .select('*')
                    .eq('audit_id', auditId)

                const { data: sanit, error: sanitError } = await supabase
                    .from('sanitation_records')
                    .select('*')
                    .eq('audit_id', auditId)

                // Form 08 - Welfare
                // Step 1: get welfare_records entry for this barn/audit
                const { data: welfareRecord } = await supabase
                    .from('welfare_records')
                    .select('id, monthly_comments')
                    .eq('audit_id', auditId)
                    .maybeSingle()

                let welfare = []
                let weeklyInspections = []
                let monthlyInspections = null

                if (welfareRecord) {
                    // Step 2: fetch daily checks
                    const { data: dailyChecks } = await supabase
                        .from('welfare_daily_checks')
                        .select('*')
                        .eq('welfare_id', welfareRecord.id)
                        .order('record_date')

                    // Step 3: fetch weekly inspections
                    const { data: weekly } = await supabase
                        .from('welfare_weekly_inspections')
                        .select('*')
                        .eq('welfare_id', welfareRecord.id)
                        .order('inspection_date')

                    welfare = dailyChecks || []
                    weeklyInspections = weekly || []
                    monthlyInspections = welfareRecord
                }

                // Form 09 - Feed & Water
                const { data: feed, error: feedError } = await supabase
                    .from('feed_water_records')
                    .select('*')
                    .eq('audit_id', auditId)
                    .order('day_of_month')

                // Form 10 - Pest Control
                const { data: pest, error: pestError } = await supabase
                    .from('pest_control_records')
                    .select('*')
                    .eq('audit_id', auditId)
                    .order('day_of_month')

                setForm07Data({ production: prod || [], sanitation: sanit || [] })
                setForm08Data(welfare)
                setForm08Comments(weeklyInspections)
                setForm08MonthlyInspections(monthlyInspections)
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

    const handleDownloadPDF = async () => {
        try {
            const doc = <AuditReportPDF
                farmName={farmName}
                monthYear={monthYear}
                form08Data={form08Data}
                form08Comments={form08Comments}
                form08MonthlyInspections={form08MonthlyInspections}
            />
            const asPdf = pdf(doc)
            asPdf.toBlob().then((blob) => {
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `Audit_${farmName}_${monthYear}.pdf`
                link.click()
                URL.revokeObjectURL(url)
            })
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Error generating PDF: ' + error.message)
        }
    }

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

            {/* Form Selector */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
                <button
                    onClick={() => setSelectedForm('form07')}
                    style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        backgroundColor: selectedForm === 'form07' ? '#0066cc' : '#ddd',
                        color: selectedForm === 'form07' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                    Form 07 - Production
                </button>
                <button
                    onClick={() => setSelectedForm('form08')}
                    style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        backgroundColor: selectedForm === 'form08' ? '#0066cc' : '#ddd',
                        color: selectedForm === 'form08' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                    Form 08 - Welfare
                </button>
                <button
                    onClick={() => setSelectedForm('form09')}
                    style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        backgroundColor: selectedForm === 'form09' ? '#0066cc' : '#ddd',
                        color: selectedForm === 'form09' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                    Form 09 - Feed Water
                </button>
                <button
                    onClick={() => setSelectedForm('form10')}
                    style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        backgroundColor: selectedForm === 'form10' ? '#0066cc' : '#ddd',
                        color: selectedForm === 'form10' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                    Form 10 - Pest Control
                </button>
            </div>

            {/* Form 07 */}
            {selectedForm === 'form07' && (
                <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
                    <h2 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px', color: '#000', fontWeight: 'bold' }}>
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
            )}

            {/* Form 08 */}
            {selectedForm === 'form08' && (
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px', color: '#000', fontWeight: 'bold' }}>
                        Form 08 - Welfare Records - Page 1 ({form08Data.length} days)
                    </h2>
                    {form08Data.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '9px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f0f0f0' }}>
                                    <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>Date</th>
                                    <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>Barn HI</th>
                                    <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>Barn LO</th>
                                    <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>Ext Temp</th>

                                    <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>Walls</th>
                                    <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>Manure</th>
                                    <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>Bedding</th>
                                    <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>Chemicals</th>
                                    <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>AM Init</th>
                                    <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>PM Init</th>
                                </tr>
                            </thead>
                            <tbody>
                                {form08Data.map((record) => (
                                    <tr key={record.record_date}>
                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontSize: '9px' }}>{record.record_date}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{record.barn_temp_hi}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{record.barn_temp_lo}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{record.exterior_temp}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{record.floor_sanitation_code || ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{record.walls_sanitation_code || ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{record.manure_sanitation_code || ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontSize: '8px' }}>{record.bedding_notes || ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontSize: '8px' }}>{record.chemicals_notes || ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{record.hen_inspection_am || ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{record.hen_inspection_pm || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: '#999', fontStyle: 'italic' }}>No welfare records entered</p>
                    )}

                    {/* Page Break */}
                    <div style={{ pageBreakAfter: 'always', marginBottom: '30px', borderTop: '2px dashed #999', paddingTop: '20px' }} />

                    {/* PAGE 2 - Equipment & Weekly Inspection */}
                    <h2 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px', color: '#000', fontWeight: 'bold' }}>
                        Form 08 - Welfare Records - Page 2 (Equipment & Inspection)
                    </h2>
                    {form08Comments.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '8px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f0f0f0' }}>
                                    <th style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Date</th>
                                    <th style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Appearance</th>
                                    <th style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Sound</th>
                                    <th style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Behavior</th>
                                    <th style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Disease</th>
                                    <th style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Injured</th>
                                    <th style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Trapped</th>
                                    <th style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Dead</th>
                                    <th style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Feed/Water</th>
                                    <th style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Equipment</th>
                                    <th style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Amenities</th>
                                    <th style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Lay Facility</th>
                                    <th style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {form08Comments.map((record) => (
                                    <tr key={record.inspection_date}>
                                        <td style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center', fontSize: '8px' }}>{record.inspection_date}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center' }}>{record.check_overall_appearance ? '✓' : ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center' }}>{record.check_general_sound ? '✓' : ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center' }}>{record.check_abnormal_behavior ? '✓' : ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center' }}>{record.check_disease_illness ? '✓' : ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center' }}>{record.check_injured_birds ? '✓' : ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center' }}>{record.check_trapped_birds ? '✓' : ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center' }}>{record.check_dead_birds ? '✓' : ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center' }}>{record.check_feed_water_available ? '✓' : ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center' }}>{record.check_equipment_operating ? '✓' : ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center' }}>{record.check_amenities_condition ? '✓' : ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '3px', textAlign: 'center' }}>{record.check_lay_facility ? '✓' : ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '3px', fontSize: '8px' }}>{record.comments || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: '#999', fontStyle: 'italic' }}>No inspection records entered</p>
                    )}

                    {/* Monthly Comments */}
                    {form08MonthlyInspections?.monthly_comments && (
                        <div style={{ marginTop: '30px', marginBottom: '30px', pageBreakInside: 'avoid' }}>
                            <h3 style={{ fontSize: '12px', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px', color: '#000', fontWeight: 'bold' }}>
                                Monthly Comments
                            </h3>
                            <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #ddd', padding: '10px', borderRadius: '4px', fontSize: '10px', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                {form08MonthlyInspections.monthly_comments}
                            </div>
                        </div>
                    )}

                    {/* Signature Section */}
                    <div style={{ marginTop: '50px', pageBreakInside: 'avoid' }}>
                        <div style={{ display: 'flex', gap: '100px' }}>
                            <div style={{ flex: '1' }}>
                                <div style={{ borderBottom: '1px solid #333', height: '50px', marginBottom: '8px' }} />
                                <p style={{ margin: '0', fontSize: '11px', fontWeight: 'bold' }}>Signature</p>
                            </div>
                            <div style={{ flex: '1' }}>
                                <div style={{ borderBottom: '1px solid #333', height: '50px', marginBottom: '8px' }} />
                                <p style={{ margin: '0', fontSize: '11px', fontWeight: 'bold' }}>Date</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form 09 */}
            {selectedForm === 'form09' && (
                <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
                    <h2 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px', color: '#000', fontWeight: 'bold' }}>
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
            )}

            {/* Form 10 */}
            {selectedForm === 'form10' && (
                <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
                    <h2 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px', color: '#000', fontWeight: 'bold' }}>
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
            )}

            {/* Print Button */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px', borderTop: '2px solid #ccc', paddingTop: '20px' }}>
                <button onClick={handleDownloadPDF} style={{
                    padding: '10px 30px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    📥 Download as PDF
                </button>
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
                    🖨 Print to Paper
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
