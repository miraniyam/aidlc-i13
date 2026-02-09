# Unit of Work - 테이블오더 서비스

## Overview

테이블오더 서비스는 **Multi-repo** 아키텍처로 구성되며, 5개의 독립적인 저장소로 분해됩니다. 각 유닛은 독립적으로 개발 및 배포 가능하며, API Contract First 방식으로 통합됩니다.

### Deployment Model
- **Architecture**: Multi-repo (각 유닛마다 별도 저장소)
- **Repository Naming**: Service-based (table-order-{unit-name})
- **Shared Code**: Backend as source of truth (OpenAPI 스키마 export)
- **Integration**: API Contract First (OpenAPI 스펙 우선 정의)
- **Infrastructure Timing**: Early (백엔드와 동시 개발)

### Development Sequence
1. **Unit 1**: Backend API & Database (우선순위 1)
2. **Unit 2**: Customer Frontend (우선순위 2, Unit 3과 병렬 가능)
3. **Unit 3**: Admin Frontend (우선순위 2, Unit 2와 병렬 가능)
4. **Unit 4**: SuperAdmin Frontend (우선순위 3)
5. **Unit 5**: Infrastructure (Terraform) (우선순위 4)

### Testing Strategy
- **Incremental Integration**: 각 유닛 완료 시 기존 유닛과 통합 테스트

---

## Unit 1: Backend API & Database

### Repository
- **Name**: `table-order-backend`
- **Type**: Backend Service
- **Deployment**: Standalone API Server

### Responsibilities
- 모든 비즈니스 로직 처리
- 데이터베이스 관리 (PostgreSQL)
- RESTful API 제공 (Customer, Admin, SuperAdmin)
- 실시간 이벤트 발행 (SSE)
- 인증 및 권한 관리 (JWT)
- OpenAPI 스키마 export (프론트엔드 공유)

### Technology Stack
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0
- **Database**: PostgreSQL 15+
- **Authentication**: JWT (PyJWT)
- **Password Hashing**: bcrypt
- **Real-time**: Server-Sent Events (SSE)
- **Event Bus**: In-memory EventBus (Redis Pub/Sub for production)
- **API Documentation**: OpenAPI 3.0 (FastAPI auto-generated)

### Components (from Application Design)

#### Controllers (3)
1. **CustomerController**: Customer API 라우팅
   - POST /api/customer/login (테이블 자동 로그인)
   - GET /api/menus (메뉴 조회)
   - POST /api/orders (주문 생성)
   - GET /api/orders (주문 내역 조회)

2. **AdminController**: Admin API 라우팅
   - POST /api/admin/login (관리자 로그인)
   - GET /api/admin/orders/stream (SSE 실시간 주문)
   - PATCH /api/admin/orders/{order_id}/status (주문 상태 변경)
   - DELETE /api/admin/orders/{order_id} (주문 삭제)
   - POST /api/admin/tables/{table_id}/complete-session (세션 종료)
   - GET /api/admin/tables/{table_id}/order-history (과거 내역)
   - GET /api/admin/menus (메뉴 조회)
   - POST /api/admin/menus (메뉴 등록)
   - PATCH /api/admin/menus/{menu_id} (메뉴 수정)
   - DELETE /api/admin/menus/{menu_id} (메뉴 삭제)

3. **SuperAdminController**: SuperAdmin API 라우팅
   - POST /api/superadmin/login (슈퍼 관리자 로그인)
   - GET /api/superadmin/admins (관리자 계정 조회)
   - POST /api/superadmin/admins (관리자 계정 생성)
   - PATCH /api/superadmin/admins/{admin_id}/activate (계정 활성화)
   - PATCH /api/superadmin/admins/{admin_id}/deactivate (계정 비활성화)

#### Services (9)
1. **AuthenticationService**: 모든 사용자 인증 (테이블, 관리자, 슈퍼 관리자)
2. **MenuService**: 메뉴 CRUD
3. **CreateOrderService**: 주문 생성 + 이벤트 발행
4. **OrderQueryService**: 활성 세션 주문 조회
5. **UpdateOrderStatusService**: 주문 상태 변경 + 이벤트 발행
6. **DeleteOrderService**: 주문 삭제
7. **CompleteTableSessionService**: 테이블 세션 종료 (트랜잭션)
8. **OrderHistoryQueryService**: 완료된 세션 주문 조회
9. **ManageAdminService**: 관리자 계정 관리

#### Infrastructure Components (2)
1. **EventBus**: 이벤트 발행/구독 (OrderCreated, OrderStatusChanged)
2. **SSEPublisher**: EventBus 구독 → SSE 스트림 발행

