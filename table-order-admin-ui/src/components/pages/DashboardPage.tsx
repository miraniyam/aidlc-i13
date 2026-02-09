import { useEffect, useState } from 'react'
import { OrderAPI } from '../../api/order.api'
import { TableAPI } from '../../api/table.api'
import { useSSEManager } from '../../services/sseManager'
import type { Order } from '../../types'

export default function DashboardPage() {
  const [tables] = useState([
    { id: 1, table_number: 'T1', is_active: false },
    { id: 2, table_number: 'T2', is_active: false },
    { id: 3, table_number: 'T3', is_active: false },
    { id: 4, table_number: 'T4', is_active: false },
  ])
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useSSEManager({
    onNewOrder: (order) => {
      if (selectedTable === order.table_id) {
        setOrders((prev) => [...prev, order])
      }
    },
    onOrderUpdated: (order) => {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)))
    },
  })

  useEffect(() => {
    if (selectedTable) {
      OrderAPI.getOrdersByTable(selectedTable).then(setOrders)
    }
  }, [selectedTable])

  const handleStatusChange = async (orderId: number, status: string) => {
    const validStatuses = ['preparing', 'ready', 'served', 'cancelled']
    if (validStatuses.includes(status)) {
      await OrderAPI.updateOrderStatus(orderId, { status: status as 'preparing' | 'ready' | 'served' | 'cancelled' })
    }
  }

  const handleCompleteSession = async (tableId: number) => {
    if (confirm('세션을 종료하시겠습니까?')) {
      await TableAPI.completeSession(tableId, {})
      setOrders([])
      setSelectedTable(null)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>대시보드</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {tables.map((table) => (
          <div
            key={table.id}
            onClick={() => setSelectedTable(table.id)}
            style={{
              padding: '20px',
              border: selectedTable === table.id ? '2px solid blue' : '1px solid #ccc',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <h3>{table.table_number}</h3>
            <p>{table.is_active ? '사용 중' : '비어있음'}</p>
          </div>
        ))}
      </div>

      {selectedTable && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h2>테이블 {selectedTable} 주문</h2>
            <button onClick={() => handleCompleteSession(selectedTable)}>세션 종료</button>
          </div>

          {orders.length === 0 ? (
            <p>주문이 없습니다.</p>
          ) : (
            <div>
              {orders.map((order) => (
                <div key={order.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>주문 #{order.id}</strong>
                      <p>총액: {order.total_amount}원</p>
                      <p>상태: {order.status}</p>
                    </div>
                    <div>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={order.status === 'pending'}
                      >
                        <option value="pending">대기</option>
                        <option value="preparing">준비중</option>
                        <option value="ready">준비완료</option>
                        <option value="served">서빙완료</option>
                        <option value="cancelled">취소</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.menu_name} x {item.quantity} = {item.subtotal}원
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
