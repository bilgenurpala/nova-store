import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'

function getBadge(product: Product): { label: string; color: string } | null {
  if (product.stock === 0) return null
  if (product.stock <= 5) return { label: 'HOT', color: '#ff9500' }
  const age = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)
  if (age < 14) return { label: 'NEW', color: '#0071e3' }
  if (product.price < 100) return { label: 'SALE', color: '#ff3b30' }
  return null
}

function FavoriteCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const { toggleFavorite } = useFavorites()
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)
  const img = product.images?.find(i => i.is_primary) ?? product.images?.[0]
  const badge = getBadge(product)

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
      style={{
        background: '#fff', border: '1px solid #d2d2d7', borderRadius: 12,
        overflow: 'hidden', cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image */}
      <div style={{ height: 200, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {img
          ? <img src={img.url} alt={product.name} style={{ maxHeight: 160, maxWidth: '80%', objectFit: 'contain' }} />
          : <span style={{ fontSize: 13, color: '#6e6e73' }}>image</span>
        }
        {/* Badge */}
        {badge && (
          <div style={{
            position: 'absolute', top: 11, left: 11,
            background: badge.color, color: '#fff',
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.5px',
          }}>{badge.label}</div>
        )}
        {/* Red filled heart (Figma: favorites have red heart) */}
        <button
          onClick={e => { e.stopPropagation(); toggleFavorite(product) }}
          style={{
            position: 'absolute', top: 9, right: 9, width: 28, height: 28,
            borderRadius: '50%', background: '#fff', border: '1px solid #d2d2d7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 14, color: '#ff3b30',
          }}
        >♥</button>
      </div>
      {/* Info */}
      <div style={{ padding: '12px 13px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#0071e3', marginBottom: 4, letterSpacing: '0.5px' }}>
          {product.category?.name?.toUpperCase() ?? ''}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </div>
        <div style={{ fontSize: 12, color: '#ff9500', marginBottom: 6 }}>
          ★★★★☆ <span style={{ color: '#6e6e73' }}>({Math.floor(product.id * 37 % 350) + 50})</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', marginBottom: 12 }}>
          ${Number(product.price).toLocaleString()}
        </div>
        <button
          onClick={handleAddToCart}
          style={{
            width: '100%', height: 36,
            background: added ? '#34c759' : '#0071e3', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (!added) (e.currentTarget.style.background = '#005ecb') }}
          onMouseLeave={e => { if (!added) (e.currentTarget.style.background = '#0071e3') }}
        >
          {added ? '✓ Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState('recent')
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  return (
    <div style={{ background: '#f5f5f7', minHeight: 'calc(100vh - 72px)' }}>
      {/* Breadcrumb */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #d2d2d7', height: 52,
        display: 'flex', alignItems: 'center', padding: '0 40px',
        gap: 6, position: 'sticky', top: 72, zIndex: 10,
      }}>
        <Link to="/" style={{ fontSize: 14, color: '#6e6e73', textDecoration: 'none' }}>Home</Link>
        <span style={{ fontSize: 14, color: '#6e6e73' }}> / </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>Favorites</span>

        {/* Sort by: Most Recent - sağda */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, color: '#6e6e73' }}>Sort by:</span>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSortDropdown(v => !v)}
              style={{
                height: 30, padding: '0 12px',
                background: '#f5f5f7', border: '1px solid #d2d2d7',
                borderRadius: 6, fontSize: 14, color: '#1d1d1f',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {sortBy === 'recent' ? 'Most Recent' : 'Price: Low to High'} ▾
            </button>
            {showSortDropdown && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                background: '#fff', border: '1px solid #d2d2d7', borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 20, minWidth: 180, overflow: 'hidden',
              }}>
                {[{ label: 'Most Recent', value: 'recent' }, { label: 'Price: Low to High', value: 'price_asc' }].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSortDropdown(false) }}
                    style={{
                      display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left',
                      background: sortBy === opt.value ? '#f5f5f7' : 'transparent',
                      border: 'none', cursor: 'pointer', fontSize: 14,
                      color: sortBy === opt.value ? '#0071e3' : '#1d1d1f',
                      fontWeight: sortBy === opt.value ? 600 : 400,
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '32px 40px 80px' }}>
        {/* Heading */}
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1d1d1f', margin: '0 0 6px' }}>My Favorites</h1>
        <p style={{ fontSize: 14, color: '#6e6e73', margin: '0 0 32px' }}>
          {favorites.length} saved item{favorites.length !== 1 ? 's' : ''}
        </p>

        {/* Empty state */}
        {favorites.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #d2d2d7',
            padding: '80px 40px', textAlign: 'center',
          }}>
            {/* Heart icon outline */}
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d2d2d7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', margin: '0 0 8px' }}>No favorites yet</h2>
            <p style={{ fontSize: 14, color: '#6e6e73', margin: '0 0 28px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              Save items you love by clicking the heart icon on any product.
            </p>
            <button
              onClick={() => navigate('/shop')}
              style={{
                background: '#0071e3', color: '#fff', border: 'none',
                borderRadius: 8, padding: '12px 32px', fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#005ecb')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0071e3')}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {favorites.map(product => (
              <FavoriteCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
