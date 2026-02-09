# Business Rules - Unit 1: Backend API & Database

## Overview

테이블오더 서비스의 비즈니스 규칙은 데이터 무결성, 상태 전이, 권한 검증, 주문 검증 등을 포함합니다. 이 규칙들은 애플리케이션 레벨과 데이터베이스 레벨에서 강제됩니다.

---

## 1. 주문 검증 규칙 (Order Validation Rules)

### 1.1 주문 생성 시 필수 검증

**Rule**: 주문 생성 시 다음 조건을 모두 만족해야 함

**Conditions**:
1. **주문 항목 존재**: `items.length >= 1`
2. **메뉴 존재**: 각 `menu_id`가 DB에 존재
3. **메뉴 품절 확인**: 각 `menu.is_available = True`
4. **수량 양수**: 각 `quantity > 0`
5. **활성 세션**: `table_session.is_active = True`

**Enforcement**:
- **Layer**: Application (CreateOrderService)
- **Timing**: 주문 생성 전

**Error Responses**:
- `EMPTY_ORDER` (400): 주문 항목이 비어있음
- `MENU_NOT_FOUND` (404): 메뉴가 존재하지 않음
- `MENU_NOT_AVAILABLE` (400): 메뉴가 품절 상태
- `INVALID_QUANTITY` (400): 수량이 0 이하
- `SESSION_INACTIVE` (400): 세션이 비활성 상태

---

### 1.2 메뉴 비활성화 시 주문 처리

**Rule**: 메뉴가 삭제되거나 비활성화된 경우 주문 생성 불가

**Behavior**:
- `menu.is_available = False` → 주문 생성 시 에러 반환
- 고객은 해당 메뉴를 장바구니에서 제거하고 다시 주문

**Enforcement**:
- **Layer**: Application (CreateOrderService)
- **Error**: `MENU_NOT_AVAILABLE` (400)

**Alternative** (Not Implemented):
- 경고와 함께 주문 허용 (주문 내역에 "품절" 표시)

---

### 1.3 추가 검증 규칙 (Optional)

**Rule**: 현재 구현하지 않지만 향후 추가 가능한 규칙

**Potential Rules**:
- 최소 주문 금액 (예: 10,000원 이상)
- 최대 주문 수량 (예: 메뉴당 최대 10개)
- 주문 가능 시간 (예: 영업 시간 내에만 주문 가능)

**Decision**: MVP에서는 구현하지 않음 (복잡도 감소)

---

## 2. 주문 상태 전이 규칙 (Order Status Transition Rules)

### 2.1 상태 전이 State Machine

**States**:
- `pending`: 주문 접수
- `preparing`: 조리 중
- `ready`: 준비 완료
- `served`: 서빙 완료
- `cancelled`: 취소

**Allowed Transitions**:
```
pending → preparing, cancelled
preparing → ready, cancelled
ready → served
served → (종료 상태, 변경 불가)
cancelled → (종료 상태, 변경 불가)
```

**Enforcement**:
- **Layer**: Application (UpdateOrderStatusService)
- **Timing**: 상태 변경 전

**Error Response**:
- `INVALID_STATUS_TRANSITION` (400): 허용되지 않는 상태 전이
  - 예: `served → pending` (불가능)
  - 예: `cancelled → preparing` (불가능)

---

### 2.2 종료 상태 불변성

**Rule**: `served` 또는 `cancelled` 상태는 변경 불가

**Behavior**:
- `served` 상태 주문은 더 이상 상태 변경 불가
- `cancelled` 상태 주문도 변경 불가

**Enforcement**:
- **Layer**: Application (UpdateOrderStatusService)
- **Error**: `INVALID_STATUS_TRANSITION` (400)

---

### 2.3 주문 삭제 제한

**Rule**: 특정 상태에서는 주문 삭제 불가

**Allowed Delete States**:
- `pending`, `preparing`, `ready` (삭제 가능)

**Restricted Delete States**:
- `served`, `cancelled` (삭제 불가, 이미 완료된 주문)

**Enforcement**:
- **Layer**: Application (DeleteOrderService)
- **Error**: `ORDER_CANNOT_DELETE` (400)

**Rationale**:
- 완료된 주문은 히스토리 보존 필요
- 취소된 주문도 기록 유지 (감사 추적)

---

