# Tech Stack Decisions - Unit 1: Backend API & Database

## Overview

테이블오더 서비스 백엔드의 기술 스택 선택 근거와 구성을 정의합니다. NFR 요구사항을 충족하기 위한 기술적 결정사항을 문서화합니다.

---

## 1. Core Technology Stack

### 1.1 Programming Language & Framework

**Python 3.11+**
- **선택 이유**:
  - 빠른 개발 속도
  - 풍부한 라이브러리 생태계
  - 비동기 지원 (asyncio)
  - 타입 힌팅 지원 (Python 3.10+)

**FastAPI**
- **선택 이유**:
  - 고성능 (Starlette 기반)
  - 자동 OpenAPI 문서 생성
  - 비동기 지원 (async/await)
  - Pydantic 통합 (데이터 검증)
  - 타입 힌팅 기반 개발

**대안 고려**:
- Django: 너무 무거움, 불필요한 기능 많음
- Flask: 비동기 지원 부족, 수동 설정 많음

---

### 1.2 ORM & Database

**SQLAlchemy 2.0**
- **선택 이유**:
  - 강력한 ORM 기능
  - 비동기 지원 (asyncio)
  - 복잡한 쿼리 지원
  - 마이그레이션 도구 (Alembic)

**PostgreSQL 15+**
- **선택 이유**:
  - ACID 트랜잭션 보장
  - JSON 지원 (JSONB)
  - 풍부한 인덱스 타입
  - Multi-AZ 지원 (RDS)
  - 무료 오픈소스

**대안 고려**:
- MySQL: JSON 지원 부족, 트랜잭션 성능 낮음
- MongoDB: NoSQL, 트랜잭션 복잡도 높음

---

### 1.3 Authentication & Security

**PyJWT**
- **선택 이유**:
  - RS256 알고리즘 지원
  - 가볍고 빠름
  - 표준 JWT 스펙 준수

**bcrypt**
- **선택 이유**:
  - 업계 표준 비밀번호 해싱
  - Salt 자동 생성
  - Cost factor 조정 가능

**대안 고려**:
- Argon2: 더 안전하지만 복잡도 높음
- PBKDF2: bcrypt보다 느림

---

## 2. Event-Driven Architecture

### 2.1 EventBus (Development)

**In-memory EventBus**
- **구현**: Python dict + asyncio Queue
- **사용 환경**: 로컬 개발, 초기 테스트
- **장점**: 단순함, 의존성 없음
- **단점**: 단일 서버만 지원, 이벤트 손실 가능

---

### 2.2 EventBus (Production)

**RabbitMQ**
- **선택 이유**:
  - 메시지 영속화 (이벤트 손실 방지)
  - 재시도 메커니즘 내장
  - Dead Letter Queue 지원
  - 관리 UI 제공
  - AWS Amazon MQ 지원

**구성**:
- Exchange: `table-order-events` (Topic)
- Queue: `order-events-queue`
- Routing Key: `order.created`, `order.status_changed`

**대안 고려**:
- Redis Pub/Sub: 메시지 영속화 없음, 이벤트 손실 가능
- AWS SNS/SQS: 클라우드 종속, 복잡도 높음
- Kafka: 오버킬, 소규모 시스템에 부적합

---

### 2.3 SSE (Server-Sent Events)

**FastAPI StreamingResponse**
- **선택 이유**:
  - FastAPI 내장 기능
  - 단방향 실시간 통신 (서버 → 클라이언트)
  - WebSocket보다 단순함
  - 자동 재연결 (브라우저 지원)

