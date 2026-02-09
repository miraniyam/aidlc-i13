# Component Methods - 테이블오더 서비스

## Overview
각 컴포넌트의 메서드 시그니처와 고수준 목적을 정의합니다.

**Note**: 상세한 비즈니스 로직은 Functional Design (CONSTRUCTION 단계)에서 정의됩니다.

---

## Backend Service Methods

### AuthenticationService
```python
def authenticate_table(store_id: UUID, table_number: str, table_password: str) -> dict:
    """테이블 인증 및 JWT 토큰 생성"""
    # Input: store_id, table_number, table_password
    # Output: {token: str, table_id: int}
    
def authenticate_admin(store_id: UUID, username: str, password: str) -> dict:
    """매장 관리자 인증 및 JWT 토큰 생성"""
    # Input: store_id, username, password
    # Output: {token: str, admin_id: int, role: str}
    
def authenticate_super_admin(username: str, password: str) -> dict:
    """슈퍼 관리자 인증 및 JWT 토큰 생성"""
    # Input: username, password
    # Output: {token: str, admin_id: int, role: str}
```

### MenuService
```python
def get_menus_by_category(store_id: UUID, category_id: int = None) -> List[Menu]:
    """카테고리별 메뉴 목록 조회"""
    
def get_menu_detail(menu_id: int) -> Menu:
    """메뉴 상세 정보 조회"""
    
def create_menu(store_id: UUID, menu_data: MenuData, image_file: UploadFile) -> Menu:
    """메뉴 등록 및 이미지 저장"""
    
def update_menu(menu_id: int, menu_data: MenuData, image_file: UploadFile = None) -> Menu:
    """메뉴 수정"""
    
def delete_menu(menu_id: int) -> bool:
    """메뉴 삭제"""
```

### CreateOrderService
```python
def create_order(session_id: int, table_id: int, store_id: UUID, items: List[OrderItemData]) -> Order:
    """주문 생성 및 이벤트 발행"""
    # Input: session_id, table_id, store_id, items
    # Output: Order object
    # Side effect: Publish OrderCreated event
```

### OrderQueryService
```python
def get_orders_by_session(session_id: int) -> List[Order]:
    """세션별 주문 내역 조회"""
    
def get_orders_by_table(table_id: int) -> List[Order]:
    """테이블별 주문 목록 조회"""
```

### UpdateOrderStatusService
```python
def update_status(order_id: int, new_status: OrderStatus) -> Order:
    """주문 상태 변경 및 이벤트 발행"""
    # Input: order_id, new_status (pending/preparing/cooked/delivered)
    # Output: Updated Order
    # Side effect: Publish OrderStatusChanged event
```

### DeleteOrderService
```python
def delete_order(order_id: int) -> bool:
    """주문 삭제"""
    # Input: order_id
    # Output: success boolean
    # Note: 총 주문액은 프론트엔드에서 실시간 계산
```

### CompleteTableSessionService
```python
def complete_session(table_id: int, session_id: int) -> bool:
    """테이블 세션 종료 및 주문 이력 이동"""
    # Input: table_id, session_id
    # Output: success boolean
    # Side effect: Move orders to OrderHistory
```

### OrderHistoryQueryService
```python
def get_order_history(table_id: int, from_date: date = None, to_date: date = None) -> List[OrderHistory]:
    """과거 주문 내역 조회 (완료된 세션)"""
```

### ManageAdminService
```python
def create_admin(username: str, password: str) -> Admin:
    """매장 관리자 계정 생성"""
    # Input: username, password
    # Output: Admin object with generated store_id (UUID)
    
def activate_admin(admin_id: int) -> Admin:
    """관리자 계정 활성화"""
    
def deactivate_admin(admin_id: int) -> Admin:
    """관리자 계정 비활성화"""
    
def get_all_admins() -> List[Admin]:
    """관리자 계정 목록 조회"""
```

---

## Middleware & Utilities Methods

### AuthService
```python
def generate_jwt_token(user_id: int, role: str, expiry_hours: int = 16) -> str:
    """JWT 토큰 생성"""
    
def verify_jwt_token(token: str) -> dict:
    """JWT 토큰 검증"""
    # Output: {user_id: int, role: str}
    
def hash_password(password: str) -> str:
    """비밀번호 bcrypt 해싱"""
    
def verify_password(password: str, hashed: str) -> bool:
    """비밀번호 검증"""
```

