# Deployment Architecture - Unit 5 (Infrastructure)

## Overview
테이블오더 서비스의 AWS 배포 아키텍처를 상세히 설명합니다. Single-Server 아키텍처로 비용 효율적이면서도 중규모 사용자를 지원합니다.

---

## High-Level Architecture Diagram

```
                                Internet Users
                                      |
                                      |
                    +-----------------+-----------------+
                    |                                   |
              Customer UI                         Admin/SuperAdmin UI
                    |                                   |
                    +-----------------------------------+
                                      |
                                      | HTTPS
                                      v
                    +----------------------------------+
                    |        Internet Gateway          |
                    +----------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------+
|                         VPC (10.0.0.0/16)                           |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |              Public Subnet (10.0.1.0/24)                      |  |
|  |                                                               |  |
|  |  +--------------------------------------------------------+  |  |
|  |  |           EC2 Instance (t3.medium)                     |  |  |
|  |  |                                                        |  |  |
|  |  |  +--------------------------------------------------+  |  |  |
|  |  |  |  Nginx (Port 80, 443)                            |  |  |  |
|  |  |  |  - Customer UI (React)                           |  |  |  |
|  |  |  |  - Admin UI (React)                              |  |  |  |
|  |  |  |  - SuperAdmin UI (React)                         |  |  |  |
|  |  |  +--------------------------------------------------+  |  |  |
|  |  |                                                        |  |  |
|  |  |  +--------------------------------------------------+  |  |  |
|  |  |  |  FastAPI Backend (Port 8000)                     |  |  |  |
|  |  |  |  - Customer API                                  |  |  |  |
|  |  |  |  - Admin API (SSE)                               |  |  |  |
|  |  |  |  - SuperAdmin API                                |  |  |  |
|  |  |  +--------------------------------------------------+  |  |  |
|  |  |                                                        |  |  |
|  |  |  +--------------------------------------------------+  |  |  |
|  |  |  |  CloudWatch Agent                                |  |  |  |
|  |  |  |  - Application Logs                              |  |  |  |
|  |  |  |  - System Metrics                                |  |  |  |
|  |  |  +--------------------------------------------------+  |  |  |
|  |  +--------------------------------------------------------+  |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |             Private Subnet (10.0.2.0/24)                      |  |
|  |                                                               |  |
|  |  +------------------------+  +----------------------------+  |  |
|  |  |  RDS PostgreSQL        |  |  ElastiCache Redis         |  |  |
|  |  |  (db.t3.small)         |  |  (cache.t3.micro)          |  |  |
|  |  |                        |  |                            |  |  |
|  |  |  - Port: 5432          |  |  - Port: 6379              |  |  |
|  |  |  - Storage: 20GB gp3   |  |  - Single Node             |  |  |
|  |  |  - Single-AZ           |  |  - SSE Pub/Sub             |  |  |
|  |  +------------------------+  +----------------------------+  |  |
|  +---------------------------------------------------------------+  |
+---------------------------------------------------------------------+
                                      |
                                      | IAM Role
                                      v
                    +----------------------------------+
                    |         S3 Bucket                |
                    |   (Menu Images Storage)          |
                    |   - Encryption: AES256           |
                    |   - Private Access               |
                    +----------------------------------+
                                      |
                                      v
                    +----------------------------------+
                    |        CloudWatch Logs           |
                    |   - FastAPI Logs                 |
                    |   - Nginx Logs                   |
                    |   - System Logs                  |
                    +----------------------------------+
```

---

## Network Architecture Detail

### VPC Configuration
```
VPC: table-order-vpc
CIDR Block: 10.0.0.0/16
Region: ap-northeast-2 (Seoul)
Availability Zone: ap-northeast-2a
DNS Support: Enabled
DNS Hostnames: Enabled
```

