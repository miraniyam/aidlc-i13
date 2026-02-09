import apiClient from './client';
import { Order, CreateOrderRequest, CreateOrderResponse } from '@/types/api';

export const orderApi = {
  getOrders: async (sessionId: string): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/api/orders', {
      params: { session_id: sessionId },
    });
    return response.data;
  },

  createOrder: async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await apiClient.post<CreateOrderResponse>('/api/orders', request);
    return response.data;
  },
};
