# User Flow & Business Logic - Unit 2: Customer Frontend

## Overview

고객용 프론트엔드의 사용자 플로우, 비즈니스 로직, API 통합 전략을 정의합니다.

---

## User Flows

### 1. Auto-Login Flow

**Scenario**: 고객이 태블릿을 켠다

```
Start
  |
  v
[App Loads]
  |
  v
[Check localStorage for token]
  |
  +---> Token exists?
  |         |
  |         +---> Yes
  |         |       |
  |         |       v
  |         |   [Check token expiry (client-side)]
  |         |       |
  |         |       +---> Expired?
  |         |       |       |
  |         |       |       +---> Yes --> [Remove token] --> [Show Login Page]
  |         |       |       |
  |         |       |       +---> No --> [Navigate to /menu]
  |         |       |
  |         +---> No
  |                 |
  |                 v
  |             [Show Login Page]
  |
  v
[User enters Table ID + Password]
  |
  v
[POST /api/customer/login]
  |
  +---> Success?
  |       |
  |       +---> Yes
  |       |       |
  |       |       v
  |       |   [Save token to localStorage]
  |       |       |
  |       |       v
  |       |   [Navigate to /menu]
  |       |
  |       +---> No
  |               |
  |               v
  |           [Show error message]
  |               |
  |               v
  |           [Stay on Login Page]
  |
End
```

**Implementation**:
```typescript
// In App.tsx
useEffect(() => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    if (isTokenExpired(token)) {
      localStorage.removeItem('auth_token');
      navigate('/login');
    } else {
      navigate('/menu');
    }
  } else {
    navigate('/login');
  }
}, []);

// In LoginPage
const handleLogin = async (tableId: string, password: string) => {
  try {
    const response = await authApi.login(tableId, password);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('table_id', tableId);
    navigate('/menu');
  } catch (error) {
    toast.error('로그인에 실패했습니다');
  }
};
```

---

### 2. Menu Browsing Flow

**Scenario**: 고객이 메뉴를 탐색하고 장바구니에 추가한다

```
[Menu Page]
  |
  v
[Select Category Tab]
  |
  v
[View Menu List (filtered by category)]
  |
  v
[Click Menu Card]
  |
  v
[Menu Detail Modal Opens]
  |
  v
[View Menu Details (image, name, price, description)]
  |
  v
[Click "장바구니에 추가"]
  |
  v
[Add to Cart (Zustand)]
  |
  v
[Save to localStorage]
  |
  v
[Show success toast]
  |
  v
[Update cart badge (totalQuantity)]
  |
  v
[Close Modal]
  |
  v
[Back to Menu List]
```

**Implementation**:
```typescript
// In MenuPage
const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);

const handleMenuClick = (menu: Menu) => {
  setSelectedMenu(menu);
  setIsModalOpen(true);
};

const handleAddToCart = (menu: Menu) => {
  useCartStore.getState().addItem(menu);
  toast.success('장바구니에 추가되었습니다');
  setIsModalOpen(false);
};

return (
  <>
    <CategoryTabs />
    <MenuList onMenuClick={handleMenuClick} />
    <MenuDetailModal
      menu={selectedMenu}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onAddToCart={handleAddToCart}
    />
    <BottomNavigation />
  </>
);
```

---

### 3. Cart Management Flow

**Scenario**: 고객이 장바구니에서 수량을 조절하고 주문한다

