# NFR Requirements Plan - Unit 3 (Admin Frontend)

## Context

### Unit Information
- **Unit Name**: Admin Frontend (table-order-admin-ui)
- **Type**: Frontend Application (React + TypeScript)
- **Primary Functions**:
  - 실시간 주문 모니터링 (SSE)
  - 주문 관리 (상태 변경, 삭제)
  - 테이블 세션 관리
  - 메뉴 CRUD
  - 과거 주문 내역 조회

### Functional Design Summary
- **Real-time**: SSE + 5분 주기적 동기화
- **Concurrency**: Optimistic Locking (Order.version)
- **Data Management**: React Query (서버 상태), useState (로컬 상태)
- **Error Handling**: Toast + Modal combination
- **Notification**: Visual + Sound

---

## NFR Questions

### 1. Performance Requirements

#### Q1: Dashboard Loading Performance
대시보드 초기 로딩 시간 목표는?

**Context**: 대시보드는 모든 테이블 + 주문 데이터를 로드합니다.

**Options**:
A) **Fast** - 1초 이내 (최적화 필수)
B) **Standard** - 2-3초 이내 (요구사항 기준)
C) **Relaxed** - 5초 이내

[Answer]: 

---

#### Q2: SSE Connection Latency
SSE 이벤트 수신 후 UI 반영 시간 목표는?

**Context**: 신규 주문 발생 시 대시보드 업데이트 속도

**Options**:
A) **Real-time** - 500ms 이내
B) **Near real-time** - 1-2초 이내 (요구사항 기준)
C) **Acceptable** - 3-5초 이내

[Answer]: 

---

#### Q3: API Response Time
일반 API 호출 (주문 상태 변경, 메뉴 CRUD 등) 응답 시간 목표는?

**Options**:
A) **Fast** - 500ms 이내
B) **Standard** - 1-2초 이내
C) **Relaxed** - 3-5초 이내

[Answer]: 

---

#### Q4: Image Upload Performance
메뉴 이미지 업로드 시간 목표는?

**Context**: 이미지 크기 최대 5MB

**Options**:
A) **Fast** - 2초 이내
B) **Standard** - 5초 이내
C) **Relaxed** - 10초 이내

[Answer]: 

---

### 2. Scalability Requirements

#### Q5: Concurrent Admin Users
동시 접속 관리자 수는?

**Context**: 요구사항에 "동시 접속 관리자 10명" 명시

**Options**:
A) **Confirmed** - 10명 (요구사항 그대로)
B) **Higher** - 20-50명 (확장 고려)
C) **Custom** - 직접 명시

[Answer]: 

---

#### Q6: Table/Order Scale
관리할 테이블 및 주문 규모는?

**Context**: 요구사항에 "테이블 10-50개" 명시

**Options**:
A) **Small** - 테이블 10-20개, 동시 활성 주문 50개 이하
B) **Medium** - 테이블 20-50개, 동시 활성 주문 100-200개 (요구사항 기준)
C) **Large** - 테이블 50개 이상, 동시 활성 주문 200개 이상

[Answer]: 

---

#### Q7: SSE Connection Scaling
SSE 연결 확장 전략은?

**Context**: 관리자 10명이 동시에 SSE 연결

**Options**:
A) **Direct** - 각 관리자가 Backend에 직접 연결 (단순)
B) **Redis Pub/Sub** - Backend가 Redis Pub/Sub 사용 (확장성)
C) **Not Decided** - Backend 팀 결정 대기

[Answer]: 

---

### 3. Availability Requirements

#### Q8: Uptime Expectation
Admin Frontend 가용성 목표는?

**Options**:
A) **High** - 99.9% (연간 다운타임 8.76시간)
B) **Standard** - 99% (연간 다운타임 3.65일)
C) **Best Effort** - 목표 없음 (개발 단계)

[Answer]: 

---

#### Q9: Offline Capability
네트워크 끊김 시 동작 방식은?

**Options**:
A) **Offline Support** - Service Worker로 오프라인 기능 제공
B) **Graceful Degradation** - 에러 메시지 표시, 재연결 시도
C) **No Support** - 네트워크 필수

[Answer]: 

---

### 4. Security Requirements

#### Q10: HTTPS Requirement
HTTPS 사용 여부는?

**Options**:
A) **Required** - 운영 환경 HTTPS 필수
B) **Optional** - HTTP도 허용
C) **Development Only** - 로컬 개발만 HTTP

[Answer]: 

---

#### Q11: XSS/CSRF Protection
XSS, CSRF 공격 방어 수준은?

**Options**:
A) **Strict** - CSP 헤더, CSRF 토큰, Input sanitization 모두 적용
B) **Standard** - React 기본 XSS 방어 + Backend CSRF 토큰
C) **Basic** - React 기본 XSS 방어만

[Answer]: 

---

#### Q12: Sensitive Data Handling
localStorage에 저장되는 민감 데이터 처리는?

**Context**: JWT 토큰, Admin 정보 저장

**Options**:
A) **Encrypted** - localStorage 데이터 암호화
B) **Plain** - 평문 저장 (JWT는 이미 서명됨)
C) **SessionStorage** - localStorage 대신 sessionStorage 사용

