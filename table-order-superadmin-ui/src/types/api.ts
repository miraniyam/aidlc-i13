// Admin Types
export interface Admin {
  id: number
  store_id: string | null
  username: string
  is_active: boolean
  role: 'store_admin' | 'super_admin'
  created_at: string
}

// Auth Types
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  admin_id: number
  role: string
}

// Admin Management Types
export interface CreateAdminRequest {
  username: string
  password: string
  role: string
  store_id?: string
}
