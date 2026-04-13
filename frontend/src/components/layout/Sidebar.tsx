import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Products', path: '/admin/products', icon: '📦' },
  { label: 'Categories', path: '/admin/categories', icon: '🗂️' },
  { label: 'Orders', path: '/admin/orders', icon: '🛒' },
]

export default function Sidebar() {
  const { signOut, user } = useAuth()

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-xl font-bold tracking-tight">Nova Store</span>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate mb-2">{user?.email}</p>
        <button
          onClick={signOut}
          className="w-full text-sm text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors text-left"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
