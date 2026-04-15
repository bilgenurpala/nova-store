import { useEffect, useState, useCallback } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/products'
import { getCategories } from '../../api/categories'
import type { Product, Category } from '../../types'

// ── Status badge ───────────────────────────────────────────────────────────────
function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return <Pill bg="rgba(255,59,48,0.12)" color="#ff3b30" label="Out of Stock" />
  if (stock <= 10)
    return <Pill bg="rgba(255,149,0,0.12)" color="#ff9500" label="Low Stock" />
  return <Pill bg="rgba(52,199,89,0.12)" color="#34c759" label="In Stock" />
}

function Pill({ bg, color, label }: { bg: string; color: string; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: 11, fontSize: 10, fontWeight: 600,
      backgroundColor: bg, color,
    }}>
      {label}
    </span>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  editing: Product | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

function ProductModal({ open, editing, categories, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '', category_id: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description ?? '',
        price: String(editing.price),
        stock: String(editing.stock),
        category_id: String(editing.category_id),
      })
    } else {
      setForm({ name: '', description: '', price: '', stock: '', category_id: '' })
    }
    setError('')
  }, [editing, open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.price || !form.stock || !form.category_id) {
      setError('Please fill in all required fields.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        category_id: parseInt(form.category_id),
      }
      if (editing) {
        await updateProduct(editing.id, payload)
      } else {
        await createProduct(payload)
      }
      onSaved()
    } catch {
      setError('Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 13px',
    border: '1px solid var(--border-default)', borderRadius: 8,
    backgroundColor: 'var(--bg-primary)', fontSize: 14,
    color: 'var(--text-primary)', outline: 'none',
    fontFamily: 'inherit',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, display: 'block',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
      zIndex: 100, padding: 32,
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderRadius: 12, width: 440, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '19px 19px 0',
        }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            {editing ? 'Edit Product' : 'Add New Product'}
          </p>
          <button onClick={onClose} style={{ fontSize: 20, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ height: 1, backgroundColor: 'var(--border-default)', margin: '16px 0 0' }} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '19px 19px 19px' }}>
          {error && (
            <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{error}</p>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Product Name</label>
            <input
              style={inputStyle}
              placeholder="e.g. iPhone 15 Pro"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Category</label>
            <select
              style={{ ...inputStyle, backgroundColor: 'var(--bg-primary)' }}
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            >
              <option value="">Select category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Price</label>
              <input
                style={inputStyle}
                type="number" min="0" step="0.01"
                placeholder="$0.00"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Stock</label>
              <input
                style={inputStyle}
                type="number" min="0"
                placeholder="0"
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, height: 80, padding: '13px', resize: 'vertical' }}
              placeholder="Product description..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div style={{ height: 1, backgroundColor: 'var(--border-default)', marginBottom: 16 }} />

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1, height: 44, backgroundColor: 'var(--color-primary)',
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {saving ? 'Saving...' : 'Save Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 100, height: 44, backgroundColor: 'transparent',
                color: 'var(--text-primary)', border: '1px solid var(--border-default)',
                borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const PAGE_SIZE = 8

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getProducts({
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        category_id: activeCat,
        search: search || undefined,
      })
      setProducts(res.items ?? (res as unknown as Product[]))
      setTotal(res.total ?? 0)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, activeCat, search])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error)
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id)
      setDeleteConfirm(null)
      load()
    } catch {
      alert('Failed to delete product.')
    }
  }

  const thStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)',
  }

  return (
    <>
      <ProductModal
        open={modalOpen}
        editing={editing}
        categories={categories}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSaved={() => { setModalOpen(false); setEditing(null); load() }}
      />

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Product List</p>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          style={{
            height: 44, padding: '0 20px',
            backgroundColor: 'var(--color-primary)', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Add Product
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        {/* Search */}
        <input
          style={{
            height: 44, width: 320, padding: '0 13px',
            border: '1px solid var(--border-default)', borderRadius: 8,
            backgroundColor: 'var(--bg-primary)', fontSize: 14,
            color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
          }}
          placeholder="Search products..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        {/* All tab */}
        <FilterTab
          label={`All (${total})`}
          active={activeCat === undefined}
          onClick={() => { setActiveCat(undefined); setPage(1) }}
        />
        {/* Category tabs */}
        {categories.slice(0, 4).map(c => (
          <FilterTab
            key={c.id}
            label={c.name}
            active={activeCat === c.id}
            onClick={() => { setActiveCat(c.id); setPage(1) }}
          />
        ))}
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
          gridTemplateColumns: '80px 1fr 130px 90px 80px 110px 130px',
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-default)',
          padding: '12px 16px',
        }}>
          {[{}, { label: 'PRODUCT' }, { label: 'CATEGORY' }, { label: 'PRICE' }, { label: 'STOCK' }, { label: 'STATUS' }, { label: 'ACTIONS' }].map((col, i) => (
            <span key={i} style={thStyle}>{'label' in col ? col.label : ''}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '32px 20px', color: 'var(--text-secondary)', fontSize: 14 }}>Loading...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '32px 20px', color: 'var(--text-secondary)', fontSize: 14 }}>No products found.</div>
        ) : (
          products.map((p, idx) => {
            const primary = p.images?.find(i => i.is_primary) ?? p.images?.[0]
            return (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 130px 90px 80px 110px 130px',
                  padding: '12px 16px',
                  alignItems: 'center',
                  borderBottom: idx < products.length - 1 ? '1px solid var(--border-default)' : 'none',
                  minHeight: 72,
                }}
              >
                {/* Image */}
                <div style={{
                  width: 48, height: 48,
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {primary
                    ? <img src={primary.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: 24, height: 24, backgroundColor: 'var(--border-default)', borderRadius: 4 }} />
                  }
                </div>

                {/* Name + SKU */}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ID: {p.id}</p>
                </div>

                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.category?.name ?? '—'}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>${Number(p.price).toFixed(2)}</span>
                <span style={{
                  fontSize: 13,
                  color: p.stock === 0 ? 'var(--red)' : p.stock <= 10 ? 'var(--red)' : 'var(--text-primary)',
                }}>
                  {p.stock} units
                </span>
                <StockBadge stock={p.stock} />

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setEditing(p); setModalOpen(true) }}
                    style={{
                      height: 34, padding: '0 12px',
                      border: '1px solid var(--border-default)', borderRadius: 6,
                      backgroundColor: 'transparent', fontSize: 12,
                      fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  {deleteConfirm === p.id ? (
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{
                        height: 34, padding: '0 10px',
                        border: '1px solid rgba(255,59,48,0.3)', borderRadius: 6,
                        backgroundColor: 'rgba(255,59,48,0.12)', fontSize: 12,
                        fontWeight: 500, color: 'var(--red)', cursor: 'pointer',
                      }}
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(p.id)}
                      style={{
                        height: 34, padding: '0 10px',
                        border: '1px solid rgba(255,59,48,0.3)', borderRadius: 6,
                        backgroundColor: 'rgba(255,59,48,0.08)', fontSize: 12,
                        fontWeight: 500, color: 'var(--red)', cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* Pagination */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-primary)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total} products
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <PgBtn label="←" disabled={page === 1} onClick={() => setPage(p => p - 1)} />
            {[...Array(Math.min(totalPages, 3))].map((_, i) => (
              <PgBtn key={i} label={String(i + 1)} active={page === i + 1} onClick={() => setPage(i + 1)} />
            ))}
            {totalPages > 3 && <PgBtn label="..." disabled />}
            {totalPages > 3 && <PgBtn label={String(totalPages)} active={page === totalPages} onClick={() => setPage(totalPages)} />}
            <PgBtn label="→" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
          </div>
        </div>
      </div>
    </>
  )
}

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 44, padding: '0 12px',
        border: active ? '1px solid var(--color-primary)' : '1px solid var(--border-default)',
        borderRadius: 8,
        backgroundColor: active ? 'rgba(0,113,227,0.1)' : 'transparent',
        fontSize: 13, fontWeight: active ? 600 : 400,
        color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
        cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
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
    >
      {label}
    </button>
  )
}
