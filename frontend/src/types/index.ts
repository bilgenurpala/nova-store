// Auth
export interface User {
  id: number
  email: string
  role: 'customer' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

// Category
export interface Category {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface CategoryCreate {
  name: string
  slug: string
}

export interface CategoryUpdate {
  name?: string
  slug?: string
}

// Product Image
export interface ProductImage {
  id: number
  url: string
  alt_text: string
  is_primary: boolean
}

// Product
export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  category_id: number
  category: Category
  images: ProductImage[]
  created_at: string
  updated_at: string
}

export interface ProductCreate {
  name: string
  description?: string
  price: number
  stock: number
  category_id: number
}

export interface ProductUpdate {
  name?: string
  description?: string
  price?: number
  stock?: number
  category_id?: number
}

// Cart
export interface CartItem {
  id: number
  product_id: number
  quantity: number
  product: Product
}

export interface Cart {
  id: number
  user_id: number
  items: CartItem[]
  created_at: string
  updated_at: string
}

// Order
export interface Address {
  id: number
  full_name: string
  line1: string
  line2?: string
  city: string
  country: string
  postal_code: string
}

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: number
  status: 'pending' | 'paid' | 'shipped' | 'cancelled'
  total_price: number
  items: OrderItem[]
  address: Address | null
  created_at: string
}

// Pagination
export interface PaginationParams {
  skip?: number
  limit?: number
}