## 3. 세션 동시성 규칙 (Session Concurrency Rules)

### 3.1 테이블당 하나의 활성 세션

**Rule**: 각 테이블은 동시에 하나의 활성 세션만 가질 수 있음

**Enforcement**:
- **Layer**: Application (AuthenticationService)
- **Mechanism**: `SELECT FOR UPDATE` (Pessimistic Locking)

**Behavior**:
1. 고객이 테이블 로그인 시도
2. 활성 세션 조회 (SELECT FOR UPDATE)
3. 활성 세션이 있으면:
   - 기존 세션 자동 종료 (is_active=False, ended_at=now)
   - 신규 세션 생성
4. 활성 세션이 없으면:
   - 신규 세션 생성

**Rationale**:
- 테이블은 물리적으로 하나이므로 세션도 하나
- 이전 고객이 퇴장했지만 관리자가 세션 종료를 깜빡한 경우 자동 처리

---

### 3.2 세션 종료 시 미완료 주문 처리

**Rule**: 세션 종료 시 미완료 주문(pending, preparing)도 히스토리로 이동 가능

**Behavior**:
- 관리자가 세션 종료 요청
- 미완료 주문이 있어도 경고 없이 진행
- 모든 주문(상태 무관)을 OrderHistory로 이동

**Enforcement**:
- **Layer**: Application (CompleteTableSessionService)

**Alternative** (Not Implemented):
- 미완료 주문이 있으면 에러 반환 (모든 주문이 served 또는 cancelled 상태여야 함)

**Decision**: 관리자 판단에 맡김 (유연성 우선)

---

## 4. 권한 검증 규칙 (Authorization Rules)

### 4.1 API 엔드포인트별 권한

**Rule**: 각 API는 적절한 역할을 가진 사용자만 접근 가능

**Access Control**:
- **Customer API** (`/api/customer/*`):
  - JWT 토큰 필수
  - `role = 'table'`
- **Admin API** (`/api/admin/*`):
  - JWT 토큰 필수
  - `role = 'store_admin'`
- **SuperAdmin API** (`/api/superadmin/*`):
  - JWT 토큰 필수
  - `role = 'super_admin'`

**Enforcement**:
- **Layer**: Middleware (JWT Dependency)
- **Error**: `UNAUTHORIZED` (401), `FORBIDDEN` (403)

---

### 4.2 매장별 데이터 격리 (Multi-tenant)

**Rule**: 관리자는 자신이 속한 매장의 데이터만 접근 가능

**Behavior**:
- 모든 Admin API 요청에 `store_id` 필터링 적용
- JWT 토큰에서 `store_id` 추출
- 데이터 조회/수정 시 `store_id` 검증

**Enforcement**:
- **Layer**: Application (모든 Service 메서드)
- **Error**: `UNAUTHORIZED` (403)

**Example**:
```python
# Admin이 다른 매장의 메뉴 수정 시도
menu = get_menu(menu_id)
if menu.category.store_id != admin.store_id:
    raise UnauthorizedError()
```

**Exception**:
- SuperAdmin은 모든 매장 데이터 접근 가능 (store_id 필터링 없음)

---

### 4.3 JWT 토큰 만료 처리

**Rule**: JWT 토큰 만료 시 재로그인 필요

**Behavior**:
- 토큰 만료 시간: 16시간
- 만료 시 `401 Unauthorized` 반환
- Refresh Token 없음 (재로그인 필요)

**Enforcement**:
- **Layer**: Middleware (JWT Dependency)
- **Error**: `TOKEN_EXPIRED` (401)

**Rationale**:
- 단순성 우선 (Refresh Token 복잡도 제거)
- 16시간이면 영업 시간 충분히 커버

---

## 5. 데이터 무결성 규칙 (Data Integrity Rules)

### 5.1 데이터베이스 제약 조건

**Rule**: 데이터베이스 레벨에서 무결성 보장

**Constraints**:
1. **Unique Constraints**:
   - `Admin.username` (전역 유니크)
   - `(Store.id, Table.table_number)` (매장 내 테이블 번호 유니크)
   - `(Store.id, MenuCategory.name)` (매장 내 카테고리 이름 유니크)

2. **Check Constraints**:
   - `Admin.role IN ('store_admin', 'super_admin')`
   - `Order.status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')`
   - `OrderItem.quantity > 0`
   - `Menu.price > 0`
   - `TableSession.ended_at >= started_at`

