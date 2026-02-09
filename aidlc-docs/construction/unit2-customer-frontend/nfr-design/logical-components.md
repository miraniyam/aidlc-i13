# Logical Components - Unit 2: Customer Frontend

## Overview

Unit 2 (Customer Frontend)의 논리적 컴포넌트 구조를 정의합니다. 이 문서는 애플리케이션을 구성하는 주요 논리적 계층과 각 계층의 책임, 의존성 관계를 설명합니다.

---

## Logical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  (Pages, Components, UI Logic)                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    State Management Layer                    │
│  (Zustand Stores, React Query)                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Client Layer                        │
│  (Axios Client, API Modules)                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│  (REST API Endpoints)                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Presentation Layer

### Purpose
사용자 인터페이스 렌더링 및 사용자 상호작용 처리

### Components

#### 1.1 Pages
**Responsibility**: 페이지 레벨 컴포넌트, 라우팅 엔드포인트

**Components**:
- `LoginPage`: 로그인 폼 및 인증 처리
- `MenuPage`: 메뉴 목록 표시 및 카테고리 필터링
- `CartPage`: 장바구니 관리 및 주문 생성
- `OrdersPage`: 주문 내역 조회 및 상태 확인

**Dependencies**:
- State Management Layer (Zustand stores, React Query hooks)
- Common Components

---

#### 1.2 Common Components
**Responsibility**: 재사용 가능한 UI 컴포넌트

**Components**:
- `BottomNavigation`: 하단 네비게이션 바
- `MenuDetailModal`: 메뉴 상세 모달
- `ProtectedRoute`: 인증 보호 라우트 HOC
- `Button`: 공통 버튼 컴포넌트
- `Card`: 공통 카드 컴포넌트
- `Badge`: 배지 컴포넌트 (주문 상태, 장바구니 개수)
- `Spinner`: 로딩 스피너
- `ErrorMessage`: 에러 메시지 표시

**Dependencies**:
- State Management Layer (선택적)
- Utility Functions

---

#### 1.3 Feature Components
**Responsibility**: 특정 기능에 특화된 컴포넌트

**Menu Feature**:
- `CategoryTabs`: 카테고리 탭
- `MenuList`: 메뉴 그리드 컨테이너
- `MenuItem`: 개별 메뉴 카드

**Cart Feature**:
- `CartList`: 장바구니 항목 컨테이너
- `CartItem`: 개별 장바구니 항목
- `CartSummary`: 총액 요약
- `CartActions`: 장바구니 액션 버튼

**Order Feature**:
- `OrderList`: 주문 목록 컨테이너
- `OrderCard`: 개별 주문 카드
- `OrderStatusBadge`: 주문 상태 배지

**Dependencies**:
- State Management Layer
- Common Components

---

## Layer 2: State Management Layer

### Purpose
애플리케이션 상태 관리 및 데이터 동기화

### Components

#### 2.1 Client State (Zustand)
**Responsibility**: 클라이언트 측 상태 관리 (장바구니, 인증)

**Stores**:

**`cartStore`**:
- **State**: `items`, `totalAmount`, `totalQuantity`
- **Actions**: `addItem`, `removeItem`, `updateQuantity`, `clearCart`
- **Persistence**: localStorage (Zustand persist middleware)
- **Dependencies**: None

**`authStore`**:
- **State**: `token`, `tableId`, `isAuthenticated`
- **Actions**: `login`, `logout`, `checkAuth`
- **Persistence**: localStorage (manual)
- **Dependencies**: API Client Layer (authApi)

---

#### 2.2 Server State (React Query)
**Responsibility**: 서버 데이터 캐싱 및 동기화

**Query Hooks**:

**`useMenus`**:
- **Query Key**: `['menus', categoryId]`
- **Fetcher**: `menuApi.getMenus(categoryId)`
- **Caching**: 5min staleTime, 10min cacheTime
- **Dependencies**: API Client Layer (menuApi)

**`useOrders`**:
- **Query Key**: `['orders', sessionId]`
- **Fetcher**: `orderApi.getOrders(sessionId)`
- **Caching**: 5min staleTime, 10min cacheTime
- **Polling**: 30초 간격 (OrdersPage에서만)
- **Dependencies**: API Client Layer (orderApi)

