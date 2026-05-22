import { useState, useEffect } from 'react'
import { pdf } from '@react-pdf/renderer'
import { useSupabase } from '../contexts/SupabaseContext'
import { AuditReportPDF } from './AuditReportPDF'
import { ProductionReportPDF } from './ProductionReportPDF'
import { FeedWaterReportPDF } from './FeedWaterReportPDF'
import { PestControlReportPDF } from './PestControlReportPDF'

function MonthlyAuditSummary({ farmId, farmName, barnId, auditId, monthYear, onClose }) {
    const supabase = useSupabase()
    const [form07Data, setForm07Data] = useState([])
    const [form08Data, setForm08Data] = useState([])
    const [form08Comments, setForm08Comments] = useState([])
    const [form08MonthlyInspections, setForm08MonthlyInspections] = useState(null)
    const [form08AmmoniaData, setForm08AmmoniaData] = useState([])
    const [barnNumber, setBarnNumber] = useState('')
    const [form09Data, setForm09Data] = useState({ fwRecord: null, daily: [], health: [], metadata: {} })
    const [form10Data, setForm10Data] = useState({ pestRecord: null, daily: [], audit: {} })
    const [loading, setLoading] = useState(true)
    const [selectedForm, setSelectedForm] = useState('form08')

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Form 07 - Production & Cooler
                const { data: prodRecord } = await supabase
                    .from('production_cooler_records')
                    .select('*')
                    .eq('barn_id', barnId)
                    .eq('audit_id', auditId)
                    .maybeSingle()

                let form07FlockAge = []
                let form07FloorEggs = []
                let form07EggOutput = []
                let form07CoolerTemps = []
                let form07Sanitation = []
                let form07ThermCal = []

                if (prodRecord) {
                    const [fa, fe, eo, ct, san, tc] = await Promise.all([
                        supabase.from('production_flock_age').select('*').eq('production_id', prodRecord.id).order('record_date'),
                        supabase.from('production_floor_eggs').select('*').eq('production_id', prodRecord.id).order('record_date'),
                        supabase.from('production_egg_output').select('*').eq('production_id', prodRecord.id).order('record_date'),
                        supabase.from('production_cooler_temps').select('*').eq('production_id', prodRecord.id).order('record_date'),
                        supabase.from('production_sanitation').select('*').eq('production_id', prodRecord.id).order('record_date'),
                        supabase.from('production_thermometer_calibration').select('*').eq('production_id', prodRecord.id).order('calibration_date'),
                    ])
                    form07FlockAge = fa.data || []
                    form07FloorEggs = fe.data || []
                    form07EggOutput = eo.data || []
                    form07CoolerTemps = ct.data || []
                    form07Sanitation = san.data || []
                    form07ThermCal = tc.data || []
                }

                // Form 08 - Welfare
                // Step 1: get welfare_records entry (join barns to get barn_number)
                const { data: welfareRecord } = await supabase
                    .from('welfare_records')
                    .select('id, monthly_comments, barns(barn_name)')
                    .eq('barn_id', barnId)
                    .eq('audit_id', auditId)
                    .maybeSingle()

                let welfare = []
                let weeklyInspections = []
                let monthlyInspections = null
                let ammoniaTests = []

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

                    // Step 4: fetch monthly checks (ammonia + alarm + generator)
                    const { data: ammonia } = await supabase
                        .from('welfare_monthly_checks')
                        .select('*')
                        .eq('welfare_id', welfareRecord.id)
                        .maybeSingle()

                    welfare = dailyChecks || []
                    weeklyInspections = weekly || []
                    monthlyInspections = welfareRecord
                    ammoniaTests = ammonia ? [ammonia] : []
                }

                // Form 09 - Feed & Water
                const { data: fwRecord } = await supabase
                    .from('feed_water_records')
                    .select('*')
                    .eq('barn_id', barnId)
                    .eq('audit_id', auditId)
                    .maybeSingle()

                let fw09Daily = [], fw09Health = [], fw09Meta = {}
                if (fwRecord) {
                    const [fwD, fwH, fwM] = await Promise.all([
                        supabase.from('feed_water_daily').select('*').eq('fw_id', fwRecord.id).order('record_date'),
                        supabase.from('feed_water_health').select('*').eq('fw_id', fwRecord.id).order('record_date'),
                        supabase.from('feed_water_monthly_metadata').select('*').eq('fw_id', fwRecord.id).maybeSingle(),
                    ])
                    fw09Daily = fwD.data || []
                    fw09Health = fwH.data || []
                    fw09Meta = fwM.data || {}
                }

                // Form 10 - Pest Control
                const { data: pestRecord } = await supabase
                    .from('pest_control_records')
                    .select('*')
                    .eq('barn_id', barnId)
                    .eq('audit_id', auditId)
                    .maybeSingle()

                let pest10Daily = [], pest10Audit = {}
                if (pestRecord) {
                    const [pd, pa] = await Promise.all([
                        supabase.from('pest_daily_observations').select('*').eq('pest_id', pestRecord.id).order('record_date'),
                        supabase.from('pest_monthly_audit').select('*').eq('pest_id', pestRecord.id).maybeSingle(),
                    ])
                    pest10Daily = pd.data || []
                    pest10Audit = pa.data || {}
                }

                setForm07Data({ record: prodRecord, flockAge: form07FlockAge, floorEggs: form07FloorEggs, eggOutput: form07EggOutput, coolerTemps: form07CoolerTemps, sanitation: form07Sanitation, thermCal: form07ThermCal })
                setForm08Data(welfare)
                setForm08Comments(weeklyInspections)
                setForm08MonthlyInspections(monthlyInspections)
                setForm08AmmoniaData(ammoniaTests)
                setBarnNumber(welfareRecord?.barns?.barn_name ?? '')
                setForm09Data({ fwRecord, daily: fw09Daily, health: fw09Health, metadata: fw09Meta })
                setForm10Data({ pestRecord, daily: pest10Daily, audit: pest10Audit })
            } catch (err) {
                console.error('Error fetching data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [auditId, barnId])

    const formatMonth = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    }

    if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Loading audit data...</p>

    const buildPDFDoc = () => {
        if (selectedForm === 'form07') {
            return {
                doc: <ProductionReportPDF
                    farmName={farmName}
                    barnNumber={barnNumber}
                    monthYear={monthYear}
                    form07Data={form07Data}
                />,
                filename: `Form07_${farmName}_${monthYear}.pdf`
            }
        } else if (selectedForm === 'form09') {
            return {
                doc: <FeedWaterReportPDF
                    farmName={farmName}
                    barnNumber={barnNumber}
                    monthYear={monthYear}
                    form09Data={form09Data}
                />,
                filename: `Form09_${farmName}_${monthYear}.pdf`
            }
        } else if (selectedForm === 'form10') {
            return {
                doc: <PestControlReportPDF
                    farmName={farmName}
                    barnNumber={barnNumber}
                    monthYear={monthYear}
                    form10Data={form10Data}
                />,
                filename: `Form10_${farmName}_${monthYear}.pdf`
            }
        } else {
            return {
                doc: <AuditReportPDF
                    farmName={farmName}
                    barnNumber={barnNumber}
                    monthYear={monthYear}
                    form08Data={form08Data}
                    form08Comments={form08Comments}
                    form08MonthlyInspections={form08MonthlyInspections}
                    form08AmmoniaData={form08AmmoniaData}
                />,
                filename: `Form08_${farmName}_${monthYear}.pdf`
            }
        }
    }

    const handleDownloadPDF = async () => {
        try {
            const { doc, filename } = buildPDFDoc()
            const asPdf = pdf(doc)
            asPdf.toBlob().then((blob) => {
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = filename
                link.click()
                URL.revokeObjectURL(url)
            }).catch((err) => {
                console.error('PDF generation failed:', err)
                alert('Error generating PDF: ' + err.message)
            })
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Error generating PDF: ' + error.message)
        }
    }

    const handlePrintPDF = async () => {
        try {
            const { doc } = buildPDFDoc()
            const blob = await pdf(doc).toBlob()
            const url = URL.createObjectURL(blob)

            const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

            if (isMobile) {
                // On mobile, open in a new tab — the device's native PDF viewer
                // provides a print/share option (works on iOS and Android)
                window.open(url, '_blank')
            } else {
                // On desktop, inject a hidden iframe and trigger the print dialog
                const iframe = document.createElement('iframe')
                iframe.style.cssText = 'position:fixed;width:0;height:0;border:0;'
                iframe.src = url
                document.body.appendChild(iframe)
                iframe.addEventListener('load', () => {
                    iframe.contentWindow.focus()
                    iframe.contentWindow.print()
                    // Clean up after the print dialog is done
                    setTimeout(() => {
                        document.body.removeChild(iframe)
                        URL.revokeObjectURL(url)
                    }, 60000)
                })
            }
        } catch (error) {
            console.error('Error printing PDF:', error)
            alert('Error generating PDF for print: ' + error.message)
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
            {selectedForm === 'form07' && (() => {
                // Build a date-keyed map merging all child tables
                const dateMap = {}
                const addToMap = (rows, key) => rows.forEach(r => {
                    if (!dateMap[r.record_date]) dateMap[r.record_date] = {}
                    dateMap[r.record_date][key] = r
                })
                addToMap(form07Data.flockAge || [], 'age')
                addToMap(form07Data.floorEggs || [], 'floor')
                addToMap(form07Data.eggOutput || [], 'egg')
                addToMap(form07Data.coolerTemps || [], 'cooler')
                addToMap(form07Data.sanitation || [], 'san')
                const dates = Object.keys(dateMap).sort()
                const rec = form07Data.record
                return (
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px', color: '#000', fontWeight: 'bold' }}>
                            Form 07 - Egg Production & Cooler Records
                        </h2>

                        {/* Page 1 table */}
                        {dates.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '10px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Date</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Age (wks)</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Floor #1</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Floor #2</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Floor Total</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Prod #1</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Prod #2</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Prod Daily</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>%</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Temp HI</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Temp LO</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>RH% HI</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>RH% LO</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dates.map(d => {
                                        const row = dateMap[d]
                                        return (
                                            <tr key={d}>
                                                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{d}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{row.age?.flock_age_weeks ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{row.floor?.collection_1 ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{row.floor?.collection_2 ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{row.floor?.floor_eggs_total ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{row.egg?.egg_production_1 ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{row.egg?.egg_production_2 ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{row.egg?.egg_production_daily ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{row.egg?.egg_production_percent ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{row.cooler?.cooler_temp_hi_celsius ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{row.cooler?.cooler_temp_lo_celsius ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{row.cooler?.cooler_rh_hi_percent ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{row.cooler?.cooler_rh_lo_percent ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{row.cooler?.cooler_check_time?.substring(0, 5) ?? ''}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>No daily production records entered</p>
                        )}

                        {/* Page 2 - Sanitation */}
                        {(form07Data.sanitation || []).length > 0 && (
                            <>
                                <h3 style={{ fontSize: '13px', marginBottom: '10px', marginTop: '20px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Sanitation</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '10px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                                            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Date</th>
                                            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Dirty Trays</th>
                                            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Egg Cooler</th>
                                            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Pack Room</th>
                                            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Tables/Equip</th>
                                            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Corrective Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(form07Data.sanitation || []).map(s => (
                                            <tr key={s.record_date}>
                                                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{s.record_date}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{s.dirty_trays_count ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{s.egg_cooler_sanitation_code ? '✓' : ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{s.pack_room_sanitation_code ? '✓' : ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{s.equip_sanitation_code ? '✓' : ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{s.corrective_actions ?? ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* Monthly Checks */}
                        {(rec?.monthly_corrective_actions || rec?.monthly_comments || (form07Data.thermCal || []).length > 0) && (
                            <div style={{ background: '#f0f7ff', border: '1px solid #b3d4f5', borderRadius: '6px', padding: '16px', marginTop: '16px' }}>
                                <h3 style={{ fontSize: '13px', margin: '0 0 12px 0', fontWeight: 'bold' }}>Monthly Checks</h3>
                                {(form07Data.thermCal || []).length > 0 && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <strong style={{ fontSize: '11px' }}>Thermometer Calibration:</strong>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '6px', fontSize: '10px' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#dce8f8' }}>
                                                    <th style={{ border: '1px solid #ccc', padding: '4px' }}>Date</th>
                                                    <th style={{ border: '1px solid #ccc', padding: '4px' }}>Method</th>
                                                    <th style={{ border: '1px solid #ccc', padding: '4px' }}>Result</th>
                                                    <th style={{ border: '1px solid #ccc', padding: '4px' }}>Initials</th>
                                                    <th style={{ border: '1px solid #ccc', padding: '4px' }}>Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(form07Data.thermCal || []).map(tc => (
                                                    <tr key={tc.id}>
                                                        <td style={{ border: '1px solid #ccc', padding: '4px' }}>{tc.calibration_date}</td>
                                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{tc.method}</td>
                                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{tc.result_pass ? 'Pass' : 'Fail'}</td>
                                                        <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{tc.initials ?? ''}</td>
                                                        <td style={{ border: '1px solid #ccc', padding: '4px' }}>{tc.notes ?? ''}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {rec?.monthly_corrective_actions && (
                                    <div style={{ marginBottom: '8px', fontSize: '11px' }}>
                                        <strong>Corrective Actions:</strong> {rec.monthly_corrective_actions}
                                    </div>
                                )}
                                {rec?.monthly_comments && (
                                    <div style={{ fontSize: '11px' }}>
                                        <strong>Comments:</strong> {rec.monthly_comments}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })()}

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
                                    <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>Floors</th>
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
                        <>
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Inspection Comments — only rows that have a non-empty comment */}
                        </>
                    ) : (
                        <p style={{ color: '#999', fontStyle: 'italic' }}>No inspection records entered</p>
                    )}

                    {/* Monthly Checks Summary */}
                    {(() => {
                        const monthlyRec = form08AmmoniaData?.[0]
                        const alarmRec = monthlyRec?.alarm_check_date || monthlyRec?.alarm_check_initials ? monthlyRec : null
                        const generatorRec = monthlyRec?.generator_check_date || monthlyRec?.generator_check_initials ? monthlyRec : null
                        const ammoniaRec = monthlyRec?.ammonia_ppm_range ? monthlyRec : null
                        const hasAny = alarmRec || generatorRec || ammoniaRec || form08MonthlyInspections?.monthly_comments?.trim()
                        if (!hasAny) return null
                        return (
                            <div style={{ marginTop: '20px', border: '1px solid #ccc', borderRadius: '6px', overflow: 'hidden' }}>
                                <div style={{ backgroundColor: '#f0f0f0', padding: '8px 12px', borderBottom: '1px solid #ccc' }}>
                                    <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Monthly Checks</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0', borderBottom: '1px solid #ccc' }}>
                                    <div style={{ padding: '10px 12px', borderRight: '1px solid #ccc' }}>
                                        <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 'bold' }}>Ammonia Test</p>
                                        {ammoniaRec ? (
                                            <p style={{ margin: 0, fontSize: '11px' }}>{ammoniaRec.ammonia_ppm_range} ppm</p>
                                        ) : (
                                            <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>Not recorded</p>
                                        )}
                                    </div>
                                    <div style={{ padding: '10px 12px', borderRight: '1px solid #ccc' }}>
                                        <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 'bold' }}>Alarm Check</p>
                                        {alarmRec ? (
                                            <>
                                                <p style={{ margin: '0 0 2px', fontSize: '11px' }}>Date: {alarmRec.alarm_check_date || '—'}</p>
                                                <p style={{ margin: 0, fontSize: '11px' }}>Initials: {alarmRec.alarm_check_initials || '—'}</p>
                                            </>
                                        ) : (
                                            <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>Not recorded</p>
                                        )}
                                    </div>
                                    <div style={{ padding: '10px 12px' }}>
                                        <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 'bold' }}>Generator Check</p>
                                        {generatorRec ? (
                                            <>
                                                <p style={{ margin: '0 0 2px', fontSize: '11px' }}>Date: {generatorRec.generator_check_date || '—'}</p>
                                                <p style={{ margin: 0, fontSize: '11px' }}>Initials: {generatorRec.generator_check_initials || '—'}</p>
                                            </>
                                        ) : (
                                            <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>Not recorded</p>
                                        )}
                                    </div>
                                </div>
                                {form08MonthlyInspections?.monthly_comments?.trim() && (
                                    <div style={{ padding: '10px 12px' }}>
                                        <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 'bold' }}>Comments / Corrective Actions</p>
                                        <p style={{ margin: 0, fontSize: '11px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                            {form08MonthlyInspections.monthly_comments}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )
                    })()}

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
            {selectedForm === 'form09' && (() => {
                const dailyMap = {}
                    ; (form09Data.daily || []).forEach(r => { dailyMap[r.record_date] = r })
                const healthMap = {}
                    ; (form09Data.health || []).forEach(r => { healthMap[r.record_date] = r })
                const allDates = [...new Set([
                    ...(form09Data.daily || []).map(r => r.record_date),
                    ...(form09Data.health || []).map(r => r.record_date),
                ])].sort()
                const meta = form09Data.metadata || {}
                return (
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px', color: '#000', fontWeight: 'bold' }}>
                            Form 09 - Feed &amp; Water Records
                        </h2>
                        {allDates.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '9px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Date</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Feed Daily</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Feed Actual</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Water Daily</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Water Actual</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Flush</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Meds/Vit</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Treatment</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Mortality</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Reason</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Hospital Pen</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Inventory</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allDates.map(d => {
                                        const dl = dailyMap[d]
                                        const hl = healthMap[d]
                                        return (
                                            <tr key={d}>
                                                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{d}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{dl?.feed_daily ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{dl?.feed_actual ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{dl?.water_daily ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{dl?.water_actual ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{dl?.flush_notes ? '✓' : ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{dl?.meds_vit_notes ? '✓' : ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{dl?.treatment_notes ? '✓' : ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{hl?.mortality_daily ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{hl?.mortality_reason ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{hl?.hospital_pen_monitoring ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{hl?.inventory ?? ''}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>No feed &amp; water records entered</p>
                        )}

                        {/* Monthly Checks */}
                        {(meta.feed_target || meta.monthly_mortality_percent != null || meta.comments) && (
                            <div style={{ background: '#f0f7ff', border: '1px solid #b3d4f5', borderRadius: '6px', padding: '16px', marginTop: '8px' }}>
                                <h3 style={{ fontSize: '13px', margin: '0 0 12px 0', fontWeight: 'bold' }}>Monthly Checks</h3>
                                {meta.feed_target && (
                                    <div style={{ fontSize: '11px', marginBottom: '6px' }}><strong>Feed Target:</strong> {meta.feed_target}</div>
                                )}
                                {meta.monthly_mortality_percent != null && (
                                    <div style={{ fontSize: '11px', marginBottom: '6px' }}>
                                        <strong>Monthly Mortality:</strong> {meta.monthly_mortality_percent}%
                                        {meta.monthly_mortality_percent > 0.5 ? ' ⚠️ Notify EFO' : ''}
                                    </div>
                                )}
                                {meta.comments && (
                                    <div style={{ fontSize: '11px' }}><strong>Comments:</strong> {meta.comments}</div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })()}

            {/* Form 10 */}
            {selectedForm === 'form10' && (() => {
                const dailyMap = {}
                    ; (form10Data.daily || []).forEach(r => { dailyMap[r.record_date] = r })
                const dates = (form10Data.daily || []).map(r => r.record_date).sort()
                const audit = form10Data.audit || {}
                return (
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px', color: '#000', fontWeight: 'bold' }}>
                            Form 10 - Pest Control Records
                        </h2>
                        {dates.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '9px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Date</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Trap Findings</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Trap Location</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Bait Product</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Bait Location</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Birds on Range</th>
                                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Corrective Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dates.map(d => {
                                        const r = dailyMap[d]
                                        return (
                                            <tr key={d}>
                                                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{d}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{r?.trap_findings_notes ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{r?.trap_location ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{r?.bait_product ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{r?.bait_location ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>{r?.birds_on_range ?? ''}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{r?.corrective_actions ?? ''}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>No pest control daily records entered</p>
                        )}

                        {/* Monthly Audit Sections */}
                        {Object.keys(audit).length > 0 && (
                            <div style={{ background: '#f0f7ff', border: '1px solid #b3d4f5', borderRadius: '6px', padding: '16px', marginTop: '8px', fontSize: '11px' }}>
                                <h3 style={{ fontSize: '13px', margin: '0 0 12px 0', fontWeight: 'bold' }}>Monthly Audit</h3>
                                {audit.exterior_inspection_date && <div style={{ marginBottom: '4px' }}><strong>Exterior Inspection:</strong> {audit.exterior_inspection_date} — {audit.exterior_inspection_observation || ''}</div>}
                                {audit.wild_birds_observation && <div style={{ marginBottom: '4px' }}><strong>Wild Birds:</strong> {audit.wild_birds_observation}</div>}
                                {audit.fly_monitoring && <div style={{ marginBottom: '4px' }}><strong>Fly Monitoring:</strong> {audit.fly_monitoring}</div>}
                                {(audit.range_grass || audit.range_ponding_water || audit.range_rotation_harrow) && (
                                    <div style={{ marginBottom: '4px' }}>
                                        <strong>Range Management:</strong>{' '}
                                        {[audit.range_grass && `Grass: ${audit.range_grass}`, audit.range_ponding_water && `Ponding Water: ${audit.range_ponding_water}`, audit.range_rotation_harrow && `Rotation/Harrow: ${audit.range_rotation_harrow}`, audit.range_wild_bird_deterrents && `Wild Bird Deterrents: ${audit.range_wild_bird_deterrents}`, audit.range_gravel_fences && `Gravel/Fences: ${audit.range_gravel_fences}`, audit.range_other && `Other: ${audit.range_other}`].filter(Boolean).join(' | ')}
                                    </div>
                                )}
                                {audit.interior_inspection_date && <div style={{ marginBottom: '4px' }}><strong>Interior Inspection:</strong> {audit.interior_inspection_date} — {audit.interior_inspection_observation || ''}</div>}
                                {audit.rodent_index && <div style={{ marginBottom: '4px' }}><strong>Rodent Index:</strong> {audit.rodent_index}</div>}
                                {audit.comments && <div style={{ marginBottom: '4px' }}><strong>Comments:</strong> {audit.comments}</div>}
                            </div>
                        )}
                    </div>
                )
            })()}

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
                <button onClick={handlePrintPDF} style={{
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
