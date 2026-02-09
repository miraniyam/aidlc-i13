# Infrastructure Design - Unit 1: Backend API & Database

## Overview

테이블오더 서비스 백엔드의 인프라 설계를 정의합니다. 로컬 개발 환경(Docker Compose)을 중심으로 설계하며, 향후 AWS 프로덕션 환경으로 확장 가능한 구조를 제시합니다.

---

## 1. Deployment Environment

### 1.1 환경 구성

**현재 범위**: 로컬 개발 환경만

**환경 목록**:
- **Local Development**: Docker Compose (개발자 로컬 머신)

**향후 확장 가능**:
- **Staging**: AWS (테스트 환경)
- **Production**: AWS (운영 환경)

---

### 1.2 로컬 개발 환경 (Docker Compose)

**목적**: 개발자가 빠르게 전체 스택을 로컬에서 실행

**구성 요소**:
1. FastAPI 애플리케이션 (Python 3.11)
2. PostgreSQL 15 (데이터베이스)
3. Redis 7.0 (캐싱, Rate Limiting)
4. RabbitMQ 3.12 (이벤트 버스, 프로덕션 테스트용)

---

## 2. Compute Infrastructure

### 2.1 로컬 개발 (Docker Compose)

**FastAPI 컨테이너**:
```yaml
api:
  build: .
  container_name: table-order-api
  ports:
    - "8000:8000"
  environment:
    - DATABASE_URL=postgresql+asyncpg://tableorder:password@db:5432/tableorder
    - REDIS_URL=redis://redis:6379
    - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    - ENV=development
  volumes:
    - ./app:/app/app
    - ./uploads:/app/uploads
  depends_on:
    - db
    - redis
    - rabbitmq
  command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**특징**:
- Hot Reload (코드 변경 시 자동 재시작)
- 볼륨 마운트 (로컬 코드 변경 즉시 반영)
- 의존성 순서 (db, redis, rabbitmq 먼저 시작)

---

### 2.2 향후 AWS 프로덕션 (참고용)

**옵션 1: EC2**
- 인스턴스 타입: t3.medium (2 vCPU, 4GB RAM)
- Auto Scaling Group (최소 2개, 최대 4개)
- Application Load Balancer

**옵션 2: ECS Fargate**
- Task Definition: 2 vCPU, 4GB RAM
- Service Auto Scaling
- Application Load Balancer

**권장**: ECS Fargate (서버리스, 관리 부담 적음)

---

## 3. Database Infrastructure

### 3.1 로컬 개발 (Docker Compose)

**PostgreSQL 컨테이너**:
```yaml
db:
  image: postgres:15
  container_name: table-order-db
  environment:
    - POSTGRES_USER=tableorder
    - POSTGRES_PASSWORD=password
    - POSTGRES_DB=tableorder
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U tableorder"]
    interval: 10s
    timeout: 5s
    retries: 5
