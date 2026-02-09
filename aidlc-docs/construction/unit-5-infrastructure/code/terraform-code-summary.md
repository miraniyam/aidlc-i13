# Terraform Code Summary - Unit 5 (Infrastructure)

## Overview

테이블오더 서비스를 위한 AWS 인프라를 Terraform으로 구성한 Infrastructure as Code 프로젝트입니다.

## Module Structure

### 1. VPC Module (`modules/vpc/`)
**Purpose**: 네트워크 인프라 구성

**Resources**:
- `aws_vpc.main` - VPC (10.0.0.0/16)
- `aws_subnet.public` - Public Subnet (10.0.1.0/24)
- `aws_subnet.private` - Private Subnet (10.0.2.0/24)
- `aws_internet_gateway.main` - Internet Gateway
- `aws_route_table.public` - Public Route Table
- `aws_route_table.private` - Private Route Table
- `aws_route_table_association.public` - Public Subnet Association
- `aws_route_table_association.private` - Private Subnet Association

**Key Outputs**:
- `vpc_id` - VPC ID
- `public_subnet_id` - Public Subnet ID
- `private_subnet_id` - Private Subnet ID

---

### 2. Security Module (`modules/security/`)
**Purpose**: 보안 그룹 및 IAM 역할 구성

**Resources**:
- `aws_security_group.ec2` - EC2 Security Group (SSH, HTTP, HTTPS, FastAPI)
- `aws_security_group.rds` - RDS Security Group (PostgreSQL from EC2)
- `aws_security_group.redis` - Redis Security Group (Redis from EC2)
- `aws_iam_role.ec2_role` - EC2 IAM Role
- `aws_iam_role_policy.ec2_policy` - EC2 IAM Policy (S3, CloudWatch, Secrets Manager)
- `aws_iam_instance_profile.ec2_profile` - EC2 Instance Profile

**Key Outputs**:
- `ec2_security_group_id` - EC2 Security Group ID
- `rds_security_group_id` - RDS Security Group ID
- `redis_security_group_id` - Redis Security Group ID
- `ec2_instance_profile_name` - EC2 Instance Profile Name

---

### 3. Compute Module (`modules/compute/`)
**Purpose**: EC2 인스턴스 구성

**Resources**:
- `aws_instance.app_server` - EC2 Instance (t3.medium, Amazon Linux 2)
- `aws_eip.app_server` - Elastic IP

**User Data Script**: `user_data.sh`
- Python 3.11 설치
- Nginx 설치
- PostgreSQL/Redis 클라이언트 설치
- CloudWatch Agent 설치
- systemd 서비스 설정

**Key Outputs**:
- `instance_id` - EC2 Instance ID
- `instance_public_ip` - Public IP Address
- `elastic_ip` - Elastic IP Address

---

### 4. Database Module (`modules/database/`)
**Purpose**: RDS PostgreSQL 구성

**Resources**:
- `aws_db_subnet_group.main` - DB Subnet Group
- `aws_db_parameter_group.main` - DB Parameter Group
- `aws_db_instance.postgres` - RDS PostgreSQL (db.t3.small, 20GB)

**Key Outputs**:
- `db_endpoint` - RDS Connection Endpoint
- `db_address` - RDS Hostname
- `db_port` - RDS Port (5432)

---

### 5. Cache Module (`modules/cache/`)
**Purpose**: ElastiCache Redis 구성

**Resources**:
- `aws_elasticache_subnet_group.main` - Redis Subnet Group
- `aws_elasticache_cluster.redis` - Redis Cluster (cache.t3.micro)

**Key Outputs**:
- `redis_endpoint` - Redis Hostname
- `redis_port` - Redis Port (6379)
- `redis_configuration_endpoint` - Full Connection String

---

### 6. Storage Module (`modules/storage/`)
**Purpose**: S3 버킷 구성

**Resources**:
- `aws_s3_bucket.images` - S3 Bucket (menu images)
- `aws_s3_bucket_server_side_encryption_configuration.images` - Encryption (AES256)
- `aws_s3_bucket_public_access_block.images` - Public Access Block
- `aws_s3_bucket_policy.images` - Bucket Policy (EC2 IAM Role access)

**Key Outputs**:
- `bucket_name` - S3 Bucket Name
- `bucket_arn` - S3 Bucket ARN

---

### 7. Monitoring Module (`modules/monitoring/`)
**Purpose**: CloudWatch Logs 구성

**Resources**:
- `aws_cloudwatch_log_group.fastapi` - FastAPI Log Group (7 days retention)
- `aws_cloudwatch_log_group.nginx` - Nginx Log Group (7 days retention)

**Key Outputs**:
- `fastapi_log_group_name` - FastAPI Log Group Name
- `nginx_log_group_name` - Nginx Log Group Name

---

## Environment Configuration

### Production Environment (`environments/prod/`)

**Main Configuration** (`main.tf`):
- Integrates all 7 modules
- Configures module dependencies
- Sets up provider and backend

**Variables** (`variables.tf`):
- Project configuration (name, environment)
- AWS configuration (region)
- Network configuration (VPC CIDR, Subnets)
- EC2 configuration (instance type, key pair, SSH IP)
- RDS configuration (instance class, storage, credentials)
- Redis configuration (node type)
- Monitoring configuration (log retention)
- Tags

**Outputs** (`outputs.tf`):
- VPC information
- EC2 connection details
- RDS connection details
- Redis connection details
- S3 bucket information
- CloudWatch log groups
- Deployment information (SSH command, URLs)

**Backend** (`backend.tf`):
- Local backend (default)
- S3 backend configuration (commented, for team collaboration)

