# Business Logic Model - Unit 1: Backend API & Database

## Overview

테이블오더 서비스의 비즈니스 로직은 9개의 서비스 컴포넌트로 구성됩니다. 각 서비스는 단일 책임 원칙을 따르며, 트랜잭션 경계를 명확히 정의합니다.

---

## Service Architecture

```
Controllers (API Layer)
    |
    v
Services (Business Logic Layer)
    |
    v
ORM Models (Data Access Layer)
    |
    v
PostgreSQL Database
```

**Event Flow**:
```
Service → EventBus → SSEPublisher → Admin Clients (SSE)
```

---

## Service Components

### 1. AuthenticationService

**Purpose**: 모든 사용자 인증 처리 (테이블, 관리자, 슈퍼 관리자)

#### Methods

##### 1.1 authenticateTable(table_number, password, store_id)

**Input**:
- `table_number` (String): 테이블 번호
- `password` (String): 테이블 비밀번호 (평문)
- `store_id` (UUID): 매장 ID

**Output**:
- `token` (String): JWT 토큰
- `session_id` (Integer): 테이블 세션 ID
- `table_id` (Integer): 테이블 ID

**Business Logic**:
1. Table 조회 (store_id, table_number)
2. 비밀번호 검증 (bcrypt.verify)
3. 활성 TableSession 조회 (SELECT FOR UPDATE)
4. 활성 세션이 있으면:
   - 기존 세션 재사용
5. 활성 세션이 없으면:
   - 기존 활성 세션 자동 종료 (is_active=False, ended_at=now)
   - 신규 TableSession 생성 (started_at=now, is_active=True)
6. JWT 토큰 생성 (payload: table_id, session_id, role='table', exp=16h)
7. 반환

**Transaction Scope**: 전체 (세션 생성 + 토큰 발급)

**Error Cases**:
- `TABLE_NOT_FOUND`: 테이블이 존재하지 않음
- `INVALID_PASSWORD`: 비밀번호 불일치

---

##### 1.2 authenticateAdmin(username, password, store_id)

**Input**:
- `username` (String): 관리자 사용자명
- `password` (String): 비밀번호 (평문)
- `store_id` (UUID): 매장 ID

**Output**:
- `token` (String): JWT 토큰
- `admin_id` (Integer): 관리자 ID
- `role` (String): 역할 ('store_admin')

**Business Logic**:
1. Admin 조회 (username, store_id, role='store_admin')
2. is_active 확인 (False면 에러)
3. 비밀번호 검증 (bcrypt.verify)
4. JWT 토큰 생성 (payload: admin_id, store_id, role='store_admin', exp=16h)
5. 반환

**Transaction Scope**: Read-only (조회만)

**Error Cases**:
- `ADMIN_NOT_FOUND`: 관리자가 존재하지 않음
- `ADMIN_INACTIVE`: 비활성화된 계정
- `INVALID_PASSWORD`: 비밀번호 불일치

---

##### 1.3 authenticateSuperAdmin(username, password)

**Input**:
- `username` (String): 슈퍼 관리자 사용자명
- `password` (String): 비밀번호 (평문)

**Output**:
- `token` (String): JWT 토큰
- `admin_id` (Integer): 관리자 ID
- `role` (String): 역할 ('super_admin')

**Business Logic**:
1. Admin 조회 (username, role='super_admin')
2. is_active 확인
3. 비밀번호 검증
4. JWT 토큰 생성 (payload: admin_id, role='super_admin', exp=16h)
5. 반환

**Transaction Scope**: Read-only

**Error Cases**:
- `SUPER_ADMIN_NOT_FOUND`: 슈퍼 관리자가 존재하지 않음
- `ADMIN_INACTIVE`: 비활성화된 계정
- `INVALID_PASSWORD`: 비밀번호 불일치

---

### 2. MenuService

**Purpose**: 메뉴 CRUD 관리

#### Methods

##### 2.1 getMenusByCategory(category_id, store_id)

