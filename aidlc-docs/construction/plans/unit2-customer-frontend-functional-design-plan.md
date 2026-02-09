# Functional Design Plan - Unit 2: Customer Frontend

## Unit Context

### Unit Name
**Unit 2: Customer Frontend** (table-order-customer-ui)

### Responsibilities
- 고객용 주문 인터페이스 제공
- 테이블 자동 로그인
- 메뉴 탐색 및 상세 조회
- 장바구니 관리 (로컬 상태)
- 주문 생성 및 내역 조회
- 주문 상태 폴링 (30초 간격)

### Assigned Stories
10개 User Stories (고객 Journey)
- US-C01: 테이블 태블릿 자동 로그인
- US-C02: 메뉴 카테고리별 조회
- US-C03: 메뉴 상세 정보 조회
- US-C04: 장바구니에 메뉴 추가
- US-C05: 장바구니에서 수량 조절
- US-C06: 장바구니에서 메뉴 삭제
- US-C07: 장바구니 비우기
- US-C08: 주문 생성
- US-C09: 주문 내역 조회
- US-C10: 주문 상태 실시간 업데이트

### Technology Stack
- TypeScript
- React 18+
- Zustand (장바구니 상태 관리)
- React Query (서버 상태 관리)
- React Router (라우팅)
- Axios (HTTP 클라이언트)
- Tailwind CSS or Material-UI (스타일링)
- Vite (빌드 도구)

### Dependencies
- **Upstream**: Unit 1 (Backend API) - OpenAPI 스키마 기반 타입 생성
- **Downstream**: None

---

## Functional Design Plan

### Phase 1: UI Component Structure Design
- [ ] 1.1 페이지 구조 정의 (라우팅 구조)
- [ ] 1.2 컴포넌트 계층 구조 설계
- [ ] 1.3 공통 컴포넌트 식별 (Button, Modal, Card 등)
- [ ] 1.4 레이아웃 컴포넌트 설계 (Header, Footer, Navigation)

### Phase 2: State Management Design
- [ ] 2.1 클라이언트 상태 설계 (Zustand)
  - 장바구니 상태 구조
  - 장바구니 액션 정의
- [ ] 2.2 서버 상태 설계 (React Query)
  - 쿼리 키 전략
  - 캐싱 전략
  - 폴링 전략
- [ ] 2.3 로컬 스토리지 전략
  - 인증 토큰 저장
  - 장바구니 영속성

### Phase 3: User Flow Design
- [ ] 3.1 로그인 플로우 설계
- [ ] 3.2 메뉴 탐색 플로우 설계
- [ ] 3.3 장바구니 플로우 설계
- [ ] 3.4 주문 생성 플로우 설계
- [ ] 3.5 주문 내역 조회 플로우 설계

### Phase 4: API Integration Design
- [ ] 4.1 API 클라이언트 구조 설계
- [ ] 4.2 TypeScript 타입 정의 전략 (OpenAPI 기반)
- [ ] 4.3 에러 핸들링 전략
- [ ] 4.4 로딩 상태 관리 전략

### Phase 5: Business Logic Design
- [ ] 5.1 장바구니 계산 로직 (총액, 수량)
- [ ] 5.2 주문 검증 로직 (클라이언트 측)
- [ ] 5.3 자동 로그인 로직
- [ ] 5.4 주문 상태 폴링 로직

---

## Clarification Questions

### UI Component Structure Questions

#### Q1: 페이지 라우팅 구조
고객 프론트엔드의 페이지 구조를 결정해야 합니다.

**Options:**
A) Single Page Application (모든 기능이 하나의 페이지, 모달/탭으로 전환)
B) Multi-page with routing (메뉴, 장바구니, 주문내역 각각 별도 페이지)
C) Hybrid (메인 페이지 + 일부 모달)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

**Follow-up (if B or C):** 라우팅 경로 구조는?
- /menu (메뉴 목록)
- /cart (장바구니)
- /orders (주문 내역)
- /menu/:menuId (메뉴 상세)

