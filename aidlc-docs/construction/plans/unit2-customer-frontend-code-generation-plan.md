# Code Generation Plan - Unit 2: Customer Frontend

## Unit Context

### Unit Name
**Unit 2: Customer Frontend** (table-order-customer-ui)

### Repository Location
**Workspace Root**: `table-order-customer-ui/` (separate repository in multi-repo strategy)

### Assigned Stories
10개 User Stories (고객 Journey):
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
- Zustand (클라이언트 상태)
- React Query (서버 상태)
- React Router (라우팅)
- Axios (HTTP 클라이언트)
- Tailwind CSS (스타일링)
- Vite (빌드 도구)

### Dependencies
- **Upstream**: Unit 1 (Backend API) - Mock 타입 사용, 나중에 OpenAPI로 교체
- **Downstream**: None

---

## Code Generation Steps

### Phase 1: Project Structure Setup

- [x] **Step 1**: Create Vite + React + TypeScript project structure
  - Initialize Vite project
  - Configure TypeScript
  - Setup directory structure
  - **Stories**: Foundation for all stories

- [x] **Step 2**: Install dependencies
  - React Router, Zustand, React Query, Axios
  - Tailwind CSS
  - Development dependencies
  - **Stories**: Foundation for all stories

- [x] **Step 3**: Configure build tools
  - vite.config.ts
  - tsconfig.json
  - tailwind.config.js
  - postcss.config.js
  - **Stories**: Foundation for all stories

- [x] **Step 4**: Setup environment configuration
  - .env.development
  - .env.production
  - Environment type definitions
  - **Stories**: Foundation for all stories

---

### Phase 2: Type Definitions (Mock)

- [x] **Step 5**: Create Mock API types
  - Menu, Order, OrderItem types
  - Request/Response types
  - Auth types
  - **Stories**: US-C02, US-C03, US-C08, US-C09, US-C10
  - **Note**: Will be replaced with OpenAPI-generated types later

---

### Phase 3: API Client Layer

- [x] **Step 6**: Create Axios client with interceptors
  - Base configuration
  - Request interceptor (auth token)
  - Response interceptor (error handling)
  - **Stories**: All stories (API foundation)

- [x] **Step 7**: Create Auth API module
  - login()
  - **Stories**: US-C01

- [x] **Step 8**: Create Menu API module
  - getMenus()
  - getMenuDetail()
  - **Stories**: US-C02, US-C03

- [x] **Step 9**: Create Order API module
  - getOrders()
  - createOrder()
  - **Stories**: US-C08, US-C09, US-C10

---

### Phase 4: State Management

- [x] **Step 10**: Create Cart Store (Zustand)
  - State structure
  - Actions (add, remove, update, clear)
  - Total calculation logic
  - localStorage persistence
  - **Stories**: US-C04, US-C05, US-C06, US-C07

- [x] **Step 11**: Create Auth Store (Zustand)
  - State structure
  - Actions (login, logout)
  - localStorage persistence
  - **Stories**: US-C01

- [x] **Step 12**: Create React Query configuration
  - QueryClient setup
  - Query keys strategy
  - **Stories**: US-C02, US-C03, US-C08, US-C09, US-C10

- [x] **Step 13**: Create React Query hooks
  - useMenus()
  - useMenuDetail()
  - useOrders() with polling
  - useCreateOrder()
  - **Stories**: US-C02, US-C03, US-C08, US-C09, US-C10

---

### Phase 5: Utility Functions

- [x] **Step 14**: Create utility functions
  - isTokenExpired()
  - Storage keys constants
  - **Stories**: US-C01

---

### Phase 6: Common Components

- [x] **Step 15**: Create BottomNavigation component
  - Navigation items
  - Cart badge
  - Active state highlighting
  - **Stories**: All stories (navigation)

- [x] **Step 16**: Create ProtectedRoute component
  - Token validation
  - Redirect logic
  - **Stories**: US-C01

- [x] **Step 17**: Create MenuDetailModal component
  - Menu display
  - Add to cart action
  - **Stories**: US-C03, US-C04

- [x] **Step 18**: Create common UI components
  - Button, Card, Badge, Spinner, ErrorMessage
  - **Stories**: All stories (UI foundation)

---

### Phase 7: Page Components

- [x] **Step 19**: Create LoginPage
  - LoginForm component
  - Login logic
  - Auto-redirect
  - **Stories**: US-C01

- [x] **Step 20**: Create MenuPage
  - CategoryTabs component
  - MenuList component
  - MenuItem component
  - Menu detail modal integration
  - **Stories**: US-C02, US-C03, US-C04

- [x] **Step 21**: Create CartPage
  - CartList component
  - CartItem component
  - CartSummary component
  - CartActions component
  - Quantity adjustment
  - Clear cart confirmation
  - Order creation
  - **Stories**: US-C04, US-C05, US-C06, US-C07, US-C08

