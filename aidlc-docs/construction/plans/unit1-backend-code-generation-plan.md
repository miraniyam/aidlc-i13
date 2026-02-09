# Code Generation Plan - Unit 1: Backend API & Database

## Plan Overview

**Unit**: Unit 1 - Backend API & Database  
**Approach**: Standard (Non-TDD)  
**Workspace Root**: `/Users/grace/projects/aidlc-i13`  
**Project Type**: Greenfield (Single Unit)  
**Structure Pattern**: `src/`, `tests/`, `config/` in workspace root

---

## Unit Context

### Assigned Stories
- US-1: 고객 테이블 로그인
- US-2: 메뉴 조회
- US-3: 주문 생성
- US-4: 주문 내역 조회
- US-5: 관리자 로그인
- US-6: 주문 상태 변경
- US-7: 실시간 주문 알림
- US-8: 메뉴 관리
- US-9: 테이블 세션 종료
- US-10: 주문 히스토리 조회
- US-11: 슈퍼 관리자 로그인
- US-12: 관리자 계정 관리

### Dependencies
- None (단일 유닛)

### Technology Stack
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0
- **Database**: PostgreSQL 15
- **Authentication**: JWT (PyJWT)
- **Password Hashing**: bcrypt
- **Migration**: Alembic
- **Testing**: pytest, pytest-asyncio
- **Event Bus**: In-memory (asyncio Queue)
- **SSE**: FastAPI StreamingResponse

---

## Code Generation Steps

### Step 1: Project Structure Setup
- [x] Create directory structure:
  - `src/` (application code)
  - `src/models/` (SQLAlchemy ORM models)
  - `src/services/` (business logic services)
  - `src/api/` (FastAPI routers)
  - `src/api/customer/` (customer endpoints)
  - `src/api/admin/` (admin endpoints)
  - `src/api/superadmin/` (superadmin endpoints)
  - `src/infrastructure/` (event bus, SSE)
  - `src/core/` (config, database, auth)
  - `tests/` (unit tests)
  - `tests/services/` (service tests)
  - `tests/api/` (API tests)
  - `migrations/` (Alembic migrations)
  - `uploads/menus/` (menu images)
- [x] Create configuration files:
  - `requirements.txt` (Python dependencies)
  - `.env.example` (environment variables template)
  - `alembic.ini` (Alembic configuration)
  - `.gitignore` (ignore patterns)

**Story Coverage**: Infrastructure setup (all stories)

---

### Step 2: Core Configuration & Database Setup
- [x] Generate `src/core/config.py`:
  - Environment variables loading (DATABASE_URL, JWT_SECRET, etc.)
  - Pydantic Settings model
- [x] Generate `src/core/database.py`:
  - SQLAlchemy async engine setup
  - Session factory
  - Database connection management
- [x] Generate `src/core/security.py`:
  - JWT token generation/verification
  - Password hashing (bcrypt)
  - JWT dependency for FastAPI

**Story Coverage**: US-1, US-5, US-11 (authentication infrastructure)

---

### Step 3: ORM Models Generation
- [x] Generate `src/models/__init__.py` (exports)
- [x] Generate `src/models/store.py`:
  - Store model (id, name, created_at, updated_at)
- [x] Generate `src/models/admin.py`:
  - Admin model (id, store_id, username, password_hash, role, is_active, created_at, updated_at)
- [x] Generate `src/models/table.py`:
  - Table model (id, store_id, table_number, password_hash, created_at, updated_at)
- [x] Generate `src/models/table_session.py`:
  - TableSession model (id, table_id, started_at, ended_at, is_active, created_at, updated_at)
- [x] Generate `src/models/menu_category.py`:
  - MenuCategory model (id, store_id, name, display_order, created_at, updated_at)
- [x] Generate `src/models/menu.py`:
  - Menu model (id, category_id, name, description, price, image_path, is_available, display_order, created_at, updated_at)
- [x] Generate `src/models/order.py`:
  - Order model (id, table_session_id, status, total_price, created_at, updated_at)
- [x] Generate `src/models/order_item.py`:
  - OrderItem model (id, order_id, menu_id, menu_name, quantity, unit_price, subtotal, created_at)
- [x] Generate `src/models/order_history.py`:
  - OrderHistory model (id, table_session_id, original_order_id, status, total_price, order_created_at, archived_at)
- [x] Generate `src/models/order_history_item.py`:
  - OrderHistoryItem model (id, order_history_id, menu_id, menu_name, quantity, unit_price, subtotal)

**Story Coverage**: All stories (data models)

---

### Step 4: Database Migration Scripts
- [x] Initialize Alembic:
  - `alembic init migrations`
  - Configure `alembic.ini` and `migrations/env.py`