**Input**:
- `category_id` (Integer, Optional): 카테고리 ID (NULL이면 전체)
- `store_id` (UUID): 매장 ID

**Output**:
- `menus` (List[Menu]): 메뉴 목록

**Business Logic**:
1. MenuCategory 조회 (store_id 필터링)
2. Menu 조회 (category_id, display_order ASC)
3. 반환

**Transaction Scope**: Read-only

---

##### 2.2 getMenuById(menu_id, store_id)

**Input**:
- `menu_id` (Integer): 메뉴 ID
- `store_id` (UUID): 매장 ID

**Output**:
- `menu` (Menu): 메뉴 상세

**Business Logic**:
1. Menu 조회 (menu_id)
2. MenuCategory 조회 (store_id 검증)
3. 반환

**Transaction Scope**: Read-only

**Error Cases**:
- `MENU_NOT_FOUND`: 메뉴가 존재하지 않음
- `UNAUTHORIZED`: 다른 매장의 메뉴

---

##### 2.3 createMenu(category_id, name, description, price, image_file, store_id)

**Input**:
- `category_id` (Integer): 카테고리 ID
- `name` (String): 메뉴 이름
- `description` (String, Optional): 설명
- `price` (Decimal): 가격
- `image_file` (UploadFile, Optional): 이미지 파일
- `store_id` (UUID): 매장 ID

**Output**:
- `menu` (Menu): 생성된 메뉴

**Business Logic**:
1. MenuCategory 조회 (category_id, store_id 검증)
2. 이미지 파일 저장 (if image_file):
   - UUID 생성
   - 파일명: `{uuid}.{extension}`
   - 저장 경로: `/uploads/menus/{uuid}.{extension}`
   - image_path: `/uploads/menus/{uuid}.{extension}`
3. Menu 생성 (name, description, price, image_path, category_id)
4. display_order: 카테고리 내 최대값 + 1
5. DB 저장
6. 반환

**Transaction Scope**: 전체 (파일 저장 + DB 저장)

**Error Cases**:
- `CATEGORY_NOT_FOUND`: 카테고리가 존재하지 않음
- `INVALID_PRICE`: 가격이 0 이하
- `IMAGE_UPLOAD_FAILED`: 이미지 저장 실패

---

##### 2.4 updateMenu(menu_id, name, description, price, image_file, is_available, store_id)

**Input**:
- `menu_id` (Integer): 메뉴 ID
- `name` (String, Optional): 메뉴 이름
- `description` (String, Optional): 설명
- `price` (Decimal, Optional): 가격
- `image_file` (UploadFile, Optional): 이미지 파일
- `is_available` (Boolean, Optional): 품절 여부
- `store_id` (UUID): 매장 ID

**Output**:
- `menu` (Menu): 수정된 메뉴

**Business Logic**:
1. Menu 조회 (menu_id)
2. MenuCategory 조회 (store_id 검증)
3. 이미지 파일 저장 (if image_file):
   - 기존 이미지 삭제
   - 신규 이미지 저장
4. Menu 업데이트 (변경된 필드만)
5. DB 저장
6. 반환

**Transaction Scope**: 전체

**Error Cases**:
- `MENU_NOT_FOUND`: 메뉴가 존재하지 않음
- `UNAUTHORIZED`: 다른 매장의 메뉴

---

##### 2.5 deleteMenu(menu_id, store_id)

**Input**:
- `menu_id` (Integer): 메뉴 ID
- `store_id` (UUID): 매장 ID

**Output**:
- `success` (Boolean): 삭제 성공 여부

**Business Logic**:
1. Menu 조회 (menu_id)
2. MenuCategory 조회 (store_id 검증)
3. OrderItem 존재 여부 확인
4. OrderItem이 있으면:
   - 에러 반환 (MENU_IN_USE)
   - 대안: is_available=False로 변경 권장
5. OrderItem이 없으면:
   - 이미지 파일 삭제
   - Menu 삭제
6. 반환

**Transaction Scope**: 전체

**Error Cases**:
- `MENU_NOT_FOUND`: 메뉴가 존재하지 않음
- `MENU_IN_USE`: 주문 항목에 사용 중 (삭제 불가)