### Subnet Configuration
```
Public Subnet:
  Name: table-order-public-subnet
  CIDR: 10.0.1.0/24
  AZ: ap-northeast-2a
  Auto-assign Public IP: Yes
  Route Table: Public Route Table
  Resources: EC2 Instance

Private Subnet:
  Name: table-order-private-subnet
  CIDR: 10.0.2.0/24
  AZ: ap-northeast-2a
  Auto-assign Public IP: No
  Route Table: Private Route Table
  Resources: RDS, ElastiCache Redis
```

### Routing Configuration
```
Public Route Table:
  Routes:
    - Destination: 10.0.0.0/16 -> Target: local
    - Destination: 0.0.0.0/0 -> Target: Internet Gateway
  Associated Subnets: Public Subnet

Private Route Table:
  Routes:
    - Destination: 10.0.0.0/16 -> Target: local
  Associated Subnets: Private Subnet
```

---

## Security Architecture

### Security Group Configuration

#### EC2 Security Group (table-order-ec2-sg)
```
Inbound Rules:
  - Type: SSH
    Protocol: TCP
    Port: 22
    Source: [Your IP]/32
    Description: SSH access from developer IP

  - Type: HTTP
    Protocol: TCP
    Port: 80
    Source: 0.0.0.0/0
    Description: HTTP access for Nginx

  - Type: HTTPS
    Protocol: TCP
    Port: 443
    Source: 0.0.0.0/0
    Description: HTTPS access for Nginx

  - Type: Custom TCP
    Protocol: TCP
    Port: 8000
    Source: 0.0.0.0/0
    Description: FastAPI backend access

Outbound Rules:
  - Type: All Traffic
    Protocol: All
    Port: All
    Destination: 0.0.0.0/0
    Description: Allow all outbound traffic
```

#### RDS Security Group (table-order-rds-sg)
```
Inbound Rules:
  - Type: PostgreSQL
    Protocol: TCP
    Port: 5432
    Source: table-order-ec2-sg
    Description: PostgreSQL access from EC2 only

Outbound Rules:
  - None (no outbound traffic needed)
```

#### Redis Security Group (table-order-redis-sg)
```
Inbound Rules:
  - Type: Custom TCP
    Protocol: TCP
    Port: 6379
    Source: table-order-ec2-sg
    Description: Redis access from EC2 only

Outbound Rules:
  - None (no outbound traffic needed)
```

### IAM Role and Policies

#### EC2 Instance Role (table-order-ec2-role)
```
Attached Policies:
  1. S3 Access Policy (Custom)
     - Actions: s3:GetObject, s3:PutObject, s3:DeleteObject
     - Resource: arn:aws:s3:::table-order-menu-images-*/*

  2. CloudWatch Logs Policy (Custom)
     - Actions: logs:CreateLogGroup, logs:CreateLogStream, logs:PutLogEvents
     - Resource: arn:aws:logs:ap-northeast-2:*:log-group:/aws/ec2/table-order/*

  3. Secrets Manager Read Policy (Custom)
     - Actions: secretsmanager:GetSecretValue
     - Resource: arn:aws:secretsmanager:ap-northeast-2:*:secret:table-order/*
```

---

## Component Deployment Details

### EC2 Instance Configuration

```
Instance Details:
  Name: table-order-app-server
  Instance Type: t3.medium (2 vCPU, 4GB RAM)
  AMI: Amazon Linux 2 (latest)
  Subnet: Public Subnet (10.0.1.0/24)
  Security Group: table-order-ec2-sg
  IAM Role: table-order-ec2-role
  Key Pair: table-order-key
  Public IP: Auto-assigned
  EBS Volume: 30GB gp3

Installed Software:
  - Python 3.11+
  - FastAPI + Uvicorn
  - Nginx
  - PostgreSQL Client (psql)
  - Redis Client (redis-cli)
  - CloudWatch Agent
  - Git
```

### Application Deployment Structure on EC2
```
/opt/table-order/
  +-- backend/
  |     +-- app/
  |     |     +-- main.py
  |     |     +-- controllers/
  |     |     +-- services/
  |     |     +-- models/
  |     |     +-- infrastructure/
  |     +-- requirements.txt
  |     +-- .env
  |
  +-- frontend/
  |     +-- customer-ui/
  |     |     +-- build/
  |     +-- admin-ui/
  |     |     +-- build/
  |     +-- superadmin-ui/
  |           +-- build/
  |
  +-- logs/
        +-- fastapi.log
        +-- nginx-access.log
        +-- nginx-error.log
```

