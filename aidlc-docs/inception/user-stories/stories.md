# User Stories - 테이블오더 서비스

## Overview
테이블오더 서비스의 User Stories를 User Journey 기반으로 구성했습니다. 각 스토리는 Feature 수준으로 작성되었으며, INVEST 기준을 준수합니다.

**Story Organization**: User Journey 기반
- **고객 Journey**: 로그인 → 메뉴 탐색 → 장바구니 → 주문 → 주문 확인
- **관리자 Journey**: 로그인 → 주문 모니터링 → 주문 관리 → 테이블 관리 → 메뉴 관리
- **슈퍼 관리자 Journey**: 로그인 → 관리자 계정 관리

**Story Format**:
- MVP: MVP 범위 포함
- Post-MVP: MVP 이후 구현
- Dependencies: 의존하는 스토리 ID
- Technical Notes: 기술 스택 및 구현 힌트

---

## 고객 Journey (Customer Journey)

### US-C01: 테이블 태블릿 자동 로그인

**As a** 고객  
**I want** 테이블 태블릿에서 별도 로그인 절차 없이 자동으로 로그인되기를 원한다  
**So that** 즉시 메뉴를 탐색하고 주문할 수 있다

**Description**:
관리자가 테이블 태블릿을 초기 설정하면, 고객은 태블릿을 켤 때마다 자동으로 로그인되어 메뉴 화면이 표시됩니다.

**Acceptance Criteria**:
- Given 관리자가 테이블 태블릿을 초기 설정했을 때
- When 고객이 태블릿을 켜면
- Then 자동으로 로그인되고 메뉴 화면이 표시된다
- And 로그인 정보는 로컬 스토리지에 저장된다
- And 페이지 새로고침 시에도 로그인 상태가 유지된다

**NFR**:
- 자동 로그인 응답 시간: 1초 이내
- 로컬 스토리지 암호화 (테이블 비밀번호)

**Priority**: MVP

**Dependencies**: None

**Technical Notes**:
- Frontend: React, localStorage for credentials
- Backend: FastAPI, JWT token for table session
- Auth: Table ID + Table Password → JWT token (16h expiry)

---

### US-C02: 메뉴 카테고리별 조회

**As a** 고객  
**I want** 메뉴를 카테고리별로 탐색하고 싶다  
**So that** 원하는 메뉴를 빠르게 찾을 수 있다

**Description**:
고객은 메뉴 화면에서 카테고리(메인요리, 사이드, 음료 등)를 선택하여 해당 카테고리의 메뉴 목록을 볼 수 있습니다.

**Acceptance Criteria**:
- [ ] 메뉴 화면이 기본 화면으로 표시된다
- [ ] 카테고리 목록이 상단에 표시된다
- [ ] 카테고리를 클릭하면 해당 카테고리의 메뉴가 표시된다
- [ ] 메뉴는 카드 형태로 표시된다 (이미지, 메뉴명, 가격, 설명)
- [ ] 터치 친화적 버튼 크기 (최소 44x44px)

**NFR**:
- 메뉴 로딩 시간: 2초 이내
- 카테고리 전환 시간: 1초 이내

**Priority**: MVP

**Dependencies**: US-C01

**Technical Notes**:
- Frontend: React, responsive card layout
- Backend: FastAPI, GET /api/menus?category={category_id}
- Database: PostgreSQL, Menu table with category_id FK

---

### US-C03: 메뉴 상세 정보 조회

**As a** 고객  
**I want** 메뉴의 상세 정보를 확인하고 싶다  
**So that** 메뉴를 선택하기 전에 충분한 정보를 얻을 수 있다

**Description**:
고객은 메뉴 카드를 클릭하여 메뉴의 상세 정보(이미지, 메뉴명, 가격, 설명)를 확인할 수 있습니다.

**Acceptance Criteria**:
- Given 메뉴 목록이 표시되었을 때
- When 고객이 메뉴 카드를 클릭하면
- Then 메뉴 상세 정보가 모달 또는 상세 페이지로 표시된다
- And 메뉴 이미지, 메뉴명, 가격, 설명이 표시된다
- And "장바구니에 추가" 버튼이 표시된다

**Priority**: MVP

**Dependencies**: US-C02

