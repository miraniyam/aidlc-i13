# Contract/Interface Definition for Unit 3 (Admin Frontend)

## Unit Context

### Stories Implemented
- **US-A01**: 매장 관리자 로그인
- **US-A02**: 실시간 주문 모니터링 대시보드
- **US-A03**: 주문 상세 정보 조회
- **US-A04**: 주문 상태 변경
- **US-A05**: 테이블 세션 종료
- **US-A06**: 메뉴 등록
- **US-A07**: 메뉴 수정
- **US-A08**: 메뉴 삭제
- **US-A09**: 메뉴 이미지 업로드
- **US-A10**: 카테고리 관리
- **US-A11**: 주문 내역 조회
- **US-A12**: 주문 통계 조회

### Dependencies
- **Unit 1 (Backend API)**: 모든 API 엔드포인트 의존
  - Authentication API
  - Dashboard API
  - Order Management API
  - Menu Management API
  - Category Management API
  - Table Management API

### Database Entities
- None (Frontend는 데이터베이스 직접 접근 없음)

### Service Boundaries
- **Presentation Layer**: React Components, Pages, Layouts
- **State Management**: React Query (server state), Zustand (client state)
- **API Client**: Axios-based HTTP client
- **Real-time Communication**: SSE Manager
- **Security**: Input Sanitizer, Rate Limiter, Token Storage
- **Error Handling**: Error Boundary, Error Handler
- **Performance Monitoring**: Performance Monitor

---

## API Client Layer

### AuthAPI

**Purpose**: 인증 관련 API 호출

```typescript
class AuthAPI {
  /**
   * 관리자 로그인
   * @param credentials - 로그인 정보 (store_id, username, password)
   * @returns LoginResponse (token, admin_id, store_name)
   * @throws APIError - 401 (인증 실패), 500 (서버 오류)
   */
  login(credentials: LoginRequest): Promise<LoginResponse>
}
```

---

### DashboardAPI

**Purpose**: 대시보드 데이터 조회

```typescript
class DashboardAPI {
  /**
   * 대시보드 데이터 조회
   * @returns DashboardData (tables, active_sessions, pending_orders)
   * @throws APIError - 401 (인증 필요), 500 (서버 오류)
   */
  getDashboard(): Promise<DashboardData>
}
```

---

### OrderAPI

**Purpose**: 주문 관리 API 호출

```typescript
class OrderAPI {
  /**
   * 테이블별 주문 조회
   * @param tableId - 테이블 ID
   * @returns Order[] (주문 목록)
   * @throws APIError - 404 (테이블 없음), 500 (서버 오류)
   */
  getOrdersByTable(tableId: string): Promise<Order[]>

  /**
   * 주문 상태 변경
   * @param orderId - 주문 ID
   * @param request - 상태 변경 요청 (new_status, version)
   * @returns Order (업데이트된 주문)
   * @throws APIError - 404 (주문 없음), 409 (버전 충돌), 422 (잘못된 상태 전이)
   */
  updateOrderStatus(orderId: string, request: UpdateOrderStatusRequest): Promise<Order>

  /**
   * 주문 내역 조회
   * @param params - 조회 파라미터 (table_id, start_date, end_date)
   * @returns OrderHistory[] (주문 내역 목록)
   * @throws APIError - 400 (잘못된 파라미터), 500 (서버 오류)
   */
  getOrderHistory(params: OrderHistoryParams): Promise<OrderHistory[]>
}
```

---

### TableAPI

**Purpose**: 테이블 관리 API 호출

```typescript
class TableAPI {
  /**
   * 테이블 세션 종료
   * @param sessionId - 세션 ID
   * @param request - 종료 요청 (force 옵션)
   * @returns void
   * @throws APIError - 404 (세션 없음), 409 (미전달 주문 존재), 500 (서버 오류)
   */
  completeSession(sessionId: string, request: CompleteSessionRequest): Promise<void>
}
```

---

### MenuAPI

**Purpose**: 메뉴 관리 API 호출