### EventBus
```python
def publish(event_type: str, data: dict) -> None:
    """이벤트 발행"""
    
def subscribe(event_type: str, callback: Callable) -> None:
    """이벤트 구독"""
```

### SSEPublisher
```python
def add_client(client_id: str, response: StreamingResponse) -> None:
    """SSE 클라이언트 추가"""
    
def remove_client(client_id: str) -> None:
    """SSE 클라이언트 제거"""
    
def broadcast(event_type: str, data: dict) -> None:
    """모든 클라이언트에 이벤트 전송"""
```

---

## Frontend Component Methods (React)

### Menu Components
```typescript
// MenuList
function MenuList({ categoryId }: { categoryId?: number }): JSX.Element
  // Fetch menus by category using React Query
  
// MenuItem
function MenuItem({ menu }: { menu: Menu }): JSX.Element
  // Display menu card with image, name, price
  
// MenuDetail
function MenuDetail({ menuId, onAddToCart }: { menuId: number, onAddToCart: Function }): JSX.Element
  // Display menu details in modal
```

### Cart Components
```typescript
// Cart (Zustand store)
interface CartStore {
  items: CartItem[]
  addItem: (menu: Menu) => void
  removeItem: (menuId: number) => void
  updateQuantity: (menuId: number, quantity: number) => void
  clearCart: () => void
  getTotalAmount: () => number
}

// CartItem
function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps): JSX.Element
```

### Order Components
```typescript
// OrderList
function OrderList({ sessionId }: { sessionId: number }): JSX.Element
  // Fetch orders using React Query with 30s polling
  
// OrderConfirm
function OrderConfirm({ items, onConfirm }: OrderConfirmProps): JSX.Element
  // Display order confirmation with total amount
```

### Dashboard Components
```typescript
// Dashboard
function Dashboard(): JSX.Element
  // Subscribe to SSE for real-time order updates
  
// TableCard
function TableCard({ tableId, orders, totalAmount }: TableCardProps): JSX.Element
  // Display table card with orders preview
```

### MenuManagement Components
```typescript
// MenuForm
function MenuForm({ menu, onSubmit }: MenuFormProps): JSX.Element
  // Form for creating/updating menu with image upload
```

---

## API Communication (React Query)

### Query Keys
```typescript
const queryKeys = {
  menus: ['menus'],
  menusByCategory: (categoryId: number) => ['menus', categoryId],
  menuDetail: (menuId: number) => ['menu', menuId],
  orders: (sessionId: number) => ['orders', sessionId],
  orderHistory: (tableId: number) => ['orderHistory', tableId],
  adminMenus: ['admin', 'menus'],
  admins: ['superadmin', 'admins'],
}
```

### Mutations
```typescript
// Order mutations
const useCreateOrder = () => useMutation(createOrder)
const useUpdateOrderStatus = () => useMutation(updateOrderStatus)
const useDeleteOrder = () => useMutation(deleteOrder)

// Menu mutations
const useCreateMenu = () => useMutation(createMenu)
const useUpdateMenu = () => useMutation(updateMenu)
const useDeleteMenu = () => useMutation(deleteMenu)

// Admin mutations
const useCreateAdmin = () => useMutation(createAdmin)
const useActivateAdmin = () => useMutation(activateAdmin)
const useDeactivateAdmin = () => useMutation(deactivateAdmin)
```

---

## Summary

### Backend Services
- **9개 서비스** (통합 후), 각 서비스는 1-5개 메서드 보유
- 모든 메서드는 명확한 입력/출력 타입 정의
- 이벤트 발행 메서드는 Side effect 명시

### Service Changes
- **AuthenticationService**: 3개 로그인 서비스 통합
- **MenuService**: 4개 메뉴 서비스 통합 (조회 + CRUD)
- **ManageAdminService**: 2개 관리자 서비스 통합 (생성 + 관리)

### Frontend Components
- **React 함수형 컴포넌트** 사용
- **Zustand** 상태 관리 (Cart store)
- **React Query** API 통신 (queries, mutations)
- **TypeScript** 타입 정의

### Key Patterns
- **Service 메서드**: 단일 책임, 명확한 입출력
- **Event-driven**: OrderCreated, OrderStatusChanged 이벤트
- **React Query**: 서버 상태 캐싱 및 자동 리페칭
- **Zustand**: 클라이언트 상태 관리 (장바구니)
