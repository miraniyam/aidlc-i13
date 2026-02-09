import { create } from 'zustand'

interface AuthState {
  token: string | null
  adminId: number | null
  role: string | null
  isAuthenticated: boolean
  setAuth: (token: string, adminId: number, role: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  adminId: JSON.parse(localStorage.getItem('adminId') || 'null'),
  role: localStorage.getItem('role'),
  isAuthenticated: !!localStorage.getItem('token'),
  setAuth: (token, adminId, role) => {
    localStorage.setItem('token', token)
    localStorage.setItem('adminId', JSON.stringify(adminId))
    localStorage.setItem('role', role)
    set({ token, adminId, role, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('adminId')
    localStorage.removeItem('role')
    set({ token: null, adminId: null, role: null, isAuthenticated: false })
  },
}))
