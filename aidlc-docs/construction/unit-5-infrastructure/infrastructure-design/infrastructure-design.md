# Infrastructure Design - Unit 5 (Infrastructure)

## Overview
테이블오더 서비스를 위한 AWS 인프라 설계 문서입니다. Terraform을 사용하여 Infrastructure as Code로 관리합니다.

## Design Decisions Summary

### Environment Strategy
- **Environment**: Single Production Environment
- **Region**: ap-northeast-2 (Seoul)
- **Rationale**: 학습/개발 프로젝트로 단순성과 비용 효율성 우선

### Compute Infrastructure
- **Service**: Amazon EC2 (단일 인스턴스)
- **Instance Type**: t3.medium (2 vCPU, 4GB RAM)
- **OS**: Amazon Linux 2 또는 Ubuntu 22.04 LTS
- **Rationale**: 
  - 중규모 사용자(10-50명) 처리 가능
  - FastAPI + Nginx 동시 실행에 충분한 리소스
  - SSE 연결 유지에 적합한 메모리

### Database Infrastructure
- **Service**: Amazon RDS for PostgreSQL
- **Version**: PostgreSQL 15.x
- **Instance Class**: db.t3.small (2 vCPU, 2GB RAM)
- **Storage**: 20GB gp3 (General Purpose SSD)
- **Multi-AZ**: Single-AZ
- **Backup**: 7 days automated backup retention
- **Rationale**:
  - 9개 데이터 모델 지원에 충분
  - 비용 효율적
  - 자동 백업으로 데이터 보호

### Cache Infrastructure
- **Service**: Amazon ElastiCache for Redis
- **Version**: Redis 7.x
- **Node Type**: cache.t3.micro (0.5GB RAM)
- **Cluster Mode**: Single Node
- **Rationale**:
  - SSE Pub/Sub 메시지 브로커 역할
  - 메시지 크기가 작아 최소 사양으로 충분
  - 단순한 설정

### Storage Infrastructure
- **Service**: Amazon S3
- **Purpose**: 메뉴 이미지 저장
- **Storage Class**: S3 Standard
- **Rationale**:
  - 확장 가능하고 내구성 높음 (99.999999999%)
  - EC2 재시작 시에도 데이터 유지
  - 비용 효율적 (사용한 만큼만 과금)

### Frontend Hosting
- **Service**: Nginx on EC2
- **Purpose**: React 정적 파일 호스팅 (Customer, Admin, SuperAdmin UI)
- **Rationale**:
  - Backend와 동일 서버에서 간단하게 호스팅
  - 별도 S3/CloudFront 비용 불필요
  - 중규모 트래픽에 충분

### Load Balancer
- **Service**: None (직접 EC2 접근)
- **Rationale**:
  - 단일 인스턴스이므로 불필요
  - 비용 절감
  - 필요시 나중에 ALB 추가 가능

### Network Infrastructure
- **VPC CIDR**: 10.0.0.0/16
- **Subnets**:
  - Public Subnet: 10.0.1.0/24 (EC2)
  - Private Subnet: 10.0.2.0/24 (RDS, Redis)
- **Availability Zone**: Single AZ (ap-northeast-2a)
- **Internet Gateway**: Yes (Public Subnet 인터넷 접근)
- **NAT Gateway**: No (Private Subnet은 아웃바운드 불필요)
- **Rationale**:
  - 보안 강화 (RDS/Redis는 Private Subnet)
  - 비용 효율적 (Single AZ, NAT Gateway 없음)

### Security Infrastructure
- **SSH Access**: Specific IP only (개발자 IP)
- **Database Access**: Private (VPC 내부만)
- **Security Groups**:
  - EC2: SSH (22), HTTP (80), HTTPS (443), FastAPI (8000)
  - RDS: PostgreSQL (5432) from EC2 only
  - Redis: Redis (6379) from EC2 only
- **Rationale**:
  - 최소 권한 원칙
  - 인터넷에서 직접 DB 접근 차단