**Technical Notes**:
- Frontend: React Modal or Detail Page
- Backend: GET /api/menus/{menu_id}
- Image: Served from local file system

---

### US-C04: 장바구니에 메뉴 추가

**As a** 고객  
**I want** 선택한 메뉴를 장바구니에 추가하고 싶다  
**So that** 여러 메뉴를 선택한 후 한 번에 주문할 수 있다

**Description**:
고객은 메뉴 상세 화면에서 "장바구니에 추가" 버튼을 클릭하여 메뉴를 장바구니에 추가할 수 있습니다.

**Acceptance Criteria**:
- Given 메뉴 상세 정보가 표시되었을 때
- When 고객이 "장바구니에 추가" 버튼을 클릭하면
- Then 메뉴가 장바구니에 추가된다
- And 장바구니 아이콘에 아이템 개수가 표시된다
- And 성공 메시지가 표시된다 (예: "장바구니에 추가되었습니다")

**NFR**:
- 장바구니 추가 응답 시간: 0.5초 이내

**Priority**: MVP

**Dependencies**: US-C03

**Technical Notes**:
- Frontend: React, localStorage for cart items
- Cart data structure: [{menu_id, menu_name, price, quantity, image_url}]

---

### US-C05: 장바구니에서 수량 조절

**As a** 고객  
**I want** 장바구니에서 메뉴 수량을 조절하고 싶다  
**So that** 주문 수량을 정확히 설정할 수 있다

**Description**:
고객은 장바구니 화면에서 각 메뉴의 수량을 증가 또는 감소시킬 수 있습니다.

**Acceptance Criteria**:
- [ ] 장바구니 화면에 각 메뉴의 수량 조절 버튼(+/-)이 표시된다
- [ ] "+" 버튼 클릭 시 수량이 1 증가한다
- [ ] "-" 버튼 클릭 시 수량이 1 감소한다
- [ ] 수량이 1일 때 "-" 버튼 클릭 시 메뉴가 장바구니에서 제거된다
- [ ] 총 금액이 실시간으로 재계산된다

**NFR**:
- 수량 변경 응답 시간: 즉시 (클라이언트 측 계산)

**Priority**: MVP

**Dependencies**: US-C04

**Technical Notes**:
- Frontend: React state management for cart
- Real-time calculation: quantity * unit_price

---

### US-C06: 장바구니에서 메뉴 삭제

**As a** 고객  
**I want** 장바구니에서 메뉴를 삭제하고 싶다  
**So that** 잘못 추가한 메뉴를 제거할 수 있다

**Description**:
고객은 장바구니 화면에서 "삭제" 버튼을 클릭하여 메뉴를 장바구니에서 제거할 수 있습니다.

**Acceptance Criteria**:
- Given 장바구니에 메뉴가 있을 때
- When 고객이 "삭제" 버튼을 클릭하면
- Then 해당 메뉴가 장바구니에서 제거된다
- And 총 금액이 재계산된다
- And 장바구니 아이콘의 아이템 개수가 업데이트된다

**Priority**: MVP

**Dependencies**: US-C04

**Technical Notes**:
- Frontend: React, filter cart items by menu_id

---

### US-C07: 장바구니 비우기

**As a** 고객  
**I want** 장바구니를 한 번에 비우고 싶다  
**So that** 모든 메뉴를 다시 선택할 수 있다

**Description**:
고객은 장바구니 화면에서 "장바구니 비우기" 버튼을 클릭하여 모든 메뉴를 한 번에 제거할 수 있습니다.

**Acceptance Criteria**:
- Given 장바구니에 메뉴가 있을 때
- When 고객이 "장바구니 비우기" 버튼을 클릭하면
- Then 확인 팝업이 표시된다
- And 고객이 확인하면 모든 메뉴가 장바구니에서 제거된다
- And 총 금액이 0으로 표시된다

**Priority**: MVP

**Dependencies**: US-C04

**Technical Notes**:
- Frontend: React, clear localStorage cart data

---

### US-C08: 주문 생성

**As a** 고객  
**I want** 장바구니의 메뉴를 주문하고 싶다  
**So that** 주문이 매장에 전달되고 음식을 받을 수 있다

**Description**:
고객은 장바구니 화면에서 "주문하기" 버튼을 클릭하여 주문을 생성할 수 있습니다.

