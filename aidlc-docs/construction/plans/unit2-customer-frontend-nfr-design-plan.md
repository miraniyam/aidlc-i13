# NFR Design Plan - Unit 2: Customer Frontend

## Unit Context

### Unit Name
**Unit 2: Customer Frontend** (table-order-customer-ui)

### NFR Requirements Summary
- **Performance**: < 200ms UI, < 1s API, < 2s initial load, lazy loading, < 200KB bundle
- **Scalability**: 1명/태블릿, 1-10대, 1-50개 메뉴
- **Availability**: 99% 가용성, 오프라인 감지, 수동 재시도
- **Security**: JWT (localStorage), React 기본 XSS 방어, HTTPS
- **Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query

---

## NFR Design Questions

### Category 1: Performance Optimization Patterns

#### Q1: Code Splitting Strategy
React 애플리케이션의 code splitting 전략은 무엇인가요?

**Options:**
- A) Route-based splitting (페이지별 분리)
- B) Component-based splitting (컴포넌트별 분리)
- C) Feature-based splitting (기능별 분리)
- D) No splitting (단일 번들)

[Answer]: A

**Rationale**: 페이지별로 분리하면 초기 로딩 시간을 단축하고 사용자가 필요한 페이지만 로드할 수 있음

---

#### Q2: Image Optimization Strategy
메뉴 이미지 최적화 전략은 무엇인가요?

**Options:**
- A) WebP format + Lazy loading + Placeholder
- B) JPEG/PNG + Lazy loading
- C) SVG only
- D) No optimization

[Answer]: A

**Rationale**: WebP는 파일 크기가 작고 품질이 좋음. Lazy loading과 placeholder로 초기 로딩 시간 단축

---

#### Q3: Bundle Optimization Techniques
번들 크기 최적화 기법은 무엇인가요?

**Options:**
- A) Tree shaking + Minification + Compression (gzip/brotli)
- B) Tree shaking + Minification
- C) Minification only
- D) No optimization

[Answer]: A

**Rationale**: 모든 최적화 기법을 적용하여 < 200KB 목표 달성

---

### Category 2: Caching Patterns

#### Q4: API Response Caching Strategy
API 응답 캐싱 전략은 무엇인가요?

**Options:**
- A) React Query with 5min staleTime + 10min cacheTime
- B) React Query with 1min staleTime + 5min cacheTime
- C) No caching (always fresh)
- D) Browser cache only

[Answer]: A

**Rationale**: 메뉴 데이터는 자주 변경되지 않으므로 5분 캐싱으로 서버 부하 감소

---

#### Q5: Static Asset Caching
정적 자산 (JS, CSS, images) 캐싱 전략은 무엇인가요?

**Options:**
- A) Long-term caching with content hash (1년)
- B) Short-term caching (1일)
- C) No caching
- D) Session-based caching

[Answer]: A

**Rationale**: Vite가 자동으로 content hash를 생성하므로 장기 캐싱 가능

---

### Category 3: Error Handling Patterns

#### Q6: API Error Handling Pattern
API 에러 처리 패턴은 무엇인가요?

**Options:**
- A) Axios interceptor + React Query error handling + Toast notification
- B) Try-catch in components
- C) Global error boundary only
- D) No error handling

[Answer]: A

**Rationale**: 중앙 집중식 에러 처리로 일관된 사용자 경험 제공

---

#### Q7: Network Error Recovery
네트워크 에러 복구 패턴은 무엇인가요?

**Options:**
- A) Manual retry with user action (button click)
- B) Automatic retry with exponential backoff
- C) No retry
- D) Page reload only

[Answer]: A

**Rationale**: NFR Requirements에서 수동 재시도로 결정됨

---

### Category 4: Security Implementation Patterns

#### Q8: Token Management Pattern
JWT 토큰 관리 패턴은 무엇인가요?

**Options:**
- A) localStorage + Client-side expiry check + Auto-logout on 401
- B) sessionStorage + Server-side expiry check
- C) Cookie (HttpOnly) + Server-side expiry check
- D) Memory only (no persistence)

[Answer]: A

**Rationale**: NFR Requirements에서 localStorage 사용으로 결정됨. 클라이언트 측 만료 검증 추가

