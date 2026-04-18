import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Truck, RefreshCw, ShieldCheck } from 'lucide-react'
import { getProduct, getProducts } from '../api/products'
import { addToCart } from '../api/cart'
import type { Product } from '../types'

// ─── Related Product Card ────────────────────────────────────────────────────

function RelatedCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const img = product.images?.find((i) => i.is_primary) ?? product.images?.[0]

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d2d2d7',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        flex: '1 1 0',
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
      <div
        style={{
          height: '180px',
          backgroundColor: '#f5f5f7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {img ? (
          <img
            src={img.url}
            alt={img.alt_text || product.name}
            style={{ maxHeight: '140px', maxWidth: '80%', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: '13px', color: '#6e6e73' }}>image</span>
        )}
      </div>
      <div style={{ padding: '12px 13px 13px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#0071e3', marginBottom: '4px', letterSpacing: '0.5px' }}>
          {product.category?.name?.toUpperCase() ?? ''}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </div>
        <div style={{ fontSize: 12, color: '#ff9500', marginBottom: 6 }}>
          ★★★★☆ <span style={{ color: '#6e6e73' }}>({Math.floor(Math.random() * 300) + 50})</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0071e3', marginBottom: 12 }}>
          ${Number(product.price).toLocaleString()}
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
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
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

// ─── Selector Chip ───────────────────────────────────────────────────────────

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: '32px',
        padding: '0 14px',
        borderRadius: '8px',
        border: selected ? '2px solid #0071e3' : '1px solid #d2d2d7',
        backgroundColor: selected ? '#ffffff' : '#ffffff',
        color: selected ? '#0071e3' : '#1d1d1f',
        fontSize: '13px',
        fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

