# Business Logic Model - Unit 3 (Admin Frontend)

## Overview

Admin Frontend의 비즈니스 로직을 모델링합니다. 각 기능별로 UI 흐름, 상태 관리, 데이터 처리 로직을 정의합니다.

---

## 1. Authentication Flow

### 1.1 Login Process

**Trigger**: 사용자가 로그인 화면에서 "로그인" 버튼 클릭

**Input**:
- store_id (매장 식별자)
- username (사용자명)
- password (비밀번호)

**Process**:
1. 폼 검증 (필수 필드 확인)
2. POST /api/admin/login 호출
3. 성공 시:
   - JWT 토큰 localStorage 저장 (key: 'admin_token')
   - Admin 정보 localStorage 저장 (key: 'admin_user')
   - Store 정보 localStorage 저장 (key: 'store_info')
   - 대시보드 페이지로 리다이렉트
4. 실패 시:
   - 에러 메시지 표시 (Toast)
   - 폼 유지

**Output**:
- localStorage: admin_token, admin_user, store_info
- Navigation: /dashboard

**State Management**:
```typescript
const [formData, setFormData] = useState({
  store_id: '',
  username: '',
  password: ''
});
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

---

### 1.2 Token Management

**Token Storage**:
- Key: 'admin_token'
- Value: JWT string
- Expiry: 16 hours (토큰 자체에 exp 포함)

**Token Usage**:
- 모든 API 요청 헤더에 포함: `Authorization: Bearer <token>`

**Token Expiry Handling** (Q12: Auto Logout):
1. API 호출 시 401 Unauthorized 응답 수신
2. localStorage 토큰 삭제
3. 로그인 페이지로 리다이렉트
4. Toast 메시지: "세션이 만료되었습니다. 다시 로그인해주세요."

**Axios Interceptor**:
```typescript
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

### 1.3 Auto-Login (Session Persistence)

**Trigger**: 페이지 로드 또는 새로고침

**Process**:
1. localStorage에서 admin_token 확인
2. 토큰 존재 시:
   - Axios 기본 헤더에 토큰 설정
   - 대시보드로 자동 이동
3. 토큰 없으면:
   - 로그인 페이지 유지

**Implementation** (React Router):
```typescript
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/login" />;
};
```

---

## 2. Dashboard Real-time Update Logic

### 2.1 Initial Load

**Trigger**: 대시보드 페이지 진입

**Process**:
1. GET /api/admin/dashboard 호출 (모든 테이블 + 주문 데이터)
2. DashboardState 초기화
3. SSE 연결 시작
4. 주기적 동기화 타이머 시작 (5분)

**State**:
```typescript
const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
```

---

### 2.2 SSE Connection Management (Q3: Auto-reconnect with exponential backoff)

**Connection Lifecycle**:

**1. Initial Connection**:
```typescript
const eventSource = new EventSource('/api/admin/orders/stream', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**2. Event Handlers**:
```typescript
eventSource.onmessage = (event) => {
  const sseEvent: SSEEvent = JSON.parse(event.data);
  handleSSEEvent(sseEvent);
};

eventSource.onerror = (error) => {
  handleSSEError(error);
};
```

**3. Reconnection Logic** (Exponential Backoff):
```typescript
let reconnectAttempts = 0;
const maxReconnectDelay = 30000; // 30 seconds

