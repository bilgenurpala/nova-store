import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import { getProducts } from '../../api/products'
import type { Product } from '../../types'

// ── Inline SVG icons (white, 22×22, matching Figma style) ────────────────────
const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="10" cy="10" r="6.5" stroke="#ffffff" strokeWidth="1.7"/>
    <path d="M15 15L19 19" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
)

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path
      d="M11 18.5S3.5 13.5 3.5 8A4 4 0 0 1 11 5.88 4 4 0 0 1 18.5 8C18.5 13.5 11 18.5 11 18.5Z"
      fill={filled ? '#ff3b30' : 'none'}
      stroke={filled ? '#ff3b30' : '#ffffff'}
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
)

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M3 3h2l.4 2M7 13h10l2-7H5.4M7 13l-1.6-8M7 13l-2 4h13M9 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="8" r="3.5" stroke="#ffffff" strokeWidth="1.7"/>
    <path d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7"
      stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
)

// ── Category icons (16×16, #6e6e73) ─────────────────────────────────────────
const CatPhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="4.5" y="1.5" width="7" height="13" rx="1.5" stroke="#6e6e73" strokeWidth="1.4"/>
    <circle cx="8" cy="12.5" r="0.8" fill="#6e6e73"/>
  </svg>
)
const CatLaptopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2.5" y="3.5" width="11" height="7" rx="1" stroke="#6e6e73" strokeWidth="1.3"/>
    <path d="M1 12.5h14" stroke="#6e6e73" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)
const CatTabletIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="1.5" width="10" height="13" rx="1.5" stroke="#6e6e73" strokeWidth="1.3"/>
    <circle cx="8" cy="12.5" r="0.7" fill="#6e6e73"/>
  </svg>
)
const CatWatchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="4.5" y="4" width="7" height="8" rx="2" stroke="#6e6e73" strokeWidth="1.3"/>
    <path d="M6 4V2.5h4V4M6 12v1.5h4V12" stroke="#6e6e73" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M8 7v2l1 1" stroke="#6e6e73" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const CatHeadphonesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 9V8a5 5 0 0 1 10 0v1" stroke="#6e6e73" strokeWidth="1.3" strokeLinecap="round"/>
    <rect x="1.5" y="9" width="2.5" height="4" rx="1.2" stroke="#6e6e73" strokeWidth="1.3"/>
    <rect x="12" y="9" width="2.5" height="4" rx="1.2" stroke="#6e6e73" strokeWidth="1.3"/>
  </svg>
)
const CatTVIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="3.5" width="13" height="8.5" rx="1.2" stroke="#6e6e73" strokeWidth="1.3"/>
    <path d="M6 13.5h4M8 12v1.5" stroke="#6e6e73" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)
const CatAccessoriesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2.5" stroke="#6e6e73" strokeWidth="1.3"/>
    <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"
      stroke="#6e6e73" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)

