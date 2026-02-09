# Unit of Work Story Map - 테이블오더 서비스

## Overview

27개 User Stories를 5개 Unit of Work에 매핑합니다. 각 스토리는 주요 구현 유닛에 할당되며, 일부 스토리는 여러 유닛에 걸쳐 구현됩니다 (Cross-unit stories).

### Story Distribution
- **Unit 1 (Backend)**: 27 stories (모든 스토리의 백엔드 로직)
- **Unit 2 (Customer UI)**: 10 stories (고객 Journey)
- **Unit 3 (Admin UI)**: 12 stories (관리자 Journey)
- **Unit 4 (SuperAdmin UI)**: 5 stories (슈퍼 관리자 Journey)
- **Unit 5 (Infrastructure)**: 0 stories (인프라는 스토리 없음, 배포 지원)

---

## Unit 1: Backend API & Database

### Assigned Stories: 27 (모든 스토리)

모든 User Stories는 백엔드 로직을 필요로 하므로, Unit 1에서 모든 스토리의 API 및 비즈니스 로직을 구현합니다.

#### 고객 Journey (10 stories)

**US-C01: 테이블 태블릿 자동 로그인**
- **Backend Implementation**:
  - POST /api/customer/login
  - AuthenticationService.authenticateTable()
  - JWT 토큰 생성 (16h expiry)
  - TableSession 생성 또는 재사용

**US-C02: 메뉴 카테고리별 조회**
- **Backend Implementation**:
  - GET /api/menus?category={category_id}
  - MenuService.getMenusByCategory()
  - Menu, MenuCategory 조회

**US-C03: 메뉴 상세 정보 조회**
- **Backend Implementation**:
  - GET /api/menus/{menu_id}
  - MenuService.getMenuById()

**US-C04: 장바구니에 메뉴 추가**
- **Backend Implementation**: None (클라이언트 측 상태 관리)

**US-C05: 장바구니에서 수량 조절**
- **Backend Implementation**: None (클라이언트 측 상태 관리)

**US-C06: 장바구니에서 메뉴 삭제**
- **Backend Implementation**: None (클라이언트 측 상태 관리)

**US-C07: 장바구니 비우기**
- **Backend Implementation**: None (클라이언트 측 상태 관리)

**US-C08: 주문 생성**
- **Backend Implementation**:
  - POST /api/orders
  - CreateOrderService.createOrder()
  - Order, OrderItem 생성
  - EventBus.publish('OrderCreated')
  - 트랜잭션 관리

**US-C09: 주문 내역 조회**
- **Backend Implementation**:
  - GET /api/orders?session_id={session_id}
  - OrderQueryService.getOrdersBySession()
  - 활성 세션 주문만 조회

**US-C10: 주문 상태 실시간 업데이트**
- **Backend Implementation**:
  - GET /api/orders?session_id={session_id} (폴링용)
  - OrderQueryService.getOrdersBySession()

---

#### 관리자 Journey (12 stories)

**US-A01: 매장 관리자 로그인**
- **Backend Implementation**:
  - POST /api/admin/login
  - AuthenticationService.authenticateAdmin()
  - JWT 토큰 생성 (16h expiry)
  - bcrypt 비밀번호 검증

**US-A02: 실시간 주문 모니터링 대시보드**
- **Backend Implementation**:
  - GET /api/admin/orders/stream (SSE)
  - SSEPublisher.subscribe()
  - EventBus 구독 (OrderCreated, OrderStatusChanged)
  - 실시간 이벤트 스트림

**US-A03: 주문 상세 정보 조회**
- **Backend Implementation**:
  - GET /api/admin/orders?table_id={table_id}
  - OrderQueryService.getOrdersByTable()

**US-A04: 주문 상태 변경**
- **Backend Implementation**:
  - PATCH /api/admin/orders/{order_id}/status
  - UpdateOrderStatusService.updateStatus()
  - 상태 전이 검증 (State Machine)
  - EventBus.publish('OrderStatusChanged')

**US-A05: 주문 삭제**
- **Backend Implementation**:
  - DELETE /api/admin/orders/{order_id}
  - DeleteOrderService.deleteOrder()
  - OrderItem cascade 삭제

**US-A06: 테이블 세션 종료 (이용 완료)**
- **Backend Implementation**:
  - POST /api/admin/tables/{table_id}/complete-session
  - CompleteTableSessionService.completeSession()
  - TableSession 종료
  - Order → OrderHistory 이동
  - 트랜잭션 관리

**US-A07: 과거 주문 내역 조회**
- **Backend Implementation**:
  - GET /api/admin/tables/{table_id}/order-history?from={date}&to={date}
  - OrderHistoryQueryService.getOrderHistory()
  - OrderHistory 조회

