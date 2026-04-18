import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type ProfileSection = 'personal' | 'security' | 'orders' | 'favorites' | 'addresses' | 'payment' | 'notifications'

const MENU_ITEMS: { key: ProfileSection | 'signout'; label: string }[] = [
  { key: 'personal',      label: 'Personal Info' },
  { key: 'security',      label: 'Security' },
  { key: 'orders',        label: 'Orders' },
  { key: 'favorites',     label: 'Favorites' },
  { key: 'addresses',     label: 'Addresses' },
  { key: 'payment',       label: 'Payment Methods' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'signout',       label: 'Sign Out' },
]

// Mock recent orders
const RECENT_ORDERS = [
  { id: 'NV-20241215', items: 'iPhone 15 Pro, AirPods', status: 'Delivered', statusColor: '#34c759', statusBg: 'rgba(52,199,89,0.1)', price: '$1,248.00', date: '15 Dec 2024' },
  { id: 'NV-20241108', items: 'MacBook Air M3', status: 'In Transit', statusColor: '#0071e3', statusBg: 'rgba(0,113,227,0.1)', price: '$1,099.00', date: '08 Nov 2024' },
  { id: 'NV-20241022', items: 'Apple Watch Series 9', status: 'Delivered', statusColor: '#34c759', statusBg: 'rgba(52,199,89,0.1)', price: '$399.00', date: '22 Oct 2024' },
]

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<ProfileSection>('personal')

  // Form state
  const [fullName, setFullName] = useState(user?.email?.split('@')[0] ?? '')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [dob, setDob] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [bio, setBio] = useState('')
  const [gender, setGender] = useState('male')
  const [saved, setSaved] = useState(false)

  const initial = (user?.email?.[0] ?? 'U').toUpperCase()
  const username = user?.email?.split('@')[0] ?? 'User'

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 12px',
    border: '1px solid #d2d2d7', borderRadius: 8,
    fontSize: 14, color: '#1d1d1f', background: '#f5f5f7',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 6,
  }

  return (
    <div style={{ background: '#f5f5f7', minHeight: 'calc(100vh - 72px)' }}>
      {/* Breadcrumb */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #d2d2d7', height: 52,
        display: 'flex', alignItems: 'center', padding: '0 40px', gap: 6,
        position: 'sticky', top: 72, zIndex: 10,
      }}>
        <Link to="/" style={{ fontSize: 14, color: '#6e6e73', textDecoration: 'none' }}>Home</Link>
        <span style={{ fontSize: 14, color: '#6e6e73' }}> / </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>My Profile</span>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px 80px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>

        {/* Left sidebar */}
        <div style={{
          width: 160, flexShrink: 0,
          background: '#fff', border: '1px solid #d2d2d7', borderRadius: 12,
          padding: '24px 0', position: 'sticky', top: 132,
        }}>
          {/* Avatar + name */}
          <div style={{ textAlign: 'center', padding: '0 16px 20px', borderBottom: '1px solid #f0f0f2' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 28,
              background: '#0071e3', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, margin: '0 auto 10px',
            }}>{initial}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>{username}</div>
            <div style={{ fontSize: 11, color: '#6e6e73', wordBreak: 'break-all' }}>{user?.email}</div>
          </div>

          {/* Menu */}
          <div style={{ padding: '12px 0 0' }}>
            {MENU_ITEMS.map(item => {
              const isSignOut = item.key === 'signout'
              const isActive = !isSignOut && activeSection === item.key

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    if (isSignOut) handleSignOut()
                    else setActiveSection(item.key as ProfileSection)
                  }}
                  style={{
                    display: 'block', width: '100%', padding: '10px 16px',
                    textAlign: 'left', border: 'none', background: 'none',
                    cursor: 'pointer', fontSize: 13,
                    color: isSignOut ? '#ff3b30' : isActive ? '#0071e3' : '#1d1d1f',
                    fontWeight: isActive ? 600 : 400,
                    backgroundColor: isActive ? 'rgba(0,113,227,0.06)' : 'transparent',
                    borderLeft: isActive ? '3px solid #0071e3' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget.style.backgroundColor = '#f5f5f7') }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget.style.backgroundColor = 'transparent') }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {activeSection === 'personal' && (
            <div>
              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1d1d1f', margin: '0 0 4px' }}>Personal Information</h1>
                <p style={{ fontSize: 14, color: '#6e6e73', margin: 0 }}>Update your personal details and public profile.</p>
              </div>

              {/* Avatar section */}
              <div style={{
                background: '#fff', border: '1px solid #d2d2d7', borderRadius: 12,
                padding: 24, marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 20,
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 36,
                  background: '#0071e3', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, fontWeight: 700, flexShrink: 0,
                }}>{initial}</div>
                <div>
                  <div style={{ fontSize: 13, color: '#6e6e73', marginBottom: 8 }}>JPG, PNG up to 5MB</div>
                  <button style={{
                    height: 36, padding: '0 16px',
                    background: 'transparent', border: '1px solid #d2d2d7',
                    borderRadius: 8, fontSize: 13, fontWeight: 600,
                    color: '#1d1d1f', cursor: 'pointer',
                  }}>Change Photo</button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} style={{ background: '#fff', border: '1px solid #d2d2d7', borderRadius: 12, padding: 24 }}>
                {saved && (
                  <div style={{
                    background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.2)',
                    borderRadius: 8, padding: '10px 14px', marginBottom: 20,
                    fontSize: 14, color: '#34c759',
                  }}>
                    Changes saved successfully!
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      style={inputStyle}
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Your full name"
                      onFocus={e => (e.target.style.borderColor = '#0071e3')}
                      onBlur={e => (e.target.style.borderColor = '#d2d2d7')}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input
                      style={inputStyle}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      onFocus={e => (e.target.style.borderColor = '#0071e3')}
                      onBlur={e => (e.target.style.borderColor = '#d2d2d7')}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input
                      style={inputStyle}
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      onFocus={e => (e.target.style.borderColor = '#0071e3')}
                      onBlur={e => (e.target.style.borderColor = '#d2d2d7')}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Date of Birth</label>
                    <input
                      style={inputStyle}
                      type="date"
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      onFocus={e => (e.target.style.borderColor = '#0071e3')}
                      onBlur={e => (e.target.style.borderColor = '#d2d2d7')}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input
                      style={inputStyle}
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Your city"
                      onFocus={e => (e.target.style.borderColor = '#0071e3')}
                      onBlur={e => (e.target.style.borderColor = '#d2d2d7')}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Country</label>
                    <input
                      style={inputStyle}
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      placeholder="Your country"
                      onFocus={e => (e.target.style.borderColor = '#0071e3')}
                      onBlur={e => (e.target.style.borderColor = '#d2d2d7')}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Bio</label>
                  <textarea
                    style={{ ...inputStyle, height: 80, padding: '12px', resize: 'vertical' }}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Write a short bio about yourself..."
                    onFocus={e => (e.target.style.borderColor = '#0071e3')}
                    onBlur={e => (e.target.style.borderColor = '#d2d2d7')}
                  />
                </div>

                {/* Gender */}
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Gender</label>
                  <div style={{ display: 'flex', gap: 24 }}>
                    {[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'prefer_not', label: 'Prefer not to say' }].map(opt => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#1d1d1f' }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%',
                          border: gender === opt.value ? '5px solid #0071e3' : '1.5px solid #d2d2d7',
                          flexShrink: 0, transition: 'border 0.15s', cursor: 'pointer',
                        }}
                          onClick={() => setGender(opt.value)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, background: '#f0f0f2', marginBottom: 20 }} />

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="submit"
                    style={{
                      height: 44, padding: '0 28px', background: '#0071e3', color: '#fff',
                      border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#005ecb')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#0071e3')}
                  >Save Changes</button>
                  <button
                    type="button"
                    style={{
                      height: 44, padding: '0 28px', background: 'transparent', color: '#6e6e73',
                      border: '1px solid #d2d2d7', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}
                  >Cancel</button>
                </div>
              </form>

              {/* Recent Orders */}
              <div style={{ background: '#fff', border: '1px solid #d2d2d7', borderRadius: 12, padding: 24, marginTop: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1d1d1f', margin: '0 0 20px' }}>Recent Orders</h2>
                {RECENT_ORDERS.map((order, i) => (
                  <div key={order.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: i < RECENT_ORDERS.length - 1 ? '1px solid #f0f0f2' : 'none',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0071e3', marginBottom: 2 }}>#{order.id}</div>
                      <div style={{ fontSize: 13, color: '#6e6e73' }}>{order.items}</div>
                      <div style={{ fontSize: 12, color: '#b0b0b8', marginTop: 2 }}>{order.date}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
                        borderRadius: 11, fontSize: 11, fontWeight: 600,
                        background: order.statusBg, color: order.statusColor,
                      }}>{order.status}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>{order.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other sections placeholder */}
          {activeSection !== 'personal' && (
            <div style={{ background: '#fff', border: '1px solid #d2d2d7', borderRadius: 12, padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1d1d1f', marginBottom: 8 }}>
                {MENU_ITEMS.find(m => m.key === activeSection)?.label}
              </h2>
              <p style={{ fontSize: 14, color: '#6e6e73' }}>This section is coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
