# NFR Requirements Plan - Unit 2: Customer Frontend

## Unit Context

### Unit Name
**Unit 2: Customer Frontend** (table-order-customer-ui)

### Functional Design Summary
- **UI Structure**: Multi-page routing (Login, Menu, Cart, Orders)
- **State Management**: Zustand (client state) + React Query (server state)
- **Key Features**: 메뉴 조회, 장바구니 관리, 주문 생성, 실시간 상태 업데이트
- **Technology Stack**: React 18 + TypeScript + Vite + Tailwind CSS

---

## NFR Assessment Questions

### Category 1: Performance Requirements

#### Q1: Response Time Expectations
고객용 프론트엔드의 응답 시간 요구사항은 무엇인가요?

**Options:**
- A) 매우 빠름 (< 100ms for UI interactions, < 500ms for API calls)
- B) 빠름 (< 200ms for UI interactions, < 1s for API calls)
- C) 보통 (< 500ms for UI interactions, < 2s for API calls)
- D) 느림 허용 (< 1s for UI interactions, < 3s for API calls)

[Answer]: B

---

#### Q2: Initial Load Time
페이지 초기 로딩 시간 목표는 무엇인가요?

**Options:**
- A) 매우 빠름 (< 1초)
- B) 빠름 (< 2초)
- C) 보통 (< 3초)
- D) 느림 허용 (< 5초)

[Answer]: B

---

#### Q3: Image Loading Strategy
메뉴 이미지 로딩 전략은 무엇인가요?

**Options:**
- A) Eager loading (모든 이미지 즉시 로드)
- B) Lazy loading (화면에 보일 때만 로드)
- C) Progressive loading (저화질 → 고화질)
- D) On-demand loading (클릭 시에만 로드)

[Answer]: B

---

#### Q4: Bundle Size Target
JavaScript 번들 크기 목표는 무엇인가요?

**Options:**
- A) 매우 작음 (< 100KB gzipped)
- B) 작음 (< 200KB gzipped)
- C) 보통 (< 500KB gzipped)
- D) 크기 제한 없음

[Answer]: B

---

### Category 2: Scalability Requirements

#### Q5: Concurrent Users per Tablet
태블릿 당 동시 사용자 수는 몇 명인가요?

**Options:**
- A) 1명 (단일 사용자)
- B) 2-4명 (소규모 그룹)
- C) 5-10명 (중규모 그룹)
- D) 10명 이상 (대규모 그룹)

[Answer]: A

---

#### Q6: Expected Number of Tablets
예상되는 태블릿 수는 몇 대인가요?

**Options:**
- A) 1-10대 (소규모 매장)
- B) 11-50대 (중규모 매장)
- C) 51-100대 (대규모 매장)
- D) 100대 이상 (체인점)

[Answer]: A

---

#### Q7: Menu Item Count
예상되는 메뉴 아이템 수는 몇 개인가요?

**Options:**
- A) 1-50개 (소규모 메뉴)
- B) 51-200개 (중규모 메뉴)
- C) 201-500개 (대규모 메뉴)
- D) 500개 이상 (초대규모 메뉴)

[Answer]: A

---

### Category 3: Availability Requirements

#### Q8: Uptime Requirement
프론트엔드 가용성 요구사항은 무엇인가요?

**Options:**
- A) 99.99% (연간 52분 다운타임)
- B) 99.9% (연간 8.7시간 다운타임)
- C) 99% (연간 3.65일 다운타임)
- D) Best effort (특정 목표 없음)

[Answer]: C

---

#### Q9: Offline Support
오프라인 지원이 필요한가요?

**Options:**
- A) 완전한 오프라인 지원 (Service Worker + IndexedDB)
- B) 부분 오프라인 지원 (캐시된 데이터만 표시)
- C) 오프라인 감지만 (에러 메시지 표시)
- D) 오프라인 지원 불필요

[Answer]: C

---

#### Q10: Error Recovery
에러 복구 전략은 무엇인가요?

**Options:**
- A) 자동 재시도 (exponential backoff)
- B) 수동 재시도 (사용자가 버튼 클릭)
- C) 페이지 새로고침 필요
- D) 에러 메시지만 표시

[Answer]: B

---

### Category 4: Security Requirements

#### Q11: Authentication Method
인증 방식은 무엇인가요?

**Options:**
- A) JWT (Bearer token)
- B) Session cookie
- C) OAuth 2.0
- D) API Key

[Answer]: A

---

#### Q12: Token Storage
토큰 저장 위치는 어디인가요?

**Options:**
- A) localStorage
- B) sessionStorage
- C) Cookie (HttpOnly)
- D) Memory only (no persistence)

[Answer]: A

---

#### Q13: XSS Protection
XSS 공격 방어 전략은 무엇인가요?

**Options:**
- A) Content Security Policy (CSP) + Input sanitization
- B) Input sanitization only
- C) React의 기본 XSS 방어만 사용
- D) 특별한 방어 불필요

[Answer]: C

