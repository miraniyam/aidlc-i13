export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  TABLE_ID: 'table_id',
  SESSION_ID: 'session_id',
  CART: 'cart',
} as const;

export const ORDER_STATUS_CONFIG = {
  pending: {
    label: '주문 접수',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
  preparing: {
    label: '조리 중',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  ready: {
    label: '준비 완료',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  served: {
    label: '전달 완료',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
} as const;
