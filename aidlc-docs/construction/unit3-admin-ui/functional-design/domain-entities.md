# Domain Entities - Unit 3 (Admin Frontend)

## Overview

Admin Frontend의 도메인 엔티티를 TypeScript 인터페이스로 정의합니다. 이 엔티티들은 Backend API로부터 받거나 전송하는 데이터 구조를 나타냅니다.

**Note**: 실제 구현 시 OpenAPI 스키마로부터 자동 생성되지만, 여기서는 설계 목적으로 명시적으로 정의합니다.

---

## Core Domain Entities

### Admin (관리자)

```typescript
interface Admin {
  admin_id: string;
  store_id: string;
  username: string;
  role: 'store_admin' | 'super_admin';
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

**Usage**: 로그인한 관리자 정보 저장 (localStorage)

---

### Table (테이블)

```typescript
interface Table {
  table_id: string;
  store_id: string;
  table_number: number;
  created_at: string;
  updated_at: string;
}
```

**Usage**: 대시보드 테이블 카드 표시

---

### TableSession (테이블 세션)

```typescript
interface TableSession {
  session_id: string;
  table_id: string;
  start_time: string; // ISO 8601
  end_time: string | null; // ISO 8601, null if active
  status: 'active' | 'completed';
}
```

**Usage**: 현재 활성 세션 추적, 세션 종료 처리

---

### Order (주문)

```typescript
interface Order {
  order_id: string;
  session_id: string;
  table_id: string;
  store_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  items: OrderItem[];
}

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
```

**Note**: Backend 실제 구현 기준 (version, is_archived 미구현)
```

**Usage**: 주문 목록 표시, 상태 변경, 주문 삭제

**version**: 동시 주문 상태 변경 충돌 방지 (Optimistic Locking)

**is_archived**: 세션 종료 후에도 Order 유지, 과거 내역 조회 시 필터링

---

### OrderItem (주문 항목)

```typescript
interface OrderItem {
  order_item_id: string;
  order_id: string;
  menu_id: string | null; // 메뉴 삭제 시 null
  menu_name: string; // 스냅샷 (주문 시점 메뉴명)
  quantity: number;
  unit_price: number; // 스냅샷 (주문 시점 가격)
  subtotal: number;
}
```

**Usage**: 주문 상세 정보 표시

**menu_id nullable**: 메뉴 삭제 후에도 과거 주문 조회 가능

**menu_name, unit_price 스냅샷**: 메뉴 정보 변경 시 과거 주문 영향 방지

---

### Menu (메뉴)

```typescript
interface Menu {
  menu_id: string;
  store_id: string;
  category_id: string;
  menu_name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}
```

**Usage**: 메뉴 목록 표시, 메뉴 등록/수정/삭제

---

### MenuCategory (메뉴 카테고리)

```typescript
interface MenuCategory {
  category_id: string;
  store_id: string;
  category_name: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}
```

**Usage**: 메뉴 카테고리 관리, 메뉴 등록 시 카테고리 선택

---

### OrderHistory (과거 주문)

```typescript
interface OrderHistory {
  history_id: string;
  session_id: string;
  table_id: string;
  store_id: string;
  order_ids: string[]; // Order 참조 (is_archived=true인 주문들)
  session_start_time: string;
  session_end_time: string;
  total_orders_count: number;
  total_amount: number;
  completed_at: string; // ISO 8601
}
```

**Usage**: 과거 주문 내역 조회

**order_ids**: Order 테이블 참조 (Order는 삭제하지 않고 is_archived=true로 유지)

**Rationale**: Order 데이터 보존으로 상세 조회 가능, 데이터 중복 최소화

---

## SSE Event Types

### OrderCreatedEvent

```typescript
interface OrderCreatedEvent {
  event: 'OrderCreated';
  data: {
    order_id: string;
    table_id: string;
    table_number: number;
    status: OrderStatus;
    total_amount: number;
    created_at: string;
    items: OrderItem[];
  };
}
```

**Usage**: SSE로 신규 주문 수신 시 대시보드 업데이트

---

### OrderStatusChangedEvent

```typescript
interface OrderStatusChangedEvent {
  event: 'OrderStatusChanged';
  data: {
    order_id: string;
    table_id: string;
    old_status: OrderStatus;
    new_status: OrderStatus;
    updated_at: string;
  };
}
```

