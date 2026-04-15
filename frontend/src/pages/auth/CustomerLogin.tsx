import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login } from '../../api/auth'

export default function CustomerLogin() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in → go home
  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { access_token } = await login({ email, password })
      await signIn(access_token)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Invalid email or password.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f7',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
        }}
      >
        {/* Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #d2d2d7',
            padding: '48px 40px',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700 }}>
                <span style={{ color: '#0071e3' }}>Nova</span>
                <span style={{ color: '#1d1d1f' }}>Store</span>
              </span>
            </Link>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#1d1d1f',
                margin: '0 0 8px',
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0 }}>
              Sign in to your account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(255,59,48,0.08)',
                border: '1px solid rgba(255,59,48,0.2)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#ff3b30',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#1d1d1f',
                  marginBottom: '6px',
                }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 14px',
                  border: '1px solid #d2d2d7',
                  borderRadius: '10px',
                  fontSize: '15px',
                  color: '#1d1d1f',
                  backgroundColor: '#f5f5f7',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#0071e3')}
                onBlur={(e) => (e.target.style.borderColor = '#d2d2d7')}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <label
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1d1d1f',
                  }}
                >
                  Password
                </label>
                <span
                  style={{
                    fontSize: '13px',
                    color: '#0071e3',
                    cursor: 'pointer',
                  }}
                >
                  Forgot password?
                </span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 14px',
                  border: '1px solid #d2d2d7',
                  borderRadius: '10px',
                  fontSize: '15px',
                  color: '#1d1d1f',
                  backgroundColor: '#f5f5f7',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#0071e3')}
                onBlur={(e) => (e.target.style.borderColor = '#d2d2d7')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: loading ? '#a0c0f0' : '#0071e3',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#0077ed'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#0071e3'
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '24px 0',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: '#d2d2d7' }} />
            <span style={{ fontSize: '13px', color: '#6e6e73' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#d2d2d7' }} />
          </div>

          {/* Register link */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#6e6e73',
              margin: 0,
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: '#0071e3', textDecoration: 'none', fontWeight: 500 }}
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Admin link */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '13px',
            color: '#6e6e73',
          }}
        >
          Admin?{' '}
          <Link
            to="/admin/login"
            style={{ color: '#6e6e73', textDecoration: 'underline' }}
          >
            Sign in to admin panel
          </Link>
        </p>
      </div>
    </div>
  )
}
