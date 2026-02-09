# Components - 테이블오더 서비스

## Overview
테이블오더 서비스의 컴포넌트 정의 및 책임을 문서화합니다.

**Architecture Style**: 레이어 기반 (Controller, Service, Repository)
**Service Granularity**: 작은 단위 (기능별 서비스)
**Frontend Structure**: 기능 기반 컴포넌트

---

## Backend Components

### 1. Controller Layer

#### 1.1 CustomerController
**Purpose**: 고객용 API 엔드포인트 제공

**Responsibilities**:
- 테이블 태블릿 자동 로그인 처리
- 메뉴 조회 API 제공
- 장바구니 관련 요청 처리 (클라이언트 측 관리, 서버는 주문 생성만)
- 주문 생성 API 제공
- 주문 내역 조회 API 제공

**Interfaces**:
- `POST /api/customer/login` - 테이블 자동 로그인
- `GET /api/customer/menus` - 메뉴 목록 조회
- `GET /api/customer/menus/{menu_id}` - 메뉴 상세 조회
- `POST /api/customer/orders` - 주문 생성
- `GET /api/customer/orders` - 주문 내역 조회 (session_id 기반)

---

#### 1.2 AdminController
**Purpose**: 매장 관리자용 API 엔드포인트 제공 (Facade)

**Responsibilities**:
- HTTP 요청 라우팅 및 검증
- 적절한 Service로 위임
- HTTP 응답 포맷팅

**Note**: 
- Controller는 비즈니스 로직을 포함하지 않음
- 모든 로직은 Services에 위임
- 여러 도메인(주문, 테이블, 메뉴)을 관리하지만 실제 처리는 각 Service가 담당

**Interfaces**:
- `POST /api/admin/login` - 관리자 로그인
- `GET /api/admin/orders/stream` - SSE 실시간 주문 스트림
- `GET /api/admin/orders` - 주문 목록 조회
- `PATCH /api/admin/orders/{order_id}/status` - 주문 상태 변경
- `DELETE /api/admin/orders/{order_id}` - 주문 삭제
- `POST /api/admin/tables/{table_id}/complete-session` - 테이블 세션 종료
- `GET /api/admin/tables/{table_id}/order-history` - 과거 주문 내역 조회
- `GET /api/admin/menus` - 메뉴 목록 조회
- `POST /api/admin/menus` - 메뉴 등록
- `PATCH /api/admin/menus/{menu_id}` - 메뉴 수정
- `DELETE /api/admin/menus/{menu_id}` - 메뉴 삭제

---

#### 1.3 SuperAdminController
**Purpose**: 슈퍼 관리자용 API 엔드포인트 제공

**Responsibilities**:
- 슈퍼 관리자 인증 처리
- 매장 관리자 계정 생성 API 제공
- 매장 관리자 계정 관리 API 제공

**Interfaces**:
- `POST /api/superadmin/login` - 슈퍼 관리자 로그인
- `POST /api/superadmin/admins` - 매장 관리자 계정 생성
- `GET /api/superadmin/admins` - 매장 관리자 계정 목록 조회
- `PATCH /api/superadmin/admins/{admin_id}/activate` - 계정 활성화
- `PATCH /api/superadmin/admins/{admin_id}/deactivate` - 계정 비활성화

---

### 2. Service Layer

#### 2.1 AuthenticationService
**Purpose**: 모든 사용자 타입의 인증 처리

**Responsibilities**:
- 테이블 인증 (table_id + table_password)
- 관리자 인증 (store_id + username + password)
- 슈퍼 관리자 인증 (username + password)
- JWT 토큰 생성 (16시간 유효)
- 비밀번호 bcrypt 검증

---

#### 2.2 MenuService
**Purpose**: 메뉴 CRUD 및 이미지 관리

**Responsibilities**:
- 카테고리별 메뉴 목록 조회
- 메뉴 상세 정보 조회
- 메뉴 등록 (이미지 파일 저장)
- 메뉴 수정 (이미지 파일 교체)
- 메뉴 삭제 (이미지 파일 삭제)
- 메뉴 이미지 경로 반환

---

#### 2.3 CreateOrderService
**Purpose**: 주문 생성 처리

**Responsibilities**:
- 주문 데이터 검증
- Order 및 OrderItem 생성
- 테이블 세션 자동 생성 (첫 주문인 경우)
- 주문 생성 이벤트 발행 (Event Bus)

