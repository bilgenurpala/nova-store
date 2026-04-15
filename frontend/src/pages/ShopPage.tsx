import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../api/products'
import { getCategories } from '../api/categories'
import type { Product, Category } from '../types'

// ─── Badge helpers ────────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, string> = {
  NEW: '#0071e3',
  SALE: '#ff3b30',
  HOT: '#ff9500',
  'BEST SELLER': '#34c759',
}

function getBadge(product: Product): string | null {
  if (product.stock === 0) return null
  if (product.stock <= 5) return 'HOT'
  const age =
    (Date.now() - new Date(product.created_at).getTime()) /
    (1000 * 60 * 60 * 24)
  if (age < 14) return 'NEW'
  if (product.price < 100) return 'SALE'
  return null
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const badge = getBadge(product)
  const primaryImage =
    product.images?.find((i) => i.is_primary) ?? product.images?.[0]

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d2d2d7',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'none'
      }}
    >
      {/* Image */}
      <div
        style={{
          height: '200px',
          backgroundColor: '#f5f5f7',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt_text || product.name}
            style={{
              maxHeight: '160px',
              maxWidth: '80%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <span style={{ fontSize: '13px', color: '#6e6e73' }}>image</span>
        )}

        {badge && (
          <div
            style={{
              position: 'absolute',
              top: '11px',
              left: '11px',
              backgroundColor: BADGE_COLORS[badge],
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px',
            }}
          >
            {badge}
          </div>
        )}

        <button
          style={{
            position: 'absolute',
            top: '9px',
            right: '9px',
            width: '28px',
            height: '28px',
            borderRadius: '14px',
            backgroundColor: '#ffffff',
            border: '1px solid #d2d2d7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#6e6e73',
          }}
        >
          ♡
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 13px 13px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#0071e3',
            marginBottom: '4px',
            letterSpacing: '0.5px',
          }}
        >
          {product.category?.name?.toUpperCase() ?? ''}
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1d1d1f',
            marginBottom: '6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {product.name}
        </div>
        <div style={{ fontSize: '13px', color: '#fbbf24', marginBottom: '4px' }}>
          ★★★★☆{' '}
          <span style={{ color: '#6e6e73' }}>
            ({Math.floor(Math.random() * 400) + 50})
          </span>
        </div>
        <div
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#1d1d1f',
            marginBottom: '12px',
          }}
        >
          ${Number(product.price).toLocaleString()}
        </div>
        <button
          style={{
            width: '100%',
            height: '36px',
            backgroundColor: '#0071e3',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = '#0077ed')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = '#0071e3')
          }
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        height: '353px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #d2d2d7',
        overflow: 'hidden',
      }}
    >
      <div style={{ height: '200px', backgroundColor: '#f0f0f3' }} />
      <div style={{ padding: '12px 13px' }}>
        <div
          style={{
            height: '12px',
            width: '60px',
            backgroundColor: '#f0f0f3',
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        />
        <div
          style={{
            height: '14px',
            width: '80%',
            backgroundColor: '#f0f0f3',
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        />
        <div
          style={{
            height: '20px',
            width: '40%',
            backgroundColor: '#f0f0f3',
            borderRadius: '4px',
            marginBottom: '12px',
          }}
        />
        <div
          style={{
            height: '36px',
            backgroundColor: '#f0f0f3',
            borderRadius: '8px',
          }}
        />
      </div>
    </div>
  )
}

// ─── Radio Button ─────────────────────────────────────────────────────────────

function RadioItem({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        marginBottom: '16px',
        fontSize: '14px',
        color: checked ? '#1d1d1f' : '#6e6e73',
        fontWeight: checked ? 600 : 400,
      }}
    >
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          border: checked ? '5px solid #0071e3' : '1.5px solid #d2d2d7',
          flexShrink: 0,
          transition: 'border 0.15s',
        }}
      />
      {label}
    </label>
  )
}

// ─── Sort Options ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { label: 'Best Sellers', value: 'best' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
]

