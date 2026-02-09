# Unit 5 Infrastructure Design Plan - 테이블오더 서비스

## Unit Context
- **Unit Name**: Unit 5 - Infrastructure (Terraform)
- **Repository**: table-order-infrastructure
- **Type**: Infrastructure as Code
- **Purpose**: AWS 인프라 프로비저닝 및 배포 환경 구성

## Dependencies
- **Upstream**: None (독립적으로 개발 가능)
- **Downstream**: Unit 1 (Backend API & Database) 배포 대상

## Infrastructure Requirements (from Requirements & Design)

### Compute Requirements
- Backend API 서버 호스팅 (Python FastAPI)
- 중규모 동시 사용자 지원 (10-50명)
- 응답 시간 2-3초 이내

### Database Requirements
- PostgreSQL 15+
- 9개 데이터 모델 지원
- Multi-AZ 가용성

### Cache Requirements
- Redis (SSE Pub/Sub용)
- 실시간 이벤트 브로드캐스팅

### Storage Requirements
- 메뉴 이미지 저장 (로컬 파일 시스템 또는 S3)

### Network Requirements
- VPC 격리
- Public/Private Subnet 분리
- Security Groups

### Frontend Hosting (Optional)
- React 정적 파일 호스팅
- S3 + CloudFront 또는 Nginx

---

## Infrastructure Design Plan

### Step 1: Analyze Requirements
- [x] Requirements 문서에서 인프라 요구사항 추출
- [x] NFR 요구사항 분석 (성능, 확장성, 가용성)
- [x] Unit 1 (Backend) 배포 요구사항 확인
- [x] Frontend 배포 요구사항 확인 (Unit 2, 3, 4)

### Step 2: Generate Infrastructure Design Questions
- [x] 배포 환경 관련 질문 생성 (Dev/Prod 분리, Region 선택)
- [x] Compute 인프라 관련 질문 생성 (EC2 vs ECS, 인스턴스 타입)
- [x] Database 인프라 관련 질문 생성 (RDS 설정, Multi-AZ)
- [x] Cache 인프라 관련 질문 생성 (ElastiCache Redis 설정)
- [x] Storage 인프라 관련 질문 생성 (이미지 저장 방식)
- [x] Network 인프라 관련 질문 생성 (VPC CIDR, Subnet 구성)
- [x] Frontend 호스팅 관련 질문 생성 (S3 + CloudFront vs Nginx)
- [x] Load Balancer 관련 질문 생성 (ALB 사용 여부)
- [x] 모니터링 관련 질문 생성 (CloudWatch, 로깅)

### Step 3: Store Plan with Questions
- [x] 계획 문서를 `aidlc-docs/construction/plans/unit-5-infrastructure-design-plan.md`에 저장
- [x] 모든 질문에 [Answer]: 태그 포함

### Step 4: Collect User Answers
- [x] 사용자 답변 대기
- [x] 답변 분석 및 모호한 부분 확인
- [x] 필요 시 추가 질문

### Step 5: Generate Infrastructure Design Artifacts
- [x] `infrastructure-design.md` 생성 (AWS 리소스 매핑, 서비스 선택)
- [x] `deployment-architecture.md` 생성 (아키텍처 다이어그램, 네트워크 구성)

### Step 6: Present Completion Message
- [x] 완료 메시지 표시
- [x] 생성된 산출물 경로 안내
- [x] 사용자 승인 대기

### Step 7: Record Approval
- [ ] audit.md에 승인 기록
- [ ] aidlc-state.md 업데이트

---

## Infrastructure Design Questions

### Q1: Deployment Environment Strategy
**Context**: 개발 환경과 운영 환경을 어떻게 분리할지 결정이 필요합니다.

**Options**:
A) Single Environment (Dev only) - 로컬 개발만, AWS 배포 없음
B) Single Environment (Prod only) - 운영 환경만 구성
C) Multi-Environment (Dev + Prod) - 개발/운영 환경 분리
D) Multi-Environment (Dev + Staging + Prod) - 개발/스테이징/운영 3단계

[Answer]: B

---

### Q2: AWS Region Selection
**Context**: AWS 리전 선택이 필요합니다. 한국 사용자 대상이므로 서울 리전이 적합할 수 있습니다.

**Options**:
A) ap-northeast-2 (Seoul)
B) us-east-1 (N. Virginia)
C) ap-northeast-1 (Tokyo)
D) Other (specify)

[Answer]: A

---

### Q3: Compute Infrastructure Choice
**Context**: Backend API 서버를 호스팅할 컴퓨팅 서비스를 선택해야 합니다.

**Options**:
A) EC2 (단일 인스턴스) - 간단한 설정, 수동 관리
B) EC2 (Auto Scaling Group) - 자동 확장, 고가용성
C) ECS Fargate - 서버리스 컨테이너, 관리 부담 적음
D) ECS EC2 - 컨테이너 + EC2 인스턴스 제어

[Answer]: A

---

### Q4: EC2 Instance Type (if EC2 selected)
**Context**: EC2를 선택한 경우, 인스턴스 타입을 결정해야 합니다. 중규모 사용자(10-50명) 기준입니다.

**Options**:
A) t3.micro (1 vCPU, 1GB RAM) - 최소 사양, 개발용
B) t3.small (2 vCPU, 2GB RAM) - 소규모 운영
C) t3.medium (2 vCPU, 4GB RAM) - 중규모 운영
D) t3.large (2 vCPU, 8GB RAM) - 여유 있는 사양

[Answer]: C

