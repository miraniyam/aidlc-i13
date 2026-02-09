# Functional Design Plan - Unit 3 (Admin Frontend)

## Context

### Unit Information
- **Unit Name**: Admin Frontend (table-order-admin-ui)
- **Type**: Frontend Application (React + TypeScript)
- **Assigned Stories**: 12 stories (US-A01 ~ US-A12)
- **Primary Responsibilities**:
  - 관리자 로그인 및 인증
  - 실시간 주문 모니터링 (SSE)
  - 주문 관리 (상태 변경, 삭제)
  - 테이블 세션 관리
  - 메뉴 CRUD
  - 과거 주문 내역 조회

### Technology Stack
- React 18+, TypeScript
- React Query (서버 상태)
- EventSource (SSE)
- React Router
- Axios
- Tailwind CSS or Material-UI
- Vite

---

## Functional Design Questions

### Q1: UI Layout & Navigation Structure
관리자 대시보드의 전체 레이아웃과 네비게이션 구조를 어떻게 구성하시겠습니까?

**Options**:
A) **Single Page Dashboard** - 모든 기능이 하나의 대시보드에 통합 (탭 또는 섹션으로 구분)
B) **Multi-Page with Sidebar** - 사이드바 네비게이션으로 페이지 전환 (대시보드, 메뉴 관리 등 별도 페이지)
C) **Tab-based Navigation** - 상단 탭으로 주요 기능 전환
D) **Custom** - 직접 명시

[Answer]: B

---

### Q2: Real-time Dashboard Update Strategy
실시간 주문 모니터링 대시보드의 업데이트 전략은?

**Context**: SSE로 신규 주문 및 상태 변경 이벤트를 수신합니다.

**Options**:
A) **Full Refresh** - 이벤트 수신 시 전체 주문 목록 다시 조회
B) **Incremental Update** - 이벤트 데이터로 기존 상태만 업데이트 (optimistic update)
C) **Hybrid** - 신규 주문은 추가, 상태 변경은 업데이트, 주기적으로 전체 동기화

[Answer]: C

---

### Q3: SSE Connection Management
SSE 연결이 끊어졌을 때 재연결 전략은?

**Options**:
A) **Auto-reconnect with exponential backoff** - 자동 재연결 (1초, 2초, 4초, ... 최대 30초)
B) **Manual reconnect** - 사용자에게 알림 후 수동 재연결 버튼 제공
C) **Immediate reconnect** - 즉시 재연결 시도 (무한 루프 위험)

[Answer]: A

---

### Q4: Table Card Display Logic
대시보드의 테이블 카드에 표시할 정보는?

**Context**: 각 테이블의 현재 상태를 카드 형태로 표시합니다.

**Options**:
A) **Minimal** - 테이블 번호, 총 주문액, 최신 주문 1개
B) **Standard** - 테이블 번호, 총 주문액, 최신 주문 3개, 주문 개수
C) **Detailed** - 테이블 번호, 총 주문액, 모든 주문 목록, 세션 시작 시간
D) **Custom** - 직접 명시

[Answer]: B

---

### Q5: Order Status Transition Validation (Frontend)
프론트엔드에서 주문 상태 전이를 검증하시겠습니까?

**Context**: 백엔드에서 이미 상태 전이를 검증하지만, 프론트엔드에서도 UI 레벨 검증 가능합니다.

**Options**:
A) **Frontend Validation** - 프론트엔드에서 허용된 상태 전이만 버튼 활성화 (예: pending → preparing만 가능)
B) **Backend Only** - 프론트엔드는 모든 상태 전이 버튼 표시, 백엔드 에러 처리
C) **Hybrid** - 프론트엔드 UI 가이드 + 백엔드 최종 검증

[Answer]: C

---

### Q6: Menu Image Upload Handling
메뉴 이미지 업로드 시 프론트엔드 처리 방식은?

**Options**:
A) **Direct Upload** - 이미지 파일을 직접 백엔드로 전송 (multipart/form-data)
B) **Preview + Upload** - 이미지 미리보기 후 업로드
C) **Drag & Drop + Preview** - 드래그 앤 드롭 지원 + 미리보기

[Answer]: B

---

### Q7: Error Handling & User Feedback
API 호출 실패 시 사용자 피드백 방식은?