const CATEGORIES = [
  { label: 'Phones',      icon: <CatPhoneIcon /> },
  { label: 'Computers',   icon: <CatLaptopIcon /> },
  { label: 'Tablets',     icon: <CatTabletIcon /> },
  { label: 'Watches',     icon: <CatWatchIcon /> },
  { label: 'Headphones',  icon: <CatHeadphonesIcon /> },
  { label: 'TV',          icon: <CatTVIcon /> },
  { label: 'Accessories', icon: <CatAccessoriesIcon /> },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { cartCount } = useCart()
  const { favorites } = useFavorites()
  const location = useLocation()
  const navigate = useNavigate()

  const [catOpen,    setCatOpen]    = useState(false)
  const [userOpen,   setUserOpen]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query,      setQuery]      = useState('')
  const [results,    setResults]    = useState<Product[]>([])
  const [searching,  setSearching]  = useState(false)

  const catRef    = useRef<HTMLDivElement>(null)
  const userRef   = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (catRef.current  && !catRef.current.contains(e.target as Node))  setCatOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false); setQuery(''); setResults([])
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Close everything on route change
  useEffect(() => {
    setCatOpen(false); setUserOpen(false)
    setSearchOpen(false); setQuery(''); setResults([])
  }, [location.pathname])

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [searchOpen])

  // Live search with debounce
  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    try {
      const res = await getProducts({ search: q, limit: 6 })
      setResults(res?.items ?? [])
    } catch { setResults([]) }
    finally { setSearching(false) }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => runSearch(query), 300)
    return () => clearTimeout(t)
  }, [query, runSearch])

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const navLinkStyle = (path: string): React.CSSProperties => ({
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: isActive(path) ? 600 : 400,
    color: isActive(path) ? '#ffffff' : '#8e8e93',
  })

  const username  = user?.email?.split('@')[0] ?? ''
  const cartLabel = cartCount > 9 ? '9+' : String(cartCount)
  const faveCount = favorites.length

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .nav-search-input::placeholder { color: rgba(255,255,255,0.38); }
        .cat-item:hover { background: #f5f5f7; }
        .user-menu-item:hover { background: #f5f5f7; }
      `}</style>

      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#0f0f13',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: 68,
      }}>
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center',
          padding: '0 48px',
          position: 'relative',
        }}>

          {/* ── Logo (left) ────────────────────────────────────────── */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 22, color: '#0071e3' }}>Nova</span>
            <span style={{ fontWeight: 700, fontSize: 22, color: '#ffffff' }}>Store</span>
          </Link>

          {/* ── Center nav — always visible ──────────────────────── */}
          <nav style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 36, alignItems: 'center',
          }}>
            <Link to="/"     style={navLinkStyle('/')}>Home</Link>
            <Link to="/shop" style={navLinkStyle('/shop')}>Shop</Link>

            {/* Categories */}
            <div ref={catRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setCatOpen(v => !v)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: catOpen ? 600 : 400,
                  color: catOpen ? '#ffffff' : '#8e8e93',
                  padding: '4px 0',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                Categories
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ transition: 'transform 0.2s', transform: catOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M2 4l4 4 4-4" stroke={catOpen ? '#fff' : '#8e8e93'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {catOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 12px)',
                  left: '50%', transform: 'translateX(-50%)',
                  background: '#ffffff', borderRadius: 12,
                  width: 240,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
                  overflow: 'hidden', zIndex: 200,
                }}>
                  {CATEGORIES.map((cat, i) => (
                    <div
                      key={cat.label}
                      className="cat-item"
                      onClick={() => { navigate(`/shop?category=${encodeURIComponent(cat.label)}`); setCatOpen(false) }}
                      style={{
                        display: 'flex', alignItems: 'center',
                        height: 46, padding: '0 16px', cursor: 'pointer',
                        borderBottom: i < CATEGORIES.length - 1 ? '1px solid #f0f0f0' : 'none',
                        color: '#1a1a1f', fontSize: 14, gap: 12,
                        transition: 'background 0.12s',
                      }}
                    >
                      <span style={{ display: 'flex', flexShrink: 0 }}>{cat.icon}</span>
                      <span style={{ fontWeight: 400 }}>{cat.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* ── Right icons ───────────────────────────────────────── */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            {user ? (
              <>
                {/* Admin badge — admin only */}
                {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    style={{
                      background: 'rgba(255,149,0,0.14)',
                      border: '1px solid rgba(255,149,0,0.3)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 11px', borderRadius: 7, marginRight: 6,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,149,0,0.25)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,149,0,0.14)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff9500" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span style={{ color: '#ff9500', fontSize: 12, fontWeight: 600 }}>Admin</span>
                  </button>
                )}

                {/* Search input — inline, just left of the icon */}
                {searchOpen && (
                  <div ref={searchRef} style={{ position: 'relative' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      background: 'rgba(255,255,255,0.10)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      borderRadius: 8, padding: '0 10px',
                      height: 36, width: 200,
                    }}>
                      <input
                        ref={inputRef}
                        className="nav-search-input"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); setResults([]) }
                          if (e.key === 'Enter') {
                            if (results.length > 0) navigate(`/product/${results[0].id}`)
                            else if (query.trim()) navigate(`/shop?search=${encodeURIComponent(query)}`)
                            setSearchOpen(false); setQuery(''); setResults([])
                          }
                        }}
                        placeholder="Search phones, laptops..."
                        style={{
                          flex: 1, background: 'none', border: 'none', outline: 'none',
                          color: '#ffffff', fontSize: 13,
                        }}
                      />
                      {searching && (
                        <div style={{
                          width: 12, height: 12, flexShrink: 0,
                          border: '2px solid rgba(255,255,255,0.25)',
                          borderTopColor: '#fff', borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                        }} />
                      )}
                    </div>

                    {/* Results dropdown */}
                    {results.length > 0 && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                        background: '#fff', borderRadius: 10,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.16)',
                        overflow: 'hidden', zIndex: 400,
                      }}>
                        {results.map(p => {
                          const img = p.images?.find(i => i.is_primary) ?? p.images?.[0]
                          return (
                            <div
                              key={p.id}
                              className="cat-item"
                              onClick={() => { navigate(`/product/${p.id}`); setSearchOpen(false); setQuery(''); setResults([]) }}
                              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                            >
                              <div style={{ width: 34, height: 34, background: '#f5f5f7', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {img && <img src={img.url} alt="" style={{ maxWidth: 30, maxHeight: 30, objectFit: 'contain' }} />}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                <div style={{ fontSize: 12, color: '#8e8e93' }}>${Number(p.price).toLocaleString()}</div>
                              </div>
                            </div>
                          )
                        })}
                        <div
                          className="cat-item"
                          onClick={() => { navigate(`/shop?search=${encodeURIComponent(query)}`); setSearchOpen(false); setQuery(''); setResults([]) }}
                          style={{ padding: '9px 12px', fontSize: 12, color: '#0071e3', cursor: 'pointer', textAlign: 'center', fontWeight: 500 }}
                        >
                          See all results for "{query}" →
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Search icon button */}
                <button
                  onClick={() => { setSearchOpen(v => !v); if (searchOpen) { setQuery(''); setResults([]) } }}
                  style={{
                    background: searchOpen ? 'rgba(255,255,255,0.08)' : 'none',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 38, height: 38, borderRadius: 8,
                    transition: 'background 0.15s', flexShrink: 0,
                  }}
                >
                  <SearchIcon />
                </button>

                {/* Favorites */}
                <button
                  onClick={() => navigate('/favorites')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 38, height: 38, borderRadius: 8, position: 'relative',
                  }}
                >
                  <HeartIcon filled={faveCount > 0} />
                  {faveCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 3, right: 3,
                      background: '#ff3b30', color: '#fff', borderRadius: '50%',
                      width: 15, height: 15, fontSize: 9, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid #0f0f13',
                    }}>
                      {faveCount > 9 ? '9+' : faveCount}
                    </span>
                  )}
                </button>

                {/* Cart */}
                <button
                  onClick={() => navigate('/cart')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 38, height: 38, borderRadius: 8, position: 'relative',
                  }}
                >
                  <CartIcon />
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 3, right: 3,
                      background: '#0071e3', color: '#fff', borderRadius: '50%',
                      minWidth: 15, height: 15, fontSize: 9, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid #0f0f13', padding: '0 2px',
                    }}>
                      {cartLabel}
                    </span>
                  )}
                </button>

                {/* User */}
                <div ref={userRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserOpen(v => !v)}
                    style={{
                      background: userOpen ? 'rgba(255,255,255,0.08)' : 'none',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '0 8px 0 4px', height: 38, borderRadius: 8,
                    }}
                  >
                    <UserIcon />
                    <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 500 }}>{username}</span>
                  </button>

                  {userOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      background: '#ffffff', borderRadius: 10, width: 200,
                      zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                      overflow: 'hidden',
                    }}>
                      <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0', fontSize: 12, color: '#8e8e93' }}>
                        {user.email}
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserOpen(false)}
                        className="user-menu-item"
                        style={{ display: 'block', padding: '11px 16px', fontSize: 14, color: '#1d1d1f', textDecoration: 'none' }}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => { signOut(); setUserOpen(false) }}
                        className="user-menu-item"
                        style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, color: '#ff3b30', borderTop: '1px solid #f0f0f0' }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/login"
                  style={{ textDecoration: 'none', color: '#fff', fontSize: 14, padding: '7px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)' }}>
                  Sign In
                </Link>
                <Link to="/register"
                  style={{ textDecoration: 'none', color: '#fff', fontSize: 14, padding: '7px 18px', borderRadius: 8, background: '#0071e3' }}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>
    </>
  )
}
