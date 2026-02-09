import { create } from 'zustand'
import { AuthAPI } from '../api/auth.api'
import type { Admin } from '../types'

interface AuthState {
  admin: Admin | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  token: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    const response = await AuthAPI.login({ username, password })
    localStorage.setItem('admin_token', response.access_token)
    set({
      token: response.access_token,
      isAuthenticated: true,
    })
  },

  logout: () => {
    localStorage.removeItem('admin_token')
    set({
      admin: null,
      token: null,
      isAuthenticated: false,
    })
  },

  checkAuth: () => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      set({
        token,
        isAuthenticated: true,
      })
    } else {
      set({
        admin: null,
        token: null,
        isAuthenticated: false,
      })
    }
  },
}))
