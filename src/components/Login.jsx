import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUp, signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
        setError('✅ Signup successful! Please check your email to confirm.')
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
          marginBottom: '10px'
        }}>
          🥚 SCSC Compliance Tracker
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '30px'
        }}>
          {isSignUp ? 'Create an Account' : 'Login to Your Farm'}
        </p>

        <form onSubmit={handleSubmit}>
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

          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: error.includes('successful') ? '#d4edda' : '#f8d7da',
              color: error.includes('successful') ? '#155724' : '#721c24',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {error}
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
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
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
        </div>
      </div>
    </div>
  )
}
