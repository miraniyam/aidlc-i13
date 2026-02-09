# Functional Design Plan - Unit 1: Backend API & Database

## Unit Context

### Unit Name
**Unit 1: Backend API & Database** (table-order-backend)

### Responsibilities
- 모든 비즈니스 로직 처리
- 데이터베이스 관리 (PostgreSQL)
- RESTful API 제공 (Customer, Admin, SuperAdmin)
- 실시간 이벤트 발행 (SSE)
- 인증 및 권한 관리 (JWT)
- OpenAPI 스키마 export (프론트엔드 공유)

### Assigned Stories
27개 User Stories (모든 스토리의 백엔드 로직)
- 고객 Journey: 10 stories
- 관리자 Journey: 12 stories
- 슈퍼 관리자 Journey: 5 stories

### Technology Stack
- Python 3.11+ / FastAPI
- SQLAlchemy 2.0 (ORM)
- PostgreSQL 15+
- JWT (PyJWT) / bcrypt
- Server-Sent Events (SSE)
- In-memory EventBus (Redis Pub/Sub for production)

---

## Functional Design Plan

### Phase 1: Domain Model Design
- [ ] 1.1 데이터 엔티티 정의 (9개 모델)
- [ ] 1.2 엔티티 간 관계 설계 (1:N, N:M)
- [ ] 1.3 데이터 제약 조건 정의 (Unique, Not Null, Check)
- [ ] 1.4 인덱스 전략 수립 (성능 최적화)

### Phase 2: Business Logic Modeling
- [ ] 2.1 인증 로직 설계 (테이블, 관리자, 슈퍼 관리자)
- [ ] 2.2 주문 생성 로직 설계 (트랜잭션, 검증)
- [ ] 2.3 주문 상태 전이 로직 설계 (State Machine)
- [ ] 2.4 테이블 세션 라이프사이클 설계
- [ ] 2.5 메뉴 관리 로직 설계 (CRUD, 이미지 처리)
- [ ] 2.6 관리자 계정 관리 로직 설계

### Phase 3: Business Rules Definition
- [ ] 3.1 주문 검증 규칙 정의
- [ ] 3.2 세션 동시성 규칙 정의
- [ ] 3.3 상태 전이 규칙 정의
- [ ] 3.4 권한 검증 규칙 정의
- [ ] 3.5 데이터 무결성 규칙 정의

### Phase 4: Event-Driven Architecture Design
- [ ] 4.1 이벤트 타입 정의 (OrderCreated, OrderStatusChanged)
- [ ] 4.2 이벤트 발행 시점 정의
- [ ] 4.3 이벤트 구독 및 처리 로직 설계
- [ ] 4.4 SSE 스트림 설계

### Phase 5: API Contract Design
- [ ] 5.1 Customer API 엔드포인트 설계 (Request/Response)
- [ ] 5.2 Admin API 엔드포인트 설계
- [ ] 5.3 SuperAdmin API 엔드포인트 설계
- [ ] 5.4 에러 응답 표준 정의

---

## Clarification Questions

### Domain Model Questions

#### Q1: Store 엔티티 범위
현재 시스템은 단일 매장을 가정하고 있습니다. Store 엔티티의 역할과 데이터 범위를 명확히 하고자 합니다.

**Options:**
A) 단일 매장 고정 (Store 레코드 1개, 하드코딩된 UUID)
B) 다중 매장 지원 (Store 레코드 N개, 매장별 데이터 격리)
C) Store 엔티티 제거 (매장 개념 없이 전역 데이터)

[Answer]: B

**Follow-up (if B):** 매장별 데이터 격리 방식은?
- 모든 테이블에 store_id FK 추가?
- Row-Level Security 사용?

[Answer]: store_id 사용

---

#### Q2: TableSession 동시성 제어
테이블 세션은 동시에 하나만 활성화되어야 합니다. 동시성 제어 방식을 결정해야 합니다.

