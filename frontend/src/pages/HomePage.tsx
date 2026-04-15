import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Smartphone,
  Monitor,
  Tablet,
  Watch,
  Headphones,
  Tv,
  Package,
  Truck,
  RefreshCw,
  ShieldCheck,
  HeadphonesIcon,
} from 'lucide-react'
import { getProducts } from '../api/products'
import { getCategories } from '../api/categories'
import type { Product, Category } from '../types'
import heroImg from '../assets/hero.png'

// ─── Product Card ───────────────────────────────────────────────────────────

type BadgeType = 'NEW' | 'SALE' | 'HOT' | 'BEST SELLER' | null

const BADGE_COLORS: Record<string, string> = {
  NEW: '#0071e3',
  SALE: '#ff3b30',
  HOT: '#ff9500',
  'BEST SELLER': '#34c759',
}

function getBadge(product: Product): BadgeType {
  if (product.stock === 0) return null
  if (product.stock <= 5) return 'HOT'
  const age =
    (Date.now() - new Date(product.created_at).getTime()) /
    (1000 * 60 * 60 * 24)
  if (age < 14) return 'NEW'
  if (product.price < 100) return 'SALE'
  return null
}

function ProductCard({ product }: { product: Product }) {
  const badge = getBadge(product)
  const primaryImage = product.images?.find((i) => i.is_primary) ?? product.images?.[0]

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.boxShadow = 'none'
        el.style.transform = 'none'
      }}
    >
      {/* Image area */}
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
            style={{ maxHeight: '160px', maxWidth: '80%', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ color: '#6e6e73', fontSize: '14px' }}>image</span>
        )}

        {badge && (
          <div
            style={{
              position: 'absolute',
              top: '11px',
              left: '11px',
              backgroundColor: BADGE_COLORS[badge],
              color: '#ffffff',
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

      {/* Info area */}
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
          {product.category?.name?.toUpperCase() ?? 'PRODUCT'}
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
        <div
          style={{
            fontSize: '13px',
            color: '#fbbf24',
            marginBottom: '4px',
          }}
        >
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

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  linkTo,
}: {
  title: string
  subtitle?: string
  linkTo?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}
    >
      <div>
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#1d1d1f',
            margin: 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '14px', color: '#6e6e73', marginTop: '4px' }}>
            {subtitle}
          </p>
        )}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          style={{
            fontSize: '14px',
            color: '#0071e3',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          View all →
        </Link>
      )}
    </div>
  )
}

// ─── Category Icons ───────────────────────────────────────────────────────────

