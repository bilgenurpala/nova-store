import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { getCart, addToCart as apiAdd } from '../api/cart'
import { useAuth } from './AuthContext'

interface CartContextType {
  cartCount: number
  refreshCart: () => Promise<void>
  addToCart: (productId: number, quantity?: number) => Promise<boolean>
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  refreshCart: async () => {},
  addToCart: async () => false,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  const refreshCart = useCallback(async () => {
    if (!user) { setCartCount(0); return }
    try {
      const cart = await getCart()
      const total = cart.items.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(total)
    } catch {
      setCartCount(0)
    }
  }, [user])

  useEffect(() => { refreshCart() }, [refreshCart])

  const addToCart = useCallback(async (productId: number, quantity = 1): Promise<boolean> => {
    if (!user) return false
    try {
      await apiAdd(productId, quantity)
      await refreshCart()
      return true
    } catch {
      return false
    }
  }, [user, refreshCart])

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, addToCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