```

**특징**:
- 데이터 영속화 (Docker 볼륨)
- 헬스 체크 (연결 가능 여부 확인)
- 포트 노출 (로컬에서 직접 접속 가능)

---

### 3.2 향후 AWS 프로덕션 (참고용)

**RDS PostgreSQL**:
- 인스턴스 타입: db.t3.medium
- Multi-AZ: 활성화 (99.99% 가용성)
- 스토리지: 100GB gp3 (확장 가능)
- 백업: 자동 백업 (매일, 7일 보관)
- 암호화: Encryption at Rest (AES-256)

---

## 4. Cache Infrastructure

### 4.1 로컬 개발 (Docker Compose)

**Redis 컨테이너**:
```yaml
redis:
  image: redis:7.0
  container_name: table-order-redis
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5
```

**특징**:
- AOF 영속화 (appendonly yes)
- 헬스 체크 (ping 응답 확인)
- 데이터 볼륨 (재시작 시 데이터 유지)

---

### 4.2 향후 AWS 프로덕션 (참고용)

**ElastiCache Redis**:
- 노드 타입: cache.t3.medium
- 클러스터 모드: 비활성화 (단일 노드)
- 백업: 자동 백업 (매일)
- 암호화: In-transit + At-rest

---

## 5. Message Queue Infrastructure

### 5.1 로컬 개발 (Docker Compose)

**RabbitMQ 컨테이너**:
```yaml
rabbitmq:
  image: rabbitmq:3.12-management
  container_name: table-order-rabbitmq
  ports:
    - "5672:5672"    # AMQP
    - "15672:15672"  # Management UI
  environment:
    - RABBITMQ_DEFAULT_USER=guest
    - RABBITMQ_DEFAULT_PASS=guest
  volumes:
    - rabbitmq_data:/var/lib/rabbitmq
  healthcheck:
    test: ["CMD", "rabbitmq-diagnostics", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5
```

**특징**:
- Management UI (http://localhost:15672)
- 데이터 영속화 (볼륨)
- 헬스 체크

---

### 5.2 향후 AWS 프로덕션 (참고용)

**Amazon MQ (RabbitMQ)**:
- 브로커 타입: mq.t3.micro
- 배포 모드: Single-instance (개발), Active/Standby (프로덕션)
- 스토리지: 20GB EBS
- 자동 백업: 활성화

---

## 6. Network Infrastructure

### 6.1 로컬 개발 (Docker Compose)

**Docker Network**:
```yaml
networks:
  default:
    name: table-order-network
    driver: bridge
```

**특징**:
- 모든 컨테이너가 같은 네트워크
- 컨테이너 이름으로 통신 (예: `db`, `redis`)
- 호스트에서 포트로 접근 (예: `localhost:8000`)

---

### 6.2 향후 AWS 프로덕션 (참고용)

**VPC 구성**:
```
VPC (10.0.0.0/16)
├── Public Subnet (10.0.1.0/24) - ALB
├── Private Subnet 1 (10.0.10.0/24) - ECS, EC2
├── Private Subnet 2 (10.0.11.0/24) - RDS Primary
└── Private Subnet 3 (10.0.12.0/24) - RDS Standby
```

**Security Groups**:
- ALB SG: 인터넷 → 443 (HTTPS)
- ECS SG: ALB → 8000
- RDS SG: ECS → 5432
- Redis SG: ECS → 6379
- RabbitMQ SG: ECS → 5672

---

## 7. Monitoring Infrastructure

### 7.1 로컬 개발 (Docker Compose)

**Prometheus + Grafana (선택사항)**:
```yaml
prometheus:
  image: prom/prometheus:latest
  container_name: table-order-prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'

grafana:
  image: grafana/grafana:latest
  container_name: table-order-grafana
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
  volumes:
    - grafana_data:/var/lib/grafana
  depends_on:
    - prometheus
```

**특징**:
- Prometheus: 메트릭 수집 (http://localhost:9090)
- Grafana: 대시보드 (http://localhost:3000)
- 선택사항 (개발 시 필요하면 추가)

---

### 7.2 향후 AWS 프로덕션 (참고용)

**CloudWatch**:
- 로그: CloudWatch Logs (ECS 로그 스트림)
- 메트릭: CloudWatch Metrics (CPU, 메모리, 네트워크)
- 알림: CloudWatch Alarms → SNS → Slack

**Prometheus + Grafana (ECS)**:
- Prometheus: ECS Task (메트릭 수집)
- Grafana: ECS Task (대시보드)
- ALB: Prometheus, Grafana 엔드포인트

---

## 8. Storage Infrastructure

### 8.1 로컬 개발 (Docker Compose)

**이미지 파일 저장**:
```yaml
api:
  volumes:
    - ./uploads:/app/uploads
```

**특징**:
- 로컬 파일 시스템 (./uploads 디렉토리)
- 호스트와 컨테이너 간 공유
- Git 제외 (.gitignore에 추가)

---

### 8.2 향후 AWS 프로덕션 (참고용)

**S3 + CloudFront**:
- S3 버킷: 이미지 저장
- CloudFront: CDN (빠른 이미지 전송)
- 버전 관리: 활성화
- 라이프사이클: 90일 후 Glacier로 이동

---

## 9. Complete Docker Compose Configuration

### 9.1 docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: table-order-api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://tableorder:password@db:5432/tableorder
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
      - JWT_PRIVATE_KEY_PATH=/app/keys/private.pem
      - JWT_PUBLIC_KEY_PATH=/app/keys/public.pem
      - JWT_ALGORITHM=RS256
      - JWT_EXPIRATION_HOURS=16
      - CORS_ORIGINS=http://localhost:3000,http://localhost:3001
      - RATE_LIMIT_PER_MINUTE=100
      - LOG_LEVEL=INFO
      - ENV=development
    volumes:
      - ./app:/app/app
      - ./uploads:/app/uploads
      - ./keys:/app/keys
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    networks:
      - table-order-network

  db:
    image: postgres:15
    container_name: table-order-db
    environment:
      - POSTGRES_USER=tableorder
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=tableorder
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tableorder"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - table-order-network

  redis:
    image: redis:7.0
    container_name: table-order-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - table-order-network

  rabbitmq:
    image: rabbitmq:3.12-management
    container_name: table-order-rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=guest
      - RABBITMQ_DEFAULT_PASS=guest
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - table-order-network

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:

networks:
  table-order-network:
    driver: bridge
```

---

### 9.2 Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 업로드 디렉토리 생성
RUN mkdir -p /app/uploads/menus

# 헬스 체크
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# 포트 노출
EXPOSE 8000

# 실행 명령
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### 9.3 .env.example

```bash
# Database
DATABASE_URL=postgresql+asyncpg://tableorder:password@localhost:5432/tableorder

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# JWT
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ALGORITHM=RS256
JWT_EXPIRATION_HOURS=16

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/table-order/app.log

# Environment
ENV=development
```

---

## 10. Infrastructure Management

### 10.1 시작 및 종료

**시작**:
```bash
# 전체 스택 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f api

# 특정 서비스만 시작
docker-compose up -d db redis
```

**종료**:
```bash
# 전체 스택 종료
docker-compose down

# 볼륨까지 삭제 (데이터 초기화)
docker-compose down -v
```

---

### 10.2 데이터베이스 마이그레이션

```bash
# 마이그레이션 생성
docker-compose exec api alembic revision --autogenerate -m "Add order table"

# 마이그레이션 적용
docker-compose exec api alembic upgrade head

# 롤백
docker-compose exec api alembic downgrade -1
```

---

### 10.3 데이터베이스 접속

```bash
# psql 접속
docker-compose exec db psql -U tableorder -d tableorder

# 또는 로컬에서 직접 접속
psql -h localhost -U tableorder -d tableorder
```

---

## 11. Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Host Machine                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Docker Network (bridge)                   │  │
│  │                                                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │   API    │  │   DB     │  │  Redis   │        │  │
│  │  │ :8000    │  │ :5432    │  │  :6379   │        │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘        │  │
│  │       │             │             │               │  │
│  │       └─────────────┼─────────────┘               │  │
│  │                     │                             │  │
│  │  ┌──────────────────▼─────────────┐              │  │
│  │  │        RabbitMQ                │              │  │
│  │  │  :5672 (AMQP)                  │              │  │
│  │  │  :15672 (Management UI)        │              │  │
│  │  └────────────────────────────────┘              │  │
│  │                                                     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Docker Volumes                            │  │
│  │  - postgres_data                                  │  │
│  │  - redis_data                                     │  │
│  │  - rabbitmq_data                                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Host Volumes                              │  │
│  │  - ./app (코드)                                   │  │
│  │  - ./uploads (이미지)                             │  │
│  │  - ./keys (JWT 키)                                │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Summary

### 인프라 구성 요약

| 컴포넌트 | 로컬 개발 | 향후 AWS 프로덕션 |
|---------|----------|------------------|
| **Compute** | Docker (FastAPI) | ECS Fargate |
| **Database** | PostgreSQL 15 (Docker) | RDS PostgreSQL (Multi-AZ) |
| **Cache** | Redis 7.0 (Docker) | ElastiCache Redis |
| **Message Queue** | RabbitMQ 3.12 (Docker) | Amazon MQ (RabbitMQ) |
| **Network** | Docker Bridge | VPC + ALB |
| **Storage** | 로컬 파일 시스템 | S3 + CloudFront |
| **Monitoring** | Prometheus + Grafana (선택) | CloudWatch + Prometheus |

### 주요 특징

1. **로컬 개발 우선**: Docker Compose로 전체 스택 실행
2. **Hot Reload**: 코드 변경 시 자동 재시작
3. **데이터 영속화**: Docker 볼륨 사용
4. **헬스 체크**: 모든 서비스 헬스 체크 설정
5. **확장 가능**: AWS 프로덕션 환경으로 쉽게 마이그레이션

---

**End of Infrastructure Design Document**
