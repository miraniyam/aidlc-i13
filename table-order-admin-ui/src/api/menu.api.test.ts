import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { MenuAPI } from './menu.api'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('MenuAPI', () => {
  describe('createMenu', () => {
    it('TC-A06-001: 메뉴 생성 성공', async () => {
      server.use(
        http.post('http://localhost:8000/api/admin/menus', () => {
          return HttpResponse.json({
            id: 1,
            name: '김치찌개',
            description: '맛있는 김치찌개',
            price: 8000,
            image_url: '/uploads/menus/test.jpg',
            is_available: true,
            created_at: '2026-02-09T10:00:00Z',
            updated_at: '2026-02-09T10:00:00Z',
          })
        })
      )

      const result = await MenuAPI.createMenu({
        name: '김치찌개',
        description: '맛있는 김치찌개',
        price: 8000,
        is_available: true,
      })

      expect(result.name).toBe('김치찌개')
      expect(result.price).toBe(8000)
    })
  })

  describe('updateMenu', () => {
    it('TC-A07-001: 메뉴 수정 성공', async () => {
      server.use(
        http.patch('http://localhost:8000/api/admin/menus/1', () => {
          return HttpResponse.json({
            id: 1,
            name: '김치찌개',
            description: '더 맛있는 김치찌개',
            price: 9000,
            image_url: '/uploads/menus/test.jpg',
            is_available: true,
            created_at: '2026-02-09T10:00:00Z',
            updated_at: '2026-02-09T10:30:00Z',
          })
        })
      )

      const result = await MenuAPI.updateMenu(1, {
        description: '더 맛있는 김치찌개',
        price: 9000,
      })

      expect(result.description).toBe('더 맛있는 김치찌개')
      expect(result.price).toBe(9000)
    })
  })

  describe('deleteMenu', () => {
    it('TC-A08-001: 메뉴 삭제 성공', async () => {
      server.use(
        http.delete('http://localhost:8000/api/admin/menus/1', () => {
          return new HttpResponse(null, { status: 204 })
        })
      )

      await expect(MenuAPI.deleteMenu(1)).resolves.toBeUndefined()
    })
  })
})