const reconnect = () => {
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), maxReconnectDelay);
  
  setTimeout(() => {
    reconnectAttempts++;
    connectSSE();
  }, delay);
};
```

**4. Connection State**:
```typescript
const [sseState, setSSEState] = useState<SSEConnectionState>({
  status: 'disconnected',
  reconnectAttempts: 0,
  lastEventTime: null
});
```

---

### 2.3 Real-time Update Strategy (Q2: Hybrid)

**Strategy**: SSE 실시간 업데이트 + 5분마다 전체 동기화

**SSE Event Handling**:

**OrderCreatedEvent**:
```typescript
const handleOrderCreated = (event: OrderCreatedEvent) => {
  setDashboardData(prev => {
    const tableIndex = prev.tables.findIndex(t => t.table.table_id === event.data.table_id);
    
    if (tableIndex === -1) return prev;
    
    const updatedTables = [...prev.tables];
    updatedTables[tableIndex].orders.push(event.data);
    updatedTables[tableIndex].total_amount += event.data.total_amount;
    
    return { ...prev, tables: updatedTables };
  });
  
  // Visual + Sound notification (Q14)
  playNotificationSound();
  highlightTableCard(event.data.table_id);
};
```

**OrderStatusChangedEvent**:
```typescript
const handleOrderStatusChanged = (event: OrderStatusChangedEvent) => {
  setDashboardData(prev => {
    const tableIndex = prev.tables.findIndex(t => t.table.table_id === event.data.table_id);
    
    if (tableIndex === -1) return prev;
    
    const updatedTables = [...prev.tables];
    const orderIndex = updatedTables[tableIndex].orders.findIndex(
      o => o.order_id === event.data.order_id
    );
    
    if (orderIndex !== -1) {
      updatedTables[tableIndex].orders[orderIndex].status = event.data.new_status;
      updatedTables[tableIndex].orders[orderIndex].updated_at = event.data.updated_at;
    }
    
    return { ...prev, tables: updatedTables };
  });
};
```

**Periodic Sync** (Q10: Periodic Refresh - 5분):
```typescript
useEffect(() => {
  const syncInterval = setInterval(() => {
    fetchDashboardData(); // Full refresh
    setLastSyncTime(new Date().toISOString());
  }, 5 * 60 * 1000); // 5 minutes
  
  return () => clearInterval(syncInterval);
}, []);
```

**Manual Refresh Button**:
```typescript
const handleManualRefresh = async () => {
  await fetchDashboardData();
  setLastSyncTime(new Date().toISOString());
  showToast('대시보드가 새로고침되었습니다.', 'info');
};
```

---

### 2.4 Table Card Display Logic (Q4: Standard)

**Display Data**:
- 테이블 번호
- 총 주문액
- 최신 주문 3개
- 주문 개수

**Rendering Logic**:
```typescript
const TableCard = ({ tableData }: { tableData: TableWithOrders }) => {
  const latestOrders = tableData.orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);
  
  return (
    <Card>
      <CardHeader>
        <h3>테이블 {tableData.table.table_number}</h3>
        <Badge>{tableData.orders.length}개 주문</Badge>
      </CardHeader>
      <CardBody>
        <p>총 주문액: {tableData.total_amount.toLocaleString()}원</p>
        <OrderList orders={latestOrders} />
        {tableData.orders.length > 3 && (
          <Button onClick={() => openOrderDetail(tableData)}>
            전체 보기 ({tableData.orders.length}개)
          </Button>
        )}
      </CardBody>
    </Card>
  );
};
```

---

## 3. Order Management Logic

### 3.1 Order Detail Modal (Q15: Table Session Orders)

**Trigger**: 테이블 카드 클릭

**Data Scope**: 현재 세션의 모든 주문 (과거 세션 제외)

**Process**:
1. GET /api/admin/orders?table_id={table_id}&session_id={session_id}
2. 모달 열기
3. 주문 목록 표시 (시간 역순)

**Modal Content**:
- 테이블 번호
- 세션 시작 시간
- 모든 주문 목록 (상세)
- 각 주문별 액션 버튼 (상태 변경, 삭제)

---

### 3.2 Order Status Transition (Q5: Hybrid Validation)

**Frontend Validation**:
```typescript
const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  const transitions: Record<OrderStatus, OrderStatus | null> = {
    'pending': 'preparing',
    'preparing': 'cooked',
    'cooked': 'delivered',
    'delivered': null
  };
  
  return transitions[currentStatus];
};

