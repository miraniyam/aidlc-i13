# Code Summary - Unit 2: Customer Frontend

## Overview

Unit 2 (Customer Frontend)는 식당 테이블에 설치된 태블릿에서 고객이 메뉴를 조회하고 주문할 수 있는 React 기반 웹 애플리케이션입니다.

**Technology Stack**:
- React 18 + TypeScript
- Vite (빌드 도구)
- Zustand (클라이언트 상태 관리)
- React Query (서버 상태 관리)
- React Router (라우팅)
- Axios (HTTP 클라이언트)
- Tailwind CSS (스타일링)

---

## Project Structure

```
table-order-customer-ui/
├── public/                         # 정적 파일
│   ├── placeholder-menu.svg        # 메뉴 이미지 placeholder
│   └── logo.svg                    # 앱 로고
├── src/
│   ├── api/                        # API 클라이언트 레이어
│   │   ├── client.ts               # Axios 인스턴스 + 인터셉터
│   │   ├── authApi.ts              # 인증 API
│   │   ├── menuApi.ts              # 메뉴 API
│   │   └── orderApi.ts             # 주문 API
│   ├── components/
│   │   ├── common/                 # 공통 컴포넌트
│   │   │   ├── BottomNavigation.tsx    # 하단 네비게이션 바
│   │   │   ├── ProtectedRoute.tsx      # 인증 보호 라우트
│   │   │   ├── MenuDetailModal.tsx     # 메뉴 상세 모달
│   │   │   ├── Button.tsx              # 버튼 컴포넌트
│   │   │   ├── Card.tsx                # 카드 컴포넌트
│   │   │   ├── Badge.tsx               # 배지 컴포넌트
│   │   │   ├── Spinner.tsx             # 로딩 스피너
│   │   │   └── ErrorMessage.tsx        # 에러 메시지
│   │   └── menu/                   # 메뉴 관련 컴포넌트
│   │       ├── CategoryTabs.tsx        # 카테고리 탭
│   │       ├── MenuList.tsx            # 메뉴 리스트
│   │       └── MenuItem.tsx            # 메뉴 아이템 카드
│   ├── pages/                      # 페이지 컴포넌트
│   │   ├── LoginPage.tsx           # 로그인 페이지
│   │   ├── MenuPage.tsx            # 메뉴 조회 페이지
│   │   ├── CartPage.tsx            # 장바구니 페이지
│   │   └── OrdersPage.tsx          # 주문 내역 페이지
│   ├── stores/                     # Zustand 스토어
│   │   ├── cartStore.ts            # 장바구니 상태 관리
│   │   └── authStore.ts            # 인증 상태 관리
│   ├── hooks/                      # React Query 커스텀 훅
│   │   ├── useMenus.ts             # 메뉴 조회 훅
│   │   └── useOrders.ts            # 주문 조회/생성 훅
│   ├── types/                      # TypeScript 타입 정의
│   │   └── api.ts                  # Mock API 타입 (OpenAPI로 교체 예정)
│   ├── utils/                      # 유틸리티 함수
│   │   ├── tokenUtils.ts           # JWT 토큰 유틸
│   │   └── constants.ts            # 상수 정의
│   ├── lib/                        # 라이브러리 설정
│   │   └── queryClient.ts          # React Query 설정
│   ├── App.tsx                     # 앱 루트 컴포넌트
│   ├── main.tsx                    # 앱 진입점
│   └── index.css                   # 글로벌 스타일
├── .env.development                # 개발 환경 변수
├── .env.production                 # 프로덕션 환경 변수
├── vite.config.ts                  # Vite 설정
├── tsconfig.json                   # TypeScript 설정
├── tailwind.config.js              # Tailwind CSS 설정
├── postcss.config.js               # PostCSS 설정
├── package.json                    # 프로젝트 메타데이터
└── README.md                       # 프로젝트 문서
```

---

## Component Overview

### Pages

#### 1. LoginPage
- **경로**: `/login`
- **기능**: 테이블 ID와 비밀번호로 로그인
- **상태**: authStore (Zustand)
- **특징**: 로그인 성공 시 자동으로 메뉴 페이지로 이동

#### 2. MenuPage
- **경로**: `/menu`
- **기능**: 메뉴 카테고리별 조회 및 장바구니 추가
- **컴포넌트**:
  - CategoryTabs: 카테고리 필터링
  - MenuList: 메뉴 그리드 레이아웃
  - MenuItem: 개별 메뉴 카드
  - MenuDetailModal: 메뉴 상세 정보 및 수량 선택
