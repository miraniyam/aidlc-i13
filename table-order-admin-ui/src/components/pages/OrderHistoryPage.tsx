import { useEffect, useState } from 'react'
import { TableAPI } from '../../api/table.api'
import { formatDate, formatRelativeTime } from '../../utils/dateFormatter'
import type { OrderHistoryItem } from '../../types'

export default function OrderHistoryPage() {
  const [selectedTableId, setSelectedTableId] = useState<number>(1)
  const [history, setHistory] = useState<OrderHistoryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [selectedTableId])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await TableAPI.getOrderHistory(selectedTableId)
      setHistory(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>주문 내역</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>테이블 선택: </label>
        <select value={selectedTableId} onChange={(e) => setSelectedTableId(Number(e.target.value))}>
          <option value={1}>T1</option>
          <option value={2}>T2</option>
          <option value={3}>T3</option>
          <option value={4}>T4</option>
        </select>
      </div>

      {loading ? (
        <p>로딩 중...</p>
      ) : history.length === 0 ? (
        <p>주문 내역이 없습니다.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>주문 ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>주문 시간</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>완료 시간</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>상태</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>총액</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>항목</th>
            </tr>
          </thead>
          <tbody>
            {history.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{order.id}</td>
                <td style={{ padding: '10px' }}>
                  {formatDate(order.created_at, 'YYYY-MM-DD HH:mm')}
                  <br />
                  <small style={{ color: '#666' }}>{formatRelativeTime(order.created_at)}</small>
                </td>
                <td style={{ padding: '10px' }}>
                  {order.completed_at ? formatDate(order.completed_at, 'YYYY-MM-DD HH:mm') : '-'}
                </td>
                <td style={{ padding: '10px' }}>{order.status}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{order.total_amount}원</td>
                <td style={{ padding: '10px' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      {item.menu_name} x {item.quantity}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
