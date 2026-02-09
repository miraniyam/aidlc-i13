# NFR Design Patterns - Unit 2: Customer Frontend

## Overview

Unit 2 (Customer Frontend)의 NFR 요구사항을 충족하기 위한 설계 패턴을 정의합니다. 이 문서는 성능, 캐싱, 에러 처리, 보안, 상태 관리, 복원력, 라우팅, 모니터링 측면의 구체적인 구현 패턴을 포함합니다.

---

## 1. Performance Optimization Patterns

### 1.1 Code Splitting Pattern

**Pattern**: Route-based Code Splitting

**Implementation**:
```typescript
// App.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const MenuPage = lazy(() => import('@/pages/MenuPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));

const App = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
```

**Benefits**:
- 초기 번들 크기 감소
- 페이지별 독립적 로딩
- 사용자가 방문하지 않는 페이지는 로드하지 않음

**Trade-offs**:
- 페이지 전환 시 약간의 지연 (첫 방문 시)
- Suspense fallback 필요

---

### 1.2 Image Optimization Pattern

**Pattern**: WebP + Lazy Loading + Placeholder

**Implementation**:
```typescript
// MenuItem.tsx
import { useState } from 'react';

const MenuItem = ({ menu }: { menu: Menu }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="menu-item">
      {!imageLoaded && (
        <div className="placeholder bg-gray-200 animate-pulse" />
      )}
      <img
        src={imageError ? '/placeholder-menu.svg' : menu.imageUrl}
        alt={menu.menuName}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        className={imageLoaded ? 'opacity-100' : 'opacity-0'}
      />
      <h3>{menu.menuName}</h3>
      <p>{menu.price.toLocaleString()}원</p>
    </div>
  );
};
```

**Image Format Strategy**:
```typescript
// Backend should serve WebP with fallback
// <img src="/images/menu-1.webp" />
// If WebP not supported, fallback to JPEG/PNG
```

**Benefits**:
- WebP는 JPEG보다 25-35% 작은 파일 크기
- Lazy loading으로 초기 로딩 시간 단축
- Placeholder로 레이아웃 shift 방지

---

### 1.3 Bundle Optimization Pattern

**Pattern**: Tree Shaking + Minification + Compression

**Vite Configuration**:
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }), // Bundle analysis
  ],
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          state: ['zustand', '@tanstack/react-query'],
          http: ['axios'],
        },
      },
    },
  },
});
```

**Server Configuration** (Nginx example):
```nginx
# Enable gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;

# Enable brotli compression (if available)
brotli on;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

**Benefits**:
- Tree shaking으로 사용하지 않는 코드 제거
- Minification으로 파일 크기 감소
- Compression으로 네트워크 전송 크기 감소 (60-80%)

---

## 2. Caching Patterns

### 2.1 API Response Caching Pattern

**Pattern**: React Query with Stale-While-Revalidate

