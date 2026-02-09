# NFR Design Patterns - Unit 3 (Admin Frontend)

## Overview

Admin Frontend의 NFR 요구사항을 충족하기 위한 설계 패턴을 정의합니다. 성능, 확장성, 보안, 신뢰성을 위한 구체적인 구현 패턴을 명시합니다.

---

## 1. Performance Patterns

### 1.1 Caching Strategy (React Query)

**Pattern**: Stale-While-Revalidate

**Implementation**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    }
  }
});
```

**Cache Invalidation Strategy**:
- **Optimistic Update**: 주문 상태 변경 시 즉시 UI 업데이트
- **Event-driven Invalidation**: SSE 이벤트 수신 시 캐시 무효화
- **Time-based Invalidation**: 5분 후 자동 stale

**Benefits**:
- 네트워크 요청 최소화
- 빠른 UI 응답
- 데이터 신선도 유지

---

### 1.2 Code Splitting

**Pattern**: Route-based Code Splitting

**Implementation**:
```typescript
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/menu" element={<MenuPage />} />
    <Route path="/menu/categories" element={<CategoryPage />} />
  </Routes>
</Suspense>
```

**Benefits**:
- 초기 번들 크기 감소
- 페이지별 독립 로딩
- 빠른 초기 로딩

---

### 1.3 Lazy Loading (Images & Components)

**Pattern**: Intersection Observer

**Implementation**:
```typescript
// Image lazy loading
<img 
  src={menu.image_url} 
  loading="lazy" 
  alt={menu.menu_name} 
/>

// Component lazy loading (viewport-based)
const TableCard = lazy(() => import('./components/TableCard'));

<Suspense fallback={<Skeleton />}>
  {isInViewport && <TableCard table={table} />}
</Suspense>
```

**Benefits**:
- 초기 렌더링 속도 향상
- 네트워크 대역폭 절약
- 메모리 사용 최적화

---

### 1.4 Memoization

**Pattern**: React.memo + useMemo + useCallback

**Implementation**:
```typescript
// Component memoization
const TableCard = React.memo(({ table }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.table.table_id === nextProps.table.table_id &&
         prevProps.table.orders.length === nextProps.table.orders.length;
});

// Expensive calculation memoization
const totalAmount = useMemo(() => {
  return orders.reduce((sum, order) => sum + order.total_amount, 0);
}, [orders]);

// Callback memoization
const handleStatusChange = useCallback((orderId, newStatus) => {
  // ...
}, []);
```

**Benefits**:
- 불필요한 리렌더링 방지
- 계산 비용 절감
- 성능 향상

---

### 1.5 Debouncing & Throttling

**Pattern**: Lodash debounce/throttle

**Implementation**:
```typescript
import { debounce, throttle } from 'lodash';

// Search input debouncing (300ms)
const debouncedSearch = debounce((query) => {
  searchMenus(query);
}, 300);

// Scroll event throttling (100ms)
const throttledScroll = throttle(() => {
  handleScroll();
}, 100);
```

**Use Cases**:
- 검색 입력: Debounce 300ms
- 스크롤 이벤트: Throttle 100ms
- 윈도우 리사이즈: Throttle 200ms

**Benefits**:
- API 호출 최소화
- 이벤트 핸들러 부하 감소
- 성능 향상

---

## 2. Scalability Patterns

### 2.1 Virtual Scrolling (Optional)

**Pattern**: React Window

**Trigger**: 테이블 50개 이상

**Implementation**:
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={800}
  itemCount={tables.length}
  itemSize={200}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <TableCard table={tables[index]} />
    </div>
  )}
</FixedSizeList>
```

**Benefits**:
- 대량 데이터 렌더링 최적화
- 메모리 사용 최소화
- 스크롤 성능 향상

**Note**: 테이블 50개 이하에서는 불필요

---

### 2.2 Pagination (Order History)

**Pattern**: Cursor-based Pagination

**Implementation**:
```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
  ['orderHistory', tableId],
  ({ pageParam = 0 }) => fetchOrderHistory(tableId, pageParam),
  {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  }
);

// Infinite scroll
<InfiniteScroll
  dataLength={data.pages.length}
  next={fetchNextPage}
  hasMore={hasNextPage}
>
  {data.pages.map(page => page.orders.map(order => (
    <OrderItem key={order.order_id} order={order} />
  )))}
</InfiniteScroll>
```

