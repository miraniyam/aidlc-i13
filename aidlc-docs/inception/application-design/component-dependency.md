# Component Dependencies - 테이블오더 서비스

## Overview
컴포넌트 간 의존성 관계 및 통신 패턴을 정의합니다.

---

## Backend Dependency Matrix

### Service Dependencies

| Service | Depends On | Events Published | Events Subscribed |
|---------|-----------|------------------|-------------------|
| TableLoginService | AuthService, Table, TableSession | - | - |
| MenuQueryService | Menu, MenuCategory | - | - |
| CreateOrderService | Order, OrderItem, TableSession, EventBus | OrderCreated | - |
| OrderQueryService | Order, OrderItem | - | - |
| UpdateOrderStatusService | Order, EventBus | OrderStatusChanged | - |
| DeleteOrderService | Order, OrderItem | - | - |
| CompleteTableSessionService | TableSession, Order, OrderHistory | - | - |
| OrderHistoryQueryService | OrderHistory | - | - |
| CreateMenuService | Menu, FileSystem | - | - |
| UpdateMenuService | Menu, FileSystem | - | - |
| DeleteMenuService | Menu, FileSystem | - | - |
| AdminLoginService | AuthService, Admin | - | - |
| SuperAdminLoginService | AuthService, Admin | - | - |
| CreateAdminService | Admin, AuthService | - | - |
| ManageAdminService | Admin | - | - |
| **SSEPublisher** | EventBus | - | OrderCreated, OrderStatusChanged |

---

## Backend Data Flow

### Customer Order Flow
```
Customer Frontend
    ↓ (HTTP POST)
CustomerController
    ↓
CreateOrderService
    ↓
Order + OrderItem (ORM)
    ↓
Database
    ↓
EventBus.publish(OrderCreated)
    ↓
SSEPublisher
    ↓ (SSE)
Admin Frontend (Real-time update)
```

### Admin Status Change Flow
```
Admin Frontend
    ↓ (HTTP PATCH)
AdminController
    ↓
UpdateOrderStatusService
    ↓
Order (ORM)
    ↓
Database
    ↓
EventBus.publish(OrderStatusChanged)
    ↓
SSEPublisher
    ↓ (SSE)
All Admin Frontends (Real-time update)
```

### Customer Order Status Check Flow
```
Customer Frontend (30s polling)
    ↓ (HTTP GET)
CustomerController
    ↓
OrderQueryService
    ↓
Order (ORM)
    ↓
Database
    ↓
Return updated orders
```

---

## Frontend Dependency Matrix

### Component Dependencies

| Component | Depends On | State Management | API Calls |
|-----------|-----------|------------------|-----------|
| MenuList | MenuItem, MenuCategory | React Query | GET /api/customer/menus |
| MenuItem | - | - | - |
| MenuDetail | - | Zustand (Cart) | - |
| Cart | CartItem, CartSummary | Zustand | - |
| CartItem | - | Zustand | - |
| OrderConfirm | - | Zustand (Cart) | POST /api/customer/orders |
| OrderList | OrderItem | React Query (30s polling) | GET /api/customer/orders |
| Dashboard | TableCard | SSE, React Query | GET /api/admin/orders/stream |
| TableCard | OrderItem | - | - |
| OrderDetail | OrderStatusControl | React Query | GET /api/admin/orders |
| OrderStatusControl | - | React Query | PATCH /api/admin/orders/{id}/status |
| MenuManagement | MenuForm | React Query | GET/POST/PATCH/DELETE /api/admin/menus |
| AdminManagement | AdminForm | React Query | GET/POST/PATCH /api/superadmin/admins |

---

## Frontend Data Flow

### Customer Order Creation Flow
```
MenuList (Browse menus)
    ↓
MenuItem (Click menu)
    ↓
MenuDetail (View details)
    ↓
Zustand Cart Store (Add to cart)
    ↓
Cart (View cart)
    ↓
OrderConfirm (Confirm order)
    ↓
React Query Mutation (POST /api/customer/orders)
    ↓
Backend API
    ↓
OrderSuccess (Show order number)
    ↓
Redirect to MenuList
```