---

#### Q9: XSS Protection Implementation
XSS 방어 구현 방법은 무엇인가요?

**Options:**
- A) React default escaping + No dangerouslySetInnerHTML
- B) React default escaping + DOMPurify for user input
- C) Content Security Policy (CSP) headers
- D) No special protection

[Answer]: A

**Rationale**: NFR Requirements에서 React 기본 방어만 사용하기로 결정됨

---

### Category 5: State Management Patterns

#### Q10: Client State Persistence Pattern
클라이언트 상태 (장바구니) 영속성 패턴은 무엇인가요?

**Options:**
- A) Zustand persist middleware + localStorage
- B) Manual localStorage sync
- C) IndexedDB
- D) No persistence

[Answer]: A

**Rationale**: Zustand의 persist middleware를 사용하면 자동으로 localStorage와 동기화

---

#### Q11: Server State Synchronization Pattern
서버 상태 동기화 패턴은 무엇인가요?

**Options:**
- A) React Query with polling (30s for orders)
- B) WebSocket for real-time updates
- C) Server-Sent Events (SSE)
- D) Manual refetch only

[Answer]: A

**Rationale**: Functional Design에서 30초 폴링으로 결정됨. WebSocket은 과함

---

### Category 6: Resilience Patterns

#### Q12: Offline Detection Pattern
오프라인 감지 패턴은 무엇인가요?

**Options:**
- A) Navigator.onLine API + Event listeners (offline/online)
- B) Periodic ping to server
- C) No offline detection
- D) Service Worker offline detection

[Answer]: A

**Rationale**: 브라우저 기본 API 사용으로 간단하게 구현

---

#### Q13: Loading State Pattern
로딩 상태 표시 패턴은 무엇인가요?

**Options:**
- A) React Query loading states + Spinner component
- B) Global loading indicator
- C) No loading indicator
- D) Skeleton screens

[Answer]: A

**Rationale**: React Query가 자동으로 로딩 상태를 관리하므로 Spinner 컴포넌트만 추가

---

### Category 7: Routing Patterns

#### Q14: Protected Route Pattern
인증 보호 라우트 패턴은 무엇인가요?

**Options:**
- A) Higher-Order Component (HOC) with token validation
- B) Route guard with middleware
- C) Manual check in each component
- D) No protection

[Answer]: A

**Rationale**: React Router의 Outlet을 사용한 HOC 패턴이 가장 간단

---

#### Q15: Navigation Pattern
페이지 네비게이션 패턴은 무엇인가요?

**Options:**
- A) Bottom navigation bar (fixed)
- B) Top navigation bar
- C) Sidebar navigation
- D) No navigation

[Answer]: A

**Rationale**: Functional Design에서 하단 네비게이션 바로 결정됨

---

### Category 8: Monitoring & Observability

#### Q16: Client-Side Logging Pattern
클라이언트 측 로깅 패턴은 무엇인가요?

**Options:**
- A) Console logging only (development)
- B) Centralized logging (Sentry, LogRocket)
- C) No logging
- D) Server-side logging only

[Answer]: A

**Rationale**: NFR Requirements에서 콘솔 로깅만 사용하기로 결정됨

---

#### Q17: Performance Monitoring
성능 모니터링 방법은 무엇인가요?

**Options:**
- A) Browser DevTools only
- B) Web Vitals API + Analytics
- C) No monitoring
- D) Third-party APM (Application Performance Monitoring)

[Answer]: A

**Rationale**: MVP 단계에서는 DevTools로 충분

---

## Plan Execution Checklist

- [x] Step 1: Analyze NFR Requirements
- [x] Step 2: Create NFR Design Plan
- [x] Step 3: Collect answers from user
- [x] Step 4: Analyze answers for ambiguities
- [x] Step 5: Generate NFR Design Patterns document
- [x] Step 6: Generate Logical Components document
- [ ] Step 7: Present completion message
- [ ] Step 8: Wait for user approval
- [ ] Step 9: Record approval in audit.md

---

**Plan Status**: Completed - Awaiting User Approval

**Next Step**: User completes [Answer]: tags → AI generates NFR Design artifacts