---

#### 2.4 OrderQueryService
**Purpose**: 활성 세션 주문 조회

**Responsibilities**:
- 세션별 주문 내역 조회
- 테이블별 주문 목록 조회
- 주문 상세 정보 조회

**Note**: 현재 진행 중인 세션의 주문만 조회

---

#### 2.5 UpdateOrderStatusService
**Purpose**: 주문 상태 변경 처리

**Responsibilities**:
- 주문 상태 업데이트 (pending → preparing → cooked → delivered)
- 상태 변경 이벤트 발행 (Event Bus)

---

#### 2.6 DeleteOrderService
**Purpose**: 주문 삭제 처리

**Responsibilities**:
- 주문 및 주문 항목 삭제

**Note**: 테이블 총 주문액은 프론트엔드에서 실시간 계산 (orders.sum(total_amount))

---

#### 2.7 CompleteTableSessionService
**Purpose**: 테이블 세션 종료 처리

**Responsibilities**:
- 테이블 세션 종료 (end_time 설정)
- 주문 내역을 OrderHistory로 이동
- 테이블 현재 주문 목록 및 총 주문액 리셋

---

#### 2.8 OrderHistoryQueryService
**Purpose**: 완료된 세션 주문 조회

**Responsibilities**:
- 테이블별 과거 주문 조회
- 날짜 필터링
- 완료 시각 기준 정렬

**Note**: 과거 완료된 세션의 주문 이력 조회

---

#### 2.9 ManageAdminService
**Purpose**: 관리자 계정 관리

**Responsibilities**:
- UUID 생성 (store_id)
- 비밀번호 bcrypt 해싱
- 관리자 계정 생성
- 계정 활성화/비활성화
- 계정 목록 조회

---

### 3. Middleware & Utilities

#### 3.1 AuthService
**Purpose**: 인증/인가 처리

**Responsibilities**:
- JWT 토큰 생성
- JWT 토큰 검증
- 비밀번호 bcrypt 해싱 및 검증
- 권한 확인 (customer, store_admin, super_admin)

---

#### 3.2 EventBus
**Purpose**: 이벤트 기반 통신

**Responsibilities**:
- 이벤트 발행 (publish)
- 이벤트 구독 (subscribe)
- 이벤트 타입: OrderCreated, OrderStatusChanged

---

#### 3.3 SSEPublisher
**Purpose**: Server-Sent Events 스트림 관리

**Responsibilities**:
- SSE 연결 관리
- 주문 이벤트를 SSE 클라이언트에 전송
- EventBus 구독하여 실시간 업데이트

---

### 4. Data Models (SQLAlchemy ORM)

#### 4.1 Store
**Purpose**: 매장 정보

**Fields**:
- store_id (UUID, PK)
- store_name
- created_at
- updated_at

---

#### 4.2 Admin
**Purpose**: 관리자 계정

**Fields**:
- admin_id (PK)
- store_id (FK)
- username
- password_hash
- role (super_admin, store_admin)
- is_active
- created_at
- updated_at

---

#### 4.3 Table
**Purpose**: 테이블 정보

**Fields**:
- table_id (PK)
- store_id (FK)
- table_number
- table_password_hash
- created_at
- updated_at

---

#### 4.4 TableSession
**Purpose**: 테이블 세션

**Fields**:
- session_id (PK)
- table_id (FK)
- start_time
- end_time (nullable)
- status (active, completed)

---

#### 4.5 MenuCategory
**Purpose**: 메뉴 카테고리

**Fields**:
- category_id (PK)
- store_id (FK)
- category_name
- display_order

---

#### 4.6 Menu
**Purpose**: 메뉴

**Fields**:
- menu_id (PK)
- store_id (FK)
- category_id (FK)
- menu_name
- price
- description
- image_path
- display_order
- created_at
- updated_at

---

#### 4.7 Order
**Purpose**: 주문

**Fields**:
- order_id (PK)
- session_id (FK)
- table_id (FK)
- store_id (FK)
- order_number
- total_amount
- status (pending, preparing, cooked, delivered)
- created_at
- updated_at

---

#### 4.8 OrderItem
**Purpose**: 주문 항목

**Fields**:
- order_item_id (PK)
- order_id (FK)
- menu_id (FK)
- menu_name
- quantity
- unit_price
- subtotal