- [x] **Step 22**: Create OrdersPage
  - OrderList component
  - OrderCard component
  - OrderStatusBadge component
  - Polling integration
  - **Stories**: US-C09, US-C10

---

### Phase 8: Routing & App Setup

- [x] **Step 23**: Create Router configuration
  - Route definitions
  - Protected routes
  - Redirects
  - **Stories**: All stories (routing)

- [x] **Step 24**: Create App component
  - Router setup
  - React Query provider
  - Global error boundary
  - Offline detection
  - Cart initialization
  - **Stories**: All stories (app foundation)

- [x] **Step 25**: Create main entry point
  - index.html
  - main.tsx
  - Global styles
  - **Stories**: All stories (app foundation)

---

### Phase 9: Styling

- [x] **Step 26**: Create Tailwind CSS configuration
  - Theme customization
  - Component styles
  - Responsive breakpoints
  - **Stories**: All stories (styling)

- [x] **Step 27**: Create component-specific styles
  - Page layouts
  - Component styles
  - Animations
  - **Stories**: All stories (styling)

---

### Phase 10: Assets & Public Files

- [x] **Step 28**: Add placeholder images
  - Menu placeholder
  - Logo
  - Icons
  - **Stories**: US-C02, US-C03

---

### Phase 11: Configuration Files

- [x] **Step 29**: Create package.json
  - Dependencies
  - Scripts
  - Project metadata
  - **Stories**: Foundation

- [x] **Step 30**: Create README.md
  - Project overview
  - Setup instructions
  - Development guide
  - **Stories**: Documentation

---

### Phase 12: Documentation

- [x] **Step 31**: Create code summary document
  - Component overview
  - State management summary
  - API integration summary
  - File structure
  - **Location**: `aidlc-docs/construction/unit2-customer-frontend/code/code-summary.md`
  - **Stories**: Documentation

---

## Story Traceability

### US-C01: 테이블 태블릿 자동 로그인
- Steps: 7, 11, 14, 16, 19, 23, 24

### US-C02: 메뉴 카테고리별 조회
- Steps: 5, 8, 12, 13, 20, 28

### US-C03: 메뉴 상세 정보 조회
- Steps: 5, 8, 12, 13, 17, 20, 28

### US-C04: 장바구니에 메뉴 추가
- Steps: 10, 17, 20, 21

### US-C05: 장바구니에서 수량 조절
- Steps: 10, 21

### US-C06: 장바구니에서 메뉴 삭제
- Steps: 10, 21

### US-C07: 장바구니 비우기
- Steps: 10, 21

### US-C08: 주문 생성
- Steps: 5, 9, 12, 13, 21

### US-C09: 주문 내역 조회
- Steps: 5, 9, 12, 13, 22

### US-C10: 주문 상태 실시간 업데이트
- Steps: 5, 9, 12, 13, 22

---

## Code Location

### Application Code
**Location**: `table-order-customer-ui/` (workspace root for this unit)

**Structure**:
```
table-order-customer-ui/
├── public/
│   ├── placeholder-menu.png
│   └── logo.png
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── authApi.ts
│   │   ├── menuApi.ts
│   │   └── orderApi.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── BottomNavigation.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── MenuDetailModal.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── menu/
│   │   │   ├── CategoryTabs.tsx
│   │   │   ├── MenuList.tsx
│   │   │   └── MenuItem.tsx
│   │   ├── cart/
│   │   │   ├── CartList.tsx
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartActions.tsx
│   │   └── order/
│   │       ├── OrderList.tsx
│   │       ├── OrderCard.tsx
│   │       └── OrderStatusBadge.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── MenuPage.tsx
│   │   ├── CartPage.tsx
│   │   └── OrdersPage.tsx
│   ├── stores/
│   │   ├── cartStore.ts
│   │   └── authStore.ts
│   ├── hooks/
│   │   ├── useMenus.ts
│   │   ├── useMenuDetail.ts
│   │   ├── useOrders.ts
│   │   └── useCreateOrder.ts
│   ├── types/
│   │   └── api.ts
│   ├── utils/
│   │   ├── tokenUtils.ts
│   │   └── constants.ts
│   ├── lib/
│   │   └── queryClient.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.development
├── .env.production
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

### Documentation
**Location**: `aidlc-docs/construction/unit2-customer-frontend/code/`

---

## Success Criteria

- [x] All 31 steps completed and marked [x]
- [x] All 10 user stories implemented
- [x] Project structure created
- [x] All components generated
- [x] State management implemented
- [x] API integration complete
- [x] Routing configured
- [x] Styling applied
- [x] Documentation generated
- [x] Code ready for build and test

---

**Plan Status**: ✅ COMPLETED

**Completion Date**: 2026-02-09

**Next Step**: Build and Test phase

