import apiClient from './client';
import { Order, CreateOrderRequest, CreateOrderResponse } from '@/types/api';

export const orderApi = {
  // JWT에서 session_id를 자동으로 추출하므로 파라미터 불필요
  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/api/customer/orders');
    return response.data;
  },

  createOrder: async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await apiClient.post<CreateOrderResponse>('/api/customer/orders', request);
    return response.data;
  },
};
