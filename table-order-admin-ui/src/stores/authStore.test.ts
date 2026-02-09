import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './authStore'
import { AuthAPI } from '../api/auth.api'

vi.mock('../api/auth.api')

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({
      admin: null,
      token: null,
      isAuthenticated: false,
    })
  })

  it('TC-AUTH-001: 로그인 시 상태 업데이트', async () => {
    vi.mocked(AuthAPI.login).mockResolvedValue({
      access_token: 'test-token',
      token_type: 'bearer',
    })

    await useAuthStore.getState().login('admin', 'password')

    const state = useAuthStore.getState()
    expect(state.token).toBe('test-token')
    expect(state.isAuthenticated).toBe(true)
    expect(localStorage.getItem('admin_token')).toBe('test-token')
  })

  it('TC-AUTH-002: 로그아웃 시 상태 초기화', () => {
    useAuthStore.setState({
      token: 'test-token',
      isAuthenticated: true,
    })
    localStorage.setItem('admin_token', 'test-token')

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(localStorage.getItem('admin_token')).toBeNull()
  })

  it('TC-AUTH-003: 자동 로그인 - 토큰 존재', () => {
    localStorage.setItem('admin_token', 'existing-token')

    useAuthStore.getState().checkAuth()

    const state = useAuthStore.getState()
    expect(state.token).toBe('existing-token')
    expect(state.isAuthenticated).toBe(true)
  })

  it('TC-AUTH-004: 자동 로그아웃 - 토큰 없음', () => {
    useAuthStore.setState({
      token: 'old-token',
      isAuthenticated: true,
    })

    useAuthStore.getState().checkAuth()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