**Acceptance Criteria**:
- Given 장바구니에 메뉴가 있을 때
- When 고객이 "주문하기" 버튼을 클릭하면
- Then 주문 확인 화면이 표시된다 (메뉴 목록, 총 금액)
- And 고객이 "확정" 버튼을 클릭하면 주문이 서버로 전송된다
- And 주문 성공 시 주문 번호가 표시된다
- And 장바구니가 자동으로 비워진다
- And 5초 후 메뉴 화면으로 자동 리다이렉트된다
- And 주문 실패 시 에러 메시지가 표시되고 장바구니가 유지된다

**NFR**:
- 주문 생성 응답 시간: 2초 이내
- 주문 데이터 무결성 보장 (ACID)

**Priority**: MVP

**Dependencies**: US-C04, US-C01

**Technical Notes**:
- Frontend: React, POST /api/orders
- Backend: FastAPI, create Order + OrderItems
- Database: PostgreSQL transaction
- Order data: {session_id, table_id, store_id, items: [{menu_id, quantity, unit_price}], total_amount}

---

### US-C09: 주문 내역 조회

**As a** 고객  
**I want** 내가 주문한 내역을 확인하고 싶다  
**So that** 주문이 제대로 전달되었는지 확인할 수 있다

**Description**:
고객은 주문 내역 화면에서 현재 테이블 세션의 모든 주문을 시간 순으로 확인할 수 있습니다.

**Acceptance Criteria**:
- [ ] 주문 내역 화면에 현재 세션의 모든 주문이 표시된다
- [ ] 주문은 시간 역순으로 정렬된다 (최신 주문이 위)
- [ ] 각 주문에는 주문 번호, 시각, 메뉴 목록, 총 금액, 상태가 표시된다
- [ ] 주문 상태는 대기중/준비중/요리완료/전달완료로 표시된다
- [ ] 이전 세션의 주문은 표시되지 않는다

**NFR**:
- 주문 내역 로딩 시간: 2초 이내

**Priority**: MVP

**Dependencies**: US-C08

**Technical Notes**:
- Frontend: React, GET /api/orders?session_id={session_id}
- Backend: FastAPI, filter by session_id and active session
- Database: PostgreSQL, Order table with session_id FK

---

### US-C10: 주문 상태 실시간 업데이트

**As a** 고객  
**I want** 주문 상태가 자동으로 업데이트되기를 원한다  
**So that** 주문 진행 상황을 실시간으로 확인할 수 있다

**Description**:
고객은 주문 내역 화면에서 주문 상태가 30초마다 자동으로 업데이트되는 것을 확인할 수 있습니다.

**Acceptance Criteria**:
- Given 주문 내역 화면이 표시되었을 때
- When 30초가 경과하면
- Then 서버에서 최신 주문 상태를 가져온다
- And 주문 상태가 변경되었으면 화면에 반영된다
- And 상태 변경 시 시각적 피드백이 제공된다 (예: 색상 변경)

**NFR**:
- 폴링 간격: 30초
- 상태 업데이트 응답 시간: 1초 이내

**Priority**: MVP

**Dependencies**: US-C09

**Technical Notes**:
- Frontend: React, setInterval for polling every 30s
- Backend: GET /api/orders?session_id={session_id}
- Polling mechanism: JavaScript setInterval

---

## 관리자 Journey (Store Admin Journey)

### US-A01: 매장 관리자 로그인

**As a** 매장 관리자  
**I want** 매장 관리 시스템에 로그인하고 싶다  
**So that** 주문을 모니터링하고 관리할 수 있다

**Description**:
매장 관리자는 매장 식별자, 사용자명, 비밀번호를 입력하여 관리 시스템에 로그인할 수 있습니다.

**Acceptance Criteria**:
- [ ] 로그인 화면에 매장 식별자, 사용자명, 비밀번호 입력 필드가 표시된다
- [ ] 올바른 정보 입력 시 로그인에 성공하고 대시보드로 이동한다
- [ ] 잘못된 정보 입력 시 에러 메시지가 표시된다
- [ ] 로그인 성공 시 JWT 토큰이 발급된다 (16시간 유효)
- [ ] 브라우저 새로고침 시에도 로그인 상태가 유지된다