#### Data Models (9)
1. **Store**: 매장 정보
2. **Admin**: 관리자 계정 (store_admin, super_admin)
3. **Table**: 테이블 정보
4. **TableSession**: 테이블 세션 (활성/종료)
5. **MenuCategory**: 메뉴 카테고리
6. **Menu**: 메뉴 정보
7. **Order**: 주문 정보
8. **OrderItem**: 주문 항목
9. **OrderHistory**: 완료된 주문 이력

### Directory Structure
```
table-order-backend/
├── app/
│   ├── main.py                    # FastAPI 앱 진입점
│   ├── config.py                  # 설정 (환경 변수)
│   ├── database.py                # DB 연결 설정
│   ├── controllers/               # API 라우터
│   │   ├── customer_controller.py
│   │   ├── admin_controller.py
│   │   └── superadmin_controller.py
│   ├── services/                  # 비즈니스 로직
│   │   ├── authentication_service.py
│   │   ├── menu_service.py
│   │   ├── create_order_service.py
│   │   ├── order_query_service.py
│   │   ├── update_order_status_service.py
│   │   ├── delete_order_service.py
│   │   ├── complete_table_session_service.py
│   │   ├── order_history_query_service.py
│   │   └── manage_admin_service.py
│   ├── models/                    # SQLAlchemy 모델
│   │   ├── store.py
│   │   ├── admin.py
│   │   ├── table.py
│   │   ├── table_session.py
│   │   ├── menu_category.py
│   │   ├── menu.py
│   │   ├── order.py
│   │   ├── order_item.py
│   │   └── order_history.py
│   ├── schemas/                   # Pydantic 스키마 (Request/Response)
│   │   ├── customer_schemas.py
│   │   ├── admin_schemas.py
│   │   └── superadmin_schemas.py
│   ├── infrastructure/            # 인프라 컴포넌트
│   │   ├── event_bus.py
│   │   └── sse_publisher.py
│   └── utils/                     # 유틸리티
│       ├── jwt_utils.py
│       └── password_utils.py
├── tests/                         # 테스트
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── migrations/                    # Alembic 마이그레이션
├── uploads/                       # 이미지 업로드 디렉토리
│   └── menus/
├── requirements.txt
├── .env.example
└── README.md
```

### API Contract (OpenAPI)
- **Export Path**: `table-order-backend/openapi.json`
- **Generation**: FastAPI auto-generated
- **Usage**: 프론트엔드 유닛에서 import하여 타입 생성

### Dependencies
- **Upstream**: None (독립적)
- **Downstream**: Unit 2, Unit 3, Unit 4 (모든 프론트엔드가 의존)

### NFR Requirements
- **Performance**: API 응답 시간 2-3초 이내
- **Concurrency**: 테이블 세션 동시성 처리 (Pessimistic Locking)
- **Real-time**: SSE 연결 2초 이내 업데이트
- **Security**: JWT 인증, bcrypt 비밀번호 해싱
- **Scalability**: 중규모 동시 사용자 (10-50명)

---

## Unit 2: Customer Frontend

### Repository
- **Name**: `table-order-customer-ui`
- **Type**: Frontend Application
- **Deployment**: Static files (Nginx or S3)

### Responsibilities
- 고객용 주문 인터페이스 제공
- 테이블 자동 로그인
- 메뉴 탐색 및 상세 조회
- 장바구니 관리 (로컬 상태)
- 주문 생성 및 내역 조회
- 주문 상태 폴링 (30초 간격)

### Technology Stack
- **Language**: TypeScript
- **Framework**: React 18+
- **State Management**: Zustand (장바구니), React Query (서버 상태)
- **Routing**: React Router
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS or Material-UI
- **Build Tool**: Vite

### Components
1. **Menu Components**
   - MenuList: 메뉴 목록 (카테고리별)
   - MenuItem: 메뉴 카드
   - MenuDetail: 메뉴 상세 모달

2. **Cart Components**
   - Cart: 장바구니 화면
   - CartItem: 장바구니 항목
   - CartSummary: 총 금액 요약

3. **Order Components**
   - OrderConfirm: 주문 확인 화면
   - OrderList: 주문 내역 목록
   - OrderItem: 주문 항목 카드

4. **State Management**
   - Zustand Cart Store: 장바구니 상태 관리
   - React Query: API 호출 및 캐싱

