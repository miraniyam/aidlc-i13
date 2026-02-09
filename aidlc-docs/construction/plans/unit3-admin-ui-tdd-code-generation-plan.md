# TDD Code Generation Plan for Unit 3 (Admin Frontend)

## Unit Context
- **Workspace Root**: `/Users/miran/aidlc-i13`
- **Project Type**: Greenfield
- **Stories**: US-A01 ~ US-A12 (12 stories)
- **Test Framework**: Jest + React Testing Library + MSW
- **Total Test Cases**: 50 (축소 실행: 핵심 25개)

## TDD Execution Strategy

Frontend TDD는 **핵심 비즈니스 로직**에 집중합니다:
1. API Client Layer (MSW 모킹)
2. State Management Layer (Zustand)
3. Security Layer (Input Sanitization, Rate Limiting)
4. Utility Layer (Image Upload, Date Formatter)
5. Real-time Communication Layer (SSE Manager)

**UI 컴포넌트는 E2E 테스트로 대체** (TDD 범위 제외)

---

## Plan Step 0: Project Setup & Contract Skeleton Generation

### 0.1 프로젝트 초기화
- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] 디렉토리 구조 생성
- [ ] 의존성 설치 (package.json)
- [ ] 환경 변수 설정 (.env.development, .env.production)
- [ ] Vite 설정 (vite.config.ts)
- [ ] TypeScript 설정 (tsconfig.json)

### 0.2 테스트 환경 설정
- [ ] Jest 설정 (jest.config.js)
- [ ] React Testing Library 설정
- [ ] MSW 설정 (src/mocks/)
- [ ] 테스트 유틸리티 생성 (src/test-utils/)

### 0.3 Contract Skeleton 생성
- [ ] API Client 스켈레톤 (src/api/)
  - [ ] client.ts (Axios 인스턴스)
  - [ ] auth.api.ts (AuthAPI)
  - [ ] dashboard.api.ts (DashboardAPI)
  - [ ] order.api.ts (OrderAPI)
  - [ ] table.api.ts (TableAPI)
  - [ ] menu.api.ts (MenuAPI)
  - [ ] category.api.ts (CategoryAPI)
- [ ] State Management 스켈레톤 (src/stores/)
  - [ ] authStore.ts (useAuthStore)
  - [ ] uiStore.ts (useUIStore)
- [ ] Security 스켈레톤 (src/utils/)
  - [ ] sanitizer.ts (sanitizeInput)
  - [ ] rateLimiter.ts (RateLimiter)
  - [ ] tokenStorage.ts (TokenStorage)
- [ ] Utility 스켈레톤 (src/utils/)
  - [ ] imageUploader.ts (uploadImage)
  - [ ] dateFormatter.ts (formatDate)
- [ ] Real-time Communication 스켈레톤 (src/services/)
  - [ ] sseManager.ts (useSSEManager)
  - [ ] hybridSyncManager.ts (useHybridSync)
- [ ] Type Definitions (src/types/)
  - [ ] index.ts (모든 타입 정의)

### 0.4 컴파일 확인
- [ ] `npm run build` 실행
- [ ] 컴파일 에러 없음 확인

---

## Plan Step 1: API Client Layer (TDD)

### 1.1 AuthAPI.login() - RED-GREEN-REFACTOR
- [ ] **RED**: TC-A01-001 (로그인 성공) 테스트 작성
- [ ] **GREEN**: 최소 구현 (MSW 모킹)
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A01

### 1.2 AuthAPI.login() - 에러 케이스 - RED-GREEN-REFACTOR
- [ ] **RED**: TC-A01-002 (로그인 실패) 테스트 작성
- [ ] **GREEN**: 에러 핸들링 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A01

### 1.3 DashboardAPI.getDashboard() - RED-GREEN-REFACTOR
- [ ] **RED**: TC-A02-001 (대시보드 조회 성공) 테스트 작성
- [ ] **GREEN**: 최소 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A02

### 1.4 OrderAPI.getOrdersByTable() - RED-GREEN-REFACTOR
- [ ] **RED**: TC-A03-001 (주문 조회 성공) 테스트 작성
- [ ] **GREEN**: 최소 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A03

### 1.5 OrderAPI.updateOrderStatus() - RED-GREEN-REFACTOR
- [ ] **RED**: TC-A04-001 (상태 변경 성공) 테스트 작성
- [ ] **GREEN**: 최소 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A04

