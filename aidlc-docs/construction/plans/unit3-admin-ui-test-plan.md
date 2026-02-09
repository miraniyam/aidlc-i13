# Test Plan for Unit 3 (Admin Frontend)

## Unit Overview
- **Unit**: unit3-admin-ui
- **Stories**: US-A01 ~ US-A12 (12 stories)
- **Requirements**: REQ-001 ~ REQ-027 (Admin 관련 요구사항)
- **Test Approach**: TDD (Test-Driven Development)
- **Test Framework**: Jest + React Testing Library + MSW

## Test Strategy

### Test Scope
Frontend TDD는 다음 영역에 집중합니다:
1. **비즈니스 로직**: Custom Hooks, Utility Functions
2. **API Integration**: API Client, React Query Hooks
3. **State Management**: Zustand Stores
4. **Security**: Input Sanitization, Rate Limiting

### Out of Scope (E2E 테스트로 대체)
- UI 컴포넌트 렌더링 테스트
- 사용자 인터랙션 테스트
- 라우팅 테스트

---

## 1. API Client Layer Tests

### 1.1 AuthAPI

#### TC-A01-001: 로그인 성공
- **Given**: 유효한 로그인 정보 (store_id, username, password)
- **When**: AuthAPI.login() 호출
- **Then**: LoginResponse 반환 (token, admin_id, store_name)
- **Story**: US-A01
- **Status**: ⬜ Not Started

#### TC-A01-002: 로그인 실패 (잘못된 비밀번호)
- **Given**: 잘못된 비밀번호
- **When**: AuthAPI.login() 호출
- **Then**: APIError 발생 (401)
- **Story**: US-A01
- **Status**: ⬜ Not Started

---

### 1.2 DashboardAPI

#### TC-A02-001: 대시보드 데이터 조회 성공
- **Given**: 인증된 관리자
- **When**: DashboardAPI.getDashboard() 호출
- **Then**: DashboardData 반환 (tables, active_sessions, pending_orders)
- **Story**: US-A02
- **Status**: ⬜ Not Started

#### TC-A02-002: 대시보드 데이터 조회 실패 (인증 없음)
- **Given**: 인증되지 않은 요청
- **When**: DashboardAPI.getDashboard() 호출
- **Then**: APIError 발생 (401)
- **Story**: US-A02
- **Status**: ⬜ Not Started

---

### 1.3 OrderAPI

#### TC-A03-001: 테이블별 주문 조회 성공
- **Given**: 유효한 테이블 ID
- **When**: OrderAPI.getOrdersByTable(tableId) 호출
- **Then**: Order[] 반환
- **Story**: US-A03
- **Status**: ⬜ Not Started

#### TC-A04-001: 주문 상태 변경 성공
- **Given**: 유효한 주문 ID, 상태 변경 요청
- **When**: OrderAPI.updateOrderStatus(orderId, request) 호출
- **Then**: 업데이트된 Order 반환
- **Story**: US-A04
- **Status**: ⬜ Not Started

#### TC-A04-002: 주문 상태 변경 실패 (버전 충돌)
- **Given**: 잘못된 version
- **When**: OrderAPI.updateOrderStatus(orderId, request) 호출
- **Then**: APIError 발생 (409)
- **Story**: US-A04
- **Status**: ⬜ Not Started

#### TC-A04-003: 주문 상태 변경 실패 (잘못된 상태 전이)
- **Given**: 잘못된 상태 전이 (예: DELIVERED → PENDING)
- **When**: OrderAPI.updateOrderStatus(orderId, request) 호출
- **Then**: APIError 발생 (422)
- **Story**: US-A04
- **Status**: ⬜ Not Started

#### TC-A11-001: 주문 내역 조회 성공
- **Given**: 유효한 조회 파라미터 (table_id, start_date, end_date)
- **When**: OrderAPI.getOrderHistory(params) 호출
- **Then**: OrderHistory[] 반환
- **Story**: US-A11
- **Status**: ⬜ Not Started

---

### 1.4 TableAPI

#### TC-A05-001: 세션 종료 성공
- **Given**: 유효한 세션 ID, 미전달 주문 없음
- **When**: TableAPI.completeSession(sessionId, request) 호출
- **Then**: 성공 (void)
- **Story**: US-A05
- **Status**: ⬜ Not Started

#### TC-A05-002: 세션 종료 실패 (미전달 주문 존재)
- **Given**: 미전달 주문 존재, force=false
- **When**: TableAPI.completeSession(sessionId, request) 호출
- **Then**: APIError 발생 (409)
- **Story**: US-A05
- **Status**: ⬜ Not Started