---

#### Q14: HTTPS Requirement
HTTPS 사용이 필수인가요?

**Options:**
- A) 필수 (프로덕션 환경)
- B) 권장 (개발 환경은 HTTP 허용)
- C) 선택 사항
- D) 불필요

[Answer]: A

---

### Category 5: Usability Requirements

#### Q15: Target Device
주요 타겟 디바이스는 무엇인가요?

**Options:**
- A) 태블릿 전용 (10-13인치)
- B) 태블릿 + 모바일 (반응형)
- C) 모바일 전용
- D) 데스크톱 전용

[Answer]: A

---

#### Q16: Touch Optimization
터치 최적화 수준은 어느 정도인가요?

**Options:**
- A) 고도 최적화 (44x44px 최소, 제스처 지원)
- B) 기본 최적화 (44x44px 최소)
- C) 최소 최적화 (터치 가능한 정도)
- D) 최적화 불필요

[Answer]: B

---

#### Q17: Accessibility (a11y)
접근성 요구사항은 무엇인가요?

**Options:**
- A) WCAG 2.1 AAA 준수
- B) WCAG 2.1 AA 준수
- C) 기본 접근성 (ARIA labels, 색상 대비)
- D) 접근성 고려 불필요

[Answer]: C

---

#### Q18: Internationalization (i18n)
다국어 지원이 필요한가요?

**Options:**
- A) 필수 (2개 이상 언어)
- B) 향후 지원 예정 (구조만 준비)
- C) 불필요 (한국어만)
- D) 고려 안 함

[Answer]: C

---

### Category 6: Reliability Requirements

#### Q19: Error Logging
에러 로깅 전략은 무엇인가요?

**Options:**
- A) 중앙 집중식 로깅 (Sentry, LogRocket 등)
- B) 콘솔 로깅만
- C) 로깅 불필요
- D) 서버 로깅만

[Answer]: B

---

#### Q20: Monitoring & Analytics
모니터링 및 분석 도구가 필요한가요?

**Options:**
- A) 필수 (Google Analytics, Mixpanel 등)
- B) 향후 추가 예정
- C) 불필요
- D) 서버 측 모니터링만

[Answer]: C

---

### Category 7: Maintainability Requirements

#### Q21: Code Quality Standards
코드 품질 기준은 무엇인가요?

**Options:**
- A) 엄격 (ESLint strict, Prettier, Husky pre-commit)
- B) 표준 (ESLint recommended, Prettier)
- C) 최소 (ESLint basic)
- D) 기준 없음

[Answer]: B

---

#### Q22: Testing Strategy
테스트 전략은 무엇인가요?

**Options:**
- A) 포괄적 (Unit + Integration + E2E)
- B) 표준 (Unit + Integration)
- C) 최소 (Unit tests만)
- D) 테스트 불필요

[Answer]: C

---

#### Q23: Documentation Level
문서화 수준은 어느 정도인가요?

**Options:**
- A) 포괄적 (README, API docs, Component docs, ADR)
- B) 표준 (README, API docs)
- C) 최소 (README만)
- D) 문서화 불필요

[Answer]: B

---

### Category 8: Tech Stack Decisions

#### Q24: CSS Framework
CSS 프레임워크 선택은 무엇인가요?

**Options:**
- A) Tailwind CSS
- B) Material-UI
- C) Ant Design
- D) Custom CSS

[Answer]: A

---

#### Q25: State Management Library
상태 관리 라이브러리 선택은 무엇인가요?

**Options:**
- A) Zustand (lightweight)
- B) Redux Toolkit (feature-rich)
- C) Jotai (atomic)
- D) Context API only

[Answer]: A

---

#### Q26: Data Fetching Library
데이터 페칭 라이브러리 선택은 무엇인가요?

**Options:**
- A) React Query (TanStack Query)
- B) SWR
- C) RTK Query
- D) Axios only (no caching)

[Answer]: A

---

#### Q27: Build Tool
빌드 도구 선택은 무엇인가요?

**Options:**
- A) Vite (fast, modern)
- B) Webpack (configurable)
- C) Create React App (simple)
- D) Parcel (zero-config)

[Answer]: A

---

#### Q28: Package Manager
패키지 매니저 선택은 무엇인가요?

**Options:**
- A) npm
- B) yarn
- C) pnpm
- D) bun

[Answer]: A

---

## Plan Execution Checklist

- [x] Step 1: Collect all answers from user
- [x] Step 2: Analyze answers for ambiguities
- [x] Step 3: Create clarification questions if needed
- [x] Step 4: Generate NFR Requirements document
- [x] Step 5: Generate Tech Stack Decisions document
- [x] Step 6: Present completion message
- [ ] Step 7: Wait for user approval
- [ ] Step 8: Record approval in audit.md
- [ ] Step 9: Update aidlc-state.md

---

**Plan Status**: ✅ COMPLETED

**Completion Date**: 2026-02-09

**Next Step**: User approval → NFR Design stage