```typescript
class MenuAPI {
  /**
   * 메뉴 목록 조회
   * @param categoryId - 카테고리 ID (선택적)
   * @returns Menu[] (메뉴 목록)
   * @throws APIError - 500 (서버 오류)
   */
  getMenus(categoryId?: string): Promise<Menu[]>

  /**
   * 메뉴 생성
   * @param request - 메뉴 생성 요청
   * @returns Menu (생성된 메뉴)
   * @throws APIError - 400 (잘못된 데이터), 409 (중복 메뉴명), 500 (서버 오류)
   */
  createMenu(request: CreateMenuRequest): Promise<Menu>

  /**
   * 메뉴 수정
   * @param menuId - 메뉴 ID
   * @param request - 메뉴 수정 요청
   * @returns Menu (수정된 메뉴)
   * @throws APIError - 404 (메뉴 없음), 409 (중복 메뉴명), 500 (서버 오류)
   */
  updateMenu(menuId: string, request: UpdateMenuRequest): Promise<Menu>

  /**
   * 메뉴 삭제
   * @param menuId - 메뉴 ID
   * @returns void
   * @throws APIError - 404 (메뉴 없음), 409 (주문 내역 존재), 500 (서버 오류)
   */
  deleteMenu(menuId: string): Promise<void>

  /**
   * 이미지 업로드
   * @param file - 이미지 파일
   * @param onProgress - 업로드 진행률 콜백
   * @returns string (이미지 URL)
   * @throws APIError - 400 (잘못된 파일), 413 (파일 크기 초과), 500 (서버 오류)
   */
  uploadImage(file: File, onProgress?: (progress: UploadProgress) => void): Promise<string>
}
```

---

### CategoryAPI

**Purpose**: 카테고리 관리 API 호출

```typescript
class CategoryAPI {
  /**
   * 카테고리 목록 조회
   * @returns MenuCategory[] (카테고리 목록)
   * @throws APIError - 500 (서버 오류)
   */
  getCategories(): Promise<MenuCategory[]>

  /**
   * 카테고리 생성
   * @param request - 카테고리 생성 요청
   * @returns MenuCategory (생성된 카테고리)
   * @throws APIError - 400 (잘못된 데이터), 409 (중복 카테고리명), 500 (서버 오류)
   */
  createCategory(request: CreateCategoryRequest): Promise<MenuCategory>

  /**
   * 카테고리 수정
   * @param categoryId - 카테고리 ID
   * @param request - 카테고리 수정 요청
   * @returns MenuCategory (수정된 카테고리)
   * @throws APIError - 404 (카테고리 없음), 409 (중복 카테고리명), 500 (서버 오류)
   */
  updateCategory(categoryId: string, request: UpdateCategoryRequest): Promise<MenuCategory>

  /**
   * 카테고리 삭제
   * @param categoryId - 카테고리 ID
   * @returns void
   * @throws APIError - 404 (카테고리 없음), 409 (메뉴 존재), 500 (서버 오류)
   */
  deleteCategory(categoryId: string): Promise<void>
}
```

---

## State Management Layer

### useAuthStore (Zustand)

**Purpose**: 인증 상태 관리

```typescript
interface AuthState {
  isAuthenticated: boolean
  adminId: string | null
  storeName: string | null
  
  /**
   * 로그인
   * @param token - JWT 토큰
   * @param adminId - 관리자 ID
   * @param storeName - 매장명
   */
  login(token: string, adminId: string, storeName: string): void
  
  /**
   * 로그아웃
   */
  logout(): void
  
  /**
   * 인증 상태 확인 (자동 로그인, 자동 로그아웃)
   */
  checkAuth(): void
}
```

---

### useUIStore (Zustand)

**Purpose**: UI 상태 관리

```typescript
interface UIState {
  isSidebarCollapsed: boolean
  activeModal: string | null
  
  /**
   * 사이드바 토글
   */
  toggleSidebar(): void
  
  /**
   * 모달 열기
   * @param modalId - 모달 ID
   */
  openModal(modalId: string): void
  
  /**
   * 모달 닫기
   */
  closeModal(): void
}
```

---

## Real-time Communication Layer

### useSSEManager (Custom Hook)

**Purpose**: SSE 연결 관리

```typescript
interface SSEManagerOptions {
  url: string
  onMessage: (event: MessageEvent) => void
  onError?: (error: Event) => void
  maxReconnectDelay?: number
}

interface SSEManagerReturn {
  status: 'connected' | 'disconnected' | 'reconnecting'
}

/**
 * SSE 연결 관리 Hook
 * @param options - SSE 옵션
 * @returns SSE 상태
 */
function useSSEManager(options: SSEManagerOptions): SSEManagerReturn
```

---

### useHybridSync (Custom Hook)

**Purpose**: SSE + 주기적 동기화 하이브리드 관리

```typescript
interface HybridSyncReturn {
  sseStatus: 'connected' | 'disconnected' | 'reconnecting'
}

/**
 * 하이브리드 동기화 Hook
 * @param token - JWT 토큰
 * @returns SSE 상태
 */
function useHybridSync(token: string): HybridSyncReturn
```

---

## Security Layer

### sanitizeInput