---

##### 2.6 reorderMenus(menu_orders, store_id) [Post-MVP]

**Input**:
- `menu_orders` (List[{menu_id, display_order}]): 메뉴 순서 목록
- `store_id` (UUID): 매장 ID

**Output**:
- `success` (Boolean): 성공 여부

**Business Logic**:
1. 모든 Menu 조회 (menu_id IN menu_orders)
2. MenuCategory 조회 (store_id 검증)
3. 카테고리별로 display_order 업데이트
4. DB 저장 (트랜잭션)
5. 반환

**Transaction Scope**: 전체

**Design Decision**:
- display_order는 카테고리별로 독립적 (같은 카테고리 내에서만 순서 조정)

---

### 3. CreateOrderService

**Purpose**: 주문 생성 및 이벤트 발행

#### Methods

##### 3.1 createOrder(session_id, items)

**Input**:
- `session_id` (Integer): 테이블 세션 ID
- `items` (List[{menu_id, quantity}]): 주문 항목 목록

**Output**:
- `order` (Order): 생성된 주문

**Business Logic**:
1. **검증**:
   - TableSession 조회 (session_id, is_active=True)
   - items가 1개 이상인지 확인
   - 각 Menu 조회 (menu_id, is_available=True)
   - quantity > 0 확인
2. **주문 생성** (트랜잭션 시작):
   - Order 생성 (table_session_id, status='pending', total_price=0)
   - OrderItem 생성 (N개):
     - menu_name, unit_price 스냅샷 저장
     - subtotal = quantity * unit_price
   - total_price 계산 (SUM(subtotal))
   - Order.total_price 업데이트
   - DB Commit
3. **이벤트 발행** (트랜잭션 외부):
   - EventBus.publish('OrderCreated', payload)
4. 반환

**Transaction Scope**: 
- DB 작업: 트랜잭션 내부
- 이벤트 발행: 트랜잭션 외부 (커밋 후)

**Event Payload** (OrderCreated):
```json
{
  "event_type": "OrderCreated",
  "order_id": 123,
  "table_id": 5,
  "table_number": "1",
  "store_id": "uuid",
  "items": [
    {"menu_name": "김치찌개", "quantity": 2, "unit_price": 8000}
  ],
  "total_price": 16000,
  "status": "pending",
  "created_at": "2026-02-09T15:00:00Z"
}
```

**Error Cases**:
- `SESSION_NOT_FOUND`: 세션이 존재하지 않음
- `SESSION_INACTIVE`: 세션이 비활성 상태
- `EMPTY_ORDER`: 주문 항목이 비어있음
- `MENU_NOT_FOUND`: 메뉴가 존재하지 않음
- `MENU_NOT_AVAILABLE`: 메뉴가 품절 상태
- `INVALID_QUANTITY`: 수량이 0 이하

---

### 4. OrderQueryService

**Purpose**: 활성 세션 주문 조회

#### Methods

##### 4.1 getOrdersBySession(session_id)

**Input**:
- `session_id` (Integer): 테이블 세션 ID

**Output**:
- `orders` (List[Order]): 주문 목록 (OrderItem 포함)

**Business Logic**:
1. TableSession 조회 (session_id, is_active=True)
2. Order 조회 (table_session_id, created_at DESC)
3. OrderItem 조회 (eager loading)
4. 반환

**Transaction Scope**: Read-only

**Error Cases**:
- `SESSION_NOT_FOUND`: 세션이 존재하지 않음

---

##### 4.2 getOrdersByTable(table_id, store_id)

**Input**:
- `table_id` (Integer): 테이블 ID
- `store_id` (UUID): 매장 ID

**Output**:
- `orders` (List[Order]): 주문 목록

**Business Logic**:
1. Table 조회 (table_id, store_id 검증)
2. 활성 TableSession 조회 (table_id, is_active=True)
3. Order 조회 (table_session_id, created_at DESC)
4. 반환

**Transaction Scope**: Read-only