**Benefits**:
- 대량 과거 내역 처리
- 메모리 효율적
- 빠른 초기 로딩

---

## 3. Resilience Patterns

### 3.1 Retry Pattern (Exponential Backoff)

**Pattern**: React Query Retry

**Implementation**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    },
    mutations: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});
```

**Retry Schedule**:
- 1st retry: 1초 후
- 2nd retry: 2초 후
- 3rd retry: 4초 후
- Max delay: 30초

**No Retry**:
- 4xx 에러 (400, 401, 403, 404)
- 비즈니스 로직 에러

**Benefits**:
- 일시적 네트워크 오류 복구
- 사용자 경험 향상
- 안정성 증가

---

### 3.2 Circuit Breaker (SSE)

**Pattern**: Auto-reconnect with Exponential Backoff

**Implementation**:
```typescript
const useSSE = (url: string) => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const reconnectAttempts = useRef(0);
  const maxReconnectDelay = 30000; // 30초
  
  const connect = useCallback(() => {
    const eventSource = new EventSource(url);
    
    eventSource.onopen = () => {
      setStatus('connected');
      reconnectAttempts.current = 0;
    };
    
    eventSource.onerror = () => {
      setStatus('reconnecting');
      eventSource.close();
      
      const delay = Math.min(
        1000 * Math.pow(2, reconnectAttempts.current),
        maxReconnectDelay
      );
      
      setTimeout(() => {
        reconnectAttempts.current++;
        connect();
      }, delay);
    };
    
    return eventSource;
  }, [url]);
  
  useEffect(() => {
    const eventSource = connect();
    return () => eventSource.close();
  }, [connect]);
  
  return { status };
};
```

**Benefits**:
- SSE 연결 안정성
- 자동 복구
- 사용자 알림

---

### 3.3 Fallback UI

**Pattern**: Error Boundary + Suspense

**Implementation**:
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          resetError={() => this.setState({ hasError: false })} 
        />
      );
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <Suspense fallback={<LoadingSpinner />}>
    <DashboardPage />
  </Suspense>
</ErrorBoundary>
```

**Benefits**:
- 에러 격리
- 우아한 에러 처리
- 사용자 경험 유지

---

### 3.4 Optimistic Update

**Pattern**: React Query Optimistic Update

**Implementation**:
```typescript
const updateOrderStatus = useMutation(
  (data) => axios.patch(`/api/admin/orders/${data.orderId}/status`, data),
  {
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['dashboard']);
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['dashboard']);
      
      // Optimistically update
      queryClient.setQueryData(['dashboard'], (old) => {
        // Update order status immediately
        return updateOrderInData(old, newData);
      });
      
      return { previousData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['dashboard'], context.previousData);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries(['dashboard']);
    }
  }
);
```

**Benefits**:
- 즉각적인 UI 반영
- 체감 성능 향상
- 에러 시 롤백

---

## 4. Security Patterns

### 4.1 Input Sanitization

**Pattern**: DOMPurify

**Implementation**:
```typescript
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// Usage in form
const handleSubmit = (formData) => {
  const sanitizedData = {
    menu_name: sanitizeInput(formData.menu_name),
    description: sanitizeInput(formData.description),
    category_name: sanitizeInput(formData.category_name)
  };
  
  createMenu(sanitizedData);
};
```

**Sanitization Points**:
- 메뉴명 입력
- 메뉴 설명 입력
- 카테고리명 입력

**Benefits**:
- XSS 공격 방지
- 안전한 데이터 저장
- 보안 강화

---

### 4.2 Rate Limiting (Client-side)

**Pattern**: Token Bucket

**Implementation**:
```typescript
class RateLimiter {
  private requests: number[] = [];
  private limit: number;
  private window: number;
  
  constructor(limit: number, window: number) {
    this.limit = limit; // 10 requests
    this.window = window; // 1000ms (1 second)
  }
  
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.window);
    
    if (this.requests.length >= this.limit) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

const rateLimiter = new RateLimiter(10, 1000);

apiClient.interceptors.request.use((config) => {
  if (!rateLimiter.canMakeRequest()) {
    return Promise.reject(new Error('Too many requests. Please slow down.'));
  }
  return config;
});
```