[Answer]: 

---

### 5. Reliability Requirements

#### Q13: Error Recovery
에러 발생 시 복구 전략은?

**Options**:
A) **Auto Retry** - API 실패 시 자동 재시도 (최대 3회)
B) **Manual Retry** - 사용자에게 재시도 버튼 제공
C) **No Retry** - 에러 메시지만 표시

[Answer]: 

---

#### Q14: Monitoring & Logging
Frontend 모니터링 및 로깅 수준은?

**Options**:
A) **Comprehensive** - Sentry/DataDog 등 APM 도구 사용
B) **Basic** - Console.log + Backend 로그
C) **None** - 개발 단계에서는 불필요

[Answer]: 

---

### 6. Usability Requirements

#### Q15: Browser Support
지원할 브라우저는?

**Options**:
A) **Modern Only** - Chrome/Edge/Safari 최신 2개 버전
B) **Extended** - Chrome/Edge/Safari/Firefox 최신 2개 버전
C) **Legacy** - IE11 포함

[Answer]: 

---

#### Q16: Responsive Design
반응형 디자인 지원 범위는?

**Context**: 관리자는 주로 데스크톱/태블릿 사용

**Options**:
A) **Desktop Only** - 1280px 이상만 지원
B) **Desktop + Tablet** - 768px 이상 지원
C) **Fully Responsive** - 모바일 포함 (320px 이상)

[Answer]: 

---

#### Q17: Accessibility (a11y)
접근성 지원 수준은?

**Options**:
A) **WCAG 2.1 AA** - 접근성 표준 준수
B) **Basic** - 키보드 네비게이션, 스크린 리더 기본 지원
C) **None** - 접근성 고려 안 함

[Answer]: 

---

### 7. Tech Stack Decisions

#### Q18: UI Component Library
사용할 UI 컴포넌트 라이브러리는?

**Options**:
A) **Material-UI (MUI)** - 풍부한 컴포넌트, 무거움
B) **Ant Design** - 관리자 UI에 최적화
C) **Tailwind CSS + Headless UI** - 가볍고 커스터마이징 용이
D) **Custom** - 직접 명시

[Answer]: 

---

#### Q19: State Management Library
React Query 외 추가 상태 관리 라이브러리는?

**Context**: React Query (서버 상태), useState (로컬 상태) 이미 사용

**Options**:
A) **None** - React Query + useState 충분
B) **Zustand** - 글로벌 상태 필요 시 (가벼움)
C) **Redux Toolkit** - 복잡한 상태 관리 필요 시

[Answer]: 

---

#### Q20: Form Library
폼 관리 라이브러리는?

**Context**: 메뉴 등록/수정, 카테고리 관리 폼

**Options**:
A) **React Hook Form** - 가볍고 성능 좋음
B) **Formik** - 풍부한 기능
C) **None** - useState로 직접 관리

[Answer]: 

---

#### Q21: Date/Time Library
날짜/시간 처리 라이브러리는?

**Context**: 과거 주문 내역 날짜 필터

**Options**:
A) **date-fns** - 가볍고 트리 쉐이킹 지원
B) **Day.js** - Moment.js 대체, 가벼움
C) **Luxon** - 타임존 처리 강력
D) **Native Date** - 라이브러리 없이 사용

[Answer]: 

---

#### Q22: Testing Strategy
테스트 전략은?

**Options**:
A) **Comprehensive** - Unit + Integration + E2E (Jest + React Testing Library + Playwright)
B) **Standard** - Unit + Integration (Jest + React Testing Library)
C) **Minimal** - Unit 테스트만 (Jest)
D) **None** - 테스트 작성 안 함

[Answer]: 

---

## NFR Assessment Plan

### Phase 1: Performance Requirements Definition
- [ ] Define dashboard loading performance targets
- [ ] Define SSE latency targets
- [ ] Define API response time targets
- [ ] Define image upload performance targets

### Phase 2: Scalability Requirements Definition
- [ ] Define concurrent user capacity
- [ ] Define table/order scale limits
- [ ] Define SSE connection scaling strategy

### Phase 3: Availability & Reliability Definition
- [ ] Define uptime expectations
- [ ] Define offline capability requirements
- [ ] Define error recovery strategy
- [ ] Define monitoring and logging approach

### Phase 4: Security Requirements Definition
- [ ] Define HTTPS requirements
- [ ] Define XSS/CSRF protection level
- [ ] Define sensitive data handling approach

### Phase 5: Usability Requirements Definition
- [ ] Define browser support matrix
- [ ] Define responsive design scope
- [ ] Define accessibility level

### Phase 6: Tech Stack Selection
- [ ] Select UI component library
- [ ] Select state management approach
- [ ] Select form library
- [ ] Select date/time library
- [ ] Define testing strategy

### Phase 7: Documentation
- [ ] Generate nfr-requirements.md
- [ ] Generate tech-stack-decisions.md
- [ ] Document rationale for each decision

---

## Success Criteria
- [ ] All 22 questions answered
- [ ] No ambiguous answers
- [ ] User approval obtained
- [ ] NFR requirements documented
- [ ] Tech stack decisions documented with rationale

---

**Status**: Awaiting user input for Q1-Q22
