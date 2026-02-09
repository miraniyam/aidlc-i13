# Domain Entities - Unit 1: Backend API & Database

## Overview

테이블오더 서비스의 도메인 엔티티는 9개의 핵심 모델로 구성됩니다. 모든 엔티티는 SQLAlchemy ORM을 사용하여 PostgreSQL에 매핑됩니다.

---

## Entity Relationship Diagram (Text)

```
Store (1) ----< (N) Admin
Store (1) ----< (N) Table
Store (1) ----< (N) MenuCategory

Table (1) ----< (N) TableSession
TableSession (1) ----< (N) Order
TableSession (1) ----< (N) OrderHistory

MenuCategory (1) ----< (N) Menu
Menu (N) ----< (N) OrderItem >---- (1) Order
Menu (N) ----< (N) OrderHistoryItem >---- (1) OrderHistory

Order (1) ----< (N) OrderItem
OrderHistory (1) ----< (N) OrderHistoryItem
```

---

## Entity Definitions

### 1. Store (매장)

**Purpose**: 매장 정보 관리 (Multi-tenant 지원)

**Attributes**:
- `id` (UUID, PK): 매장 고유 식별자
- `name` (String, NOT NULL): 매장 이름
- `created_at` (DateTime, NOT NULL): 생성 시각
- `updated_at` (DateTime, NOT NULL): 수정 시각

**Relationships**:
- `admins` (1:N): 매장 관리자 목록
- `tables` (1:N): 매장 테이블 목록
- `menu_categories` (1:N): 매장 메뉴 카테고리 목록

**Constraints**:
- PK: `id`

**Indexes**:
- None (매장 수가 적으므로 불필요)

---

### 2. Admin (관리자)

**Purpose**: 관리자 계정 관리 (매장 관리자, 슈퍼 관리자)

**Attributes**:
- `id` (Integer, PK, Auto-increment): 관리자 ID
- `store_id` (UUID, FK, NULLABLE): 매장 ID (슈퍼 관리자는 NULL)
- `username` (String, NOT NULL, UNIQUE): 사용자명
- `password_hash` (String, NOT NULL): bcrypt 해시된 비밀번호
- `role` (Enum, NOT NULL): 역할 (`store_admin`, `super_admin`)
- `is_active` (Boolean, NOT NULL, DEFAULT=True): 활성화 여부
- `created_at` (DateTime, NOT NULL): 생성 시각
- `updated_at` (DateTime, NOT NULL): 수정 시각

**Relationships**:
- `store` (N:1): 소속 매장 (슈퍼 관리자는 NULL)

**Constraints**:
- PK: `id`
- UNIQUE: `username`
- FK: `store_id` → `Store.id` (ON DELETE SET NULL)
- CHECK: `role IN ('store_admin', 'super_admin')`
- CHECK: `role='store_admin' THEN store_id IS NOT NULL` (매장 관리자는 매장 필수)

**Indexes**:
- `idx_admin_username` (username): 로그인 조회 성능
- `idx_admin_store_id` (store_id): 매장별 관리자 조회

---

### 3. Table (테이블)

**Purpose**: 매장 내 물리적 테이블 정보

**Attributes**:
- `id` (Integer, PK, Auto-increment): 테이블 ID
- `store_id` (UUID, FK, NOT NULL): 매장 ID
- `table_number` (String, NOT NULL): 테이블 번호 (예: "1", "A-1")
- `password_hash` (String, NOT NULL): bcrypt 해시된 비밀번호 (고객 로그인용)
- `created_at` (DateTime, NOT NULL): 생성 시각
- `updated_at` (DateTime, NOT NULL): 수정 시각

**Relationships**:
- `store` (N:1): 소속 매장
- `sessions` (1:N): 테이블 세션 목록

**Constraints**:
- PK: `id`
- UNIQUE: `(store_id, table_number)` (매장 내 테이블 번호 유니크)
- FK: `store_id` → `Store.id` (ON DELETE CASCADE)