[Answer]: Yes, 위 구조 사용. / (root)는 /menu로 리다이렉트 

---

#### Q2: 메뉴 상세 표시 방식
메뉴 상세 정보를 어떻게 표시할지 결정해야 합니다.

**Options:**
A) Modal (메뉴 목록 위에 오버레이)
B) Separate page (별도 페이지로 이동)
C) Expandable card (카드가 확장되어 상세 표시)
D) Other (please describe after [Answer]: tag below)

[Answer]: A 

---

#### Q3: 네비게이션 구조
고객 인터페이스의 네비게이션 방식을 결정해야 합니다.

**Options:**
A) Bottom navigation bar (하단 탭 바: 메뉴, 장바구니, 주문내역)
B) Top navigation bar (상단 메뉴)
C) Floating action button (플로팅 버튼으로 장바구니 접근)
D) No navigation (페이지 내 버튼으로만 이동)
E) Other (please describe after [Answer]: tag below)

[Answer]: A 

---

#### Q4: 장바구니 접근 방식
장바구니를 어떻게 표시하고 접근할지 결정해야 합니다.

**Options:**
A) Dedicated page (별도 페이지, 네비게이션으로 이동)
B) Slide-in panel (우측에서 슬라이드되는 패널)
C) Modal (전체 화면 모달)
D) Always visible (화면 하단에 항상 표시)
E) Other (please describe after [Answer]: tag below)

[Answer]: A 

---

### State Management Questions

#### Q5: 장바구니 데이터 구조
장바구니에 저장할 데이터 구조를 결정해야 합니다.

**Proposed Structure:**
```typescript
interface CartItem {
  menuId: string;
  menuName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
}
```

**Questions:**
- 위 구조가 적절한가요? 추가로 필요한 필드가 있나요?

[Answer]: 적절함. 추가 필드 불필요

- 장바구니에 메뉴 카테고리 정보도 저장해야 하나요?

[Answer]: No, 카테고리 정보는 불필요 (메뉴 표시용으로만 사용) 

---

#### Q6: 장바구니 영속성 전략
장바구니 데이터를 어떻게 유지할지 결정해야 합니다.

**Options:**
A) localStorage only (브라우저 새로고침 시에도 유지)
B) sessionStorage only (탭 닫으면 삭제)
C) Memory only (새로고침 시 삭제)
D) localStorage + 서버 동기화 (백엔드에도 저장)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

**Follow-up:** 장바구니 데이터 만료 정책은?
- 세션 종료 시 자동 삭제?
- 일정 시간 후 자동 삭제? (예: 24시간)
- 수동 삭제만 가능?

[Answer]: 세션 종료 시 자동 삭제 (관리자가 테이블 세션 종료하면 장바구니도 초기화) 

---

#### Q7: React Query 캐싱 전략
메뉴 데이터 캐싱 전략을 결정해야 합니다.

**Options:**
A) Aggressive caching (메뉴는 자주 변경되지 않으므로 긴 캐시 시간, 예: 1시간)
B) Moderate caching (중간 캐시 시간, 예: 5분)
C) Minimal caching (짧은 캐시 시간, 예: 30초)
D) No caching (항상 서버에서 최신 데이터 가져오기)
E) Other (please describe after [Answer]: tag below)

[Answer]: B 

---

#### Q8: 주문 상태 폴링 전략
주문 상태 업데이트를 어떻게 처리할지 결정해야 합니다.

**Options:**
A) React Query polling (30초 간격, 자동 refetch)
B) setInterval + manual fetch (30초 간격, 수동 구현)
C) WebSocket (실시간 업데이트, Backend 지원 필요)
D) SSE (Server-Sent Events, Backend 지원 필요)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

**Follow-up:** 폴링은 언제 시작/중지하나요?
- 주문 내역 페이지 진입 시 시작, 이탈 시 중지?
- 앱 전체에서 항상 폴링?
- 주문 생성 후 일정 시간만 폴링? (예: 30분)

