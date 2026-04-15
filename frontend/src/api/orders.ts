import client from './client'
import type { Order } from '../types'

export interface OrdersResponse {
  items: Order[]
  total: number
  skip: number
  limit: number
}

export const getAdminOrders = async (params?: {
  skip?: number
  limit?: number
  status?: string
}): Promise<OrdersResponse> => {
  const res = await client.get<OrdersResponse>('/orders/admin/all', { params })
  return res.data
}

export const getOrder = async (id: number): Promise<Order> => {
  const res = await client.get<Order>(`/orders/${id}`)
  return res.data
}

export const updateOrderStatus = async (
  id: number,
  status: string
): Promise<Order> => {
  const res = await client.put<Order>(`/orders/${id}/status`, { status })
  return res.data
}