**구현**:
```python
@router.get("/api/admin/orders/stream")
async def stream_orders(store_id: str):
    async def event_generator():
        async for event in sse_publisher.subscribe(store_id):
            yield f"data: {json.dumps(event)}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

**대안 고려**:
- WebSocket: 양방향 통신 불필요, 복잡도 높음
- Polling: 비효율적, 서버 부하 높음

---

## 3. Caching & Performance

### 3.1 Redis

**사용 목적**:
- 쿼리 캐싱 (OrderHistory 조회)
- Rate Limiting (사용자별 요청 제한)
- 세션 저장 (향후, 필요 시)

**캐싱 전략**:
- Cache-Aside Pattern
- TTL: 5분 (OrderHistory)
- Invalidation: 데이터 변경 시 캐시 삭제

**Redis 구성**:
- 버전: Redis 7.0+
- 배포: AWS ElastiCache (프로덕션)
- 로컬: Docker Compose

---

### 3.2 Database Connection Pool

**SQLAlchemy Connection Pool**
- **풀 크기**: 50개
- **타임아웃**: 60초
- **재시도**: 3회 (지수 백오프)

**설정**:
```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=50,
    max_overflow=10,
    pool_timeout=60,
    pool_recycle=3600,
    echo=False
)
```

---

## 4. Monitoring & Observability

### 4.1 Logging

**Python logging**
- **로그 레벨**: INFO (프로덕션), DEBUG (개발)
- **로그 포맷**: JSON (구조화된 로그)
- **로그 파일**: `/var/log/table-order/app.log`
- **로그 로테이션**: 매일 또는 100MB 초과 시

**로그 구조**:
```json
{
  "timestamp": "2026-02-09T15:00:00Z",
  "level": "INFO",
  "message": "Order created",
  "order_id": 123,
  "table_id": 5,
  "user_id": 10
}
```

---

### 4.2 Monitoring

**Prometheus**
- **메트릭 수집**:
  - API 응답 시간 (histogram)
  - 요청 수 (counter)
  - 에러율 (gauge)
  - DB 쿼리 시간 (histogram)

**Grafana**
- **대시보드**:
  - API 성능 대시보드
  - 에러 모니터링 대시보드
  - DB 성능 대시보드
  - 비즈니스 메트릭 (주문 수, 매출)

**Prometheus Exporter**:
- `prometheus-fastapi-instrumentator` (FastAPI 메트릭)
- `postgres_exporter` (PostgreSQL 메트릭)

---

### 4.3 Alerting

**Alertmanager (Prometheus)**
- **알림 채널**: Slack
- **알림 조건**:
  - API 응답 시간 > 3초 (5분 이상)
  - 에러율 > 5% (5분 이상)
  - DB 연결 실패
  - RDS Failover

**Slack Webhook**:
```yaml
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'
        channel: '#alerts'
        title: 'Table Order Alert'
```

---

## 5. Deployment & Infrastructure

### 5.1 Containerization

**Docker**
- **Base Image**: `python:3.11-slim`
- **Multi-stage Build**: 빌드 크기 최소화
- **Health Check**: `/health` 엔드포인트

**Dockerfile**:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### 5.2 Local Development

**Docker Compose**
- **서비스**:
  - `api`: FastAPI 애플리케이션
  - `db`: PostgreSQL 15
  - `redis`: Redis 7.0
  - `rabbitmq`: RabbitMQ 3.12 (프로덕션 테스트용)

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/tableorder
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=tableorder
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7.0
    ports:
      - "6379:6379"
  
  rabbitmq:
    image: rabbitmq:3.12-management
    ports:
      - "5672:5672"
      - "15672:15672"

volumes:
  postgres_data:
```

---

### 5.3 CI/CD

**GitHub Actions**
- **트리거**: `main` 브랜치 push
- **단계**:
  1. Checkout 코드
  2. Python 3.11 설치
  3. 의존성 설치 (`pip install -r requirements.txt`)
  4. 린트 (`flake8`)
  5. 테스트 (`pytest`)
  6. Docker 이미지 빌드
  7. 배포 (향후)

**.github/workflows/ci.yml**:
```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: flake8 app/
      - run: pytest tests/
```

---

### 5.4 Environment Configuration

**.env 파일**
- `.env.development` (로컬 개발)
- `.env.test` (테스트)
- `.env.production` (프로덕션, Git 제외)

**환경 변수**:
```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/tableorder

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://user:pass@localhost:5672

# JWT
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ALGORITHM=RS256
JWT_EXPIRATION_HOURS=16

# CORS
CORS_ORIGINS=https://customer.example.com,https://admin.example.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/table-order/app.log
```

---

## 6. Database Configuration

### 6.1 RDS Configuration (Production)

**인스턴스 타입**:
- 초기: `db.t3.medium` (2 vCPU, 4GB RAM)
- 성장 시: `db.t3.large` (2 vCPU, 8GB RAM)

**Multi-AZ**:
- 활성화 (99.99% 가용성)
- Primary + Standby (자동 Failover)

**백업**:
- 자동 백업: 매일 새벽 3시
- 보관 기간: 7일
- 스냅샷: 수동 생성 (주요 배포 전)

**암호화**:
- Encryption at Rest: 활성화 (AES-256)
- Encryption in Transit: SSL/TLS 강제

**파라미터 그룹**:
```
max_connections = 200
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 5MB
min_wal_size = 1GB
max_wal_size = 4GB
```

---

### 6.2 Database Migration

**Alembic**
- **마이그레이션 도구**: SQLAlchemy 공식 도구
- **버전 관리**: Git에 마이그레이션 파일 포함
- **자동 생성**: `alembic revision --autogenerate`

**마이그레이션 명령**:
```bash
# 마이그레이션 생성
alembic revision --autogenerate -m "Add order table"

# 마이그레이션 적용
alembic upgrade head

# 롤백
alembic downgrade -1
```

---

## 7. Image Storage

### 7.1 Local File System (Initial)