**US-A08: 메뉴 조회**
- **Backend Implementation**:
  - GET /api/admin/menus
  - MenuService.getAllMenus()

**US-A09: 메뉴 등록**
- **Backend Implementation**:
  - POST /api/admin/menus (multipart/form-data)
  - MenuService.createMenu()
  - 이미지 파일 저장 (로컬 파일 시스템)

**US-A10: 메뉴 수정**
- **Backend Implementation**:
  - PATCH /api/admin/menus/{menu_id}
  - MenuService.updateMenu()

**US-A11: 메뉴 삭제**
- **Backend Implementation**:
  - DELETE /api/admin/menus/{menu_id}
  - MenuService.deleteMenu()

**US-A12: 메뉴 노출 순서 조정**
- **Backend Implementation**:
  - PATCH /api/admin/menus/reorder
  - MenuService.reorderMenus()
  - 여러 메뉴의 display_order 업데이트

---

#### 슈퍼 관리자 Journey (5 stories)

**US-SA01: 슈퍼 관리자 로그인**
- **Backend Implementation**:
  - POST /api/superadmin/login
  - AuthenticationService.authenticateSuperAdmin()
  - JWT 토큰 생성 (16h expiry)

**US-SA02: 매장 관리자 계정 생성**
- **Backend Implementation**:
  - POST /api/superadmin/admins
  - ManageAdminService.createAdmin()
  - UUID 생성 (store_id)
  - bcrypt 비밀번호 해싱

**US-SA03: 매장 관리자 계정 조회**
- **Backend Implementation**:
  - GET /api/superadmin/admins
  - ManageAdminService.getAllAdmins()

**US-SA04: 매장 관리자 계정 비활성화**
- **Backend Implementation**:
  - PATCH /api/superadmin/admins/{admin_id}/deactivate
  - ManageAdminService.deactivateAdmin()
  - is_active = False

**US-SA05: 매장 관리자 계정 활성화**
- **Backend Implementation**:
  - PATCH /api/superadmin/admins/{admin_id}/activate
  - ManageAdminService.activateAdmin()
  - is_active = True

---

### Backend Story Priority

**Phase 1 (Core APIs)**:
1. US-C01 (테이블 로그인)
2. US-A01 (관리자 로그인)
3. US-SA01 (슈퍼 관리자 로그인)
4. US-C02, US-C03 (메뉴 조회)
5. US-C08 (주문 생성)
6. US-C09 (주문 내역 조회)

**Phase 2 (Admin Features)**:
7. US-A02 (실시간 모니터링 - SSE)
8. US-A03, US-A04, US-A05 (주문 관리)
9. US-A06, US-A07 (세션 관리)
10. US-A08, US-A09, US-A10, US-A11 (메뉴 관리)

**Phase 3 (SuperAdmin Features)**:
11. US-SA02, US-SA03, US-SA04, US-SA05 (관리자 계정 관리)

**Phase 4 (Post-MVP)**:
12. US-A12 (메뉴 노출 순서 조정)

---

## Unit 2: Customer Frontend

### Assigned Stories: 10 (고객 Journey)

**US-C01: 테이블 태블릿 자동 로그인**
- **Frontend Implementation**:
  - 로그인 화면 (테이블 ID, 비밀번호 입력)
  - POST /api/customer/login 호출
  - JWT 토큰 localStorage 저장
  - 자동 로그인 (localStorage 토큰 확인)

**US-C02: 메뉴 카테고리별 조회**
- **Frontend Implementation**:
  - MenuList 컴포넌트
  - 카테고리 탭
  - GET /api/menus?category={category_id} 호출
  - React Query 캐싱

**US-C03: 메뉴 상세 정보 조회**
- **Frontend Implementation**:
  - MenuDetail 모달
  - GET /api/menus/{menu_id} 호출

**US-C04: 장바구니에 메뉴 추가**
- **Frontend Implementation**:
  - Zustand cartStore.addItem()
  - localStorage 저장
  - 성공 메시지 표시

**US-C05: 장바구니에서 수량 조절**
- **Frontend Implementation**:
  - CartItem 컴포넌트 (+/- 버튼)
  - Zustand cartStore.updateQuantity()
  - 총 금액 재계산

**US-C06: 장바구니에서 메뉴 삭제**
- **Frontend Implementation**:
  - CartItem 삭제 버튼
  - Zustand cartStore.removeItem()

**US-C07: 장바구니 비우기**
- **Frontend Implementation**:
  - Cart 비우기 버튼
  - 확인 팝업
  - Zustand cartStore.clearCart()

**US-C08: 주문 생성**
- **Frontend Implementation**:
  - OrderConfirm 화면
  - POST /api/orders 호출
  - 성공 시 장바구니 비우기
  - 5초 후 메뉴 화면으로 리다이렉트

