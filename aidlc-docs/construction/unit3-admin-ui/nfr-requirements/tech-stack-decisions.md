# Tech Stack Decisions - Unit 3 (Admin Frontend)

## Overview

Admin Frontend의 기술 스택 선택과 그 근거를 문서화합니다. 각 기술 선택은 프로젝트 요구사항, NFR, 팀 역량을 고려하여 결정되었습니다.

---

## Core Stack

### Language & Framework

**TypeScript + React 18+**

**Rationale**:
- 요구사항 명시: "React"
- TypeScript: 타입 안정성, IDE 지원, 유지보수성
- React 18: Concurrent features, Automatic batching

**Alternatives Considered**:
- Vue.js: 학습 곡선 낮지만 생태계 작음
- Angular: 무겁고 복잡함
- Svelte: 생태계 부족

**Decision**: React 18 + TypeScript ✅

---

### Build Tool

**Vite**

**Rationale**:
- 빠른 개발 서버 (HMR)
- 빠른 빌드 속도
- ES modules 기반
- React 공식 권장

**Alternatives Considered**:
- Create React App: 느리고 설정 복잡
- Webpack: 설정 복잡, 느림
- Parcel: 기능 부족

**Decision**: Vite ✅

---

## UI & Styling

### UI Component Library

**Ant Design**

**Rationale**:
- 관리자 UI에 최적화 (Table, Form, Modal 풍부)
- 중국 알리바바 제작, 엔터프라이즈급
- TypeScript 지원 우수
- 디자인 시스템 완성도 높음
- 문서화 우수

**Pros**:
- 풍부한 컴포넌트 (100+)
- 관리자 대시보드에 필요한 모든 컴포넌트 제공
- 일관된 디자인
- 커스터마이징 가능 (테마)

**Cons**:
- 번들 크기 큼 (Tree shaking으로 완화)
- 중국 기업 제작 (일부 우려)

**Alternatives Considered**:
- Material-UI (MUI): 무겁고 Google 스타일
- Tailwind CSS + Headless UI: 컴포넌트 직접 구현 필요
- Chakra UI: 컴포넌트 부족

**Decision**: Ant Design ✅

**Bundle Size Impact**: ~200KB (gzipped, tree-shaken)

---

### Styling Approach

**Ant Design + CSS-in-JS (Emotion)**

**Rationale**:
- Ant Design 기본 스타일 사용
- 커스텀 스타일: Emotion (Ant Design 내장)
- 컴포넌트 레벨 스타일링

**No Additional CSS Framework**:
- Tailwind CSS 불필요 (Ant Design 충분)

---

## State Management

### Server State

**React Query (TanStack Query)**

**Rationale**:
- 서버 상태 관리 최적화
- 캐싱, 자동 refetch, 낙관적 업데이트
- SSE와 함께 사용 가능
- TypeScript 지원 우수

**Configuration**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3
    }
  }
});
```

**Decision**: React Query ✅

---

### Client State

**React useState + useContext**

**Rationale**:
- 로컬 상태는 단순 (모달, 폼 입력)
- useState로 충분
- 글로벌 상태 최소화

**No Additional Library**:
- Zustand 불필요
- Redux Toolkit 불필요
- 복잡한 상태 관리 없음

**Decision**: useState + useContext ✅

---

## Form Management

### Form Library

**React Hook Form**

**Rationale**:
- 가볍고 성능 좋음 (uncontrolled components)
- TypeScript 지원 우수
- Validation 간편 (Yup, Zod 통합)
- Ant Design과 통합 가능

**Pros**:
- 최소 리렌더링
- 번들 크기 작음 (~9KB)
- 현대적 React 패턴 (Hooks)
- 학습 곡선 낮음

**Cons**:
- Ant Design Form과 통합 시 추가 작업 필요

**Alternatives Considered**:
- Formik: 무겁고 레거시화
- Ant Design Form: 기능 부족
- useState: 복잡한 폼에서 비효율적

**Decision**: React Hook Form ✅

**Integration with Ant Design**:
```typescript
import { Controller } from 'react-hook-form';
import { Input } from 'antd';

