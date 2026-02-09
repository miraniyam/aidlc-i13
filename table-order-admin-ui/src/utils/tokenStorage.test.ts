import { describe, it, expect, beforeEach } from 'vitest'
import { TokenStorage } from './tokenStorage'

describe('TokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('TC-TOKEN-001: 토큰 저장', () => {
    TokenStorage.save('test-token')
    expect(localStorage.getItem('admin_token')).toBe('test-token')
  })

  it('TC-TOKEN-002: 토큰 조회', () => {
    localStorage.setItem('admin_token', 'existing-token')
    expect(TokenStorage.get()).toBe('existing-token')
  })

  it('TC-TOKEN-003: 토큰 삭제', () => {
    localStorage.setItem('admin_token', 'test-token')
    TokenStorage.remove()
    expect(localStorage.getItem('admin_token')).toBeNull()
  })
})