### Nginx Configuration
```
Server Blocks:
  1. Frontend Hosting (Port 80)
     - / -> Customer UI (React build)
     - /admin -> Admin UI (React build)
     - /superadmin -> SuperAdmin UI (React build)

  2. Backend Proxy (Port 80)
     - /api/* -> Proxy to FastAPI (localhost:8000)

  3. Static Files
     - /static/* -> Serve from /opt/table-order/frontend/
```

### FastAPI Service (systemd)
```
Service Name: table-order-backend.service
ExecStart: /usr/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
WorkingDirectory: /opt/table-order/backend
User: table-order
Restart: always
Environment:
  - DATABASE_URL=postgresql://admin:***@rds-endpoint:5432/tableorder
  - REDIS_URL=redis://redis-endpoint:6379/0
  - S3_BUCKET=table-order-menu-images-{account-id}
  - AWS_REGION=ap-northeast-2
```

---

## Database Architecture

### RDS PostgreSQL Configuration
```
Instance Details:
  Identifier: table-order-db
  Engine: PostgreSQL 15.x
  Instance Class: db.t3.small (2 vCPU, 2GB RAM)
  Storage: 20GB gp3
  Multi-AZ: No (Single-AZ)
  Subnet Group: Private Subnet (10.0.2.0/24)
  Security Group: table-order-rds-sg
  Publicly Accessible: No

Database Configuration:
  Database Name: tableorder
  Master Username: admin
  Master Password: (stored in AWS Secrets Manager)
  Port: 5432
  Character Set: UTF8
  Collation: en_US.UTF-8

Backup Configuration:
  Automated Backups: Enabled
  Backup Retention: 7 days
  Backup Window: 03:00-04:00 UTC (12:00-13:00 KST)
  Maintenance Window: Mon:04:00-Mon:05:00 UTC (Mon 13:00-14:00 KST)

Parameter Group:
  - max_connections: 100
  - shared_buffers: 256MB
  - work_mem: 4MB
```

### Database Schema
```
Tables (9):
  1. stores
  2. admins
  3. tables
  4. table_sessions
  5. menu_categories
  6. menus
  7. orders
  8. order_items
  9. order_history
```

---

## Cache Architecture

### ElastiCache Redis Configuration
```
Cluster Details:
  Cluster ID: table-order-redis
  Engine: Redis 7.x
  Node Type: cache.t3.micro (0.5GB RAM)
  Number of Nodes: 1 (Single Node)
  Subnet Group: Private Subnet (10.0.2.0/24)
  Security Group: table-order-redis-sg
  Port: 6379

Configuration:
  - Cluster Mode: Disabled
  - Encryption at Rest: No
  - Encryption in Transit: No
  - Automatic Backups: No (not needed for Pub/Sub)

Usage:
  - SSE Pub/Sub for real-time order updates
  - Channel: order_events
  - Message Format: JSON
```

---

## Storage Architecture

### S3 Bucket Configuration
```
Bucket Details:
  Bucket Name: table-order-menu-images-{account-id}
  Region: ap-northeast-2
  Storage Class: S3 Standard
  Versioning: Disabled
  Encryption: AES256 (SSE-S3)

Access Control:
  - Public Access: Blocked
  - Bucket Policy: Allow EC2 IAM Role only
  - ACL: Private

Object Structure:
  /menus/
    +-- {menu_id}/
          +-- {image_filename}.jpg
          +-- {image_filename}.png

Lifecycle Policy:
  - None (images retained indefinitely)
```

---

## Monitoring and Logging Architecture

