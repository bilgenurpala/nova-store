import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingCart, User, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Categories', path: '/shop' },
  ]

  function handleSignOut() {
    signOut()
    navigate('/login')
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#0f0f13',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{ textDecoration: 'none', fontSize: '24px', fontWeight: 700 }}
      >
        <span style={{ color: '#0071e3' }}>Nova</span>
        <span style={{ color: '#ffffff' }}>Store</span>
      </Link>

      {/* Center nav */}
      <div
        style={{
          display: 'flex',
          gap: '32px',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {navLinks.map((link) => {
          const isActive =
            link.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(link.path)
          return (
            <Link
              key={link.label}
              to={link.path}
              style={{
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#ffffff' : '#6e6e73',
                transition: 'color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Right icons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginLeft: 'auto',
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6e6e73',
            display: 'flex',
            padding: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6e6e73')}
        >
          <Search size={20} />
        </button>

        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6e6e73',
            display: 'flex',
            padding: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6e6e73')}
        >
          <Heart size={20} />
        </button>

        <Link
          to="/cart"
          style={{
            color: '#6e6e73',
            display: 'flex',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6e6e73')}
        >
          <ShoppingCart size={20} />
        </Link>

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6e6e73',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6e6e73')}
          >
            <User size={20} />
            {user && (
              <span style={{ fontSize: '14px', color: '#ffffff' }}>
                {user.email.split('@')[0]}
              </span>
            )}
          </button>

          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                backgroundColor: '#1a1a24',
                border: '1px solid #282838',
                borderRadius: '10px',
                padding: '8px',
                minWidth: '160px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              {user ? (
                <>
                  <div
                    style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: '#6e6e73',
                      borderBottom: '1px solid #282838',
                      marginBottom: '4px',
                    }}
                  >
                    {user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ff3b30',
                      fontSize: '14px',
                      borderRadius: '6px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        'rgba(255,59,48,0.1)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: '6px',
                    }}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: '#0071e3',
                      textDecoration: 'none',
                      borderRadius: '6px',
                    }}
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