const CATEGORY_ICONS = [
  { label: 'Phones', icon: <Smartphone size={22} /> },
  { label: 'Computers', icon: <Monitor size={22} /> },
  { label: 'Tablets', icon: <Tablet size={22} /> },
  { label: 'Watches', icon: <Watch size={22} /> },
  { label: 'Audio', icon: <Headphones size={22} /> },
  { label: 'TVs', icon: <Tv size={22} /> },
  { label: 'Accessories', icon: <Package size={22} /> },
]

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HomePage() {
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [popRes, newRes, cats] = await Promise.all([
        getProducts({ skip: 0, limit: 4 }),
        getProducts({ skip: 4, limit: 4 }),
        getCategories(),
      ])
      setPopularProducts(popRes.items)
      setNewArrivals(newRes.items)
      setCategories(cats)
    } catch {
      // silently fail — show placeholders
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div style={{ backgroundColor: '#f5f5f7' }}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          height: '600px',
          position: 'relative',
          backgroundImage: `url(${heroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Dark overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(15,15,19,0.85) 0%, rgba(15,15,19,0.4) 60%, transparent 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '0 80px',
            maxWidth: '640px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#0071e3',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            New Arrivals 2026
          </p>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.05,
              margin: '0 0 20px',
            }}
          >
            Next-Gen Tech,
            <br />
            At Your Fingertips.
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '36px',
              lineHeight: 1.5,
            }}
          >
            Discover the latest smartphones, laptops, and accessories — curated for the modern lifestyle.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link
              to="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '48px',
                padding: '0 28px',
                backgroundColor: '#0071e3',
                color: '#ffffff',
                borderRadius: '24px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#0077ed')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#0071e3')
              }
            >
              Shop Now
            </Link>
            <Link
              to="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '48px',
                padding: '0 28px',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1.5px solid rgba(255,255,255,0.5)',
                borderRadius: '24px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 500,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = '#ffffff')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)')
              }
            >
              Explore →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories Bar ───────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #d2d2d7',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0',
            overflowX: 'auto',
          }}
        >
          {CATEGORY_ICONS.map((cat) => (
            <Link
              key={cat.label}
              to="/shop"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '14px 28px',
                textDecoration: 'none',
                color: '#6e6e73',
                fontSize: '12px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                borderBottom: '2px solid transparent',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0071e3'
                e.currentTarget.style.borderBottomColor = '#0071e3'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6e6e73'
                e.currentTarget.style.borderBottomColor = 'transparent'
              }}
            >
              {cat.icon}
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Deals Banner ─────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: '#0071e3',
          padding: '32px 40px',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
          }}
        >
          {[
            {
              label: '🔥 Limited Time',
              title: '40% Off Laptops',
              sub: 'MacBook, Dell XPS & more',
              btn: 'Shop Laptops',
            },
            {
              label: '✨ Just Arrived',
              title: 'iPhone 15 Pro Just Landed',
              sub: 'Starting at $999',
              btn: 'Shop iPhones',
            },
          ].map((deal) => (
            <div
              key={deal.title}
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: 500,
                    marginBottom: '6px',
                  }}
                >
                  {deal.label}
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '4px',
                  }}
                >
                  {deal.title}
                </div>
                <div
                  style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}
                >
                  {deal.sub}
                </div>
              </div>
              <Link
                to="/shop"
                style={{
                  flexShrink: 0,
                  height: '36px',
                  padding: '0 20px',
                  backgroundColor: '#ffffff',
                  color: '#0071e3',
                  border: 'none',
                  borderRadius: '18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {deal.btn}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular Products ─────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '60px 40px 0',
        }}
      >
        <SectionHeader
          title="Popular Products"
          subtitle="Our best-selling items this season"
          linkTo="/shop"
        />
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: '353px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}
          >
            {popularProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── New Arrivals ─────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '60px 40px 0',
        }}
      >
        <SectionHeader
          title="New Arrivals"
          subtitle="Fresh tech, just dropped"
          linkTo="/shop"
        />
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: '353px',
                  backgroundColor: '#1a1a24',
                  borderRadius: '12px',
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}
          >
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── Features Strip ───────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: '1400px',
          margin: '60px auto 0',
          padding: '0 40px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #d2d2d7',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
          }}
        >
          {[
            {
              icon: <Truck size={28} color="#0071e3" />,
              title: 'Free Shipping',
              sub: 'On orders over $50',
            },
            {
              icon: <RefreshCw size={28} color="#0071e3" />,
              title: 'Easy Returns',
              sub: '30-day return policy',
            },
            {
              icon: <ShieldCheck size={28} color="#0071e3" />,
              title: 'Secure Payment',
              sub: '256-bit SSL encryption',
            },
            {
              icon: <HeadphonesIcon size={28} color="#0071e3" />,
              title: '24/7 Support',
              sub: 'Always here to help',
            },
          ].map((feature, i, arr) => (
            <div
              key={feature.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '28px 32px',
                borderRight:
                  i < arr.length - 1 ? '1px solid #d2d2d7' : 'none',
              }}
            >
              <div style={{ flexShrink: 0 }}>{feature.icon}</div>
              <div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1d1d1f',
                    marginBottom: '2px',
                  }}
                >
                  {feature.title}
                </div>
                <div style={{ fontSize: '13px', color: '#6e6e73' }}>
                  {feature.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Brands ───────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: '1400px',
          margin: '60px auto 0',
          padding: '0 40px',
        }}
      >
        <h3
          style={{
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: 600,
            color: '#6e6e73',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}
        >
          Trusted Brands
        </h3>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '48px',
            flexWrap: 'wrap',
          }}
        >
          {['Apple', 'Samsung', 'Sony', 'Microsoft', 'Bose', 'Google'].map(
            (brand) => (
              <span
                key={brand}
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#d2d2d7',
                  letterSpacing: '-0.5px',
                  transition: 'color 0.15s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = '#6e6e73')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = '#d2d2d7')
                }
              >
                {brand}
              </span>
            )
          )}
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: '1400px',
          margin: '60px auto 0',
          padding: '0 40px 80px',
        }}
      >
        <div
          style={{
            backgroundColor: '#0f0f13',
            borderRadius: '20px',
            padding: '60px 40px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '12px',
            }}
          >
            Stay in the loop
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6e6e73',
              marginBottom: '32px',
            }}
          >
            Get exclusive deals, new arrivals, and tech news delivered to your
            inbox.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              maxWidth: '480px',
              margin: '0 auto',
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                height: '48px',
                padding: '0 16px',
                backgroundColor: '#1a1a24',
                border: '1px solid #282838',
                borderRadius: '24px',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none',
              }}
            />
            <button
              style={{
                height: '48px',
                padding: '0 28px',
                backgroundColor: '#0071e3',
                color: '#ffffff',
                border: 'none',
                borderRadius: '24px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#0077ed')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#0071e3')
              }
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
