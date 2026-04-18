import { useState } from 'react'

// NOTE: No /users admin endpoint exists in the API yet — using mock data.
// When the endpoint is available, replace MOCK_USERS with an API call to GET /admin/users.

interface MockUser {
  id: number
  name: string
  email: string
  orders: number
  joined: string
  lastActive: string
  status: 'Active' | 'Inactive' | 'Suspended'
  initials: string
  avatarBg: string
}

const MOCK_USERS: MockUser[] = [
  { id: 1001, name: 'Ayse Kaya', email: 'ayse.kaya@example.com', orders: 12, joined: '12 Jan 2024', lastActive: '2 hours ago', status: 'Active', initials: 'AK', avatarBg: '#8f45f5' },
  { id: 1002, name: 'Mehmet Ali', email: 'mehmet.ali@example.com', orders: 5, joined: '03 Mar 2024', lastActive: '1 day ago', status: 'Active', initials: 'MA', avatarBg: '#1754f5' },
  { id: 1003, name: 'Zeynep Bas', email: 'zeynep.bas@example.com', orders: 8, joined: '27 Feb 2024', lastActive: '3 days ago', status: 'Inactive', initials: 'ZB', avatarBg: '#12ad6b' },
  { id: 1004, name: 'Can Dogan', email: 'can.dogan@example.com', orders: 0, joined: '15 Apr 2024', lastActive: '2 weeks ago', status: 'Suspended', initials: 'CD', avatarBg: '#ff9500' },
  { id: 1005, name: 'Bilge P.', email: 'bilgep.app@gmail.com', orders: 3, joined: '18 Apr 2026', lastActive: 'Just now', status: 'Active', initials: 'BP', avatarBg: '#0071e3' },
]

const STATUS_CFG = {
  Active:    { bg: 'rgba(52,199,89,0.12)',  color: '#34c759' },
  Inactive:  { bg: 'rgba(110,110,115,0.12)', color: '#6e6e73' },
  Suspended: { bg: 'rgba(255,149,0,0.12)',  color: '#ff9500' },
}

function StatusPill({ status }: { status: MockUser['status'] }) {
  const cfg = STATUS_CFG[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: 11, fontSize: 10, fontWeight: 600,
      backgroundColor: cfg.bg, color: cfg.color,
    }}>{status}</span>
  )
}

function PgBtn({ label, active = false, disabled = false, onClick }: {
  label: string; active?: boolean; disabled?: boolean; onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32, borderRadius: 6, fontSize: 12,
        border: active ? 'none' : '1px solid var(--border-default)',
        backgroundColor: active ? 'var(--color-primary)' : 'transparent',
        color: active ? '#fff' : disabled ? 'var(--border-default)' : 'var(--text-primary)',
        cursor: disabled ? 'default' : 'pointer',
        fontWeight: active ? 600 : 400,
      }}
    >{label}</button>
  )
}

const PAGE_SIZE = 8