#### TC-A05-003: 세션 강제 종료 성공
- **Given**: 미전달 주문 존재, force=true
- **When**: TableAPI.completeSession(sessionId, request) 호출
- **Then**: 성공 (void)
- **Story**: US-A05
- **Status**: ⬜ Not Started

---

### 1.5 MenuAPI

#### TC-A06-001: 메뉴 생성 성공
- **Given**: 유효한 메뉴 데이터
- **When**: MenuAPI.createMenu(request) 호출
- **Then**: 생성된 Menu 반환
- **Story**: US-A06
- **Status**: ⬜ Not Started

#### TC-A06-002: 메뉴 생성 실패 (중복 메뉴명)
- **Given**: 중복된 메뉴명
- **When**: MenuAPI.createMenu(request) 호출
- **Then**: APIError 발생 (409)
- **Story**: US-A06
- **Status**: ⬜ Not Started

#### TC-A07-001: 메뉴 수정 성공
- **Given**: 유효한 메뉴 ID, 수정 데이터
- **When**: MenuAPI.updateMenu(menuId, request) 호출
- **Then**: 수정된 Menu 반환
- **Story**: US-A07
- **Status**: ⬜ Not Started

#### TC-A08-001: 메뉴 삭제 성공
- **Given**: 유효한 메뉴 ID, 주문 내역 없음
- **When**: MenuAPI.deleteMenu(menuId) 호출
- **Then**: 성공 (void)
- **Story**: US-A08
- **Status**: ⬜ Not Started

#### TC-A08-002: 메뉴 삭제 실패 (주문 내역 존재)
- **Given**: 주문 내역 존재
- **When**: MenuAPI.deleteMenu(menuId) 호출
- **Then**: APIError 발생 (409)
- **Story**: US-A08
- **Status**: ⬜ Not Started

#### TC-A09-001: 이미지 업로드 성공
- **Given**: 유효한 이미지 파일 (< 5MB)
- **When**: MenuAPI.uploadImage(file) 호출
- **Then**: 이미지 URL 반환
- **Story**: US-A09
- **Status**: ⬜ Not Started

#### TC-A09-002: 이미지 업로드 실패 (파일 크기 초과)
- **Given**: 5MB 초과 파일
- **When**: MenuAPI.uploadImage(file) 호출
- **Then**: APIError 발생 (413)
- **Story**: US-A09
- **Status**: ⬜ Not Started

---

### 1.6 CategoryAPI

#### TC-A10-001: 카테고리 생성 성공
- **Given**: 유효한 카테고리 데이터
- **When**: CategoryAPI.createCategory(request) 호출
- **Then**: 생성된 MenuCategory 반환
- **Story**: US-A10
- **Status**: ⬜ Not Started

#### TC-A10-002: 카테고리 수정 성공
- **Given**: 유효한 카테고리 ID, 수정 데이터
- **When**: CategoryAPI.updateCategory(categoryId, request) 호출
- **Then**: 수정된 MenuCategory 반환
- **Story**: US-A10
- **Status**: ⬜ Not Started

#### TC-A10-003: 카테고리 삭제 성공
- **Given**: 유효한 카테고리 ID, 메뉴 없음
- **When**: CategoryAPI.deleteCategory(categoryId) 호출
- **Then**: 성공 (void)
- **Story**: US-A10
- **Status**: ⬜ Not Started

#### TC-A10-004: 카테고리 삭제 실패 (메뉴 존재)
- **Given**: 메뉴 존재
- **When**: CategoryAPI.deleteCategory(categoryId) 호출
- **Then**: APIError 발생 (409)
- **Story**: US-A10
- **Status**: ⬜ Not Started

---

## 2. State Management Layer Tests

### 2.1 useAuthStore

#### TC-AUTH-001: 로그인 시 상태 업데이트
- **Given**: 초기 상태 (isAuthenticated=false)
- **When**: login(token, adminId, storeName) 호출
- **Then**: isAuthenticated=true, adminId, storeName 저장, localStorage 업데이트
- **Story**: US-A01
- **Status**: ⬜ Not Started

#### TC-AUTH-002: 로그아웃 시 상태 초기화
- **Given**: 로그인 상태
- **When**: logout() 호출
- **Then**: isAuthenticated=false, adminId=null, storeName=null, localStorage 삭제
- **Story**: US-A01
- **Status**: ⬜ Not Started