3. **Foreign Key Constraints**:
   - Cascade Delete: Store → Admin, Table, MenuCategory
   - Restrict Delete: Menu (OrderItem이 있으면 삭제 불가)
   - Set NULL: Admin.store_id (슈퍼 관리자), OrderHistoryItem.menu_id (메뉴 삭제 시)

**Enforcement**:
- **Layer**: Database (PostgreSQL)
- **Error**: `INTEGRITY_ERROR` (500)

---

### 5.2 Soft Delete vs Hard Delete

**Rule**: Hard delete 사용 (Soft delete 없음)

**Behavior**:
- 엔티티 삭제 시 물리적으로 삭제
- 예외: Menu는 `is_available=False`로 품절 처리 (삭제 대신)

**Rationale**:
- OrderHistory로 이력 관리하므로 soft delete 불필요
- 복잡도 감소 (deleted_at 컬럼 불필요)

**Exception**:
- Menu 삭제 시 OrderItem이 있으면 삭제 불가 (FK RESTRICT)
- 대안: `is_available=False`로 변경 권장

---

### 5.3 관리자 계정 제약

**Rule**: 매장 관리자는 매장 필수, 슈퍼 관리자는 매장 없음

**Constraint**:
```sql
CHECK (
  (role = 'store_admin' AND store_id IS NOT NULL) OR
  (role = 'super_admin' AND store_id IS NULL)
)
```

**Enforcement**:
- **Layer**: Database (CHECK constraint)
- **Error**: `INTEGRITY_ERROR` (500)

---

## 6. 이벤트 발행 규칙 (Event Publishing Rules)

### 6.1 이벤트 발행 시점

**Rule**: 이벤트는 트랜잭션 커밋 후 발행

**Behavior**:
1. DB 트랜잭션 시작
2. 데이터 변경 (Order 생성, 상태 변경)
3. DB 커밋
4. 이벤트 발행 (EventBus.publish)

**Enforcement**:
- **Layer**: Application (Service 메서드)

**Rationale**:
- 데이터 일관성 보장 (DB 커밋 실패 시 이벤트도 발행 안 됨)
- SSE 클라이언트에게 "아직 DB에 없는 주문"을 보내지 않음

---

### 6.2 이벤트 페이로드 표준

**Rule**: 이벤트 페이로드는 JSON 직렬화 가능해야 함

**Format**:
```json
{
  "event_type": "OrderCreated",
  "order_id": 123,
  "table_id": 5,
  "store_id": "uuid",
  "timestamp": "2026-02-09T15:00:00Z",
  ...
}
```

**Enforcement**:
- **Layer**: Application (EventBus)
- **Serialization**: Python dict → JSON

**Required Fields**:
- `event_type` (String): 이벤트 타입
- `store_id` (UUID): 매장 ID (SSE 필터링용)
- `timestamp` (ISO 8601): 이벤트 발생 시각

---

### 6.3 SSE 연결 관리

**Rule**: 관리자는 자신의 매장 이벤트만 수신

**Behavior**:
- SSE 연결 시 JWT 토큰에서 `store_id` 추출
- EventBus 이벤트 수신 시 `store_id` 필터링
- 일치하는 이벤트만 SSE 스트림으로 전송

**Enforcement**:
- **Layer**: Infrastructure (SSEPublisher)

**Connection Management**:
- 타임아웃: 무제한 (keep-alive)
- 재연결: 클라이언트 책임
- 연결 끊김 시: 자동 재연결 (클라이언트 구현)

---

## 7. API 응답 규칙 (API Response Rules)

### 7.1 에러 응답 표준

**Rule**: 모든 에러는 일관된 형식으로 반환

**Format**:
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

**Fields**:
- `code` (String, UPPER_SNAKE_CASE): 에러 코드
- `message` (String): 사용자 친화적 메시지 (한국어)
- `details` (Object, Optional): 추가 정보

**Enforcement**:
- **Layer**: Application (Exception Handler)

---

### 7.2 HTTP 상태 코드 사용 규칙

**Rule**: 적절한 HTTP 상태 코드 사용

**Status Codes**:
- `200 OK`: 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 클라이언트 입력 오류
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `409 Conflict`: 충돌 (중복, 제약 위반)
- `500 Internal Server Error`: 서버 오류

