# Services - 테이블오더 서비스

## Overview
서비스 레이어 구조 및 오케스트레이션 패턴을 정의합니다.

**Service Granularity**: 작은 단위 (기능별 서비스)
**Communication Pattern**: 이벤트 기반 (EventBus)

---

## Service Architecture

### 1. Service Layer Structure

```
Controllers
    ↓
Services (작은 단위, 기능별)
    ↓
ORM (SQLAlchemy 직접 사용)
    ↓
Database (PostgreSQL)
```

**특징**:
- Repository 패턴 없음 (ORM 직접 사용)
- 각 서비스는 단일 기능에 집중
- 서비스 간 통신은 EventBus 사용

---

## Service Catalog

### Customer Services

#### AuthenticationService
**Responsibility**: 모든 사용자 타입의 인증 처리
**Dependencies**: AuthService (JWT, bcrypt), Table, Admin (ORM)
**Events Published**: None
**Events Subscribed**: None
**Methods**:
- authenticate_table(store_id, table_number, password) → {token, table_id}
- authenticate_admin(store_id, username, password) → {token, admin_id, role}
- authenticate_super_admin(username, password) → {token, admin_id, role}

#### MenuService
**Responsibility**: 메뉴 CRUD 및 이미지 관리
**Dependencies**: Menu, MenuCategory (ORM), File System
**Events Published**: None
**Events Subscribed**: None
**Methods**:
- get_menus(category_id) → List[Menu]
- get_menu_detail(menu_id) → Menu
- create_menu(menu_data, image_file) → Menu
- update_menu(menu_id, menu_data, image_file) → Menu
- delete_menu(menu_id) → bool

#### CreateOrderService
**Responsibility**: 주문 생성
**Dependencies**: Order, OrderItem, TableSession (ORM), EventBus
**Events Published**: `OrderCreated`
**Events Subscribed**: None

#### OrderQueryService
**Responsibility**: 활성 세션 주문 조회
**Dependencies**: Order, OrderItem (ORM)
**Events Published**: None
**Events Subscribed**: None
**Note**: 현재 진행 중인 세션의 주문만 조회

---

### Admin Services

#### UpdateOrderStatusService
**Responsibility**: 주문 상태 변경
**Dependencies**: Order (ORM), EventBus
**Events Published**: `OrderStatusChanged`
**Events Subscribed**: None

#### DeleteOrderService
**Responsibility**: 주문 삭제
**Dependencies**: Order, OrderItem (ORM)
**Events Published**: None
**Events Subscribed**: None

#### CompleteTableSessionService
**Responsibility**: 테이블 세션 종료
**Dependencies**: TableSession, Order, OrderHistory (ORM)
**Events Published**: None
**Events Subscribed**: None
**Transaction**: Multi-step with rollback on failure

#### OrderHistoryQueryService
**Responsibility**: 완료된 세션 주문 조회
**Dependencies**: OrderHistory (ORM)
**Events Published**: None
**Events Subscribed**: None
**Note**: 과거 완료된 세션의 주문 이력 조회

---

### SuperAdmin Services

#### ManageAdminService
**Responsibility**: 관리자 계정 관리
**Dependencies**: Admin (ORM), AuthService (password hashing)
**Events Published**: None
**Events Subscribed**: None
**Methods**:
- create_admin(username, password) → Admin
- activate_admin(admin_id) → Admin
- deactivate_admin(admin_id) → Admin
- get_all_admins() → List[Admin]

---

## Service Orchestration Patterns

### Pattern 1: Simple Service Call
**Used by**: 대부분의 조회 서비스

```
Controller → Service → ORM → Database
```

**Example**: MenuQueryService
```python
# Controller
@router.get("/menus")
def get_menus(category_id: int = None):
    return MenuQueryService().get_menus_by_category(category_id)

# Service
class MenuQueryService:
    def get_menus_by_category(self, category_id):
        query = db.session.query(Menu)
        if category_id:
            query = query.filter_by(category_id=category_id)
        return query.all()
```

