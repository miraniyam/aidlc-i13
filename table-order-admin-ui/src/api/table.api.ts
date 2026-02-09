import client from './client'
import type { CompleteSessionRequest, OrderHistoryItem } from '../types'

export const TableAPI = {
  async completeSession(tableId: number, data: CompleteSessionRequest): Promise<void> {
    await client.post(`/api/admin/tables/${tableId}/complete-session`, data)
  },

  async getOrderHistory(tableId: number): Promise<OrderHistoryItem[]> {
    const response = await client.get<OrderHistoryItem[]>(`/api/admin/tables/${tableId}/order-history`)
    return response.data
  },
}