**Enforcement**:
- **Layer**: Application (Exception Handler)

---

### 7.3 Pagination 규칙

**Rule**: 목록 조회 API는 페이지네이션 지원

**Strategy**: Offset-based pagination

**Parameters**:
- `page` (Integer, Default=1): 페이지 번호
- `page_size` (Integer, Default=50): 페이지 크기

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 50,
    "total_count": 123,
    "total_pages": 3
  }
}
```

**Enforcement**:
- **Layer**: Application (Query Service)

**Applicable APIs**:
- GET /api/admin/menus
- GET /api/admin/tables/{table_id}/order-history
- GET /api/superadmin/admins

**Exception**:
- Customer API는 페이지네이션 없음 (데이터 양이 적음)

---

## 8. 비밀번호 보안 규칙 (Password Security Rules)

### 8.1 비밀번호 해싱

**Rule**: 모든 비밀번호는 bcrypt로 해싱하여 저장

**Algorithm**: bcrypt (cost factor=12)

**Enforcement**:
- **Layer**: Application (AuthenticationService, ManageAdminService)

**Storage**:
- `Admin.password_hash` (String, 60 chars)
- `Table.password_hash` (String, 60 chars)

---

### 8.2 비밀번호 검증

**Rule**: 로그인 시 bcrypt.verify로 검증

**Behavior**:
1. 평문 비밀번호 입력
2. DB에서 password_hash 조회
3. bcrypt.verify(plain_password, password_hash)
4. 일치하면 JWT 토큰 발급

**Enforcement**:
- **Layer**: Application (AuthenticationService)

---

## 9. 메뉴 이미지 규칙 (Menu Image Rules)

### 9.1 이미지 저장 규칙

**Rule**: 이미지는 로컬 파일 시스템에 저장

**Storage Path**: `/uploads/menus/`

**File Naming**: `{UUID}.{extension}`
- UUID: 랜덤 UUID 생성
- Extension: 원본 파일 확장자 (jpg, png, gif)

**Example**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`

**Enforcement**:
- **Layer**: Application (MenuService)

---

### 9.2 이미지 URL 생성

**Rule**: 이미지 URL은 상대 경로로 저장

**Database Storage**: `/uploads/menus/{uuid}.{extension}`

**URL Serving**: FastAPI static files
```python
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

**Client Access**: `http://localhost:8000/uploads/menus/{uuid}.jpg`

**Enforcement**:
- **Layer**: Application (MenuService)

---

### 9.3 이미지 삭제 규칙

**Rule**: 메뉴 삭제 또는 이미지 변경 시 기존 이미지 파일 삭제

**Behavior**:
1. 메뉴 삭제 시: 이미지 파일 삭제
2. 메뉴 이미지 변경 시: 기존 이미지 삭제 → 신규 이미지 저장

**Enforcement**:
- **Layer**: Application (MenuService)

**Error Handling**:
- 파일 삭제 실패 시 로그 기록 (에러 반환 안 함)

---

## Summary

### Rule Categories
1. **주문 검증 규칙**: 5개
2. **상태 전이 규칙**: 3개
3. **세션 동시성 규칙**: 2개
4. **권한 검증 규칙**: 3개
5. **데이터 무결성 규칙**: 3개
6. **이벤트 발행 규칙**: 3개
7. **API 응답 규칙**: 3개
8. **비밀번호 보안 규칙**: 2개
9. **메뉴 이미지 규칙**: 3개

### Enforcement Layers
- **Database**: 제약 조건, FK, CHECK
- **Application**: 비즈니스 로직 검증
- **Middleware**: JWT 인증, 권한 검증
- **Infrastructure**: 이벤트 발행, SSE 필터링

### Key Design Decisions
1. **Hard Delete**: Soft delete 없음 (OrderHistory로 이력 관리)
2. **Event After Commit**: 트랜잭션 커밋 후 이벤트 발행
3. **Multi-tenant**: store_id로 매장별 데이터 격리
4. **State Machine**: 주문 상태 전이 검증
5. **Concurrency Control**: SELECT FOR UPDATE로 세션 동시성 제어
6. **No Refresh Token**: JWT 만료 시 재로그인 (단순성 우선)

---

**End of Business Rules Document**