```
[Cart Page]
  |
  v
[View Cart Items]
  |
  +---> Empty?
  |       |
  |       +---> Yes --> [Show "장바구니가 비어있습니다"]
  |       |
  |       +---> No
  |               |
  |               v
  |           [Show Cart Items]
  |               |
  |               v
  |           [User Actions]
  |               |
  |               +---> Adjust Quantity?
  |               |       |
  |               |       v
  |               |   [Click +/- buttons]
  |               |       |
  |               |       v
  |               |   [Update quantity in Zustand]
  |               |       |
  |               |       v
  |               |   [Recalculate totals]
  |               |       |
  |               |       v
  |               |   [Save to localStorage]
  |               |
  |               +---> Remove Item?
  |               |       |
  |               |       v
  |               |   [Click delete button]
  |               |       |
  |               |       v
  |               |   [Remove from Zustand]
  |               |       |
  |               |       v
  |               |   [Save to localStorage]
  |               |
  |               +---> Clear Cart?
  |               |       |
  |               |       v
  |               |   [Click "장바구니 비우기"]
  |               |       |
  |               |       v
  |               |   [Show confirmation popup]
  |               |       |
  |               |       +---> Confirmed?
  |               |               |
  |               |               +---> Yes --> [Clear cart] --> [Save to localStorage]
  |               |               |
  |               |               +---> No --> [Cancel]
  |               |
  |               +---> Create Order?
  |                       |
  |                       v
  |                   [Click "주문하기"]
  |                       |
  |                       v
  |                   [Validate cart (not empty, quantity > 0)]
  |                       |
  |                       +---> Valid?
  |                               |
  |                               +---> Yes
  |                               |       |
  |                               |       v
  |                               |   [POST /api/orders]
  |                               |       |
  |                               |       +---> Success?
  |                               |               |
  |                               |               +---> Yes
  |                               |               |       |
  |                               |               |       v
  |                               |               |   [Clear cart]
  |                               |               |       |
  |                               |               |       v
  |                               |               |   [Show success message]
  |                               |               |       |
  |                               |               |       v
  |                               |               |   [Wait 5 seconds]
  |                               |               |       |
  |                               |               |       v
  |                               |               |   [Navigate to /menu]
  |                               |               |
  |                               |               +---> No
  |                               |                       |
  |                               |                       v
  |                               |                   [Show error toast]
  |                               |
  |                               +---> No
  |                                       |
  |                                       v
  |                                   [Show error message]
  |
End
```

**Implementation**:
```typescript
// In CartPage
const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCartStore();
const createOrder = useCreateOrder();
const navigate = useNavigate();

const handleQuantityChange = (menuId: string, newQuantity: number) => {
  updateQuantity(menuId, newQuantity);
};

const handleRemoveItem = (menuId: string) => {
  removeItem(menuId);
  toast.success('항목이 삭제되었습니다');
};

const handleClearCart = () => {
  if (confirm('장바구니를 비우시겠습니까?')) {
    clearCart();
    toast.success('장바구니가 비워졌습니다');
  }
};

const handleCreateOrder = () => {
  // Validation
  if (items.length === 0) {
    toast.error('장바구니가 비어있습니다');
    return;
  }

  if (items.some(item => item.quantity <= 0)) {
    toast.error('수량이 0인 항목이 있습니다');
    return;
  }

  if (totalAmount <= 0) {
    toast.error('총 금액이 0원입니다');
    return;
  }

  // Create order
  const sessionId = localStorage.getItem('table_id');
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
        toast.success('주문이 완료되었습니다');
        setTimeout(() => {
          navigate('/menu');
        }, 5000);
      },
      onError: () => {
        toast.error('주문 생성에 실패했습니다');
      },
    }
  );
};
```

---

### 4. Order Tracking Flow

**Scenario**: 고객이 주문 내역을 확인하고 상태를 추적한다

```
[Orders Page]
  |
  v
[Start polling (30s interval)]
  |
  v
[GET /api/orders?session_id={sessionId}]
  |
  v
[Display order list (time descending)]
  |
  v
[Show order status badges]
  |
  +---> pending (회색 배지)
  +---> preparing (노란색 배지)
  +---> ready (초록색 배지)
  +---> served (파란색 배지)
  |
  v
[Wait 30 seconds]
  |
  v
[Refetch orders (React Query polling)]
  |
  v
[Update UI if status changed]
  |
  v
[Repeat until page unmount]
  |
  v
[Stop polling on page exit]
```

