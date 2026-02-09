import { useEffect, useRef, useState } from 'react'
import type { Order } from '../types'

interface SSEManagerOptions {
  onNewOrder?: (order: Order) => void
  onOrderUpdated?: (order: Order) => void
  onError?: (error: Event) => void
}

export function useSSEManager(options: SSEManagerOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const reconnectAttempts = useRef(0)

  const connect = () => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    const url = `${import.meta.env.VITE_SSE_URL}?token=${token}`
    const eventSource = new EventSource(url)

    eventSource.onopen = () => {
      setIsConnected(true)
      reconnectAttempts.current = 0
    }

    eventSource.addEventListener('new_order', (event) => {
      const order = JSON.parse(event.data) as Order
      options.onNewOrder?.(order)
    })

    eventSource.addEventListener('order_updated', (event) => {
      const order = JSON.parse(event.data) as Order
      options.onOrderUpdated?.(order)
    })

    eventSource.onerror = (error) => {
      setIsConnected(false)
      eventSource.close()
      options.onError?.(error)

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
      reconnectAttempts.current += 1

      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect()
      }, delay)
    }

    eventSourceRef.current = eventSource
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
  }

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [])

  return {
    isConnected,
    reconnect: connect,
    disconnect,
  }
}