const ITEMS_PER_PAGE = 12

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('best')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = {
        skip: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      }
      if (selectedCategory !== null) params.category_id = selectedCategory
      if (search.trim()) params.search = search.trim()

      const res = await getProducts(params)
      let items = res.items

      // Client-side sort
      if (sortBy === 'price_asc') items = [...items].sort((a, b) => a.price - b.price)
      if (sortBy === 'price_desc') items = [...items].sort((a, b) => b.price - a.price)
      if (sortBy === 'newest')
        items = [...items].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

      setProducts(items)
      setTotal(res.total)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, selectedCategory, search, sortBy])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [selectedCategory, search, sortBy])

  function renderPagination() {
    if (totalPages <= 1) return null

    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1, 2, 3, '...', totalPages)
    }

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '40px',
        }}
      >
        {/* ← */}
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #d2d2d7',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            color: page === 1 ? '#d2d2d7' : '#6e6e73',
          }}
        >
          ←
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#6e6e73',
              }}
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p as number)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: page === p ? '#0071e3' : '#ffffff',
                border:
                  page === p ? 'none' : '1px solid #d2d2d7',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: page === p ? 600 : 400,
                color: page === p ? '#ffffff' : '#6e6e73',
              }}
            >
              {p}
            </button>
          )
        )}

        {/* → */}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #d2d2d7',
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            color: page === totalPages ? '#d2d2d7' : '#6e6e73',
          }}
        >
          →
        </button>
      </div>
    )
  }

  const selectedSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Best Sellers'

  return (
    <div style={{ backgroundColor: '#f5f5f7', minHeight: 'calc(100vh - 72px)' }}>
      {/* ── Breadcrumb + Sort Bar ─────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #d2d2d7',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
          gap: '8px',
          position: 'sticky',
          top: '72px',
          zIndex: 10,
        }}
      >
        <Link
          to="/"
          style={{ fontSize: '14px', color: '#6e6e73', textDecoration: 'none' }}
        >
          Home
        </Link>
        <span style={{ fontSize: '14px', color: '#6e6e73' }}> / </span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>
          Shop
        </span>

        <span
          style={{
            marginLeft: 'auto',
            marginRight: '20px',
            fontSize: '14px',
            color: '#6e6e73',
          }}
        >
          {loading ? '—' : `${total} products found`}
        </span>

        {/* Search */}
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            height: '30px',
            padding: '0 12px',
            border: '1px solid #d2d2d7',
            borderRadius: '6px',
            fontSize: '13px',
            backgroundColor: '#f5f5f7',
            color: '#1d1d1f',
            outline: 'none',
            width: '200px',
          }}
        />

        {/* Sort */}
        <span style={{ fontSize: '14px', color: '#6e6e73', marginLeft: '12px' }}>
          Sort by:
        </span>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSortDropdown((v) => !v)}
            style={{
              height: '30px',
              padding: '0 12px',
              backgroundColor: '#f5f5f7',
              border: '1px solid #d2d2d7',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#1d1d1f',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            {selectedSortLabel} ▾
          </button>
          {showSortDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #d2d2d7',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                zIndex: 20,
                minWidth: '180px',
                overflow: 'hidden',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value)
                    setShowSortDropdown(false)
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    textAlign: 'left',
                    background:
                      sortBy === opt.value ? '#f5f5f7' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: sortBy === opt.value ? '#0071e3' : '#1d1d1f',
                    fontWeight: sortBy === opt.value ? 600 : 400,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Layout ───────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '24px 40px 60px',
          alignItems: 'flex-start',
        }}
      >
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside
          style={{
            width: '260px',
            flexShrink: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #d2d2d7',
            borderRadius: '12px',
            padding: '20px',
            position: 'sticky',
            top: '132px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f' }}>
              Filters
            </span>
            <button
              onClick={() => {
                setSelectedCategory(null)
                setSearch('')
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '14px',
                color: '#0071e3',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Clear all
            </button>
          </div>

          <div
            style={{
              height: '1px',
              backgroundColor: '#d2d2d7',
              margin: '0 -20px 16px',
            }}
          />

          {/* Category */}
          <div style={{ marginBottom: '8px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1d1d1f',
                marginBottom: '14px',
              }}
            >
              Category
            </div>

            <RadioItem
              label="All Products"
              checked={selectedCategory === null}
              onChange={() => setSelectedCategory(null)}
            />

            {categories.map((cat) => (
              <RadioItem
                key={cat.id}
                label={cat.name}
                checked={selectedCategory === cat.id}
                onChange={() => setSelectedCategory(cat.id)}
              />
            ))}
          </div>

          <div
            style={{
              height: '1px',
              backgroundColor: '#d2d2d7',
              margin: '8px -20px 20px',
            }}
          />

          {/* Price Range (static display) */}
          <div style={{ marginBottom: '8px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1d1d1f',
                marginBottom: '14px',
              }}
            >
              Price Range
            </div>
            <div
              style={{
                position: 'relative',
                height: '4px',
                backgroundColor: '#d2d2d7',
                borderRadius: '2px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  width: '65%',
                  height: '100%',
                  backgroundColor: '#0071e3',
                  borderRadius: '2px',
                }}
              />
            </div>
            <div style={{ fontSize: '14px', color: '#6e6e73' }}>$0 — $2,500</div>
          </div>

          <div
            style={{
              height: '1px',
              backgroundColor: '#d2d2d7',
              margin: '20px -20px 20px',
            }}
          />

          {/* Brand (static) */}
          <div style={{ marginBottom: '8px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1d1d1f',
                marginBottom: '14px',
              }}
            >
              Brand
            </div>
            {['Apple', 'Samsung', 'Sony', 'Dell', 'Bose'].map((brand) => (
              <label
                key={brand}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '14px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#6e6e73',
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '1.5px solid #d2d2d7',
                    flexShrink: 0,
                  }}
                />
                {brand}
              </label>
            ))}
          </div>

          <div
            style={{
              height: '1px',
              backgroundColor: '#d2d2d7',
              margin: '8px -20px 20px',
            }}
          />

          {/* Rating (static) */}
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1d1d1f',
                marginBottom: '14px',
              }}
            >
              Customer Rating
            </div>
            {[
              '★★★★★  5 Stars',
              '★★★★☆  4+ Stars',
              '★★★☆☆  3+ Stars',
            ].map((r) => (
              <label
                key={r}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '14px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#6e6e73',
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '1.5px solid #d2d2d7',
                    flexShrink: 0,
                  }}
                />
                {r}
              </label>
            ))}
          </div>
        </aside>

        {/* ── Product Grid ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px',
              }}
            >
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: '#6e6e73',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#1d1d1f', marginBottom: '8px' }}>
                No products found
              </div>
              <div style={{ fontSize: '14px' }}>
                Try adjusting your filters or search term.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px',
              }}
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {renderPagination()}
        </div>
      </div>
    </div>
  )
}
