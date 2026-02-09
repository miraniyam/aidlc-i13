# Deployment Architecture - Unit 1: Backend API & Database

## Overview

테이블오더 서비스 백엔드의 배포 아키텍처를 정의합니다. 로컬 개발 환경을 중심으로 설명하며, 향후 AWS 프로덕션 환경으로의 마이그레이션 경로를 제시합니다.

---

## 1. Local Development Architecture

### 1.1 아키텍처 다이어그램

```
Developer Machine
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  Browser                                                  │
│  http://localhost:8000/docs (Swagger UI)                 │
│  http://localhost:15672 (RabbitMQ Management)            │
│  http://localhost:3000 (Grafana, optional)               │
│                                                           │
│         │                                                 │
│         ▼                                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │         Docker Compose Stack                    │    │
│  │                                                   │    │
│  │  ┌──────────────────────────────────────────┐  │    │
│  │  │  FastAPI Container (Port 8000)           │  │    │
│  │  │  - uvicorn --reload                      │  │    │
│  │  │  - Volume: ./app (Hot Reload)            │  │    │
│  │  │  - Volume: ./uploads (Images)            │  │    │
│  │  └────────┬─────────────────────────────────┘  │    │
│  │           │                                     │    │
│  │           ├──────────┬──────────┬──────────┐   │    │
│  │           │          │          │          │   │    │
│  │  ┌────────▼───┐ ┌───▼──────┐ ┌─▼────────┐ │   │    │
│  │  │PostgreSQL  │ │  Redis   │ │RabbitMQ  │ │   │    │
│  │  │  :5432     │ │  :6379   │ │ :5672    │ │   │    │
│  │  │            │ │          │ │ :15672   │ │   │    │
│  │  └────────────┘ └──────────┘ └──────────┘ │   │    │
│  │                                             │   │    │
│  │  Volumes:                                   │   │    │
│  │  - postgres_data                            │   │    │
│  │  - redis_data                               │   │    │
│  │  - rabbitmq_data                            │   │    │
│  └─────────────────────────────────────────────┘   │    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

### 1.2 컴포넌트 배포

| 컴포넌트 | 컨테이너 | 포트 | 볼륨 |
|---------|---------|------|------|
| **FastAPI** | table-order-api | 8000 | ./app, ./uploads, ./keys |
| **PostgreSQL** | table-order-db | 5432 | postgres_data |
| **Redis** | table-order-redis | 6379 | redis_data |
| **RabbitMQ** | table-order-rabbitmq | 5672, 15672 | rabbitmq_data |

---

### 1.3 배포 절차

**1단계: 환경 설정**
```bash
# .env 파일 생성
cp .env.example .env

# JWT 키 생성
mkdir -p keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
```

**2단계: Docker Compose 시작**
```bash
# 전체 스택 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f api
```

**3단계: 데이터베이스 초기화**
```bash
# 마이그레이션 적용
docker-compose exec api alembic upgrade head

