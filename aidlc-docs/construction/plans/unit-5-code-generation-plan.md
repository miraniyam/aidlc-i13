# Unit 5 Code Generation Plan - Infrastructure (Terraform)

## Unit Context
- **Unit Name**: Unit 5 - Infrastructure (Terraform)
- **Repository**: table-order-infrastructure
- **Type**: Infrastructure as Code
- **Code Generation Method**: Standard (Terraform 코드만)
- **Purpose**: AWS 인프라 프로비저닝 및 배포 환경 구성

## Dependencies
- **Upstream**: None (독립적으로 개발 가능)
- **Downstream**: Unit 1 (Backend API & Database) 배포 대상

## Code Location
- **Workspace Root**: `/` (현재 워크스페이스 루트)
- **Infrastructure Code**: `table-order-infrastructure/` (새 디렉토리)
- **Documentation**: `aidlc-docs/construction/unit-5-infrastructure/code/`

## Infrastructure Design Reference
- `aidlc-docs/construction/unit-5-infrastructure/infrastructure-design/infrastructure-design.md`
- `aidlc-docs/construction/unit-5-infrastructure/infrastructure-design/deployment-architecture.md`

---

# PART 1: PLANNING

## Code Generation Plan

### Step 1: Project Structure Setup
- [x] Create `table-order-infrastructure/` directory in workspace root
- [x] Create Terraform module directories:
  - [x] `modules/vpc/` - VPC and networking
  - [x] `modules/compute/` - EC2 instance
  - [x] `modules/database/` - RDS PostgreSQL
  - [x] `modules/cache/` - ElastiCache Redis
  - [x] `modules/storage/` - S3 bucket
  - [x] `modules/security/` - Security Groups, IAM
  - [x] `modules/monitoring/` - CloudWatch
- [x] Create environment directory:
  - [x] `environments/prod/` - Production environment
- [x] Create root configuration files:
  - [x] `.gitignore`
  - [x] `README.md`

### Step 2: VPC Module Generation
- [x] Create `modules/vpc/main.tf` - VPC, Subnets, IGW, Route Tables
- [x] Create `modules/vpc/variables.tf` - Input variables
- [x] Create `modules/vpc/outputs.tf` - Output values
- [x] Implement resources:
  - [x] VPC (10.0.0.0/16)
  - [x] Public Subnet (10.0.1.0/24)
  - [x] Private Subnet (10.0.2.0/24)
  - [x] Internet Gateway
  - [x] Route Tables (Public, Private)
  - [x] Route Table Associations

### Step 3: Security Module Generation
- [x] Create `modules/security/main.tf` - Security Groups, IAM Roles
- [x] Create `modules/security/variables.tf` - Input variables
- [x] Create `modules/security/outputs.tf` - Output values
- [x] Implement resources:
  - [x] EC2 Security Group (SSH, HTTP, HTTPS, FastAPI)
  - [x] RDS Security Group (PostgreSQL from EC2)
  - [x] Redis Security Group (Redis from EC2)
  - [x] EC2 IAM Role (S3, CloudWatch, Secrets Manager)
  - [x] EC2 Instance Profile

### Step 4: Compute Module Generation
- [x] Create `modules/compute/main.tf` - EC2 instance
- [x] Create `modules/compute/variables.tf` - Input variables
- [x] Create `modules/compute/outputs.tf` - Output values
- [x] Create `modules/compute/user_data.sh` - EC2 initialization script
- [x] Implement resources:
  - [x] EC2 Instance (t3.medium, Amazon Linux 2)
  - [x] EBS Volume (30GB gp3)
  - [x] User Data (Python, FastAPI, Nginx, CloudWatch Agent)

### Step 5: Database Module Generation
- [x] Create `modules/database/main.tf` - RDS PostgreSQL
- [x] Create `modules/database/variables.tf` - Input variables
- [x] Create `modules/database/outputs.tf` - Output values
- [x] Implement resources:
  - [x] DB Subnet Group (Private Subnet)
  - [x] RDS Instance (db.t3.small, PostgreSQL 15)
  - [x] DB Parameter Group (custom settings)

### Step 6: Cache Module Generation
- [x] Create `modules/cache/main.tf` - ElastiCache Redis
- [x] Create `modules/cache/variables.tf` - Input variables
- [x] Create `modules/cache/outputs.tf` - Output values
- [x] Implement resources:
  - [x] ElastiCache Subnet Group (Private Subnet)
  - [x] ElastiCache Cluster (cache.t3.micro, Redis 7)

### Step 7: Storage Module Generation
- [x] Create `modules/storage/main.tf` - S3 bucket
- [x] Create `modules/storage/variables.tf` - Input variables
- [x] Create `modules/storage/outputs.tf` - Output values
- [x] Implement resources:
  - [x] S3 Bucket (menu images)
  - [x] S3 Bucket Encryption (AES256)
  - [x] S3 Bucket Public Access Block
  - [x] S3 Bucket Policy (EC2 IAM Role access)

### Step 8: Monitoring Module Generation
- [x] Create `modules/monitoring/main.tf` - CloudWatch
- [x] Create `modules/monitoring/variables.tf` - Input variables
- [x] Create `modules/monitoring/outputs.tf` - Output values
- [x] Implement resources:
  - [x] CloudWatch Log Group (FastAPI logs)
  - [x] CloudWatch Log Group (Nginx logs)
  - [x] CloudWatch Alarms (optional: CPU, Memory)