**Implementation**:
```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

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

**Cache Invalidation Strategy**:
```typescript
// After creating an order
const createOrder = useMutation({
  mutationFn: orderApi.createOrder,
  onSuccess: (data, variables) => {
    // Invalidate orders query
    queryClient.invalidateQueries({
      queryKey: queryKeys.orders.bySession(variables.sessionId),
    });
  },
});
```

**Benefits**:
- 5분 동안 캐시된 데이터 사용 (서버 부하 감소)
- 백그라운드에서 자동 갱신
- 네트워크 재연결 시 자동 refetch

---

### 2.2 Static Asset Caching Pattern

**Pattern**: Long-term Caching with Content Hash

**Vite Output**:
```
dist/
├── assets/
│   ├── index-a1b2c3d4.js  (content hash)
│   ├── index-e5f6g7h8.css (content hash)
│   └── logo-i9j0k1l2.svg  (content hash)
└── index.html
```

**Cache-Control Headers** (Nginx example):
```nginx
location /assets/ {
  # Long-term caching for hashed assets
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location / {
  # No caching for HTML
  expires -1;
  add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

**Benefits**:
- 정적 자산은 1년 동안 캐싱 (재방문 시 즉시 로드)
- Content hash로 캐시 무효화 자동 처리
- HTML은 캐싱하지 않아 최신 버전 보장

---

## 3. Error Handling Patterns

### 3.1 API Error Handling Pattern

**Pattern**: Centralized Error Handling with Interceptors

**Implementation**:
```typescript
// api/client.ts
import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401: Unauthorized - Auto logout
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('table_id');
      window.location.href = '/login';
      toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    // 403: Forbidden
    else if (error.response?.status === 403) {
      toast.error('접근 권한이 없습니다.');
    }
    // 404: Not Found
    else if (error.response?.status === 404) {
      toast.error('요청한 리소스를 찾을 수 없습니다.');
    }
    // 500: Server Error
    else if (error.response?.status >= 500) {
      toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    // Network Error
    else if (error.message === 'Network Error') {
      toast.error('네트워크 연결을 확인해주세요.');
    }
    // Timeout
    else if (error.code === 'ECONNABORTED') {
      toast.error('요청 시간이 초과되었습니다.');
    }
    // Other errors
    else {
      toast.error(error.response?.data?.message || '요청에 실패했습니다.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

**React Query Error Handling**:
```typescript
// hooks/useMenus.ts
export const useMenus = (categoryId?: string) => {
  return useQuery({
    queryKey: queryKeys.menus.byCategory(categoryId),
    queryFn: () => menuApi.getMenus(categoryId),
    onError: (error) => {
      console.error('Failed to fetch menus:', error);
    },
  });
};
```

**Component-level Error Handling**:
```typescript
// pages/MenuPage.tsx
const MenuPage = () => {
  const { data, isLoading, isError, error, refetch } = useMenus();

  if (isError) {
    return (
      <ErrorMessage
        message={error?.message || '메뉴를 불러오는데 실패했습니다'}
        onRetry={() => refetch()}
      />
    );
  }

  // ...
};
```

**Benefits**:
- 중앙 집중식 에러 처리로 일관된 사용자 경험
- 자동 로그아웃으로 보안 강화
- 사용자 친화적인 에러 메시지

---

### 3.2 Network Error Recovery Pattern

**Pattern**: Manual Retry with User Action

**Implementation**:
```typescript
// components/common/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-red-500 mb-4">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-gray-700 text-center mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          다시 시도
        </button>
      )}
    </div>
  );
};
```

**Benefits**:
- 사용자가 명시적으로 재시도 (불필요한 서버 부하 방지)
- 명확한 사용자 피드백

---

## 4. Security Implementation Patterns

### 4.1 Token Management Pattern

**Pattern**: localStorage + Client-side Expiry Check + Auto-logout

**Implementation**:
```typescript
// utils/tokenUtils.ts
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  exp: number;
  sub: string;
  role: string;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

export const getTokenExpiryTime = (token: string): number | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
};
```

**Protected Route Implementation**:
```typescript
// components/common/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { isTokenExpired } from '@/utils/tokenUtils';

const ProtectedRoute = () => {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isTokenExpired(token)) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('table_id');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
```

**Auto-logout on 401**:
```typescript
// Already implemented in apiClient interceptor
// See Section 3.1
```

**Benefits**:
- 클라이언트 측 만료 검증으로 불필요한 API 호출 방지
- 401 응답 시 자동 로그아웃으로 보안 강화
- localStorage로 브라우저 새로고침 시에도 로그인 상태 유지

---

### 4.2 XSS Protection Pattern

**Pattern**: React Default Escaping + No dangerouslySetInnerHTML

**Implementation**:
```typescript
// ✅ SAFE: React automatically escapes
const MenuItem = ({ menu }: { menu: Menu }) => {
  return (
    <div>
      <h3>{menu.menuName}</h3> {/* Automatically escaped */}
      <p>{menu.description}</p> {/* Automatically escaped */}
    </div>
  );
};