type Tab = 'description' | 'specs' | 'reviews'

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // UI state
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedStorage, setSelectedStorage] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<Tab>('description')
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMsg, setCartMsg] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    try {
      const p = await getProduct(Number(id))
      setProduct(p)
      setSelectedImage(0)
      // Load related: same category, exclude current
      const rel = await getProducts({ skip: 0, limit: 5, category_id: p.category_id })
      setRelated(rel.items.filter((r) => r.id !== p.id).slice(0, 4))
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleAddToCart() {
    if (!product) return
    setAddingToCart(true)
    setCartMsg('')
    try {
      await addToCart(product.id, quantity)
      setCartMsg('Added to cart!')
      setTimeout(() => setCartMsg(''), 2500)
    } catch {
      setCartMsg('Please sign in to add items to cart.')
      setTimeout(() => setCartMsg(''), 3000)
    } finally {
      setAddingToCart(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ backgroundColor: '#f5f5f7', minHeight: 'calc(100vh - 72px)', padding: '40px' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div style={{ height: '500px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #d2d2d7' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[60, 40, 80, 100, 200].map((h, i) => (
              <div key={i} style={{ height: h, backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #d2d2d7' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Not Found ────────────────────────────────────────────────────────────
  if (notFound || !product) {
    return (
      <div style={{ backgroundColor: '#f5f5f7', minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>📦</div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1d1d1f' }}>Product not found</h2>
        <Link to="/shop" style={{ color: '#0071e3', textDecoration: 'none', fontSize: '15px' }}>← Back to Shop</Link>
      </div>
    )
  }

  const images = product.images?.length > 0 ? product.images : []
  const primaryImg = images[selectedImage]
  const COLORS = ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium']
  const STORAGES = ['128GB', '256GB', '512GB', '1TB']

  const SPECS = [
    { label: 'Category',    value: product.category?.name ?? '—' },
    { label: 'Price',       value: `$${Number(product.price).toLocaleString()}` },
    { label: 'Stock',       value: product.stock > 0 ? `${product.stock} units available` : 'Out of stock' },
    { label: 'Condition',   value: 'Brand New' },
    { label: 'Warranty',    value: '1 Year Manufacturer Warranty' },
    { label: 'Product ID',  value: `#${String(product.id).padStart(5, '0')}` },
  ]

  return (
    <div style={{ backgroundColor: '#f5f5f7' }}>
      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #d2d2d7',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
          gap: '6px',
          position: 'sticky',
          top: '72px',
          zIndex: 10,
        }}
      >
        <Link to="/" style={{ fontSize: '14px', color: '#6e6e73', textDecoration: 'none' }}>Home</Link>
        <span style={{ fontSize: '14px', color: '#6e6e73' }}> / </span>
        <Link to="/shop" style={{ fontSize: '14px', color: '#6e6e73', textDecoration: 'none' }}>Shop</Link>
        <span style={{ fontSize: '14px', color: '#6e6e73' }}> / </span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>{product.name}</span>
      </div>

      {/* ── Main Product Section ────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '32px 40px 0',
          display: 'grid',
          gridTemplateColumns: '664px 1fr',
          gap: '40px',
          alignItems: 'start',
        }}
      >
        {/* LEFT: Images */}
        <div>
          {/* Main image */}
          <div
            style={{
              height: '500px',
              backgroundColor: '#ffffff',
              border: '1px solid #d2d2d7',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginBottom: '16px',
            }}
          >
            {primaryImg ? (
              <img
                src={primaryImg.url}
                alt={primaryImg.alt_text || product.name}
                style={{ maxHeight: '440px', maxWidth: '90%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ color: '#6e6e73', fontSize: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>📱</div>
                <div>{product.name}</div>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {images.slice(0, 4).map((img, i) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  style={{
                    width: '160px',
                    height: '80px',
                    border: i === selectedImage ? '2px solid #0071e3' : '1px solid #d2d2d7',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.alt_text || `thumb-${i + 1}`}
                    style={{ maxHeight: '64px', maxWidth: '90%', objectFit: 'contain' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Info */}
        <div>
          {/* Category + Name */}
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0071e3', marginBottom: '8px', letterSpacing: '0.5px' }}>
            {product.category?.name?.toUpperCase() ?? 'PRODUCT'}
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#1d1d1f', margin: '0 0 12px', lineHeight: 1.1 }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ color: '#ff9500', fontSize: '14px' }}>★★★★★</span>
            <span style={{ fontSize: '14px', color: '#6e6e73' }}>4.8  (2,847 reviews)</span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '36px', fontWeight: 700, color: '#0071e3' }}>
              ${Number(product.price).toLocaleString()}.00
            </span>
            {product.stock > 0 && (
              <div style={{ backgroundColor: '#34c759', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                IN STOCK
              </div>
            )}
          </div>

          <div style={{ height: '1px', backgroundColor: '#d2d2d7', marginBottom: '20px' }} />

          {/* Description */}
          {product.description && (
            <p style={{ fontSize: '14px', color: '#6e6e73', lineHeight: 1.6, marginBottom: '24px' }}>
              {product.description}
            </p>
          )}

          {/* Color selector */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f', marginBottom: '10px' }}>Color</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLORS.map((c, i) => (
                <Chip key={c} label={c} selected={selectedColor === i} onClick={() => setSelectedColor(i)} />
              ))}
            </div>
          </div>

          {/* Storage selector */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f', marginBottom: '10px' }}>Storage</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {STORAGES.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setSelectedStorage(i)}
                  style={{
                    width: '64px',
                    height: '32px',
                    borderRadius: '8px',
                    border: selectedStorage === i ? '1px solid #0071e3' : '1px solid #d2d2d7',
                    backgroundColor: selectedStorage === i ? '#0071e3' : '#ffffff',
                    color: selectedStorage === i ? '#ffffff' : '#1d1d1f',
                    fontSize: '14px',
                    fontWeight: selectedStorage === i ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f', marginBottom: '10px' }}>Quantity</div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: '40px',
              border: '1px solid #d2d2d7',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#1d1d1f' }}
              >−</button>
              <span style={{ width: '48px', textAlign: 'center', fontSize: '16px', fontWeight: 600, color: '#1d1d1f' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#1d1d1f' }}
              >+</button>
            </div>
          </div>

          {/* Cart feedback */}
          {cartMsg && (
            <div style={{
              padding: '10px 16px',
              borderRadius: '8px',
              marginBottom: '12px',
              fontSize: '14px',
              backgroundColor: cartMsg.includes('sign in') ? 'rgba(255,59,48,0.08)' : 'rgba(52,199,89,0.1)',
              color: cartMsg.includes('sign in') ? '#ff3b30' : '#34c759',
              border: `1px solid ${cartMsg.includes('sign in') ? 'rgba(255,59,48,0.2)' : 'rgba(52,199,89,0.2)'}`,
            }}>
              {cartMsg}
            </div>
          )}

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: product.stock === 0 ? '#d2d2d7' : addingToCart ? '#a0c0f0' : '#0071e3',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: product.stock === 0 || addingToCart ? 'not-allowed' : 'pointer',
              marginBottom: '12px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { if (!addingToCart && product.stock > 0) e.currentTarget.style.backgroundColor = '#0077ed' }}
            onMouseLeave={(e) => { if (!addingToCart && product.stock > 0) e.currentTarget.style.backgroundColor = '#0071e3' }}
          >
            {product.stock === 0 ? 'Out of Stock' : addingToCart ? 'Adding…' : 'Add to Cart'}
          </button>

          {/* Add to Wishlist */}
          <button
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: 'transparent',
              color: '#0071e3',
              border: '1px solid #d2d2d7',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0071e3')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#d2d2d7')}
          >
            <Heart size={16} />
            Add to Wishlist
          </button>

          <div style={{ height: '1px', backgroundColor: '#d2d2d7', margin: '24px 0' }} />

          {/* Delivery info */}
          {[
            { icon: <Truck size={16} />, title: 'Free Delivery', sub: 'Arrives in 2-3 business days' },
            { icon: <RefreshCw size={16} />, title: '↩ Easy Returns', sub: '30-day hassle-free returns' },
            { icon: <ShieldCheck size={16} />, title: 'Secure Payment', sub: '256-bit SSL encryption' },
          ].map((item) => (
            <div key={item.title} style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                {item.icon} {item.title}
              </div>
              <div style={{ fontSize: '14px', color: '#6e6e73', paddingLeft: '22px' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab Bar ────────────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #d2d2d7', marginTop: '32px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', display: 'flex', gap: '40px' }}>
          {(['description', 'specs', 'reviews'] as Tab[]).map((tab) => {
            const labels: Record<Tab, string> = { description: 'Description', specs: 'Specifications', reviews: 'Reviews' }
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  height: '48px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '3px solid #0071e3' : '3px solid transparent',
                  fontSize: '14px',
                  fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? '#0071e3' : '#6e6e73',
                  cursor: 'pointer',
                  padding: '0',
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {labels[tab]}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #d2d2d7' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 40px' }}>
          {activeTab === 'description' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1d1d1f', marginBottom: '20px' }}>Product Description</h2>
              <p style={{ fontSize: '14px', color: '#6e6e73', lineHeight: 1.8, maxWidth: '800px' }}>
                {product.description ?? 'No description available for this product.'}
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1d1d1f', marginBottom: '20px' }}>Specifications</h2>
              <div style={{ border: '1px solid #d2d2d7', borderRadius: '12px', overflow: 'hidden' }}>
                {SPECS.map((spec, i) => (
                  <div
                    key={spec.label}
                    style={{
                      display: 'flex',
                      padding: '16px 20px',
                      borderBottom: i < SPECS.length - 1 ? '1px solid #d2d2d7' : 'none',
                    }}
                  >
                    <div style={{ width: '220px', fontSize: '14px', fontWeight: 600, color: '#1d1d1f', flexShrink: 0 }}>
                      {spec.label}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6e6e73' }}>{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1d1d1f', marginBottom: '20px' }}>Customer Reviews</h2>
              <p style={{ fontSize: '14px', color: '#6e6e73' }}>Reviews coming soon.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── You Might Also Like ───────────────────────────────────────────── */}
      {related.length > 0 && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 40px 80px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#1d1d1f', marginBottom: '24px' }}>
            You Might Also Like
          </h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            {related.map((p) => (
              <RelatedCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
