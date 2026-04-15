import { Link } from 'react-router-dom'

const SHOP_LINKS = ['All Products', 'New Arrivals', 'Best Sellers', 'Deals']
const SUPPORT_LINKS = ['Help Center', 'Track Order', 'Returns', 'Contact Us']
const COMPANY_LINKS = ['About NovaStore', 'Careers', 'Blog', 'Press']

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0f0f13', color: '#ffffff' }}>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '48px 40px 0',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '40px',
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            NovaStore
          </div>
          <div style={{ fontSize: '14px', color: '#6e6e73', lineHeight: 1.6 }}>
            The future of shopping, today.
          </div>
        </div>

        {/* Shop */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '18px',
            }}
          >
            Shop
          </div>
          {SHOP_LINKS.map((item) => (
            <Link
              key={item}
              to="/shop"
              style={{
                display: 'block',
                fontSize: '14px',
                color: '#6e6e73',
                textDecoration: 'none',
                marginBottom: '12px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6e6e73')}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Support */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '18px',
            }}
          >
            Support
          </div>
          {SUPPORT_LINKS.map((item) => (
            <div
              key={item}
              style={{
                fontSize: '14px',
                color: '#6e6e73',
                marginBottom: '12px',
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Company */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '18px',
            }}
          >
            Company
          </div>
          {COMPANY_LINKS.map((item) => (
            <div
              key={item}
              style={{
                fontSize: '14px',
                color: '#6e6e73',
                marginBottom: '12px',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          textAlign: 'center',
          padding: '16px',
          marginTop: '40px',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        © 2026 NovaStore. All rights reserved. · Privacy Policy · Terms of
        Service
      </div>
    </footer>
  )
}
