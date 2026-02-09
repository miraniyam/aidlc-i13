# Code Generation Plan - Unit 4: SuperAdmin Frontend

## Unit Context

### Unit Information
- **Unit Name**: SuperAdmin Frontend
- **Repository**: `table-order-superadmin-ui`
- **Technology Stack**: React 18+, TypeScript, Vite, React Query, Axios, Tailwind CSS
- **Code Location**: `/home/aiadmin/kiro/aidlc-i13/table-order-superadmin-ui/`

### Assigned Stories (5)
1. **US-SA01**: 슈퍼 관리자 로그인
2. **US-SA02**: 매장 관리자 계정 생성
3. **US-SA03**: 매장 관리자 계정 조회
4. **US-SA04**: 매장 관리자 계정 비활성화
5. **US-SA05**: 매장 관리자 계정 활성화

### Dependencies
- **Upstream**: Unit 1 (Backend API) - 현재 미완료
- **Strategy**: Mock API 레이어로 분리하여 나중에 실제 API로 교체 가능하도록 설계

### Mock API Strategy
- 환경변수 `VITE_USE_MOCK_API`로 Mock/Real 전환
- `src/api/` 디렉토리에 API 인터페이스 정의
- `src/api/mock/` 디렉토리에 Mock 구현
- 나중에 Backend 완료 시 Mock 제거하고 Real API 사용

---

## Code Generation Steps

### Phase 1: Project Setup

#### Step 1: Initialize Vite React TypeScript Project
- [x] Create Vite project with React + TypeScript template
- [x] Configure project structure
- **Output**: `table-order-superadmin-ui/` 기본 구조

#### Step 2: Install Dependencies
- [x] Install core dependencies (react-query, axios, react-router-dom)
- [x] Install Tailwind CSS
- [x] Configure Tailwind
- **Output**: `package.json`, `tailwind.config.js`, `postcss.config.js`

#### Step 3: Configure Environment Variables
- [x] Create `.env.example` with `VITE_API_BASE_URL`, `VITE_USE_MOCK_API`
- [x] Create `.env.development` with mock enabled
- **Output**: `.env.example`, `.env.development`

---

### Phase 2: Core Infrastructure

#### Step 4: Create TypeScript Types
- [x] Define Admin type (id, store_id, username, is_active, role, created_at)
- [x] Define API request/response types
- [x] Define Auth types (LoginRequest, LoginResponse, AuthState)
- **Output**: `src/types/api.ts`
- **Stories**: US-SA01, US-SA02, US-SA03, US-SA04, US-SA05

#### Step 5: Create API Client
- [x] Create Axios instance with base URL from env
- [x] Add JWT token interceptor
- [x] Add error handling interceptor
- **Output**: `src/api/client.ts`
- **Stories**: All

#### Step 6: Create Mock API Implementation
- [x] Implement mock login (US-SA01)
- [x] Implement mock admin CRUD (US-SA02, US-SA03, US-SA04, US-SA05)
- [x] Add mock data storage (in-memory)
- **Output**: `src/api/mock/adminApi.mock.ts`, `src/api/mock/mockData.ts`
- **Stories**: US-SA01, US-SA02, US-SA03, US-SA04, US-SA05

#### Step 7: Create API Service Layer
- [x] Define API interface
- [x] Implement real API calls
- [x] Add mock/real switching logic
- **Output**: `src/api/adminApi.ts`, `src/api/authApi.ts`
- **Stories**: All

---

### Phase 3: State Management & Hooks

#### Step 8: Create Auth Store
- [x] Implement auth state (token, user, isAuthenticated)
- [x] Implement login/logout actions
- [x] Persist token to localStorage
- **Output**: `src/stores/authStore.ts`
- **Stories**: US-SA01

#### Step 9: Create React Query Hooks
- [x] useLogin hook (US-SA01)
- [x] useAdmins hook - list (US-SA03)
- [x] useCreateAdmin hook (US-SA02)
- [x] useUpdateAdminStatus hook (US-SA04, US-SA05)
- **Output**: `src/hooks/useAuth.ts`, `src/hooks/useAdmins.ts`
- **Stories**: US-SA01, US-SA02, US-SA03, US-SA04, US-SA05

---

### Phase 4: UI Components

#### Step 10: Create Layout Components
- [x] Create MainLayout with header and navigation
- [x] Create ProtectedRoute for auth guard
- **Output**: `src/components/layout/MainLayout.tsx`, `src/components/layout/ProtectedRoute.tsx`
- **Stories**: US-SA01

#### Step 11: Create Login Page (US-SA01)
- [x] Create LoginForm component
- [x] Create LoginPage with form and validation
- [x] Handle login success/error
- **Output**: `src/pages/LoginPage.tsx`, `src/components/auth/LoginForm.tsx`
- **Stories**: US-SA01

#### Step 12: Create Admin List Component (US-SA03)
- [x] Create AdminList component with table view
- [x] Add search/filter functionality
- [x] Display admin status (active/inactive)
- **Output**: `src/components/admin/AdminList.tsx`
- **Stories**: US-SA03

#### Step 13: Create Admin Form Component (US-SA02)
- [x] Create AdminForm component
- [x] Add form validation
- [x] Handle create success/error
- **Output**: `src/components/admin/AdminForm.tsx`
- **Stories**: US-SA02

#### Step 14: Create Admin Status Button (US-SA04, US-SA05)
- [x] Create AdminStatusButton component
- [x] Add confirmation dialog
- [x] Handle activate/deactivate actions
- **Output**: `src/components/admin/AdminStatusButton.tsx`
- **Stories**: US-SA04, US-SA05

#### Step 15: Create Admin Management Page
- [x] Create AdminManagementPage combining all admin components
- [x] Add create admin modal
- [x] Integrate list, form, and status components
- **Output**: `src/pages/AdminManagementPage.tsx`
- **Stories**: US-SA02, US-SA03, US-SA04, US-SA05

---

### Phase 5: Routing & App Assembly

#### Step 16: Configure Routing
- [x] Setup React Router
- [x] Define routes (/, /login, /admins)
- [x] Add route guards
- **Output**: `src/App.tsx`
- **Stories**: All

#### Step 17: Configure App Entry Point
- [x] Setup QueryClientProvider
- [x] Setup BrowserRouter
- [x] Configure global styles
- **Output**: `src/main.tsx`, `src/index.css`
- **Stories**: All

---

### Phase 6: Documentation

#### Step 18: Create README
- [x] Document project setup
- [x] Document environment variables
- [x] Document Mock API usage
- [x] Document future API integration steps
- **Output**: `table-order-superadmin-ui/README.md`

#### Step 19: Create Code Summary
- [x] Document generated components
- [x] Document API integration points
- [x] Document story coverage
- **Output**: `aidlc-docs/construction/superadmin-ui/code/code-summary.md`

---

## Story Traceability

| Story | Steps | Status |
|-------|-------|--------|
| US-SA01 | 4, 5, 6, 7, 8, 9, 10, 11, 16, 17 | [x] |
| US-SA02 | 4, 6, 7, 9, 13, 15 | [x] |
| US-SA03 | 4, 6, 7, 9, 12, 15 | [x] |
| US-SA04 | 4, 6, 7, 9, 14, 15 | [x] |
| US-SA05 | 4, 6, 7, 9, 14, 15 | [x] |

---

## Success Criteria

- [x] All 19 steps completed
- [x] All 5 stories implemented
- [x] Mock API working for all endpoints
- [x] Environment variable switching works
- [x] Application runs locally
- [x] Ready for future Backend integration

---

**Plan Status**: COMPLETED