### Directory Structure
```
table-order-customer-ui/
├── src/
│   ├── main.tsx                   # 앱 진입점
│   ├── App.tsx                    # 루트 컴포넌트
│   ├── components/                # UI 컴포넌트
│   │   ├── menu/
│   │   │   ├── MenuList.tsx
│   │   │   ├── MenuItem.tsx
│   │   │   └── MenuDetail.tsx
│   │   ├── cart/
│   │   │   ├── Cart.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   └── order/
│   │       ├── OrderConfirm.tsx
│   │       ├── OrderList.tsx
│   │       └── OrderItem.tsx
│   ├── stores/                    # Zustand stores
│   │   └── cartStore.ts
│   ├── api/                       # API 클라이언트
│   │   ├── client.ts              # Axios instance
│   │   ├── menuApi.ts
│   │   └── orderApi.ts
│   ├── types/                     # TypeScript 타입 (OpenAPI 생성)
│   │   └── api.ts
│   ├── hooks/                     # React Query hooks
│   │   ├── useMenus.ts
│   │   └── useOrders.ts
│   └── utils/
│       └── localStorage.ts
├── public/
├── tests/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### API Integration
- **OpenAPI Import**: `table-order-backend/openapi.json` → TypeScript 타입 생성
- **Base URL**: 환경 변수로 설정 (로컬: http://localhost:8000)

### Dependencies
- **Upstream**: Unit 1 (Backend API)
- **Downstream**: None

### NFR Requirements
- **Performance**: 페이지 로딩 2초 이내
- **Responsiveness**: 터치 친화적 UI (최소 44x44px 버튼)
- **Polling**: 주문 상태 30초 간격 폴링

---

## Unit 3: Admin Frontend

### Repository
- **Name**: `table-order-admin-ui`
- **Type**: Frontend Application
- **Deployment**: Static files (Nginx or S3)

### Responsibilities
- 관리자용 관리 인터페이스 제공
- 관리자 로그인
- 실시간 주문 모니터링 (SSE)
- 주문 상태 변경 및 삭제
- 테이블 세션 관리
- 메뉴 CRUD
- 과거 주문 내역 조회

### Technology Stack
- **Language**: TypeScript
- **Framework**: React 18+
- **State Management**: React Query (서버 상태)
- **Routing**: React Router
- **HTTP Client**: Axios
- **Real-time**: EventSource (SSE)
- **Styling**: Tailwind CSS or Material-UI
- **Build Tool**: Vite

### Components
1. **Dashboard Components**
   - TableCard: 테이블 주문 카드
   - OrderMonitor: 실시간 주문 모니터

2. **Order Management Components**
   - OrderDetail: 주문 상세 모달
   - OrderStatusButton: 상태 변경 버튼
   - OrderDeleteButton: 주문 삭제 버튼

3. **Table Management Components**
   - CompleteSessionButton: 세션 종료 버튼
   - OrderHistoryModal: 과거 내역 모달

4. **Menu Management Components**
   - MenuList: 메뉴 목록
   - MenuForm: 메뉴 등록/수정 폼
   - MenuDeleteButton: 메뉴 삭제 버튼

5. **SSE Connection**
   - useSSE hook: SSE 연결 관리

### Directory Structure
```
table-order-admin-ui/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── TableCard.tsx
│   │   │   └── OrderMonitor.tsx
│   │   ├── order/
│   │   │   ├── OrderDetail.tsx
│   │   │   ├── OrderStatusButton.tsx
│   │   │   └── OrderDeleteButton.tsx
│   │   ├── table/
│   │   │   ├── CompleteSessionButton.tsx
│   │   │   └── OrderHistoryModal.tsx
│   │   └── menu/
│   │       ├── MenuList.tsx
│   │       ├── MenuForm.tsx
│   │       └── MenuDeleteButton.tsx
│   ├── api/
│   │   ├── client.ts
│   │   ├── orderApi.ts
│   │   ├── tableApi.ts
│   │   └── menuApi.ts
│   ├── types/
│   │   └── api.ts
│   ├── hooks/
│   │   ├── useSSE.ts
│   │   ├── useOrders.ts
│   │   ├── useTables.ts
│   │   └── useMenus.ts
│   └── utils/
│       └── localStorage.ts
├── public/
├── tests/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### API Integration
- **OpenAPI Import**: `table-order-backend/openapi.json` → TypeScript 타입 생성
- **Base URL**: 환경 변수로 설정
- **SSE Endpoint**: GET /api/admin/orders/stream

### Dependencies
- **Upstream**: Unit 1 (Backend API)
- **Downstream**: None

### NFR Requirements
- **Performance**: 대시보드 로딩 2초 이내
- **Real-time**: SSE 연결 2초 이내 업데이트
- **Concurrency**: 동시 접속 관리자 10명

---

## Unit 4: SuperAdmin Frontend