**Variables File** (`terraform.tfvars.example`):
- Example configuration
- Must be copied to `terraform.tfvars` and customized

---

## Deployment Scripts

### 1. `scripts/deploy.sh`
**Purpose**: 인프라 배포 자동화

**Steps**:
1. Check prerequisites (Terraform, AWS CLI)
2. Verify AWS credentials
3. Check terraform.tfvars exists
4. Initialize Terraform
5. Validate configuration
6. Format check
7. Create plan
8. Ask for confirmation
9. Apply plan

### 2. `scripts/destroy.sh`
**Purpose**: 인프라 정리 자동화

**Steps**:
1. Display warning
2. Ask for double confirmation
3. Destroy all resources

### 3. `scripts/validate.sh`
**Purpose**: 설정 검증 자동화

**Steps**:
1. Check Terraform installation
2. Initialize if needed
3. Validate configuration
4. Check formatting

---

## Resource Summary

### Total AWS Resources: 25+

**Networking** (8):
- 1 VPC
- 2 Subnets (Public, Private)
- 1 Internet Gateway
- 2 Route Tables
- 2 Route Table Associations

**Security** (6):
- 3 Security Groups (EC2, RDS, Redis)
- 1 IAM Role
- 1 IAM Policy
- 1 Instance Profile

**Compute** (2):
- 1 EC2 Instance
- 1 Elastic IP

**Database** (3):
- 1 RDS Instance
- 1 DB Subnet Group
- 1 DB Parameter Group

**Cache** (2):
- 1 ElastiCache Cluster
- 1 Subnet Group

**Storage** (4):
- 1 S3 Bucket
- 1 Encryption Configuration
- 1 Public Access Block
- 1 Bucket Policy

**Monitoring** (2):
- 2 CloudWatch Log Groups

---

## Configuration Files: 30+

**Module Files** (21):
- 7 modules × 3 files each (main.tf, variables.tf, outputs.tf)

**Environment Files** (5):
- main.tf
- variables.tf
- outputs.tf
- backend.tf
- terraform.tfvars.example

**Root Files** (2):
- .gitignore
- README.md

**Scripts** (3):
- deploy.sh
- destroy.sh
- validate.sh

**Additional** (1):
- user_data.sh (EC2 initialization)

---

## Variable Reference

### Required Variables
- `ec2_key_name` - EC2 key pair name (must create in AWS Console first)
- `ssh_allowed_ip` - Your IP address for SSH access (CIDR notation)
- `db_password` - RDS master password (use strong password)

### Optional Variables (with defaults)
- `project_name` - "table-order"
- `environment` - "prod"
- `aws_region` - "ap-northeast-2"
- `vpc_cidr` - "10.0.0.0/16"
- `ec2_instance_type` - "t3.medium"
- `db_instance_class` - "db.t3.small"
- `redis_node_type` - "cache.t3.micro"

---

## Output Reference

### Connection Information
- `ec2_public_ip` - EC2 public IP for SSH and HTTP access
- `rds_endpoint` - RDS connection endpoint (host:port)
- `redis_endpoint` - Redis connection endpoint (host:port)
- `s3_bucket_name` - S3 bucket name for image uploads

### Deployment URLs
- Backend API: `http://<ec2_public_ip>:8000`
- Customer UI: `http://<ec2_public_ip>/`
- Admin UI: `http://<ec2_public_ip>/admin`
- SuperAdmin UI: `http://<ec2_public_ip>/superadmin`

---

## Usage Examples

### Initialize and Deploy
```bash
cd table-order-infrastructure/environments/prod
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
terraform plan
terraform apply
```

### Using Scripts
```bash
cd table-order-infrastructure
./scripts/validate.sh  # Validate configuration
./scripts/deploy.sh    # Deploy infrastructure
./scripts/destroy.sh   # Cleanup infrastructure
```

### Get Outputs
```bash
terraform output                    # All outputs
terraform output ec2_public_ip      # EC2 IP only
terraform output -json              # JSON format
```

### SSH to EC2
```bash
ssh -i your-key.pem ec2-user@$(terraform output -raw ec2_public_ip)
```

---

## Best Practices

### Security
- ✅ Use strong passwords for RDS
- ✅ Restrict SSH access to specific IP
- ✅ Keep RDS and Redis in private subnets
- ✅ Enable encryption for S3 and RDS
- ✅ Use IAM roles instead of hardcoded credentials

### State Management
- ✅ Use remote backend (S3) for team collaboration
- ✅ Enable state locking with DynamoDB
- ✅ Never commit terraform.tfstate to git

### Cost Optimization
- ✅ Use appropriate instance sizes
- ✅ Enable automated backups (7 days)
- ✅ Monitor CloudWatch costs
- ✅ Consider Reserved Instances for production

### Maintenance
- ✅ Regularly update Terraform and providers
- ✅ Review and update security groups
- ✅ Monitor CloudWatch logs
- ✅ Test disaster recovery procedures

---

## Troubleshooting

### Common Issues

**1. Terraform Init Fails**
```bash
rm -rf .terraform .terraform.lock.hcl
terraform init
```

**2. Plan Shows Unexpected Changes**
```bash
terraform refresh
terraform plan
```

**3. Apply Fails**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Enable debug logging
export TF_LOG=DEBUG
terraform apply
```

**4. RDS Takes Long Time**
- RDS creation takes 15-20 minutes
- Be patient and wait for completion

---

## Next Steps

1. Deploy infrastructure using `./scripts/deploy.sh`
2. Verify all resources created successfully
3. SSH to EC2 and check initialization logs
4. Deploy backend application (Unit 1)
5. Deploy frontend applications (Unit 2, 3, 4)
6. Configure monitoring and alerts
7. Test end-to-end functionality