**NFR**:
- 로그인 응답 시간: 2초 이내
- 비밀번호 bcrypt 해싱
- JWT 토큰 16시간 유효

**Priority**: MVP

**Dependencies**: None

**Technical Notes**:
- Frontend: React, localStorage for JWT token
- Backend: FastAPI, POST /api/admin/login
- Auth: bcrypt password verification, JWT token generation
- Database: PostgreSQL, Admin table

---

### US-A02: 실시간 주문 모니터링 대시보드

**As a** 매장 관리자  
**I want** 모든 테이블의 주문을 실시간으로 모니터링하고 싶다  
**So that** 주문 상황을 한눈에 파악하고 빠르게 대응할 수 있다

**Description**:
매장 관리자는 대시보드에서 테이블별 주문 카드를 그리드 형태로 확인할 수 있으며, 신규 주문이 들어오면 실시간으로 업데이트됩니다.

**Acceptance Criteria**:
- Given 관리자가 로그인했을 때
- When 대시보드 화면이 표시되면
- Then 모든 테이블의 주문 카드가 그리드 형태로 표시된다
- And 각 테이블 카드에는 테이블 번호, 총 주문액, 최신 주문 n개가 표시된다
- And 신규 주문이 들어오면 2초 이내에 대시보드에 표시된다
- And 신규 주문은 시각적으로 강조된다 (색상 변경, 애니메이션)

**NFR**:
- 실시간 업데이트: SSE (Server-Sent Events)
- 신규 주문 표시 시간: 2초 이내
- 동시 접속 관리자: 10명

**Priority**: MVP

**Dependencies**: US-A01

**Technical Notes**:
- Frontend: React, EventSource for SSE
- Backend: FastAPI, SSE endpoint /api/admin/orders/stream
- Real-time: Server-Sent Events (SSE)
- Database: PostgreSQL, Order table with real-time query

---

### US-A03: 주문 상세 정보 조회

**As a** 매장 관리자  
**I want** 테이블의 주문 상세 정보를 확인하고 싶다  
**So that** 주문 내용을 정확히 파악할 수 있다

**Description**:
매장 관리자는 테이블 카드를 클릭하여 해당 테이블의 모든 주문 상세 정보를 확인할 수 있습니다.

**Acceptance Criteria**:
- Given 대시보드에 테이블 카드가 표시되었을 때
- When 관리자가 테이블 카드를 클릭하면
- Then 주문 상세 모달 또는 페이지가 표시된다
- And 모든 주문의 전체 메뉴 목록이 표시된다
- And 각 주문의 주문 번호, 시각, 상태, 총 금액이 표시된다

**Priority**: MVP

**Dependencies**: US-A02

**Technical Notes**:
- Frontend: React Modal or Detail Page
- Backend: GET /api/admin/orders?table_id={table_id}

---

### US-A04: 주문 상태 변경

**As a** 매장 관리자  
**I want** 주문 상태를 변경하고 싶다  
**So that** 주문 진행 상황을 관리할 수 있다

**Description**:
매장 관리자는 주문 상세 화면에서 주문 상태를 대기중 → 준비중 → 요리완료 → 전달완료로 변경할 수 있습니다.

**Acceptance Criteria**:
- [ ] 주문 상세 화면에 상태 변경 버튼이 표시된다
- [ ] 현재 상태에 따라 다음 상태로 변경할 수 있다
  - 대기중 → 준비중
  - 준비중 → 요리완료
  - 요리완료 → 전달완료
- [ ] 상태 변경 시 확인 팝업이 표시된다
- [ ] 상태 변경 성공 시 화면에 즉시 반영된다
- [ ] 상태 변경 실패 시 에러 메시지가 표시된다

**NFR**:
- 상태 변경 응답 시간: 1초 이내

**Priority**: MVP

**Dependencies**: US-A03

**Technical Notes**:
- Frontend: React, PATCH /api/admin/orders/{order_id}/status
- Backend: FastAPI, update Order status
- Database: PostgreSQL, Order table status field
- Status enum: pending, preparing, cooked, delivered

---

### US-A05: 주문 삭제

**As a** 매장 관리자  
**I want** 잘못된 주문을 삭제하고 싶다  
**So that** 주문 오류를 수정할 수 있다

**Description**:
매장 관리자는 주문 상세 화면에서 "삭제" 버튼을 클릭하여 주문을 삭제할 수 있습니다.