---

### 5. UpdateOrderStatusService

**Purpose**: 주문 상태 변경 및 이벤트 발행

#### Methods

##### 5.1 updateOrderStatus(order_id, new_status, store_id)

**Input**:
- `order_id` (Integer): 주문 ID
- `new_status` (String): 새 상태
- `store_id` (UUID): 매장 ID

**Output**:
- `order` (Order): 수정된 주문

**Business Logic**:
1. **검증**:
   - Order 조회 (order_id)
   - TableSession 조회 (store_id 검증)
   - 상태 전이 검증 (State Machine)
2. **상태 업데이트** (트랜잭션):
   - old_status 저장
   - Order.status = new_status
   - Order.updated_at = now()
   - DB Commit
3. **이벤트 발행** (트랜잭션 외부):
   - EventBus.publish('OrderStatusChanged', payload)
4. 반환

**Transaction Scope**:
- DB 작업: 트랜잭션 내부
- 이벤트 발행: 트랜잭션 외부

**State Machine** (허용되는 상태 전이):
```
pending → preparing, cancelled
preparing → ready, cancelled
ready → served
served → (종료 상태, 변경 불가)
cancelled → (종료 상태, 변경 불가)
```

**Event Payload** (OrderStatusChanged):
```json
{
  "event_type": "OrderStatusChanged",
  "order_id": 123,
  "table_id": 5,
  "table_number": "1",
  "store_id": "uuid",
  "old_status": "pending",
  "new_status": "preparing",
  "updated_at": "2026-02-09T15:05:00Z"
}
```

**Error Cases**:
- `ORDER_NOT_FOUND`: 주문이 존재하지 않음
- `INVALID_STATUS_TRANSITION`: 허용되지 않는 상태 전이
- `UNAUTHORIZED`: 다른 매장의 주문

---

### 6. DeleteOrderService

**Purpose**: 주문 삭제

#### Methods

##### 6.1 deleteOrder(order_id, store_id)

**Input**:
- `order_id` (Integer): 주문 ID
- `store_id` (UUID): 매장 ID

**Output**:
- `success` (Boolean): 삭제 성공 여부

**Business Logic**:
1. Order 조회 (order_id)
2. TableSession 조회 (store_id 검증)
3. 상태 확인:
   - served 또는 cancelled 상태면 삭제 불가 (에러)
4. Order 삭제 (CASCADE로 OrderItem도 삭제)
5. 반환

**Transaction Scope**: 전체

**Delete Restriction**:
- `served`, `cancelled` 상태는 삭제 불가 (이미 완료된 주문)
- `pending`, `preparing`, `ready` 상태만 삭제 가능

**Error Cases**:
- `ORDER_NOT_FOUND`: 주문이 존재하지 않음
- `ORDER_CANNOT_DELETE`: 완료된 주문은 삭제 불가
- `UNAUTHORIZED`: 다른 매장의 주문

---

### 7. CompleteTableSessionService

**Purpose**: 테이블 세션 종료 및 주문 히스토리 이동

#### Methods

##### 7.1 completeSession(table_id, store_id)

**Input**:
- `table_id` (Integer): 테이블 ID
- `store_id` (UUID): 매장 ID

**Output**:
- `session` (TableSession): 종료된 세션
- `archived_orders_count` (Integer): 이동된 주문 수

**Business Logic**:
1. **검증**:
   - Table 조회 (table_id, store_id 검증)
   - 활성 TableSession 조회 (SELECT FOR UPDATE)
   - 미완료 주문 확인:
     - pending, preparing 상태 주문이 있으면 경고 (하지만 진행 가능)
2. **히스토리 이동** (트랜잭션):
   - 모든 Order 조회 (table_session_id)
   - 각 Order에 대해:
     - OrderHistory 생성 (Order 데이터 복사)
     - OrderHistoryItem 생성 (OrderItem 데이터 복사)
     - OrderItem 삭제
     - Order 삭제
   - TableSession 업데이트:
     - is_active = False
     - ended_at = now()
   - DB Commit