### 1.6 OrderAPI.updateOrderStatus() - 에러 케이스 - RED-GREEN-REFACTOR
- [ ] **RED**: TC-A04-002 (버전 충돌) 테스트 작성
- [ ] **GREEN**: 에러 핸들링 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A04

### 1.7 TableAPI.completeSession() - RED-GREEN-REFACTOR
- [ ] **RED**: TC-A05-001 (세션 종료 성공) 테스트 작성
- [ ] **GREEN**: 최소 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A05

### 1.8 MenuAPI.createMenu() - RED-GREEN-REFACTOR
- [ ] **RED**: TC-A06-001 (메뉴 생성 성공) 테스트 작성
- [ ] **GREEN**: 최소 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A06

### 1.9 MenuAPI.uploadImage() - RED-GREEN-REFACTOR
- [ ] **RED**: TC-A09-001 (이미지 업로드 성공) 테스트 작성
- [ ] **GREEN**: 최소 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A09

### 1.10 CategoryAPI.createCategory() - RED-GREEN-REFACTOR
- [ ] **RED**: TC-A10-001 (카테고리 생성 성공) 테스트 작성
- [ ] **GREEN**: 최소 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A10

---

## Plan Step 2: State Management Layer (TDD)

### 2.1 useAuthStore.login() - RED-GREEN-REFACTOR
- [ ] **RED**: TC-AUTH-001 (로그인 시 상태 업데이트) 테스트 작성
- [ ] **GREEN**: 최소 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A01

### 2.2 useAuthStore.logout() - RED-GREEN-REFACTOR
- [ ] **RED**: TC-AUTH-002 (로그아웃 시 상태 초기화) 테스트 작성
- [ ] **GREEN**: 최소 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A01

### 2.3 useAuthStore.checkAuth() - 자동 로그인 - RED-GREEN-REFACTOR
- [ ] **RED**: TC-AUTH-003 (자동 로그인) 테스트 작성
- [ ] **GREEN**: 최소 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A01

### 2.4 useAuthStore.checkAuth() - 자동 로그아웃 - RED-GREEN-REFACTOR
- [ ] **RED**: TC-AUTH-004 (자동 로그아웃) 테스트 작성
- [ ] **GREEN**: 최소 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A01

### 2.5 useUIStore - RED-GREEN-REFACTOR
- [ ] **RED**: TC-UI-001~003 (사이드바, 모달) 테스트 작성
- [ ] **GREEN**: 최소 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과

---

## Plan Step 3: Security Layer (TDD)

### 3.1 sanitizeInput() - XSS 방지 - RED-GREEN-REFACTOR
- [ ] **RED**: TC-SEC-001 (스크립트 태그 제거) 테스트 작성
- [ ] **GREEN**: 최소 구현 (DOMPurify)
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A06, US-A07, US-A10

### 3.2 sanitizeInput() - 정상 입력 유지 - RED-GREEN-REFACTOR
- [ ] **RED**: TC-SEC-003 (정상 입력 유지) 테스트 작성
- [ ] **GREEN**: 검증 로직 추가
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A06, US-A07, US-A10

### 3.3 RateLimiter.canMakeRequest() - RED-GREEN-REFACTOR
- [ ] **RED**: TC-RATE-001 (제한 내 허용) 테스트 작성
- [ ] **GREEN**: 최소 구현 (Token Bucket)
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과

### 3.4 RateLimiter.canMakeRequest() - 제한 초과 - RED-GREEN-REFACTOR
- [ ] **RED**: TC-RATE-002 (제한 초과 차단) 테스트 작성
- [ ] **GREEN**: 제한 로직 추가
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과

### 3.5 TokenStorage - RED-GREEN-REFACTOR
- [ ] **RED**: TC-TOKEN-001~003 (저장, 조회, 삭제) 테스트 작성
- [ ] **GREEN**: 최소 구현 (localStorage wrapper)
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A01

---

## Plan Step 4: Utility Layer (TDD)

### 4.1 uploadImage() - 성공 케이스 - RED-GREEN-REFACTOR
- [ ] **RED**: TC-UPLOAD-001 (업로드 성공) 테스트 작성
- [ ] **GREEN**: 최소 구현
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A09

