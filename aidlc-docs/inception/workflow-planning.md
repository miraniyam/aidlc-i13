# Workflow Planning - 테이블오더 서비스

## Project Context

### Project Type
- **Type**: Greenfield (신규 프로젝트)
- **Complexity**: Complex
- **Scope**: System-wide

### Technology Stack
- **Backend**: Python FastAPI
- **Frontend**: React
- **Database**: PostgreSQL
- **Deployment**: Local (개발) + AWS (운영, Terraform)
- **Real-time**: Server-Sent Events (SSE), Redis Pub/Sub

### Key Features
- 고객용 주문 인터페이스 (자동 로그인, 메뉴 조회, 장바구니, 주문 생성, 주문 내역)
- 관리자용 관리 인터페이스 (실시간 모니터링, 주문 관리, 테이블 관리, 메뉴 관리)
- 슈퍼 관리자 기능 (관리자 계정 관리)

---

## Impact Analysis

### User-Facing Changes
- ✅ 고객 주문 인터페이스 (React)
- ✅ 관리자 대시보드 (React)
- ✅ 슈퍼 관리자 인터페이스 (React)

### Structural Changes
- ✅ 레이어 기반 아키텍처 (Controller → Service → ORM)
- ✅ 이벤트 기반 통신 (EventBus + SSEPublisher)
- ✅ 9개 서비스 컴포넌트

### Data Model Changes
- ✅ 9개 데이터 모델 (Store, Admin, Table, TableSession, MenuCategory, Menu, Order, OrderItem, OrderHistory)
- ✅ PostgreSQL 스키마 설계

### API Changes
- ✅ Customer API (5개 엔드포인트)
- ✅ Admin API (11개 엔드포인트)
- ✅ SuperAdmin API (5개 엔드포인트)

### NFR Impact
- ✅ 실시간 주문 모니터링 (SSE, 2초 이내)
- ✅ 테이블 세션 동시성 처리
- ✅ 주문 상태 전이 검증
- ✅ 응답 시간 2-3초 이내
- ✅ 중규모 동시 사용자 (10-50명)

---

## Recommended Workflow

### INCEPTION PHASE (완료)
- [x] Workspace Detection
- [x] Requirements Analysis
- [x] User Stories
- [x] Application Design
- [x] Workflow Planning (현재)
- [ ] Units Generation (권장)

### CONSTRUCTION PHASE (예정)
- [ ] Per-Unit Design & Code Generation
  - [ ] Functional Design (per-unit, conditional)
  - [ ] NFR Requirements (per-unit, conditional)
  - [ ] NFR Design (per-unit, conditional)
  - [ ] Infrastructure Design (per-unit, conditional)
  - [ ] Code Generation (per-unit, always)
- [ ] Build and Test (always)

### OPERATIONS PHASE (미래 확장)
- [ ] Operations (placeholder)

---

## Units Generation Recommendation

### Should Execute Units Generation?

**YES - 강력 권장**

**이유**:
1. **복잡한 시스템**: 고객 UI, 관리자 UI, 백엔드 API, 데이터베이스
2. **다중 도메인**: 주문, 메뉴, 테이블, 관리자 계정
3. **병렬 개발 가능**: 프론트엔드와 백엔드를 독립적으로 개발 가능
4. **명확한 경계**: 각 유닛의 책임과 인터페이스가 명확함

### Proposed Units

#### Unit 1: Backend API & Database
**Scope**: FastAPI 백엔드 + PostgreSQL 데이터베이스
**Components**:
- 9개 서비스 (AuthenticationService, MenuService, CreateOrderService, etc.)
- 3개 Controllers (Customer, Admin, SuperAdmin)
- 9개 Data Models
- EventBus, SSEPublisher

**Dependencies**: None (독립적)

---

#### Unit 2: Customer Frontend
**Scope**: React 고객용 인터페이스
**Components**:
- Menu 컴포넌트 (MenuList, MenuItem, MenuDetail)
- Cart 컴포넌트 (Cart, CartItem, CartSummary)
- Order 컴포넌트 (OrderConfirm, OrderList, OrderItem)
- Zustand Cart Store
- React Query (API 통신)

**Dependencies**: Unit 1 (Backend API)

---

#### Unit 3: Admin Frontend
**Scope**: React 관리자용 인터페이스
**Components**:
- Dashboard 컴포넌트 (TableCard, OrderMonitor)
- OrderManagement 컴포넌트
- TableManagement 컴포넌트
- MenuManagement 컴포넌트
- SSE 연결 관리
- React Query (API 통신)

**Dependencies**: Unit 1 (Backend API)

---

#### Unit 4: SuperAdmin Frontend
**Scope**: React 슈퍼 관리자용 인터페이스
**Components**:
- AdminManagement 컴포넌트 (AdminList, AdminForm)
- React Query (API 통신)

**Dependencies**: Unit 1 (Backend API)

---

#### Unit 5: Infrastructure (Terraform)
**Scope**: AWS 인프라 코드
**Components**:
- EC2 또는 ECS 설정
- RDS PostgreSQL
- S3 (이미지 저장, 선택사항)
- VPC, Security Groups
- Load Balancer (선택사항)
- Redis (SSE 확장성)

**Dependencies**: None (독립적)

---

## Execution Depth Recommendations

### INCEPTION PHASE
- **Workspace Detection**: ✅ Completed (Minimal)
- **Requirements Analysis**: ✅ Completed (Standard)
- **User Stories**: ✅ Completed (Standard)
- **Application Design**: ✅ Completed (Standard)
- **Workflow Planning**: 🔄 Current (Standard)
- **Units Generation**: 📋 Recommended (Standard)

