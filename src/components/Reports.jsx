import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function Reports({ farmId, farmName }) {
    const [audits, setAudits] = useState([])
    const [filteredAudits, setFilteredAudits] = useState([])
    const [searchMonth, setSearchMonth] = useState('')
    const [loading, setLoading] = useState(true)

    // Fetch all monthly audits for the farm
    useEffect(() => {
        const fetchAudits = async () => {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('monthly_audits')
                    .select('*')
                    .eq('farm_id', farmId)
                    .order('month_year', { ascending: false })

                if (error) throw error
                setAudits(data || [])
                setFilteredAudits(data || [])
            } catch (err) {
                console.error('Error fetching audits:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchAudits()
    }, [farmId])

    // Filter audits by month search
    const handleSearch = (e) => {
        const value = e.target.value
        setSearchMonth(value)

        if (!value) {
            setFilteredAudits(audits)
        } else {
            const filtered = audits.filter(audit =>
                audit.month_year.includes(value)
            )
            setFilteredAudits(filtered)
        }
    }

    // Calculate days remaining for incomplete form
    const getDaysRemaining = (completed, completedDate, monthYear) => {
        if (completed) return null

        const auditMonth = new Date(monthYear)
        const daysInMonth = new Date(auditMonth.getFullYear(), auditMonth.getMonth() + 1, 0).getDate()
        const today = new Date()

        // If audit is a past month, show 0 days remaining
        if (new Date(monthYear).getMonth() < today.getMonth()) {
            return 0
        }

        // Current month - calculate remaining days
        return Math.max(0, daysInMonth - today.getDate())
    }

    // Format date for display
    const formatMonth = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    }

    // Get form status badge
    const FormStatusBadge = ({ completed, completedDate, monthYear, formName }) => {
        const daysRemaining = getDaysRemaining(completed, completedDate, monthYear)

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

        return (
            <div style={{
                padding: '8px 12px',
                backgroundColor: daysRemaining <= 3 ? '#dc3545' : '#ffc107',
                color: daysRemaining <= 3 ? 'white' : '#333',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                textAlign: 'center'
            }}>
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
            </div>
        )
    }

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px' }}>
                📊 Monthly Compliance Reports - {farmName}
            </h2>

            {/* Search */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                    Search by Month (YYYY-MM)
                </label>
                <input
                    type="text"
                    placeholder="e.g., 2026-03 or 2026"
                    value={searchMonth}
                    onChange={handleSearch}
                    style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '10px',
                        fontSize: '14px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
            </div>

            {/* Loading */}
            {loading && <p style={{ textAlign: 'center', color: '#666' }}>Loading reports...</p>}

            {/* No results */}
            {!loading && filteredAudits.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                    No audits found for "{searchMonth}"
                </p>
            )}

            {/* Audits table */}
            {!loading && filteredAudits.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #333' }}>
                                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>
                                    Month
                                </th>
                                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                                    Form 07 - Production
                                </th>
                                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                                    Form 08 - Welfare
                                </th>
                                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                                    Form 09 - Feed Water
                                </th>
                                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                                    Form 10 - Pest Control
                                </th>
                                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                                    Overall Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAudits.map((audit) => {
                                const allComplete = audit.form_07_completed && audit.form_08_completed && audit.form_09_completed && audit.form_10_completed
                                const completedCount = [
                                    audit.form_07_completed,
                                    audit.form_08_completed,
                                    audit.form_09_completed,
                                    audit.form_10_completed
                                ].filter(Boolean).length

                                return (
                                    <tr key={audit.id} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                                            {formatMonth(audit.month_year)}
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                                            <FormStatusBadge
                                                completed={audit.form_07_completed}
                                                completedDate={audit.form_07_completed_date}
                                                monthYear={audit.month_year}
                                                formName="Form 07"
                                            />
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                                            <FormStatusBadge
                                                completed={audit.form_08_completed}
                                                completedDate={audit.form_08_completed_date}
                                                monthYear={audit.month_year}
                                                formName="Form 08"
                                            />
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                                            <FormStatusBadge
                                                completed={audit.form_09_completed}
                                                completedDate={audit.form_09_completed_date}
                                                monthYear={audit.month_year}
                                                formName="Form 09"
                                            />
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                                            <FormStatusBadge
                                                completed={audit.form_10_completed}
                                                completedDate={audit.form_10_completed_date}
                                                monthYear={audit.month_year}
                                                formName="Form 10"
                                            />
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                                            <div style={{
                                                padding: '8px 12px',
                                                backgroundColor: allComplete ? '#28a745' : '#ffc107',
                                                color: allComplete ? 'white' : '#333',
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }}>
                                                {allComplete ? '✓ All Complete' : `${completedCount}/4 Forms`}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Summary */}
            {!loading && filteredAudits.length > 0 && (
                <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #0066cc' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Summary</h3>
                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                        Showing <strong>{filteredAudits.length}</strong> month{filteredAudits.length !== 1 ? 's' : ''} of reports
                    </p>
                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                        <strong>{filteredAudits.filter(a => a.form_07_completed && a.form_08_completed && a.form_09_completed && a.form_10_completed).length}</strong> fully completed
                    </p>
                </div>
            )}
        </div>
    )
}

export default Reports