### 4.2 uploadImage() - 파일 검증 - RED-GREEN-REFACTOR
- [ ] **RED**: TC-UPLOAD-002, TC-UPLOAD-003 (파일 검증) 테스트 작성
- [ ] **GREEN**: 검증 로직 추가
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A09

### 4.3 createImagePreview() - RED-GREEN-REFACTOR
- [ ] **RED**: TC-UPLOAD-004 (미리보기 생성) 테스트 작성
- [ ] **GREEN**: 최소 구현 (FileReader)
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A09

### 4.4 Date Formatter - RED-GREEN-REFACTOR
- [ ] **RED**: TC-DATE-001~003 (날짜 포맷팅) 테스트 작성
- [ ] **GREEN**: 최소 구현 (Day.js)
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A11

---

## Plan Step 5: Real-time Communication Layer (TDD)

### 5.1 useSSEManager() - 연결 성공 - RED-GREEN-REFACTOR
- [ ] **RED**: TC-SSE-001 (연결 성공) 테스트 작성
- [ ] **GREEN**: 최소 구현 (EventSource)
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A02

### 5.2 useSSEManager() - 재연결 - RED-GREEN-REFACTOR
- [ ] **RED**: TC-SSE-002 (재연결) 테스트 작성
- [ ] **GREEN**: 재연결 로직 추가 (Exponential Backoff)
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A02

---

## Plan Step 6: React Query Hooks (TDD)

### 6.1 useLogin() - RED-GREEN-REFACTOR
- [ ] **RED**: useLogin() 테스트 작성
- [ ] **GREEN**: 최소 구현 (useMutation)
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A01

### 6.2 useDashboard() - RED-GREEN-REFACTOR
- [ ] **RED**: useDashboard() 테스트 작성
- [ ] **GREEN**: 최소 구현 (useQuery)
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A02

### 6.3 useUpdateOrderStatus() - RED-GREEN-REFACTOR
- [ ] **RED**: useUpdateOrderStatus() 테스트 작성
- [ ] **GREEN**: 최소 구현 (useMutation + Optimistic Update)
- [ ] **REFACTOR**: 코드 개선
- [ ] **VERIFY**: 테스트 통과
- **Story**: US-A04

---

## Plan Step 7: UI Components (Skeleton Only)

### 7.1 페이지 컴포넌트 생성 (테스트 없음)
- [ ] LoginPage.tsx
- [ ] DashboardPage.tsx
- [ ] MenuPage.tsx
- [ ] CategoryPage.tsx
- [ ] OrderHistoryPage.tsx

### 7.2 레이아웃 컴포넌트 생성 (테스트 없음)
- [ ] AppLayout.tsx (Sidebar + Header)
- [ ] Sidebar.tsx
- [ ] Header.tsx

### 7.3 공통 컴포넌트 생성 (테스트 없음)
- [ ] TableCard.tsx
- [ ] OrderDetailModal.tsx
- [ ] MenuForm.tsx
- [ ] CategoryForm.tsx

---

## Plan Step 8: Routing & App Entry

### 8.1 라우팅 설정
- [ ] App.tsx (React Router 설정)
- [ ] ProtectedRoute.tsx (인증 가드)

### 8.2 App Entry
- [ ] main.tsx (React 앱 마운트)
- [ ] index.html

---

## Plan Step 9: Additional Artifacts

### 9.1 문서 생성
- [ ] README.md (프로젝트 설명, 실행 방법)
- [ ] aidlc-docs/construction/unit3-admin-ui/code/implementation-summary.md

### 9.2 배포 아티팩트
- [ ] .env.example (환경 변수 예시)
- [ ] .gitignore
- [ ] package.json scripts 정리

---

## TDD Execution Summary

### 총 TDD 사이클: 25개
- **API Client Layer**: 10 cycles
- **State Management Layer**: 5 cycles
- **Security Layer**: 5 cycles
- **Utility Layer**: 4 cycles
- **Real-time Communication Layer**: 2 cycles
- **React Query Hooks**: 3 cycles

### 예상 소요 시간
- TDD 사이클: ~2-3시간 (AI 기준)
- UI 컴포넌트 생성: ~1시간
- 문서 및 배포 아티팩트: ~30분
- **총 예상 시간**: ~4시간

---

**TDD Code Generation Plan is complete and ready for execution.**
