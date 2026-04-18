import { useNavigate } from 'react-router-dom'

// ── Inline SVG icons (24×24, #1d1d1f) ────────────────────────────────────────
const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="2" width="12" height="20" rx="2.5" stroke="#1d1d1f" strokeWidth="1.6"/>
    <circle cx="12" cy="18.5" r="1.1" fill="#1d1d1f"/>
    <line x1="9.5" y1="5.5" x2="14.5" y2="5.5" stroke="#1d1d1f" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const LaptopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="11" rx="1.5" stroke="#1d1d1f" strokeWidth="1.6"/>
    <path d="M1 18h22" stroke="#1d1d1f" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M9 18l1-2h4l1 2" stroke="#1d1d1f" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TabletIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="4.5" y="2" width="15" height="20" rx="2.5" stroke="#1d1d1f" strokeWidth="1.6"/>
    <circle cx="12" cy="19" r="1" fill="#1d1d1f"/>
    <line x1="10" y1="4.5" x2="14" y2="4.5" stroke="#1d1d1f" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const WatchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="7" y="7" width="10" height="10" rx="5" stroke="#1d1d1f" strokeWidth="1.6"/>
    <path d="M9 7V4.5h6V7M9 17v2.5h6V17" stroke="#1d1d1f" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M12 10v2.5l1.5 1" stroke="#1d1d1f" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const HeadphonesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M4.5 13V12a7.5 7.5 0 0 1 15 0v1" stroke="#1d1d1f" strokeWidth="1.6" strokeLinecap="round"/>
    <rect x="2.5" y="13" width="4" height="6" rx="2" stroke="#1d1d1f" strokeWidth="1.5"/>
    <rect x="17.5" y="13" width="4" height="6" rx="2" stroke="#1d1d1f" strokeWidth="1.5"/>
  </svg>
)

const TVIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="5" width="20" height="13" rx="1.8" stroke="#1d1d1f" strokeWidth="1.6"/>
    <path d="M9 20h6M12 18v2" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const AccessoriesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3.5" stroke="#1d1d1f" strokeWidth="1.5"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.1 5.1l2.1 2.1M16.8 16.8l2.1 2.1M5.1 18.9l2.1-2.1M16.8 7.2l2.1-2.1"
      stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const CATS = [
  { label: 'Phones',      icon: <PhoneIcon /> },
  { label: 'Computers',   icon: <LaptopIcon /> },
  { label: 'Tablets',     icon: <TabletIcon /> },
  { label: 'Watches',     icon: <WatchIcon /> },
  { label: 'Headphones',  icon: <HeadphonesIcon /> },
  { label: 'TV',          icon: <TVIcon /> },
  { label: 'Accessories', icon: <AccessoriesIcon /> },
]

export default function CategoriesBar() {
  const navigate = useNavigate()
  return (
    <div style={{ background: '#ffffff', borderBottom: '1px solid #d2d2d7', height: 56 }}>
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 0,
      }}>
        {CATS.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.label)}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0 22px', height: '100%',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 400, color: '#1d1d1f',
              whiteSpace: 'nowrap',
              borderRight: i < CATS.length - 1 ? '1px solid #ebebeb' : 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#0071e3'
              const svg = e.currentTarget.querySelector('svg')
              if (svg) svg.style.opacity = '0.7'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#1d1d1f'
              const svg = e.currentTarget.querySelector('svg')
              if (svg) svg.style.opacity = '1'
            }}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
