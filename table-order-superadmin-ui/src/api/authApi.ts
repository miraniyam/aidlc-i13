import type { LoginRequest, LoginResponse } from '@/types/api'
import client from './client'
import { mockAuthApi } from './mock/adminApi.mock'

const useMock = import.meta.env.VITE_USE_MOCK_API === 'true'

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    if (useMock) return mockAuthApi.login(data)
    const res = await client.post<LoginResponse>('/superadmin/login', data)
    return res.data
  },
}
