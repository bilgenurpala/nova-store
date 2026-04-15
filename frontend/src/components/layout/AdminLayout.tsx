import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES: Record<string, string> = {
  '/admin':          'Dashboard',
  '/admin/products': 'Products',
  '/admin/orders':   'Orders',
  '/admin/users':    'Users',
}

export default function AdminLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'Admin'
  const initial = (user?.email?.[0] ?? 'A').toUpperCase()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar />

      {/* Main area — offset by sidebar width */}
      <div style={{
        marginLeft: 'var(--sidebar-w)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        {/* Header */}
        <header style={{
          height: 'var(--header-h)',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
            {title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Avatar */}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
            }}>
              {initial}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
              {user?.email ?? 'Admin User'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '32px 32px', backgroundColor: 'var(--bg-primary)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