**Implementation**:
```typescript
// In OrdersPage
const sessionId = localStorage.getItem('table_id');
const { data: orders, isLoading, error } = useOrders(sessionId, true); // Enable polling

// Polling automatically starts when component mounts
// Polling automatically stops when component unmounts

return (
  <div>
    {isLoading && <Spinner />}
    {error && <ErrorMessage error={error} />}
    {orders && orders.length === 0 && <EmptyState message="주문 내역이 없습니다" />}
    {orders && orders.length > 0 && (
      <OrderList>
        {orders.map(order => (
          <OrderCard key={order.orderId} order={order}>
            <OrderStatusBadge status={order.status} />
          </OrderCard>
        ))}
      </OrderList>
    )}
    <BottomNavigation />
  </div>
);
```

---

## Business Logic

### 1. Cart Total Calculation

**Location**: Zustand store (상태 변경 시 자동 재계산)

**Logic**:
```typescript
const recalculateTotals = () => {
  const { items } = get();
  
  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  // Calculate total quantity
  const totalQuantity = items.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);
  
  set({ totalAmount, totalQuantity });
};
```

**Trigger Points**:
- `addItem()` 호출 후
- `removeItem()` 호출 후
- `updateQuantity()` 호출 후
- `clearCart()` 호출 후

---

### 2. Order Validation (Client-side)

**Location**: CartPage, before creating order

**Rules**:
1. 장바구니가 비어있지 않아야 함
2. 각 메뉴의 수량이 1 이상이어야 함
3. 총 금액이 0보다 커야 함

**Implementation**:
```typescript
const validateOrder = (items: CartItem[], totalAmount: number): { valid: boolean; error?: string } => {
  if (items.length === 0) {
    return { valid: false, error: '장바구니가 비어있습니다' };
  }
  
  if (items.some(item => item.quantity <= 0)) {
    return { valid: false, error: '수량이 0인 항목이 있습니다' };
  }
  
  if (totalAmount <= 0) {
    return { valid: false, error: '총 금액이 0원입니다' };
  }
  
  return { valid: true };
};

// Usage
const handleCreateOrder = () => {
  const validation = validateOrder(items, totalAmount);
  
  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }
  
  // Proceed with order creation
  createOrder.mutate(...);
};
```

---

### 3. Token Expiry Check

**Location**: ProtectedRoute, App initialization

**Logic**:
```typescript
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  exp: number;
  sub: string;
  role: string;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    return decoded.exp < currentTime;
  } catch (error) {
    // Invalid token format
    return true;
  }
};
```

**Usage**:
```typescript
// In ProtectedRoute
const token = localStorage.getItem('auth_token');

if (!token || isTokenExpired(token)) {
  localStorage.removeItem('auth_token');
  return <Navigate to="/login" replace />;
}

return <Outlet />;
```

---

### 4. Order Status Badge Logic

**Location**: OrderStatusBadge component