**Options:**
A) Application-level lock (SELECT FOR UPDATE)
B) Database-level unique constraint (table_id + is_active)
C) Optimistic locking (version 컬럼)

[Answer]: a

**Follow-up:** 세션 생성 실패 시 기존 세션 처리 방식은?
- 기존 세션 자동 종료 후 신규 생성?
- 에러 반환 (관리자가 수동 종료)?

[Answer]: 자동 종료

---

#### Q3: Order와 OrderHistory 분리 전략
주문 데이터를 Order (활성)와 OrderHistory (완료)로 분리합니다. 데이터 이동 시점과 방식을 결정해야 합니다.

**Options:**
A) 세션 종료 시 일괄 이동 (CompleteTableSessionService)
B) 주문 상태가 'completed' 되면 즉시 이동
C) 배치 작업으로 주기적 이동 (예: 매일 자정)

[Answer]: A

**Follow-up:** OrderHistory 스키마는 Order와 동일한가요, 아니면 요약 데이터만 저장하나요?

[Answer]: 동일

---

#### Q4: Menu 이미지 저장 방식
메뉴 이미지는 로컬 파일 시스템에 저장됩니다. 파일 경로 및 URL 생성 방식을 결정해야 합니다.

**Options:**
A) 상대 경로 저장 (예: `/uploads/menus/{uuid}.jpg`), FastAPI static files로 서빙
B) 절대 경로 저장 (예: `/var/app/uploads/menus/{uuid}.jpg`)
C) S3 URL 저장 (향후 확장 고려)

[Answer]: A

**Follow-up:** 이미지 파일명 생성 규칙은?
- UUID + 원본 확장자?
- Timestamp + UUID?

[Answer]: UUID, 확장자

---

### Business Logic Questions

#### Q5: 테이블 자동 로그인 로직
고객은 테이블 ID와 비밀번호로 자동 로그인합니다. 세션 생성 및 재사용 로직을 명확히 해야 합니다.

**Scenario:**
1. 고객이 테이블 ID + 비밀번호 입력
2. 인증 성공 시 TableSession 확인
3. 활성 세션이 있으면 재사용, 없으면 신규 생성

**Questions:**
- 세션 재사용 시 JWT 토큰은 새로 발급하나요, 기존 토큰 재사용하나요?

[Answer]: 새로 발급

- 세션 생성 시 started_at은 현재 시각인가요, 아니면 첫 주문 시각인가요?

[Answer]: 현재 시각

---

#### Q6: 주문 생성 트랜잭션 범위
주문 생성 시 Order + OrderItem + Event 발행이 하나의 트랜잭션으로 처리되어야 합니다.

**Transaction Steps:**
1. Order 레코드 생성
2. OrderItem 레코드 N개 생성
3. EventBus.publish('OrderCreated')
4. Commit

**Questions:**
- EventBus.publish()는 트랜잭션 내부에서 실행되나요, 외부에서 실행되나요?
  - 내부: 트랜잭션 실패 시 이벤트도 롤백
  - 외부: 트랜잭션 성공 후 이벤트 발행 (eventual consistency)

[Answer]: EventBus.publish()는 트랜잭션 커밋 후 외부에서 실행합니다.
DB 커밋 성공 후에만 이벤트를 발행하여 데이터 일관성을 보장합니다.


- 주문 생성 시 재고 확인이 필요한가요? (Menu.is_available 체크)

[Answer]: 
주문 생성 시 Menu.is_available=True 체크만 수행합니다.
재고 수량 관리는 하지 않습니다 (품절 여부만 확인).

---

#### Q7: 주문 상태 전이 규칙
주문 상태는 State Machine으로 관리됩니다. 허용되는 상태 전이를 정의해야 합니다.

**Proposed States:**
- `pending` (주문 접수)
- `preparing` (조리 중)
- `ready` (준비 완료)
- `served` (서빙 완료)
- `cancelled` (취소)