#### TC-AUTH-003: 자동 로그인 (토큰 유효)
- **Given**: localStorage에 유효한 토큰 (16시간 이내)
- **When**: checkAuth() 호출
- **Then**: isAuthenticated=true, 상태 복원
- **Story**: US-A01
- **Status**: ⬜ Not Started

#### TC-AUTH-004: 자동 로그아웃 (토큰 만료)
- **Given**: localStorage에 만료된 토큰 (16시간 초과)
- **When**: checkAuth() 호출
- **Then**: isAuthenticated=false, localStorage 삭제
- **Story**: US-A01
- **Status**: ⬜ Not Started

---

### 2.2 useUIStore

#### TC-UI-001: 사이드바 토글
- **Given**: isSidebarCollapsed=false
- **When**: toggleSidebar() 호출
- **Then**: isSidebarCollapsed=true
- **Status**: ⬜ Not Started

#### TC-UI-002: 모달 열기
- **Given**: activeModal=null
- **When**: openModal('order-detail') 호출
- **Then**: activeModal='order-detail'
- **Status**: ⬜ Not Started

#### TC-UI-003: 모달 닫기
- **Given**: activeModal='order-detail'
- **When**: closeModal() 호출
- **Then**: activeModal=null
- **Status**: ⬜ Not Started

---

## 3. Security Layer Tests

### 3.1 sanitizeInput

#### TC-SEC-001: XSS 공격 방지 (스크립트 태그)
- **Given**: 입력 문자열 "<script>alert('XSS')</script>"
- **When**: sanitizeInput(input) 호출
- **Then**: 빈 문자열 반환
- **Story**: US-A06, US-A07, US-A10
- **Status**: ⬜ Not Started

#### TC-SEC-002: XSS 공격 방지 (이벤트 핸들러)
- **Given**: 입력 문자열 "<img src=x onerror=alert('XSS')>"
- **When**: sanitizeInput(input) 호출
- **Then**: 정제된 문자열 반환 (이벤트 핸들러 제거)
- **Story**: US-A06, US-A07, US-A10
- **Status**: ⬜ Not Started

#### TC-SEC-003: 정상 입력 유지
- **Given**: 입력 문자열 "김치찌개"
- **When**: sanitizeInput(input) 호출
- **Then**: "김치찌개" 반환
- **Story**: US-A06, US-A07, US-A10
- **Status**: ⬜ Not Started

---

### 3.2 RateLimiter

#### TC-RATE-001: 제한 내 요청 허용
- **Given**: RateLimiter(10, 1000), 5개 요청
- **When**: canMakeRequest() 호출
- **Then**: true 반환
- **Status**: ⬜ Not Started

#### TC-RATE-002: 제한 초과 요청 차단
- **Given**: RateLimiter(10, 1000), 10개 요청 후
- **When**: canMakeRequest() 호출
- **Then**: false 반환
- **Status**: ⬜ Not Started

#### TC-RATE-003: 시간 윈도우 경과 후 재허용
- **Given**: RateLimiter(10, 1000), 10개 요청 후 1초 대기
- **When**: canMakeRequest() 호출
- **Then**: true 반환
- **Status**: ⬜ Not Started

---

### 3.3 TokenStorage

#### TC-TOKEN-001: 토큰 저장 및 조회
- **Given**: 토큰 "test-token"
- **When**: TokenStorage.set('admin_token', 'test-token'), TokenStorage.get('admin_token') 호출
- **Then**: "test-token" 반환
- **Story**: US-A01
- **Status**: ⬜ Not Started

#### TC-TOKEN-002: 토큰 삭제
- **Given**: 저장된 토큰
- **When**: TokenStorage.remove('admin_token'), TokenStorage.get('admin_token') 호출
- **Then**: null 반환
- **Story**: US-A01
- **Status**: ⬜ Not Started

#### TC-TOKEN-003: 모든 토큰 삭제
- **Given**: 여러 토큰 저장
- **When**: TokenStorage.clear() 호출
- **Then**: 모든 토큰 삭제됨
- **Story**: US-A01
- **Status**: ⬜ Not Started

---

## 4. Utility Layer Tests

### 4.1 uploadImage

#### TC-UPLOAD-001: 이미지 업로드 성공
- **Given**: 유효한 이미지 파일 (< 5MB)
- **When**: uploadImage(file) 호출
- **Then**: 이미지 URL 반환
- **Story**: US-A09
- **Status**: ⬜ Not Started

#### TC-UPLOAD-002: 이미지 업로드 실패 (파일 타입 오류)
- **Given**: 이미지가 아닌 파일
- **When**: uploadImage(file) 호출
- **Then**: Error 발생 ("이미지 파일만 업로드 가능합니다.")
- **Story**: US-A09
- **Status**: ⬜ Not Started

