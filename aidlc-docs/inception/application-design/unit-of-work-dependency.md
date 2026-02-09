# Unit of Work Dependency - 테이블오더 서비스

## Dependency Matrix

| Unit | Unit 1 (Backend) | Unit 2 (Customer UI) | Unit 3 (Admin UI) | Unit 4 (SuperAdmin UI) | Unit 5 (Infrastructure) |
|------|------------------|----------------------|-------------------|------------------------|-------------------------|
| **Unit 1 (Backend)** | - | Provides API | Provides API | Provides API | Deployed on |
| **Unit 2 (Customer UI)** | Consumes API | - | - | - | Deployed on (optional) |
| **Unit 3 (Admin UI)** | Consumes API | - | - | - | Deployed on (optional) |
| **Unit 4 (SuperAdmin UI)** | Consumes API | - | - | - | Deployed on (optional) |
| **Unit 5 (Infrastructure)** | Hosts | Hosts (optional) | Hosts (optional) | Hosts (optional) | - |

### Dependency Legend
- **Provides API**: 백엔드가 프론트엔드에 RESTful API 제공
- **Consumes API**: 프론트엔드가 백엔드 API 호출
- **Deployed on**: 애플리케이션이 인프라에 배포됨
- **Hosts**: 인프라가 애플리케이션을 호스팅

---

## Dependency Details

### Unit 1: Backend API & Database

**Upstream Dependencies**: None (독립적)

**Downstream Dependencies**:
- **Unit 2 (Customer UI)**: Customer API 제공
  - POST /api/customer/login
  - GET /api/menus
  - POST /api/orders
  - GET /api/orders
- **Unit 3 (Admin UI)**: Admin API 제공
  - POST /api/admin/login
  - GET /api/admin/orders/stream (SSE)
  - PATCH /api/admin/orders/{order_id}/status
  - DELETE /api/admin/orders/{order_id}
  - POST /api/admin/tables/{table_id}/complete-session
  - GET /api/admin/tables/{table_id}/order-history
  - GET /api/admin/menus
  - POST /api/admin/menus
  - PATCH /api/admin/menus/{menu_id}
  - DELETE /api/admin/menus/{menu_id}
- **Unit 4 (SuperAdmin UI)**: SuperAdmin API 제공
  - POST /api/superadmin/login
  - GET /api/superadmin/admins
  - POST /api/superadmin/admins
  - PATCH /api/superadmin/admins/{admin_id}/activate
  - PATCH /api/superadmin/admins/{admin_id}/deactivate
- **Unit 5 (Infrastructure)**: 배포 대상
  - EC2 or ECS에 배포
  - RDS PostgreSQL 연결
  - ElastiCache Redis 연결

**Shared Artifacts**:
- **OpenAPI Schema**: `openapi.json` (프론트엔드 타입 생성용)

---

### Unit 2: Customer Frontend

**Upstream Dependencies**:
- **Unit 1 (Backend)**: Customer API 의존
  - 메뉴 조회, 주문 생성, 주문 내역 조회
  - OpenAPI 스키마 import

**Downstream Dependencies**: None

**Integration Points**:
- **API Base URL**: 환경 변수로 설정 (예: `VITE_API_BASE_URL=http://localhost:8000`)
- **Authentication**: JWT 토큰 (localStorage 저장)
- **Polling**: 주문 상태 30초 간격 폴링

---

### Unit 3: Admin Frontend

**Upstream Dependencies**:
- **Unit 1 (Backend)**: Admin API 의존
  - 주문 모니터링, 주문 관리, 테이블 관리, 메뉴 관리
  - OpenAPI 스키마 import
  - SSE 연결

**Downstream Dependencies**: None

**Integration Points**:
- **API Base URL**: 환경 변수로 설정
- **Authentication**: JWT 토큰 (localStorage 저장)
- **Real-time**: SSE 연결 (EventSource)

---

### Unit 4: SuperAdmin Frontend

**Upstream Dependencies**:
- **Unit 1 (Backend)**: SuperAdmin API 의존
  - 관리자 계정 관리
  - OpenAPI 스키마 import

**Downstream Dependencies**: None

**Integration Points**:
- **API Base URL**: 환경 변수로 설정
- **Authentication**: JWT 토큰 (localStorage 저장)

---

