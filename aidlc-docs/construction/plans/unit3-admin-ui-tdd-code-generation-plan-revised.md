# TDD Code Generation Plan for Unit 3 (Admin Frontend) - REVISED

## Revision History
- **2026-02-09T16:57:00+09:00**: Backend Alignment (Unit 1 실제 구현 기준)

## Unit Context
- **Workspace Root**: `/Users/miran/aidlc-i13`
- **Project Type**: Greenfield (Multi-repo)
- **Project Directory**: `/Users/miran/aidlc-i13/table-order-admin-ui`
- **Stories**: US-A01 ~ US-A09, US-A11 (10 stories)
- **Test Framework**: Jest + React Testing Library + MSW
- **Total Test Cases**: 35 (축소)
- **TDD Cycles**: 20 (25개에서 축소)

## TDD Execution Strategy

Frontend TDD는 **핵심 비즈니스 로직**에 집중:
1. API Client Layer (MSW 모킹)
2. State Management Layer (Zustand)
3. Security Layer (Input Sanitization, Rate Limiting)
4. Utility Layer (Image Preview, Date Formatter)
5. Real-time Communication Layer (SSE Manager)

**UI 컴포넌트는 E2E 테스트로 대체** (TDD 범위 제외)

---

## Plan Step 0: Project Setup & Contract Skeleton Generation

### 0.1 프로젝트 초기화
- [x] Vite + React + TypeScript 프로젝트 생성 (`table-order-admin-ui`)
- [x] 디렉토리 구조 생성
- [x] 의존성 설치 (package.json)
- [x] 환경 변수 설정 (.env.development, .env.production)
- [x] Vite 설정 (vite.config.ts)
- [x] TypeScript 설정 (tsconfig.json)

### 0.2 테스트 환경 설정
- [x] Vitest 설정 (vitest.config.ts)
- [x] React Testing Library 설정
- [x] MSW 설정 (src/mocks/)
- [x] 테스트 유틸리티 생성 (src/test-utils/)

### 0.3 Contract Skeleton 생성
- [x] API Client 스켈레톤 (src/api/)
  - [x] client.ts (Axios 인스턴스)
  - [x] auth.api.ts (AuthAPI)
  - [x] order.api.ts (OrderAPI)
  - [x] table.api.ts (TableAPI)
  - [x] menu.api.ts (MenuAPI)
- [x] State Management 스켈레톤 (src/stores/)
  - [x] authStore.ts (useAuthStore)
  - [x] uiStore.ts (useUIStore)
- [x] Security 스켈레톤 (src/utils/)
  - [x] sanitizer.ts (sanitizeInput)
  - [x] rateLimiter.ts (RateLimiter)
  - [x] tokenStorage.ts (TokenStorage)
- [x] Utility 스켈레톤 (src/utils/)
  - [x] imagePreview.ts (createImagePreview)
  - [x] dateFormatter.ts (formatDate)
- [x] Real-time Communication 스켈레톤 (src/services/)
  - [x] sseManager.ts (useSSEManager)
- [x] Type Definitions (src/types/)
  - [x] index.ts (모든 타입 정의)

### 0.4 컴파일 확인
- [x] `npm run build` 실행
- [x] 컴파일 에러 없음 확인

---

## Plan Step 1: API Client Layer (TDD)

### 1.1 AuthAPI.login() - RED-GREEN-REFACTOR
- [x] **RED**: TC-A01-001 (로그인 성공) 테스트 작성
- [x] **GREEN**: 최소 구현 (MSW 모킹)
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A01
- **Endpoint**: `POST /api/admin/auth/login`

### 1.2 AuthAPI.login() - 에러 케이스 - RED-GREEN-REFACTOR
- [x] **RED**: TC-A01-002 (로그인 실패) 테스트 작성
- [x] **GREEN**: 에러 핸들링 구현
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A01