3. 반환

**Transaction Scope**: 전체 (대용량 트랜잭션 주의)

**Design Decision**:
- 미완료 주문도 히스토리로 이동 가능 (관리자 판단)
- OrderHistory 스키마는 Order와 동일 (정규화, JSON 아님)

**Error Cases**:
- `TABLE_NOT_FOUND`: 테이블이 존재하지 않음
- `SESSION_NOT_FOUND`: 활성 세션이 없음
- `UNAUTHORIZED`: 다른 매장의 테이블

---

### 8. OrderHistoryQueryService

**Purpose**: 완료된 세션 주문 조회

#### Methods

##### 8.1 getOrderHistory(table_id, from_date, to_date, store_id)

**Input**:
- `table_id` (Integer): 테이블 ID
- `from_date` (Date, Optional): 시작 날짜
- `to_date` (Date, Optional): 종료 날짜
- `store_id` (UUID): 매장 ID

**Output**:
- `order_histories` (List[OrderHistory]): 히스토리 목록

**Business Logic**:
1. Table 조회 (table_id, store_id 검증)
2. 종료된 TableSession 조회 (table_id, is_active=False)
3. OrderHistory 조회:
   - table_session_id IN (sessions)
   - archived_at BETWEEN from_date AND to_date
   - archived_at DESC
4. OrderHistoryItem 조회 (eager loading)
5. 반환

**Transaction Scope**: Read-only

**Pagination**: 
- 기본 페이지 크기: 50개
- Offset-based pagination (page, page_size)

**Error Cases**:
- `TABLE_NOT_FOUND`: 테이블이 존재하지 않음
- `UNAUTHORIZED`: 다른 매장의 테이블

---

### 9. ManageAdminService

**Purpose**: 관리자 계정 관리 (슈퍼 관리자 전용)

#### Methods

##### 9.1 createAdmin(store_id, username, password, role)

**Input**:
- `store_id` (UUID, Optional): 매장 ID (store_admin만)
- `username` (String): 사용자명
- `password` (String): 비밀번호 (평문)
- `role` (String): 역할 ('store_admin', 'super_admin')

**Output**:
- `admin` (Admin): 생성된 관리자

**Business Logic**:
1. **검증**:
   - username 중복 확인
   - role='store_admin'이면 store_id 필수
   - Store 조회 (if store_id)
2. **계정 생성**:
   - password_hash = bcrypt.hash(password)
   - Admin 생성 (username, password_hash, role, store_id, is_active=True)
   - DB 저장
3. 반환

**Transaction Scope**: 전체

**Error Cases**:
- `USERNAME_ALREADY_EXISTS`: 사용자명 중복
- `STORE_NOT_FOUND`: 매장이 존재하지 않음
- `INVALID_ROLE`: 잘못된 역할

---

##### 9.2 getAllAdmins()

**Input**: None

**Output**:
- `admins` (List[Admin]): 관리자 목록

**Business Logic**:
1. Admin 조회 (전체, created_at DESC)
2. Store 조회 (eager loading)
3. 반환

**Transaction Scope**: Read-only

---

##### 9.3 activateAdmin(admin_id)

**Input**:
- `admin_id` (Integer): 관리자 ID

**Output**:
- `admin` (Admin): 활성화된 관리자

**Business Logic**:
1. Admin 조회 (admin_id)
2. is_active = True
3. DB 저장
4. 반환

**Transaction Scope**: 전체

**Error Cases**:
- `ADMIN_NOT_FOUND`: 관리자가 존재하지 않음

---

##### 9.4 deactivateAdmin(admin_id)

**Input**:
- `admin_id` (Integer): 관리자 ID

**Output**:
- `admin` (Admin): 비활성화된 관리자

**Business Logic**:
1. Admin 조회 (admin_id)
2. is_active = False
3. DB 저장
4. 반환

**Transaction Scope**: 전체

**Error Cases**:
- `ADMIN_NOT_FOUND`: 관리자가 존재하지 않음

---

## Infrastructure Components

### EventBus