**Acceptance Criteria**:
- Given 주문 상세 화면이 표시되었을 때
- When 관리자가 "삭제" 버튼을 클릭하면
- Then 확인 팝업이 표시된다
- And 관리자가 확인하면 주문이 즉시 삭제된다
- And 테이블 총 주문액이 재계산된다
- And 성공 메시지가 표시된다

**NFR**:
- 주문 삭제 응답 시간: 1초 이내

**Priority**: MVP

**Dependencies**: US-A03

**Technical Notes**:
- Frontend: React, DELETE /api/admin/orders/{order_id}
- Backend: FastAPI, soft delete or hard delete Order
- Database: PostgreSQL, cascade delete OrderItems

---

### US-A06: 테이블 세션 종료 (이용 완료)

**As a** 매장 관리자  
**I want** 고객이 식사를 마치면 테이블 세션을 종료하고 싶다  
**So that** 다음 고객이 새로운 세션으로 시작할 수 있다

**Description**:
매장 관리자는 테이블 카드에서 "이용 완료" 버튼을 클릭하여 테이블 세션을 종료할 수 있습니다.

**Acceptance Criteria**:
- Given 테이블에 활성 세션이 있을 때
- When 관리자가 "이용 완료" 버튼을 클릭하면
- Then 확인 팝업이 표시된다
- And 관리자가 확인하면 세션이 종료된다
- And 해당 세션의 모든 주문이 과거 이력으로 이동한다
- And 테이블 현재 주문 목록이 0으로 리셋된다
- And 테이블 총 주문액이 0으로 리셋된다

**NFR**:
- 세션 종료 응답 시간: 2초 이내

**Priority**: MVP

**Dependencies**: US-A02

**Technical Notes**:
- Frontend: React, POST /api/admin/tables/{table_id}/complete-session
- Backend: FastAPI, update TableSession end_time, move orders to OrderHistory
- Database: PostgreSQL, TableSession table, OrderHistory table

---

### US-A07: 과거 주문 내역 조회

**As a** 매장 관리자  
**I want** 테이블의 과거 주문 내역을 조회하고 싶다  
**So that** 이전 주문 정보를 확인할 수 있다

**Description**:
매장 관리자는 테이블 카드에서 "과거 내역" 버튼을 클릭하여 해당 테이블의 과거 주문 목록을 확인할 수 있습니다.

**Acceptance Criteria**:
- [ ] 테이블 카드에 "과거 내역" 버튼이 표시된다
- [ ] 버튼 클릭 시 과거 주문 목록 모달이 표시된다
- [ ] 과거 주문은 시간 역순으로 정렬된다
- [ ] 각 주문에는 주문 번호, 시각, 메뉴 목록, 총 금액, 완료 시각이 표시된다
- [ ] 날짜 필터링 기능이 제공된다
- [ ] "닫기" 버튼으로 대시보드로 복귀한다

**NFR**:
- 과거 내역 로딩 시간: 3초 이내
- 데이터 보관 기간: 6개월

**Priority**: MVP

**Dependencies**: US-A06

**Technical Notes**:
- Frontend: React Modal, date picker for filtering
- Backend: GET /api/admin/tables/{table_id}/order-history?from={date}&to={date}
- Database: PostgreSQL, OrderHistory table

---

### US-A08: 메뉴 조회

**As a** 매장 관리자  
**I want** 현재 등록된 메뉴 목록을 조회하고 싶다  
**So that** 메뉴 현황을 파악할 수 있다

**Description**:
매장 관리자는 메뉴 관리 화면에서 카테고리별 메뉴 목록을 확인할 수 있습니다.

**Acceptance Criteria**:
- Given 관리자가 메뉴 관리 화면에 접속했을 때
- When 화면이 로드되면
- Then 모든 메뉴가 카테고리별로 표시된다
- And 각 메뉴에는 메뉴명, 가격, 설명, 이미지, 노출 순서가 표시된다

**Priority**: MVP

**Dependencies**: US-A01

**Technical Notes**:
- Frontend: React, GET /api/admin/menus
- Backend: FastAPI, return all menus grouped by category
- Database: PostgreSQL, Menu table with category_id FK

---

### US-A09: 메뉴 등록

