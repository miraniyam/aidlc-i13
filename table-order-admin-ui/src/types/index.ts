// Auth Types
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface Admin {
  id: number
  username: string
  role: string
  created_at: string
}

// Order Types
export interface OrderItem {
  id: number
  menu_id: number
  menu_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Order {
  id: number
  table_id: number
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
  items: OrderItem[]
  total_amount: number
  created_at: string
  updated_at: string
}

export interface UpdateOrderStatusRequest {
  status: 'preparing' | 'ready' | 'served' | 'cancelled'
}

// Table Types
export interface Table {
  id: number
  table_number: string
  session_id: string | null
  is_active: boolean
  current_orders?: Order[]
}

export interface CompleteSessionRequest {
  // No fields needed
}

// Menu Types
export interface Menu {
  id: number
  name: string
  description: string
  price: number
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface CreateMenuRequest {
  name: string
  description: string
  price: number
  image?: File
  is_available: boolean
}

export interface UpdateMenuRequest {
  name?: string
  description?: string
  price?: number
  image?: File
  is_available?: boolean
}

// SSE Types
export interface SSEMessage {
  event: 'new_order' | 'order_updated'
  data: Order
}

// Order History Types
export interface OrderHistoryItem {
  id: number
  table_id: number
  status: string
  items: OrderItem[]
  total_amount: number
  created_at: string
  completed_at: string | null
}
