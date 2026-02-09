// Mock API Types - Will be replaced with OpenAPI-generated types later

export interface Menu {
  menuId: string;
  menuName: string;
  price: number;
  description: string;
  imageUrl?: string;
  categoryId: string;
  categoryName?: string;
}

export interface MenuCategory {
  categoryId: string;
  categoryName: string;
  displayOrder: number;
}

export interface CartItem {
  menuId: string;
  menuName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served';

export interface Order {
  orderId: string;
  orderNumber: string;
  sessionId: string;
  tableId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  orderItemId: string;
  menuId: string;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface LoginRequest {
  tableId: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tableId: string;
  sessionId: string;
}

export interface CreateOrderRequest {
  sessionId: string;
  tableId: string;
  items: {
    menuId: string;
    quantity: number;
  }[];
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
