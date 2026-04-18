import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Product } from '../types'

interface FavoritesContextType {
  favorites: Product[]
  isFavorite: (id: number) => boolean
  toggleFavorite: (product: Product) => void
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
})

function loadFromStorage(): Product[] {
  try {
    const raw = localStorage.getItem('nova_favorites')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>(loadFromStorage)

  const isFavorite = useCallback((id: number) => favorites.some(p => p.id === id), [favorites])

  const toggleFavorite = useCallback((product: Product) => {
    setFavorites(prev => {
      const next = prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
      localStorage.setItem('nova_favorites', JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)
