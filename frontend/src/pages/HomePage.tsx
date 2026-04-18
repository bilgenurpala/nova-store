import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProducts } from '../api/products'
import type { Product } from '../types'
import AIChatPanel from '../components/AIChatPanel'
import CategoriesBar from '../components/CategoriesBar'
import { useCart } from '../context/CartContext'

// ─── Figma Asset URLs ────────────────────────────────────────────────────────
const SLIDE_1 = 'https://www.figma.com/api/mcp/asset/a3d6d4fb-743f-4146-a292-b50a0950ce00'
const SLIDE_2 = 'https://www.figma.com/api/mcp/asset/5a6e62e8-920f-4ee0-9bcd-60a90a02aa24'
const SLIDE_3 = 'https://www.figma.com/api/mcp/asset/27f81a35-30a1-4585-9940-98146f36e254'

const ELLIPSE_SONY    = 'https://www.figma.com/api/mcp/asset/d9dfd85c-2ac9-4caa-a6d8-ea541dc7f33e'
const ELLIPSE_IPAD    = 'https://www.figma.com/api/mcp/asset/f5d908d7-c22f-4e1f-9b8f-77ae9559ed76'
const ELLIPSE_GALAXY  = 'https://www.figma.com/api/mcp/asset/00ba45e6-c101-4595-9bc7-5be5754aabf3'
const ELLIPSE_SURFACE = 'https://www.figma.com/api/mcp/asset/b6fbcd18-53bb-4906-8c88-2e145ba4d8f1'

// ─── Hero Slides Data ─────────────────────────────────────────────────────────
const SLIDES = [
  {
    img: SLIDE_1,
    line1: 'Next-Gen Tech,',
    line2: 'At Your Fingertips.',
    sub: 'Discover the latest smartphones, laptops, tablets and more — all in one place.',
  },
  {
    img: SLIDE_2,
    line1: 'Power Meets',
    line2: 'Elegance.',
    sub: 'Discover our latest smartphones — sleek design, powerful performance, all in one device.',
  },
  {
    img: SLIDE_3,
    line1: 'Sound Beyond',
    line2: 'Imagination.',
    sub: 'Immerse yourself in music with industry-leading noise cancellation.',
  },
]

// ─── New Arrivals static card metadata ───────────────────────────────────────
const NEW_ARRIVAL_STYLES = [
  {
    bg: '#1a1a21', titleColor: '#e6e6e6', subColor: '#8c8c99',
    badge: 'New', badgeBg: '#12ad6b', ellipse: ELLIPSE_SONY,
  },
  {
    bg: '#f0f2f7', titleColor: '#1a1a1f', subColor: '#737885',
    badge: 'New', badgeBg: '#12ad6b', ellipse: ELLIPSE_IPAD,
  },
  {
    bg: '#0f1729', titleColor: '#ebedf2', subColor: '#808ca6',
    badge: 'Limited', badgeBg: '#eb661f', ellipse: ELLIPSE_GALAXY,
  },
  {
    bg: '#f5f7fa', titleColor: '#1a1c21', subColor: '#737885',
    badge: 'New', badgeBg: '#12ad6b', ellipse: ELLIPSE_SURFACE,
  },
]

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    initials: 'AK', avatarBg: '#8f45f5',
    text: 'Amazing price on the MacBook Pro and incredibly fast shipping. The NovaStore AI assistant helped me find exactly the model I needed!',
    name: 'Ayse K.', sub: 'MacBook Pro · Verified',
  },
  {
    initials: 'MA', avatarBg: '#1754f5',
    text: 'Got the AirPods Max here — packaging was immaculate. The comparison feature made it crystal clear why this was the right choice.',
    name: 'Mehmet A.', sub: 'AirPods Max · Verified',
  },
  {
    initials: 'ZB', avatarBg: '#12ad6b',
    text: "I typed 'suggest a gaming laptop' to the AI assistant and got 3 budget-matched options. Bought the best one. Couldn't be happier!",
    name: 'Zeynep B.', sub: 'ASUS ROG · Verified',
  },
]

function getBadge(product: Product): { label: string; color: string } | null {
  if (product.stock === 0) return null
  if (product.stock <= 5) return { label: 'Hot', color: '#ff7021' }
  const age = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)
  if (age < 14) return { label: 'New', color: '#0070e3' }
  if (product.price < 100) return { label: 'Sale', color: '#f24545' }
  return null
}