---

### Pattern 2: Event-Driven Service
**Used by**: CreateOrderService, UpdateOrderStatusService

```
Controller → Service → ORM → Database
                ↓
            EventBus → SSEPublisher → SSE Clients
```

**Example**: CreateOrderService
```python
# Service
class CreateOrderService:
    def create_order(self, session_id, table_id, store_id, items):
        # 1. Create order in database
        order = Order(session_id=session_id, ...)
        db.session.add(order)
        db.session.commit()
        
        # 2. Publish event
        EventBus.publish('OrderCreated', {
            'order_id': order.order_id,
            'table_id': table_id,
            'total_amount': order.total_amount
        })
        
        return order

# SSEPublisher (subscribes to EventBus)
class SSEPublisher:
    def __init__(self):
        EventBus.subscribe('OrderCreated', self.on_order_created)
        EventBus.subscribe('OrderStatusChanged', self.on_status_changed)
    
    def on_order_created(self, data):
        self.broadcast('order_created', data)
    
    def on_status_changed(self, data):
        self.broadcast('order_status_changed', data)
```

---

### Pattern 3: Multi-Step Service
**Used by**: CompleteTableSessionService

```
Controller → Service → Multiple ORM Operations → Database
```

**Example**: CompleteTableSessionService
```python
class CompleteTableSessionService:
    def complete_session(self, table_id, session_id):
        try:
            # Start transaction
            with db.session.begin_nested():
                # 1. End session
                session = db.session.query(TableSession).get(session_id)
                session.end_time = datetime.now()
                session.status = 'completed'
                
                # 2. Move orders to history
                orders = db.session.query(Order).filter_by(session_id=session_id).all()
                for order in orders:
                    history = OrderHistory(
                        session_id=session_id,
                        order_id=order.order_id,
                        completed_at=datetime.now(),
                        ...
                    )
                    db.session.add(history)
                
                # 3. Commit transaction
                db.session.commit()
            
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to complete session: {e}")
            raise

**Transaction Management**:
- Use database transaction (BEGIN/COMMIT/ROLLBACK)
- Rollback on any step failure
- Log errors for debugging
- Ensure atomicity of multi-step operations
```

---

### Pattern 4: File Upload Service
**Used by**: CreateMenuService, UpdateMenuService

```
Controller → Service → File System + ORM → Database
```

**Example**: CreateMenuService
```python
class CreateMenuService:
    def create_menu(self, store_id, menu_data, image_file):
        # 1. Save image file
        image_path = self.save_image(image_file)
        
        # 2. Create menu record
        menu = Menu(
            store_id=store_id,
            menu_name=menu_data.name,
            image_path=image_path,
            ...
        )
        db.session.add(menu)
        db.session.commit()
        
        return menu
    
    def save_image(self, image_file):
        filename = f"{uuid.uuid4()}.jpg"
        filepath = f"/uploads/menus/{filename}"
        with open(filepath, "wb") as f:
            f.write(image_file.read())
        return filepath
```

---

## Event Bus Design

### Event Types
```python
class EventType:
    ORDER_CREATED = "OrderCreated"
    ORDER_STATUS_CHANGED = "OrderStatusChanged"
```

### Event Data Structure
```python
# OrderCreated
{
    "order_id": int,
    "table_id": int,
    "store_id": UUID,
    "total_amount": Decimal,
    "created_at": datetime
}

# OrderStatusChanged
{
    "order_id": int,
    "old_status": str,
    "new_status": str,
    "updated_at": datetime
}
```

### EventBus Implementation
```python
class EventBus:
    _subscribers = {}
    
    @classmethod
    def publish(cls, event_type: str, data: dict):
        if event_type in cls._subscribers:
            for callback in cls._subscribers[event_type]:
                callback(data)
    
    @classmethod
    def subscribe(cls, event_type: str, callback: Callable):
        if event_type not in cls._subscribers:
            cls._subscribers[event_type] = []
        cls._subscribers[event_type].append(callback)
```

