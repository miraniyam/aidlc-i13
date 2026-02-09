import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { OrderAPI } from './order.api'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('OrderAPI', () => {
  describe('getOrdersByTable', () => {
    it('TC-A03-001: 테이블별 주문 조회 성공', async () => {
      server.use(
        http.get('http://localhost:8000/api/admin/orders', () => {
          return HttpResponse.json([
            {
              id: 1,
              table_id: 1,
              status: 'pending',
              items: [],
              total_amount: 15000,
              created_at: '2026-02-09T10:00:00Z',
              updated_at: '2026-02-09T10:00:00Z',
            },
          ])
        })
      )

      const result = await OrderAPI.getOrdersByTable(1)

      expect(result).toHaveLength(1)
      expect(result[0].table_id).toBe(1)
    })
  })

  describe('updateOrderStatus', () => {
    it('TC-A04-001: 주문 상태 변경 성공', async () => {
      server.use(
        http.patch('http://localhost:8000/api/admin/orders/1/status', () => {
          return HttpResponse.json({
            id: 1,
            table_id: 1,
            status: 'preparing',
            items: [],
            total_amount: 15000,
            created_at: '2026-02-09T10:00:00Z',
            updated_at: '2026-02-09T10:05:00Z',
          })
        })
      )

      const result = await OrderAPI.updateOrderStatus(1, { status: 'preparing' })

      expect(result.status).toBe('preparing')
    })
  })
})