### Monitoring and Logging
- **CloudWatch Monitoring**: Basic (5분 간격, 무료)
- **Application Logs**: CloudWatch Logs
- **Metrics**:
  - EC2: CPU, Memory, Disk, Network
  - RDS: CPU, Connections, Storage
  - Redis: CPU, Memory, Connections
- **Rationale**:
  - 중앙 집중식 로그 관리
  - EC2 장애 시에도 로그 유지
  - 무료 티어 활용

### Backup and Disaster Recovery
- **RDS Automated Backups**: 7 days retention
- **RDS Snapshots**: Manual only
- **S3 Versioning**: Disabled (이미지는 버전 관리 불필요)
- **Rationale**:
  - 1주일 백업으로 실수 복구 가능
  - 필요시 수동 스냅샷 생성

### Cost Optimization
- **Pricing Model**: On-Demand Instances
- **Rationale**:
  - 학습/개발 프로젝트로 유연성 중요
  - 언제든 중지/시작 가능
  - Reserved Instance는 1년 약정 필요

---

## AWS Resource Mapping

### Compute Resources
| Logical Component | AWS Service | Configuration |
|-------------------|-------------|---------------|
| Backend API Server | EC2 Instance | t3.medium, Amazon Linux 2 |
| Frontend Server | Nginx on EC2 | Same EC2 instance |
| Application Runtime | Python 3.11+ | FastAPI, Uvicorn |

### Data Resources
| Logical Component | AWS Service | Configuration |
|-------------------|-------------|---------------|
| Primary Database | RDS PostgreSQL | db.t3.small, 20GB gp3, Single-AZ |
| Cache/Message Broker | ElastiCache Redis | cache.t3.micro, Single Node |
| Image Storage | S3 Bucket | Standard storage class |

### Network Resources
| Logical Component | AWS Service | Configuration |
|-------------------|-------------|---------------|
| Virtual Network | VPC | 10.0.0.0/16 |
| Public Subnet | Subnet | 10.0.1.0/24 (EC2) |
| Private Subnet | Subnet | 10.0.2.0/24 (RDS, Redis) |
| Internet Access | Internet Gateway | Attached to VPC |
| EC2 Security | Security Group | SSH, HTTP, HTTPS, FastAPI |
| RDS Security | Security Group | PostgreSQL from EC2 only |
| Redis Security | Security Group | Redis from EC2 only |

### Monitoring Resources
| Logical Component | AWS Service | Configuration |
|-------------------|-------------|---------------|
| Metrics | CloudWatch | Basic monitoring (5min) |
| Logs | CloudWatch Logs | Application logs |
| Alarms | CloudWatch Alarms | Optional (CPU, Memory) |

---

## Infrastructure Components Detail

### 1. VPC (Virtual Private Cloud)
```
Resource: aws_vpc.main
CIDR: 10.0.0.0/16
DNS Support: Enabled
DNS Hostnames: Enabled
Tags:
  Name: table-order-vpc
  Environment: production
```

### 2. Subnets
```
Public Subnet:
  Resource: aws_subnet.public
  CIDR: 10.0.1.0/24
  AZ: ap-northeast-2a
  Map Public IP: true
  Tags:
    Name: table-order-public-subnet

Private Subnet:
  Resource: aws_subnet.private
  CIDR: 10.0.2.0/24
  AZ: ap-northeast-2a
  Map Public IP: false
  Tags:
    Name: table-order-private-subnet
```

### 3. Internet Gateway
```
Resource: aws_internet_gateway.main
VPC: table-order-vpc
Tags:
  Name: table-order-igw
```

### 4. Route Tables
```
Public Route Table:
  Resource: aws_route_table.public
  Routes:
    - Destination: 0.0.0.0/0
      Gateway: Internet Gateway
  Associated Subnets: Public Subnet

Private Route Table:
  Resource: aws_route_table.private
  Routes: Local only (10.0.0.0/16)
  Associated Subnets: Private Subnet
```