### Repository
- **Name**: `table-order-superadmin-ui`
- **Type**: Frontend Application
- **Deployment**: Static files (Nginx or S3)

### Responsibilities
- 슈퍼 관리자용 인터페이스 제공
- 슈퍼 관리자 로그인
- 관리자 계정 CRUD
- 계정 활성화/비활성화

### Technology Stack
- **Language**: TypeScript
- **Framework**: React 18+
- **State Management**: React Query (서버 상태)
- **Routing**: React Router
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS or Material-UI
- **Build Tool**: Vite

### Components
1. **Admin Management Components**
   - AdminList: 관리자 계정 목록
   - AdminForm: 계정 생성 폼
   - AdminStatusButton: 활성화/비활성화 버튼

### Directory Structure
```
table-order-superadmin-ui/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   └── admin/
│   │       ├── AdminList.tsx
│   │       ├── AdminForm.tsx
│   │       └── AdminStatusButton.tsx
│   ├── api/
│   │   ├── client.ts
│   │   └── adminApi.ts
│   ├── types/
│   │   └── api.ts
│   ├── hooks/
│   │   └── useAdmins.ts
│   └── utils/
│       └── localStorage.ts
├── public/
├── tests/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### API Integration
- **OpenAPI Import**: `table-order-backend/openapi.json` → TypeScript 타입 생성
- **Base URL**: 환경 변수로 설정

### Dependencies
- **Upstream**: Unit 1 (Backend API)
- **Downstream**: None

### NFR Requirements
- **Performance**: 페이지 로딩 2초 이내

---

## Unit 5: Infrastructure (Terraform)

### Repository
- **Name**: `table-order-infrastructure`
- **Type**: Infrastructure as Code
- **Deployment**: Terraform apply

### Responsibilities
- AWS 인프라 프로비저닝
- 네트워크 설정 (VPC, Subnets, Security Groups)
- 컴퓨팅 리소스 (EC2 or ECS)
- 데이터베이스 (RDS PostgreSQL)
- 캐시 (Redis for SSE Pub/Sub)
- 스토리지 (S3 for static files, optional)
- 로드 밸런서 (ALB, optional)

### Technology Stack
- **IaC Tool**: Terraform
- **Cloud Provider**: AWS
- **Compute**: EC2 or ECS Fargate
- **Database**: RDS PostgreSQL 15+
- **Cache**: ElastiCache Redis
- **Storage**: S3 (optional)
- **Network**: VPC, Subnets, Security Groups, Internet Gateway
- **Load Balancer**: Application Load Balancer (optional)

### Resources
1. **VPC**: 격리된 네트워크
2. **Subnets**: Public (ALB), Private (EC2/ECS, RDS)
3. **Security Groups**: ALB, EC2/ECS, RDS, Redis
4. **EC2 or ECS**: 백엔드 API 서버
5. **RDS PostgreSQL**: 데이터베이스
6. **ElastiCache Redis**: SSE Pub/Sub
7. **S3**: 프론트엔드 정적 파일 호스팅 (optional)
8. **ALB**: 로드 밸런서 (optional)

### Directory Structure
```
table-order-infrastructure/
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── cache/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── storage/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars
├── .gitignore
└── README.md
```

### Dependencies
- **Upstream**: None (독립적)
- **Downstream**: Unit 1 (Backend 배포 대상)

### NFR Requirements
- **Availability**: Multi-AZ RDS
- **Scalability**: Auto Scaling Group (optional)
- **Security**: Private subnets for RDS, Security Groups

---

## Summary

### Unit Count
- **Total**: 5 units
- **Backend**: 1 unit
- **Frontend**: 3 units
- **Infrastructure**: 1 unit

### Repository Naming
- `table-order-backend`
- `table-order-customer-ui`
- `table-order-admin-ui`
- `table-order-superadmin-ui`
- `table-order-infrastructure`

### Development Sequence
1. Unit 1 (Backend) - 단독 개발
2. Unit 2 (Customer) + Unit 3 (Admin) - 병렬 개발
3. Unit 4 (SuperAdmin) - 단독 개발
4. Unit 5 (Infrastructure) - 단독 개발

### Integration Strategy
- **API Contract First**: OpenAPI 스펙 먼저 정의
- **Backend as Source of Truth**: 백엔드에서 OpenAPI 스키마 export
- **Incremental Integration Testing**: 각 유닛 완료 시 통합 테스트

### Shared Artifacts
- **OpenAPI Schema**: `table-order-backend/openapi.json`
- **TypeScript Types**: 프론트엔드 유닛에서 자동 생성

---

**End of Unit of Work Document**
