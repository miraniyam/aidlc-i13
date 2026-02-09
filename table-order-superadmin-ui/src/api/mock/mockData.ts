import type { Admin } from '@/types/api'

export const mockAdmins: Admin[] = [
  {
    id: '1',
    store_id: 'store-001',
    username: 'admin1',
    is_active: true,
    role: 'store_admin',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    store_id: 'store-002',
    username: 'admin2',
    is_active: false,
    role: 'store_admin',
    created_at: '2026-01-15T00:00:00Z',
  },
]

export const mockSuperAdmin = {
  id: 'super-1',
  username: 'superadmin',
  password: 'super123',
  role: 'super_admin',
}