const canTransition = (currentStatus: OrderStatus): boolean => {
  return getNextStatus(currentStatus) !== null;
};
```

**UI Rendering**:
```typescript
const OrderStatusButton = ({ order }: { order: Order }) => {
  const nextStatus = getNextStatus(order.status);
  
  if (!nextStatus) {
    return <Badge>전달완료</Badge>;
  }
  
  return (
    <Button onClick={() => handleStatusChange(order.order_id, nextStatus)}>
      {getStatusLabel(nextStatus)}로 변경
    </Button>
  );
};
```

**API Call**:
```typescript
const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
  // Confirmation dialog (Q11: Custom Modal)
  const confirmed = await showConfirmModal(
    '주문 상태 변경',
    `주문 상태를 "${getStatusLabel(newStatus)}"로 변경하시겠습니까?`
  );
  
  if (!confirmed) return;
  
  try {
    await axios.patch(`/api/admin/orders/${orderId}/status`, { 
      status: newStatus
    });
    showToast('주문 상태가 변경되었습니다.', 'success');
    // SSE will update the UI
  } catch (error) {
    handleAPIError(error); // Q7: Combination error handling
  }
};
```

**Note**: Backend에 Optimistic Locking 미구현 (version 충돌 처리 제거)

---

### 3.3 Order Deletion

**Trigger**: 주문 상세 모달에서 "삭제" 버튼 클릭

**Process**:
1. Confirmation dialog (Q11: Custom Modal)
2. DELETE /api/admin/orders/{order_id}
3. 성공 시:
   - 로컬 상태에서 주문 제거
   - 총 주문액 재계산
   - Toast 메시지
4. 실패 시:
   - Error handling (Q7)

```typescript
const handleOrderDelete = async (orderId: string) => {
  const confirmed = await showConfirmModal(
    '주문 삭제',
    '이 주문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
  );
  
  if (!confirmed) return;
  
  try {
    await axios.delete(`/api/admin/orders/${orderId}`);
    
    // Update local state
    setDashboardData(prev => {
      const updatedTables = prev.tables.map(table => ({
        ...table,
        orders: table.orders.filter(o => o.order_id !== orderId),
        total_amount: table.orders
          .filter(o => o.order_id !== orderId)
          .reduce((sum, o) => sum + o.total_amount, 0)
      }));
      
      return { ...prev, tables: updatedTables };
    });
    
    showToast('주문이 삭제되었습니다.', 'success');
  } catch (error) {
    handleAPIError(error);
  }
};
```

---

## 4. Table Session Management Logic

### 4.1 Complete Session (이용 완료)

**Trigger**: 테이블 카드에서 "이용 완료" 버튼 클릭

**Precondition Check**:
```typescript
const canCompleteSession = (orders: Order[]): { 
  canComplete: boolean; 
  undeliveredCount: number;
} => {
  const undeliveredOrders = orders.filter(o => o.status !== 'delivered');
  
  return {
    canComplete: undeliveredOrders.length === 0,
    undeliveredCount: undeliveredOrders.length
  };
};
```

**Process**:
1. 미전달 주문 체크
2. 미전달 주문 있으면:
   - 경고 모달 표시: "N개의 주문이 아직 전달되지 않았습니다. 계속하시겠습니까?"
   - 사용자 선택: "취소" 또는 "강제 종료"
3. 미전달 주문 없거나 강제 종료 선택 시:
   - Confirmation dialog (Q11: Custom Modal)
   - POST /api/admin/tables/{table_id}/complete-session (force=true if 강제)
4. 성공 시:
   - 해당 테이블의 주문 목록 0으로 리셋
   - 총 주문액 0으로 리셋
   - 세션 상태 'completed'로 변경
   - Toast 메시지
5. 실패 시:
   - Error handling (Q7)

```typescript
const handleCompleteSession = async (tableId: string, orders: Order[]) => {
  // Step 1: Check undelivered orders
  const { canComplete, undeliveredCount } = canCompleteSession(orders);
  
  let force = false;
  
  if (!canComplete) {
    // Step 2: Warning modal
    const continueAnyway = await showWarningModal(
      '미전달 주문 있음',
      `${undeliveredCount}개의 주문이 아직 전달되지 않았습니다. 계속하시겠습니까?`,
      { confirmText: '강제 종료', cancelText: '취소' }
    );
    
    if (!continueAnyway) return;
    
    force = true;
  }
  
  // Step 3: Confirmation
  const confirmed = await showConfirmModal(
    '테이블 이용 완료',
    '이 테이블의 세션을 종료하시겠습니까? 모든 주문이 과거 내역으로 이동합니다.'
  );
  
  if (!confirmed) return;
  
  try {
    const response = await axios.post(`/api/admin/tables/${tableId}/complete-session`, {
      force
    });
    
    // Update local state
    setDashboardData(prev => {
      const updatedTables = prev.tables.map(table => 
        table.table.table_id === tableId
          ? { ...table, orders: [], total_amount: 0, session: null }
          : table
      );
      
      return { ...prev, tables: updatedTables };
    });
    
    const message = force
      ? `세션이 종료되었습니다. ${response.data.moved_orders_count}개 주문 (미전달 ${response.data.undelivered_orders_count}개 포함)이 과거 내역으로 이동했습니다.`
      : `세션이 종료되었습니다. ${response.data.moved_orders_count}개 주문이 과거 내역으로 이동했습니다.`;
    
    showToast(message, 'success');
  } catch (error) {
    handleAPIError(error);
  }
};
```

---

### 4.2 Order History Query (Q8: Last 7 Days)

**Trigger**: 테이블 카드에서 "과거 내역" 버튼 클릭

**Default Date Range**: 최근 7일

**Process**:
1. 모달 열기
2. 기본 날짜 범위 설정 (오늘 - 7일 ~ 오늘)
3. GET /api/admin/tables/{table_id}/order-history?from={from}&to={to}
4. 과거 주문 목록 표시

```typescript
const openOrderHistoryModal = (tableId: string) => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  setOrderHistoryFilter({
    table_id: tableId,
    from_date: sevenDaysAgo.toISOString().split('T')[0],
    to_date: today.toISOString().split('T')[0]
  });
  
  fetchOrderHistory(tableId, sevenDaysAgo, today);
  setModalState({ isOpen: true, type: 'orderHistory', data: { tableId } });
};
```

**Date Filter**:
- Date picker for from_date and to_date
- Validation: from_date ≤ to_date
- Max range: 6 months (요구사항)

---

## 5. Menu Management Logic

### 5.1 Menu List Display (Q13: List with Thumbnails)

**Layout**: 리스트 형태 + 썸네일 이미지

**Grouping**: 카테고리별 그룹핑

**Rendering**:
```typescript
const MenuList = ({ menus, categories }: MenuListProps) => {
  const groupedMenus = categories.map(category => ({
    category,
    menus: menus.filter(m => m.category_id === category.category_id)
  }));
  
  return (
    <div>
      {groupedMenus.map(group => (
        <div key={group.category.category_id}>
          <h3>{group.category.category_name}</h3>
          <List>
            {group.menus.map(menu => (
              <ListItem key={menu.menu_id}>
                <Thumbnail src={menu.image_url} alt={menu.menu_name} />
                <MenuInfo>
                  <h4>{menu.menu_name}</h4>
                  <p>{menu.price.toLocaleString()}원</p>
                  <p>{menu.description}</p>
                </MenuInfo>
                <Actions>
                  <Button onClick={() => openMenuEditForm(menu)}>수정</Button>
                  <Button onClick={() => handleMenuDelete(menu.menu_id)}>삭제</Button>
                </Actions>
              </ListItem>
            ))}
          </List>
        </div>
      ))}
    </div>
  );
};
```

---

### 5.2 Menu Create/Update (Q6: Preview + Upload)

**Image Upload Flow**:

**1. File Selection**:
```typescript
const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  
  if (!file) return;
  
  // Validation
  if (file.size > 5 * 1024 * 1024) {
    showToast('이미지 파일 크기는 5MB 이하여야 합니다.', 'error');
    return;
  }
  
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showToast('이미지 형식은 JPG, PNG, WEBP만 가능합니다.', 'error');
    return;
  }
  
  // Preview
  const reader = new FileReader();
  reader.onload = (e) => {
    setFormData(prev => ({
      ...prev,
      image: file,
      imagePreview: e.target?.result as string
    }));
  };
  reader.readAsDataURL(file);
};
```

**2. Form Submission**:
```typescript
const handleMenuSubmit = async (formData: MenuFormData) => {
  // Validation
  const validationResult = validateMenuForm(formData);
  if (!validationResult.isValid) {
    showValidationErrors(validationResult.errors);
    return;
  }
  
  // Prepare multipart/form-data
  const formDataObj = new FormData();
  formDataObj.append('category_id', formData.category_id);
  formDataObj.append('menu_name', formData.menu_name);
  formDataObj.append('price', formData.price.toString());
  formDataObj.append('description', formData.description);
  
  if (formData.image) {
    formDataObj.append('image', formData.image);
  }
  
  try {
    if (isEditMode) {
      await axios.patch(`/api/admin/menus/${menuId}`, formDataObj);
      showToast('메뉴가 수정되었습니다.', 'success');
    } else {
      await axios.post('/api/admin/menus', formDataObj);
      showToast('메뉴가 등록되었습니다.', 'success');
    }
    
    closeModal();
    refetchMenus();
  } catch (error) {
    handleAPIError(error);
  }
};
```

---

### 5.3 Category Management (Q9: Separate Category Management)

**Location**: 별도 관리 화면 (/menu/categories)

**CRUD Operations**:
- 카테고리 목록 조회
- 카테고리 생성
- 카테고리 수정
- 카테고리 삭제 (메뉴가 없는 경우만)

**Create Category**:
```typescript
const handleCategoryCreate = async (formData: CategoryFormData) => {
  try {
    await axios.post('/api/admin/categories', formData);
    showToast('카테고리가 생성되었습니다.', 'success');
    refetchCategories();
  } catch (error) {
    handleAPIError(error);
  }
};
```

**Delete Category with Validation**:
```typescript
const handleCategoryDelete = async (categoryId: string) => {
  // Frontend pre-check
  const menusInCategory = menus.filter(m => m.category_id === categoryId);
  
  if (menusInCategory.length > 0) {
    showErrorModal(
      '카테고리 삭제 불가',
      `이 카테고리에 ${menusInCategory.length}개의 메뉴가 있어 삭제할 수 없습니다. 먼저 메뉴를 다른 카테고리로 이동하거나 삭제해주세요.`
    );
    return;
  }
  
  const confirmed = await showConfirmModal(
    '카테고리 삭제',
    '이 카테고리를 삭제하시겠습니까?'
  );
  
  if (!confirmed) return;
  
  try {
    await axios.delete(`/api/admin/categories/${categoryId}`);
    showToast('카테고리가 삭제되었습니다.', 'success');
    refetchCategories();
  } catch (error) {
    handleAPIError(error);
  }
};
```

---

### 5.4 Menu Deletion with Active Order Check

**Frontend Pre-check**:
```typescript
const handleMenuDelete = async (menuId: string) => {
  // Step 1: Check if menu is in active orders
  const activeOrders = dashboardData.tables.flatMap(t => t.orders);
  const hasActiveOrder = activeOrders.some(order => 
    order.items.some(item => item.menu_id === menuId)
  );
  
  if (hasActiveOrder) {
    showErrorModal(
      '메뉴 삭제 불가',
      '이 메뉴는 현재 활성 주문에 포함되어 있어 삭제할 수 없습니다. 모든 주문이 완료된 후 삭제해주세요.'
    );
    return;
  }
  
  // Step 2: Confirmation
  const confirmed = await showConfirmModal(
    '메뉴 삭제',
    '이 메뉴를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
  );
  
  if (!confirmed) return;
  
  // Step 3: Delete
  try {
    await axios.delete(`/api/admin/menus/${menuId}`);
    showToast('메뉴가 삭제되었습니다.', 'success');
    refetchMenus();
  } catch (error) {
    handleAPIError(error);
  }
};
```

**Note**: Backend에서도 동일한 검증 수행, Frontend는 UX 향상 목적

---

## 6. Error Handling Strategy (Q7: Combination)

### 6.1 Error Classification

**Toast Notifications** (일반 에러):
- 네트워크 에러
- 폼 검증 에러
- 일반 API 에러 (400, 404)

**Modal Dialogs** (중요 에러):
- 인증 에러 (401) - 로그인 페이지로 리다이렉트 전 알림
- 권한 에러 (403)
- 서버 에러 (500)
- 비즈니스 로직 에러 (주문 삭제 실패 등)

---

### 6.2 Error Handler

```typescript
const handleAPIError = (error: any) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || '오류가 발생했습니다.';
    
    if (status === 401) {
      // Handled by interceptor
      return;
    }
    
    if (status === 403) {
      showErrorModal('권한 없음', '이 작업을 수행할 권한이 없습니다.');
      return;
    }
    
    if (status === 500) {
      showErrorModal('서버 오류', '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    
    // Default: Toast
    showToast(message, 'error');
  } else {
    showToast('알 수 없는 오류가 발생했습니다.', 'error');
  }
};
```

---

## 7. Notification Strategy (Q14: Visual + Sound)

### 7.1 Visual Notification

**New Order**:
- 테이블 카드 배경색 변경 (예: 노란색 하이라이트)
- 3초 후 원래 색상으로 복귀
- 애니메이션 효과 (펄스, 바운스)

```typescript
const highlightTableCard = (tableId: string) => {
  const cardElement = document.getElementById(`table-card-${tableId}`);
  
  if (cardElement) {
    cardElement.classList.add('highlight-new-order');
    
    setTimeout(() => {
      cardElement.classList.remove('highlight-new-order');
    }, 3000);
  }
};
```

---

### 7.2 Sound Notification

**Audio File**: notification.mp3 (프로젝트에 포함)

**Play Logic**:
```typescript
const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.volume = 0.5; // 50% volume
  audio.play().catch(error => {
    console.error('Failed to play notification sound:', error);
  });
};
```

**User Preference** (선택적):
- 설정 화면에서 알림 소리 on/off
- localStorage에 저장

---

## Summary

### Business Logic Components
1. **Authentication**: Login, Token Management, Auto-Login
2. **Dashboard**: Initial Load, SSE Connection, Real-time Update, Periodic Sync
3. **Order Management**: Order Detail, Status Transition, Order Deletion
4. **Table Session**: Complete Session, Order History
5. **Menu Management**: Menu List, Menu CRUD, Category Management
6. **Error Handling**: Toast + Modal Combination
7. **Notification**: Visual + Sound

### Key Patterns
- **State Management**: React Query (server) + useState (local)
- **Real-time**: SSE + Exponential Backoff Reconnection
- **Data Sync**: Hybrid (SSE + 5분 주기적 동기화)
- **Error Handling**: Combination (Toast + Modal)
- **Validation**: Frontend + Backend Hybrid

---

**All business logic is modeled and ready for business rules definition.**