### Admin Real-time Monitoring Flow
```
Dashboard (Mount component)
    ↓
EventSource (Connect to SSE)
    ↓
SSE Stream (/api/admin/orders/stream)
    ↓
Receive OrderCreated event
    ↓
Update Dashboard state
    ↓
Re-render TableCard components
```

### Customer Order Status Polling Flow
```
OrderList (Mount component)
    ↓
React Query (GET /api/customer/orders)
    ↓
Set refetchInterval: 30000ms
    ↓
Auto-refetch every 30s
    ↓
Update OrderList with new status
```

---

## Communication Patterns

### Pattern 1: Synchronous HTTP
**Used by**: 대부분의 CRUD 작업

```
Frontend Component
    ↓ (HTTP Request)
Backend Controller
    ↓
Service
    ↓
ORM
    ↓
Database
    ↓ (HTTP Response)
Frontend Component
```

**Examples**:
- Menu 조회
- Order 생성
- Menu 관리
- Admin 계정 관리

---

### Pattern 2: Server-Sent Events (SSE)
**Used by**: 관리자 실시간 주문 모니터링

```
Admin Frontend (Dashboard)
    ↓ (EventSource connection)
Backend SSE Endpoint (/api/admin/orders/stream)
    ↓
SSEPublisher (maintains connection)
    ↓ (subscribes to)
EventBus
    ↑ (publishes events)
CreateOrderService, UpdateOrderStatusService
    ↓ (SSE push)
Admin Frontend (Real-time update)
```

**Event Flow**:
1. Admin opens Dashboard
2. Dashboard creates EventSource connection
3. SSEPublisher adds client to connection pool
4. When order created/updated, EventBus publishes event
5. SSEPublisher receives event and broadcasts to all clients
6. Admin Dashboard receives SSE message and updates UI

---

### Pattern 3: Polling
**Used by**: 고객 주문 상태 확인

```
Customer Frontend (OrderList)
    ↓ (HTTP GET every 30s)
Backend API
    ↓
OrderQueryService
    ↓
Database
    ↓ (HTTP Response)
Customer Frontend (Update UI)
```

**Polling Configuration**:
- Interval: 30 seconds
- React Query refetchInterval: 30000

---

### Pattern 4: Event-Driven (Backend)
**Used by**: 주문 생성, 상태 변경

```
Service (CreateOrderService)
    ↓ (publish event)
EventBus
    ↓ (notify subscribers)
SSEPublisher
    ↓ (broadcast to clients)
Admin Frontends
```

**Event Types**:
- `OrderCreated`: 새 주문 생성 시
- `OrderStatusChanged`: 주문 상태 변경 시

---

## State Management Flow

### Zustand (Cart State)
```
MenuDetail
    ↓ (addItem)
Zustand Cart Store
    ↑ (subscribe)
Cart Component
    ↑ (subscribe)
CartSummary Component
```

**Cart Store Structure**:
```typescript
{
  items: CartItem[],
  addItem: (menu) => void,
  removeItem: (menuId) => void,
  updateQuantity: (menuId, quantity) => void,
  clearCart: () => void,
  getTotalAmount: () => number
}
```

---

### React Query (Server State)
```
Component (useQuery)
    ↓
React Query Cache
    ↓ (if cache miss or stale)
API Call
    ↓
Backend
    ↓
Update Cache
    ↓
Re-render Component
```

**Query Keys**:
- `['menus']`: 메뉴 목록
- `['menus', categoryId]`: 카테고리별 메뉴
- `['orders', sessionId]`: 세션별 주문
- `['orderHistory', tableId]`: 과거 주문 내역

---

## Dependency Graph

