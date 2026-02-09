// API Types - Aligned with Backend API

export interface Menu {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image_path: string | null;
  category_id: number;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: number;
  name: string;
  display_order: number;
  store_id: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  menuId: number;
  menuName: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface Order {
  id: number;
  table_session_id: number;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_id: number;
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface LoginRequest {
  table_number: string;
  password: string;
  store_id: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  table_id: number;
  session_id: number;
  store_id: string;
}

export interface CreateOrderRequest {
  items: {
    menu_id: number;
    quantity: number;
  }[];
}

export interface CreateOrderResponse {
  order_id: number;
  total_price: number;
  status: OrderStatus;
  created_at: string;
}

export interface ApiError {
  detail: string;
}
