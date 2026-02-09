# Test Plan for Unit 3 (Admin Frontend) - REVISED

## Revision History
- **2026-02-09T16:56:00+09:00**: Backend Alignment (불필요한 테스트 제거)

## Unit Overview
- **Unit**: unit3-admin-ui
- **Stories**: US-A01 ~ US-A09, US-A11 (10 stories)
- **Test Approach**: TDD (Test-Driven Development)
- **Test Framework**: Jest + React Testing Library + MSW
- **Total Test Cases**: 35 (50개에서 축소)

## Test Strategy

### Test Scope
1. **API Client Layer**: MSW 모킹
2. **State Management**: Zustand Stores
3. **Security**: Input Sanitization, Rate Limiting
4. **Utility**: Image Preview, Date Formatter
5. **Real-time Communication**: SSE Manager

### Removed Tests (Backend 미구현)
- ~~TC-A04-002: 버전 충돌 테스트~~ (Optimistic Locking 미구현)
- ~~TC-A05-002, TC-A05-003: 강제 종료 테스트~~ (force 옵션 미구현)
- ~~TC-A10-001 ~ TC-A10-004: 카테고리 테스트~~ (Category API 미구현)
- ~~TC-UPLOAD-001 ~ TC-UPLOAD-003: 별도 업로드 테스트~~ (통합 업로드)

---

## 1. API Client Layer Tests

### 1.1 AuthAPI

#### TC-A01-001: 로그인 성공
- **Given**: 유효한 로그인 정보
- **When**: AuthAPI.login() 호출
- **Then**: LoginResponse 반환
- **Story**: US-A01
- **Status**: ⬜ Not Started

#### TC-A01-002: 로그인 실패
- **Given**: 잘못된 비밀번호
- **When**: AuthAPI.login() 호출
- **Then**: APIError 발생 (401)
- **Story**: US-A01
- **Status**: ⬜ Not Started

---

### 1.2 OrderAPI

#### TC-A03-001: 테이블별 주문 조회 성공
- **Given**: 유효한 테이블 ID
- **When**: OrderAPI.getOrdersByTable(tableId) 호출
- **Then**: Order[] 반환
- **Story**: US-A03
- **Status**: ⬜ Not Started

#### TC-A04-001: 주문 상태 변경 성공
- **Given**: 유효한 주문 ID, 상태
- **When**: OrderAPI.updateOrderStatus(orderId, { status }) 호출
- **Then**: 업데이트된 Order 반환
- **Story**: US-A04
- **Status**: ⬜ Not Started

#### TC-A04-002: 주문 상태 변경 실패 (잘못된 상태 전이)
- **Given**: 잘못된 상태 전이
- **When**: OrderAPI.updateOrderStatus() 호출
- **Then**: APIError 발생 (422)
- **Story**: US-A04
- **Status**: ⬜ Not Started

---

### 1.3 TableAPI

#### TC-A05-001: 세션 종료 성공
- **Given**: 유효한 테이블 ID
- **When**: TableAPI.completeSession(tableId) 호출
- **Then**: 성공 (void)
- **Story**: US-A05
- **Status**: ⬜ Not Started

#### TC-A11-001: 주문 내역 조회 성공
- **Given**: 유효한 테이블 ID, 날짜 범위
- **When**: TableAPI.getOrderHistory(tableId, params) 호출
- **Then**: OrderHistory[] 반환
- **Story**: US-A11
- **Status**: ⬜ Not Started

---

### 1.4 MenuAPI

#### TC-A06-001: 메뉴 생성 성공
- **Given**: 유효한 메뉴 데이터 (FormData)
- **When**: MenuAPI.createMenu(formData) 호출
- **Then**: 생성된 Menu 반환
- **Story**: US-A06
- **Status**: ⬜ Not Started

#### TC-A06-002: 메뉴 생성 실패 (중복 메뉴명)
- **Given**: 중복된 메뉴명
- **When**: MenuAPI.createMenu(formData) 호출
- **Then**: APIError 발생 (409)
- **Story**: US-A06
- **Status**: ⬜ Not Started

#### TC-A07-001: 메뉴 수정 성공
- **Given**: 유효한 메뉴 ID, 수정 데이터
- **When**: MenuAPI.updateMenu(menuId, formData) 호출
- **Then**: 수정된 Menu 반환
- **Story**: US-A07
- **Status**: ⬜ Not Started

#### TC-A08-001: 메뉴 삭제 성공
- **Given**: 유효한 메뉴 ID
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

---

## 2. State Management Layer Tests

### 2.1 useAuthStore