### Backend Services
```
Controllers
    ├── CustomerController
    │   ├── TableLoginService → AuthService, Table, TableSession
    │   ├── MenuQueryService → Menu, MenuCategory
    │   ├── CreateOrderService → Order, OrderItem, EventBus
    │   └── OrderQueryService → Order, OrderItem
    │
    ├── AdminController
    │   ├── AdminLoginService → AuthService, Admin
    │   ├── UpdateOrderStatusService → Order, EventBus
    │   ├── DeleteOrderService → Order, OrderItem
    │   ├── CompleteTableSessionService → TableSession, Order, OrderHistory
    │   ├── OrderHistoryQueryService → OrderHistory
    │   ├── CreateMenuService → Menu, FileSystem
    │   ├── UpdateMenuService → Menu, FileSystem
    │   └── DeleteMenuService → Menu, FileSystem
    │
    └── SuperAdminController
        ├── SuperAdminLoginService → AuthService, Admin
        ├── CreateAdminService → Admin, AuthService
        └── ManageAdminService → Admin

EventBus
    └── SSEPublisher (subscribes to OrderCreated, OrderStatusChanged)
```

---

### Frontend Components
```
Customer App
    ├── MenuList → React Query (menus)
    │   └── MenuItem
    │       └── MenuDetail → Zustand (Cart)
    │
    ├── Cart → Zustand (Cart)
    │   ├── CartItem
    │   └── CartSummary
    │
    ├── OrderConfirm → Zustand (Cart), React Query (createOrder)
    │
    └── OrderList → React Query (orders, 30s polling)
        └── OrderItem

Admin App
    ├── Dashboard → SSE (EventSource)
    │   └── TableCard
    │       └── OrderDetail → React Query
    │           └── OrderStatusControl → React Query (updateStatus)
    │
    ├── TableManagement → React Query
    │
    └── MenuManagement → React Query
        └── MenuForm

SuperAdmin App
    └── AdminManagement → React Query
        └── AdminForm
```

---

## Cross-Cutting Concerns

### Authentication Flow
```
Frontend (Login)
    ↓ (POST /api/.../login)
Backend (LoginService)
    ↓
AuthService.generate_jwt_token()
    ↓
Return JWT token
    ↓
Frontend stores token (localStorage)
    ↓
Subsequent requests include token in Authorization header
    ↓
Backend Middleware verifies token
    ↓
AuthService.verify_jwt_token()
    ↓
Extract user_id, role
    ↓
Proceed to Controller
```

---

### File Upload Flow
```
Frontend (MenuForm)
    ↓ (POST /api/admin/menus with multipart/form-data)
Backend (AdminController)
    ↓
CreateMenuService
    ↓
Save image to /uploads/menus/{uuid}.jpg
    ↓
Create Menu record with image_path
    ↓
Return Menu object
```

---

## Summary

### Backend Dependencies
- **Services → ORM**: 직접 의존 (Repository 없음)
- **Services → EventBus**: 이벤트 발행
- **SSEPublisher → EventBus**: 이벤트 구독
- **Services → AuthService**: 인증/인가

### Frontend Dependencies
- **Components → Zustand**: 클라이언트 상태 (Cart)
- **Components → React Query**: 서버 상태 (API 통신)
- **Dashboard → SSE**: 실시간 업데이트
- **OrderList → Polling**: 30초 자동 리페칭

### Communication Patterns
- **Synchronous HTTP**: CRUD 작업
- **SSE**: 관리자 실시간 모니터링
- **Polling**: 고객 주문 상태 확인
- **Event-Driven**: 백엔드 서비스 간 통신

### Key Design Decisions
- **No Repository Pattern**: ORM 직접 사용으로 간소화
- **Small Services**: 기능별 작은 단위 서비스
- **Event Bus**: 느슨한 결합, 실시간 업데이트
- **Zustand + React Query**: 클라이언트/서버 상태 분리

---

## Design Considerations & Solutions

### 1. 테이블 세션 동시성 문제

**Problem**:
여러 고객이 동시에 첫 주문 시 세션이 중복 생성될 수 있음 (Race Condition)