**저장 경로**: `/uploads/menus/`
**파일명**: `{UUID}.{extension}`
**서빙**: FastAPI StaticFiles

**구현**:
```python
from fastapi.staticfiles import StaticFiles

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

---

### 7.2 Image Processing

**Pillow (PIL)**
- **리사이징**: 300x300px (썸네일)
- **압축**: JPEG 80% 품질
- **포맷 변환**: PNG → JPEG

**구현**:
```python
from PIL import Image

def create_thumbnail(image_path: str, thumbnail_path: str):
    img = Image.open(image_path)
    img.thumbnail((300, 300))
    img.save(thumbnail_path, "JPEG", quality=80)
```

---

### 7.3 S3 Migration (Future)

**향후 확장**:
- 로컬 파일 시스템 → S3 마이그레이션
- CloudFront CDN 추가
- 이미지 URL: `https://cdn.example.com/menus/{uuid}.jpg`

---

## 8. Testing Stack

### 8.1 Unit Testing

**pytest**
- **테스트 프레임워크**: Python 표준
- **비동기 지원**: `pytest-asyncio`
- **커버리지**: `pytest-cov`

**테스트 구조**:
```
tests/
├── unit/
│   ├── services/
│   │   ├── test_authentication_service.py
│   │   ├── test_menu_service.py
│   │   └── test_create_order_service.py
│   └── models/
│       └── test_order.py
├── integration/
│   ├── test_customer_api.py
│   ├── test_admin_api.py
│   └── test_superadmin_api.py
└── e2e/
    └── test_order_flow.py
```

---

### 8.2 API Testing

**httpx**
- **HTTP 클라이언트**: 비동기 지원
- **FastAPI 테스트**: `TestClient` 대체

**Fixture**:
```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
```

---

### 8.3 Database Testing

**pytest-postgresql**
- **테스트 DB**: 임시 PostgreSQL 인스턴스
- **격리**: 각 테스트마다 독립적인 DB

**Fixture**:
```python
@pytest.fixture
async def db_session():
    engine = create_async_engine("postgresql+asyncpg://test:test@localhost/test")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = sessionmaker(engine, class_=AsyncSession)
    async with async_session() as session:
        yield session
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
```

---

## 9. Development Tools

### 9.1 Code Quality

**Black**
- **코드 포매터**: 자동 포맷팅
- **설정**: `pyproject.toml`

**Flake8**
- **린터**: PEP 8 준수 확인
- **설정**: `.flake8`

**mypy**
- **타입 체커**: 타입 힌팅 검증
- **설정**: `mypy.ini`

---

### 9.2 IDE Configuration

**VS Code**
- **확장**: Python, Pylance, Black Formatter
- **설정**: `.vscode/settings.json`

```json
{
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true
}
```

---

## 10. Dependency Management

### 10.1 Requirements

**requirements.txt**:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy[asyncio]==2.0.23
asyncpg==0.29.0
alembic==1.12.1
pydantic==2.5.0
pydantic-settings==2.1.0
pyjwt[crypto]==2.8.0
bcrypt==4.1.1
redis==5.0.1
aio-pika==9.3.1
pillow==10.1.0
python-multipart==0.0.6
prometheus-fastapi-instrumentator==6.1.0
```

**requirements-dev.txt**:
```
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
httpx==0.25.2
black==23.11.0
flake8==6.1.0
mypy==1.7.1
```

---

## Summary

### 기술 스택 요약

| 카테고리 | 기술 | 버전 |
|---------|------|------|
| **Language** | Python | 3.11+ |
| **Framework** | FastAPI | 0.104+ |
| **ORM** | SQLAlchemy | 2.0+ |
| **Database** | PostgreSQL | 15+ |
| **Cache** | Redis | 7.0+ |
| **Message Queue** | RabbitMQ | 3.12+ |
| **Auth** | PyJWT | 2.8+ |
| **Password** | bcrypt | 4.1+ |
| **Image** | Pillow | 10.1+ |
| **Monitoring** | Prometheus + Grafana | Latest |
| **Testing** | pytest | 7.4+ |
| **CI/CD** | GitHub Actions | - |
| **Container** | Docker | Latest |

### 주요 결정사항

1. **FastAPI**: 고성능, 비동기, 자동 문서화
2. **PostgreSQL**: ACID 트랜잭션, Multi-AZ 지원
3. **RabbitMQ**: 메시지 영속화, 재시도, 다중 서버 지원
4. **Redis**: 쿼리 캐싱, Rate Limiting
5. **RS256 JWT**: 비대칭키, 보안 강화
6. **Prometheus + Grafana**: 오픈소스 모니터링
7. **GitHub Actions**: 무료 CI/CD
8. **Docker Compose**: 로컬 개발 환경

---

**End of Tech Stack Decisions Document**