**US-C09: 주문 내역 조회**
- **Frontend Implementation**:
  - OrderList 컴포넌트
  - GET /api/orders?session_id={session_id} 호출
  - 시간 역순 정렬

**US-C10: 주문 상태 실시간 업데이트**
- **Frontend Implementation**:
  - setInterval 30초 폴링
  - GET /api/orders?session_id={session_id} 호출
  - 상태 변경 시 시각적 피드백

---

### Customer UI Story Priority

**Phase 1 (Core Flow)**:
1. US-C01 (자동 로그인)
2. US-C02, US-C03 (메뉴 조회)
3. US-C04, US-C05, US-C06, US-C07 (장바구니)
4. US-C08 (주문 생성)

**Phase 2 (Order Tracking)**:
5. US-C09, US-C10 (주문 내역 및 상태 업데이트)

---

## Unit 3: Admin Frontend

### Assigned Stories: 12 (관리자 Journey)

**US-A01: 매장 관리자 로그인**
- **Frontend Implementation**:
  - 로그인 화면 (매장 식별자, 사용자명, 비밀번호)
  - POST /api/admin/login 호출
  - JWT 토큰 localStorage 저장

**US-A02: 실시간 주문 모니터링 대시보드**
- **Frontend Implementation**:
  - Dashboard 컴포넌트
  - TableCard 그리드
  - EventSource SSE 연결 (GET /api/admin/orders/stream)
  - 신규 주문 시각적 강조

**US-A03: 주문 상세 정보 조회**
- **Frontend Implementation**:
  - OrderDetail 모달
  - GET /api/admin/orders?table_id={table_id} 호출

**US-A04: 주문 상태 변경**
- **Frontend Implementation**:
  - OrderStatusButton 컴포넌트
  - PATCH /api/admin/orders/{order_id}/status 호출
  - 확인 팝업

**US-A05: 주문 삭제**
- **Frontend Implementation**:
  - OrderDeleteButton 컴포넌트
  - DELETE /api/admin/orders/{order_id} 호출
  - 확인 팝업

**US-A06: 테이블 세션 종료 (이용 완료)**
- **Frontend Implementation**:
  - CompleteSessionButton 컴포넌트
  - POST /api/admin/tables/{table_id}/complete-session 호출
  - 확인 팝업

**US-A07: 과거 주문 내역 조회**
- **Frontend Implementation**:
  - OrderHistoryModal 컴포넌트
  - 날짜 필터 (date picker)
  - GET /api/admin/tables/{table_id}/order-history 호출

**US-A08: 메뉴 조회**
- **Frontend Implementation**:
  - MenuList 컴포넌트
  - GET /api/admin/menus 호출
  - 카테고리별 그룹핑

**US-A09: 메뉴 등록**
- **Frontend Implementation**:
  - MenuForm 컴포넌트
  - 이미지 업로드 (multipart/form-data)
  - POST /api/admin/menus 호출

**US-A10: 메뉴 수정**
- **Frontend Implementation**:
  - MenuForm 컴포넌트 (수정 모드)
  - PATCH /api/admin/menus/{menu_id} 호출

**US-A11: 메뉴 삭제**
- **Frontend Implementation**:
  - MenuDeleteButton 컴포넌트
  - DELETE /api/admin/menus/{menu_id} 호출
  - 확인 팝업

**US-A12: 메뉴 노출 순서 조정**
- **Frontend Implementation**:
  - React DnD 드래그 앤 드롭
  - PATCH /api/admin/menus/reorder 호출

---

### Admin UI Story Priority

**Phase 1 (Core Monitoring)**:
1. US-A01 (로그인)
2. US-A02 (실시간 대시보드 - SSE)
3. US-A03, US-A04, US-A05 (주문 관리)

**Phase 2 (Session & Menu Management)**:
4. US-A06, US-A07 (세션 관리)
5. US-A08, US-A09, US-A10, US-A11 (메뉴 관리)

**Phase 3 (Post-MVP)**:
6. US-A12 (메뉴 순서 조정)

---

## Unit 4: SuperAdmin Frontend

### Assigned Stories: 5 (슈퍼 관리자 Journey)

**US-SA01: 슈퍼 관리자 로그인**
- **Frontend Implementation**:
  - 로그인 화면 (사용자명, 비밀번호)
  - POST /api/superadmin/login 호출
  - JWT 토큰 localStorage 저장

**US-SA02: 매장 관리자 계정 생성**
- **Frontend Implementation**:
  - AdminForm 컴포넌트
  - UUID 자동 생성 표시
  - POST /api/superadmin/admins 호출