**Indexes**:
- `idx_table_store_id` (store_id): 매장별 테이블 조회
- `idx_table_store_table_number` (store_id, table_number): 테이블 인증 조회

---

### 4. TableSession (테이블 세션)

**Purpose**: 테이블 이용 세션 관리 (고객 입장 ~ 퇴장)

**Attributes**:
- `id` (Integer, PK, Auto-increment): 세션 ID
- `table_id` (Integer, FK, NOT NULL): 테이블 ID
- `started_at` (DateTime, NOT NULL): 세션 시작 시각
- `ended_at` (DateTime, NULLABLE): 세션 종료 시각
- `is_active` (Boolean, NOT NULL, DEFAULT=True): 활성 여부
- `created_at` (DateTime, NOT NULL): 생성 시각
- `updated_at` (DateTime, NOT NULL): 수정 시각

**Relationships**:
- `table` (N:1): 소속 테이블
- `orders` (1:N): 세션 내 주문 목록
- `order_histories` (1:N): 세션 종료 후 주문 히스토리

**Constraints**:
- PK: `id`
- FK: `table_id` → `Table.id` (ON DELETE CASCADE)
- CHECK: `ended_at IS NULL OR ended_at >= started_at` (종료 시각은 시작 시각 이후)
- CHECK: `is_active=False THEN ended_at IS NOT NULL` (비활성 세션은 종료 시각 필수)

**Indexes**:
- `idx_session_table_id` (table_id): 테이블별 세션 조회
- `idx_session_is_active` (is_active): 활성 세션 조회

**Concurrency Control**:
- Application-level lock: `SELECT FOR UPDATE` 사용
- 세션 생성 시 기존 활성 세션 자동 종료

---

### 5. MenuCategory (메뉴 카테고리)

**Purpose**: 메뉴 분류 (예: 메인, 사이드, 음료)

**Attributes**:
- `id` (Integer, PK, Auto-increment): 카테고리 ID
- `store_id` (UUID, FK, NOT NULL): 매장 ID
- `name` (String, NOT NULL): 카테고리 이름
- `display_order` (Integer, NOT NULL, DEFAULT=0): 노출 순서
- `created_at` (DateTime, NOT NULL): 생성 시각
- `updated_at` (DateTime, NOT NULL): 수정 시각

**Relationships**:
- `store` (N:1): 소속 매장
- `menus` (1:N): 카테고리 내 메뉴 목록

**Constraints**:
- PK: `id`
- UNIQUE: `(store_id, name)` (매장 내 카테고리 이름 유니크)
- FK: `store_id` → `Store.id` (ON DELETE CASCADE)

**Indexes**:
- `idx_category_store_id` (store_id): 매장별 카테고리 조회
- `idx_category_display_order` (store_id, display_order): 순서별 정렬

---

### 6. Menu (메뉴)

**Purpose**: 메뉴 정보 관리

**Attributes**:
- `id` (Integer, PK, Auto-increment): 메뉴 ID
- `category_id` (Integer, FK, NOT NULL): 카테고리 ID
- `name` (String, NOT NULL): 메뉴 이름
- `description` (Text, NULLABLE): 메뉴 설명
- `price` (Decimal(10,2), NOT NULL): 가격
- `image_path` (String, NULLABLE): 이미지 상대 경로 (예: `/uploads/menus/{uuid}.jpg`)
- `is_available` (Boolean, NOT NULL, DEFAULT=True): 품절 여부
- `display_order` (Integer, NOT NULL, DEFAULT=0): 카테고리 내 노출 순서
- `created_at` (DateTime, NOT NULL): 생성 시각
- `updated_at` (DateTime, NOT NULL): 수정 시각

**Relationships**:
- `category` (N:1): 소속 카테고리
- `order_items` (1:N): 주문 항목 목록

**Constraints**:
- PK: `id`
- FK: `category_id` → `MenuCategory.id` (ON DELETE CASCADE)
- CHECK: `price > 0` (가격은 양수)

**Indexes**:
- `idx_menu_category_id` (category_id): 카테고리별 메뉴 조회
- `idx_menu_display_order` (category_id, display_order): 순서별 정렬
- `idx_menu_is_available` (is_available): 품절 여부 필터링

