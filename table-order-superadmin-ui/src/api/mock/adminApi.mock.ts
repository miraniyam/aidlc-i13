import type { LoginRequest, LoginResponse, CreateAdminRequest, Admin } from '@/types/api'
import { mockAdmins, mockSuperAdmin } from './mockData'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
let admins = [...mockAdmins]
let nextId = 3

export const mockAuthApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    await delay(300)
    if (data.username === mockSuperAdmin.username && data.password === mockSuperAdmin.password) {
      return { token: 'mock-jwt-token', admin_id: mockSuperAdmin.id, role: mockSuperAdmin.role }
    }
    throw new Error('Invalid credentials')
  },
}

export const mockAdminApi = {
  async getAdmins(): Promise<Admin[]> {
    await delay(200)
    return [...admins]
  },

  async createAdmin(data: CreateAdminRequest): Promise<Admin> {
    await delay(300)
    const newAdmin: Admin = {
      id: nextId++,
      store_id: data.store_id ?? null,
      username: data.username,
      is_active: true,
      role: 'store_admin',
      created_at: new Date().toISOString(),
    }
    admins.push(newAdmin)
    return newAdmin
  },

  async activateAdmin(id: number): Promise<Admin> {
    await delay(200)
    const admin = admins.find((a) => a.id === id)
    if (!admin) throw new Error('Admin not found')
    admin.is_active = true
    return { ...admin }
  },

  async deactivateAdmin(id: number): Promise<Admin> {
    await delay(200)
    const admin = admins.find((a) => a.id === id)
    if (!admin) throw new Error('Admin not found')
    admin.is_active = false
    return { ...admin }
  },
}