- **상태**: React Query (메뉴 데이터), cartStore (장바구니)
- **특징**: 카테고리별 필터링, 메뉴 상세 모달, 장바구니 추가

#### 3. CartPage
- **경로**: `/cart`
- **기능**: 장바구니 관리 및 주문 생성
- **상태**: cartStore (Zustand)
- **특징**:
  - 수량 조절 (증가/감소)
  - 개별 메뉴 삭제
  - 장바구니 전체 비우기 (확인 다이얼로그)
  - 주문 생성 (React Query mutation)
  - 총 금액 자동 계산

#### 4. OrdersPage
- **경로**: `/orders`
- **기능**: 주문 내역 조회 및 실시간 상태 업데이트
- **상태**: React Query (30초 폴링)
- **특징**:
  - 주문 상태별 배지 (pending, preparing, ready, served)
  - 실시간 폴링으로 상태 자동 업데이트
  - 주문 번호, 시간, 금액, 메뉴 목록 표시

### Common Components

#### Navigation
- **BottomNavigation**: 하단 고정 네비게이션 바 (메뉴, 장바구니, 주문)
- **ProtectedRoute**: 인증 필요 라우트 보호 (토큰 검증)

#### UI Components
- **Button**: 다양한 variant (primary, secondary, danger, ghost)
- **Card**: 재사용 가능한 카드 컨테이너
- **Badge**: 상태 표시 배지 (success, warning, danger, info)
- **Spinner**: 로딩 인디케이터
- **ErrorMessage**: 에러 메시지 + 재시도 버튼
- **MenuDetailModal**: 메뉴 상세 정보 모달 (수량 선택, 장바구니 추가)

---

## State Management

### Zustand Stores

#### 1. cartStore
**위치**: `src/stores/cartStore.ts`

**상태**:
```typescript
{
  items: CartItem[];        // 장바구니 아이템 목록
  totalAmount: number;      // 총 금액
  totalQuantity: number;    // 총 수량
}
```

**액션**:
- `addItem(item)`: 장바구니에 메뉴 추가 (기존 메뉴는 수량 증가)
- `removeItem(menuId)`: 장바구니에서 메뉴 삭제
- `updateQuantity(menuId, quantity)`: 수량 변경
- `clearCart()`: 장바구니 비우기
- `initializeCart()`: localStorage에서 장바구니 복원

**특징**:
- localStorage 자동 동기화 (persist)
- 총 금액/수량 자동 계산 (computed)

#### 2. authStore
**위치**: `src/stores/authStore.ts`

**상태**:
```typescript
{
  token: string | null;
  tableId: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
}
```

**액션**:
- `login(token, tableId, sessionId)`: 로그인 정보 저장
- `logout()`: 로그아웃 (상태 초기화)

**특징**:
- localStorage 자동 동기화 (persist)
- 토큰 만료 검증 (tokenUtils 사용)

### React Query

#### Configuration
**위치**: `src/lib/queryClient.ts`

**설정**:
- `staleTime`: 5분 (데이터 신선도 유지)
- `cacheTime`: 10분 (캐시 보관 시간)
- `refetchOnWindowFocus`: false (포커스 시 자동 refetch 비활성화)
- `retry`: 1 (실패 시 1회 재시도)

**Query Keys 전략**:
```typescript
queryKeys = {
  menus: {
    all: ['menus'],
    byCategory: (categoryId) => ['menus', { categoryId }],
    detail: (menuId) => ['menus', menuId],
  },
  orders: {
    all: ['orders'],
    bySession: (sessionId) => ['orders', { sessionId }],
  },
}
```

#### Custom Hooks

**useMenus(categoryId?)**:
- 메뉴 목록 조회
- 카테고리별 필터링 지원

**useMenuDetail(menuId)**:
- 메뉴 상세 정보 조회
- menuId가 있을 때만 활성화 (enabled)

**useOrders(sessionId)**:
- 주문 내역 조회
- 30초 폴링 (refetchInterval)
- 실시간 상태 업데이트

**useCreateOrder()**:
- 주문 생성 mutation
- 성공 시 orders 쿼리 무효화 (invalidateQueries)
- 성공 시 장바구니 비우기

---

## API Integration

### API Client
**위치**: `src/api/client.ts`

**Axios 인스턴스**:
- Base URL: 환경 변수 (`VITE_API_BASE_URL`)
- Timeout: 10초

**Request Interceptor**:
- Authorization 헤더 자동 추가 (Bearer token)

