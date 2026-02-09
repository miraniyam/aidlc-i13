# Table Order Infrastructure

AWS 인프라를 Terraform으로 관리하는 Infrastructure as Code 프로젝트입니다.

## Overview

테이블오더 서비스를 위한 AWS 인프라를 프로비저닝합니다:
- **Compute**: EC2 t3.medium (Backend + Frontend)
- **Database**: RDS PostgreSQL db.t3.small
- **Cache**: ElastiCache Redis cache.t3.micro
- **Storage**: S3 (메뉴 이미지)
- **Network**: VPC, Public/Private Subnets
- **Monitoring**: CloudWatch Logs

## Prerequisites

### Required Tools
- [Terraform](https://www.terraform.io/downloads) >= 1.5.0
- [AWS CLI](https://aws.amazon.com/cli/) >= 2.0
- AWS Account with appropriate permissions

### AWS Credentials
Configure AWS credentials using one of these methods:

**Option 1: AWS CLI**
```bash
aws configure
```

**Option 2: Environment Variables**
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="ap-northeast-2"
```

**Option 3: AWS Profile**
```bash
export AWS_PROFILE="your-profile-name"
```

## Directory Structure

```
table-order-infrastructure/
├── modules/
│   ├── vpc/              # VPC, Subnets, IGW, Route Tables
│   ├── security/         # Security Groups, IAM Roles
│   ├── compute/          # EC2 Instance
│   ├── database/         # RDS PostgreSQL
│   ├── cache/            # ElastiCache Redis
│   ├── storage/          # S3 Bucket
│   └── monitoring/       # CloudWatch Logs
├── environments/
│   └── prod/             # Production environment
│       ├── main.tf       # Root module
│       ├── variables.tf  # Variable definitions
│       ├── outputs.tf    # Output definitions
│       ├── terraform.tfvars  # Variable values (gitignored)
│       └── backend.tf    # State backend configuration
├── scripts/
│   ├── deploy.sh         # Deployment script
│   ├── destroy.sh        # Cleanup script
│   └── validate.sh       # Validation script
├── .gitignore
└── README.md
```

## Quick Start

### 1. Clone Repository
```bash
cd table-order-infrastructure
```

### 2. Configure Variables
Copy the example tfvars file and edit it:
```bash
cd environments/prod
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 3. Initialize Terraform
```bash
terraform init
```

### 4. Validate Configuration
```bash
terraform validate
terraform fmt -check
```

### 5. Plan Deployment
```bash
terraform plan
```

### 6. Apply Infrastructure
```bash
terraform apply
```

### 7. Get Outputs
```bash
terraform output
```

## Using Deployment Scripts

### Deploy Infrastructure
```bash
cd table-order-infrastructure
./scripts/deploy.sh
```

### Validate Configuration
```bash
./scripts/validate.sh
```

### Destroy Infrastructure
```bash
./scripts/destroy.sh
```

## Configuration

### Required Variables

Edit `environments/prod/terraform.tfvars`:

```hcl
# Project Configuration
project_name = "table-order"
environment  = "prod"

# AWS Configuration
aws_region = "ap-northeast-2"

# Network Configuration
vpc_cidr           = "10.0.0.0/16"
public_subnet_cidr = "10.0.1.0/24"
private_subnet_cidr = "10.0.2.0/24"
availability_zone  = "ap-northeast-2a"

# EC2 Configuration
ec2_instance_type = "t3.medium"
ec2_key_name      = "your-key-pair-name"  # Create this in AWS Console first
ssh_allowed_ip    = "YOUR_IP/32"          # Your IP address for SSH access

# RDS Configuration
db_instance_class = "db.t3.small"
db_name           = "tableorder"
db_username       = "admin"
db_password       = "CHANGE_ME_STRONG_PASSWORD"  # Change this!

# Redis Configuration
redis_node_type = "cache.t3.micro"

# Tags
tags = {
  Project     = "table-order"
  Environment = "prod"
  ManagedBy   = "terraform"
}
```

### Optional Variables

See `environments/prod/variables.tf` for all available variables.

## Outputs

After successful deployment, Terraform will output:

```
ec2_public_ip       = "x.x.x.x"
ec2_instance_id     = "i-xxxxx"
rds_endpoint        = "xxxxx.rds.amazonaws.com:5432"
redis_endpoint      = "xxxxx.cache.amazonaws.com:6379"
s3_bucket_name      = "table-order-menu-images-xxxxx"
vpc_id              = "vpc-xxxxx"
```

## Accessing Resources

### SSH to EC2
```bash
ssh -i your-key.pem ec2-user@<ec2_public_ip>
```

### Connect to RDS (from EC2)
```bash
psql -h <rds_endpoint> -U admin -d tableorder
```

### Connect to Redis (from EC2)
```bash
redis-cli -h <redis_endpoint>
```

## Cost Estimation

Estimated monthly cost (Seoul region, On-Demand):

| Service | Configuration | Monthly Cost (USD) |
|---------|---------------|-------------------|
| EC2 t3.medium | 730 hours | ~$30 |
| RDS db.t3.small | Single-AZ, 20GB | ~$25 |
| ElastiCache Redis | cache.t3.micro | ~$12 |
| S3 Storage | 10GB | ~$0.25 |
| Data Transfer | 100GB out | ~$9 |
| CloudWatch Logs | 5GB | ~$2.50 |
| **Total** | | **~$79/month** |

## Maintenance

### Update Infrastructure
1. Modify Terraform files
2. Run `terraform plan` to review changes
3. Run `terraform apply` to apply changes

### Backup
- RDS: Automated daily backups (7 days retention)
- S3: Durable storage (99.999999999%)
- EC2: Create AMI snapshots manually

### Monitoring
- CloudWatch Logs: `/aws/ec2/table-order/fastapi`, `/aws/ec2/table-order/nginx`
- CloudWatch Metrics: EC2, RDS, Redis metrics

## Troubleshooting

### Terraform Init Fails
```bash
# Clear cache and reinitialize
rm -rf .terraform .terraform.lock.hcl
terraform init
```

### Plan Shows Unexpected Changes
```bash
# Refresh state
terraform refresh
terraform plan
```

### Apply Fails
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check Terraform logs
export TF_LOG=DEBUG
terraform apply
```

### RDS Takes Long Time
- RDS instance creation takes 15-20 minutes
- Be patient and wait for completion

### EC2 User Data Not Running
```bash
# SSH to EC2 and check logs
ssh -i your-key.pem ec2-user@<ec2_ip>
sudo cat /var/log/cloud-init-output.log
```

## Security Best Practices

- ✅ Use strong passwords for RDS
- ✅ Restrict SSH access to specific IP
- ✅ Keep RDS and Redis in private subnets
- ✅ Enable encryption for S3 and RDS
- ✅ Use IAM roles instead of hardcoded credentials
- ✅ Regularly update security groups
- ✅ Enable CloudTrail for audit logs
- ✅ Use AWS Secrets Manager for sensitive data

## Cleanup

To destroy all infrastructure:

```bash
terraform destroy
```

**Warning**: This will delete all resources including databases. Make sure to backup data first!

## Support

For issues or questions:
1. Check Terraform documentation: https://www.terraform.io/docs
2. Check AWS documentation: https://docs.aws.amazon.com
3. Review CloudWatch logs for application errors

## License

This infrastructure code is part of the Table Order project.