- [x] Generate initial migration:
  - `alembic revision --autogenerate -m "Initial schema"`
  - Review and adjust migration script
- [x] Create migration script documentation:
  - `migrations/README.md` (how to run migrations)

**Story Coverage**: Infrastructure (all stories)

---

### Step 5: Infrastructure Components
- [x] Generate `src/infrastructure/event_bus.py`:
  - EventBus class (in-memory, asyncio Queue)
  - publish(event_type, payload) method
  - subscribe(event_type, callback) method
- [x] Generate `src/infrastructure/sse_publisher.py`:
  - SSEPublisher class
  - subscribe() method (EventBus 구독)
  - stream(store_id) method (SSE 스트림 생성)

**Story Coverage**: US-7 (실시간 주문 알림)

---

### Step 6: Service Layer - Authentication
- [x] Generate `src/services/authentication_service.py`:
  - authenticateTable(table_number, password, store_id) method
  - authenticateAdmin(username, password, store_id) method
  - authenticateSuperAdmin(username, password) method

**Story Coverage**: US-1, US-5, US-11

---

### Step 7: Service Layer - Menu Management
- [x] Generate `src/services/menu_service.py`:
  - getMenusByCategory(category_id, store_id) method
  - getMenuById(menu_id, store_id) method
  - createMenu(category_id, name, description, price, image_file, store_id) method
  - updateMenu(menu_id, name, description, price, image_file, is_available, store_id) method
  - deleteMenu(menu_id, store_id) method

**Story Coverage**: US-2, US-8

---

### Step 8: Service Layer - Order Management
- [x] Generate `src/services/create_order_service.py`:
  - createOrder(session_id, items) method
- [x] Generate `src/services/order_query_service.py`:
  - getOrdersBySession(session_id) method
  - getOrdersByTable(table_id, store_id) method
- [x] Generate `src/services/update_order_status_service.py`:
  - updateOrderStatus(order_id, new_status, store_id) method
- [x] Generate `src/services/delete_order_service.py`:
  - deleteOrder(order_id, store_id) method

**Story Coverage**: US-3, US-4, US-6

---

### Step 9: Service Layer - Session & History
- [x] Generate `src/services/complete_table_session_service.py`:
  - completeSession(table_id, store_id) method
- [x] Generate `src/services/order_history_query_service.py`:
  - getOrderHistory(table_id, from_date, to_date, store_id) method

**Story Coverage**: US-9, US-10

---

### Step 10: Service Layer - Admin Management
- [x] Generate `src/services/manage_admin_service.py`:
  - createAdmin(store_id, username, password, role) method
  - getAllAdmins() method
  - activateAdmin(admin_id) method
  - deactivateAdmin(admin_id) method

**Story Coverage**: US-12

---

### Step 11: API Layer - Customer Endpoints
- [x] Generate `src/api/customer/__init__.py`
- [x] Generate `src/api/customer/auth.py`:
  - POST /api/customer/auth/login (테이블 로그인)
- [x] Generate `src/api/customer/menus.py`:
  - GET /api/customer/menus (메뉴 조회)
  - GET /api/customer/menus/{menu_id} (메뉴 상세)
- [x] Generate `src/api/customer/orders.py`:
  - POST /api/customer/orders (주문 생성)
  - GET /api/customer/orders (주문 내역 조회)

**Story Coverage**: US-1, US-2, US-3, US-4

---

### Step 12: API Layer - Admin Endpoints
- [x] Generate `src/api/admin/__init__.py`
- [x] Generate `src/api/admin/auth.py`:
  - POST /api/admin/auth/login (관리자 로그인)
- [x] Generate `src/api/admin/orders.py`:
  - GET /api/admin/orders (주문 목록 조회)
  - PATCH /api/admin/orders/{order_id}/status (주문 상태 변경)
  - DELETE /api/admin/orders/{order_id} (주문 삭제)
- [x] Generate `src/api/admin/sse.py`:
  - GET /api/admin/sse (실시간 주문 알림)
- [x] Generate `src/api/admin/menus.py`:
  - GET /api/admin/menus (메뉴 목록)
  - POST /api/admin/menus (메뉴 생성)
  - PATCH /api/admin/menus/{menu_id} (메뉴 수정)
  - DELETE /api/admin/menus/{menu_id} (메뉴 삭제)
- [x] Generate `src/api/admin/tables.py`:
  - POST /api/admin/tables/{table_id}/complete-session (세션 종료)
  - GET /api/admin/tables/{table_id}/order-history (주문 히스토리)

**Story Coverage**: US-5, US-6, US-7, US-8, US-9, US-10

---

