import { useState, useEffect } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { useFarmContext } from '../contexts/FarmContext'
import MonthlyAuditSummary from './MonthlyAuditSummary'

function Reports() {
    const supabase = useSupabase()
    const { farm, selectedBarn } = useFarmContext()
    const [audits, setAudits] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedMonth, setSelectedMonth] = useState(null)
    const [selectedAuditId, setSelectedAuditId] = useState(null)
    const [showPrintModal, setShowPrintModal] = useState(false)
    const [barnFormStatus, setBarnFormStatus] = useState({ f07: 0, f08: 0, f09: 0, f10: 0 })

    // Fetch day counts for each form for the selected barn + audit
    useEffect(() => {
        const checkBarnForms = async () => {
            if (!selectedBarn?.id || !selectedAuditId) {
                setBarnFormStatus({ f07: 0, f08: 0, f09: 0, f10: 0 })
                return
            }
            const [r07, r08, r09, r10] = await Promise.all([
                supabase.from('production_cooler_records').select('id').eq('barn_id', selectedBarn.id).eq('audit_id', selectedAuditId).maybeSingle(),
                supabase.from('welfare_records').select('id').eq('barn_id', selectedBarn.id).eq('audit_id', selectedAuditId).maybeSingle(),
                supabase.from('feed_water_records').select('id').eq('barn_id', selectedBarn.id).eq('audit_id', selectedAuditId).maybeSingle(),
                supabase.from('pest_control_records').select('id').eq('barn_id', selectedBarn.id).eq('audit_id', selectedAuditId).maybeSingle(),
            ])
            const [c07, c08, c09, c10] = await Promise.all([
                r07.data ? supabase.from('production_egg_output').select('record_date', { count: 'exact', head: true }).eq('production_id', r07.data.id) : Promise.resolve({ count: 0 }),
                r08.data ? supabase.from('welfare_daily_checks').select('record_date', { count: 'exact', head: true }).eq('welfare_id', r08.data.id) : Promise.resolve({ count: 0 }),
                r09.data ? supabase.from('feed_water_daily').select('record_date', { count: 'exact', head: true }).eq('fw_id', r09.data.id) : Promise.resolve({ count: 0 }),
                r10.data ? supabase.from('pest_daily_observations').select('record_date', { count: 'exact', head: true }).eq('pest_id', r10.data.id) : Promise.resolve({ count: 0 }),
            ])
            setBarnFormStatus({
                f07: c07.count ?? 0,
                f08: c08.count ?? 0,
                f09: c09.count ?? 0,
                f10: c10.count ?? 0,
            })
        }
        checkBarnForms()
    }, [selectedBarn?.id, selectedAuditId])

    // Fetch all monthly audits for the farm
    useEffect(() => {
        const fetchAudits = async () => {
            if (!farm?.id) return

            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('monthly_audits')
                    .select('*')
                    .eq('farm_id', farm.id)
                    .order('month_year', { ascending: false })

                if (error) throw error
                setAudits(data || [])

                // Set initial selected month to most recent
                if (data && data.length > 0) {
                    setSelectedMonth(data[0].month_year)
                    setSelectedAuditId(data[0].id)
                } else {
                    setSelectedMonth(null)
                    setSelectedAuditId(null)
                }
            } catch (err) {
                console.error('Error fetching audits:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchAudits()
    }, [farm?.id, selectedBarn?.id])

    // Format date for display
    const formatMonth = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    }

    // Get current audit
    const currentAudit = audits.find(a => a.month_year === selectedMonth)

    // Form status box component — shows X/Y days recorded
    const FormStatusBox = ({ daysRecorded, daysInMonth }) => {
        const complete = daysRecorded >= daysInMonth
        if (complete) {
            return (
                <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    ✓ {daysRecorded}/{daysInMonth} days
                </div>
            )
        }
        return (
            <div style={{
                padding: '8px 12px',
                backgroundColor: daysRecorded === 0 ? '#f8f9fa' : '#ffc107',
                color: daysRecorded === 0 ? '#999' : '#333',
                border: daysRecorded === 0 ? '1px solid #ddd' : 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 'bold',
                textAlign: 'center'
            }}>
                {daysRecorded}/{daysInMonth} days
            </div>
        )
    }

    // Navigate to previous month
    const handlePreviousMonth = () => {
        const contentEl = document.querySelector('.app-content')
        if (contentEl) contentEl.scrollTop = 0
        const currentIndex = audits.findIndex(a => a.month_year === selectedMonth)
        if (currentIndex < audits.length - 1) {
            const prevAudit = audits[currentIndex + 1]
            setSelectedMonth(prevAudit.month_year)
            setSelectedAuditId(prevAudit.id)
        }
    }

    // Navigate to next month
    const handleNextMonth = () => {
        const contentEl = document.querySelector('.app-content')
        if (contentEl) contentEl.scrollTop = 0
        const currentIndex = audits.findIndex(a => a.month_year === selectedMonth)
        if (currentIndex > 0) {
            const nextAudit = audits[currentIndex - 1]
            setSelectedMonth(nextAudit.month_year)
            setSelectedAuditId(nextAudit.id)
        }
    }

    const currentIndex = audits.findIndex(a => a.month_year === selectedMonth)
    const canGoPrevious = currentIndex < audits.length - 1
    const canGoNext = currentIndex > 0

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ margin: '0 0 30px 0', fontSize: '24px', fontWeight: 700, color: '#2D855B', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/reports-icon.png" alt="Reports" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                <span>Monthly Compliance Reports</span>
            </h2>

            {loading && <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>Loading reports...</p>}

            {!loading && audits.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                    No audit records found. Start entering data in a form to create an audit.
                </p>
            )}

            {!loading && audits.length > 0 && currentAudit && (
                <>
                    {/* Month Selector Navigation */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '30px',
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                    }}>
                        <button
                            onClick={handlePreviousMonth}
                            disabled={!canGoPrevious}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: canGoPrevious ? '#2D855B' : '#ccc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: canGoPrevious ? 'pointer' : 'not-allowed',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}>
                            ← Previous
                        </button>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2D855B', marginBottom: '4px' }}>
                                {formatMonth(selectedMonth)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                {audits.findIndex(a => a.month_year === selectedMonth) + 1} of {audits.length}
                            </div>
                        </div>

                        <button
                            onClick={handleNextMonth}
                            disabled={!canGoNext}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: canGoNext ? '#2D855B' : '#ccc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: canGoNext ? 'pointer' : 'not-allowed',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}>
                            Next →
                        </button>
                    </div>

                    {/* Form Status Boxes */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '12px',
                        marginBottom: '30px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                                Form 07
                            </div>
                            <FormStatusBox
                                daysRecorded={barnFormStatus.f07}
                                daysInMonth={new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate()}
                            />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                                Form 08
                            </div>
                            <FormStatusBox
                                daysRecorded={barnFormStatus.f08}
                                daysInMonth={new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate()}
                            />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                                Form 09
                            </div>
                            <FormStatusBox
                                daysRecorded={barnFormStatus.f09}
                                daysInMonth={new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate()}
                            />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                                Form 10
                            </div>
                            <FormStatusBox
                                daysRecorded={barnFormStatus.f10}
                                daysInMonth={new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate()}
                            />
                        </div>
                    </div>

                    {/* Print Button */}
                    <div style={{ textAlign: 'center' }}>
                        <button
                            onClick={() => setShowPrintModal(true)}
                            style={{
                                padding: '16px 40px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                backgroundColor: '#2D855B',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(45, 133, 91, 0.3)',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#256d4a'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#2D855B'}>
                            🖨 Print Monthly Report
                        </button>
                    </div>
                </>
            )}

            {/* Print Modal */}
            {showPrintModal && selectedAuditId && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        width: '100%'
                    }}>
                        <MonthlyAuditSummary
                            farmId={farm?.id}
                            farmName={farm?.farm_name}
                            barnId={selectedBarn?.id}
                            auditId={selectedAuditId}
                            monthYear={selectedMonth}
                            onClose={() => setShowPrintModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default Reports
