import client from './client'
import type { Order, UpdateOrderStatusRequest } from '../types'

export const OrderAPI = {
  async getOrdersByTable(tableId: number): Promise<Order[]> {
    const response = await client.get<Order[]>(`/api/admin/orders`, {
      params: { table_id: tableId },
    })
    return response.data
  },

  async updateOrderStatus(orderId: number, data: UpdateOrderStatusRequest): Promise<Order> {
    const response = await client.patch<Order>(`/api/admin/orders/${orderId}/status`, data)
    return response.data
  },
}