// ─── Hero Slider Component ────────────────────────────────────────────────────
function HeroSlider() {
  const [idx, setIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate()

  const go = useCallback((n: number) => {
    setIdx((n + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(() => go(idx + 1), 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [idx, go])

  const s = SLIDES[idx]

  return (
    <section style={{ position: 'relative', height: 600, overflow: 'hidden', background: '#ffffff' }}>
      {/* Background image */}
      <img
        src={s.img}
        alt=""
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          transition: 'opacity 0.5s ease',
        }}
      />

      {/* White overlay gradient (left side, so text is readable) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.9) 35%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0) 80%)',
        zIndex: 1,
      }} />

      {/* Text content */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        paddingLeft: 95, zIndex: 2, maxWidth: 640,
      }}>
        <p style={{ fontSize: 64, fontWeight: 700, color: '#1d1d1f', lineHeight: 1.1, margin: 0 }}>{s.line1}</p>
        <p style={{ fontSize: 64, fontWeight: 700, color: '#0071e3', lineHeight: 1.1, margin: '0 0 16px' }}>{s.line2}</p>
        <p style={{ fontSize: 16, color: '#6e6e73', marginBottom: 32, maxWidth: 500 }}>{s.sub}</p>
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={() => navigate('/shop')}
            style={{
              width: 160, height: 48, background: '#0071e3', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', fontWeight: 500,
            }}
          >Shop Now</button>
          <button
            onClick={() => navigate('/shop')}
            style={{
              width: 160, height: 48, background: 'transparent', color: '#0071e3',
              border: '1px solid #0071e3', borderRadius: 8, fontSize: 16, cursor: 'pointer',
            }}
          >Explore →</button>
        </div>
      </div>

      {/* Prev / Next arrows */}
      {[{ label: '‹', side: 'left', offset: 24, dir: -1 }, { label: '›', side: 'right', offset: 24, dir: 1 }].map(a => (
        <button
          key={a.side}
          onClick={() => go(idx + a.dir)}
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            [a.side]: a.offset, zIndex: 3,
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.4)',
            fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
          }}
        >{a.label}</button>
      ))}

      {/* Dot navigation */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 8, zIndex: 3,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            style={{
              height: 8, width: i === idx ? 28 : 8,
              borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === idx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
              transition: 'width 0.3s, background 0.3s', padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  )
}

// ─── Popular Product Card (API-driven) ───────────────────────────────────────
function PopularProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
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
        background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12,
        overflow: 'hidden', cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        width: 322,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image area */}
      <div style={{ height: 200, background: '#f5f5f5', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {img
          ? <img src={img.url} alt={product.name} style={{ maxHeight: 160, maxWidth: '80%', objectFit: 'contain' }} />
          : <span style={{ color: '#aaa', fontSize: 13 }}>{product.name}</span>
        }
        {badge && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: badge.color, color: '#fff',
            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
            width: 44, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{badge.label}</div>
        )}
        <button
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 10, right: 10, width: 28, height: 28,
            borderRadius: 14, background: '#fff', border: '1px solid #d2d2d7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 14, color: '#6e6e73',
          }}>♡</button>
      </div>
      {/* Info area */}
      <div style={{ padding: '12px 12px 14px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1d', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </div>
        <div style={{ fontSize: 12, color: '#ffc200', marginBottom: 8 }}>
          ★★★★☆{' '}<span style={{ color: '#808080', fontSize: 11 }}>({Math.floor(product.id * 37 % 350) + 50})</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#0071e3', marginBottom: 12 }}>${Number(product.price).toLocaleString()}</div>
        <button
          style={{
            width: 216, height: 36, background: added ? '#34c759' : '#0071e3', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (!added) (e.currentTarget.style.background = '#005ecb') }}
          onMouseLeave={e => { if (!added) (e.currentTarget.style.background = '#0071e3') }}
          onClick={handleAddToCart}
        >{added ? '✓ Added!' : 'Add to Cart'}</button>
      </div>
    </div>
  )
}