**Status Mapping**:
```typescript
const statusConfig = {
  pending: {
    label: '주문 접수',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
  preparing: {
    label: '조리 중',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  ready: {
    label: '준비 완료',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  served: {
    label: '전달 완료',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
};

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = statusConfig[status];
  
  return (
    <span className={`px-3 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
      {config.label}
    </span>
  );
};
```

---

## API Integration

### 1. API Client Setup

**Base Configuration**:
```typescript
// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
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

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout on 401
      localStorage.removeItem('auth_token');
      localStorage.removeItem('table_id');
      window.location.href = '/login';
    } else {
      // Show error toast with retry button
      toast.error(
        <div>
          <p>{error.response?.data?.message || '요청에 실패했습니다'}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      );
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### 2. TypeScript Type Generation

**Strategy**: openapi-typescript 사용 (자동 생성)

**Current State**: Backend OpenAPI 스키마가 아직 없는 경우 → Mock 타입 먼저 정의

**Mock Types** (temporary):
```typescript
// src/types/api.ts
export interface Menu {
  menuId: string;
  menuName: string;
  price: number;
  description: string;
  imageUrl?: string;
  categoryId: string;
}

export interface CartItem {
  menuId: string;
  menuName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  sessionId: string;
  tableId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  createdAt: string;
}

export interface OrderItem {
  orderItemId: string;
  menuId: string;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface LoginRequest {
  tableId: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tableId: string;
}

export interface CreateOrderRequest {
  sessionId: string;
  items: {
    menuId: string;
    quantity: number;
  }[];
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
}
```

**Future**: Backend OpenAPI 스키마 생성 후 자동 생성으로 교체
```bash
# When backend OpenAPI schema is available
npx openapi-typescript ../table-order-backend/openapi.json -o src/types/api.ts
```

---

### 3. API Modules

**Auth API**:
```typescript
// src/api/authApi.ts
import apiClient from './client';
import { LoginRequest, LoginResponse } from '@/types/api';

export const authApi = {
  login: async (tableId: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/customer/login', {
      tableId,
      password,
    });
    return response.data;
  },
};
```

**Menu API**:
```typescript
// src/api/menuApi.ts
import apiClient from './client';
import { Menu } from '@/types/api';

export const menuApi = {
  getMenus: async (categoryId?: string): Promise<Menu[]> => {
    const params = categoryId ? { category: categoryId } : {};
    const response = await apiClient.get<Menu[]>('/api/menus', { params });
    return response.data;
  },

  getMenuDetail: async (menuId: string): Promise<Menu> => {
    const response = await apiClient.get<Menu>(`/api/menus/${menuId}`);
    return response.data;
  },
};
```

**Order API**:
```typescript
// src/api/orderApi.ts
import apiClient from './client';
import { Order, CreateOrderRequest, CreateOrderResponse } from '@/types/api';

export const orderApi = {
  getOrders: async (sessionId: string): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/api/orders', {
      params: { session_id: sessionId },
    });
    return response.data;
  },

  createOrder: async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await apiClient.post<CreateOrderResponse>('/api/orders', request);
    return response.data;
  },
};
```

---

### 4. Environment Variables

**Configuration**:
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000

# .env.production
VITE_API_BASE_URL=https://api.example.com
```

**Usage**:
```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## Image Loading Strategy

**Strategy**: Lazy loading + Placeholder 조합

**Implementation**:
```typescript
// In MenuItem component
const MenuItem = ({ menu }: { menu: Menu }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="menu-item">
      <img
        src={imageError ? '/placeholder-menu.png' : menu.imageUrl}
        alt={menu.menuName}
        loading="lazy"
        onError={() => setImageError(true)}
      />
      <h3>{menu.menuName}</h3>
      <p>{menu.price.toLocaleString()}원</p>
    </div>
  );
};
```

**Features**:
- `loading="lazy"`: 화면에 보일 때만 로드
- `onError`: 이미지 로드 실패 시 placeholder 표시
- Placeholder 이미지: `/public/placeholder-menu.png`

---

## Offline Mode Handling

**Strategy**: 에러 메시지 표시 (네트워크 연결 필요 안내)

**Implementation**:
```typescript
// In App.tsx
useEffect(() => {
  const handleOffline = () => {
    toast.error('네트워크 연결이 끊어졌습니다. 인터넷 연결을 확인해주세요.');
  };

  const handleOnline = () => {
    toast.success('네트워크 연결이 복구되었습니다.');
    // Optionally refetch data
    queryClient.refetchQueries();
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

### User Flows
- **Auto-Login**: Token check → Login page or Menu page
- **Menu Browsing**: Category filter → Menu list → Detail modal → Add to cart
- **Cart Management**: Adjust quantity → Remove items → Clear cart → Create order
- **Order Tracking**: Polling (30s) → Status updates → Badge display

### Business Logic
- **Cart Calculation**: Zustand store, automatic recalculation
- **Order Validation**: Client-side, 3 rules (not empty, quantity > 0, amount > 0)
- **Token Expiry**: JWT decode, client-side check
- **Status Badge**: Color-coded badges (gray, yellow, green, blue)

### API Integration
- **Axios Client**: Base URL from env, interceptors for auth and errors
- **Type Generation**: Mock types first, openapi-typescript later
- **API Modules**: authApi, menuApi, orderApi
- **Error Handling**: 401 auto-logout, toast with retry button

### Additional Features
- **Image Loading**: Lazy loading + placeholder
- **Offline Mode**: Error message display
- **Environment Config**: .env files for dev/prod

---

**End of User Flow & Business Logic Document**