**As a** 매장 관리자  
**I want** 새로운 메뉴를 등록하고 싶다  
**So that** 고객이 새 메뉴를 주문할 수 있다

**Description**:
매장 관리자는 메뉴 관리 화면에서 "메뉴 추가" 버튼을 클릭하여 새 메뉴를 등록할 수 있습니다.

**Acceptance Criteria**:
- [ ] "메뉴 추가" 버튼 클릭 시 메뉴 등록 폼이 표시된다
- [ ] 메뉴명, 가격, 설명, 카테고리, 이미지 업로드 필드가 제공된다
- [ ] 필수 필드 검증이 수행된다 (메뉴명, 가격, 카테고리)
- [ ] 이미지 업로드 시 로컬 파일 시스템에 저장된다
- [ ] 등록 성공 시 메뉴 목록에 즉시 반영된다

**NFR**:
- 메뉴 등록 응답 시간: 3초 이내
- 이미지 파일 크기 제한: 5MB

**Priority**: MVP

**Dependencies**: US-A08

**Technical Notes**:
- Frontend: React, POST /api/admin/menus with multipart/form-data
- Backend: FastAPI, save image to local file system, create Menu record
- Database: PostgreSQL, Menu table
- Image storage: Local file system (/uploads/menus/)

---

### US-A10: 메뉴 수정

**As a** 매장 관리자  
**I want** 기존 메뉴 정보를 수정하고 싶다  
**So that** 메뉴 정보를 최신 상태로 유지할 수 있다

**Description**:
매장 관리자는 메뉴 목록에서 "수정" 버튼을 클릭하여 메뉴 정보를 수정할 수 있습니다.

**Acceptance Criteria**:
- Given 메뉴 목록이 표시되었을 때
- When 관리자가 "수정" 버튼을 클릭하면
- Then 메뉴 수정 폼이 표시된다 (기존 정보 pre-filled)
- And 관리자가 정보를 수정하고 저장하면
- Then 메뉴 정보가 업데이트된다
- And 메뉴 목록에 즉시 반영된다

**Priority**: MVP

**Dependencies**: US-A08

**Technical Notes**:
- Frontend: React, PATCH /api/admin/menus/{menu_id}
- Backend: FastAPI, update Menu record
- Database: PostgreSQL, Menu table

---

### US-A11: 메뉴 삭제

**As a** 매장 관리자  
**I want** 메뉴를 삭제하고 싶다  
**So that** 더 이상 제공하지 않는 메뉴를 제거할 수 있다

**Description**:
매장 관리자는 메뉴 목록에서 "삭제" 버튼을 클릭하여 메뉴를 삭제할 수 있습니다.

**Acceptance Criteria**:
- Given 메뉴 목록이 표시되었을 때
- When 관리자가 "삭제" 버튼을 클릭하면
- Then 확인 팝업이 표시된다
- And 관리자가 확인하면 메뉴가 삭제된다
- And 메뉴 목록에서 즉시 제거된다

**Priority**: MVP

**Dependencies**: US-A08

**Technical Notes**:
- Frontend: React, DELETE /api/admin/menus/{menu_id}
- Backend: FastAPI, soft delete or hard delete Menu
- Database: PostgreSQL, Menu table

---

### US-A12: 메뉴 노출 순서 조정

**As a** 매장 관리자  
**I want** 메뉴의 노출 순서를 조정하고 싶다  
**So that** 인기 메뉴를 상단에 배치할 수 있다

**Description**:
매장 관리자는 메뉴 목록에서 드래그 앤 드롭으로 메뉴 순서를 변경할 수 있습니다.

**Acceptance Criteria**:
- [ ] 메뉴 목록에서 드래그 앤 드롭이 가능하다
- [ ] 순서 변경 시 즉시 저장된다
- [ ] 고객 화면에 변경된 순서가 반영된다

**Priority**: Post-MVP

**Dependencies**: US-A08

**Technical Notes**:
- Frontend: React DnD library, PATCH /api/admin/menus/reorder
- Backend: FastAPI, update display_order for multiple menus
- Database: PostgreSQL, Menu table display_order field

---

## 슈퍼 관리자 Journey (Super Admin Journey)

### US-SA01: 슈퍼 관리자 로그인