**Image Storage**:
- 파일명 생성 규칙: `{UUID}.{extension}` (예: `a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`)
- 저장 경로: `/uploads/menus/`
- URL 생성: FastAPI static files로 서빙 (`/uploads/menus/{uuid}.jpg`)

---

### 7. Order (주문)

**Purpose**: 활성 세션의 주문 정보 (세션 종료 시 OrderHistory로 이동)

**Attributes**:
- `id` (Integer, PK, Auto-increment): 주문 ID
- `table_session_id` (Integer, FK, NOT NULL): 테이블 세션 ID
- `status` (Enum, NOT NULL, DEFAULT='pending'): 주문 상태
- `total_price` (Decimal(10,2), NOT NULL): 총 금액
- `created_at` (DateTime, NOT NULL): 주문 생성 시각
- `updated_at` (DateTime, NOT NULL): 수정 시각

**Relationships**:
- `table_session` (N:1): 소속 세션
- `order_items` (1:N): 주문 항목 목록

**Constraints**:
- PK: `id`
- FK: `table_session_id` → `TableSession.id` (ON DELETE CASCADE)
- CHECK: `status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')`
- CHECK: `total_price >= 0`

**Indexes**:
- `idx_order_session_id` (table_session_id): 세션별 주문 조회
- `idx_order_status` (status): 상태별 필터링
- `idx_order_created_at` (created_at DESC): 최신 주문 조회

**Status Enum**:
- `pending`: 주문 접수
- `preparing`: 조리 중
- `ready`: 준비 완료
- `served`: 서빙 완료
- `cancelled`: 취소

---

### 8. OrderItem (주문 항목)

**Purpose**: 주문 내 개별 메뉴 항목

**Attributes**:
- `id` (Integer, PK, Auto-increment): 주문 항목 ID
- `order_id` (Integer, FK, NOT NULL): 주문 ID
- `menu_id` (Integer, FK, NOT NULL): 메뉴 ID
- `menu_name` (String, NOT NULL): 메뉴 이름 (스냅샷)
- `quantity` (Integer, NOT NULL): 수량
- `unit_price` (Decimal(10,2), NOT NULL): 단가 (스냅샷)
- `subtotal` (Decimal(10,2), NOT NULL): 소계 (quantity * unit_price)
- `created_at` (DateTime, NOT NULL): 생성 시각

**Relationships**:
- `order` (N:1): 소속 주문
- `menu` (N:1): 참조 메뉴

**Constraints**:
- PK: `id`
- FK: `order_id` → `Order.id` (ON DELETE CASCADE)
- FK: `menu_id` → `Menu.id` (ON DELETE RESTRICT) (메뉴 삭제 시 주문 항목 있으면 삭제 불가)
- CHECK: `quantity > 0`
- CHECK: `unit_price >= 0`
- CHECK: `subtotal = quantity * unit_price`

**Indexes**:
- `idx_order_item_order_id` (order_id): 주문별 항목 조회

**Snapshot Pattern**:
- `menu_name`, `unit_price`는 주문 시점의 값을 저장 (메뉴 수정 시 과거 주문 영향 없음)

---

### 9. OrderHistory (주문 히스토리)

**Purpose**: 완료된 세션의 주문 이력 (세션 종료 시 Order에서 이동)

**Attributes**:
- `id` (Integer, PK, Auto-increment): 히스토리 ID
- `table_session_id` (Integer, FK, NOT NULL): 테이블 세션 ID
- `original_order_id` (Integer, NOT NULL): 원본 주문 ID (참조용)
- `status` (Enum, NOT NULL): 주문 상태 (이동 시점의 상태)
- `total_price` (Decimal(10,2), NOT NULL): 총 금액
- `order_created_at` (DateTime, NOT NULL): 원본 주문 생성 시각
- `archived_at` (DateTime, NOT NULL): 히스토리 이동 시각

**Relationships**:
- `table_session` (N:1): 소속 세션
- `order_history_items` (1:N): 히스토리 항목 목록

