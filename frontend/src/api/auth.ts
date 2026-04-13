import client from './client'
import type { LoginRequest, TokenResponse, User } from '../types'

export const login = async (data: LoginRequest): Promise<TokenResponse> => {
  const res = await client.post<TokenResponse>('/auth/login', data)
  return res.data
}

export const getMe = async (): Promise<User> => {
  const res = await client.get<User>('/auth/me')
  return res.data
}
