import client from './client'
import type { Category, CategoryCreate, CategoryUpdate } from '../types'

export const getCategories = async (): Promise<Category[]> => {
  const res = await client.get<Category[]>('/categories')
  return res.data
}

export const createCategory = async (data: CategoryCreate): Promise<Category> => {
  const res = await client.post<Category>('/categories', data)
  return res.data
}

export const updateCategory = async (id: number, data: CategoryUpdate): Promise<Category> => {
  const res = await client.put<Category>(`/categories/${id}`, data)
  return res.data
}

export const deleteCategory = async (id: number): Promise<void> => {
  await client.delete(`/categories/${id}`)
}