**Solution**:
```python
# Database Level: Unique Constraint
class TableSession(Base):
    __table_args__ = (
        UniqueConstraint('table_id', 'status', 
                        name='uq_table_active_session',
                        postgresql_where=text("status = 'active'")),
    )

# Service Level: Pessimistic Locking
def create_order(session_id, table_id, ...):
    if not session_id:
        # Check for existing active session with lock
        existing_session = db.session.query(TableSession)\
            .filter_by(table_id=table_id, status='active')\
            .with_for_update()\
            .first()
        
        if existing_session:
            session_id = existing_session.session_id
        else:
            session = TableSession(table_id=table_id, status='active')
            db.session.add(session)
            db.session.flush()
            session_id = session.session_id
    
    # Create order with session_id
    order = Order(session_id=session_id, ...)
    db.session.add(order)
    db.session.commit()
```

**Implementation**:
- Database constraint prevents duplicate active sessions
- `SELECT ... FOR UPDATE` ensures atomic session creation
- Transaction isolation level: READ COMMITTED

---

### 2. SSE 연결 관리 및 확장성

**Problem**:
- 서버 재시작 시 모든 SSE 연결 끊김
- 다중 서버 환경에서 이벤트 전파 불가
- 메모리 누수 가능

**Solution A: Redis Pub/Sub (권장)**
```python
# SSEPublisher with Redis
import redis

class SSEPublisher:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379)
        self.pubsub = self.redis_client.pubsub()
        self.clients = {}
        
        # Subscribe to Redis channels
        self.pubsub.subscribe('order_events')
        
        # Start Redis listener thread
        self.listener_thread = threading.Thread(target=self._listen_redis)
        self.listener_thread.start()
    
    def broadcast(self, event_type, data):
        # Publish to Redis (all server instances receive)
        self.redis_client.publish('order_events', json.dumps({
            'event_type': event_type,
            'data': data
        }))
    
    def _listen_redis(self):
        for message in self.pubsub.listen():
            if message['type'] == 'message':
                event = json.loads(message['data'])
                self._send_to_clients(event['event_type'], event['data'])
    
    def _send_to_clients(self, event_type, data):
        message = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
        dead_clients = []
        
        for client_id, response in self.clients.items():
            try:
                response.write(message)
            except:
                dead_clients.append(client_id)
        
        # Clean up dead connections
        for client_id in dead_clients:
            del self.clients[client_id]
```

**Solution B: Frontend Auto-Reconnect**
```typescript
// Dashboard.tsx
function Dashboard() {
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  
  useEffect(() => {
    const connectSSE = () => {
      const es = new EventSource('/api/admin/orders/stream');
      
      es.onopen = () => {
        console.log('SSE connected');
      };
      
      es.onerror = () => {
        console.log('SSE error, reconnecting in 3s...');
        es.close();
        setTimeout(connectSSE, 3000); // Auto-reconnect
      };
      
      es.addEventListener('order_created', (e) => {
        const data = JSON.parse(e.data);
        // Update UI
      });
      
      setEventSource(es);
    };
    
    connectSSE();
    
    return () => {
      eventSource?.close();
    };
  }, []);
}
```

**Implementation**:
- Redis Pub/Sub for multi-server event distribution
- Frontend auto-reconnect with exponential backoff
- Heartbeat mechanism (ping every 30s)
- Connection cleanup on error

---

### 3. 주문 상태 전이 검증

**Problem**:
관리자가 잘못된 상태 전이 수행 가능 (예: 전달완료 → 대기중)

