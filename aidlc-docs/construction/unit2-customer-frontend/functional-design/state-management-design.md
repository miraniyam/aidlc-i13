# State Management Design - Unit 2: Customer Frontend

## Overview

고객용 프론트엔드의 상태 관리 전략, 클라이언트 상태(Zustand), 서버 상태(React Query), 로컬 스토리지 전략을 정의합니다.

---

## State Management Architecture

```
+----------------------------------+
|        Application State         |
+----------------------------------+
           |           |
           v           v
+----------------+  +----------------+
| Client State   |  | Server State   |
| (Zustand)      |  | (React Query)  |
+----------------+  +----------------+
           |           |
           v           v
+----------------+  +----------------+
| localStorage   |  | API Cache      |
+----------------+  +----------------+
```

---

## Client State (Zustand)

### 1. Cart Store

**Purpose**: 장바구니 상태 관리

**State Structure**:
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

interface CartActions {
  addItem: (menu: Menu) => void;
  removeItem: (menuId: string) => void;
  updateQuantity: (menuId: string, quantity: number) => void;
  clearCart: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

type CartStore = CartState & CartActions;
```

**Store Implementation**:
```typescript
import create from 'zustand';

const useCartStore = create<CartStore>((set, get) => ({
  // Initial state
  items: [],
  totalAmount: 0,
  totalQuantity: 0,

  // Actions
  addItem: (menu) => {
    const { items } = get();
    const existingItem = items.find(item => item.menuId === menu.menuId);

    if (existingItem) {
      // Increase quantity
      set(state => ({
        items: state.items.map(item =>
          item.menuId === menu.menuId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      }));
    } else {
      // Add new item
      set(state => ({
        items: [...state.items, {
          menuId: menu.menuId,
          menuName: menu.menuName,
          price: menu.price,
          quantity: 1,
          imageUrl: menu.imageUrl,
        }],
      }));
    }

    // Recalculate totals
    get().recalculateTotals();
    get().saveToStorage();
  },

  removeItem: (menuId) => {
    set(state => ({
      items: state.items.filter(item => item.menuId !== menuId),
    }));
    get().recalculateTotals();
    get().saveToStorage();
  },

  updateQuantity: (menuId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuId);
      return;
    }

    set(state => ({
      items: state.items.map(item =>
        item.menuId === menuId
          ? { ...item, quantity }
          : item
      ),
    }));
    get().recalculateTotals();
    get().saveToStorage();
  },

  clearCart: () => {
    set({ items: [], totalAmount: 0, totalQuantity: 0 });
    get().saveToStorage();
  },

  // Private method (not exposed in type)
  recalculateTotals: () => {
    const { items } = get();
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    set({ totalAmount, totalQuantity });
  },

  loadFromStorage: () => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      const cartData = JSON.parse(stored);
      set(cartData);
    }
  },

  saveToStorage: () => {
    const { items, totalAmount, totalQuantity } = get();
    localStorage.setItem('cart', JSON.stringify({ items, totalAmount, totalQuantity }));
  },
}));

export default useCartStore;
```

**Usage Example**:
```typescript
// In component
const { items, totalAmount, addItem, removeItem, updateQuantity, clearCart } = useCartStore();

// Add item
const handleAddToCart = (menu: Menu) => {
  addItem(menu);
  toast.success('장바구니에 추가되었습니다');
};

// Update quantity
const handleQuantityChange = (menuId: string, newQuantity: number) => {
  updateQuantity(menuId, newQuantity);
};

