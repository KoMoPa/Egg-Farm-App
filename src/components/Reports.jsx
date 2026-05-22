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
    const [barnFormStatus, setBarnFormStatus] = useState({ f07: false, f08: false, f09: false, f10: false })

    // Fetch barn-level record existence for the selected barn + audit
    useEffect(() => {
        const checkBarnForms = async () => {
            if (!selectedBarn?.id || !selectedAuditId) {
                setBarnFormStatus({ f07: false, f08: false, f09: false, f10: false })
                return
            }
            const [r07, r08, r09, r10] = await Promise.all([
                supabase.from('production_cooler_records').select('id').eq('barn_id', selectedBarn.id).eq('audit_id', selectedAuditId).maybeSingle(),
                supabase.from('welfare_records').select('id').eq('barn_id', selectedBarn.id).eq('audit_id', selectedAuditId).maybeSingle(),
                supabase.from('feed_water_records').select('id').eq('barn_id', selectedBarn.id).eq('audit_id', selectedAuditId).maybeSingle(),
                supabase.from('pest_control_records').select('id').eq('barn_id', selectedBarn.id).eq('audit_id', selectedAuditId).maybeSingle(),
            ])
            setBarnFormStatus({
                f07: !!r07.data,
                f08: !!r08.data,
                f09: !!r09.data,
                f10: !!r10.data,
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

    // Calculate days remaining for incomplete form
    const getDaysRemaining = (completed, monthYear) => {
        if (completed) return null


        // Parse year/month directly from the "YYYY-MM-DD" string to avoid UTC
        // timezone shifting (new Date("YYYY-MM-DD") is parsed as UTC midnight,
        // so .getMonth() returns the previous month for Ontario -4 UTC farmers)
        const parts = monthYear.split('-')
        const auditYear = parseInt(parts[0], 10)
        const auditMonth = parseInt(parts[1], 10) - 1  // 0-indexed

        const daysInMonth = new Date(auditYear, auditMonth + 1, 0).getDate()

        const today = new Date()
        const todayYear = today.getFullYear()
        const todayMonth = today.getMonth()


        // If audit is a past year or past month, show 0 days remaining
        if (auditYear < todayYear || (auditYear === todayYear && auditMonth < todayMonth)) {

            return 0
        }

        // Current month - calculate remaining days
        return Math.max(0, daysInMonth - today.getDate())
    }

    // Form status box component
    const FormStatusBox = ({ completed, monthYear, formNumber, formName }) => {
        const daysRemaining = getDaysRemaining(completed, monthYear)

        if (completed) {
            return (
                <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    ✓ Complete
                </div>
            )
        }

        const isUrgent = daysRemaining !== null && daysRemaining <= 3
        return (
            <div style={{
                padding: '8px 12px',
                backgroundColor: isUrgent ? '#dc3545' : '#ffc107',
                color: isUrgent ? 'white' : '#333',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                textAlign: 'center'
            }}>
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
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
            <h2 style={{ margin: '0 0 30px 0', fontSize: '24px', fontWeight: 700, color: '#0066cc' }}>
                📊 Monthly Compliance Reports
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
                                backgroundColor: canGoPrevious ? '#0066cc' : '#ccc',
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
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0066cc', marginBottom: '4px' }}>
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
                                backgroundColor: canGoNext ? '#0066cc' : '#ccc',
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

                    {/* Month Summary */}
                    <div style={{
                        marginBottom: '30px',
                        padding: '20px',
                        backgroundColor: '#f0f7ff',
                        borderRadius: '8px',
                        border: '1px solid #d0e8ff'
                    }}>
                        {(() => {
                            const completed = [
                                barnFormStatus.f07,
                                barnFormStatus.f08,
                                barnFormStatus.f09,
                                barnFormStatus.f10,
                            ].filter(Boolean).length
                            const total = 4
                            const allComplete = completed === total

                            return (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '32px',
                                        fontWeight: 'bold',
                                        color: allComplete ? '#28a745' : '#ffc107',
                                        marginBottom: '8px'
                                    }}>
                                        {completed}/{total} Forms Complete
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        {allComplete
                                            ? '✓ All compliance records submitted for this month'
                                            : `${total - completed} form${total - completed !== 1 ? 's' : ''} remaining`}
                                    </div>
                                </div>
                            )
                        })()}
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
                                completed={barnFormStatus.f07}
                                monthYear={selectedMonth}
                                formNumber="07"
                                formName="Daily Production"
                            />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                                Form 08
                            </div>
                            <FormStatusBox
                                completed={barnFormStatus.f08}
                                monthYear={selectedMonth}
                                formNumber="08"
                                formName="Welfare Records"
                            />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                                Form 09
                            </div>
                            <FormStatusBox
                                completed={barnFormStatus.f09}
                                monthYear={selectedMonth}
                                formNumber="09"
                                formName="Feed & Water"
                            />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                                Form 10
                            </div>
                            <FormStatusBox
                                completed={barnFormStatus.f10}
                                monthYear={selectedMonth}
                                formNumber="10"
                                formName="Pest Control"
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
                                backgroundColor: '#0066cc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0, 102, 204, 0.3)',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#0052a3'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#0066cc'}>
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