**Purpose**: 이벤트 발행/구독 (In-memory, Redis Pub/Sub for production)

**Methods**:
- `publish(event_type, payload)`: 이벤트 발행
- `subscribe(event_type, callback)`: 이벤트 구독

**Implementation**:
- In-memory: Python dict + asyncio Queue
- Production: Redis Pub/Sub

**Event Types**:
- `OrderCreated`
- `OrderStatusChanged`

---

### SSEPublisher

**Purpose**: EventBus 구독 → SSE 스트림 발행

**Methods**:
- `subscribe()`: EventBus 구독 시작
- `stream(store_id)`: SSE 스트림 생성 (매장별 필터링)

**Implementation**:
- FastAPI StreamingResponse
- EventBus 구독 → 이벤트 수신 → SSE 클라이언트에 전송

**Connection Management**:
- 관리자별 독립적 연결 (각 관리자는 자신의 매장 이벤트만 수신)
- 연결 타임아웃: 무제한 (keep-alive)
- 재연결: 클라이언트 책임

---

## Transaction Patterns

### Pattern 1: Read-Only
```python
async def get_data():
    # No transaction needed
    data = await db.query(Model).all()
    return data
```

### Pattern 2: Simple Write
```python
async def create_data():
    async with db.transaction():
        model = Model(...)
        db.add(model)
        await db.commit()
    return model
```

### Pattern 3: Write + Event (Recommended)
```python
async def create_order():
    # Transaction
    async with db.transaction():
        order = Order(...)
        db.add(order)
        await db.commit()
    
    # Event (outside transaction)
    event_bus.publish('OrderCreated', payload)
    return order
```

### Pattern 4: Complex Transaction
```python
async def complete_session():
    async with db.transaction():
        session = await db.query(TableSession).with_for_update().first()
        orders = await db.query(Order).filter(...).all()
        
        for order in orders:
            history = OrderHistory(...)
            db.add(history)
            db.delete(order)
        
        session.is_active = False
        await db.commit()
    return session
```

---

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_ORDER",
    "message": "주문 항목이 비어있습니다.",
    "details": {
      "field": "items",
      "reason": "empty_list"
    }
  }
}
```

### Error Code Naming
- **Convention**: UPPER_SNAKE_CASE
- **Examples**: `MENU_NOT_FOUND`, `INVALID_STATUS_TRANSITION`, `SESSION_INACTIVE`

### HTTP Status Codes
- `400`: 클라이언트 입력 오류 (INVALID_ORDER, EMPTY_ORDER)
- `401`: 인증 실패 (INVALID_PASSWORD, TOKEN_EXPIRED)
- `403`: 권한 없음 (UNAUTHORIZED)
- `404`: 리소스 없음 (MENU_NOT_FOUND, ORDER_NOT_FOUND)
- `409`: 충돌 (USERNAME_ALREADY_EXISTS, MENU_IN_USE)
- `500`: 서버 오류 (INTERNAL_ERROR)

---

## JWT Token Management

### Token Payload
```json
{
  "user_id": 123,
  "role": "table",
  "session_id": 456,
  "store_id": "uuid",
  "exp": 1234567890
}
```

### Token Expiry
- **Expiration**: 16 hours
- **Refresh**: No refresh token (재로그인 필요)
- **Handling**: 401 Unauthorized 반환 시 클라이언트가 재로그인

---

## Summary

### Service Count
- **Core Services**: 9개
- **Infrastructure Components**: 2개 (EventBus, SSEPublisher)

### Key Design Patterns
1. **Transaction Boundary**: 명확한 트랜잭션 범위 정의
2. **Event-Driven**: 트랜잭션 외부에서 이벤트 발행
3. **Snapshot Pattern**: OrderItem에 menu_name, unit_price 저장
4. **State Machine**: 주문 상태 전이 검증
5. **Concurrency Control**: SELECT FOR UPDATE로 세션 동시성 제어
6. **Multi-tenant**: store_id로 매장별 데이터 격리

---

**End of Business Logic Model Document**