**As a** 슈퍼 관리자  
**I want** 슈퍼 관리자 시스템에 로그인하고 싶다  
**So that** 매장 관리자 계정을 관리할 수 있다

**Description**:
슈퍼 관리자는 사용자명과 비밀번호를 입력하여 슈퍼 관리자 시스템에 로그인할 수 있습니다.

**Acceptance Criteria**:
- [ ] 로그인 화면에 사용자명, 비밀번호 입력 필드가 표시된다
- [ ] 올바른 정보 입력 시 로그인에 성공하고 관리자 계정 관리 화면으로 이동한다
- [ ] 잘못된 정보 입력 시 에러 메시지가 표시된다
- [ ] 로그인 성공 시 JWT 토큰이 발급된다 (16시간 유효)

**NFR**:
- 로그인 응답 시간: 2초 이내
- 비밀번호 bcrypt 해싱

**Priority**: MVP

**Dependencies**: None

**Technical Notes**:
- Frontend: React, POST /api/superadmin/login
- Backend: FastAPI, JWT token generation
- Database: PostgreSQL, Admin table with role='super_admin'

---

### US-SA02: 매장 관리자 계정 생성

**As a** 슈퍼 관리자  
**I want** 새로운 매장 관리자 계정을 생성하고 싶다  
**So that** 새 매장의 관리자가 시스템을 사용할 수 있다

**Description**:
슈퍼 관리자는 매장 관리자 계정 생성 폼에서 매장 식별자, 사용자명, 초기 비밀번호를 입력하여 계정을 생성할 수 있습니다.

**Acceptance Criteria**:
- Given 슈퍼 관리자가 로그인했을 때
- When "계정 생성" 버튼을 클릭하면
- Then 계정 생성 폼이 표시된다
- And 매장 식별자 (UUID 자동 생성), 사용자명, 초기 비밀번호 필드가 제공된다
- And 필수 필드 검증이 수행된다
- And 생성 성공 시 계정 목록에 즉시 반영된다

**NFR**:
- 계정 생성 응답 시간: 2초 이내
- 매장 식별자: UUID v4 자동 생성

**Priority**: MVP

**Dependencies**: US-SA01

**Technical Notes**:
- Frontend: React, POST /api/superadmin/admins
- Backend: FastAPI, generate UUID for store_id, bcrypt password hashing
- Database: PostgreSQL, Admin table with role='store_admin'

---

### US-SA03: 매장 관리자 계정 조회

**As a** 슈퍼 관리자  
**I want** 모든 매장 관리자 계정 목록을 조회하고 싶다  
**So that** 계정 현황을 파악할 수 있다

**Description**:
슈퍼 관리자는 매장 관리자 계정 목록 화면에서 모든 계정을 확인할 수 있습니다.

**Acceptance Criteria**:
- [ ] 계정 목록 화면에 모든 매장 관리자 계정이 표시된다
- [ ] 각 계정에는 매장 식별자, 사용자명, 생성일, 상태(활성/비활성)가 표시된다
- [ ] 검색 및 필터링 기능이 제공된다

**Priority**: MVP

**Dependencies**: US-SA01

**Technical Notes**:
- Frontend: React, GET /api/superadmin/admins
- Backend: FastAPI, return all store admins
- Database: PostgreSQL, Admin table with role='store_admin'

---

### US-SA04: 매장 관리자 계정 비활성화

**As a** 슈퍼 관리자  
**I want** 매장 관리자 계정을 비활성화하고 싶다  
**So that** 퇴사한 관리자의 접근을 차단할 수 있다

**Description**:
슈퍼 관리자는 계정 목록에서 "비활성화" 버튼을 클릭하여 매장 관리자 계정을 비활성화할 수 있습니다.

**Acceptance Criteria**:
- Given 계정 목록이 표시되었을 때
- When 슈퍼 관리자가 "비활성화" 버튼을 클릭하면
- Then 확인 팝업이 표시된다
- And 확인하면 계정이 비활성화된다
- And 해당 관리자는 더 이상 로그인할 수 없다
- And 계정 목록에 상태가 "비활성"으로 표시된다

**Priority**: MVP

**Dependencies**: US-SA03

**Technical Notes**:
- Frontend: React, PATCH /api/superadmin/admins/{admin_id}/deactivate
- Backend: FastAPI, update Admin is_active=False
- Database: PostgreSQL, Admin table is_active field