#### TC-UPLOAD-003: 이미지 업로드 실패 (파일 크기 초과)
- **Given**: 5MB 초과 파일
- **When**: uploadImage(file) 호출
- **Then**: Error 발생 ("이미지 크기는 5MB 이하여야 합니다.")
- **Story**: US-A09
- **Status**: ⬜ Not Started

#### TC-UPLOAD-004: 이미지 미리보기 생성
- **Given**: 유효한 이미지 파일
- **When**: createImagePreview(file) 호출
- **Then**: Data URL 반환
- **Story**: US-A09
- **Status**: ⬜ Not Started

---

### 4.2 Date Formatter

#### TC-DATE-001: 날짜 포맷팅
- **Given**: ISO 8601 날짜 "2026-02-09T16:00:00Z"
- **When**: formatDate(date) 호출
- **Then**: "2026-02-09 16:00:00" 반환
- **Story**: US-A11
- **Status**: ⬜ Not Started

#### TC-DATE-002: 상대 시간 포맷팅
- **Given**: 3분 전 날짜
- **When**: formatRelativeTime(date) 호출
- **Then**: "3분 전" 반환
- **Story**: US-A02, US-A03
- **Status**: ⬜ Not Started

#### TC-DATE-003: 날짜 범위 포맷팅
- **Given**: start="2026-02-01", end="2026-02-07"
- **When**: formatDateRange(start, end) 호출
- **Then**: "2026-02-01 ~ 2026-02-07" 반환
- **Story**: US-A11
- **Status**: ⬜ Not Started

---

## 5. Real-time Communication Layer Tests

### 5.1 useSSEManager

#### TC-SSE-001: SSE 연결 성공
- **Given**: 유효한 SSE URL
- **When**: useSSEManager() 호출
- **Then**: status='connected'
- **Story**: US-A02
- **Status**: ⬜ Not Started

#### TC-SSE-002: SSE 연결 실패 후 재연결
- **Given**: SSE 연결 에러 발생
- **When**: 자동 재연결 시도
- **Then**: status='reconnecting' → 'connected'
- **Story**: US-A02
- **Status**: ⬜ Not Started

#### TC-SSE-003: SSE 메시지 수신
- **Given**: SSE 연결 상태
- **When**: 서버에서 메시지 전송
- **Then**: onMessage 콜백 호출
- **Story**: US-A02
- **Status**: ⬜ Not Started

---

## Requirements Coverage

| Requirement ID | Test Cases | Status |
|---------------|------------|--------|
| REQ-001 (로그인) | TC-A01-001, TC-A01-002, TC-AUTH-001~004, TC-TOKEN-001~003 | ⬜ Pending |
| REQ-002 (대시보드) | TC-A02-001, TC-A02-002 | ⬜ Pending |
| REQ-003 (주문 조회) | TC-A03-001 | ⬜ Pending |
| REQ-004 (주문 상태 변경) | TC-A04-001, TC-A04-002, TC-A04-003 | ⬜ Pending |
| REQ-005 (세션 종료) | TC-A05-001, TC-A05-002, TC-A05-003 | ⬜ Pending |
| REQ-006 (메뉴 생성) | TC-A06-001, TC-A06-002, TC-SEC-001~003 | ⬜ Pending |
| REQ-007 (메뉴 수정) | TC-A07-001, TC-SEC-001~003 | ⬜ Pending |
| REQ-008 (메뉴 삭제) | TC-A08-001, TC-A08-002 | ⬜ Pending |
| REQ-009 (이미지 업로드) | TC-A09-001, TC-A09-002, TC-UPLOAD-001~004 | ⬜ Pending |
| REQ-010 (카테고리 관리) | TC-A10-001~004, TC-SEC-001~003 | ⬜ Pending |
| REQ-011 (주문 내역) | TC-A11-001, TC-DATE-001~003 | ⬜ Pending |
| REQ-012 (실시간 업데이트) | TC-SSE-001~003 | ⬜ Pending |
| REQ-013 (Rate Limiting) | TC-RATE-001~003 | ⬜ Pending |

---

## Test Summary

- **Total Test Cases**: 50
- **API Client Tests**: 20
- **State Management Tests**: 7
- **Security Tests**: 9
- **Utility Tests**: 7
- **Real-time Communication Tests**: 3
- **UI Tests**: 4

---

**Test plan is complete and ready for TDD execution.**