**Constraints**:
- PK: `id`
- FK: `table_session_id` → `TableSession.id` (ON DELETE CASCADE)
- CHECK: `status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')`
- CHECK: `total_price >= 0`

**Indexes**:
- `idx_order_history_session_id` (table_session_id): 세션별 히스토리 조회
- `idx_order_history_archived_at` (archived_at DESC): 날짜별 조회

**Data Migration**:
- 세션 종료 시 Order → OrderHistory 일괄 이동
- 스키마는 Order와 동일 (원본 데이터 보존)

---

### 10. OrderHistoryItem (주문 히스토리 항목)

**Purpose**: 히스토리 내 개별 메뉴 항목

**Attributes**:
- `id` (Integer, PK, Auto-increment): 히스토리 항목 ID
- `order_history_id` (Integer, FK, NOT NULL): 주문 히스토리 ID
- `menu_id` (Integer, FK, NULLABLE): 메뉴 ID (메뉴 삭제 시 NULL)
- `menu_name` (String, NOT NULL): 메뉴 이름
- `quantity` (Integer, NOT NULL): 수량
- `unit_price` (Decimal(10,2), NOT NULL): 단가
- `subtotal` (Decimal(10,2), NOT NULL): 소계

**Relationships**:
- `order_history` (N:1): 소속 히스토리
- `menu` (N:1): 참조 메뉴 (NULLABLE)

**Constraints**:
- PK: `id`
- FK: `order_history_id` → `OrderHistory.id` (ON DELETE CASCADE)
- FK: `menu_id` → `Menu.id` (ON DELETE SET NULL) (메뉴 삭제 시 NULL)
- CHECK: `quantity > 0`
- CHECK: `unit_price >= 0`
- CHECK: `subtotal = quantity * unit_price`

**Indexes**:
- `idx_order_history_item_history_id` (order_history_id): 히스토리별 항목 조회

---

## Data Integrity Rules

### Referential Integrity
1. **Cascade Delete**: Store 삭제 시 하위 엔티티 모두 삭제
   - Store → Admin, Table, MenuCategory
   - Table → TableSession
   - TableSession → Order, OrderHistory
   - Order → OrderItem
   - OrderHistory → OrderHistoryItem

2. **Restrict Delete**: 참조되는 엔티티 삭제 방지
   - Menu 삭제 시 OrderItem이 있으면 삭제 불가 (is_available=False로 변경)

3. **Set NULL**: 선택적 참조
   - Admin.store_id (슈퍼 관리자)
   - OrderHistoryItem.menu_id (메뉴 삭제 시)

### Unique Constraints
1. `Admin.username` (전역 유니크)
2. `(Store.id, Table.table_number)` (매장 내 테이블 번호 유니크)
3. `(Store.id, MenuCategory.name)` (매장 내 카테고리 이름 유니크)

### Check Constraints
1. `Admin.role IN ('store_admin', 'super_admin')`
2. `Order.status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')`
3. `OrderItem.quantity > 0`
4. `Menu.price > 0`
5. `TableSession.ended_at >= started_at`

### Soft Delete
**Decision**: Hard delete 사용
- 이유: OrderHistory로 이력 관리하므로 soft delete 불필요
- 예외: Menu는 is_available=False로 품절 처리 (삭제 대신)

---

## Summary

### Entity Count
- **Core Entities**: 10개
- **Relationships**: 14개 (1:N, N:1)
- **Indexes**: 20개

### Key Design Decisions
1. **Multi-tenant**: store_id로 매장별 데이터 격리
2. **Session Lifecycle**: TableSession으로 고객 입장~퇴장 관리
3. **Order Archiving**: 세션 종료 시 Order → OrderHistory 이동
4. **Snapshot Pattern**: OrderItem에 menu_name, unit_price 저장 (과거 주문 보존)
5. **Concurrency Control**: SELECT FOR UPDATE로 세션 동시성 제어
6. **Image Storage**: 로컬 파일 시스템, 상대 경로 저장

---

**End of Domain Entities Document**
