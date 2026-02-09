# Tech Stack Decisions - Unit 2: Customer Frontend

## Overview

Unit 2 (Customer Frontend)의 기술 스택 선택 및 근거를 문서화합니다.

---

## 1. Core Framework

### React 18

**Decision**: React 18 사용

**Rationale**:
- **Component-based**: 재사용 가능한 컴포넌트 구조
- **Virtual DOM**: 효율적인 렌더링 성능
- **Large Ecosystem**: 풍부한 라이브러리 및 커뮤니티
- **TypeScript Support**: 타입 안정성
- **Concurrent Features**: Suspense, Transitions (향후 활용 가능)

**Alternatives Considered**:
- Vue.js: 학습 곡선이 낮지만 생태계가 React보다 작음
- Svelte: 빠르지만 생태계가 작고 팀 경험 부족
- Angular: 너무 무겁고 복잡함

---

## 2. Language

### TypeScript

**Decision**: TypeScript 사용

**Rationale**:
- **Type Safety**: 컴파일 타임 에러 감지
- **Better IDE Support**: 자동완성, 리팩토링
- **Code Documentation**: 타입이 문서 역할
- **Maintainability**: 대규모 코드베이스 관리 용이

**Configuration**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 3. Build Tool

### Vite

**Decision**: Vite 사용

**Rationale**:
- **Fast Dev Server**: ESBuild 기반, 즉시 시작
- **Fast HMR**: Hot Module Replacement가 매우 빠름
- **Optimized Build**: Rollup 기반, 최적화된 프로덕션 빌드
- **Modern**: ES modules 기반, 최신 브라우저 타겟
- **Simple Configuration**: 설정이 간단함

**Alternatives Considered**:
- Webpack: 설정이 복잡하고 느림
- Create React App: 더 이상 권장되지 않음
- Parcel: Vite보다 느림

**Configuration**:
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
});
```

---

## 4. Styling

### Tailwind CSS

**Decision**: Tailwind CSS 사용

**Rationale**:
- **Utility-First**: 빠른 개발 속도
- **Small Bundle**: 사용하지 않는 클래스 자동 제거 (PurgeCSS)
- **Responsive**: 반응형 디자인 쉬움
- **Customizable**: 테마 커스터마이징 용이
- **No CSS Conflicts**: 클래스 이름 충돌 없음

**Alternatives Considered**:
- Material-UI: 무겁고 커스터마이징 어려움
- Ant Design: 디자인이 고정적임
- Custom CSS: 유지보수 어려움

**Configuration**:
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
      },
    },
  },
  plugins: [],
};
```

---

## 5. State Management

### 5.1 Client State: Zustand

**Decision**: Zustand 사용

**Rationale**:
- **Lightweight**: 1KB (gzipped)
- **Simple API**: 학습 곡선 낮음
- **No Boilerplate**: Redux보다 간단
- **TypeScript Support**: 타입 안정성
- **Middleware Support**: persist, devtools

**Alternatives Considered**:
- Redux Toolkit: 너무 무겁고 복잡함 (간단한 장바구니에는 과함)
- Jotai: 아직 생태계가 작음
- Context API: 성능 이슈 (리렌더링)

**Use Cases**:
- Cart state (장바구니)
- Auth state (인증)

---

### 5.2 Server State: React Query (TanStack Query)

**Decision**: React Query 사용

**Rationale**:
- **Caching**: 자동 캐싱 및 무효화
- **Polling**: 실시간 업데이트 (주문 상태)
- **Optimistic Updates**: 낙관적 업데이트
- **Error Handling**: 에러 처리 간편
- **DevTools**: 디버깅 도구 제공

**Alternatives Considered**:
- SWR: React Query보다 기능이 적음
- RTK Query: Redux Toolkit에 종속적
- Axios only: 캐싱 및 폴링 직접 구현 필요

**Configuration**:
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## 6. Routing

### React Router v6

**Decision**: React Router v6 사용

**Rationale**:
- **Standard**: React 라우팅의 사실상 표준
- **Declarative**: 선언적 라우팅
- **Nested Routes**: 중첩 라우트 지원
- **Protected Routes**: 인증 라우트 쉬움
- **TypeScript Support**: 타입 안정성