// ❌ UNSAFE: Never use dangerouslySetInnerHTML
const UnsafeComponent = ({ html }: { html: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />; // DON'T DO THIS
};
```

**Input Validation** (if needed):
```typescript
// Client-side validation
const validateInput = (input: string): boolean => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i, // onclick, onerror, etc.
  ];

  return !suspiciousPatterns.some(pattern => pattern.test(input));
};
```

**Benefits**:
- React가 자동으로 모든 값을 escape 처리
- XSS 공격 벡터 최소화

---

## 5. State Management Patterns

### 5.1 Client State Persistence Pattern

**Pattern**: Zustand Persist Middleware + localStorage

**Implementation**:
```typescript
// stores/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
  addItem: (menu: Menu) => void;
  removeItem: (menuId: string) => void;
  updateQuantity: (menuId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,
      totalQuantity: 0,

      addItem: (menu) => {
        // ... implementation
        get().recalculateTotals();
      },

      removeItem: (menuId) => {
        set(state => ({
          items: state.items.filter(item => item.menuId !== menuId),
        }));
        get().recalculateTotals();
      },

      updateQuantity: (menuId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuId);
          return;
        }
        set(state => ({
          items: state.items.map(item =>
            item.menuId === menuId ? { ...item, quantity } : item
          ),
        }));
        get().recalculateTotals();
      },

      clearCart: () => {
        set({ items: [], totalAmount: 0, totalQuantity: 0 });
      },

      recalculateTotals: () => {
        const { items } = get();
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        set({ totalAmount, totalQuantity });
      },
    }),
    {
      name: 'cart-storage', // localStorage key
      partialize: (state) => ({
        items: state.items,
        totalAmount: state.totalAmount,
        totalQuantity: state.totalQuantity,
      }),
    }
  )
);
```

**Benefits**:
- 자동 localStorage 동기화
- 브라우저 새로고침 시에도 장바구니 유지
- 타입 안정성

---

### 5.2 Server State Synchronization Pattern

**Pattern**: React Query with Polling

**Implementation**:
```typescript
// hooks/useOrders.ts
export const useOrders = (sessionId: string, enablePolling: boolean = false) => {
  return useQuery({
    queryKey: queryKeys.orders.bySession(sessionId),
    queryFn: () => orderApi.getOrders(sessionId),
    enabled: !!sessionId,
    refetchInterval: enablePolling ? 30 * 1000 : false, // 30 seconds
    refetchIntervalInBackground: false, // Stop polling when tab is not active
  });
};
```

**Usage**:
```typescript
// pages/OrdersPage.tsx
const OrdersPage = () => {
  const sessionId = useAuthStore(state => state.tableId);
  const { data: orders } = useOrders(sessionId, true); // Enable polling

  // Polling automatically starts when component mounts
  // Polling automatically stops when component unmounts

  return <OrderList orders={orders} />;
};
```

**Benefits**:
- 30초마다 자동으로 주문 상태 업데이트
- 컴포넌트 unmount 시 자동으로 폴링 중지
- 백그라운드 탭에서는 폴링 중지 (배터리 절약)

---

## 6. Resilience Patterns

### 6.1 Offline Detection Pattern

**Pattern**: Navigator.onLine API + Event Listeners

**Implementation**:
```typescript
// App.tsx
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

