import { useState } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { useFarmContext } from '../contexts/FarmContext'
import { usePushNotifications } from '../hooks/usePushNotifications'

export default function ProfilePage({ user, onClose }) {
    const supabase = useSupabase()
    const { farm, barns, reloadFarm } = useFarmContext()
    const { isSupported: pushSupported, isSubscribed, isLoading: pushLoading, error: pushError, subscribe, unsubscribe } = usePushNotifications()

    // Demo notification
    const [demoLoading, setDemoLoading] = useState(false)
    const [demoMsg, setDemoMsg] = useState(null)

    const handleDemoNotification = async () => {
        setDemoLoading(true)
        setDemoMsg(null)
        try {
            if (Notification.permission !== 'granted') {
                setDemoMsg({ type: 'error', text: 'Enable notifications first, then try again.' })
                return
            }
            const today = new Date()
            const monthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
            const monthLabel = today.toLocaleString('default', { month: 'long', year: 'numeric' })

            const { data: audit } = await supabase
                .from('monthly_audits')
                .select('form_07_completed, form_08_completed, form_09_completed, form_10_completed')
                .eq('farm_id', farm.id)
                .eq('month_year', monthYear)
                .maybeSingle()

            const anyCompleted = audit && (
                audit.form_07_completed ||
                audit.form_08_completed ||
                audit.form_09_completed ||
                audit.form_10_completed
            )

            if (anyCompleted) {
                setDemoMsg({ type: 'error', text: `At least one form is already completed for ${monthLabel} — complete the demo with a fresh month or incomplete records.` })
                return
            }

            const registration = await navigator.serviceWorker.ready
            await registration.showNotification('Compliance Forms Due', {
                body: `No compliance forms have been recorded yet for ${monthLabel}. Tap to stay on track.`,
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                data: { url: '/' },
                tag: 'demo-reminder',
            })
            setDemoMsg({ type: 'success', text: 'Demo notification sent!' })
        } catch (err) {
            setDemoMsg({ type: 'error', text: err.message })
        } finally {
            setDemoLoading(false)
        }
    }

    // Farm name edit
    const [farmName, setFarmName] = useState(farm?.farm_name ?? '')
    const [farmSaving, setFarmSaving] = useState(false)
    const [farmMsg, setFarmMsg] = useState(null) // { type: 'success'|'error', text }

    // Password change
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [pwSaving, setPwSaving] = useState(false)
    const [pwMsg, setPwMsg] = useState(null)
    const [showPwForm, setShowPwForm] = useState(false)

    const handleSaveFarmName = async () => {
        const trimmed = farmName.trim()
        if (!trimmed) return
        if (trimmed === farm?.farm_name) {
            setFarmMsg({ type: 'error', text: 'No changes to save.' })
            return
        }
        setFarmSaving(true)
        setFarmMsg(null)
        try {
            const { error } = await supabase
                .from('farms')
                .update({ farm_name: trimmed })
                .eq('id', farm.id)
            if (error) throw error
            await reloadFarm()
            setFarmMsg({ type: 'success', text: 'Farm name updated.' })
        } catch (err) {
            setFarmMsg({ type: 'error', text: err.message })
        } finally {
            setFarmSaving(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setPwMsg({ type: 'error', text: 'Passwords do not match.' })
            return
        }
        if (newPassword.length < 6) {
            setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' })
            return
        }
        setPwSaving(true)
        setPwMsg(null)
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) throw error
            setPwMsg({ type: 'success', text: 'Password updated successfully.' })
            setNewPassword('')
            setConfirmPassword('')
            setShowPwForm(false)
        } catch (err) {
            setPwMsg({ type: 'error', text: err.message })
        } finally {
            setPwSaving(false)
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #ccc',
        borderRadius: '6px',
        fontSize: '15px',
        boxSizing: 'border-box',
    }

    const btnPrimary = {
        padding: '9px 20px',
        background: '#2D855B',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    }

    const btnSecondary = {
        padding: '9px 20px',
        background: '#ddd',
        color: '#333',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', color: '#111' }}>My Profile</h2>
                <button onClick={onClose} style={{ ...btnSecondary, padding: '7px 16px' }}>← Back</button>
            </div>

            {/* ── Account section ── */}
            <section style={{ background: 'white', borderRadius: '10px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: '700', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Account</h3>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                    <div style={{ ...inputStyle, background: '#f5f5f5', color: '#666', cursor: 'default' }}>{user.email}</div>
                </div>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                        {!showPwForm && (
                            <button
                                type="button"
                                onClick={() => { setShowPwForm(true); setPwMsg(null) }}
                                style={{ ...btnSecondary, padding: '6px 14px', fontSize: '13px' }}>
                                Change Password
                            </button>
                        )}
                    </div>

                    {showPwForm && (
                        <form onSubmit={handleChangePassword}>
                            <div style={{ marginBottom: '12px' }}>
                                <input
                                    type="password"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ marginBottom: '14px' }}>
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            {pwMsg && (
                                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: pwMsg.type === 'success' ? '#2D855B' : '#c00', fontWeight: '600' }}>
                                    {pwMsg.text}
                                </p>
                            )}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" disabled={pwSaving} style={btnPrimary}>
                                    {pwSaving ? 'Saving…' : 'Update Password'}
                                </button>
                                <button type="button" onClick={() => { setShowPwForm(false); setNewPassword(''); setConfirmPassword(''); setPwMsg(null) }} style={btnSecondary}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {!showPwForm && pwMsg?.type === 'success' && (
                        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#2D855B', fontWeight: '600' }}>{pwMsg.text}</p>
                    )}
                </div>
            </section>

            {/* ── Farm section ── */}
            <section style={{ background: 'white', borderRadius: '10px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: '700', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Farm</h3>

                <div style={{ marginBottom: '6px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Farm Name</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={farmName}
                            onChange={e => { setFarmName(e.target.value); setFarmMsg(null) }}
                            maxLength={100}
                            style={{ ...inputStyle, flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={handleSaveFarmName}
                            disabled={farmSaving || !farmName.trim()}
                            style={{ ...btnPrimary, flexShrink: 0 }}>
                            {farmSaving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                    {farmMsg && (
                        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: farmMsg.type === 'success' ? '#2D855B' : '#c00', fontWeight: '600' }}>
                            {farmMsg.text}
                        </p>
                    )}
                </div>
            </section>

            {/* ── Notifications section ── */}
            <section style={{ background: 'white', borderRadius: '10px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: '700', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Notifications</h3>

                {!pushSupported ? (
                    <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>
                        Push notifications are not supported by this browser.
                    </p>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                                    Form 10 Pest Control Reminders
                                </div>
                                <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                                    Receive a push notification on the 15th and 25th of each month if your Form 10 monthly pest control check is not yet complete.
                                </div>
                                {pushError && (
                                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#c00', fontWeight: '600' }}>{pushError}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                disabled={pushLoading}
                                onClick={isSubscribed ? unsubscribe : subscribe}
                                style={{
                                    padding: '9px 20px',
                                    background: isSubscribed ? '#ddd' : '#2D855B',
                                    color: isSubscribed ? '#333' : 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: pushLoading ? 'not-allowed' : 'pointer',
                                    flexShrink: 0,
                                    opacity: pushLoading ? 0.6 : 1,
                                }}
                            >
                                {pushLoading ? '…' : isSubscribed ? 'Disable' : 'Enable'}
                            </button>
                        </div>

                        {/* Demo trigger for promotional video */}
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                                <div style={{ fontSize: '13px', color: '#888' }}>
                                    No forms completed this month? Fire a sample notification for demo purposes.
                                </div>
                                <button
                                    type="button"
                                    disabled={demoLoading}
                                    onClick={handleDemoNotification}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'white',
                                        color: '#2D855B',
                                        border: '1.5px solid #2D855B',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: demoLoading ? 'not-allowed' : 'pointer',
                                        flexShrink: 0,
                                        opacity: demoLoading ? 0.6 : 1,
                                    }}
                                >
                                    {demoLoading ? '…' : 'Send Demo'}
                                </button>
                            </div>
                            {demoMsg && (
                                <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontWeight: '600', color: demoMsg.type === 'success' ? '#2D855B' : '#c00' }}>
                                    {demoMsg.text}
                                </p>
                            )}
                        </div>
                    </>
                )}

            {/* ── Barns section ── */}
            <section style={{ background: 'white', borderRadius: '10px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: '700', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                    Barns ({barns.length})
                </h3>

                {barns.length === 0 ? (
                    <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>No barns yet. Add one from the Dashboard.</p>
                ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {barns.map(barn => (
                            <li key={barn.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                                <span style={{ fontSize: '18px' }}>🏚️</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#111' }}>{barn.barn_name}</div>
                                    {barn.flock_size != null && (
                                        <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>Flock size: {barn.flock_size.toLocaleString()}</div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}