### CloudWatch Metrics
```
EC2 Metrics (Basic Monitoring - 5min):
  - CPUUtilization
  - NetworkIn
  - NetworkOut
  - DiskReadBytes
  - DiskWriteBytes
  - StatusCheckFailed

RDS Metrics:
  - CPUUtilization
  - DatabaseConnections
  - FreeableMemory
  - FreeStorageSpace
  - ReadLatency
  - WriteLatency

ElastiCache Metrics:
  - CPUUtilization
  - CurrConnections
  - BytesUsedForCache
  - NetworkBytesIn
  - NetworkBytesOut
```

### CloudWatch Logs
```
Log Groups:
  1. /aws/ec2/table-order/fastapi
     - Retention: 7 days
     - Source: FastAPI application logs
     - Format: JSON structured logs

  2. /aws/ec2/table-order/nginx
     - Retention: 7 days
     - Source: Nginx access and error logs
     - Format: Combined log format

Log Streams:
  - {instance-id}/fastapi.log
  - {instance-id}/nginx-access.log
  - {instance-id}/nginx-error.log
```

### CloudWatch Alarms (Optional)
```
Recommended Alarms:
  1. EC2 High CPU
     - Metric: CPUUtilization
     - Threshold: > 80% for 5 minutes
     - Action: SNS notification

  2. RDS High Connections
     - Metric: DatabaseConnections
     - Threshold: > 80 connections
     - Action: SNS notification

  3. RDS Low Storage
     - Metric: FreeStorageSpace
     - Threshold: < 2GB
     - Action: SNS notification
```

---

## Data Flow Diagrams

### Customer Order Flow
```
Customer Browser
      |
      | 1. GET /api/menus
      v
   Nginx (Port 80)
      |
      | 2. Proxy to FastAPI
      v
FastAPI (Port 8000)
      |
      | 3. Query menus
      v
RDS PostgreSQL (Port 5432)
      |
      | 4. Return menu data
      v
FastAPI
      |
      | 5. Return JSON response
      v
Customer Browser
      |
      | 6. POST /api/orders
      v
FastAPI
      |
      | 7. Insert order
      v
RDS PostgreSQL
      |
      | 8. Publish event
      v
Redis (Port 6379)
      |
      | 9. SSE broadcast
      v
Admin Browser (SSE connection)
```

### Image Upload Flow
```
Admin Browser
      |
      | 1. POST /api/admin/menus (multipart/form-data)
      v
   Nginx
      |
      | 2. Proxy to FastAPI
      v
FastAPI
      |
      | 3. Validate image
      v
FastAPI
      |
      | 4. Upload to S3 (using IAM role)
      v
S3 Bucket
      |
      | 5. Return S3 object key
      v
FastAPI
      |
      | 6. Insert menu with image_path
      v
RDS PostgreSQL
      |
      | 7. Return success
      v
Admin Browser
```

### SSE Real-time Update Flow
```
Admin Browser
      |
      | 1. GET /api/admin/orders/stream (SSE)
      v
   Nginx
      |
      | 2. Proxy to FastAPI (keep-alive)
      v
FastAPI SSEPublisher
      |
      | 3. Subscribe to Redis channel
      v
Redis Pub/Sub
      |
      | 4. Wait for events...
      |
      | [New Order Created]
      |
      | 5. Publish order_created event
      v
FastAPI SSEPublisher
      |
      | 6. Send SSE message
      v
Admin Browser
      |
      | 7. Update UI in real-time
      v
Admin Dashboard
```

---

## Deployment Sequence

### Initial Infrastructure Deployment
```
Step 1: Terraform Init
  - Initialize Terraform working directory
  - Download AWS provider

Step 2: Terraform Plan
  - Review infrastructure changes
  - Validate configuration

Step 3: Terraform Apply
  - Create VPC and Subnets
  - Create Internet Gateway and Route Tables
  - Create Security Groups
  - Create RDS PostgreSQL instance (15-20 min)
  - Create ElastiCache Redis cluster (10-15 min)
  - Create S3 bucket
  - Create IAM roles and policies
  - Create EC2 instance
  - Create CloudWatch Log Groups

Step 4: Wait for Resources
  - RDS: Wait until status = available
  - Redis: Wait until status = available
  - EC2: Wait until status checks pass
```