**Options**:
A) **Toast Notifications** - 화면 상단/하단에 일시적 알림 (3-5초)
B) **Modal Dialogs** - 에러 모달 팝업 (확인 버튼 필요)
C) **Inline Errors** - 해당 컴포넌트 내부에 에러 메시지 표시
D) **Combination** - Toast (일반 에러) + Modal (중요 에러)

[Answer]: D

---

### Q8: Order History Date Range
과거 주문 내역 조회 시 기본 날짜 범위는?

**Options**:
A) **Today Only** - 오늘 날짜만 기본 조회
B) **Last 7 Days** - 최근 7일
C) **Last 30 Days** - 최근 30일
D) **Custom** - 사용자가 직접 선택 (기본값 없음)

[Answer]: B

---

### Q9: Menu Management - Category Handling
메뉴 등록/수정 시 카테고리 선택 방식은?

**Context**: 메뉴는 카테고리에 속합니다 (MenuCategory).

**Options**:
A) **Dropdown Select** - 기존 카테고리 목록에서 선택만 가능
B) **Dropdown + Create New** - 기존 카테고리 선택 또는 신규 카테고리 생성
C) **Separate Category Management** - 카테고리는 별도 관리 화면에서만 생성/수정

[Answer]: C

---

### Q10: Dashboard Refresh Strategy
대시보드 데이터의 초기 로딩 및 새로고침 전략은?

**Context**: SSE는 실시간 이벤트만 전달하므로, 초기 데이터는 별도 API 호출 필요합니다.

**Options**:
A) **Initial Load Only** - 페이지 로드 시 한 번만 조회, 이후 SSE 이벤트로만 업데이트
B) **Periodic Refresh** - 초기 로드 + 5분마다 전체 데이터 재조회 (SSE와 병행)
C) **Manual Refresh** - 초기 로드 + 사용자가 새로고침 버튼 클릭 시 재조회

[Answer]: B

---

### Q11: Confirmation Dialogs
주문 삭제, 세션 종료 등 중요 작업 시 확인 팝업 스타일은?

**Options**:
A) **Simple Confirm** - 브라우저 기본 confirm() 사용
B) **Custom Modal** - 커스텀 모달 컴포넌트 (취소/확인 버튼)
C) **Two-Step Confirmation** - 첫 번째 확인 후 추가 확인 (매우 중요한 작업만)

[Answer]: B

---

### Q12: Authentication Token Management
JWT 토큰 만료 시 처리 방식은?

**Context**: JWT 토큰은 16시간 유효합니다.

**Options**:
A) **Auto Logout** - 토큰 만료 시 자동 로그아웃 후 로그인 페이지로 리다이렉트
B) **Silent Refresh** - 토큰 만료 전 자동 갱신 (refresh token 필요, 백엔드 지원 필요)
C) **Manual Re-login** - 토큰 만료 시 알림 후 사용자가 수동으로 재로그인

[Answer]: A

---

### Q13: Menu List Display Mode
메뉴 관리 화면의 메뉴 목록 표시 방식은?

**Options**:
A) **Table View** - 테이블 형태 (메뉴명, 가격, 카테고리, 액션 버튼)
B) **Card Grid** - 카드 그리드 (이미지 포함)
C) **List with Thumbnails** - 리스트 + 썸네일 이미지

[Answer]: C

---

### Q14: SSE Event Notification
SSE로 신규 주문이 들어왔을 때 시각적/청각적 알림은?

**Options**:
A) **Visual Only** - 카드 색상 변경, 애니메이션
B) **Visual + Sound** - 시각적 효과 + 알림 소리
C) **Visual + Browser Notification** - 시각적 효과 + 브라우저 알림 (권한 필요)
D) **All** - 시각적 + 소리 + 브라우저 알림

[Answer]: B

---

### Q15: Order Detail Modal - Data Scope
주문 상세 모달에서 표시할 데이터 범위는?

**Context**: 테이블 카드 클릭 시 주문 상세 모달이 열립니다.

**Options**:
A) **Single Order** - 클릭한 주문 하나만 표시
B) **Table All Orders** - 해당 테이블의 모든 활성 주문 표시
C) **Table Session Orders** - 현재 세션의 모든 주문 표시 (과거 세션 제외)