**Purpose**: 사용자 입력 검증 및 정제

```typescript
/**
 * 입력 문자열 정제 (XSS 방지)
 * @param input - 입력 문자열
 * @returns 정제된 문자열
 */
function sanitizeInput(input: string): string

/**
 * 폼 데이터 정제
 * @param data - 폼 데이터 객체
 * @returns 정제된 폼 데이터
 */
function sanitizeFormData<T extends Record<string, any>>(data: T): T
```

---

### RateLimiter

**Purpose**: API 요청 속도 제한

```typescript
class RateLimiter {
  /**
   * 생성자
   * @param limit - 제한 횟수 (예: 10)
   * @param window - 시간 윈도우 (ms, 예: 1000)
   */
  constructor(limit: number, window: number)
  
  /**
   * 요청 가능 여부 확인
   * @returns true (가능), false (제한 초과)
   */
  canMakeRequest(): boolean
  
  /**
   * 남은 요청 횟수 조회
   * @returns 남은 요청 횟수
   */
  getRemainingRequests(): number
}
```

---

### TokenStorage

**Purpose**: 안전한 토큰 저장 및 관리

```typescript
const TokenStorage = {
  /**
   * 토큰 저장
   * @param key - 키
   * @param value - 값
   */
  set(key: string, value: string): void
  
  /**
   * 토큰 조회
   * @param key - 키
   * @returns 값 또는 null
   */
  get(key: string): string | null
  
  /**
   * 토큰 삭제
   * @param key - 키
   */
  remove(key: string): void
  
  /**
   * 모든 토큰 삭제
   */
  clear(): void
}
```

---

## Error Handling Layer

### ErrorBoundary (React Component)

**Purpose**: React 컴포넌트 에러 격리

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /**
   * 에러 발생 시 상태 업데이트
   * @param error - 에러 객체
   * @returns 새로운 상태
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState
  
  /**
   * 에러 로깅
   * @param error - 에러 객체
   * @param errorInfo - 에러 정보
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void
  
  /**
   * 에러 상태 리셋
   */
  handleReset(): void
}
```

---

### handleAPIError

**Purpose**: API 에러 처리

```typescript
/**
 * API 에러 처리 (Toast 또는 Modal 표시)
 * @param error - 에러 객체
 */
function handleAPIError(error: any): void

/**
 * 에러 로깅
 * @param error - 에러 객체
 * @param context - 컨텍스트 정보
 */
function logError(error: Error, context?: any): void
```

---

## Performance Monitoring Layer

### measurePerformance

**Purpose**: 성능 측정 및 로깅

```typescript
/**
 * 함수 실행 시간 측정
 * @param name - 측정 이름
 * @param fn - 측정할 함수
 * @returns 실행 시간 (ms)
 */
function measurePerformance(name: string, fn: () => void): number

/**
 * 페이지 로드 성능 측정
 */
function measurePageLoad(): void

/**
 * API 호출 시간 측정
 * @param name - API 이름
 * @param apiCall - API 호출 함수
 * @returns API 응답
 */
function measureAPICall<T>(name: string, apiCall: () => Promise<T>): Promise<T>
```

---

## Utility Layer

### uploadImage

**Purpose**: 이미지 업로드 및 미리보기

```typescript
interface UploadProgress {
  percent: number
  status: 'uploading' | 'success' | 'error'
}

/**
 * 이미지 업로드
 * @param file - 이미지 파일
 * @param onProgress - 진행률 콜백
 * @returns 이미지 URL
 * @throws Error - 파일 검증 실패, 업로드 실패
 */
function uploadImage(file: File, onProgress?: (progress: UploadProgress) => void): Promise<string>

/**
 * 이미지 미리보기 생성
 * @param file - 이미지 파일
 * @returns Data URL
 */
function createImagePreview(file: File): Promise<string>
```

---

### Date Formatter

**Purpose**: 날짜/시간 포맷팅

```typescript
/**
 * 날짜 포맷팅 (YYYY-MM-DD HH:mm:ss)
 * @param date - ISO 8601 날짜 문자열
 * @returns 포맷된 날짜
 */
function formatDate(date: string): string

/**
 * 상대 시간 포맷팅 (예: "3분 전")
 * @param date - ISO 8601 날짜 문자열
 * @returns 상대 시간
 */
function formatRelativeTime(date: string): string

/**
 * 날짜 범위 포맷팅
 * @param start - 시작 날짜
 * @param end - 종료 날짜
 * @returns 포맷된 날짜 범위
 */
function formatDateRange(start: string, end: string): string
```

---

## React Query Hooks

### useLogin (Mutation)

```typescript
/**
 * 로그인 Mutation Hook
 * @returns Mutation 객체
 */