// Clear cart
const handleClearCart = () => {
  if (confirm('장바구니를 비우시겠습니까?')) {
    clearCart();
    toast.success('장바구니가 비워졌습니다');
  }
};
```

---

### 2. Auth Store (Optional)

**Purpose**: 인증 상태 관리

**State Structure**:
```typescript
interface AuthState {
  token: string | null;
  tableId: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (token: string, tableId: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

type AuthStore = AuthState & AuthActions;
```

**Store Implementation**:
```typescript
const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  tableId: null,
  isAuthenticated: false,

  login: (token, tableId) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('table_id', tableId);
    set({ token, tableId, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('table_id');
    set({ token: null, tableId: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('auth_token');
    const tableId = localStorage.getItem('table_id');
    if (token && tableId) {
      set({ token, tableId, isAuthenticated: true });
    }
  },
}));
```

---

## Server State (React Query)

### 1. Query Configuration

**Global Configuration**:
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes (moderate caching)
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

### 2. Query Keys Strategy

**Query Key Structure**:
```typescript
export const queryKeys = {
  menus: {
    all: ['menus'] as const,
    byCategory: (categoryId?: string) => ['menus', 'category', categoryId] as const,
    detail: (menuId: string) => ['menus', 'detail', menuId] as const,
  },
  orders: {
    all: ['orders'] as const,
    bySession: (sessionId: string) => ['orders', 'session', sessionId] as const,
  },
};
```

---

### 3. Menu Queries

**Fetch All Menus**:
```typescript
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '@/api/menuApi';
import { queryKeys } from '@/lib/queryKeys';

export const useMenus = (categoryId?: string) => {
  return useQuery({
    queryKey: queryKeys.menus.byCategory(categoryId),
    queryFn: () => menuApi.getMenus(categoryId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

**Fetch Menu Detail**:
```typescript
export const useMenuDetail = (menuId: string) => {
  return useQuery({
    queryKey: queryKeys.menus.detail(menuId),
    queryFn: () => menuApi.getMenuDetail(menuId),
    enabled: !!menuId,
  });
};
```

---

### 4. Order Queries

**Fetch Orders with Polling**:
```typescript
export const useOrders = (sessionId: string, enablePolling: boolean = false) => {
  return useQuery({
    queryKey: queryKeys.orders.bySession(sessionId),
    queryFn: () => orderApi.getOrders(sessionId),
    refetchInterval: enablePolling ? 30 * 1000 : false, // 30 seconds polling
    enabled: !!sessionId,
  });
};
```

**Usage in OrdersPage**:
```typescript
const OrdersPage = () => {
  const sessionId = useAuthStore(state => state.tableId);
  const { data: orders, isLoading, error } = useOrders(sessionId, true); // Enable polling

  // Polling starts when page mounts, stops when unmounts
  
  return (
    <div>
      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {orders && <OrderList orders={orders} />}
    </div>
  );
};
```

---

### 5. Order Mutations

**Create Order**:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/api/orderApi';
import { queryKeys } from '@/lib/queryKeys';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const clearCart = useCartStore(state => state.clearCart);

  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: (data, variables) => {
      // Invalidate orders query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.bySession(variables.sessionId) });
      
      // Clear cart
      clearCart();
      
      // Show success message
      toast.success('주문이 완료되었습니다');
    },
    onError: (error) => {
      toast.error('주문 생성에 실패했습니다');
    },
  });
};
```

**Usage in CartPage**:
```typescript
const CartPage = () => {
  const { items } = useCartStore();
  const sessionId = useAuthStore(state => state.tableId);
  const createOrder = useCreateOrder();
  const navigate = useNavigate();

  const handleCreateOrder = () => {
    // Validation
    if (items.length === 0) {
      toast.error('장바구니가 비어있습니다');
      return;
    }

    // Create order
    createOrder.mutate(
      {
        sessionId,
        items: items.map(item => ({
          menuId: item.menuId,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: () => {
          // Show success message for 5 seconds, then redirect
          setTimeout(() => {
            navigate('/menu');
          }, 5000);
        },
      }
    );
  };

  return (
    <div>
      <CartList items={items} />
      <button onClick={handleCreateOrder} disabled={createOrder.isLoading}>
        {createOrder.isLoading ? '주문 중...' : '주문하기'}
      </button>
    </div>
  );
};
```

---

## Local Storage Strategy

### 1. Storage Keys

```typescript
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  TABLE_ID: 'table_id',
  CART: 'cart',
} as const;
```

---

### 2. Cart Persistence

**Strategy**: localStorage only (브라우저 새로고침 시에도 유지)

**Lifecycle**:
1. **App Mount**: Load cart from localStorage
2. **Cart Change**: Save to localStorage automatically
3. **Session End**: Clear cart when table session ends

**Implementation**:
```typescript
// In App.tsx
useEffect(() => {
  // Load cart on mount
  useCartStore.getState().loadFromStorage();
}, []);

// In useCartStore
// saveToStorage() is called automatically after every cart change
```

**Session End Handling**:
```typescript
// When admin completes table session (detected via polling or SSE)
const handleSessionEnd = () => {
  useCartStore.getState().clearCart();
  useAuthStore.getState().logout();
  navigate('/login');
};
```

---

### 3. Auth Token Persistence

**Strategy**: localStorage (16시간 유효)

**Token Expiry Check**:
```typescript
import { jwtDecode } from 'jwt-decode';

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};
```

**Auto-logout on Expiry**:
```typescript
// In ProtectedRoute
const token = localStorage.getItem('auth_token');
if (token && isTokenExpired(token)) {
  localStorage.removeItem('auth_token');
  return <Navigate to="/login" replace />;
}
```

---

## State Synchronization

### 1. Cart Badge Update

**Automatic Update**:
```typescript
// In BottomNavigation
const totalQuantity = useCartStore(state => state.totalQuantity);

<NavigationItem 
  label="장바구니" 
  path="/cart" 
  icon={<CartIcon />} 
  badge={totalQuantity} 
/>
```

---

### 2. Order Status Update

**Polling Strategy**: React Query polling (30초 간격)

**Lifecycle**:
- **Start**: OrdersPage 진입 시
- **Stop**: OrdersPage 이탈 시

**Implementation**:
```typescript
// Polling is automatically managed by React Query
// When component unmounts, polling stops
const { data: orders } = useOrders(sessionId, true);
```

---

## Error Handling

### 1. API Error Handling

**Strategy**: Combination (Toast + Inline + Global Error Boundary)

**Toast Notification**:
```typescript
// In API client (axios interceptor)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Auto-logout
      useAuthStore.getState().logout();
      window.location.href = '/login';
    } else {
      // Show toast with retry button
      toast.error(
        <div>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      );
    }
    return Promise.reject(error);
  }
);
```

**Inline Error**:
```typescript
// In component
const { data, error, refetch } = useMenus();

if (error) {
  return (
    <div className="error-container">
      <p>메뉴를 불러오는데 실패했습니다</p>
      <button onClick={() => refetch()}>다시 시도</button>
    </div>
  );
}
```

**Global Error Boundary**:
```typescript
// In App.tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <Router>
    {/* routes */}
  </Router>
</ErrorBoundary>
```

---

### 2. Network Error Handling

**Strategy**: 수동 재시도 (Toast notification에 "다시 시도" 버튼 제공)

**Offline Detection**:
```typescript
// In App.tsx
useEffect(() => {
  const handleOffline = () => {
    toast.error('네트워크 연결이 끊어졌습니다');
  };

  const handleOnline = () => {
    toast.success('네트워크 연결이 복구되었습니다');
  };

  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);

  return () => {
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('online', handleOnline);
  };
}, []);
```

---

## Summary

### Client State (Zustand)
- **Cart Store**: 장바구니 상태 관리, localStorage 동기화
- **Auth Store**: 인증 상태 관리 (optional)

### Server State (React Query)
- **Caching**: Moderate (5분)
- **Polling**: 30초 간격 (OrdersPage에서만)
- **Mutations**: Order creation with optimistic updates

### Local Storage
- **Cart**: localStorage (세션 종료 시 삭제)
- **Auth Token**: localStorage (16시간 유효, 만료 시 자동 로그아웃)

### Error Handling
- **Toast**: 일반 에러 메시지 + 재시도 버튼
- **Inline**: 컴포넌트별 에러 표시
- **Global**: Error Boundary for unexpected errors
- **401**: 자동 로그아웃 후 로그인 화면 이동

### Key Design Decisions
- Zustand for client state (simple, performant)
- React Query for server state (caching, polling)
- localStorage for persistence (cart, auth)
- Moderate caching (5분) for menus
- Polling (30초) for order status
- Manual retry for network errors

---

**End of State Management Design Document**