---

#### 4.9 OrderHistory
**Purpose**: 과거 주문 내역

**Fields**:
- history_id (PK)
- session_id (FK)
- table_id (FK)
- store_id (FK)
- order_id (FK)
- completed_at
- archived_at

---

## Frontend Components

### 1. Customer Components

#### 1.1 Menu
**Purpose**: 메뉴 조회 및 탐색

**Sub-components**:
- MenuList: 메뉴 목록 표시
- MenuItem: 개별 메뉴 카드
- MenuCategory: 카테고리 탭
- MenuDetail: 메뉴 상세 모달

---

#### 1.2 Cart
**Purpose**: 장바구니 관리

**Sub-components**:
- Cart: 장바구니 전체 컨테이너
- CartItem: 장바구니 항목
- CartSummary: 총 금액 표시

---

#### 1.3 Order
**Purpose**: 주문 생성 및 내역 조회

**Sub-components**:
- OrderConfirm: 주문 확인 화면
- OrderSuccess: 주문 성공 화면
- OrderList: 주문 내역 목록
- OrderItem: 개별 주문 카드
- OrderStatus: 주문 상태 표시

---

### 2. Admin Components

#### 2.1 Dashboard
**Purpose**: 실시간 주문 모니터링

**Sub-components**:
- Dashboard: 대시보드 전체 컨테이너
- TableCard: 테이블별 주문 카드
- OrderMonitor: 주문 모니터링 그리드

---

#### 2.2 OrderManagement
**Purpose**: 주문 관리

**Sub-components**:
- OrderDetail: 주문 상세 모달
- OrderStatusControl: 상태 변경 컨트롤
- OrderDeleteButton: 주문 삭제 버튼

---

#### 2.3 TableManagement
**Purpose**: 테이블 관리

**Sub-components**:
- TableSessionControl: 세션 종료 버튼
- OrderHistoryModal: 과거 주문 내역 모달

---

#### 2.4 MenuManagement
**Purpose**: 메뉴 관리

**Sub-components**:
- MenuList: 메뉴 목록 (관리자용)
- MenuForm: 메뉴 등록/수정 폼
- MenuDeleteButton: 메뉴 삭제 버튼

---

### 3. SuperAdmin Components

#### 3.1 AdminManagement
**Purpose**: 관리자 계정 관리

**Sub-components**:
- AdminList: 관리자 계정 목록
- AdminForm: 계정 생성 폼
- AdminStatusControl: 활성화/비활성화 버튼

---

### 4. Common Components

#### 4.1 Auth
**Purpose**: 인증 관련 컴포넌트

**Sub-components**:
- LoginForm: 로그인 폼
- ProtectedRoute: 인증 필요 라우트

---

#### 4.2 UI
**Purpose**: 공통 UI 컴포넌트

**Sub-components**:
- Button: 버튼
- Modal: 모달
- Input: 입력 필드
- Card: 카드
- Badge: 배지 (주문 상태 등)

---

## Summary

### Backend Components
- **Controllers**: 3개 (Customer, Admin, SuperAdmin)
- **Services**: 9개 (통합 후 - AuthenticationService, MenuService, CreateOrderService, OrderQueryService, UpdateOrderStatusService, DeleteOrderService, CompleteTableSessionService, OrderHistoryQueryService, ManageAdminService)
- **Middleware**: 3개 (Auth, EventBus, SSEPublisher)
- **Data Models**: 9개 (SQLAlchemy ORM)

### Frontend Components
- **Customer**: 3개 주요 컴포넌트 (Menu, Cart, Order)
- **Admin**: 4개 주요 컴포넌트 (Dashboard, OrderManagement, TableManagement, MenuManagement)
- **SuperAdmin**: 1개 주요 컴포넌트 (AdminManagement)
- **Common**: 2개 주요 컴포넌트 (Auth, UI)

### Architecture Highlights
- **레이어 기반**: Controller → Service → ORM (Repository 없음)
- **작은 단위 서비스**: 기능별로 세분화된 서비스
- **이벤트 기반 실시간**: EventBus + SSEPublisher
- **전용 Auth 컴포넌트**: AuthService + Middleware
- **기능 기반 프론트엔드**: Menu, Cart, Order 등 기능별 컴포넌트
