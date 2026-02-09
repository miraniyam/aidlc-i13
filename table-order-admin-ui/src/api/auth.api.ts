import client from './client'
import type { LoginRequest, LoginResponse } from '../types'

export const AuthAPI = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const formData = new URLSearchParams()
    formData.append('username', data.username)
    formData.append('password', data.password)

    const response = await client.post<LoginResponse>('/api/admin/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },
}