**Questions:**
- 허용되는 상태 전이는?
  - pending → preparing, cancelled
  - preparing → ready, cancelled
  - ready → served
  - served → (종료 상태)
  - cancelled → (종료 상태)

[Answer]: 

- 특정 상태에서는 주문 삭제가 불가능한가요? (예: served 상태는 삭제 불가)

[Answer]: 

---

#### Q8: 테이블 세션 종료 로직
세션 종료 시 Order → OrderHistory 이동 및 세션 종료 처리가 트랜잭션으로 실행됩니다.

**Transaction Steps:**
1. TableSession 조회 (SELECT FOR UPDATE)
2. 해당 세션의 모든 Order 조회
3. OrderHistory 레코드 생성 (Order + OrderItem 데이터 복사)
4. Order 및 OrderItem 삭제
5. TableSession.is_active = False, ended_at = now()
6. Commit

**Questions:**
- 미완료 주문(pending, preparing)이 있을 때 세션 종료가 가능한가요?
  - A) 가능 (미완료 주문도 히스토리로 이동)
  - B) 불가능 (에러 반환, 모든 주문이 served 또는 cancelled 상태여야 함)

[Answer]: 

- OrderHistory는 Order와 OrderItem을 JSON으로 저장하나요, 아니면 별도 테이블로 정규화하나요?
  - A) JSON 컬럼 (order_data JSONB)
  - B) 정규화 (OrderHistory + OrderHistoryItem 테이블)

[Answer]: 

---

#### Q9: 메뉴 노출 순서 조정 로직 (Post-MVP)
관리자는 메뉴 노출 순서를 드래그 앤 드롭으로 조정할 수 있습니다.

**API Design:**
- PATCH /api/admin/menus/reorder
- Request Body: `[{menu_id: 1, display_order: 1}, {menu_id: 2, display_order: 2}, ...]`

**Questions:**
- display_order는 카테고리별로 독립적인가요, 전역적인가요?
  - A) 카테고리별 (같은 카테고리 내에서만 순서 조정)
  - B) 전역 (모든 메뉴에 대해 전역 순서)

[Answer]: 

- display_order 업데이트는 트랜잭션으로 처리되나요?

[Answer]: 

---

### Business Rules Questions

#### Q10: 주문 검증 규칙
주문 생성 시 검증해야 할 비즈니스 규칙을 정의해야 합니다.

**Proposed Rules:**
1. 주문 항목이 1개 이상이어야 함
2. 각 메뉴가 존재하고 is_available=True여야 함
3. 수량은 1 이상이어야 함
4. 테이블 세션이 활성 상태여야 함

**Questions:**
- 추가로 검증해야 할 규칙이 있나요? (예: 최소 주문 금액, 최대 주문 수량)

[Answer]: 

- 메뉴가 삭제되었거나 비활성화된 경우 주문 생성 시 어떻게 처리하나요?
  - A) 에러 반환 (해당 메뉴 제외하고 다시 주문)
  - B) 경고와 함께 주문 허용 (주문 내역에는 표시)

[Answer]: 

---

#### Q11: 권한 검증 규칙
각 API 엔드포인트는 적절한 권한을 가진 사용자만 접근할 수 있어야 합니다.

**Proposed Rules:**
- Customer API: JWT 토큰 필수, role='table'
- Admin API: JWT 토큰 필수, role='store_admin'
- SuperAdmin API: JWT 토큰 필수, role='super_admin'

**Questions:**
- 관리자는 자신이 속한 매장의 데이터만 접근 가능한가요? (Multi-tenant 고려)
  - A) Yes (store_id 필터링 필수)
  - B) No (단일 매장이므로 불필요)

[Answer]: 

- JWT 토큰 만료 시 처리 방식은?
  - A) 401 Unauthorized 반환 (재로그인 필요)
  - B) Refresh Token 제공 (자동 갱신)

[Answer]: 

---

#### Q12: 데이터 무결성 규칙
데이터베이스 레벨에서 보장해야 할 무결성 규칙을 정의해야 합니다.