### Unit 5: Infrastructure (Terraform)

**Upstream Dependencies**: None (독립적)

**Downstream Dependencies**:
- **Unit 1 (Backend)**: 백엔드 배포 대상
  - EC2 or ECS
  - RDS PostgreSQL
  - ElastiCache Redis
- **Unit 2, 3, 4 (Frontend)**: 프론트엔드 배포 대상 (optional)
  - S3 + CloudFront (정적 파일 호스팅)

**Provisioned Resources**:
- VPC, Subnets, Security Groups
- EC2 or ECS Fargate
- RDS PostgreSQL
- ElastiCache Redis
- S3 (optional)
- ALB (optional)

---

## Integration Contracts

### API Contract (OpenAPI)

**Source**: Unit 1 (Backend)  
**Consumers**: Unit 2, Unit 3, Unit 4 (Frontend)

**Contract Definition**:
- **Format**: OpenAPI 3.0
- **Generation**: FastAPI auto-generated
- **Export Path**: `table-order-backend/openapi.json`
- **Usage**: 프론트엔드에서 TypeScript 타입 자동 생성

**Type Generation Command** (Frontend):
```bash
npx openapi-typescript ../table-order-backend/openapi.json -o src/types/api.ts
```

**Contract Update Process**:
1. Backend API 변경 시 `openapi.json` 재생성
2. 프론트엔드에서 타입 재생성
3. 타입 불일치 시 컴파일 에러 발생 → 수정

---

### Authentication Contract (JWT)

**Provider**: Unit 1 (Backend)  
**Consumers**: Unit 2, Unit 3, Unit 4 (Frontend)

**Token Format**:
```json
{
  "sub": "user_id or table_id",
  "role": "customer | store_admin | super_admin",
  "store_id": "uuid (for store_admin)",
  "table_id": "uuid (for customer)",
  "exp": 1234567890
}
```

**Token Lifetime**: 16 hours

**Storage**: localStorage (Frontend)

**Header**: `Authorization: Bearer <token>`

---

### Real-time Contract (SSE)

**Provider**: Unit 1 (Backend)  
**Consumer**: Unit 3 (Admin UI)

**Endpoint**: GET /api/admin/orders/stream

**Event Format**:
```json
{
  "event": "OrderCreated | OrderStatusChanged",
  "data": {
    "order_id": "uuid",
    "table_id": "uuid",
    "status": "pending | preparing | cooked | delivered",
    "total_amount": 50000,
    "created_at": "2026-02-09T15:00:00Z"
  }
}
```

**Connection Management**:
- Frontend: EventSource API
- Auto-reconnect on disconnect
- Heartbeat every 30s

---

### Database Contract

**Provider**: Unit 5 (Infrastructure - RDS PostgreSQL)  
**Consumer**: Unit 1 (Backend)

**Connection String**:
```
postgresql://<username>:<password>@<rds-endpoint>:5432/<database>
```

**Schema Management**: Alembic migrations (Backend)

---

### Cache Contract (Redis)

**Provider**: Unit 5 (Infrastructure - ElastiCache Redis)  
**Consumer**: Unit 1 (Backend)

**Usage**: SSE Pub/Sub for multi-instance scaling

**Connection String**:
```
redis://<redis-endpoint>:6379
```

**Pub/Sub Channels**:
- `order:created`
- `order:status_changed`

---

## Deployment Dependencies

### Development Environment

**Sequence**:
1. **Unit 1 (Backend)**: 로컬 실행 (PostgreSQL, Redis 로컬 또는 Docker)
2. **Unit 2, 3, 4 (Frontend)**: 로컬 실행 (Backend API 연결)

**No Infrastructure Unit needed** for local development.

---

### Production Environment

**Sequence**:
1. **Unit 5 (Infrastructure)**: Terraform apply (VPC, RDS, Redis, EC2/ECS)
2. **Unit 1 (Backend)**: 배포 (EC2/ECS)
3. **Unit 2, 3, 4 (Frontend)**: 배포 (S3 + CloudFront or Nginx)

**Infrastructure First**: 인프라 프로비저닝 후 애플리케이션 배포

---

## Parallel Development Opportunities

### Phase 1: Backend Development
- **Unit 1 (Backend)**: 단독 개발
- **Unit 5 (Infrastructure)**: 병렬 개발 가능 (Early strategy)