[Answer]: 주문 내역 페이지 진입 시 시작, 이탈 시 중지 

---

### User Flow Questions

#### Q9: 자동 로그인 플로우
테이블 자동 로그인의 구체적인 플로우를 결정해야 합니다.

**Scenario:**
1. 고객이 태블릿을 켠다
2. 앱이 로드된다
3. localStorage에 JWT 토큰 확인
4. 토큰이 있으면?

**Options:**
A) 즉시 메뉴 화면으로 이동 (토큰 검증 없이)
B) 토큰 검증 API 호출 후 메뉴 화면 이동
C) 토큰 만료 확인 (클라이언트 측) 후 메뉴 화면 이동
D) Other (please describe after [Answer]: tag below)

[Answer]: C

**Follow-up:** 토큰이 없거나 만료된 경우?
- 로그인 화면 표시 (테이블 ID + 비밀번호 입력)?
- 에러 메시지 표시 후 관리자 호출 안내?

[Answer]: 로그인 화면 표시 (테이블 ID + 비밀번호 입력) 

---

#### Q10: 주문 생성 후 플로우
주문 생성 성공 후 사용자 경험을 결정해야 합니다.

**Options:**
A) 성공 메시지 표시 → 5초 후 자동으로 메뉴 화면 이동
B) 성공 메시지 표시 → 사용자가 "확인" 버튼 클릭 시 메뉴 화면 이동
C) 성공 메시지 표시 → 주문 내역 화면으로 이동
D) 성공 메시지 없이 즉시 메뉴 화면 이동
E) Other (please describe after [Answer]: tag below)

[Answer]: A 

---

#### Q11: 장바구니 비우기 확인
장바구니 비우기 시 확인 절차를 결정해야 합니다.

**Options:**
A) 확인 팝업 표시 (실수 방지)
B) 확인 없이 즉시 비우기
C) Undo 기능 제공 (비운 후 5초 내 복구 가능)
D) Other (please describe after [Answer]: tag below)

[Answer]: A 

---

### API Integration Questions

#### Q12: API 베이스 URL 설정
Backend API 베이스 URL을 어떻게 관리할지 결정해야 합니다.

**Options:**
A) 환경 변수 (.env 파일, VITE_API_BASE_URL)
B) 설정 파일 (config.ts)
C) 하드코딩 (개발 단계에서만)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

**Follow-up:** 개발/프로덕션 환경별 URL은?
- 개발: http://localhost:8000
- 프로덕션: https://api.example.com

[Answer]: Yes, .env.development와 .env.production 파일로 분리 

---

#### Q13: TypeScript 타입 생성 전략
Backend OpenAPI 스키마로부터 TypeScript 타입을 어떻게 생성할지 결정해야 합니다.

**Options:**
A) openapi-typescript 사용 (자동 생성)
B) 수동으로 타입 정의 (OpenAPI 스키마 참조)
C) Backend에서 타입 파일 export (공유 패키지)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

**Follow-up:** Backend OpenAPI 스키마가 아직 없는 경우?
- Mock 타입 먼저 정의 후 나중에 교체?
- Backend 개발 완료 대기?

[Answer]: Mock 타입 먼저 정의 후 나중에 교체 

---

#### Q14: API 에러 핸들링 전략
API 호출 실패 시 에러 처리 방식을 결정해야 합니다.

**Options:**
A) Toast notification (화면 상단/하단에 에러 메시지 표시)
B) Modal (전체 화면 모달로 에러 표시)
C) Inline error (해당 컴포넌트 내에 에러 표시)
D) Global error boundary (앱 전체 에러 처리)
E) Combination (여러 방식 조합)
F) Other (please describe after [Answer]: tag below)

[Answer]: E

**Follow-up:** 네트워크 에러 시 재시도 로직은?
- 자동 재시도 (예: 3회)?
- 수동 재시도 (사용자가 "다시 시도" 버튼 클릭)?
- 재시도 없음?

[Answer]: 수동 재시도 (Toast notification에 "다시 시도" 버튼 제공) 