**Solution**:
```python
# State Machine Definition
class OrderStatus(enum.Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    COOKED = "cooked"
    DELIVERED = "delivered"

ALLOWED_TRANSITIONS = {
    OrderStatus.PENDING: [OrderStatus.PREPARING],
    OrderStatus.PREPARING: [OrderStatus.COOKED],
    OrderStatus.COOKED: [OrderStatus.DELIVERED],
    OrderStatus.DELIVERED: []  # Final state
}

# UpdateOrderStatusService with validation
class UpdateOrderStatusService:
    def update_status(self, order_id: int, new_status: OrderStatus) -> Order:
        order = db.session.query(Order).get(order_id)
        
        if not order:
            raise OrderNotFoundError(f"Order {order_id} not found")
        
        current_status = OrderStatus(order.status)
        
        # Validate transition
        if new_status not in ALLOWED_TRANSITIONS[current_status]:
            raise InvalidStatusTransitionError(
                f"Cannot transition from {current_status.value} to {new_status.value}"
            )
        
        # Update status
        old_status = order.status
        order.status = new_status.value
        order.updated_at = datetime.now()
        
        # Record status history
        status_history = OrderStatusHistory(
            order_id=order_id,
            old_status=old_status,
            new_status=new_status.value,
            changed_by=get_current_admin_id(),
            changed_at=datetime.now()
        )
        db.session.add(status_history)
        
        db.session.commit()
        
        # Publish event
        EventBus.publish('OrderStatusChanged', {
            'order_id': order_id,
            'old_status': old_status,
            'new_status': new_status.value
        })
        
        return order

# New Model: OrderStatusHistory
class OrderStatusHistory(Base):
    __tablename__ = 'order_status_history'
    
    history_id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.order_id'))
    old_status = Column(String(20))
    new_status = Column(String(20))
    changed_by = Column(Integer, ForeignKey('admins.admin_id'))
    changed_at = Column(DateTime)
```

**Implementation**:
- State machine with explicit allowed transitions
- Validation before status update
- OrderStatusHistory table for audit trail
- Error handling with custom exceptions

---

## Additional Considerations

### 4. 이미지 파일 검증
```python
# CreateMenuService
def create_menu(self, store_id, menu_data, image_file):
    # Validate file size
    if image_file.size > 5 * 1024 * 1024:  # 5MB
        raise FileTooLargeError("Image must be less than 5MB")
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/webp']
    if image_file.content_type not in allowed_types:
        raise InvalidFileTypeError("Only JPEG, PNG, WEBP allowed")
    
    # Save image
    image_path = self.save_image(image_file)
    ...
```

### 5. JWT 토큰 갱신
```python
# AuthService
def refresh_token(self, old_token: str) -> str:
    payload = self.verify_jwt_token(old_token)
    
    # Check if token is close to expiry (within 1 hour)
    exp_time = datetime.fromtimestamp(payload['exp'])
    if datetime.now() + timedelta(hours=1) > exp_time:
        # Issue new token
        return self.generate_jwt_token(
            user_id=payload['user_id'],
            role=payload['role'],
            expiry_hours=16
        )
    
    return old_token
```

### 6. 에러 처리 전략
```python
# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    if isinstance(exc, InvalidStatusTransitionError):
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid status transition", "detail": str(exc)}
        )
    elif isinstance(exc, OrderNotFoundError):
        return JSONResponse(
            status_code=404,
            content={"error": "Order not found", "detail": str(exc)}
        )
    else:
        # Log unexpected errors
        logger.error(f"Unexpected error: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        )

# Transaction rollback
def create_order(self, ...):
    try:
        # Database operations
        order = Order(...)
        db.session.add(order)
        db.session.commit()
        
        # Publish event
        EventBus.publish('OrderCreated', {...})
        
        return order
    except Exception as e:
        db.session.rollback()
        raise
```

---

## Priority Implementation Order

1. **High Priority** (구현 필수):
   - 테이블 세션 동시성 해결 (Unique Constraint + Locking)
   - 주문 상태 전이 검증 (State Machine)
   - 에러 처리 및 롤백 전략

2. **Medium Priority** (운영 전 필수):
   - SSE 확장성 (Redis Pub/Sub)
   - Frontend SSE 자동 재연결
   - 이미지 파일 검증

3. **Low Priority** (개선 사항):
   - JWT 토큰 갱신
   - OrderStatusHistory 테이블
   - Heartbeat 메커니즘