[Answer]: C

---

## Functional Design Plan

### Phase 1: Domain Model Definition
- [x] Define frontend domain entities (TypeScript interfaces)
  - Admin (로그인 사용자)
  - Table (테이블 정보)
  - Order (주문)
  - OrderItem (주문 항목)
  - Menu (메뉴)
  - MenuCategory (메뉴 카테고리)
  - TableSession (테이블 세션)
  - OrderHistory (과거 주문)
- [x] Define SSE event types
  - OrderCreatedEvent
  - OrderStatusChangedEvent
- [x] Define API request/response types (OpenAPI 기반)

### Phase 2: Business Logic Modeling
- [x] Authentication flow
  - 로그인 프로세스
  - JWT 토큰 저장 및 관리
  - 토큰 만료 처리
- [x] Dashboard real-time update logic
  - SSE 연결 관리
  - 이벤트 수신 및 상태 업데이트
  - 재연결 로직
- [x] Order management logic
  - 주문 상태 전이 규칙 (프론트엔드 검증)
  - 주문 삭제 확인 프로세스
- [x] Table session management logic
  - 세션 종료 프로세스
  - 과거 내역 조회 로직
- [x] Menu management logic
  - 메뉴 CRUD 프로세스
  - 이미지 업로드 처리
  - 카테고리 선택/생성 로직

### Phase 3: Business Rules Definition
- [x] Authentication rules
  - 로그인 필드 검증 (매장 식별자, 사용자명, 비밀번호 필수)
  - 토큰 유효성 검증
- [x] Order status transition rules (Frontend)
  - 허용된 상태 전이만 UI에 표시
  - pending → preparing → cooked → delivered
- [x] Menu validation rules
  - 메뉴명 필수 (최소 1자)
  - 가격 필수 (0 이상)
  - 카테고리 필수
  - 이미지 파일 크기 제한 (5MB)
  - 이미지 파일 형식 (jpg, png, webp)
- [x] Date range validation (Order History)
  - 시작일 ≤ 종료일
  - 최대 조회 기간 (예: 6개월)

### Phase 4: Data Flow Definition
- [x] Authentication data flow
  - 로그인 → JWT 토큰 → localStorage → API 요청 헤더
- [x] Dashboard data flow
  - 초기 로드: API 조회 → React Query 캐시
  - 실시간 업데이트: SSE 이벤트 → 상태 업데이트 → UI 반영
- [x] Order management data flow
  - 상태 변경: UI 클릭 → API 호출 → 성공 시 로컬 상태 업데이트
  - 주문 삭제: 확인 팝업 → API 호출 → 성공 시 목록에서 제거
- [x] Menu management data flow
  - 메뉴 등록: 폼 입력 → 이미지 업로드 → API 호출 → 목록 갱신
  - 메뉴 수정: 기존 데이터 로드 → 폼 수정 → API 호출 → 목록 갱신

### Phase 5: Error Handling Strategy
- [x] API error handling
  - 네트워크 에러 (연결 실패)
  - 인증 에러 (401 Unauthorized)
  - 권한 에러 (403 Forbidden)
  - 서버 에러 (500 Internal Server Error)
  - 비즈니스 로직 에러 (400 Bad Request)
- [x] SSE error handling
  - 연결 실패
  - 연결 끊김
  - 재연결 실패
- [x] Form validation errors
  - 필수 필드 누락
  - 형식 오류 (이메일, 숫자 등)
  - 파일 업로드 오류

### Phase 6: UI State Management Strategy
- [x] Global state (React Query)
  - 서버 데이터 캐싱
  - API 호출 상태 (loading, error, success)
- [x] Local state (React useState)
  - 모달 열림/닫힘
  - 폼 입력 값
  - UI 인터랙션 상태
- [x] SSE state (custom hook)
  - 연결 상태 (connected, disconnected, reconnecting)
  - 수신 이벤트 버퍼

---

## Success Criteria
- [x] All 15 questions answered
- [x] No ambiguous answers
- [x] User approval obtained
- [x] All functional design artifacts generated
- [x] Business logic clearly defined
- [x] Domain entities documented
- [x] Business rules specified
- [x] Data flow documented

---

**Status**: All phases complete. Ready for user approval.
