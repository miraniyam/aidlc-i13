import type { CreateAdminRequest, Admin } from '@/types/api'
import client from './client'
import { mockAdminApi } from './mock/adminApi.mock'

const useMock = import.meta.env.VITE_USE_MOCK_API === 'true'

export const adminApi = {
  async getAdmins(): Promise<Admin[]> {
    if (useMock) return mockAdminApi.getAdmins()
    const res = await client.get<Admin[]>('/superadmin/admins')
    return res.data
  },

  async createAdmin(data: CreateAdminRequest): Promise<Admin> {
    if (useMock) return mockAdminApi.createAdmin(data)
    const res = await client.post<Admin>('/superadmin/admins', data)
    return res.data
  },

  async activateAdmin(id: number): Promise<Admin> {
    if (useMock) return mockAdminApi.activateAdmin(id)
    const res = await client.patch<Admin>(`/superadmin/admins/${id}/activate`)
    return res.data
  },

  async deactivateAdmin(id: number): Promise<Admin> {
    if (useMock) return mockAdminApi.deactivateAdmin(id)
    const res = await client.patch<Admin>(`/superadmin/admins/${id}/deactivate`)
    return res.data
  },
}
