import apiClient from './client';
import { LoginRequest, LoginResponse } from '@/types/api';

export const authApi = {
  login: async (tableId: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/customer/login', {
      tableId,
      password,
    } as LoginRequest);
    return response.data;
  },
};