### 5. Security Groups

#### EC2 Security Group
```
Resource: aws_security_group.ec2
Ingress Rules:
  - SSH (22) from Specific IP
  - HTTP (80) from 0.0.0.0/0
  - HTTPS (443) from 0.0.0.0/0
  - FastAPI (8000) from 0.0.0.0/0
Egress Rules:
  - All traffic to 0.0.0.0/0
```

#### RDS Security Group
```
Resource: aws_security_group.rds
Ingress Rules:
  - PostgreSQL (5432) from EC2 Security Group
Egress Rules:
  - None (no outbound needed)
```

#### Redis Security Group
```
Resource: aws_security_group.redis
Ingress Rules:
  - Redis (6379) from EC2 Security Group
Egress Rules:
  - None (no outbound needed)
```

### 6. EC2 Instance
```
Resource: aws_instance.app_server
AMI: Amazon Linux 2 (latest)
Instance Type: t3.medium
Subnet: Public Subnet
Security Group: EC2 Security Group
Key Pair: table-order-key
User Data: Install Python, FastAPI, Nginx
EBS Volume: 30GB gp3
Tags:
  Name: table-order-app-server
  Environment: production
```

### 7. RDS PostgreSQL
```
Resource: aws_db_instance.postgres
Engine: postgres
Engine Version: 15.x
Instance Class: db.t3.small
Allocated Storage: 20GB
Storage Type: gp3
DB Name: tableorder
Master Username: admin (from variable)
Master Password: (from AWS Secrets Manager)
Subnet Group: Private Subnet
Security Group: RDS Security Group
Multi-AZ: false
Backup Retention: 7 days
Backup Window: 03:00-04:00 UTC
Maintenance Window: Mon:04:00-Mon:05:00 UTC
Tags:
  Name: table-order-db
  Environment: production
```

### 8. ElastiCache Redis
```
Resource: aws_elasticache_cluster.redis
Engine: redis
Engine Version: 7.x
Node Type: cache.t3.micro
Number of Nodes: 1
Subnet Group: Private Subnet
Security Group: Redis Security Group
Port: 6379
Tags:
  Name: table-order-redis
  Environment: production
```

### 9. S3 Bucket
```
Resource: aws_s3_bucket.images
Bucket Name: table-order-menu-images-{account-id}
ACL: private
Versioning: Disabled
Encryption: AES256 (SSE-S3)
Public Access Block: Enabled
Tags:
  Name: table-order-images
  Environment: production
```

### 10. IAM Role for EC2
```
Resource: aws_iam_role.ec2_role
Policies:
  - S3 Read/Write (menu images bucket)
  - CloudWatch Logs Write
  - Secrets Manager Read (DB credentials)
Attached to: EC2 Instance
```

### 11. CloudWatch Log Groups
```
Resources:
  - aws_cloudwatch_log_group.fastapi_logs
    Name: /aws/ec2/table-order/fastapi
    Retention: 7 days
  
  - aws_cloudwatch_log_group.nginx_logs
    Name: /aws/ec2/table-order/nginx
    Retention: 7 days
```

---

## Deployment Architecture Summary

### Single-Server Architecture
```
Internet
    |
    v
[Internet Gateway]
    |
    v
[Public Subnet - 10.0.1.0/24]
    |
    +-- [EC2 t3.medium]
            - FastAPI (Backend API)
            - Nginx (Frontend Hosting)
            - CloudWatch Agent
    |
    v
[Private Subnet - 10.0.2.0/24]
    |
    +-- [RDS PostgreSQL db.t3.small]
    |
    +-- [ElastiCache Redis cache.t3.micro]

[S3 Bucket]
    - Menu Images Storage
```

### Network Flow
1. **User → EC2**: Internet → IGW → Public Subnet → EC2
2. **EC2 → RDS**: EC2 → Private Subnet → RDS (PostgreSQL 5432)
3. **EC2 → Redis**: EC2 → Private Subnet → Redis (6379)
4. **EC2 → S3**: EC2 → Internet → S3 (HTTPS)
5. **EC2 → CloudWatch**: EC2 → Internet → CloudWatch Logs

