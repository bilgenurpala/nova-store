import client from './client'
import type { Cart } from '../types'

export const getCart = async (): Promise<Cart> => {
  const res = await client.get<Cart>('/cart')
  return res.data
}

export const addToCart = async (product_id: number, quantity = 1): Promise<Cart> => {
  const res = await client.post<Cart>('/cart/add', { product_id, quantity })
  return res.data
}

export const updateCartItem = async (product_id: number, quantity: number): Promise<Cart> => {
  const res = await client.put<Cart>('/cart/update', { product_id, quantity })
  return res.data
}

export const removeFromCart = async (product_id: number): Promise<Cart> => {
  const res = await client.delete<Cart>('/cart/remove', { data: { product_id } })
  return res.data
}
