import client from './client'
import type { Product, ProductCreate, ProductUpdate } from '../types'

export interface ProductsResponse {
  items: Product[]
  total: number
  skip: number
  limit: number
}

export const getProducts = async (params?: {
  skip?: number
  limit?: number
  category_id?: number
  search?: string
}): Promise<ProductsResponse> => {
  const res = await client.get<ProductsResponse>('/products', { params })
  return res.data
}

export const getProduct = async (id: number): Promise<Product> => {
  const res = await client.get<Product>(`/products/${id}`)
  return res.data
}

export const createProduct = async (data: ProductCreate): Promise<Product> => {
  const res = await client.post<Product>('/products', data)
  return res.data
}

export const updateProduct = async (id: number, data: ProductUpdate): Promise<Product> => {
  const res = await client.put<Product>(`/products/${id}`, data)
  return res.data
}

export const deleteProduct = async (id: number): Promise<void> => {
  await client.delete(`/products/${id}`)
}