### Security Boundaries
- **Public Zone**: EC2 (인터넷 접근 가능)
- **Private Zone**: RDS, Redis (VPC 내부만 접근)
- **Storage Zone**: S3 (IAM 인증 필요)

---

## Technology Stack

### Infrastructure as Code
- **Tool**: Terraform 1.5+
- **Provider**: AWS Provider 5.0+
- **State Backend**: Local (또는 S3 + DynamoDB for team)

### Deployment Tools
- **EC2 Provisioning**: Terraform + User Data
- **Application Deployment**: SSH + systemd
- **Database Migration**: Alembic (Python)

### Monitoring Tools
- **Metrics**: CloudWatch
- **Logs**: CloudWatch Logs
- **Alerts**: CloudWatch Alarms (optional)

---

## Cost Estimation (Monthly, Seoul Region)

| Service | Configuration | Estimated Cost (USD) |
|---------|---------------|----------------------|
| EC2 t3.medium | On-Demand, 730 hours | ~$30 |
| RDS db.t3.small | Single-AZ, 20GB | ~$25 |
| ElastiCache Redis | cache.t3.micro | ~$12 |
| S3 Storage | 10GB images | ~$0.25 |
| Data Transfer | 100GB out | ~$9 |
| CloudWatch Logs | 5GB ingestion | ~$2.50 |
| **Total** | | **~$79/month** |

**Note**: 실제 비용은 사용량에 따라 달라질 수 있습니다.

---

## Scalability Considerations

### Current Limitations
- Single EC2 instance (단일 장애점)
- Single-AZ (가용성 제한)
- No Auto Scaling (수동 확장)

### Future Scaling Options
1. **Horizontal Scaling**:
   - Add Application Load Balancer
   - Create Auto Scaling Group
   - Multi-AZ deployment

2. **Database Scaling**:
   - Enable Multi-AZ for RDS
   - Add Read Replicas
   - Increase instance size

3. **Cache Scaling**:
   - Add Redis replicas
   - Enable Cluster Mode

4. **Storage Scaling**:
   - S3 scales automatically
   - Add CloudFront CDN for images

---

## Security Best Practices

### Implemented
- ✅ Private subnets for databases
- ✅ Security groups with least privilege
- ✅ SSH access from specific IP only
- ✅ Database credentials in Secrets Manager
- ✅ S3 bucket encryption
- ✅ CloudWatch logging enabled

### Recommended (Future)
- 🔲 Enable AWS WAF for EC2
- 🔲 Enable VPC Flow Logs
- 🔲 Enable AWS Config for compliance
- 🔲 Enable GuardDuty for threat detection
- 🔲 Implement SSL/TLS certificates (ACM)
- 🔲 Enable MFA for AWS console access

---

## Disaster Recovery Plan

### Backup Strategy
- **RDS**: Automated daily backups (7 days retention)
- **S3**: Durable storage (99.999999999%)
- **EC2**: Manual AMI snapshots (as needed)

### Recovery Procedures
1. **Database Failure**:
   - Restore from automated backup (RPO: 5 minutes)
   - RTO: ~15 minutes

2. **EC2 Failure**:
   - Launch new EC2 from AMI
   - Redeploy application code
   - RTO: ~30 minutes

3. **Region Failure**:
   - No cross-region replication (out of scope)
   - Manual recovery required

---

## Maintenance Windows

### Recommended Schedule
- **RDS Maintenance**: Monday 04:00-05:00 UTC (13:00-14:00 KST)
- **RDS Backup**: Daily 03:00-04:00 UTC (12:00-13:00 KST)
- **EC2 Patching**: Manual, during low-traffic hours

---

## Next Steps
1. Review and approve this infrastructure design
2. Proceed to Code Generation (Terraform code)
3. Generate deployment scripts and documentation

