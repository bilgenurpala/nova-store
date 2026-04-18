import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProducts } from '../api/products'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const img = product.images?.find(i => i.is_primary) ?? product.images?.[0]
  const [added, setAdded] = useState(false)

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation()
    const ok = await addToCart(product.id)
    if (ok) {
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    } else {
      navigate('/login')
    }
  }

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      style={{
        background: '#fff', border: '1px solid #d2d2d7', borderRadius: 12,
        overflow: 'hidden', cursor: 'pointer', flex: 1,
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{ height: 180, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {img
          ? <img src={img.url} alt={product.name} style={{ maxHeight: 140, maxWidth: '80%', objectFit: 'contain' }} />
          : <span style={{ fontSize: 13, color: '#6e6e73' }}>{product.name}</span>
        }
      </div>
      <div style={{ padding: '12px 13px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#0071e3', marginBottom: 4, letterSpacing: '0.5px' }}>
          {product.category?.name?.toUpperCase() ?? ''}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', marginBottom: 12 }}>
          ${Number(product.price).toLocaleString()}
        </div>
        <button
          onClick={handleAddToCart}
          style={{
            width: '100%', height: 36, background: added ? '#34c759' : '#0071e3', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {added ? '✓ Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

export default function NotFoundPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [popularProducts, setPopularProducts] = useState<Product[]>([])

  useEffect(() => {
    getProducts({ skip: 0, limit: 4 }).then(res => {
      if (res?.items?.length > 0) setPopularProducts(res.items)
    }).catch(() => {})
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div style={{ background: '#f5f5f7', minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', padding: '80px 40px 40px', position: 'relative', width: '100%', maxWidth: 700 }}>
        {/* Large watermark 404 */}
        <div style={{
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
          fontSize: 220, fontWeight: 800, color: '#f5f5f7',
          lineHeight: 1, userSelect: 'none', zIndex: 0,
          letterSpacing: '-8px',
        }}>
          404
        </div>

        {/* Smaller 404 above heading */}
        <div style={{
          position: 'relative', zIndex: 1,
          fontSize: 80, fontWeight: 800, color: '#d1d1d6',
          lineHeight: 1, marginBottom: 16,
          letterSpacing: '-3px',
        }}>
          404
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 40, fontWeight: 700, color: '#1d1d1f', margin: '0 0 16px', position: 'relative', zIndex: 1 }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: 16, color: '#6e6e73', margin: '0 0 36px', position: 'relative', zIndex: 1 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 36, position: 'relative', zIndex: 1 }}>
          <Link
            to="/"
            style={{
              width: 160, height: 48, background: '#0071e3', color: '#fff',
              borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >Go Home</Link>
          <Link
            to="/shop"
            style={{
              width: 160, height: 48, background: 'transparent', color: '#0071e3',
              border: '1px solid #0071e3', borderRadius: 8, fontSize: 15, fontWeight: 600,
              textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >Browse Shop</Link>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 14, color: '#6e6e73', marginBottom: 12 }}>Or try searching for what you need:</p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: 300, height: 44, padding: '0 16px',
                border: '1px solid #d2d2d7', borderRadius: 8,
                fontSize: 14, color: '#1d1d1f', background: '#fff',
                outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = '#0071e3')}
              onBlur={e => (e.target.style.borderColor = '#d2d2d7')}
            />
            <button
              type="submit"
              style={{
                width: 44, height: 44, background: '#0071e3', color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}
            >→</button>
          </form>
        </div>
      </div>

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <div style={{ maxWidth: 1200, width: '100%', padding: '0 40px 80px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', margin: '0 0 24px', textAlign: 'center' }}>
            You might be interested in these
          </h2>
          <div style={{ display: 'flex', gap: 20 }}>
            {popularProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
