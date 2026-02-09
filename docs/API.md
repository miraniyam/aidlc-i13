# API Documentation

## Base URL

```
http://localhost:8000
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Customer API

### POST /api/customer/auth/login
테이블 로그인

**Request:**
```json
{
  "table_number": "1",
  "password": "1234",
  "store_id": "uuid"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "session_id": 1,
  "table_id": 1
}
```

### GET /api/customer/menus
메뉴 조회

**Query Parameters:**
- `store_id` (required): 매장 ID
- `category_id` (optional): 카테고리 ID

**Response:**
```json
[
  {
    "id": 1,
    "name": "김치찌개",
    "price": 8000,
    "description": "맛있는 김치찌개",
    "image_path": "/uploads/menus/uuid.jpg",
    "is_available": true
  }
]
```

### POST /api/customer/orders
주문 생성

**Request:**
```json
{
  "items": [
    {"menu_id": 1, "quantity": 2},
    {"menu_id": 2, "quantity": 1}
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "status": "pending",
  "total_price": 16000,
  "created_at": "2026-02-09T15:00:00Z"
}
```

## Admin API

### POST /api/admin/auth/login
관리자 로그인

**Request:**
```json
{
  "username": "admin",
  "password": "password",
  "store_id": "uuid"
}
```

### PATCH /api/admin/orders/{order_id}/status
주문 상태 변경

**Request:**
```json
{
  "status": "preparing"
}
```

### GET /api/admin/sse
실시간 주문 알림 (SSE)

**Response (Stream):**
```
data: {"event_type": "OrderCreated", "order_id": 1, ...}

data: {"event_type": "OrderStatusChanged", "order_id": 1, ...}
```

## SuperAdmin API

### POST /api/superadmin/auth/login
슈퍼 관리자 로그인

### POST /api/superadmin/admins
관리자 생성

**Request:**
```json
{
  "username": "admin1",
  "password": "password",
  "role": "store_admin",
  "store_id": "uuid"
}
```

## Error Responses

```json
{
  "detail": "ERROR_CODE"
}
```

**Common Error Codes:**
- `INVALID_CREDENTIALS`: 인증 실패
- `TOKEN_EXPIRED`: 토큰 만료
- `MENU_NOT_FOUND`: 메뉴 없음
- `ORDER_NOT_FOUND`: 주문 없음
- `INVALID_STATUS_TRANSITION`: 잘못된 상태 전이