const App = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOffline = () => {
      toast.error('네트워크 연결이 끊어졌습니다. 인터넷 연결을 확인해주세요.', {
        duration: Infinity, // Don't auto-dismiss
        id: 'offline', // Prevent duplicates
      });
    };

    const handleOnline = () => {
      toast.dismiss('offline');
      toast.success('네트워크 연결이 복구되었습니다.');
      
      // Refetch all queries
      queryClient.refetchQueries();
    };

    // Check initial state
    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [queryClient]);

  return (
    // ... app content
  );
};
```

**Benefits**:
- 즉시 오프라인 감지
- 온라인 복구 시 자동으로 데이터 refetch
- 사용자에게 명확한 피드백

---

### 6.2 Loading State Pattern

**Pattern**: React Query Loading States + Spinner Component

**Implementation**:
```typescript
// pages/MenuPage.tsx
const MenuPage = () => {
  const { data: menus, isLoading, isError, error, refetch } = useMenus();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return <ErrorMessage message={error.message} onRetry={refetch} />;
  }

  return <MenuList menus={menus} />;
};
```

**Spinner Component**:
```typescript
// components/common/Spinner.tsx
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner = ({ size = 'md' }: SpinnerProps) => {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`${sizeStyles[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
};
```

**Benefits**:
- 명확한 로딩 상태 표시
- 사용자 경험 향상

---

## 7. Routing Patterns

### 7.1 Protected Route Pattern

**Pattern**: Higher-Order Component (HOC) with Token Validation

**Implementation**:
```typescript
// Already covered in Section 4.1
// See ProtectedRoute component
```

---

### 7.2 Navigation Pattern

**Pattern**: Bottom Navigation Bar (Fixed)

**Implementation**:
```typescript
// components/common/BottomNavigation.tsx
import { NavLink } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';

const BottomNavigation = () => {
  const totalQuantity = useCartStore(state => state.totalQuantity);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        <NavLink
          to="/menu"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full ${
              isActive ? 'text-blue-600' : 'text-gray-600'
            }`
          }
        >
          <MenuIcon />
          <span className="text-xs mt-1">메뉴</span>
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full relative ${
              isActive ? 'text-blue-600' : 'text-gray-600'
            }`
          }
        >
          <CartIcon />
          {totalQuantity > 0 && (
            <span className="absolute top-2 right-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalQuantity}
            </span>
          )}
          <span className="text-xs mt-1">장바구니</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full ${
              isActive ? 'text-blue-600' : 'text-gray-600'
            }`
          }
        >
          <OrderIcon />
          <span className="text-xs mt-1">주문내역</span>
        </NavLink>
      </div>
    </nav>
  );
};
```

**Benefits**:
- 태블릿 환경에 최적화
- 장바구니 배지로 실시간 업데이트
- 터치 친화적 (44x44px 이상)

---

## 8. Monitoring & Observability Patterns

### 8.1 Client-Side Logging Pattern

**Pattern**: Console Logging (Development Only)

**Implementation**:
```typescript
// utils/logger.ts
const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
};
```

**Usage**:
```typescript
// api/client.ts
apiClient.interceptors.response.use(
  response => response,
  error => {
    logger.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

**Benefits**:
- 개발 환경에서만 로깅
- 프로덕션 빌드에서 자동 제거 (Terser)

---

### 8.2 Performance Monitoring Pattern

**Pattern**: Browser DevTools Only

**Usage**:
```typescript
// Manual performance measurement (development only)
if (import.meta.env.MODE === 'development') {
  // Measure component render time
  console.time('MenuPage render');
  // ... component logic
  console.timeEnd('MenuPage render');
}
```

**Chrome DevTools**:
- Performance tab: 페이지 로딩 성능 분석
- Network tab: API 응답 시간 확인
- Lighthouse: 성능, 접근성, SEO 점수

**Benefits**:
- 별도 라이브러리 불필요
- 개발 중 성능 문제 조기 발견

---

## 9. Summary

### Performance Patterns
- Route-based code splitting
- WebP + Lazy loading + Placeholder
- Tree shaking + Minification + Compression

### Caching Patterns
- React Query (5min staleTime, 10min cacheTime)
- Long-term static asset caching (1년)

### Error Handling Patterns
- Axios interceptor + React Query + Toast
- Manual retry with user action

### Security Patterns
- localStorage + Client-side expiry check + Auto-logout
- React default XSS protection

### State Management Patterns
- Zustand persist middleware + localStorage
- React Query with 30s polling

### Resilience Patterns
- Navigator.onLine API + Event listeners
- React Query loading states + Spinner

### Routing Patterns
- HOC-based protected routes
- Bottom navigation bar (fixed)

### Monitoring Patterns
- Console logging (development only)
- Browser DevTools

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-09  
**Status**: Draft