**Usage**: SSE로 주문 상태 변경 수신 시 대시보드 업데이트

---

### SSEEvent (Union Type)

```typescript
type SSEEvent = OrderCreatedEvent | OrderStatusChangedEvent;
```

**Usage**: SSE 이벤트 핸들러에서 타입 구분

---

## API Request/Response Types

### Login Request/Response

```typescript
interface LoginRequest {
  store_id: string;
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number; // seconds (16 hours = 57600)
  admin: Admin;
  store: Store; // 매장 정보 추가
}
```

---

### Dashboard Data

```typescript
interface DashboardData {
  tables: TableWithOrders[];
  store: Store; // 매장 정보 추가
}

interface TableWithOrders {
  table: Table;
  session: TableSession | null;
  orders: Order[];
  total_amount: number;
}
```

**Usage**: 대시보드 초기 로드 및 주기적 동기화, 헤더에 매장명 표시

---

### Order Status Update

```typescript
interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

interface UpdateOrderStatusResponse {
  order: Order;
}
```

**Note**: Backend에 Optimistic Locking 미구현 (current_version 제거)

---

### Complete Session

```typescript
interface CompleteSessionRequest {
  table_id: string;
}

interface CompleteSessionResponse {
  session: TableSession;
}
```

**Note**: Backend에 force 옵션 미구현
```

**force**: 미전달 주문 경고 후 사용자가 강제 종료 선택 시 true

---

### Order History Query

```typescript
interface OrderHistoryQueryParams {
  table_id: string;
  from_date?: string; // ISO 8601 date
  to_date?: string; // ISO 8601 date
}

interface OrderHistoryResponse {
  histories: OrderHistory[];
  total_count: number;
}
```

---

### Menu CRUD

```typescript
interface CreateMenuRequest {
  category_id: string;
  menu_name: string;
  price: number;
  description?: string;
  image?: File; // multipart/form-data
}

interface UpdateMenuRequest {
  menu_name?: string;
  price?: number;
  description?: string;
  category_id?: string;
  image?: File;
}

interface MenuResponse {
  menu: Menu;
}

interface MenuListResponse {
  menus: Menu[];
  categories: MenuCategory[];
}
```

---

### Category Management

```typescript
interface CreateCategoryRequest {
  category_name: string;
  display_order?: number;
}

interface UpdateCategoryRequest {
  category_name?: string;
  display_order?: number;
}

interface CategoryResponse {
  category: MenuCategory;
}
```

---

## Frontend-Specific Types

### UI State Types

```typescript
interface DashboardState {
  tables: TableWithOrders[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
}

interface SSEConnectionState {
  status: 'connected' | 'disconnected' | 'reconnecting';
  reconnectAttempts: number;
  lastEventTime: string | null;
}

interface ModalState {
  isOpen: boolean;
  type: 'orderDetail' | 'orderHistory' | 'menuForm' | 'categoryForm' | null;
  data: any | null;
}
```

---

### Form Types

```typescript
interface MenuFormData {
  category_id: string;
  menu_name: string;
  price: number;
  description: string;
  image: File | null;
  imagePreview: string | null;
}

interface CategoryFormData {
  category_name: string;
  display_order: number;
}

interface OrderHistoryFilterData {
  from_date: string; // YYYY-MM-DD
  to_date: string; // YYYY-MM-DD
}
```

---

## Validation Types

```typescript
interface ValidationError {
  field: string;
  message: string;
}

interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
```

---

## Error Types

```typescript
interface APIError {
  status: number;
  message: string;
  details?: any;
}

type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

interface UserFeedback {
  type: 'toast' | 'modal';
  severity: ErrorSeverity;
  message: string;
  duration?: number; // milliseconds (toast only)
}
```

---

## Summary

### Core Entities (8)
- Admin, Table, TableSession, Order, OrderItem, Menu, MenuCategory, OrderHistory

### SSE Events (2)
- OrderCreatedEvent, OrderStatusChangedEvent

### API Types (10)
- Login, Dashboard, OrderStatus, CompleteSession, OrderHistory, Menu CRUD, Category

### Frontend Types (7)
- DashboardState, SSEConnectionState, ModalState, Forms, Validation, Error

### Total Types: 27

---

**All domain entities are defined and ready for business logic modeling.**