export default function Users() {
  const [search, setSearch] = useState('')
  const [_roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || u.status.toLowerCase() === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const statCards = [
    { label: 'Total Users',      value: '4,892', color: '#0071e3' },
    { label: 'Active',           value: '4,241', color: '#34c759' },
    { label: 'New This Month',   value: '347',   color: '#ff9500' },
    { label: 'Suspended',        value: '8',     color: '#ff3b30' },
  ]

  const thStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)',
  }

  return (
    <>
      {/* Page title */}
      <p style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        User Management
      </p>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        View and manage all registered users.
      </p>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            flex: 1, backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)', borderRadius: 12,
            padding: '16px 20px', borderLeft: `4px solid ${card.color}`,
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{card.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
        <input
          style={{
            height: 44, width: 320, padding: '0 13px',
            border: '1px solid var(--border-default)', borderRadius: 8,
            backgroundColor: 'var(--bg-primary)', fontSize: 14,
            color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
          }}
          placeholder="Search users..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />

        {/* All roles dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowRoleDropdown(v => !v); setShowStatusDropdown(false) }}
            style={{
              height: 44, padding: '0 14px',
              border: '1px solid var(--border-default)', borderRadius: 8,
              backgroundColor: 'transparent', fontSize: 13,
              color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            All roles ▾
          </button>
          {showRoleDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0,
              backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              zIndex: 20, minWidth: 140, overflow: 'hidden',
            }}>
              {['All roles', 'Admin', 'Customer'].map(r => (
                <button
                  key={r}
                  onClick={() => { setRoleFilter(r.toLowerCase().replace(' ', '')); setShowRoleDropdown(false) }}
                  style={{
                    display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                    border: 'none', background: 'none', cursor: 'pointer', fontSize: 13,
                    color: 'var(--text-primary)',
                  }}
                >{r}</button>
              ))}
            </div>
          )}
        </div>

        {/* All statuses dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowStatusDropdown(v => !v); setShowRoleDropdown(false) }}
            style={{
              height: 44, padding: '0 14px',
              border: '1px solid var(--border-default)', borderRadius: 8,
              backgroundColor: 'transparent', fontSize: 13,
              color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            All statuses ▾
          </button>
          {showStatusDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0,
              backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              zIndex: 20, minWidth: 150, overflow: 'hidden',
            }}>
              {['all', 'active', 'inactive', 'suspended'].map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setShowStatusDropdown(false); setPage(1) }}
                  style={{
                    display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                    border: 'none', background: statusFilter === s ? 'rgba(0,113,227,0.08)' : 'none',
                    cursor: 'pointer', fontSize: 13,
                    color: statusFilter === s ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: statusFilter === s ? 600 : 400,
                    textTransform: 'capitalize',
                  }}
                >{s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
              ))}
            </div>
          )}
        </div>

        {/* Export */}
        <button style={{
          marginLeft: 'auto', height: 44, padding: '0 20px',
          border: '1px solid var(--border-default)', borderRadius: 8,
          backgroundColor: 'transparent', fontSize: 13,
          fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer',
        }}>
          Export
        </button>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '220px 220px 80px 120px 120px 100px 140px',
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-default)',
          padding: '12px 16px',
        }}>
          {['USER', 'EMAIL', 'ORDERS', 'JOINED', 'LAST ACTIVE', 'STATUS', 'ACTIONS'].map(col => (
            <span key={col} style={thStyle}>{col}</span>
          ))}
        </div>

        {/* Empty state */}
        {paged.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No users found</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Try adjusting your search or filter criteria.</div>
          </div>
        )}

        {/* Rows */}
        {paged.map((user, idx) => (
          <div
            key={user.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '220px 220px 80px 120px 120px 100px 140px',
              padding: '12px 16px',
              alignItems: 'center',
              borderBottom: idx < paged.length - 1 ? '1px solid var(--border-default)' : 'none',
              minHeight: 64,
            }}
          >
            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: user.avatarBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>{user.initials}</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{user.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>ID: #{user.id}</p>
              </div>
            </div>

            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.email}</span>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{user.orders}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.joined}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.lastActive}</span>
            <StatusPill status={user.status} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{
                height: 28, padding: '0 10px',
                border: '1px solid var(--border-default)', borderRadius: 6,
                backgroundColor: 'transparent', fontSize: 11,
                fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer',
              }}>View</button>
              <button style={{
                height: 28, padding: '0 10px',
                border: user.status === 'Suspended' ? '1px solid rgba(52,199,89,0.3)' : '1px solid rgba(255,149,0,0.3)',
                borderRadius: 6,
                backgroundColor: user.status === 'Suspended' ? 'rgba(52,199,89,0.08)' : 'rgba(255,149,0,0.08)',
                fontSize: 11,
                fontWeight: 500,
                color: user.status === 'Suspended' ? '#34c759' : '#ff9500',
                cursor: 'pointer',
              }}>
                {user.status === 'Suspended' ? 'Restore' : 'Suspend'}
              </button>
            </div>
          </div>
        ))}

        {/* Pagination */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-primary)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <PgBtn label="←" disabled={page === 1} onClick={() => setPage(p => p - 1)} />
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
              <PgBtn key={i} label={String(i + 1)} active={page === i + 1} onClick={() => setPage(i + 1)} />
            ))}
            {totalPages > 5 && <PgBtn label="..." disabled />}
            <PgBtn label="→" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
          </div>
        </div>
      </div>
    </>
  )
}
