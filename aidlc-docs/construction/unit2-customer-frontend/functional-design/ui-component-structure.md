# UI Component Structure - Unit 2: Customer Frontend

## Overview

고객용 프론트엔드의 UI 컴포넌트 구조, 페이지 라우팅, 네비게이션 설계를 정의합니다.

---

## Page Routing Structure

### Routing Strategy
**Multi-page with routing** - 각 기능별로 별도 페이지 제공

### Route Definitions

```typescript
// Route paths
const routes = {
  root: '/',           // Redirect to /menu
  menu: '/menu',       // 메뉴 목록
  cart: '/cart',       // 장바구니
  orders: '/orders',   // 주문 내역
  login: '/login',     // 로그인 (토큰 없을 때)
};
```

### Route Configuration

```typescript
// React Router configuration
<Routes>
  <Route path="/" element={<Navigate to="/menu" replace />} />
  <Route path="/login" element={<LoginPage />} />
  
  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/menu" element={<MenuPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/orders" element={<OrdersPage />} />
  </Route>
</Routes>
```

---

## Page Components

### 1. LoginPage

**Purpose**: 테이블 자동 로그인

**Components**:
- `LoginForm`: 테이블 ID + 비밀번호 입력 폼
- `LoginButton`: 로그인 버튼

**Layout**:
```
+----------------------------------+
|                                  |
|        테이블오더 서비스          |
|                                  |
|   [테이블 번호 입력]              |
|   [비밀번호 입력]                 |
|                                  |
|        [로그인 버튼]              |
|                                  |
+----------------------------------+
```

---

### 2. MenuPage

**Purpose**: 메뉴 탐색 및 선택

**Components**:
- `CategoryTabs`: 카테고리 탭
- `MenuList`: 메뉴 카드 그리드
- `MenuItem`: 개별 메뉴 카드
- `MenuDetailModal`: 메뉴 상세 모달 (오버레이)
- `BottomNavigation`: 하단 네비게이션 바

**Layout**:
```
+----------------------------------+
| [메인] [사이드] [음료] [디저트]   | <- CategoryTabs
+----------------------------------+
|                                  |
| +------+  +------+  +------+     |
| |메뉴1 |  |메뉴2 |  |메뉴3 |     | <- MenuList
| |이미지|  |이미지|  |이미지|     |
| |15,000|  |12,000|  |8,000 |     |
| +------+  +------+  +------+     |
|                                  |
| +------+  +------+  +------+     |
| |메뉴4 |  |메뉴5 |  |메뉴6 |     |
| +------+  +------+  +------+     |
|                                  |
+----------------------------------+
| [메뉴] [장바구니(2)] [주문내역]  | <- BottomNavigation
+----------------------------------+
```

**MenuDetailModal** (when menu clicked):
```
+----------------------------------+
|                                  |
|        [메뉴 상세 모달]           |
|                                  |
|     [큰 이미지]                   |
|                                  |
|     메뉴명: 불고기 정식            |
|     가격: 15,000원                |
|     설명: 한우 불고기와...         |
|                                  |
|     [장바구니에 추가]  [닫기]     |
|                                  |
+----------------------------------+
```

---

### 3. CartPage

**Purpose**: 장바구니 관리

**Components**:
- `CartList`: 장바구니 항목 목록
- `CartItem`: 개별 장바구니 항목
- `CartSummary`: 총액 요약
- `CartActions`: 장바구니 비우기, 주문하기 버튼
- `BottomNavigation`: 하단 네비게이션 바

**Layout**:
```
+----------------------------------+
|          장바구니                 |
+----------------------------------+
|                                  |
| +------------------------------+ |
| | 불고기 정식        15,000원   | | <- CartItem
| | [이미지] [-] 2 [+]    [삭제]  | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | 김치찌개          8,000원     | |
| | [이미지] [-] 1 [+]    [삭제]  | |
| +------------------------------+ |
|                                  |
+----------------------------------+
| 총 금액: 38,000원                 | <- CartSummary
+----------------------------------+
| [장바구니 비우기]  [주문하기]     | <- CartActions
+----------------------------------+
| [메뉴] [장바구니(2)] [주문내역]  | <- BottomNavigation
+----------------------------------+
```

---

### 4. OrdersPage

**Purpose**: 주문 내역 조회 및 상태 확인

**Components**:
- `OrderList`: 주문 목록
- `OrderCard`: 개별 주문 카드
- `OrderStatusBadge`: 주문 상태 배지
- `BottomNavigation`: 하단 네비게이션 바

**Layout**:
```
+----------------------------------+
|          주문 내역                |
+----------------------------------+
|                                  |
| +------------------------------+ |
| | 주문 #1234      [준비중]      | | <- OrderCard
| | 2026-02-09 15:30              | |
| | - 불고기 정식 x2              | |
| | - 김치찌개 x1                 | |
| | 총액: 38,000원                | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | 주문 #1233      [전달완료]    | |
| | 2026-02-09 15:00              | |
| | - 된장찌개 x1                 | |
| | 총액: 8,000원                 | |
| +------------------------------+ |
|                                  |
+----------------------------------+
| [메뉴] [장바구니(2)] [주문내역]  | <- BottomNavigation
+----------------------------------+
```

