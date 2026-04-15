import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import client from '../../api/client'
import type { TokenResponse } from '../../types'

export default function Register() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await client.post<TokenResponse>('/auth/register', {
        email,
        password,
      })
      await signIn(res.data.access_token)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
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
      <div style={{ width: '100%', maxWidth: '440px' }}>
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
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                display: 'inline-block',
                marginBottom: '24px',
              }}
            >
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
              Create account
            </h1>
            <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0 }}>
              Join NovaStore today
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
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#0071e3')}
                onBlur={(e) => (e.target.style.borderColor = '#d2d2d7')}
              />
            </div>

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
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 8 characters"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#0071e3')}
                onBlur={(e) => (e.target.style.borderColor = '#d2d2d7')}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#1d1d1f',
                  marginBottom: '6px',
                }}
              >
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  ...inputStyle,
                  borderColor:
                    confirm && password !== confirm ? '#ff3b30' : '#d2d2d7',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#0071e3')}
                onBlur={(e) =>
                  (e.target.style.borderColor =
                    confirm && password !== confirm ? '#ff3b30' : '#d2d2d7')
                }
              />
              {confirm && password !== confirm && (
                <p
                  style={{
                    fontSize: '12px',
                    color: '#ff3b30',
                    marginTop: '4px',
                  }}
                >
                  Passwords do not match
                </p>
              )}
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
                if (!loading)
                  e.currentTarget.style.backgroundColor = '#0077ed'
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  e.currentTarget.style.backgroundColor = '#0071e3'
              }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          {/* Sign in link */}
          <p
            style={{
              textAlign: 'center',
              marginTop: '24px',
              fontSize: '14px',
              color: '#6e6e73',
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#0071e3',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Sign in
            </Link>
          </p>

          {/* Terms */}
          <p
            style={{
              textAlign: 'center',
              marginTop: '16px',
              fontSize: '12px',
              color: '#6e6e73',
              lineHeight: 1.5,
            }}
          >
            By creating an account you agree to our{' '}
            <span style={{ color: '#0071e3', cursor: 'pointer' }}>
              Terms of Service
            </span>{' '}
            and{' '}
            <span style={{ color: '#0071e3', cursor: 'pointer' }}>
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
