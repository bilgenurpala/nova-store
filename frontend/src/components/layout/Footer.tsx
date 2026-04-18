import { Link } from 'react-router-dom'

const SHOP_LINKS = ['Phones', 'Laptops', 'Tablets', 'Wearables']
const SUPPORT_LINKS = ['Help Center', 'Track Order', 'Returns', 'Contact Us']
const COMPANY_LINKS = ['About Us', 'Blog', 'Careers', 'Press']
const SOCIAL_LINKS = ['Twitter', 'Instagram', 'YouTube', 'LinkedIn']

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#141417', color: '#ffffff' }}>
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: '40px 70px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '40px',
      }}>
        {/* Brand */}
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            NovaStore
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c', lineHeight: 1.6 }}>
            Next-Gen Tech, At Your Fingertips.
          </div>
        </div>

        {/* Shop */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
            Shop
          </div>
          {SHOP_LINKS.map((item) => (
            <Link
              key={item}
              to="/shop"
              style={{
                display: 'block',
                fontSize: 12,
                color: '#8c8c8c',
                textDecoration: 'none',
                marginBottom: 10,
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8c8c8c')}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Support */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
            Support
          </div>
          {SUPPORT_LINKS.map((item) => (
            <div
              key={item}
              style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 10, cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.color = '#fff')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.color = '#8c8c8c')}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Company */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
            Company
          </div>
          {COMPANY_LINKS.map((item) => (
            <div
              key={item}
              style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 10, cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.color = '#fff')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.color = '#8c8c8c')}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: '16px 70px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 11, color: '#595959' }}>
          © 2026 NovaStore. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          {SOCIAL_LINKS.map((s) => (
            <span
              key={s}
              style={{ fontSize: 11, fontWeight: 600, color: '#737373', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLSpanElement).style.color = '#fff')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLSpanElement).style.color = '#737373')}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
