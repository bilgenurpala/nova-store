import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminOrders } from '../../api/orders'
import { getProducts } from '../../api/products'
import type { Order } from '../../types'

// ── helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: 'rgba(255,149,0,0.12)',  text: '#ff9500',  label: 'Pending'    },
  paid:      { bg: 'rgba(0,113,227,0.12)',  text: '#0071e3',  label: 'Paid'       },
  shipped:   { bg: 'rgba(0,113,227,0.12)',  text: '#0071e3',  label: 'Shipped'    },
  delivered: { bg: 'rgba(52,199,89,0.12)',  text: '#34c759',  label: 'Delivered'  },
  cancelled: { bg: 'rgba(255,59,48,0.12)',  text: '#ff3b30',  label: 'Cancelled'  },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE['pending']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '2px 10px', borderRadius: 11, fontSize: 10, fontWeight: 600,
      backgroundColor: s.bg, color: s.text,
    }}>
      {s.label}
    </span>
  )
}

// ── Static bar chart data (matches Figma) ─────────────────────────────────────
const MONTHS = ['J','F','M','A','M','J','J','A','S','O','N','D']
const BAR_HEIGHTS = [76, 59, 95, 67, 105, 85, 116, 93, 112, 121, 89, 132]
const MAX_H = 132

// ── Stat card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string
  accent: string
  sub: string
  subColor: string
}

function StatCard({ label, value, accent, sub, subColor }: StatCardProps) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 12,
      overflow: 'hidden',
      padding: '13px 19px 13px 22px',
      flex: 1,
      position: 'relative',
      minWidth: 0,
    }}>
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 4, backgroundColor: accent,
      }} />
      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: subColor }}>{sub}</p>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAdminOrders({ skip: 0, limit: 4 }),
      getProducts({ skip: 0, limit: 1 }),
    ]).then(([ordersRes, productsRes]) => {
      setOrders(ordersRes.items)
      setTotalOrders(ordersRes.total)
      setTotalProducts(productsRes.total ?? 0)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Title */}
      <p style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        Welcome back, Admin
      </p>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>
        Here's what's happening with your store today.
      </p>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <StatCard
          label="Total Orders"
          value={loading ? '—' : totalOrders.toLocaleString()}
          accent="#34c759"
          sub="↑ 8.3% vs last month"
          subColor="#34c759"
        />
        <StatCard
          label="Active Products"
          value={loading ? '—' : totalProducts.toLocaleString()}
          accent="#ff3b30"
          sub="Manage your catalog"
          subColor="var(--text-secondary)"
        />
        <StatCard
          label="Total Users"
          value="—"
          accent="#ff9500"
          sub="↑ 15.2% new users"
          subColor="#34c759"
        />
        <StatCard
          label="Total Revenue"
          value="—"
          accent="var(--color-primary)"
          sub="↑ 12.5% vs last month"
          subColor="#34c759"
        />
      </div>

      {/* Sales Overview bar chart */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 12,
        padding: '19px 23px 23px',
        marginBottom: 32,
      }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          Sales Overview
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Monthly revenue — 2025
        </p>

        {/* Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
          {MONTHS.map((m, i) => {
            const h = Math.round((BAR_HEIGHTS[i] / MAX_H) * 140)
            const opacity = 0.25 + (i / 11) * 0.75
            const isLast = i === 11
            return (
              <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: '100%',
                  height: h,
                  borderRadius: 3,
                  backgroundColor: isLast ? 'var(--color-primary)' : `rgba(0,113,227,${opacity.toFixed(2)})`,
                }} />
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{m}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '17px 20px', borderBottom: '1px solid var(--border-default)',
        }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Orders</p>
          <button
            onClick={() => navigate('/admin/orders')}
            style={{
              fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)', borderRadius: 6,
              padding: '4px 12px', background: 'none', cursor: 'pointer',
            }}
          >
            View all →
          </button>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '140px 200px 140px 120px 1fr',
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-default)',
          padding: '10px 16px',
        }}>
          {['ORDER #', 'CUSTOMER', 'DATE', 'AMOUNT', 'STATUS'].map(col => (
            <span key={col} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: '24px 20px', color: 'var(--text-secondary)', fontSize: 14 }}>
            Loading...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '24px 20px', color: 'var(--text-secondary)', fontSize: 14 }}>
            No orders yet.
          </div>
        ) : (
          orders.map((order, idx) => (
            <div
              key={order.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 200px 140px 120px 1fr',
                padding: '16px 16px',
                alignItems: 'center',
                borderBottom: idx < orders.length - 1 ? '1px solid var(--border-default)' : 'none',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)' }}>
                #{`NV-${order.id.toString().padStart(8, '0')}`}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                {order.address?.full_name ?? '—'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                {new Date(order.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                ${Number(order.total_price).toFixed(2)}
              </span>
              <StatusBadge status={order.status} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