**Proposed Constraints:**
1. Table.table_number는 매장 내 유니크
2. Admin.username은 전역 유니크
3. Order.table_session_id는 NOT NULL (세션 없는 주문 불가)
4. OrderItem.quantity > 0 (CHECK 제약)

**Questions:**
- 추가로 필요한 제약 조건이 있나요?

[Answer]: 

- Soft delete를 사용하나요, Hard delete를 사용하나요?
  - A) Soft delete (deleted_at 컬럼 추가, 논리적 삭제)
  - B) Hard delete (물리적 삭제)

[Answer]: 

---

### Event-Driven Architecture Questions

#### Q13: 이벤트 페이로드 설계
EventBus에서 발행하는 이벤트의 페이로드를 정의해야 합니다.

**Proposed Events:**
1. **OrderCreated**
   - order_id
   - table_id
   - table_number
   - items (menu_name, quantity, price)
   - total_price
   - created_at

2. **OrderStatusChanged**
   - order_id
   - table_id
   - old_status
   - new_status
   - updated_at

**Questions:**
- 이벤트 페이로드에 추가로 포함해야 할 정보가 있나요?

[Answer]: 

- 이벤트는 JSON 직렬화되나요, 아니면 Python 객체로 전달되나요?

[Answer]: 

---

#### Q14: SSE 연결 관리
관리자는 SSE를 통해 실시간 주문 업데이트를 받습니다. 연결 관리 방식을 결정해야 합니다.

**Questions:**
- SSE 연결은 관리자별로 독립적인가요, 전역 브로드캐스트인가요?
  - A) 관리자별 (각 관리자는 자신의 매장 이벤트만 수신)
  - B) 전역 (모든 관리자가 모든 이벤트 수신)

[Answer]: 

- SSE 연결 타임아웃은?
  - A) 무제한 (연결 유지)
  - B) 일정 시간 후 자동 종료 (예: 1시간)

[Answer]: 

- SSE 연결 끊김 시 재연결 로직은 클라이언트 책임인가요?

[Answer]: 

---

### API Contract Questions

#### Q15: 에러 응답 표준
모든 API는 일관된 에러 응답 형식을 사용해야 합니다.

**Proposed Format:**
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

**Questions:**
- 에러 코드 네이밍 규칙은?
  - A) UPPER_SNAKE_CASE
  - B) kebab-case
  - C) PascalCase

[Answer]: 

- HTTP 상태 코드 사용 규칙은?
  - 400: 클라이언트 입력 오류
  - 401: 인증 실패
  - 403: 권한 없음
  - 404: 리소스 없음
  - 409: 충돌 (예: 중복 세션)
  - 500: 서버 오류

[Answer]: 

---

#### Q16: Pagination 전략
목록 조회 API (메뉴 조회, 주문 내역 조회)는 페이지네이션을 지원해야 합니다.

**Options:**
A) Offset-based pagination (page, page_size)
B) Cursor-based pagination (cursor, limit)
C) No pagination (전체 데이터 반환)

[Answer]: 

**Follow-up (if A or B):** 기본 페이지 크기는?

[Answer]: 

---

## Plan Execution Checklist

### Pre-Execution
- [x] Unit context analyzed
- [x] Assigned stories reviewed
- [x] Technology stack confirmed
- [x] Clarification questions generated

### Execution
- [x] User answers collected
- [x] Ambiguities resolved
- [x] Domain entities documented
- [x] Business logic model documented
- [x] Business rules documented

### Post-Execution
- [x] Artifacts validated
- [x] User approval received
- [x] Progress logged in audit.md
- [x] aidlc-state.md updated

---

**Plan Status**: Complete - Approved by User (2026-02-09T15:46:46+09:00)

**Next Step**: User completes all [Answer]: tags, then AI proceeds to artifact generation.

Critical: If [Answer] item is empty, do in the way you think proper