---

## SSE Publisher Design

### SSE Stream Management
```python
class SSEPublisher:
    def __init__(self):
        self.clients = {}  # {client_id: StreamingResponse}
        EventBus.subscribe('OrderCreated', self.on_order_created)
        EventBus.subscribe('OrderStatusChanged', self.on_status_changed)
    
    def add_client(self, client_id: str, response: StreamingResponse):
        self.clients[client_id] = response
    
    def remove_client(self, client_id: str):
        if client_id in self.clients:
            del self.clients[client_id]
    
    def broadcast(self, event_type: str, data: dict):
        message = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
        for client_id, response in self.clients.items():
            try:
                response.write(message)
            except:
                self.remove_client(client_id)
    
    def on_order_created(self, data):
        self.broadcast('order_created', data)
    
    def on_status_changed(self, data):
        self.broadcast('order_status_changed', data)
```

---

## Service Interaction Examples

### Example 1: Customer Orders Food
```
1. Customer clicks "주문하기"
2. Frontend → POST /api/customer/orders
3. CustomerController → CreateOrderService
4. CreateOrderService:
   - Create Order + OrderItems in DB
   - Publish OrderCreated event
5. EventBus → SSEPublisher
6. SSEPublisher → Broadcast to all admin SSE clients
7. Admin dashboard updates in real-time
```

### Example 2: Admin Changes Order Status
```
1. Admin clicks "준비중" button
2. Frontend → PATCH /api/admin/orders/{id}/status
3. AdminController → UpdateOrderStatusService
4. UpdateOrderStatusService:
   - Update Order status in DB
   - Publish OrderStatusChanged event
5. EventBus → SSEPublisher
6. SSEPublisher → Broadcast to all admin SSE clients
7. All admin dashboards update
8. (Optional) Customer polling picks up status change
```

### Example 3: Admin Completes Table Session
```
1. Admin clicks "이용 완료"
2. Frontend → POST /api/admin/tables/{id}/complete-session
3. AdminController → CompleteTableSessionService
4. CompleteTableSessionService:
   - End TableSession
   - Move Orders to OrderHistory
   - Commit transaction
5. Return success
```

---

## Summary

### Service Count
- **Customer Services**: 4 (AuthenticationService, MenuService, CreateOrderService, OrderQueryService)
- **Admin Services**: 4 (UpdateOrderStatusService, DeleteOrderService, CompleteTableSessionService, OrderHistoryQueryService)
- **SuperAdmin Services**: 1 (ManageAdminService)
- **Total**: 9 services (통합 후)

### Service Changes
- **통합된 서비스**:
  - AuthenticationService: TableLoginService + AdminLoginService + SuperAdminLoginService 통합
  - MenuService: MenuQueryService + CreateMenuService + UpdateMenuService + DeleteMenuService 통합
  - ManageAdminService: CreateAdminService + ManageAdminService 통합
- **명확화된 서비스**:
  - OrderQueryService: 활성 세션 주문 조회로 명확화
  - OrderHistoryQueryService: 완료된 세션 주문 조회로 명확화

### Key Patterns
- **Simple Service Call**: 조회 서비스 (MenuService, OrderQueryService, OrderHistoryQueryService)
- **Event-Driven**: 주문 생성, 상태 변경 (CreateOrderService, UpdateOrderStatusService)
- **Multi-Step with Transaction**: 세션 종료 (CompleteTableSessionService)
- **File Upload**: 메뉴 이미지 관리 (MenuService)

### Communication
- **Synchronous**: Controller → Service → ORM
- **Asynchronous**: EventBus → SSEPublisher → SSE Clients

### Benefits
- **DRY 원칙 준수**: 중복 로직 제거 (인증, 메뉴 CRUD)
- **응집도 향상**: 관련 기능을 하나의 서비스로 통합
- **트랜잭션 관리**: Multi-step 작업의 원자성 보장
- **이벤트 기반**: 실시간 업데이트, 느슨한 결합
