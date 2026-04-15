import { useEffect, useState, useCallback } from 'react'
import { getAdminOrders, updateOrderStatus } from '../../api/orders'
import type { Order } from '../../types'

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: 'rgba(255,149,0,0.12)',  color: '#ff9500', label: 'Pending'    },
  paid:      { bg: 'rgba(0,113,227,0.12)',  color: '#0071e3', label: 'Paid'       },
  shipped:   { bg: 'rgba(0,113,227,0.12)',  color: '#0071e3', label: 'Shipped'    },
  delivered: { bg: 'rgba(52,199,89,0.12)',  color: '#34c759', label: 'Delivered'  },
  cancelled: { bg: 'rgba(255,59,48,0.12)',  color: '#ff3b30', label: 'Cancelled'  },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG['pending']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: 11, fontSize: 10, fontWeight: 600,
      backgroundColor: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

// ── Status filter pills ───────────────────────────────────────────────────────
const PILLS = [
  { label: 'All Orders', value: '' },
  { label: 'Pending',    value: 'pending'   },
  { label: 'Paid',       value: 'paid'      },
  { label: 'Shipped',    value: 'shipped'   },
  { label: 'Delivered',  value: 'delivered' },
  { label: 'Cancelled',  value: 'cancelled' },
]

// ── Order Detail Panel ────────────────────────────────────────────────────────
interface DetailPanelProps {
  order: Order | null
  onClose: () => void
  onStatusUpdated: () => void
}