**Response Interceptor**:
- 401 에러 시 자동 로그아웃 + 로그인 페이지 리다이렉트
- 에러 응답 표준화

### API Modules

#### authApi
- `login(tableId, password)`: 로그인

#### menuApi
- `getMenus(categoryId?)`: 메뉴 목록 조회
- `getMenuDetail(menuId)`: 메뉴 상세 조회

#### orderApi
- `getOrders(sessionId)`: 주문 내역 조회
- `createOrder(sessionId, tableId, items)`: 주문 생성

---

## Routing

**라우트 구조**:
```
/ (root)
├── /login              (public)
└── /                   (protected)
    ├── /menu           (default)
    ├── /cart
    └── /orders
```

**보호 라우트**:
- ProtectedRoute 컴포넌트로 인증 검증
- 토큰 없거나 만료 시 `/login`으로 리다이렉트

---

## Styling

### Tailwind CSS

**테마 커스터마이징**:
- Primary color: Blue (#3b82f6)
- 반응형 breakpoints: sm, md, lg, xl

**주요 스타일 패턴**:
- 카드: `bg-white rounded-lg shadow-sm`
- 버튼: `px-4 py-2 rounded-lg font-semibold`
- 입력: `border rounded-lg px-4 py-2`
- 그리드: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`

**애니메이션**:
- Spinner: `animate-spin`
- Hover: `transition-colors`, `transition-shadow`

---

## User Stories Implementation

### US-C01: 테이블 태블릿 자동 로그인
- **구현**: LoginPage, authStore, authApi
- **파일**: `LoginPage.tsx`, `authStore.ts`, `authApi.ts`

### US-C02: 메뉴 카테고리별 조회
- **구현**: MenuPage, CategoryTabs, MenuList, MenuItem
- **파일**: `MenuPage.tsx`, `CategoryTabs.tsx`, `MenuList.tsx`, `MenuItem.tsx`

### US-C03: 메뉴 상세 정보 조회
- **구현**: MenuDetailModal
- **파일**: `MenuDetailModal.tsx`

### US-C04: 장바구니에 메뉴 추가
- **구현**: MenuDetailModal, cartStore
- **파일**: `MenuDetailModal.tsx`, `cartStore.ts`

### US-C05: 장바구니에서 수량 조절
- **구현**: CartPage (수량 증가/감소 버튼)
- **파일**: `CartPage.tsx`

### US-C06: 장바구니에서 메뉴 삭제
- **구현**: CartPage (삭제 버튼)
- **파일**: `CartPage.tsx`

### US-C07: 장바구니 비우기
- **구현**: CartPage (전체 비우기 버튼 + 확인 다이얼로그)
- **파일**: `CartPage.tsx`

### US-C08: 주문 생성
- **구현**: CartPage, useOrders (createOrder mutation)
- **파일**: `CartPage.tsx`, `useOrders.ts`

### US-C09: 주문 내역 조회
- **구현**: OrdersPage, useOrders
- **파일**: `OrdersPage.tsx`, `useOrders.ts`

### US-C10: 주문 상태 실시간 업데이트
- **구현**: OrdersPage (30초 폴링)
- **파일**: `OrdersPage.tsx`, `useOrders.ts`

---

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd table-order-customer-ui
npm install
```

### Environment Variables
**`.env.development`**:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

**`.env.production`**:
```
VITE_API_BASE_URL=https://api.table-order.com
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

---

## Next Steps

### Immediate
1. **Step 28**: Placeholder 이미지 추가 ✅
2. **Step 31**: 코드 요약 문서 생성 ✅

### Backend Integration
1. Unit 1 (Backend API) 완성 대기
2. OpenAPI 스펙 생성
3. Mock 타입을 OpenAPI 생성 타입으로 교체
4. API 엔드포인트 연결 테스트

### Testing
1. Unit tests (Vitest + React Testing Library)
2. Integration tests
3. E2E tests (Playwright)

### Enhancements
1. 오프라인 지원 (Service Worker)
2. 이미지 최적화 (lazy loading)
3. 접근성 개선 (ARIA labels)
4. 다국어 지원 (i18n)
5. 성능 최적화 (code splitting)

---

## Code Generation Status

✅ **완료**: Steps 1-27, 29-31 (30개 / 31개)
⏳ **남은 작업**: Step 28 (Placeholder 이미지) - 완료됨

**모든 User Stories 구현 완료** (US-C01 ~ US-C10)

---

**문서 생성일**: 2026-02-09
**작성자**: AI Agent (AIDLC Workflow)