<Controller
  name="menu_name"
  control={control}
  render={({ field }) => <Input {...field} />}
/>
```

---

### Form Validation

**Yup**

**Rationale**:
- React Hook Form과 통합 우수
- 스키마 기반 검증
- TypeScript 지원

**Alternatives Considered**:
- Zod: 더 현대적이지만 생태계 작음
- Joi: 서버용, 클라이언트에 무거움

**Decision**: Yup ✅

---

## HTTP Client

### API Client

**Axios**

**Rationale**:
- 인터셉터 지원 (JWT 토큰 자동 추가)
- 요청/응답 변환
- 에러 처리 간편
- TypeScript 지원

**Configuration**:
```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Alternatives Considered**:
- Fetch API: 인터셉터 없음, 에러 처리 복잡
- ky: 가볍지만 기능 부족

**Decision**: Axios ✅

---

## Real-time Communication

### SSE Client

**EventSource (Native API)**

**Rationale**:
- 브라우저 기본 API
- 추가 라이브러리 불필요
- SSE 표준 지원

**Custom Hook**:
```typescript
const useSSE = (url: string) => {
  const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected');
  
  useEffect(() => {
    const eventSource = new EventSource(url);
    
    eventSource.onopen = () => setStatus('connected');
    eventSource.onerror = () => {
      setStatus('disconnected');
      // Auto-reconnect logic
    };
    
    return () => eventSource.close();
  }, [url]);
  
  return { status };
};
```

**Decision**: EventSource (Native) ✅

---

## Date & Time

### Date/Time Library

**Day.js**

**Rationale**:
- 가벼움 (~2KB)
- Moment.js API 호환
- 플러그인 시스템
- TypeScript 지원

**Use Cases**:
- 과거 주문 내역 날짜 필터
- 주문 시간 포맷팅
- 날짜 계산 (7일 전, 30일 전)

**Alternatives Considered**:
- date-fns: 트리 쉐이킹 좋지만 API 복잡
- Luxon: 타임존 처리 강력하지만 무거움
- Native Date: 기능 부족, API 불편

**Decision**: Day.js ✅

**Plugins**:
- relativeTime: "3시간 전"
- customParseFormat: 커스텀 포맷 파싱

---

## Routing

### Router Library

**React Router v6**

**Rationale**:
- React 표준 라우터
- TypeScript 지원
- Nested routes
- Protected routes 구현 간편

**Routes Structure**:
```typescript
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/" element={<ProtectedRoute />}>
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="menu" element={<MenuPage />} />
    <Route path="menu/categories" element={<CategoryPage />} />
  </Route>
</Routes>
```

**Decision**: React Router v6 ✅

---

## Security & Utilities

### Input Sanitization

**DOMPurify**

**Rationale**:
- XSS 공격 방지
- HTML/텍스트 sanitization
- 가벼움 (~20KB)
- 브라우저 환경 최적화

**Use Cases**:
- 메뉴 설명 입력 sanitization
- 카테고리명 sanitization
- User-generated content 처리

**Decision**: DOMPurify ✅

**Usage**:
```typescript
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};
```

---

## Testing

### Testing Strategy

**Unit + Integration (Standard)**

**Testing Libraries**:
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking

**Rationale**:
- MVP 단계에서 E2E는 과도
- Unit + Integration으로 충분한 커버리지
- 빠른 테스트 실행
- 개발 속도 확보

**Test Coverage Target**: 70%

**No E2E Testing** (MVP):
- Playwright, Cypress 미사용
- Post-MVP에서 고려

**Decision**: Jest + React Testing Library + MSW ✅

---

### Test Structure

```
tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── integration/
    ├── dashboard.test.tsx
    ├── menu-management.test.tsx
    └── order-management.test.tsx
```

---

## Development Tools

### Linting & Formatting

**ESLint + Prettier**

**ESLint Config**:
- eslint-config-react-app
- @typescript-eslint/eslint-plugin