**Mutation Hooks**:

**`useCreateOrder`**:
- **Mutation Fn**: `orderApi.createOrder(data)`
- **Invalidation**: `['orders', sessionId]` query
- **Dependencies**: API Client Layer (orderApi)

---

#### 2.3 Query Client Configuration
**Responsibility**: React Query 전역 설정

**Configuration**:
```typescript
{
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
}
```

**Query Keys**:
```typescript
{
  menus: {
    all: ['menus'],
    byCategory: (categoryId) => ['menus', 'category', categoryId],
  },
  orders: {
    all: ['orders'],
    bySession: (sessionId) => ['orders', 'session', sessionId],
  },
}
```

---

## Layer 3: API Client Layer

### Purpose
Backend API와의 통신 추상화

### Components

#### 3.1 HTTP Client
**Responsibility**: HTTP 요청 설정 및 인터셉터

**`apiClient` (Axios instance)**:
- **Base URL**: `import.meta.env.VITE_API_BASE_URL`
- **Timeout**: 10초
- **Request Interceptor**: JWT 토큰 자동 추가
- **Response Interceptor**: 에러 처리 및 자동 로그아웃 (401)

**Dependencies**: None

---

#### 3.2 API Modules
**Responsibility**: API 엔드포인트별 요청 함수

**`authApi`**:
- **`login(tableId, password)`**: POST `/api/customer/auth/login`
- **Returns**: `{ token, tableId }`
- **Dependencies**: apiClient

**`menuApi`**:
- **`getMenus(categoryId?)`**: GET `/api/customer/menus`
- **Returns**: `Menu[]`
- **Dependencies**: apiClient

**`orderApi`**:
- **`getOrders(sessionId)`**: GET `/api/customer/orders`
- **`createOrder(data)`**: POST `/api/customer/orders`
- **Returns**: `Order` | `Order[]`
- **Dependencies**: apiClient

---

## Layer 4: Utility Layer

### Purpose
공통 유틸리티 함수 및 헬퍼

### Components

#### 4.1 Token Utilities
**Responsibility**: JWT 토큰 검증 및 관리

**`tokenUtils`**:
- **`isTokenExpired(token)`**: 토큰 만료 여부 확인
- **`getTokenExpiryTime(token)`**: 토큰 만료 시간 반환
- **Dependencies**: jwt-decode

---

#### 4.2 Constants
**Responsibility**: 애플리케이션 상수 정의

**`constants`**:
- **`API_BASE_URL`**: API 기본 URL
- **`TOKEN_KEY`**: localStorage 토큰 키
- **`TABLE_ID_KEY`**: localStorage 테이블 ID 키
- **`POLLING_INTERVAL`**: 폴링 간격 (30초)
- **`CACHE_TIME`**: 캐시 시간 (5분)

---

#### 4.3 Validators
**Responsibility**: 입력 검증 로직

**`validators`**:
- **`validateTableId(tableId)`**: 테이블 ID 형식 검증
- **`validatePassword(password)`**: 비밀번호 형식 검증
- **`validateQuantity(quantity)`**: 수량 검증 (1-99)

---

## Component Dependencies

### Dependency Graph

```
Pages
  ├─> State Management (Zustand, React Query)
  │     ├─> API Client Layer
  │     │     └─> Backend API
  │     └─> Utility Layer
  └─> Common Components
        └─> Utility Layer

Feature Components
  ├─> State Management
  └─> Common Components
```

### Dependency Rules

1. **Unidirectional Flow**: 상위 레이어는 하위 레이어에만 의존
2. **No Circular Dependencies**: 순환 의존성 금지
3. **Loose Coupling**: 인터페이스를 통한 느슨한 결합
4. **Single Responsibility**: 각 컴포넌트는 단일 책임만 가짐

---

## Data Flow

### Read Flow (Query)

```
User Action (Page)
  ↓
React Query Hook (useMenus)
  ↓
API Module (menuApi.getMenus)
  ↓
HTTP Client (apiClient)
  ↓
Backend API
  ↓
Response
  ↓
React Query Cache
  ↓
Component Re-render
```