### CONSTRUCTION PHASE (Per-Unit)

#### Unit 1: Backend API & Database
- **Functional Design**: Standard (데이터 모델, 비즈니스 로직 상세 설계)
- **NFR Requirements**: Standard (동시성, 트랜잭션, 성능)
- **NFR Design**: Standard (세션 동시성, SSE 확장성, 상태 전이 검증)
- **Infrastructure Design**: Minimal (로컬 개발 환경)
- **Code Generation**: Standard (TDD 권장)

#### Unit 2-4: Frontend (Customer, Admin, SuperAdmin)
- **Functional Design**: Minimal (컴포넌트 구조 이미 정의됨)
- **NFR Requirements**: Minimal (응답 시간, 폴링 간격)
- **NFR Design**: Skip (프론트엔드는 NFR 설계 불필요)
- **Infrastructure Design**: Skip (정적 파일 서빙만)
- **Code Generation**: Standard

#### Unit 5: Infrastructure (Terraform)
- **Functional Design**: Skip (인프라는 기능 설계 불필요)
- **NFR Requirements**: Standard (확장성, 가용성)
- **NFR Design**: Skip (Terraform 코드로 직접 구현)
- **Infrastructure Design**: Standard (AWS 리소스 설계)
- **Code Generation**: Standard (Terraform 코드)

---

## Development Sequence

### Recommended Order

1. **Unit 1: Backend API & Database** (우선순위 1)
   - 모든 프론트엔드가 의존하는 기반
   - 독립적으로 개발 및 테스트 가능

2. **Unit 2: Customer Frontend** (우선순위 2)
   - 핵심 사용자 경험
   - Backend API 완료 후 시작

3. **Unit 3: Admin Frontend** (우선순위 2)
   - Customer와 병렬 개발 가능
   - Backend API 완료 후 시작

4. **Unit 4: SuperAdmin Frontend** (우선순위 3)
   - 가장 낮은 우선순위
   - Admin Frontend 완료 후 시작

5. **Unit 5: Infrastructure** (우선순위 4)
   - 모든 유닛 완료 후 배포 준비
   - 로컬 개발 완료 후 시작

### Parallel Development Opportunities

**Phase 1**: Unit 1 (Backend) - 단독 개발

**Phase 2**: Unit 2 (Customer) + Unit 3 (Admin) - 병렬 개발 가능

**Phase 3**: Unit 4 (SuperAdmin) - 단독 개발

**Phase 4**: Unit 5 (Infrastructure) - 단독 개발

---

## Risk Assessment

### Overall Risk Level: **Medium**

**Risk Factors**:
- ✅ 신규 프로젝트 (Greenfield) - 기존 코드 영향 없음
- ⚠️ 복잡한 시스템 - 다중 컴포넌트, 실시간 기능
- ⚠️ 동시성 처리 - 테이블 세션, SSE 연결 관리
- ⚠️ 상태 관리 - 주문 상태 전이, 세션 라이프사이클

**Mitigation Strategies**:
- 유닛별 독립 개발 및 테스트
- 설계 고려사항 해결 방안 적용 (동시성, SSE 확장성, 상태 전이 검증)
- TDD 적용 (Backend)
- 단계별 통합 테스트

---

## Estimated Effort

### INCEPTION PHASE
- ✅ Workspace Detection: 완료
- ✅ Requirements Analysis: 완료
- ✅ User Stories: 완료
- ✅ Application Design: 완료
- 🔄 Workflow Planning: 진행 중
- 📋 Units Generation: 1-2시간 예상

### CONSTRUCTION PHASE

#### Unit 1: Backend API & Database
- Functional Design: 2-3시간
- NFR Design: 2-3시간
- Code Generation: 8-12시간
- **Total**: 12-18시간

#### Unit 2: Customer Frontend
- Code Generation: 6-8시간
- **Total**: 6-8시간

#### Unit 3: Admin Frontend
- Code Generation: 8-10시간
- **Total**: 8-10시간

#### Unit 4: SuperAdmin Frontend
- Code Generation: 3-4시간
- **Total**: 3-4시간

#### Unit 5: Infrastructure
- Infrastructure Design: 2-3시간
- Code Generation: 4-6시간
- **Total**: 6-9시간

### Build and Test
- Integration Testing: 4-6시간
- Performance Testing: 2-3시간
- **Total**: 6-9시간

### GRAND TOTAL: 41-58시간 (약 5-7일)

---

## Success Criteria

### INCEPTION PHASE
- ✅ 모든 요구사항 문서화
- ✅ User Stories 생성 (27개)
- ✅ Application Design 완료 (9개 서비스)
- ✅ Workflow Plan 승인
- 📋 Units 정의 및 승인

### CONSTRUCTION PHASE
- 모든 유닛 코드 생성 완료
- 유닛별 테스트 통과
- 통합 테스트 통과
- 성능 요구사항 충족 (응답 시간 2-3초)

### OPERATIONS PHASE
- 로컬 환경 배포 성공
- AWS 환경 배포 성공 (Terraform)
- 운영 모니터링 설정 완료

---

## Next Steps

1. **Units Generation 실행** (권장)
   - 5개 유닛 정의 및 의존성 명시
   - 유닛별 개발 순서 확정
   - 유닛별 스토리 매핑

2. **CONSTRUCTION PHASE 시작**
   - Unit 1 (Backend) 부터 시작
   - Functional Design → NFR Design → Code Generation
   - 유닛별 완료 후 다음 유닛 진행

3. **Build and Test**
   - 모든 유닛 완료 후 통합 테스트
   - 성능 테스트 및 최적화

---

**Workflow Planning Complete. Ready to proceed to Units Generation?**