### 1.3 OrderAPI.getOrdersByTable() - RED-GREEN-REFACTOR
- [x] **RED**: TC-A03-001 (주문 조회 성공) 테스트 작성
- [x] **GREEN**: 최소 구현
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A03
- **Endpoint**: `GET /api/admin/orders?table_id={tableId}`

### 1.4 OrderAPI.updateOrderStatus() - RED-GREEN-REFACTOR
- [x] **RED**: TC-A04-001 (상태 변경 성공) 테스트 작성
- [x] **GREEN**: 최소 구현
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A04
- **Endpoint**: `PATCH /api/admin/orders/{orderId}/status`
- **Note**: version 필드 없음 (Optimistic Locking 미구현)

### 1.5 TableAPI.completeSession() - RED-GREEN-REFACTOR
- [x] **RED**: TC-A05-001 (세션 종료 성공) 테스트 작성
- [x] **GREEN**: 최소 구현
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A05
- **Endpoint**: `POST /api/admin/tables/{tableId}/complete-session`
- **Note**: force 옵션 없음

### 1.6 MenuAPI.createMenu() - RED-GREEN-REFACTOR
- [x] **RED**: TC-A06-001 (메뉴 생성 성공) 테스트 작성
- [x] **GREEN**: 최소 구현 (FormData)
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A06
- **Endpoint**: `POST /api/admin/menus`
- **Note**: 이미지 업로드 통합 (별도 엔드포인트 없음)

### 1.7 MenuAPI.updateMenu() - RED-GREEN-REFACTOR
- [x] **RED**: TC-A07-001 (메뉴 수정 성공) 테스트 작성
- [x] **GREEN**: 최소 구현
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A07
- **Endpoint**: `PATCH /api/admin/menus/{menuId}`

### 1.8 MenuAPI.deleteMenu() - RED-GREEN-REFACTOR
- [x] **RED**: TC-A08-001 (메뉴 삭제 성공) 테스트 작성
- [x] **GREEN**: 최소 구현
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A08
- **Endpoint**: `DELETE /api/admin/menus/{menuId}`

### 1.9 TableAPI.getOrderHistory() - RED-GREEN-REFACTOR
- [x] **RED**: TC-A11-001 (주문 내역 조회 성공) 테스트 작성
- [x] **GREEN**: 최소 구현
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A11
- **Endpoint**: `GET /api/admin/tables/{tableId}/order-history`

---

## Plan Step 2: State Management Layer (TDD)

### 2.1 useAuthStore.login() - RED-GREEN-REFACTOR
- [x] **RED**: TC-AUTH-001 (로그인 시 상태 업데이트) 테스트 작성
- [x] **GREEN**: 최소 구현
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A01

### 2.2 useAuthStore.logout() - RED-GREEN-REFACTOR
- [x] **RED**: TC-AUTH-002 (로그아웃 시 상태 초기화) 테스트 작성
- [x] **GREEN**: 최소 구현
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A01

### 2.3 useAuthStore.checkAuth() - 자동 로그인 - RED-GREEN-REFACTOR
- [x] **RED**: TC-AUTH-003 (자동 로그인) 테스트 작성
- [x] **GREEN**: 최소 구현
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A01

### 2.4 useAuthStore.checkAuth() - 자동 로그아웃 - RED-GREEN-REFACTOR
- [x] **RED**: TC-AUTH-004 (자동 로그아웃) 테스트 작성
- [x] **GREEN**: 최소 구현
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A01

### 2.5 useUIStore - RED-GREEN-REFACTOR
- [x] **RED**: TC-UI-001~003 (사이드바, 모달) 테스트 작성
- [x] **GREEN**: 최소 구현
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과

---

## Plan Step 3: Security Layer (TDD)

### 3.1 sanitizeInput() - XSS 방지 - RED-GREEN-REFACTOR
- [x] **RED**: TC-SEC-001, TC-SEC-002 (XSS 방지) 테스트 작성
- [x] **GREEN**: 최소 구현 (DOMPurify)
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A06, US-A07

