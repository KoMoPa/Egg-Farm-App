import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
    const { signUp, signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        try {
            if (isSignUp) {
                await signUp(email, password)
                setMessage('✅ Signup successful! Please check your email to confirm.')
            } else {
                await signIn(email, password)
            }
            setEmail('')
            setPassword('')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error) throw error
            setMessage('✅ Password reset email sent! Check your inbox.')
            setEmail('')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            background: '#f5f5f5',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                maxWidth: '400px',
                width: '100%'
            }}>
                <h1 style={{
                    textAlign: 'center',
                    fontSize: '28px',
                    marginBottom: '10px',
                    color: '#000'
                }}>
                    🥚 SCSC Compliance Tracker
                </h1>
                <p style={{
                    textAlign: 'center',
                    color: '#666',
                    marginBottom: '30px'
                }}>
                    {isForgotPassword ? 'Reset Your Password' : (isSignUp ? 'Create an Account' : 'Login to Your Farm')}
                </p>

                <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {!isForgotPassword && (
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    )}

                    {error && (
                        <div style={{
                            marginBottom: '20px',
                            padding: '10px',
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    {message && (
                        <div style={{
                            marginBottom: '20px',
                            padding: '10px',
                            backgroundColor: '#d4edda',
                            color: '#155724',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#0066cc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Loading...' : (isForgotPassword ? 'Send Reset Email' : (isSignUp ? 'Sign Up' : 'Login'))}
                    </button>
                </form>

                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#666'
                }}>
                    {isForgotPassword ? (
                        <>
                            Remember your password?{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsForgotPassword(false)
                                    setError('')
                                    setMessage('')
                                    setEmail('')
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#0066cc',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    textDecoration: 'underline'
                                }}
                            >
                                Back to Login
                            </button>
                        </>
                    ) : (
                        <>
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp)
                                    setError('')
                                    setMessage('')
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#0066cc',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    textDecoration: 'underline'
                                }}
                            >
                                {isSignUp ? 'Login' : 'Sign Up'}
                            </button>
                            {!isSignUp && (
                                <>
                                    <br />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsForgotPassword(true)
                                            setError('')
                                            setMessage('')
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#0066cc',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            textDecoration: 'underline',
                                            marginTop: '10px'
                                        }}
                                    >
                                        Forgot Password?
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