function DetailPanel({ order, onClose, onStatusUpdated }: DetailPanelProps) {
  const [status, setStatus] = useState(order?.status ?? 'pending')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (order) setStatus(order.status)
  }, [order])

  if (!order) return null

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await updateOrderStatus(order.id, status)
      onStatusUpdated()
    } catch {
      alert('Failed to update status.')
    } finally {
      setSaving(false)
    }
  }

  const divider = <div style={{ height: 1, backgroundColor: 'var(--border-default)', margin: '16px -1px' }} />

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: 400, backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px 0 0 12px',
      zIndex: 50, overflowY: 'auto',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '19px 19px 0' }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Order Detail</p>
        <button onClick={onClose} style={{ fontSize: 20, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>

      <div style={{ height: 1, backgroundColor: 'var(--border-default)', margin: '16px 0 0' }} />

      <div style={{ padding: '16px 19px' }}>
        {/* Order ID + badge */}
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          #NV-{order.id.toString().padStart(8, '0')}
        </p>
        <StatusBadge status={order.status} />
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
          {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </p>

        {divider}

        {/* Customer */}
        {order.address && (
          <>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Customer</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {order.address.full_name[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{order.address.full_name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {order.address.line1}, {order.address.city}
                </p>
              </div>
            </div>
            {divider}
          </>
        )}

        {/* Order items */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Order Items</p>
        {order.items.map(item => (
          <div key={item.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 6,
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 4, backgroundColor: 'var(--border-default)' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.product_name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>×{item.quantity}</p>
              </div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              ${(item.unit_price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}

        {divider}

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Subtotal</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>${Number(order.total_price).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Shipping</span>
          <span style={{ fontSize: 13, color: '#34c759' }}>Free</span>
        </div>
        <div style={{ height: 1, backgroundColor: 'var(--border-default)', margin: '8px 0 10px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>${Number(order.total_price).toFixed(2)}</span>
        </div>

        {divider}

        {/* Update status */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Update Status</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            style={{
              flex: 1, height: 44, padding: '0 12px',
              border: '1px solid var(--border-default)', borderRadius: 8,
              backgroundColor: 'var(--bg-primary)', fontSize: 14,
              color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
            }}
          >
            {Object.entries(STATUS_CFG).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button
            onClick={handleUpdate}
            disabled={saving}
            style={{
              width: 90, height: 44,
              backgroundColor: 'var(--color-primary)', color: '#fff',
              border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {saving ? '...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const PAGE_SIZE = 8

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminOrders({
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
      })
      setOrders(res.items ?? [])
      setTotal(res.total ?? 0)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { load() }, [load])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const filtered = search
    ? orders.filter(o =>
        o.id.toString().includes(search) ||
        o.address?.full_name.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  const thStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)',
  }

  return (
    <>
      {/* Overlay when detail panel open */}
      {selected && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          onClick={() => setSelected(null)}
        />
      )}
      <DetailPanel
        order={selected}
        onClose={() => setSelected(null)}
        onStatusUpdated={() => { load(); setSelected(null) }}
      />

      {/* Page title */}
      <p style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        Order Management
      </p>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Track and manage all customer orders.
      </p>

      {/* Status pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {PILLS.map(p => (
          <button
            key={p.value}
            onClick={() => { setStatusFilter(p.value); setPage(1) }}
            style={{
              height: 44, padding: '0 12px',
              border: statusFilter === p.value ? '1px solid var(--color-primary)' : '1px solid var(--border-default)',
              borderRadius: 8,
              backgroundColor: statusFilter === p.value ? 'rgba(0,113,227,0.1)' : 'transparent',
              fontSize: 13, fontWeight: statusFilter === p.value ? 600 : 400,
              color: statusFilter === p.value ? 'var(--color-primary)' : 'var(--text-secondary)',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {p.label}{p.value === '' ? ` (${total})` : ''}
          </button>
        ))}
      </div>

      {/* Search + Export */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'space-between' }}>
        <input
          style={{
            height: 44, width: 320, padding: '0 13px',
            border: '1px solid var(--border-default)', borderRadius: 8,
            backgroundColor: 'var(--bg-primary)', fontSize: 14,
            color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
          }}
          placeholder="Search by order # or customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button style={{
          height: 44, padding: '0 20px',
          border: '1px solid var(--border-default)', borderRadius: 8,
          backgroundColor: 'transparent', fontSize: 13,
          fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer',
        }}>
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '140px 170px 120px 1fr 110px 110px 100px',
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-default)',
          padding: '12px 16px',
        }}>
          {['ORDER #', 'CUSTOMER', 'DATE', 'ITEMS', 'TOTAL', 'STATUS', 'ACTION'].map(col => (
            <span key={col} style={thStyle}>{col}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '32px 20px', color: 'var(--text-secondary)', fontSize: 14 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '32px 20px', color: 'var(--text-secondary)', fontSize: 14 }}>No orders found.</div>
        ) : (
          filtered.map((order, idx) => (
            <div
              key={order.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 170px 120px 1fr 110px 110px 100px',
                padding: '0 16px',
                alignItems: 'center',
                height: 72,
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-default)' : 'none',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)', cursor: 'pointer' }}
                onClick={() => setSelected(order)}>
                #NV-{order.id.toString().padStart(8, '0')}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {(order.address?.full_name?.[0] ?? '?').toUpperCase()}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  {order.address?.full_name ?? '—'}
                </span>
              </div>

              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {new Date(order.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </span>

              <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                {order.items.map(i => i.product_name).join(', ').slice(0, 45)}
                {order.items.map(i => i.product_name).join(', ').length > 45 ? '…' : ''}
              </span>

              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                ${Number(order.total_price).toFixed(2)}
              </span>

              <StatusBadge status={order.status} />

              <button
                onClick={() => setSelected(order)}
                style={{
                  height: 28, padding: '0 12px',
                  border: '1px solid var(--border-default)', borderRadius: 6,
                  backgroundColor: 'transparent', fontSize: 12,
                  fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer',
                }}
              >
                View →
              </button>
            </div>
          ))
        )}

        {/* Pagination */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-primary)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total} orders
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { label: '←', onClick: () => setPage(p => p - 1), disabled: page === 1 },
              ...([1, 2, 3].filter(n => n <= totalPages).map(n => ({
                label: String(n), onClick: () => setPage(n), active: page === n, disabled: false,
              }))),
              ...(totalPages > 3 ? [{ label: '…', disabled: true }, { label: String(totalPages), onClick: () => setPage(totalPages), active: page === totalPages, disabled: false }] : []),
              { label: '→', onClick: () => setPage(p => p + 1), disabled: page === totalPages },
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick} disabled={btn.disabled}
                style={{
                  width: 32, height: 32, borderRadius: 6, fontSize: 12,
                  border: (btn as {active?: boolean}).active ? 'none' : '1px solid var(--border-default)',
                  backgroundColor: (btn as {active?: boolean}).active ? 'var(--color-primary)' : 'transparent',
                  color: (btn as {active?: boolean}).active ? '#fff' : btn.disabled ? 'var(--border-default)' : 'var(--text-primary)',
                  cursor: btn.disabled ? 'default' : 'pointer',
                  fontWeight: (btn as {active?: boolean}).active ? 600 : 400,
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