function useLogin(): UseMutationResult<LoginResponse, APIError, LoginRequest>
```

---

### useDashboard (Query)

```typescript
/**
 * 대시보드 데이터 Query Hook
 * @returns Query 객체
 */
function useDashboard(): UseQueryResult<DashboardData, APIError>
```

---

### useOrdersByTable (Query)

```typescript
/**
 * 테이블별 주문 Query Hook
 * @param tableId - 테이블 ID
 * @returns Query 객체
 */
function useOrdersByTable(tableId: string): UseQueryResult<Order[], APIError>
```

---

### useUpdateOrderStatus (Mutation)

```typescript
/**
 * 주문 상태 변경 Mutation Hook
 * @returns Mutation 객체
 */
function useUpdateOrderStatus(): UseMutationResult<Order, APIError, { orderId: string; request: UpdateOrderStatusRequest }>
```

---

### useCompleteSession (Mutation)

```typescript
/**
 * 세션 종료 Mutation Hook
 * @returns Mutation 객체
 */
function useCompleteSession(): UseMutationResult<void, APIError, { sessionId: string; request: CompleteSessionRequest }>
```

---

### useMenus (Query)

```typescript
/**
 * 메뉴 목록 Query Hook
 * @param categoryId - 카테고리 ID (선택적)
 * @returns Query 객체
 */
function useMenus(categoryId?: string): UseQueryResult<Menu[], APIError>
```

---

### useCreateMenu (Mutation)

```typescript
/**
 * 메뉴 생성 Mutation Hook
 * @returns Mutation 객체
 */
function useCreateMenu(): UseMutationResult<Menu, APIError, CreateMenuRequest>
```

---

### useUpdateMenu (Mutation)

```typescript
/**
 * 메뉴 수정 Mutation Hook
 * @returns Mutation 객체
 */
function useUpdateMenu(): UseMutationResult<Menu, APIError, { menuId: string; request: UpdateMenuRequest }>
```

---

### useDeleteMenu (Mutation)

```typescript
/**
 * 메뉴 삭제 Mutation Hook
 * @returns Mutation 객체
 */
function useDeleteMenu(): UseMutationResult<void, APIError, string>
```

---

### useCategories (Query)

```typescript
/**
 * 카테고리 목록 Query Hook
 * @returns Query 객체
 */
function useCategories(): UseQueryResult<MenuCategory[], APIError>
```

---

### useCreateCategory (Mutation)

```typescript
/**
 * 카테고리 생성 Mutation Hook
 * @returns Mutation 객체
 */
function useCreateCategory(): UseMutationResult<MenuCategory, APIError, CreateCategoryRequest>
```

---

### useUpdateCategory (Mutation)

```typescript
/**
 * 카테고리 수정 Mutation Hook
 * @returns Mutation 객체
 */
function useUpdateCategory(): UseMutationResult<MenuCategory, APIError, { categoryId: string; request: UpdateCategoryRequest }>
```

---

### useDeleteCategory (Mutation)

```typescript
/**
 * 카테고리 삭제 Mutation Hook
 * @returns Mutation 객체
 */
function useDeleteCategory(): UseMutationResult<void, APIError, string>
```

---

### useOrderHistory (Query)

```typescript
/**
 * 주문 내역 Query Hook
 * @param params - 조회 파라미터
 * @returns Query 객체
 */
function useOrderHistory(params: OrderHistoryParams): UseQueryResult<OrderHistory[], APIError>
```

---

## Summary

### API Client Layer (6 classes)
- AuthAPI, DashboardAPI, OrderAPI, TableAPI, MenuAPI, CategoryAPI

### State Management Layer (2 stores)
- useAuthStore, useUIStore

### Real-time Communication Layer (2 hooks)
- useSSEManager, useHybridSync

### Security Layer (3 utilities)
- sanitizeInput, RateLimiter, TokenStorage

### Error Handling Layer (2 utilities)
- ErrorBoundary, handleAPIError

### Performance Monitoring Layer (3 functions)
- measurePerformance, measurePageLoad, measureAPICall

### Utility Layer (2 modules)
- uploadImage, Date Formatter

### React Query Hooks (14 hooks)
- useLogin, useDashboard, useOrdersByTable, useUpdateOrderStatus, useCompleteSession
- useMenus, useCreateMenu, useUpdateMenu, useDeleteMenu
- useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory
- useOrderHistory

**Total**: 32 contracts/interfaces defined

---

**All contracts and interfaces are defined and ready for TDD implementation.**