---

## Component Hierarchy

```
App
├── Router
│   ├── LoginPage
│   │   └── LoginForm
│   │       └── LoginButton
│   │
│   ├── ProtectedRoute (HOC)
│   │   ├── MenuPage
│   │   │   ├── CategoryTabs
│   │   │   ├── MenuList
│   │   │   │   └── MenuItem (multiple)
│   │   │   ├── MenuDetailModal
│   │   │   └── BottomNavigation
│   │   │
│   │   ├── CartPage
│   │   │   ├── CartList
│   │   │   │   └── CartItem (multiple)
│   │   │   ├── CartSummary
│   │   │   ├── CartActions
│   │   │   └── BottomNavigation
│   │   │
│   │   └── OrdersPage
│   │       ├── OrderList
│   │       │   └── OrderCard (multiple)
│   │       │       └── OrderStatusBadge
│   │       └── BottomNavigation
```

---

## Common Components

### 1. BottomNavigation

**Purpose**: 페이지 간 네비게이션

**Structure**:
```typescript
interface NavigationItem {
  label: string;
  path: string;
  icon: ReactNode;
  badge?: number; // 장바구니 아이템 개수
}

const navigationItems: NavigationItem[] = [
  { label: '메뉴', path: '/menu', icon: <MenuIcon /> },
  { label: '장바구니', path: '/cart', icon: <CartIcon />, badge: cartItemCount },
  { label: '주문내역', path: '/orders', icon: <OrderIcon /> },
];
```

**Features**:
- 현재 페이지 하이라이트
- 장바구니 아이템 개수 배지 표시
- 터치 친화적 버튼 크기 (최소 44x44px)

---

### 2. MenuDetailModal

**Purpose**: 메뉴 상세 정보 표시 (오버레이)

**Display Strategy**: Modal (메뉴 목록 위에 오버레이)

**Structure**:
```typescript
interface MenuDetailModalProps {
  menu: Menu;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (menu: Menu) => void;
}
```

**Features**:
- 큰 이미지 표시
- 메뉴명, 가격, 설명 표시
- "장바구니에 추가" 버튼
- "닫기" 버튼 또는 배경 클릭으로 닫기

---

### 3. ProtectedRoute

**Purpose**: 인증 필요 라우트 보호

**Logic**:
```typescript
const ProtectedRoute = () => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // 토큰 만료 확인 (클라이언트 측)
  const isExpired = isTokenExpired(token);
  if (isExpired) {
    localStorage.removeItem('auth_token');
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};
```

---

## UI/UX Guidelines

### 1. Touch-Friendly Design
- 모든 버튼 최소 크기: 44x44px
- 충분한 간격 (최소 8px)
- 큰 터치 영역

### 2. Visual Feedback
- 버튼 클릭 시 시각적 피드백 (색상 변경, 애니메이션)
- 로딩 상태 표시 (스피너)
- 성공/에러 메시지 (Toast notification)

### 3. Responsive Design
- 태블릿 화면 최적화 (10-13인치)
- 가로/세로 모드 지원
- 유연한 그리드 레이아웃

### 4. Accessibility
- 충분한 색상 대비
- 명확한 레이블
- 키보드 네비게이션 지원

---

## Navigation Flow

```
Login Page
    |
    v (로그인 성공)
Menu Page <---> Cart Page <---> Orders Page
    ^              |                |
    |              v                |
    |         (주문 생성)            |
    +-------------------------------+
           (5초 후 자동 이동)
```

---

## Component Responsibilities

### Page Components
- **LoginPage**: 인증 처리, 토큰 저장
- **MenuPage**: 메뉴 조회, 카테고리 필터링, 메뉴 상세 표시
- **CartPage**: 장바구니 관리, 수량 조절, 주문 생성
- **OrdersPage**: 주문 내역 조회, 상태 폴링

### Common Components
- **BottomNavigation**: 페이지 네비게이션, 장바구니 배지
- **MenuDetailModal**: 메뉴 상세 표시, 장바구니 추가
- **ProtectedRoute**: 인증 확인, 리다이렉트

### Feature Components
- **CategoryTabs**: 카테고리 필터링
- **MenuList/MenuItem**: 메뉴 표시
- **CartList/CartItem**: 장바구니 항목 표시, 수량 조절
- **CartSummary**: 총액 계산 및 표시
- **OrderList/OrderCard**: 주문 표시
- **OrderStatusBadge**: 상태 시각화

---

## Summary

### Page Count
- **4 pages**: Login, Menu, Cart, Orders

### Component Count
- **Page components**: 4
- **Common components**: 3 (BottomNavigation, MenuDetailModal, ProtectedRoute)
- **Feature components**: 10+

### Navigation Strategy
- **Bottom navigation bar** (하단 탭 바)
- **Multi-page routing** (React Router)
- **Modal for menu details** (오버레이)

### Key Design Decisions
- Multi-page routing for clear separation
- Bottom navigation for easy access
- Modal for menu details (non-intrusive)
- Touch-friendly design (44x44px minimum)
- Protected routes for authentication

---

**End of UI Component Structure Document**