**Prettier Config**:
- Semi: true
- Single quote: true
- Tab width: 2

**Decision**: ESLint + Prettier ✅

---

### Git Hooks

**Husky + lint-staged**

**Pre-commit**:
- ESLint check
- Prettier format
- TypeScript check

**Decision**: Husky + lint-staged ✅

---

## Deployment

### Hosting Options

**Option A: AWS S3 + CloudFront**
- Static file hosting
- CDN distribution
- HTTPS 자동

**Option B: Nginx (EC2)**
- Backend와 동일 서버
- Reverse proxy
- 간단한 배포

**Decision**: Backend 팀과 협의 필요

---

### CI/CD

**GitHub Actions** (권장)

**Pipeline**:
1. Lint & Type check
2. Unit tests
3. Build
4. Deploy to S3 or EC2

---

## Summary

### Core Stack
- **Language**: TypeScript
- **Framework**: React 18
- **Build Tool**: Vite

### UI & Styling
- **Component Library**: Ant Design
- **Styling**: Emotion (Ant Design 내장)

### State Management
- **Server State**: React Query
- **Client State**: useState + useContext

### Form & Validation
- **Form Library**: React Hook Form
- **Validation**: Yup

### HTTP & Real-time
- **HTTP Client**: Axios
- **SSE**: EventSource (Native)

### Utilities
- **Date/Time**: Day.js
- **Router**: React Router v6

### Testing
- **Test Runner**: Jest
- **Component Testing**: React Testing Library
- **API Mocking**: MSW

### Development Tools
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged

---

## Bundle Size Estimate

**Production Build** (gzipped):
- React + React DOM: ~45KB
- Ant Design: ~200KB (tree-shaken)
- React Query: ~12KB
- React Hook Form: ~9KB
- Axios: ~13KB
- Day.js: ~2KB
- React Router: ~10KB
- DOMPurify: ~20KB
- Application Code: ~150KB

**Total**: ~461KB (gzipped)

**Target**: < 500KB ✅

---

## Technology Maturity

All selected technologies are:
- ✅ Production-ready
- ✅ Actively maintained
- ✅ Large community
- ✅ TypeScript support
- ✅ Well-documented

---

## Backend Coordination Required

**Unit 1 (Backend) 미완료 상태이므로 다음 사항은 Backend 팀과 협의 필요**:

### 1. Content Security Policy (CSP)
**Status**: Backend 설정 필요  
**Priority**: Medium  
**Recommendation**: `script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;`  
**Note**: Backend 응답 헤더에 CSP 설정

### 2. CSRF Token
**Status**: Backend 구현 필요  
**Priority**: High  
**Requirement**: Backend에서 CSRF 토큰 생성 및 검증  
**Frontend**: Authorization 헤더로 JWT 전송 (CSRF 토큰 대체 가능)

### 3. SameSite Cookie
**Status**: Backend 설정 필요  
**Priority**: Medium  
**Requirement**: Cookie SameSite=Strict 또는 Lax  
**Note**: JWT 사용 시 Cookie 불필요할 수 있음

### 4. SSE Scaling Strategy
**Status**: Backend 결정 대기  
**Priority**: Low (10명 수준)  
**Options**: Direct 연결 또는 Redis Pub/Sub  
**Frontend**: Backend 결정에 따라 EventSource 사용

### 5. Rate Limiting (Backend)
**Status**: Backend 구현 권장  
**Priority**: Medium  
**Requirement**: API 레벨 Rate Limiting (IP 기반)  
**Frontend**: 클라이언트 측 Rate Limiting 추가 구현

### 6. CORS Configuration
**Status**: Backend 설정 필요  
**Priority**: High  
**Requirement**: 
- Development: `Access-Control-Allow-Origin: http://localhost:5173`
- Production: `Access-Control-Allow-Origin: https://admin.example.com`

---

**All tech stack decisions are finalized and ready for implementation.**

**Note**: Backend 협의 사항은 Unit 1 (Backend) 설계 시 반영 필요