**US-SA03: 매장 관리자 계정 조회**
- **Frontend Implementation**:
  - AdminList 컴포넌트
  - GET /api/superadmin/admins 호출
  - 검색 및 필터링

**US-SA04: 매장 관리자 계정 비활성화**
- **Frontend Implementation**:
  - AdminStatusButton 컴포넌트
  - PATCH /api/superadmin/admins/{admin_id}/deactivate 호출
  - 확인 팝업

**US-SA05: 매장 관리자 계정 활성화**
- **Frontend Implementation**:
  - AdminStatusButton 컴포넌트
  - PATCH /api/superadmin/admins/{admin_id}/activate 호출

---

### SuperAdmin UI Story Priority

**Phase 1 (All Features)**:
1. US-SA01 (로그인)
2. US-SA02, US-SA03 (계정 생성 및 조회)
3. US-SA04, US-SA05 (계정 활성화/비활성화)

---

## Unit 5: Infrastructure (Terraform)

### Assigned Stories: 0

Infrastructure 유닛은 User Stories를 직접 구현하지 않으며, 모든 유닛의 배포 환경을 제공합니다.

**Supporting All Units**:
- Unit 1 (Backend): EC2/ECS, RDS, Redis
- Unit 2, 3, 4 (Frontend): S3 + CloudFront (optional)

---

## Cross-Unit Stories

일부 스토리는 여러 유닛에 걸쳐 구현됩니다.

### US-C01: 테이블 태블릿 자동 로그인
- **Unit 1 (Backend)**: POST /api/customer/login, JWT 생성
- **Unit 2 (Customer UI)**: 로그인 화면, 토큰 저장

### US-C08: 주문 생성
- **Unit 1 (Backend)**: POST /api/orders, Order 생성, 이벤트 발행
- **Unit 2 (Customer UI)**: OrderConfirm 화면, API 호출

### US-A02: 실시간 주문 모니터링 대시보드
- **Unit 1 (Backend)**: GET /api/admin/orders/stream (SSE), EventBus
- **Unit 3 (Admin UI)**: Dashboard, EventSource 연결

### US-A04: 주문 상태 변경
- **Unit 1 (Backend)**: PATCH /api/admin/orders/{order_id}/status, 이벤트 발행
- **Unit 3 (Admin UI)**: OrderStatusButton, API 호출

### US-A09: 메뉴 등록
- **Unit 1 (Backend)**: POST /api/admin/menus, 이미지 저장
- **Unit 3 (Admin UI)**: MenuForm, 이미지 업로드

---

## Story Coverage Validation

### Total Stories: 27
- **고객 Journey**: 10 stories ✅
- **관리자 Journey**: 12 stories ✅
- **슈퍼 관리자 Journey**: 5 stories ✅

### Unit Coverage
- **Unit 1 (Backend)**: 27 stories (100%) ✅
- **Unit 2 (Customer UI)**: 10 stories (37%) ✅
- **Unit 3 (Admin UI)**: 12 stories (44%) ✅
- **Unit 4 (SuperAdmin UI)**: 5 stories (19%) ✅
- **Unit 5 (Infrastructure)**: 0 stories (0%) ✅

### Unassigned Stories: 0 ✅

**All stories are assigned to at least one unit.**

---

## MVP vs Post-MVP Mapping

### MVP Stories: 26
- **Unit 1 (Backend)**: 26 stories
- **Unit 2 (Customer UI)**: 10 stories
- **Unit 3 (Admin UI)**: 11 stories (US-A12 제외)
- **Unit 4 (SuperAdmin UI)**: 5 stories

### Post-MVP Stories: 1
- **US-A12: 메뉴 노출 순서 조정**
  - Unit 1 (Backend): PATCH /api/admin/menus/reorder
  - Unit 3 (Admin UI): React DnD 드래그 앤 드롭

---

## Summary

### Story Distribution
- **Backend (Unit 1)**: 모든 스토리의 API 및 비즈니스 로직
- **Customer UI (Unit 2)**: 고객 Journey 10개
- **Admin UI (Unit 3)**: 관리자 Journey 12개
- **SuperAdmin UI (Unit 4)**: 슈퍼 관리자 Journey 5개
- **Infrastructure (Unit 5)**: 스토리 없음 (배포 지원)

### Cross-Unit Stories
- 5개 주요 스토리가 Backend + Frontend 협업 필요
- API Contract First로 병렬 개발 가능

### Story Priority
- **Phase 1**: 핵심 기능 (로그인, 메뉴 조회, 주문 생성)
- **Phase 2**: 관리 기능 (주문 관리, 세션 관리, 메뉴 관리)
- **Phase 3**: 슈퍼 관리자 기능
- **Phase 4**: Post-MVP (메뉴 순서 조정)

---

**End of Unit of Work Story Map Document**