### Phase 2: Frontend Development
- **Unit 2 (Customer UI)**: 병렬 개발 가능
- **Unit 3 (Admin UI)**: 병렬 개발 가능

**Prerequisite**: Unit 1 (Backend) OpenAPI 스키마 생성 완료

### Phase 3: SuperAdmin Development
- **Unit 4 (SuperAdmin UI)**: 단독 개발

---

## Circular Dependency Check

### Analysis Result: ✅ No Circular Dependencies

**Dependency Graph**:
```
Unit 5 (Infrastructure)
    ↓ (hosts)
Unit 1 (Backend)
    ↓ (provides API)
Unit 2, 3, 4 (Frontend)
```

**Validation**:
- Unit 1 → Unit 2, 3, 4 (one-way)
- Unit 5 → Unit 1 (one-way)
- No cycles detected

---

## Integration Testing Strategy

### Incremental Integration Testing

**After Unit 1 (Backend) Complete**:
- Unit test: 각 서비스 단위 테스트
- Integration test: API 엔드포인트 테스트
- Contract test: OpenAPI 스키마 검증

**After Unit 2 (Customer UI) Complete**:
- Integration test: Customer UI ↔ Backend API
- E2E test: 고객 Journey (로그인 → 주문 → 내역 조회)

**After Unit 3 (Admin UI) Complete**:
- Integration test: Admin UI ↔ Backend API
- E2E test: 관리자 Journey (로그인 → 주문 모니터링 → 상태 변경)
- SSE test: 실시간 업데이트 검증

**After Unit 4 (SuperAdmin UI) Complete**:
- Integration test: SuperAdmin UI ↔ Backend API
- E2E test: 슈퍼 관리자 Journey (로그인 → 계정 관리)

**After Unit 5 (Infrastructure) Complete**:
- Infrastructure test: Terraform plan/apply 검증
- Deployment test: 실제 AWS 환경 배포 검증

**Final Integration Test**:
- End-to-end test: 전체 시스템 통합 테스트
- Performance test: 부하 테스트 (동시 사용자 10-50명)
- Security test: 인증/권한 검증

---

## Risk Assessment

### High-Risk Dependencies

1. **Unit 1 (Backend) → Unit 2, 3, 4 (Frontend)**
   - **Risk**: Backend API 변경 시 프론트엔드 영향
   - **Mitigation**: API Contract First, OpenAPI 스키마 버전 관리

2. **Unit 1 (Backend) → Unit 5 (Infrastructure)**
   - **Risk**: 인프라 변경 시 백엔드 재배포 필요
   - **Mitigation**: Infrastructure as Code, 환경 변수로 설정 분리

3. **Unit 3 (Admin UI) → Unit 1 (Backend SSE)**
   - **Risk**: SSE 연결 불안정 시 실시간 업데이트 실패
   - **Mitigation**: Auto-reconnect, Heartbeat, Redis Pub/Sub for scaling

### Medium-Risk Dependencies

1. **Unit 2, 3, 4 (Frontend) → Unit 1 (Backend Authentication)**
   - **Risk**: JWT 토큰 만료 시 재로그인 필요
   - **Mitigation**: Token refresh mechanism (optional)

---

## Summary

### Dependency Count
- **Unit 1 (Backend)**: 0 upstream, 4 downstream
- **Unit 2 (Customer UI)**: 1 upstream, 0 downstream
- **Unit 3 (Admin UI)**: 1 upstream, 0 downstream
- **Unit 4 (SuperAdmin UI)**: 1 upstream, 0 downstream
- **Unit 5 (Infrastructure)**: 0 upstream, 1 downstream

### Critical Path
```
Unit 5 (Infrastructure) → Unit 1 (Backend) → Unit 2, 3, 4 (Frontend)
```

### Parallel Development
- **Phase 1**: Unit 1 + Unit 5 (병렬)
- **Phase 2**: Unit 2 + Unit 3 (병렬)
- **Phase 3**: Unit 4 (단독)

### Integration Contracts
- **API Contract**: OpenAPI 3.0
- **Authentication**: JWT
- **Real-time**: SSE
- **Database**: PostgreSQL
- **Cache**: Redis Pub/Sub

---

**End of Unit of Work Dependency Document**
