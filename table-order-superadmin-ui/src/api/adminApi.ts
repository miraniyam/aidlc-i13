import type { CreateAdminRequest, Admin } from '@/types/api'
import client from './client'
import { mockAdminApi } from './mock/adminApi.mock'

const useMock = import.meta.env.VITE_USE_MOCK_API === 'true'

export const adminApi = {
  async getAdmins(): Promise<Admin[]> {
    if (useMock) return mockAdminApi.getAdmins()
    const res = await client.get<{ admins: Admin[] }>('/superadmin/admins')
    return res.data.admins
  },

  async createAdmin(data: CreateAdminRequest): Promise<Admin> {
    if (useMock) return mockAdminApi.createAdmin(data)
    const res = await client.post<{ admin: Admin }>('/superadmin/admins', data)
    return res.data.admin
  },

  async activateAdmin(id: string): Promise<Admin> {
    if (useMock) return mockAdminApi.activateAdmin(id)
    const res = await client.patch<{ admin: Admin }>(`/superadmin/admins/${id}/activate`)
    return res.data.admin
  },

  async deactivateAdmin(id: string): Promise<Admin> {
    if (useMock) return mockAdminApi.deactivateAdmin(id)
    const res = await client.patch<{ admin: Admin }>(`/superadmin/admins/${id}/deactivate`)
    return res.data.admin
  },
}