#### TC-AUTH-001: 로그인 시 상태 업데이트
- **Given**: 초기 상태
- **When**: login(token, adminId, storeName) 호출
- **Then**: isAuthenticated=true, localStorage 업데이트
- **Story**: US-A01
- **Status**: ⬜ Not Started

#### TC-AUTH-002: 로그아웃 시 상태 초기화
- **Given**: 로그인 상태
- **When**: logout() 호출
- **Then**: isAuthenticated=false, localStorage 삭제
- **Story**: US-A01
- **Status**: ⬜ Not Started

#### TC-AUTH-003: 자동 로그인
- **Given**: localStorage에 유효한 토큰
- **When**: checkAuth() 호출
- **Then**: isAuthenticated=true
- **Story**: US-A01
- **Status**: ⬜ Not Started

#### TC-AUTH-004: 자동 로그아웃
- **Given**: localStorage에 만료된 토큰
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
- **Given**: "<script>alert('XSS')</script>"
- **When**: sanitizeInput(input) 호출
- **Then**: 빈 문자열 반환
- **Story**: US-A06, US-A07
- **Status**: ⬜ Not Started

#### TC-SEC-002: XSS 공격 방지 (이벤트 핸들러)
- **Given**: "<img src=x onerror=alert('XSS')>"
- **When**: sanitizeInput(input) 호출
- **Then**: 정제된 문자열 반환
- **Story**: US-A06, US-A07
- **Status**: ⬜ Not Started

#### TC-SEC-003: 정상 입력 유지
- **Given**: "김치찌개"
- **When**: sanitizeInput(input) 호출
- **Then**: "김치찌개" 반환
- **Story**: US-A06, US-A07
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
- **When**: TokenStorage.set(), TokenStorage.get() 호출
- **Then**: "test-token" 반환
- **Story**: US-A01
- **Status**: ⬜ Not Started

#### TC-TOKEN-002: 토큰 삭제
- **Given**: 저장된 토큰
- **When**: TokenStorage.remove(), TokenStorage.get() 호출
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

### 4.1 createImagePreview

#### TC-PREVIEW-001: 이미지 미리보기 생성
- **Given**: 유효한 이미지 파일
- **When**: createImagePreview(file) 호출
- **Then**: Data URL 반환
- **Story**: US-A09
- **Status**: ⬜ Not Started

---

### 4.2 Date Formatter

#### TC-DATE-001: 날짜 포맷팅
- **Given**: ISO 8601 날짜
- **When**: formatDate(date) 호출
- **Then**: "YYYY-MM-DD HH:mm:ss" 반환
- **Story**: US-A11
- **Status**: ⬜ Not Started

#### TC-DATE-002: 상대 시간 포맷팅
- **Given**: 3분 전 날짜
- **When**: formatRelativeTime(date) 호출
- **Then**: "3분 전" 반환
- **Story**: US-A02, US-A03
- **Status**: ⬜ Not Started

#### TC-DATE-003: 날짜 범위 포맷팅
- **Given**: start, end 날짜
- **When**: formatDateRange(start, end) 호출
- **Then**: "YYYY-MM-DD ~ YYYY-MM-DD" 반환
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
| REQ-003 (주문 조회) | TC-A03-001 | ⬜ Pending |
| REQ-004 (주문 상태 변경) | TC-A04-001, TC-A04-002 | ⬜ Pending |
| REQ-005 (세션 종료) | TC-A05-001 | ⬜ Pending |
| REQ-006 (메뉴 생성) | TC-A06-001, TC-A06-002, TC-SEC-001~003 | ⬜ Pending |
| REQ-007 (메뉴 수정) | TC-A07-001, TC-SEC-001~003 | ⬜ Pending |
| REQ-008 (메뉴 삭제) | TC-A08-001, TC-A08-002 | ⬜ Pending |
| REQ-009 (이미지 미리보기) | TC-PREVIEW-001 | ⬜ Pending |
| REQ-011 (주문 내역) | TC-A11-001, TC-DATE-001~003 | ⬜ Pending |
| REQ-012 (실시간 업데이트) | TC-SSE-001~003 | ⬜ Pending |
| REQ-013 (Rate Limiting) | TC-RATE-001~003 | ⬜ Pending |

---

## Test Summary

- **Total Test Cases**: 35 (50개에서 축소)
- **API Client Tests**: 11 (20개에서 축소)
- **State Management Tests**: 7
- **Security Tests**: 9
- **Utility Tests**: 4 (7개에서 축소)
- **Real-time Communication Tests**: 3
- **UI Tests**: 3 (4개에서 축소)

---

**Test plan aligned with Unit 1 Backend implementation.**
