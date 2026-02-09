# Contract/Interface Definition for Unit 3 (Admin Frontend) - REVISED

## Revision History
- **2026-02-09T16:56:00+09:00**: Backend Alignment (Unit 1 실제 구현 기준)

## Unit Context

### Stories Implemented
- **US-A01**: 매장 관리자 로그인
- **US-A02**: 실시간 주문 모니터링 대시보드
- **US-A03**: 주문 상세 정보 조회
- **US-A04**: 주문 상태 변경
- **US-A05**: 테이블 세션 종료
- **US-A06**: 메뉴 등록
- **US-A07**: 메뉴 수정
- **US-A08**: 메뉴 삭제
- **US-A09**: 메뉴 이미지 업로드
- **US-A11**: 주문 내역 조회

### Removed Features (Phase 2)
- ~~US-A10: 카테고리 관리~~ (Backend API 미구현)
- ~~US-A12: 주문 통계 조회~~ (Backend API 미구현)

### Dependencies
- **Unit 1 (Backend API)**: 모든 API 엔드포인트 의존

---

## API Client Layer

### AuthAPI

```typescript
class AuthAPI {
  /**
   * 관리자 로그인
   * @param credentials - { username, password, store_id }
   * @returns { token, admin_id, store_name }
   * @throws APIError - 401, 500
   */
  login(credentials: LoginRequest): Promise<LoginResponse>
}
```

**Endpoint**: `POST /api/admin/auth/login`

---

### OrderAPI

```typescript
class OrderAPI {
  /**
   * 테이블별 주문 조회
   * @param tableId - 테이블 ID
   * @returns Order[]
   * @throws APIError - 404, 500
   */
  getOrdersByTable(tableId: number): Promise<Order[]>

  /**
   * 주문 상태 변경
   * @param orderId - 주문 ID
   * @param request - { status }
   * @returns Order
   * @throws APIError - 404, 422, 500
   */
  updateOrderStatus(orderId: number, request: UpdateOrderStatusRequest): Promise<Order>
}
```

**Endpoints**:
- `GET /api/admin/orders?table_id={tableId}`
- `PATCH /api/admin/orders/{orderId}/status`

**Note**: Optimistic Locking 미구현 (version 필드 없음)

---

### TableAPI

```typescript
class TableAPI {
  /**
   * 테이블 세션 종료
   * @param tableId - 테이블 ID
   * @returns void
   * @throws APIError - 404, 500
   */
  completeSession(tableId: number): Promise<void>

  /**
   * 주문 내역 조회
   * @param tableId - 테이블 ID
   * @param params - { from_date?, to_date? }
   * @returns OrderHistory[]
   * @throws APIError - 400, 500
   */
  getOrderHistory(tableId: number, params: OrderHistoryParams): Promise<OrderHistory[]>
}
```

**Endpoints**:
- `POST /api/admin/tables/{tableId}/complete-session`
- `GET /api/admin/tables/{tableId}/order-history?from_date={date}&to_date={date}`

**Note**: 강제 종료 옵션 미구현 (force 파라미터 없음)

---

### MenuAPI

```typescript
class MenuAPI {
  /**
   * 메뉴 목록 조회
   * @param categoryId - 카테고리 ID (선택적)
   * @returns Menu[]
   * @throws APIError - 500
   */
  getMenus(categoryId?: number): Promise<Menu[]>

  /**
   * 메뉴 생성
   * @param formData - FormData (category_id, name, price, description?, image?)
   * @returns Menu
   * @throws APIError - 400, 409, 500
   */
  createMenu(formData: FormData): Promise<Menu>

  /**
   * 메뉴 수정
   * @param menuId - 메뉴 ID
   * @param formData - FormData (name?, price?, description?, is_available?, image?)
   * @returns Menu
   * @throws APIError - 404, 409, 500
   */
  updateMenu(menuId: number, formData: FormData): Promise<Menu>

  /**
   * 메뉴 삭제
   * @param menuId - 메뉴 ID
   * @returns void
   * @throws APIError - 404, 409, 500
   */
  deleteMenu(menuId: number): Promise<void>
}
```

**Endpoints**:
- `GET /api/admin/menus?category_id={categoryId}`
- `POST /api/admin/menus`
- `PATCH /api/admin/menus/{menuId}`
- `DELETE /api/admin/menus/{menuId}`

**Note**: 이미지 업로드는 메뉴 생성/수정과 통합 (별도 엔드포인트 없음)

---