### Write Flow (Mutation)

```
User Action (Page)
  ↓
React Query Mutation (useCreateOrder)
  ↓
API Module (orderApi.createOrder)
  ↓
HTTP Client (apiClient)
  ↓
Backend API
  ↓
Response
  ↓
Query Invalidation (refetch orders)
  ↓
Component Re-render
```

### Client State Flow (Cart)

```
User Action (Add to Cart)
  ↓
Zustand Action (cartStore.addItem)
  ↓
State Update
  ↓
localStorage Sync (persist middleware)
  ↓
Component Re-render
```

---

## Error Handling Flow

### API Error Flow

```
API Error
  ↓
Axios Response Interceptor
  ├─> 401: Auto logout + Redirect to /login
  ├─> 403: Toast error message
  ├─> 404: Toast error message
  ├─> 500: Toast error message
  └─> Network Error: Toast error message
  ↓
React Query Error State
  ↓
Component Error UI (ErrorMessage)
  ↓
User Retry Action
```

### Client Error Flow

```
Client Error (e.g., validation)
  ↓
Component Error State
  ↓
Error UI (inline message)
  ↓
User Correction
```

---

## Security Boundaries

### Authentication Boundary

```
Public Routes
  └─> LoginPage

Protected Routes (ProtectedRoute HOC)
  ├─> MenuPage
  ├─> CartPage
  └─> OrdersPage
```

**Protection Mechanism**:
1. Check token existence in localStorage
2. Validate token expiry (client-side)
3. Redirect to /login if invalid
4. Auto logout on 401 response (server-side validation)

---

## Performance Optimization Points

### 1. Code Splitting
- **Route-based splitting**: Lazy load pages
- **Component**: `React.lazy()` + `Suspense`

### 2. Caching
- **React Query**: 5min staleTime, 10min cacheTime
- **Zustand**: localStorage persistence
- **Static Assets**: Long-term caching (1년)

### 3. Image Optimization
- **Lazy Loading**: `loading="lazy"` attribute
- **Placeholder**: Show placeholder on error
- **Format**: WebP recommended

### 4. Bundle Optimization
- **Tree Shaking**: Remove unused code
- **Minification**: Terser
- **Compression**: gzip/brotli

---

## Scalability Considerations

### Current Scale
- **Users**: 1명/태블릿
- **Tablets**: 1-10대
- **Menu Items**: 1-50개

### Scalability Strategies
- **Client-side caching**: Reduce server load
- **Polling optimization**: 30초 간격 (필요 시 조정 가능)
- **Lazy loading**: 초기 로딩 시간 단축

### Future Enhancements
- **WebSocket**: Real-time updates (폴링 대체)
- **Service Worker**: Offline support
- **IndexedDB**: 대용량 데이터 캐싱

---

## Testing Strategy

### Unit Tests
- **Zustand Stores**: Cart logic (add, remove, update, clear)
- **Utility Functions**: tokenUtils, validators
- **API Modules**: Mock API responses

### Integration Tests
- **API Client**: Interceptor behavior
- **React Query**: Cache invalidation

### E2E Tests (Future)
- **User Flows**: Login → Menu → Cart → Order
- **Tools**: Playwright, Cypress

---

## Summary

### Logical Layers
1. **Presentation Layer**: Pages, Components, UI Logic
2. **State Management Layer**: Zustand (client state), React Query (server state)
3. **API Client Layer**: Axios client, API modules
4. **Utility Layer**: Token utils, validators, constants

### Key Design Decisions
- **Zustand for client state**: Simple, lightweight, persistent
- **React Query for server state**: Caching, polling, mutations
- **Axios for HTTP**: Interceptors, timeout, error handling
- **Unidirectional data flow**: Top-down dependencies
- **Loose coupling**: Interface-based communication

### Component Count
- **Pages**: 4
- **Common Components**: 8
- **Feature Components**: 10+
- **Stores**: 2 (cart, auth)
- **API Modules**: 3 (auth, menu, order)
- **Utility Modules**: 3 (token, constants, validators)

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-09  
**Status**: Draft
