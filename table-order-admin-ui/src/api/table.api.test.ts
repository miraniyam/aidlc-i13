import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { TableAPI } from './table.api'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('TableAPI', () => {
  describe('completeSession', () => {
    it('TC-A05-001: 세션 종료 성공', async () => {
      server.use(
        http.post('http://localhost:8000/api/admin/tables/1/complete-session', () => {
          return new HttpResponse(null, { status: 204 })
        })
      )

      await expect(TableAPI.completeSession(1, {})).resolves.toBeUndefined()
    })
  })

  describe('getOrderHistory', () => {
    it('TC-A11-001: 주문 내역 조회 성공', async () => {
      server.use(
        http.get('http://localhost:8000/api/admin/tables/1/order-history', () => {
          return HttpResponse.json([
            {
              id: 1,
              table_id: 1,
              status: 'served',
              items: [],
              total_amount: 15000,
              created_at: '2026-02-09T10:00:00Z',
              completed_at: '2026-02-09T11:00:00Z',
            },
          ])
        })
      )

      const result = await TableAPI.getOrderHistory(1)

      expect(result).toHaveLength(1)
      expect(result[0].table_id).toBe(1)
    })
  })
})