---

#### Q15: 인증 토큰 관리
JWT 토큰을 어떻게 관리하고 API 요청에 포함할지 결정해야 합니다.

**Options:**
A) Axios interceptor (모든 요청에 자동으로 Authorization 헤더 추가)
B) Custom hook (useAuth hook에서 토큰 관리)
C) Manual (각 API 호출 시 수동으로 헤더 추가)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

**Follow-up:** 토큰 만료 시 처리는?
- 401 응답 시 자동 로그아웃 후 로그인 화면 이동?
- Refresh token 사용 (Backend 지원 필요)?
- 에러 메시지만 표시?

[Answer]: 401 응답 시 자동 로그아웃 후 로그인 화면 이동 

---

### Business Logic Questions

#### Q16: 장바구니 총액 계산 로직
장바구니 총액을 어디서 계산할지 결정해야 합니다.

**Options:**
A) Zustand store (상태 변경 시 자동 재계산)
B) Component (렌더링 시 계산)
C) Custom hook (useMemo로 메모이제이션)
D) Other (please describe after [Answer]: tag below)

[Answer]: A 

---

#### Q17: 주문 생성 전 검증
주문 생성 전 클라이언트 측 검증 규칙을 정의해야 합니다.

**Proposed Rules:**
1. 장바구니가 비어있지 않아야 함
2. 각 메뉴의 수량이 1 이상이어야 함
3. 총 금액이 0보다 커야 함

**Questions:**
- 추가로 검증해야 할 규칙이 있나요? (예: 최소 주문 금액, 최대 주문 수량)

[Answer]: No, 제안된 3가지 규칙으로 충분

- 검증 실패 시 어떻게 처리하나요?
  - A) 에러 메시지 표시 후 주문 차단
  - B) 경고 메시지 표시 후 주문 허용
  - C) 자동으로 문제 수정 (예: 수량 0인 항목 제거)

[Answer]: A 

---

#### Q18: 메뉴 이미지 로딩 전략
메뉴 이미지를 어떻게 로드하고 표시할지 결정해야 합니다.

**Options:**
A) Lazy loading (화면에 보일 때만 로드)
B) Eager loading (모든 이미지 미리 로드)
C) Progressive loading (저화질 → 고화질 순차 로드)
D) Placeholder (이미지 로드 실패 시 기본 이미지 표시)
E) Combination (여러 방식 조합)
F) Other (please describe after [Answer]: tag below)

[Answer]: E (Lazy loading + Placeholder 조합) 

---

#### Q19: 주문 상태 표시 방식
주문 상태를 어떻게 시각적으로 표시할지 결정해야 합니다.

**Order Status:**
- pending (주문 접수)
- preparing (조리 중)
- ready (준비 완료)
- served (서빙 완료)

**Options:**
A) Badge with color (색상 배지: 회색, 노란색, 초록색, 파란색)
B) Progress bar (진행 바)
C) Stepper (단계별 표시)
D) Icon + text (아이콘 + 텍스트)
E) Other (please describe after [Answer]: tag below)

[Answer]: A 

---

#### Q20: 오프라인 모드 지원
네트워크 연결이 끊어진 경우 처리 방식을 결정해야 합니다.

**Options:**
A) 오프라인 모드 지원 (Service Worker, 캐시된 데이터 사용)
B) 에러 메시지 표시 (네트워크 연결 필요 안내)
C) 재연결 시도 (자동으로 재연결 시도)
D) No special handling (일반 에러로 처리)
E) Other (please describe after [Answer]: tag below)

[Answer]: B 

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
- [x] UI component structure documented
- [x] State management design documented
- [x] User flow design documented
- [x] API integration design documented
- [x] Business logic design documented

### Post-Execution
- [ ] Artifacts validated
- [ ] User approval received
- [ ] Progress logged in audit.md
- [ ] aidlc-state.md updated

---

**Plan Status**: Awaiting User Answers

**Next Step**: User completes all [Answer]: tags, then AI proceeds to artifact generation.