**Alternatives Considered**:
- TanStack Router: 아직 안정화되지 않음
- Wouter: 기능이 제한적

**Usage**:
```typescript
<Routes>
  <Route path="/" element={<Navigate to="/menu" replace />} />
  <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/menu" element={<MenuPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/orders" element={<OrdersPage />} />
  </Route>
</Routes>
```

---

## 7. HTTP Client

### Axios

**Decision**: Axios 사용

**Rationale**:
- **Interceptors**: Request/Response 인터셉터
- **Automatic JSON**: 자동 JSON 변환
- **Error Handling**: 에러 처리 간편
- **TypeScript Support**: 타입 안정성
- **Wide Adoption**: 널리 사용됨

**Alternatives Considered**:
- Fetch API: 인터셉터 없음, 에러 처리 불편
- ky: 작지만 Axios보다 기능 적음

**Configuration**:
```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 8. Package Manager

### npm

**Decision**: npm 사용

**Rationale**:
- **Default**: Node.js 기본 패키지 매니저
- **Stable**: 안정적이고 널리 사용됨
- **Workspaces**: Monorepo 지원 (향후 필요 시)
- **No Extra Installation**: 별도 설치 불필요

**Alternatives Considered**:
- yarn: npm과 큰 차이 없음
- pnpm: 디스크 공간 절약하지만 호환성 이슈 가능
- bun: 아직 안정화되지 않음

---

## 9. Code Quality Tools

### 9.1 ESLint

**Decision**: ESLint (recommended 규칙)

**Configuration**:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off"
  }
}
```

---

### 9.2 Prettier

**Decision**: Prettier 사용

**Configuration**:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## 10. Testing

### Vitest

**Decision**: Vitest 사용

**Rationale**:
- **Fast**: Vite 기반, 매우 빠름
- **Jest Compatible**: Jest API 호환
- **TypeScript Support**: 타입 안정성
- **ESM Support**: ES modules 지원

**Alternatives Considered**:
- Jest: 느리고 설정 복잡
- Mocha: 기능이 제한적

**Configuration**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

---

## 11. Type Generation

### openapi-typescript

**Decision**: openapi-typescript 사용 (향후)

**Rationale**:
- **Automatic**: OpenAPI 스키마에서 자동 생성
- **Type Safety**: 타입 안정성 보장
- **Sync**: Backend와 타입 동기화

**Current State**: Mock 타입 사용 (Backend OpenAPI 스키마 대기 중)

**Future Usage**:
```bash
npx openapi-typescript ../table-order-backend/openapi.json -o src/types/api.ts
```

---

## 12. Environment Management

### Vite Environment Variables

**Decision**: Vite의 환경 변수 사용

**Files**:
- `.env.development`: 개발 환경
- `.env.production`: 프로덕션 환경

**Usage**:
```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

**Rationale**: Vite 기본 기능, 별도 라이브러리 불필요

---

## 13. Summary

### Core Stack
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS

### State Management
- **Client State**: Zustand
- **Server State**: React Query

### Routing & HTTP
- **Routing**: React Router v6
- **HTTP Client**: Axios

### Development Tools
- **Package Manager**: npm
- **Linter**: ESLint
- **Formatter**: Prettier
- **Testing**: Vitest

### Type Generation
- **Current**: Mock types
- **Future**: openapi-typescript

---

## Decision Matrix

| Category | Choice | Alternatives | Reason |
|----------|--------|--------------|--------|
| Framework | React 18 | Vue, Svelte | Ecosystem, Team experience |
| Language | TypeScript | JavaScript | Type safety |
| Build Tool | Vite | Webpack, CRA | Speed, Modern |
| Styling | Tailwind CSS | MUI, Ant Design | Utility-first, Small bundle |
| Client State | Zustand | Redux, Jotai | Lightweight, Simple |
| Server State | React Query | SWR, RTK Query | Caching, Polling |
| Routing | React Router | TanStack Router | Standard, Stable |
| HTTP Client | Axios | Fetch, ky | Interceptors, Error handling |
| Package Manager | npm | yarn, pnpm | Default, Stable |
| Linter | ESLint | None | Code quality |
| Formatter | Prettier | None | Consistency |
| Testing | Vitest | Jest, Mocha | Fast, Vite-based |

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-09  
**Status**: Draft