---

### US-SA05: 매장 관리자 계정 활성화

**As a** 슈퍼 관리자  
**I want** 비활성화된 매장 관리자 계정을 다시 활성화하고 싶다  
**So that** 복직한 관리자가 시스템을 사용할 수 있다

**Description**:
슈퍼 관리자는 계정 목록에서 "활성화" 버튼을 클릭하여 비활성화된 계정을 다시 활성화할 수 있습니다.

**Acceptance Criteria**:
- Given 비활성 계정이 목록에 표시되었을 때
- When 슈퍼 관리자가 "활성화" 버튼을 클릭하면
- Then 계정이 활성화된다
- And 해당 관리자가 다시 로그인할 수 있다
- And 계정 목록에 상태가 "활성"으로 표시된다

**Priority**: MVP

**Dependencies**: US-SA03

**Technical Notes**:
- Frontend: React, PATCH /api/superadmin/admins/{admin_id}/activate
- Backend: FastAPI, update Admin is_active=True
- Database: PostgreSQL, Admin table is_active field

---

## Summary

### Story Count
- **고객 Journey**: 10 stories (US-C01 ~ US-C10)
- **관리자 Journey**: 12 stories (US-A01 ~ US-A12)
- **슈퍼 관리자 Journey**: 5 stories (US-SA01 ~ US-SA05)
- **Total**: 27 stories

### MVP vs Post-MVP
- **MVP**: 26 stories
- **Post-MVP**: 1 story (US-A12: 메뉴 노출 순서 조정)

### Story Organization
Stories are organized by **User Journey**:
1. **고객 Journey**: 로그인 → 메뉴 탐색 → 장바구니 → 주문 → 주문 확인
2. **관리자 Journey**: 로그인 → 주문 모니터링 → 주문 관리 → 테이블 관리 → 메뉴 관리
3. **슈퍼 관리자 Journey**: 로그인 → 관리자 계정 관리

### INVEST Criteria Compliance
All stories follow INVEST principles:
- **Independent**: Stories can be developed independently (with noted dependencies)
- **Negotiable**: Stories focus on user goals, not implementation details
- **Valuable**: Each story delivers value to a specific persona
- **Estimable**: Stories are sized at Feature level for estimation
- **Small**: Stories are small enough to complete in a sprint
- **Testable**: Acceptance criteria provide clear test cases

### Technical Stack Summary
- **Frontend**: React, localStorage, EventSource (SSE), React DnD
- **Backend**: FastAPI, JWT authentication, bcrypt, SSE
- **Database**: PostgreSQL with ACID transactions
- **Image Storage**: Local file system
- **Real-time**: Server-Sent Events (SSE) for admin dashboard, 30s polling for customer

### Key Dependencies
- Customer stories depend on US-C01 (auto-login)
- Admin stories depend on US-A01 (admin login)
- Super Admin stories depend on US-SA01 (super admin login)
- Order management stories depend on order creation (US-C08)
- Menu management stories depend on menu listing (US-A08)

---

## User Journey Map

### 고객 Journey Flow
```
US-C01 (Auto Login)
    ↓
US-C02 (Browse Menus) → US-C03 (View Menu Details)
    ↓
US-C04 (Add to Cart) → US-C05 (Adjust Quantity) / US-C06 (Remove Item) / US-C07 (Clear Cart)
    ↓
US-C08 (Create Order)
    ↓
US-C09 (View Order History) → US-C10 (Real-time Status Update)
```

### 관리자 Journey Flow
```
US-A01 (Admin Login)
    ↓
US-A02 (Dashboard) → US-A03 (Order Details) → US-A04 (Change Status) / US-A05 (Delete Order)
    ↓
US-A06 (Complete Session) → US-A07 (View History)
    ↓
US-A08 (List Menus) → US-A09 (Add Menu) / US-A10 (Edit Menu) / US-A11 (Delete Menu) / US-A12 (Reorder)
```

### 슈퍼 관리자 Journey Flow
```
US-SA01 (Super Admin Login)
    ↓
US-SA02 (Create Admin) / US-SA03 (List Admins) → US-SA04 (Deactivate) / US-SA05 (Activate)
```

---

**End of User Stories Document**