### 3.2 RateLimiter - RED-GREEN-REFACTOR
- [x] **RED**: TC-RATE-001~003 (Rate Limiting) 테스트 작성
- [x] **GREEN**: 최소 구현 (Token Bucket)
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과

### 3.3 TokenStorage - RED-GREEN-REFACTOR
- [x] **RED**: TC-TOKEN-001~003 (저장, 조회, 삭제) 테스트 작성
- [x] **GREEN**: 최소 구현 (localStorage wrapper)
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A01

---

## Plan Step 4: Utility Layer (TDD)

### 4.1 createImagePreview() - RED-GREEN-REFACTOR
- [x] **RED**: TC-PREVIEW-001 (미리보기 생성) 테스트 작성
- [x] **GREEN**: 최소 구현 (FileReader)
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A09

### 4.2 Date Formatter - RED-GREEN-REFACTOR
- [x] **RED**: TC-DATE-001~003 (날짜 포맷팅) 테스트 작성
- [x] **GREEN**: 최소 구현 (Day.js)
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과
- **Story**: US-A11

---

## Plan Step 5: Real-time Communication Layer (TDD)

### 5.1 useSSEManager() - 연결 성공 - RED-GREEN-REFACTOR
- [x] **RED**: TC-SSE-001 (연결 성공) 테스트 작성
- [x] **GREEN**: 최소 구현 (EventSource)
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 테스트 통과 (통합 테스트로 검증)
- **Story**: US-A02
- **Endpoint**: `GET /api/admin/sse`

### 5.2 useSSEManager() - 재연결 - RED-GREEN-REFACTOR
- [x] **RED**: 재연결 로직 구현 (Exponential Backoff)
- [x] **GREEN**: 재연결 로직 추가
- [x] **REFACTOR**: 코드 개선
- [x] **VERIFY**: 통합 테스트로 검증
- **Story**: US-A02

---

## Plan Step 6: UI Components (Skeleton Only)

### 6.1 페이지 컴포넌트 생성 (테스트 없음)
- [x] LoginPage.tsx
- [x] DashboardPage.tsx
- [x] MenuPage.tsx
- [x] OrderHistoryPage.tsx

### 6.2 레이아웃 컴포넌트 생성 (테스트 없음)
- [ ] AppLayout.tsx (Sidebar + Header)
- [ ] Sidebar.tsx
- [ ] Header.tsx

### 6.3 공통 컴포넌트 생성 (테스트 없음)
- [ ] TableCard.tsx
- [ ] OrderDetailModal.tsx
- [ ] MenuForm.tsx

---

## Plan Step 7: Routing & App Entry

### 7.1 라우팅 설정
- [x] App.tsx (React Router 설정)
- [x] ProtectedRoute.tsx (인증 가드)

### 7.2 App Entry
- [x] main.tsx (React 앱 마운트)
- [x] index.html

---

## Plan Step 8: Additional Artifacts

### 8.1 문서 생성
- [x] README.md (프로젝트 설명, 실행 방법)
- [x] aidlc-docs/construction/unit3-admin-ui/code/implementation-summary.md

### 8.2 배포 아티팩트
- [x] .env.example (환경 변수 예시)
- [x] .gitignore
- [x] package.json scripts 정리

---

## TDD Execution Summary

### 총 TDD 사이클: 20개 (25개에서 축소)
- **API Client Layer**: 9 cycles (10개에서 축소)
- **State Management Layer**: 5 cycles
- **Security Layer**: 3 cycles (5개에서 축소)
- **Utility Layer**: 2 cycles (4개에서 축소)
- **Real-time Communication Layer**: 2 cycles (3개에서 축소)

### 예상 소요 시간
- TDD 사이클: ~2시간 (AI 기준)
- UI 컴포넌트 생성: ~1시간
- 문서 및 배포 아티팩트: ~30분
- **총 예상 시간**: ~3.5시간

---

**TDD Code Generation Plan aligned with Unit 1 Backend implementation.**
