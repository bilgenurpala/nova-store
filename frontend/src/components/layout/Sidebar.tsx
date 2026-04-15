import { NavLink, useNavigate } from 'react-router-dom'
import { Monitor, Package, ShoppingCart, Users, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/admin',          label: 'Dashboard', icon: Monitor,      end: true  },
  { to: '/admin/products', label: 'Products',  icon: Package,      end: false },
  { to: '/admin/orders',   label: 'Orders',    icon: ShoppingCart, end: false },
  { to: '/admin/users',    label: 'Users',     icon: Users,        end: false },
]

export default function Sidebar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/admin/login')
  }

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-dark-card)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 40,
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 0' }}>
        <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
          <span style={{ color: 'var(--color-primary)' }}>Nova</span>
          <span style={{ color: '#fff' }}>Store</span>
        </p>
        <p style={{
          fontSize: 9,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginTop: 5,
          letterSpacing: '0.08em',
        }}>
          ADMIN PANEL
        </p>
      </div>

      {/* Top divider */}
      <div style={{ height: 1, backgroundColor: 'var(--bg-dark-sep)', margin: '16px 0 8px' }} />

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              height: 48,
              paddingLeft: 16,
              paddingRight: 16,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              color: '#fff',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
              borderLeft: isActive ? '3px solid #fff' : '3px solid transparent',
              transition: 'background-color 0.15s',
            })}
          >
            <Icon size={20} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom divider */}
      <div style={{ height: 1, backgroundColor: 'var(--bg-dark-sep)' }} />

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          height: 48,
          paddingLeft: 16,
          paddingRight: 16,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 400,
          color: 'var(--text-secondary)',
          width: '100%',
        }}
      >
        <LogOut size={20} strokeWidth={1.75} />
        Sign Out
      </button>
    </aside>
  )
}