// ─── New Arrival Card (API-driven) ───────────────────────────────────────────
function NewArrivalCard({ product, styleIdx }: { product: Product; styleIdx: number }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const style = NEW_ARRIVAL_STYLES[styleIdx % NEW_ARRIVAL_STYLES.length]
  const img = product.images?.find(i => i.is_primary) ?? product.images?.[0]

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation()
    const ok = await addToCart(product.id)
    if (!ok) navigate('/login')
  }

  return (
    <div
      style={{
        background: '#fff', borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.07)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        width: 322,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px -2px rgba(0,0,0,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px -2px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'none' }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Colored top area */}
      <div style={{ height: 190, background: style.bg, position: 'relative', overflow: 'hidden', borderRadius: '14px 14px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Decorative ellipse */}
        <img src={style.ellipse} alt="" style={{ position: 'absolute', top: -30, right: 0, width: 80, height: 80 }} />
        {/* Product image or name */}
        {img
          ? <img src={img.url} alt={product.name} style={{ maxHeight: 140, maxWidth: '75%', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
          : (
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: style.titleColor }}>{product.name}</div>
              <div style={{ fontSize: 12, color: style.subColor, marginTop: 8 }}>{product.category?.name ?? ''}</div>
            </div>
          )
        }
        {/* Badge */}
        <div style={{
          position: 'absolute', top: 14, left: 14,
          background: style.badgeBg, color: '#fff',
          fontSize: 10.5, fontWeight: 600, padding: '5px 10px', borderRadius: 12,
          zIndex: 2,
        }}>{style.badge}</div>
      </div>
      {/* Card info */}
      <div style={{ padding: '12px 16px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#0071e3', marginBottom: 4, letterSpacing: '0.5px' }}>
          {product.category?.name?.toUpperCase() ?? ''}
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#171c24', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
        <div style={{ fontSize: 13, color: '#fcbf14', marginBottom: 10 }}>
          ★★★★★{' '}<span style={{ color: '#808794', fontSize: 11.5 }}>4.8 ({Math.floor(product.id * 53 % 900) + 100})</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1754f5', marginBottom: 12 }}>${Number(product.price).toLocaleString()}</div>
        <button
          style={{
            width: 290, height: 38, background: '#1754f5', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1245d6')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1754f5')}
          onClick={handleAddToCart}
        >Add to Cart</button>
      </div>
    </div>
  )
}

// ─── AI Chat Button ───────────────────────────────────────────────────────────
function AIChatButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        title="Chat with Nova AI"
        style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 1000,
          width: 60, height: 60, borderRadius: 60,
          background: open ? '#0f3fc7' : '#1754f5',
          color: '#fff', border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(23,84,245,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s, background 0.2s',
          fontSize: 16, fontWeight: 700,
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.5px' }}>AI</span>
        )}
        {/* Badge */}
        {!open && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            width: 18, height: 18, borderRadius: 9,
            background: '#fad12e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#261f00', fontWeight: 700,
          }}>✦</span>
        )}
      </button>

      <AIChatPanel open={open} onClose={() => setOpen(false)} />
    </>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function HomePage() {
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [newsletterEmail, setNewsletterEmail] = useState('')

  useEffect(() => {
    // Load popular products (first 4)
    getProducts({ skip: 0, limit: 4 }).then(res => {
      if (res?.items?.length > 0) setPopularProducts(res.items)
    }).catch(() => {})

    // Load new arrivals (next 4, sorted by newest)
    getProducts({ skip: 4, limit: 4 }).then(res => {
      if (res?.items?.length > 0) setNewArrivals(res.items)
    }).catch(() => {})
  }, [])

  const W = { maxWidth: 1440, margin: '0 auto', padding: '0 40px' }

  return (
    <div style={{ background: '#f5f5f7' }}>

      {/* ── Categories Bar ───────────────────────────────────────────────── */}
      <CategoriesBar />

      {/* ── Hero Slider ──────────────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── Deals Banner ─────────────────────────────────────────────────── */}
      <section style={{ background: '#0070e3', padding: '24px 0' }}>
        <div style={{ ...W, display: 'grid', gridTemplateColumns: '670px 620px', gap: 20, justifyContent: 'center' }}>
          <div style={{
            background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#ffd64d', letterSpacing: '1.5px', marginBottom: 6 }}>LIMITED OFFER</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Up to 40% Off on Laptops</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>MacBook, Surface & more — this weekend only</div>
            </div>
            <Link to="/shop" style={{
              flexShrink: 0, height: 36, padding: '0 18px', background: '#fff', color: '#0071e3',
              borderRadius: 18, fontSize: 13, fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
            }}>Shop Laptops</Link>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#99f299', letterSpacing: '1.5px', marginBottom: 6 }}>NEW ARRIVAL</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>iPhone 15 Pro — Just Landed</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>Titanium design, A17 Pro chip. Pre-order now →</div>
            </div>
            <Link to="/shop" style={{
              flexShrink: 0, height: 36, padding: '0 18px', background: '#fff', color: '#0071e3',
              borderRadius: 18, fontSize: 13, fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
            }}>Shop iPhones</Link>
          </div>
        </div>
      </section>

      {/* ── Popular Products ─────────────────────────────────────────────── */}
      <section style={{ padding: '56px 0 0', background: '#fff' }}>
        <div style={W}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1d1d1f', margin: 0 }}>Popular Products</h2>
            <Link to="/shop" style={{ fontSize: 16, color: '#0071e3', textDecoration: 'none', fontWeight: 500 }}>See All→</Link>
          </div>
          <div style={{ display: 'flex', gap: 24, paddingBottom: 56 }}>
            {popularProducts.map(p => <PopularProductCard key={p.id} product={p} />)}
            {popularProducts.length === 0 && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ width: 322, height: 348, background: '#f5f5f7', borderRadius: 12, border: '1px solid #e0e0e0' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ─────────────────────────────────────────────────── */}
      <section style={{ padding: '56px 0 0', background: '#fafcff' }}>
        <div style={W}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>New Arrivals</h2>
              <p style={{ fontSize: 14, color: '#808794', margin: 0 }}>Discover the latest arrivals — selling fast!</p>
            </div>
            <Link to="/shop" style={{ fontSize: 14, color: '#1754f5', textDecoration: 'none', fontWeight: 500, marginTop: 4 }}>View All →</Link>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 24, paddingBottom: 56 }}>
            {newArrivals.map((p, i) => <NewArrivalCard key={p.id} product={p} styleIdx={i} />)}
            {newArrivals.length === 0 && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ width: 322, height: 358, background: '#f5f5f7', borderRadius: 14, border: '1px solid #e0e0e0' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section style={{ padding: '56px 0', background: '#fff' }}>
        <div style={W}>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1d1d1f', margin: '0 0 8px' }}>What Our Customers Say</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ color: '#fcbf14', fontSize: 15 }}>★★★★★</span>
              <span style={{ fontSize: 14, color: '#6e6e73' }}>4.9/5 average · 2,400+ reviews</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 437px)', gap: 24, justifyContent: 'center' }}>
            {TESTIMONIALS.map(t => (
              <div
                key={t.name}
                style={{
                  background: '#f9fafc', borderRadius: 16, padding: 24, height: 196,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ color: '#fcbf14', fontSize: 14, marginBottom: 10 }}>★★★★★</div>
                  <p style={{ fontSize: 13.5, color: '#3a3a40', lineHeight: 1.65, margin: 0 }}>{t.text}</p>
                </div>
                <div style={{ borderTop: '1px solid #e8e8ec', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 18,
                      background: t.avatarBg, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                    }}>{t.initials}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: '#6e6e73' }}>{t.sub}</div>
                    </div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: '#12ad6b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11 }}>✓</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Strip ───────────────────────────────────────────────── */}
      <section style={{ background: '#f7f7f7', height: 96, display: 'flex', alignItems: 'center' }}>
        <div style={{ ...W, display: 'flex', justifyContent: 'space-around', width: '100%' }}>
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1"/><path d="m16 8 5 2v4h-5V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              ),
              title: 'Free Shipping', sub: 'On orders over $50',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
                </svg>
              ),
              title: 'Easy Returns', sub: '30-day return policy',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              ),
              title: 'Secure Payment', sub: '100% safe & secure',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                </svg>
              ),
              title: '24/7 Support', sub: 'Always here to help',
            },
          ].map((f) => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {f.icon}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{f.title}</div>
                <div style={{ fontSize: 11, color: '#808080', marginTop: 2 }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Brands ───────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', height: 100, display: 'flex', alignItems: 'center' }}>
        <div style={{ ...W, width: '100%' }}>
          <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#b3b3b3', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>
            TRUSTED BRANDS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {['Apple', 'Samsung', 'Sony', 'Microsoft', 'Bose', 'Google'].map(b => (
              <span key={b} style={{ fontSize: 18, fontWeight: 700, color: '#bfbfbf', cursor: 'default', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6e6e73')}
                onMouseLeave={e => (e.currentTarget.style.color = '#bfbfbf')}
              >{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────────────────── */}
      <section style={{ background: '#f7f7fa', height: 160, display: 'flex', alignItems: 'center' }}>
        <div style={{ ...W, width: '100%', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1c1c1f', margin: '0 0 6px' }}>Stay in the Loop</h2>
          <p style={{ fontSize: 13, color: '#808080', marginBottom: 20 }}>Get the latest deals, launches and tech news straight to your inbox.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              style={{
                width: 340, height: 44, padding: '0 16px',
                border: '1px solid #dedede',
                borderRadius: 8, color: '#1d1d1f', fontSize: 13, outline: 'none',
                background: '#fff',
              }}
            />
            <button style={{ width: 140, height: 44, background: '#0070e3', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#005ecb')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0070e3')}
            >Subscribe</button>
          </div>
        </div>
      </section>

      {/* ── AI Chat Floating Button ───────────────────────────────────────── */}
      <AIChatButton />

    </div>
  )
}