**Benefits**:
- Brute force 공격 방지
- API 남용 방지
- 서버 부하 감소

---

### 4.3 Secure Token Storage

**Pattern**: localStorage with XSS Protection

**Implementation**:
```typescript
// Token storage
const TokenStorage = {
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  },
  
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  },
  
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },
  
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
};

// Auto-logout on token expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Benefits**:
- 안전한 토큰 관리
- 자동 로그아웃
- XSS 방어 (React 기본)

---

## 5. Monitoring & Observability Patterns

### 5.1 Error Tracking

**Pattern**: Console Error Logging

**Implementation**:
```typescript
const logError = (error: Error, context?: any) => {
  if (process.env.NODE_ENV === 'production') {
    console.error('[Error]', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  } else {
    console.error(error);
  }
};

// Usage in Error Boundary
componentDidCatch(error, errorInfo) {
  logError(error, { errorInfo });
}

// Usage in API calls
try {
  await apiCall();
} catch (error) {
  logError(error, { api: '/api/admin/orders' });
  throw error;
}
```

**Benefits**:
- 에러 추적
- 디버깅 용이
- 운영 모니터링

---

### 5.2 Performance Monitoring

**Pattern**: Performance API

**Implementation**:
```typescript
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
};

// Usage
measurePerformance('Dashboard Render', () => {
  // Render logic
});

// Page load performance
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('[Performance] Page Load:', {
    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
    loadComplete: perfData.loadEventEnd - perfData.loadEventStart
  });
});
```

**Benefits**:
- 성능 병목 식별
- 최적화 근거
- 목표 달성 검증

---

## 6. User Experience Patterns

### 6.1 Loading States

**Pattern**: Skeleton Screens

**Implementation**:
```typescript
import { Skeleton } from 'antd';

const DashboardPage = () => {
  const { data, isLoading } = useQuery(['dashboard'], fetchDashboard);
  
  if (isLoading) {
    return (
      <div className="dashboard-skeleton">
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }
  
  return <Dashboard data={data} />;
};
```

**Benefits**:
- 체감 로딩 시간 감소
- 사용자 경험 향상
- 레이아웃 shift 방지

---

### 6.2 Error Feedback

**Pattern**: Toast + Modal Combination

**Implementation**:
```typescript
import { message, Modal } from 'antd';

// Toast for general errors
const showToast = (msg: string, type: 'success' | 'error' | 'info') => {
  message[type](msg, 3);
};

// Modal for critical errors
const showErrorModal = (title: string, content: string) => {
  Modal.error({
    title,
    content,
    okText: '확인'
  });
};

// Error handler
const handleAPIError = (error: any) => {
  const status = error.response?.status;
  const msg = error.response?.data?.message || '오류가 발생했습니다.';
  
  if (status === 500 || status === 403) {
    showErrorModal('오류', msg);
  } else {
    showToast(msg, 'error');
  }
};
```

**Benefits**:
- 명확한 에러 전달
- 사용자 행동 유도
- 일관된 UX

---

## Summary

### Performance Patterns (5)
1. Caching (React Query)
2. Code Splitting (Route-based)
3. Lazy Loading (Images, Components)
4. Memoization (React.memo, useMemo)
5. Debouncing & Throttling

### Scalability Patterns (2)
1. Virtual Scrolling (50+ tables)
2. Pagination (Order History)

### Resilience Patterns (4)
1. Retry (Exponential Backoff)
2. Circuit Breaker (SSE)
3. Fallback UI (Error Boundary)
4. Optimistic Update

### Security Patterns (3)
1. Input Sanitization (DOMPurify)
2. Rate Limiting (Client-side)
3. Secure Token Storage

### Monitoring Patterns (2)
1. Error Tracking (Console)
2. Performance Monitoring (Performance API)

### UX Patterns (2)
1. Loading States (Skeleton)
2. Error Feedback (Toast + Modal)

**Total**: 18 Design Patterns

---

**All NFR design patterns are defined and ready for implementation.**