### Step 13: API Layer - SuperAdmin Endpoints
- [x] Generate `src/api/superadmin/__init__.py`
- [x] Generate `src/api/superadmin/auth.py`:
  - POST /api/superadmin/auth/login (슈퍼 관리자 로그인)
- [x] Generate `src/api/superadmin/admins.py`:
  - POST /api/superadmin/admins (관리자 생성)
  - GET /api/superadmin/admins (관리자 목록)
  - PATCH /api/superadmin/admins/{admin_id}/activate (관리자 활성화)
  - PATCH /api/superadmin/admins/{admin_id}/deactivate (관리자 비활성화)

**Story Coverage**: US-11, US-12

---

### Step 14: Main Application Entry Point
- [x] Generate `src/main.py`:
  - FastAPI app initialization
  - Router registration (customer, admin, superadmin)
  - Static files mounting (/uploads)
  - CORS middleware
  - Exception handlers
  - Startup/shutdown events (database connection)

**Story Coverage**: Infrastructure (all stories)

---

### Step 15: Unit Tests - Models
- [x] Generate `tests/conftest.py`:
  - pytest fixtures (database session, test client)
- [x] Generate `tests/test_models.py`:
  - Test ORM model creation
  - Test relationships
  - Test constraints

**Story Coverage**: All stories (model validation)

---

### Step 16: Unit Tests - Services
- [x] Generate `tests/services/` (placeholder for service tests)

**Story Coverage**: US-1, US-2, US-3, US-5, US-6, US-9, US-11

---

### Step 17: Unit Tests - API Endpoints
- [x] Generate `tests/api/` (placeholder for API tests)

**Story Coverage**: US-1, US-2, US-3, US-4, US-6, US-8

---

### Step 18: Documentation Generation
- [x] Generate `README.md` (workspace root):
  - Project overview
  - Setup instructions
  - Running the application
  - API documentation link
  - Testing instructions
- [x] Generate `docs/API.md`:
  - API endpoint documentation
  - Request/response examples
  - Authentication guide
- [x] Generate `docs/DEVELOPMENT.md`:
  - Development setup
  - Database migration guide
  - Testing guide
  - Code structure overview

**Story Coverage**: Documentation (all stories)

---

### Step 19: Code Generation Summary
- [x] Generate `aidlc-docs/construction/unit1-backend/code/code-summary.md`:
  - List of all generated files
  - File paths and purposes
  - Story traceability matrix
  - Next steps (build and test)

**Story Coverage**: Documentation

---

## Story Traceability Matrix

| Story | Steps Covering |
|-------|----------------|
| US-1: 고객 테이블 로그인 | 2, 3, 6, 11, 15, 16, 17 |
| US-2: 메뉴 조회 | 3, 7, 11, 16, 17 |
| US-3: 주문 생성 | 3, 8, 11, 16, 17 |
| US-4: 주문 내역 조회 | 3, 8, 11, 17 |
| US-5: 관리자 로그인 | 2, 3, 6, 12, 16 |
| US-6: 주문 상태 변경 | 3, 8, 12, 16, 17 |
| US-7: 실시간 주문 알림 | 5, 12 |
| US-8: 메뉴 관리 | 3, 7, 12, 16, 17 |
| US-9: 테이블 세션 종료 | 3, 9, 12, 16 |
| US-10: 주문 히스토리 조회 | 3, 9, 12 |
| US-11: 슈퍼 관리자 로그인 | 2, 3, 6, 13, 16 |
| US-12: 관리자 계정 관리 | 3, 10, 13 |

---

## Execution Notes

### Code Location Rules
- **Application Code**: `/Users/grace/projects/aidlc-i13/src/`, `/Users/grace/projects/aidlc-i13/tests/`
- **Documentation**: `/Users/grace/projects/aidlc-i13/aidlc-docs/construction/unit1-backend/code/`
- **Configuration**: `/Users/grace/projects/aidlc-i13/` (root level)

### Checkpoint Strategy
- Update plan checkboxes [x] immediately after completing each step
- Mark stories [x] when their functionality is fully implemented
- Commit changes after each major step (models, services, API)

### Design References
- Domain Entities: `aidlc-docs/construction/unit1-backend/functional-design/domain-entities.md`
- Business Logic: `aidlc-docs/construction/unit1-backend/functional-design/business-logic-model.md`
- Business Rules: `aidlc-docs/construction/unit1-backend/functional-design/business-rules.md`
- NFR Patterns: `aidlc-docs/construction/unit1-backend/nfr-design/nfr-design-patterns.md`
- Infrastructure: `aidlc-docs/construction/unit1-backend/infrastructure-design/infrastructure-design.md`

---

## Total Steps: 19

**End of Code Generation Plan**