### Application Deployment
```
Step 1: Connect to EC2
  - SSH using key pair
  - Verify connectivity

Step 2: Install Dependencies
  - Update system packages
  - Install Python 3.11+
  - Install Nginx
  - Install PostgreSQL client
  - Install Redis client
  - Install CloudWatch Agent

Step 3: Deploy Backend
  - Clone backend repository
  - Install Python dependencies
  - Configure environment variables
  - Run database migrations (Alembic)
  - Create systemd service
  - Start FastAPI service

Step 4: Deploy Frontend
  - Copy React build files
  - Configure Nginx server blocks
  - Test Nginx configuration
  - Restart Nginx

Step 5: Configure Monitoring
  - Configure CloudWatch Agent
  - Start CloudWatch Agent
  - Verify logs are streaming

Step 6: Verify Deployment
  - Test backend API endpoints
  - Test frontend access
  - Test database connectivity
  - Test Redis connectivity
  - Test S3 upload
  - Test SSE connection
```

---

## Disaster Recovery Procedures

### RDS Failure Recovery
```
Scenario: RDS instance failure

Recovery Steps:
  1. Check RDS console for instance status
  2. If automated backup exists:
     - Restore from latest automated backup
     - Update EC2 environment variable with new endpoint
     - Restart FastAPI service
  3. If no backup:
     - Create new RDS instance
     - Run database migrations
     - Restore data from application logs (if possible)
  
Estimated RTO: 15-30 minutes
Estimated RPO: 5 minutes (backup frequency)
```

### EC2 Failure Recovery
```
Scenario: EC2 instance failure

Recovery Steps:
  1. Create AMI from failed instance (if possible)
  2. Launch new EC2 instance:
     - Same instance type (t3.medium)
     - Same subnet (Public Subnet)
     - Same security group
     - Same IAM role
  3. Redeploy application:
     - Clone repositories
     - Install dependencies
     - Configure environment variables
     - Start services
  4. Update DNS (if using Route 53)
  5. Verify all services running

Estimated RTO: 30-60 minutes
Estimated RPO: 0 (stateless application)
```

### Redis Failure Recovery
```
Scenario: Redis cluster failure

Recovery Steps:
  1. Check ElastiCache console for cluster status
  2. If cluster is unhealthy:
     - Delete cluster
     - Create new cluster with same configuration
     - Update EC2 environment variable with new endpoint
     - Restart FastAPI service
  3. SSE connections will automatically reconnect

Estimated RTO: 15-20 minutes
Estimated RPO: 0 (no persistent data in Redis)
```

---

## Scaling Strategies

### Vertical Scaling (Short-term)
```
EC2 Instance:
  Current: t3.medium (2 vCPU, 4GB RAM)
  Next: t3.large (2 vCPU, 8GB RAM)
  Action: Stop instance, change instance type, start instance
  Downtime: 5-10 minutes

RDS Instance:
  Current: db.t3.small (2 vCPU, 2GB RAM)
  Next: db.t3.medium (2 vCPU, 4GB RAM)
  Action: Modify instance class (can be done with minimal downtime)
  Downtime: 5-10 minutes

Redis Cluster:
  Current: cache.t3.micro (0.5GB RAM)
  Next: cache.t3.small (1.5GB RAM)
  Action: Modify cluster node type
  Downtime: 10-15 minutes
```

### Horizontal Scaling (Long-term)
```
Step 1: Add Application Load Balancer
  - Create ALB in Public Subnet
  - Configure target group
  - Add health checks

Step 2: Create Auto Scaling Group
  - Create Launch Template from current EC2
  - Configure Auto Scaling Group (min: 2, max: 4)
  - Attach to ALB target group

Step 3: Enable Multi-AZ for RDS
  - Modify RDS instance to enable Multi-AZ
  - Automatic failover configured

Step 4: Add Redis Replicas
  - Modify Redis cluster to add read replicas
  - Configure application to use read replicas

Step 5: Add CloudFront for Frontend
  - Create CloudFront distribution
  - Point to S3 bucket (migrate from Nginx)
  - Configure custom domain
```