---

### Q5: RDS PostgreSQL Configuration
**Context**: 데이터베이스 설정을 결정해야 합니다.

**Multi-AZ Deployment** (고가용성):
A) Single-AZ (단일 가용 영역) - 비용 절감, 가용성 낮음
B) Multi-AZ (다중 가용 영역) - 고가용성, 자동 장애 조치

[Answer]: A

**Instance Class**:
A) db.t3.micro (1 vCPU, 1GB RAM) - 최소 사양
B) db.t3.small (2 vCPU, 2GB RAM) - 소규모
C) db.t3.medium (2 vCPU, 4GB RAM) - 중규모

[Answer]: B

**Storage**:
A) 20GB gp3 (General Purpose SSD)
B) 50GB gp3
C) 100GB gp3

[Answer]: A

---

### Q6: ElastiCache Redis Configuration
**Context**: SSE Pub/Sub용 Redis 캐시 설정입니다.

**Node Type**:
A) cache.t3.micro (0.5GB RAM) - 최소 사양
B) cache.t3.small (1.5GB RAM) - 소규모
C) cache.t3.medium (3.2GB RAM) - 중규모

[Answer]: A

**Cluster Mode**:
A) Single Node (단일 노드) - 간단한 설정
B) Cluster Mode Disabled (Primary + Replica) - 읽기 확장
C) Cluster Mode Enabled (샤딩) - 쓰기 확장

[Answer]: A

---

### Q7: Image Storage Strategy
**Context**: 메뉴 이미지 저장 방식을 결정해야 합니다.

**Options**:
A) Local File System (EC2 볼륨) - 간단, 확장성 제한
B) S3 (Simple Storage Service) - 확장 가능, 내구성 높음
C) EFS (Elastic File System) - 공유 파일 시스템, 여러 EC2 마운트 가능

[Answer]: B

---

### Q8: Frontend Hosting Strategy
**Context**: React 프론트엔드(Unit 2, 3, 4) 호스팅 방식을 결정해야 합니다.

**Options**:
A) S3 + CloudFront - 정적 호스팅, CDN, 확장성 높음
B) Nginx on EC2 - Backend와 동일 서버, 간단한 설정
C) Separate EC2 for Frontend - 프론트엔드 전용 서버
D) Skip (로컬 개발만) - AWS 배포 없음

[Answer]: B

---

### Q9: Load Balancer Configuration
**Context**: 로드 밸런서 사용 여부를 결정해야 합니다.

**Options**:
A) No Load Balancer - 단일 EC2 직접 접근
B) Application Load Balancer (ALB) - HTTP/HTTPS 라우팅, 헬스 체크
C) Network Load Balancer (NLB) - TCP/UDP, 고성능

[Answer]: A

---

### Q10: VPC and Network Configuration
**Context**: VPC 및 네트워크 구성을 결정해야 합니다.

**VPC CIDR Block**:
A) 10.0.0.0/16 (65,536 IPs)
B) 172.31.0.0/16 (65,536 IPs)
C) 192.168.0.0/16 (65,536 IPs)

[Answer]: A

**Subnet Strategy**:
A) Single Public Subnet - 모든 리소스 Public
B) Public + Private Subnets (Single AZ) - 보안 향상
C) Public + Private Subnets (Multi-AZ) - 고가용성 + 보안

[Answer]: B

---

### Q11: Monitoring and Logging
**Context**: 모니터링 및 로깅 설정을 결정해야 합니다.

**CloudWatch Monitoring**:
A) Basic Monitoring (5분 간격) - 무료
B) Detailed Monitoring (1분 간격) - 유료

[Answer]: A

**Application Logs**:
A) CloudWatch Logs - 중앙 집중식 로그 관리
B) Local Logs Only - EC2 로컬 파일
C) CloudWatch Logs + S3 Archive - 장기 보관

[Answer]: A

---

### Q12: Security Configuration
**Context**: 보안 설정을 결정해야 합니다.

**SSH Access**:
A) Allow from Anywhere (0.0.0.0/0) - 편리하지만 보안 위험
B) Allow from Specific IP - 특정 IP만 허용
C) AWS Systems Manager Session Manager - SSH 키 불필요

[Answer]: B

**Database Access**:
A) Public Access (인터넷에서 접근 가능) - 개발 편의
B) Private Access (VPC 내부만) - 보안 강화

[Answer]: B

---

### Q13: Backup and Disaster Recovery
**Context**: 백업 및 재해 복구 전략을 결정해야 합니다.

**RDS Automated Backups**:
A) Disabled - 백업 없음
B) 7 days retention - 1주일 보관
C) 30 days retention - 1개월 보관

[Answer]: B

**RDS Snapshots**:
A) Manual only - 수동 스냅샷만
B) Automated daily snapshots - 매일 자동 스냅샷

[Answer]: A

---

### Q14: Cost Optimization
**Context**: 비용 최적화 전략을 결정해야 합니다.

**Options**:
A) On-Demand Instances - 유연성 높음, 비용 높음
B) Reserved Instances (1 year) - 비용 절감 ~40%
C) Savings Plans - 유연한 비용 절감
D) Spot Instances (개발 환경만) - 최대 90% 절감, 중단 가능

[Answer]: A

---

## Next Steps
1. 사용자가 모든 질문에 답변
2. 답변 분석 및 모호한 부분 확인
3. Infrastructure Design 문서 생성
4. Deployment Architecture 다이어그램 생성
5. 사용자 승인 대기
6. Code Generation 단계로 진행