# 초기 데이터 생성 (선택사항)
docker-compose exec api python scripts/seed_data.py
```

**4단계: 접속 확인**
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- RabbitMQ Management: http://localhost:15672 (guest/guest)

---

## 2. AWS Production Architecture (향후 확장)

### 2.1 아키텍처 다이어그램

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                    AWS Cloud                             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Route 53 (DNS)                                   │  │
│  │  table-order-api.example.com                      │  │
│  └─────────────────┬─────────────────────────────────┘  │
│                    │                                     │
│                    ▼                                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Application Load Balancer (ALB)                  │  │
│  │  - HTTPS (443)                                    │  │
│  │  - SSL Certificate (ACM)                          │  │
│  └─────────────────┬─────────────────────────────────┘  │
│                    │                                     │
│         ┌──────────┴──────────┐                         │
│         │                     │                         │
│  ┌──────▼──────┐       ┌─────▼───────┐                 │
│  │  ECS Task 1 │       │ ECS Task 2  │                 │
│  │  (Fargate)  │       │  (Fargate)  │                 │
│  │  FastAPI    │       │  FastAPI    │                 │
│  └──────┬──────┘       └─────┬───────┘                 │
│         │                     │                         │
│         └──────────┬──────────┘                         │
│                    │                                     │
│         ┌──────────┼──────────┬──────────┐             │
│         │          │          │          │             │
│  ┌──────▼───┐ ┌───▼──────┐ ┌─▼────────┐ ┌──────────┐  │
│  │   RDS    │ │ElastiCache│ │Amazon MQ │ │    S3    │  │
│  │PostgreSQL│ │  Redis    │ │ RabbitMQ │ │ (Images) │  │
│  │(Multi-AZ)│ │           │ │          │ │          │  │
│  └──────────┘ └───────────┘ └──────────┘ └──────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  CloudWatch                                       │  │
│  │  - Logs, Metrics, Alarms                         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

### 2.2 AWS 서비스 매핑

| 로컬 개발 | AWS 프로덕션 | 설정 |
|----------|-------------|------|
| **Docker (FastAPI)** | ECS Fargate | 2 vCPU, 4GB RAM, Auto Scaling |
| **PostgreSQL** | RDS PostgreSQL | db.t3.medium, Multi-AZ |
| **Redis** | ElastiCache Redis | cache.t3.medium |
| **RabbitMQ** | Amazon MQ | mq.t3.micro, Active/Standby |
| **로컬 파일** | S3 + CloudFront | 이미지 저장 + CDN |
| **Docker Network** | VPC + ALB | Private Subnets, Security Groups |
| **로그** | CloudWatch Logs | 로그 스트림, 보관 30일 |

---

### 2.3 마이그레이션 경로

**Phase 1: 인프라 프로비저닝**
- Terraform으로 VPC, Subnets, Security Groups 생성
- RDS, ElastiCache, Amazon MQ 생성

**Phase 2: 컨테이너 이미지 빌드**
- Docker 이미지 빌드
- ECR (Elastic Container Registry)에 푸시

**Phase 3: ECS 배포**
- ECS Task Definition 생성
- ECS Service 생성 (Auto Scaling)
- ALB Target Group 연결

**Phase 4: DNS 설정**
- Route 53에 도메인 등록
- ALB에 연결

**Phase 5: 모니터링 설정**
- CloudWatch Logs 설정
- CloudWatch Alarms 설정 (CPU, 메모리, 에러율)
- SNS → Slack 알림 설정

---

## 3. Deployment Strategies

### 3.1 로컬 개발 배포

**전략**: Hot Reload
- 코드 변경 시 자동 재시작
- 볼륨 마운트로 즉시 반영
- 다운타임 없음 (개발 환경)

---

### 3.2 AWS 프로덕션 배포 (향후)

**전략**: Blue-Green Deployment
- 새 버전 배포 (Green)
- 헬스 체크 통과 확인
- ALB 트래픽 전환 (Blue → Green)
- 이전 버전 유지 (롤백 가능)

**대안**: Rolling Deployment
- 한 번에 하나씩 업데이트
- 점진적 배포
- 다운타임 최소화

---

## 4. Scaling Strategy

### 4.1 로컬 개발

**스케일링 불필요**
- 단일 개발자 환경
- 리소스 제한 없음

---

### 4.2 AWS 프로덕션 (향후)

**Horizontal Scaling (수평 확장)**:
- ECS Service Auto Scaling
- 트리거: CPU > 70%, 메모리 > 80%
- 최소 2개, 최대 4개 Task

**Vertical Scaling (수직 확장)**:
- RDS 인스턴스 크기 증가
- ElastiCache 노드 타입 변경

---

## 5. Disaster Recovery

### 5.1 로컬 개발

**백업**:
- Docker 볼륨 백업 (수동)
- 코드는 Git으로 관리

**복구**:
```bash
# 볼륨 삭제 후 재생성
docker-compose down -v
docker-compose up -d
docker-compose exec api alembic upgrade head
```

---

### 5.2 AWS 프로덕션 (향후)

**백업**:
- RDS 자동 백업 (매일, 7일 보관)
- S3 버전 관리 (이미지)

**복구**:
- RDS 스냅샷 복원
- Multi-AZ 자동 Failover (1-2분)

**RTO/RPO**:
- RTO: 4시간
- RPO: 실시간 (Multi-AZ 복제)

---

## 6. Security

### 6.1 로컬 개발

**보안 수준**: 낮음 (개발 환경)
- 기본 비밀번호 사용
- HTTP (HTTPS 불필요)
- 방화벽 없음

---

### 6.2 AWS 프로덕션 (향후)

**보안 수준**: 높음
- HTTPS (TLS 1.2+)
- Security Groups (최소 권한)
- RDS 암호화 (At-rest)
- Secrets Manager (비밀번호 관리)
- WAF (Web Application Firewall)

---

## 7. Monitoring & Logging

### 7.1 로컬 개발

**로깅**:
```bash
# 실시간 로그
docker-compose logs -f api

# 특정 서비스 로그
docker-compose logs db
```

**모니터링**:
- Prometheus + Grafana (선택사항)
- Docker stats (리소스 사용량)

---

### 7.2 AWS 프로덕션 (향후)

**로깅**:
- CloudWatch Logs (ECS 로그 스트림)
- 보관 기간: 30일
- 로그 그룹: `/ecs/table-order-api`

**모니터링**:
- CloudWatch Metrics (CPU, 메모리, 네트워크)
- CloudWatch Alarms (임계값 초과 시 알림)
- Prometheus + Grafana (커스텀 메트릭)

**알림**:
- CloudWatch Alarms → SNS → Slack
- 알림 조건: API 응답 시간 > 3초, 에러율 > 5%

---

## Summary

### 배포 아키텍처 요약

| 항목 | 로컬 개발 | AWS 프로덕션 (향후) |
|-----|----------|-------------------|
| **배포 방식** | Docker Compose | ECS Fargate |
| **스케일링** | 불필요 | Auto Scaling (2-4 Tasks) |
| **배포 전략** | Hot Reload | Blue-Green |
| **백업** | 수동 | 자동 (매일) |
| **복구 시간** | 즉시 | 4시간 (RTO) |
| **보안** | 낮음 | 높음 (HTTPS, 암호화) |
| **모니터링** | Docker logs | CloudWatch + Prometheus |

### 주요 특징

1. **로컬 우선**: Docker Compose로 빠른 개발
2. **확장 가능**: AWS로 쉽게 마이그레이션
3. **고가용성**: Multi-AZ RDS, Auto Scaling (프로덕션)
4. **보안**: HTTPS, 암호화, Security Groups (프로덕션)
5. **모니터링**: CloudWatch + Prometheus (프로덕션)

---

**End of Deployment Architecture Document**
