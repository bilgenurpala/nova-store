import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login } from '../../api/auth'

export default function CustomerLogin() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  useEffect(() => { if (user) navigate('/', { replace: true }) }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { access_token } = await login({ email, password })
      await signIn(access_token)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Invalid email or password.')
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

          <div style={{ marginBottom: 48 }}>
            <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Welcome to NovaStore</h2>
            <p style={{ color: '#6e6e73', fontSize: 14, margin: 0, lineHeight: 1.6 }}>Sign in to access your personalized tech shopping experience.</p>
          </div>

          {[
            { icon: '🤖', title: 'AI-Powered Recommendations', desc: 'Personalized picks curated just for you' },
            { icon: '🛍️', title: 'Seamless Shopping', desc: 'Browse thousands of products with ease' },
            { icon: '🔒', title: 'Secure & Private', desc: 'Your data is encrypted and always safe' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,113,227,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{f.title}</div>
                <div style={{ color: '#6e6e73', fontSize: 13 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ color: '#404552', fontSize: 13, margin: 0 }}>Join 2M+ shoppers on NovaStore</p>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 60px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1d1d1f', margin: '0 0 6px' }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: '#6e6e73', margin: '0 0 32px' }}>Sign in to continue shopping</p>

          {error && (
            <div style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 14, color: '#ff3b30' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="bilge@example.com" style={inp}
                onFocus={e => (e.target.style.borderColor = '#0071e3')} onBlur={e => (e.target.style.borderColor = '#d2d2d7')} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>Password</label>
                <span style={{ fontSize: 13, color: '#0071e3', cursor: 'pointer' }}>Forgot Password?</span>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inp}
                onFocus={e => (e.target.style.borderColor = '#0071e3')} onBlur={e => (e.target.style.borderColor = '#d2d2d7')} />
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', height: 48, background: loading ? '#a0c0f0' : '#0071e3', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e5ea' }} />
            <span style={{ fontSize: 13, color: '#6e6e73' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: '#e5e5ea' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {['🌐 Google', '🍎 Apple'].map(label => (
              <button key={label} style={{ height: 44, background: '#f5f5f7', border: '1px solid #d2d2d7', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>{label}</button>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#6e6e73', margin: '0 0 12px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#0071e3', textDecoration: 'none', fontWeight: 600 }}>Sign up →</Link>
          </p>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#b0b0b8', margin: 0 }}>
            Admin?{' '}
            <Link to="/admin/login" style={{ color: '#b0b0b8', textDecoration: 'underline' }}>Admin panel</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