---

## Cost Optimization Recommendations

### Current Monthly Cost: ~$79
```
Breakdown:
  - EC2 t3.medium: $30
  - RDS db.t3.small: $25
  - ElastiCache Redis: $12
  - S3 + Data Transfer: $10
  - CloudWatch: $2
```

### Optimization Options
```
1. Use Reserved Instances (1 year)
   - EC2: Save ~40% ($18/month)
   - RDS: Save ~40% ($15/month)
   - Total Savings: ~$33/month

2. Use Spot Instances (Dev environment only)
   - EC2: Save up to 90%
   - Not recommended for production

3. Optimize Data Transfer
   - Use CloudFront for static assets
   - Reduce outbound data transfer

4. Right-size Resources
   - Monitor actual usage
   - Downgrade if underutilized
   - Upgrade if overutilized

5. Use S3 Intelligent-Tiering
   - Automatically move infrequently accessed images to cheaper storage
   - Potential savings: 20-30% on S3 costs
```

---

## Security Hardening Checklist

### Network Security
- [x] Private subnets for databases
- [x] Security groups with least privilege
- [x] SSH access from specific IP only
- [ ] Enable VPC Flow Logs
- [ ] Enable AWS WAF (future)

### Data Security
- [x] RDS encryption at rest (default)
- [x] S3 bucket encryption (AES256)
- [x] Database credentials in Secrets Manager
- [ ] Enable SSL/TLS for RDS connections
- [ ] Enable Redis encryption in transit

### Access Security
- [x] IAM roles for EC2 (no hardcoded credentials)
- [x] S3 bucket policy (EC2 role only)
- [ ] Enable MFA for AWS console
- [ ] Implement AWS SSO
- [ ] Enable CloudTrail for audit logs

### Application Security
- [ ] Implement rate limiting (Nginx)
- [ ] Enable HTTPS with SSL certificate (ACM)
- [ ] Implement CORS policies
- [ ] Add security headers (Nginx)
- [ ] Enable CSRF protection (FastAPI)

---

## Maintenance Procedures

### Regular Maintenance Tasks
```
Daily:
  - Review CloudWatch Logs for errors
  - Check RDS automated backup status

Weekly:
  - Review CloudWatch metrics
  - Check disk space on EC2
  - Review security group rules

Monthly:
  - Apply OS security patches (EC2)
  - Review and optimize costs
  - Test disaster recovery procedures
  - Review and rotate credentials

Quarterly:
  - Review and update IAM policies
  - Conduct security audit
  - Review and optimize database performance
  - Update application dependencies
```

### Patching Strategy
```
EC2 Patching:
  - Schedule: Monthly, during maintenance window
  - Process:
    1. Create AMI snapshot
    2. Apply OS updates (yum update)
    3. Restart services
    4. Verify functionality
    5. Rollback if issues

RDS Patching:
  - Automatic minor version upgrades: Enabled
  - Maintenance window: Monday 04:00-05:00 UTC
  - Major version upgrades: Manual (test first)

Application Updates:
  - Blue-Green deployment (future)
  - Rolling updates (future with ASG)
  - Current: Manual deployment with downtime
```

---

## Conclusion

이 Deployment Architecture는 테이블오더 서비스를 위한 **비용 효율적이고 관리 가능한** AWS 인프라를 제공합니다.

**주요 특징**:
- ✅ Single-Server 아키텍처로 간단한 관리
- ✅ 중규모 사용자(10-50명) 지원
- ✅ 보안 강화 (Private Subnet, Security Groups)
- ✅ 모니터링 및 로깅 (CloudWatch)
- ✅ 백업 및 복구 전략
- ✅ 확장 가능한 설계 (필요시 수평 확장)

**예상 월 비용**: ~$79 (On-Demand 기준)

**다음 단계**: Terraform 코드 생성 (Code Generation 단계)

