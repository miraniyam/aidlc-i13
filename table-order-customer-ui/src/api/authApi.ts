import apiClient from './client';
import { LoginRequest, LoginResponse } from '@/types/api';

export const authApi = {
  login: async (tableNumber: string, password: string, storeId: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/customer/auth/login', {
      table_number: tableNumber,
      password,
      store_id: storeId,
    } as LoginRequest);
    return response.data;
  },
};