### SSEAPI

```typescript
class SSEAPI {
  /**
   * SSE 스트림 연결
   * @returns EventSource
   */
  connect(): EventSource
}
```

**Endpoint**: `GET /api/admin/sse`

**Note**: 엔드포인트 경로 변경 (/api/admin/events → /api/admin/sse)

---

## State Management Layer

### useAuthStore (Zustand)

```typescript
interface AuthState {
  isAuthenticated: boolean
  adminId: string | null
  storeName: string | null
  
  login(token: string, adminId: string, storeName: string): void
  logout(): void
  checkAuth(): void
}
```

---

### useUIStore (Zustand)

```typescript
interface UIState {
  isSidebarCollapsed: boolean
  activeModal: string | null
  
  toggleSidebar(): void
  openModal(modalId: string): void
  closeModal(): void
}
```

---

## Security Layer

### sanitizeInput

```typescript
function sanitizeInput(input: string): string
function sanitizeFormData<T extends Record<string, any>>(data: T): T
```

---

### RateLimiter

```typescript
class RateLimiter {
  constructor(limit: number, window: number)
  canMakeRequest(): boolean
  getRemainingRequests(): number
}
```

---

### TokenStorage

```typescript
const TokenStorage = {
  set(key: string, value: string): void
  get(key: string): string | null
  remove(key: string): void
  clear(): void
}
```

---

## Real-time Communication Layer

### useSSEManager (Custom Hook)

```typescript
interface SSEManagerOptions {
  url: string
  onMessage: (event: MessageEvent) => void
  onError?: (error: Event) => void
  maxReconnectDelay?: number
}

interface SSEManagerReturn {
  status: 'connected' | 'disconnected' | 'reconnecting'
}

function useSSEManager(options: SSEManagerOptions): SSEManagerReturn
```

---

## Utility Layer

### uploadImage

```typescript
interface UploadProgress {
  percent: number
  status: 'uploading' | 'success' | 'error'
}

function createImagePreview(file: File): Promise<string>
```

**Note**: 별도 업로드 API 없음 (메뉴 생성/수정 시 통합)

---

### Date Formatter

```typescript
function formatDate(date: string): string
function formatRelativeTime(date: string): string
function formatDateRange(start: string, end: string): string
```

---

## React Query Hooks

### useLogin (Mutation)

```typescript
function useLogin(): UseMutationResult<LoginResponse, APIError, LoginRequest>
```

---

### useOrdersByTable (Query)

```typescript
function useOrdersByTable(tableId: number): UseQueryResult<Order[], APIError>
```

---

### useUpdateOrderStatus (Mutation)

```typescript
function useUpdateOrderStatus(): UseMutationResult<Order, APIError, { orderId: number; request: UpdateOrderStatusRequest }>
```

---

### useCompleteSession (Mutation)

```typescript
function useCompleteSession(): UseMutationResult<void, APIError, number>
```

---

### useMenus (Query)

```typescript
function useMenus(categoryId?: number): UseQueryResult<Menu[], APIError>
```

---

### useCreateMenu (Mutation)

```typescript
function useCreateMenu(): UseMutationResult<Menu, APIError, FormData>
```

---

### useUpdateMenu (Mutation)

```typescript
function useUpdateMenu(): UseMutationResult<Menu, APIError, { menuId: number; formData: FormData }>
```

---

### useDeleteMenu (Mutation)

```typescript
function useDeleteMenu(): UseMutationResult<void, APIError, number>
```

---

### useOrderHistory (Query)

```typescript
function useOrderHistory(tableId: number, params: OrderHistoryParams): UseQueryResult<OrderHistory[], APIError>
```

---

## Summary

### API Client Layer (5 classes)
- AuthAPI, OrderAPI, TableAPI, MenuAPI, SSEAPI

### State Management Layer (2 stores)
- useAuthStore, useUIStore

### Security Layer (3 utilities)
- sanitizeInput, RateLimiter, TokenStorage

### Real-time Communication Layer (1 hook)
- useSSEManager

### Utility Layer (2 modules)
- uploadImage (미리보기만), Date Formatter

### React Query Hooks (9 hooks)
- useLogin, useOrdersByTable, useUpdateOrderStatus, useCompleteSession
- useMenus, useCreateMenu, useUpdateMenu, useDeleteMenu
- useOrderHistory

**Total**: 22 contracts/interfaces (32개에서 축소)

---

**All contracts aligned with Unit 1 Backend implementation.**
