import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import ProtectedRoute from './components/ProtectedRoute'

// Layouts
import AdminLayout from './components/layout/AdminLayout'
import CustomerLayout from './components/layout/CustomerLayout'

// Admin pages
import Login from './pages/auth/Login'
import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import Orders from './pages/admin/Orders'
import Users from './pages/admin/Users'

// Standalone auth (full-screen two-panel, no navbar)
import CustomerLogin from './pages/auth/CustomerLogin'
import Register from './pages/auth/Register'

// Customer store pages
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import FavoritesPage from './pages/FavoritesPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <Routes>
              {/* ── Admin Panel ─────────────────────────────────────────────── */}
              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Orders />} />
                <Route path="users" element={<Users />} />
              </Route>

              {/* ── Standalone auth (no Navbar/Footer) ──────────── */}
              <Route path="/login"    element={<CustomerLogin />} />
              <Route path="/register" element={<Register />} />

              {/* ── Customer Store (with Navbar + Footer) ───────── */}
              <Route element={<CustomerLayout />}>
                <Route path="/"            element={<HomePage />} />
                <Route path="/shop"        element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart"        element={<CartPage />} />
                <Route path="/favorites"   element={<FavoritesPage />} />
                <Route path="/profile"     element={<ProfilePage />} />
              </Route>

              {/* ── 404 ─────────────────────────────────────────── */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
