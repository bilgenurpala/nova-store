import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import client from '../../api/client'
import type { TokenResponse } from '../../types'

export default function Register() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [agreeTerms,    setAgreeTerms]    = useState(false)
  const [agreeAI,       setAgreeAI]       = useState(true)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) navigate('/', { replace: true }) }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }
    if (!agreeTerms)           { setError('Please accept the Terms of Service.'); return }
    setLoading(true)
    try {
      const res = await client.post<TokenResponse>('/auth/register', { email, password })
      await signIn(res.data.access_token)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const inp: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 12px',
    border: '1px solid #d2d2d7', borderRadius: 8,
    fontSize: 14, color: '#1d1d1f', background: '#f5f5f7',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      {/* ── Left panel ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, background: '#0f0f13', display: 'flex', flexDirection: 'column', padding: '48px 40px', justifyContent: 'space-between' }}>
        <div>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 48 }}>
            <span style={{ fontSize: 24, fontWeight: 700 }}>
              <span style={{ color: '#0071e3' }}>Nova</span>
              <span style={{ color: '#fff' }}>Store</span>
            </span>
            <div style={{ fontSize: 12, color: '#6e6e73', marginTop: 4 }}>Your AI-Powered Shopping Companion</div>
          </Link>

          <div style={{ marginBottom: 40 }}>
            <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: '0 0 10px' }}>Join 2M+ Smart Shoppers</h2>
            <p style={{ color: '#6e6e73', fontSize: 14, margin: 0, lineHeight: 1.6 }}>Create your free account and unlock AI-powered shopping features.</p>
          </div>

          {[
            'Personalized AI product recommendations',
            'Instant wishlist & order tracking',
            'Early access to exclusive deals',
            'Secure checkout in one click',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>
              </div>
              <span style={{ color: '#d0d0da', fontSize: 14 }}>{f}</span>
            </div>
          ))}
        </div>

        <p style={{ color: '#404552', fontSize: 13, margin: 0 }}>Join 2M+ shoppers on NovaStore</p>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 60px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1d1d1f', margin: '0 0 4px' }}>Create Account</h1>
          <p style={{ fontSize: 14, color: '#6e6e73', margin: '0 0 28px' }}>Join NovaStore for AI-powered shopping</p>

          {error && (
            <div style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 14, color: '#ff3b30' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* First + Last name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 5 }}>First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Bilge" style={inp}
                  onFocus={e => (e.target.style.borderColor = '#0071e3')} onBlur={e => (e.target.style.borderColor = '#d2d2d7')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 5 }}>Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Pekmez" style={inp}
                  onFocus={e => (e.target.style.borderColor = '#0071e3')} onBlur={e => (e.target.style.borderColor = '#d2d2d7')} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 5 }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="bilge@example.com" style={inp}
                onFocus={e => (e.target.style.borderColor = '#0071e3')} onBlur={e => (e.target.style.borderColor = '#d2d2d7')} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 5 }}>Phone <span style={{ fontWeight: 400, color: '#6e6e73' }}>(optional)</span></label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+90 555 000 0000" style={inp}
                onFocus={e => (e.target.style.borderColor = '#0071e3')} onBlur={e => (e.target.style.borderColor = '#d2d2d7')} />
            </div>

            {/* Password row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 5 }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" style={inp}
                  onFocus={e => (e.target.style.borderColor = '#0071e3')} onBlur={e => (e.target.style.borderColor = '#d2d2d7')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 5 }}>Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="••••••••"
                  style={{ ...inp, borderColor: confirm && password !== confirm ? '#ff3b30' : '#d2d2d7' }}
                  onFocus={e => (e.target.style.borderColor = '#0071e3')} onBlur={e => (e.target.style.borderColor = confirm && password !== confirm ? '#ff3b30' : '#d2d2d7')} />
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: '#0071e3' }} />
                <span style={{ fontSize: 13, color: '#6e6e73', lineHeight: 1.5 }}>
                  I agree to{' '}<span style={{ color: '#0071e3' }}>Terms of Service</span> &{' '}<span style={{ color: '#0071e3' }}>Privacy Policy</span>
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={agreeAI} onChange={e => setAgreeAI(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: '#0071e3' }} />
                <span style={{ fontSize: 13, color: '#6e6e73' }}>Enable personalized AI recommendations</span>
              </label>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', height: 48, background: loading ? '#a0c0f0' : '#0071e3', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6e6e73' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0071e3', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
