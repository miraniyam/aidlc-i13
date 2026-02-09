// Admin Types
export interface Admin {
  id: string
  store_id: string
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
  access_token: string
  token_type: string
  user: {
    id: string
    username: string
    role: string
  }
}

// Admin Management Types
export interface CreateAdminRequest {
  store_id: string
  username: string
  password: string
}

export interface CreateAdminResponse {
  admin: Admin
}

export interface AdminListResponse {
  admins: Admin[]
}

export interface UpdateAdminStatusResponse {
  admin: Admin
}
