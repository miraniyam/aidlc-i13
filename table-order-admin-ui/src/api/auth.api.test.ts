import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { AuthAPI } from './auth.api'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('AuthAPI', () => {
  describe('login', () => {
    it('TC-A01-001: 로그인 성공 시 access_token 반환', async () => {
      // Arrange
      server.use(
        http.post('http://localhost:8000/api/admin/auth/login', () => {
          return HttpResponse.json({
            access_token: 'test-token-123',
            token_type: 'bearer',
          })
        })
      )

      // Act
      const result = await AuthAPI.login({
        username: 'admin',
        password: 'password123',
      })

      // Assert
      expect(result.access_token).toBe('test-token-123')
      expect(result.token_type).toBe('bearer')
    })

    it('TC-A01-002: 로그인 실패 시 에러 발생', async () => {
      // Arrange
      server.use(
        http.post('http://localhost:8000/api/admin/auth/login', () => {
          return HttpResponse.json(
            { detail: 'Invalid credentials' },
            { status: 401 }
          )
        })
      )

      // Act & Assert
      await expect(
        AuthAPI.login({
          username: 'admin',
          password: 'wrong',
        })
      ).rejects.toThrow()
    })
  })
})