### Step 9: Production Environment Configuration
- [x] Create `environments/prod/main.tf` - Root module
- [x] Create `environments/prod/variables.tf` - Environment variables
- [x] Create `environments/prod/outputs.tf` - Environment outputs
- [x] Create `environments/prod/terraform.tfvars` - Variable values
- [x] Create `environments/prod/backend.tf` - Terraform state backend (local)
- [x] Implement:
  - [x] Module calls (VPC, Security, Compute, Database, Cache, Storage, Monitoring)
  - [x] Variable definitions (region, environment, instance types)
  - [x] Output definitions (EC2 IP, RDS endpoint, Redis endpoint, S3 bucket)

### Step 10: Root Configuration Files
- [x] Create `table-order-infrastructure/.gitignore` - Ignore Terraform files
- [x] Create `table-order-infrastructure/README.md` - Documentation
- [x] Include in README:
  - [x] Project overview
  - [x] Prerequisites (Terraform, AWS CLI)
  - [x] Directory structure
  - [x] Usage instructions (init, plan, apply, destroy)
  - [x] Variable configuration
  - [x] Output values
  - [x] Cost estimation
  - [x] Troubleshooting

### Step 11: Deployment Scripts Generation
- [x] Create `table-order-infrastructure/scripts/deploy.sh` - Deployment script
- [x] Create `table-order-infrastructure/scripts/destroy.sh` - Cleanup script
- [x] Create `table-order-infrastructure/scripts/validate.sh` - Validation script
- [x] Implement scripts:
  - [x] deploy.sh (terraform init, plan, apply)
  - [x] destroy.sh (terraform destroy with confirmation)
  - [x] validate.sh (terraform validate, fmt check)

### Step 12: Documentation Generation
- [x] Create `aidlc-docs/construction/unit-5-infrastructure/code/terraform-code-summary.md`
- [x] Include:
  - [x] Module overview
  - [x] Resource summary (11 AWS services)
  - [x] Variable reference
  - [x] Output reference
  - [x] Usage examples
  - [x] Best practices

### Step 13: Deployment Instructions Generation
- [x] Create `aidlc-docs/construction/unit-5-infrastructure/code/deployment-instructions.md`
- [x] Include:
  - [x] Prerequisites checklist
  - [x] AWS credentials setup
  - [x] Terraform installation
  - [x] Step-by-step deployment
  - [x] Verification steps
  - [x] Troubleshooting guide
  - [x] Rollback procedures

---

# PART 2: GENERATION

## Execution Sequence

### Phase 1: Project Structure (Step 1)
1. Create directory structure
2. Create root configuration files

### Phase 2: Core Modules (Steps 2-8)
1. VPC Module (networking foundation)
2. Security Module (security groups, IAM)
3. Compute Module (EC2 instance)
4. Database Module (RDS PostgreSQL)
5. Cache Module (ElastiCache Redis)
6. Storage Module (S3 bucket)
7. Monitoring Module (CloudWatch)

### Phase 3: Environment Configuration (Step 9)
1. Production environment setup
2. Module integration
3. Variable configuration

### Phase 4: Supporting Files (Steps 10-13)
1. Root configuration files
2. Deployment scripts
3. Documentation

---

## Resource Summary

### Terraform Modules (7)
1. **VPC Module**: VPC, Subnets, IGW, Route Tables
2. **Security Module**: Security Groups, IAM Roles
3. **Compute Module**: EC2 Instance
4. **Database Module**: RDS PostgreSQL
5. **Cache Module**: ElastiCache Redis
6. **Storage Module**: S3 Bucket
7. **Monitoring Module**: CloudWatch Logs

### AWS Resources (Total: 25+)
- **Networking**: VPC, 2 Subnets, IGW, 2 Route Tables, 2 Associations
- **Security**: 3 Security Groups, 1 IAM Role, 1 Instance Profile, 1 IAM Policy
- **Compute**: 1 EC2 Instance, 1 EBS Volume
- **Database**: 1 RDS Instance, 1 DB Subnet Group, 1 Parameter Group
- **Cache**: 1 ElastiCache Cluster, 1 Subnet Group
- **Storage**: 1 S3 Bucket, 1 Bucket Policy, 1 Public Access Block
- **Monitoring**: 2 CloudWatch Log Groups

### Configuration Files (20+)
- Module files: 21 files (7 modules × 3 files each)
- Environment files: 5 files (main, variables, outputs, tfvars, backend)
- Root files: 2 files (.gitignore, README.md)
- Scripts: 3 files (deploy, destroy, validate)
- Documentation: 2 files (code summary, deployment instructions)

---

## Estimated Effort
- **Module Generation**: 2-3 hours
- **Environment Configuration**: 1 hour
- **Documentation**: 1 hour
- **Total**: 4-5 hours

---

## Success Criteria
- [ ] All Terraform modules created with proper structure
- [ ] All AWS resources defined according to infrastructure design
- [ ] Production environment configured and ready to deploy
- [ ] Deployment scripts functional
- [ ] Documentation complete and accurate
- [ ] `terraform validate` passes
- [ ] `terraform plan` shows expected resources

---

## Next Steps
1. User approval of this plan
2. Execute code generation (Steps 1-13)
3. Present completion message
4. User approval of generated code
5. Proceed to Build and Test phase

