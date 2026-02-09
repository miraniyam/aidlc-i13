# Deployment Instructions - Unit 5 (Infrastructure)

## Prerequisites

### 1. Required Tools

#### Terraform
```bash
# Check if installed
terraform version

# Should be >= 1.5.0
# If not installed, visit: https://www.terraform.io/downloads
```

#### AWS CLI
```bash
# Check if installed
aws --version

# Should be >= 2.0
# If not installed, visit: https://aws.amazon.com/cli/
```

### 2. AWS Account Setup

#### Create AWS Account
- AWS 계정이 없다면 생성: https://aws.amazon.com/

#### Configure AWS Credentials
```bash
# Option 1: AWS CLI Configure
aws configure
# Enter: Access Key ID, Secret Access Key, Region (ap-northeast-2), Output format (json)

# Option 2: Environment Variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="ap-northeast-2"

# Option 3: AWS Profile
export AWS_PROFILE="your-profile-name"
```

#### Verify Credentials
```bash
aws sts get-caller-identity
# Should return your AWS account information
```

### 3. Create EC2 Key Pair

**AWS Console**:
1. AWS Console → EC2 → Key Pairs
2. Create Key Pair
3. Name: `table-order-key` (or your preferred name)
4. Type: RSA
5. Format: .pem
6. Download and save the .pem file
7. Set permissions: `chmod 400 table-order-key.pem`

**AWS CLI**:
```bash
aws ec2 create-key-pair \
  --key-name table-order-key \
  --query 'KeyMaterial' \
  --output text > table-order-key.pem

chmod 400 table-order-key.pem
```

### 4. Get Your Public IP

```bash
# Option 1: Using curl
curl ifconfig.me

# Option 2: Using AWS CLI
curl checkip.amazonaws.com

# Note: Add /32 for CIDR notation (e.g., 1.2.3.4/32)
```

---

## Step-by-Step Deployment

### Step 1: Navigate to Infrastructure Directory

```bash
cd table-order-infrastructure/environments/prod
```

### Step 2: Configure Variables

```bash
# Copy example file
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars  # or use your preferred editor
```

**Required Changes in terraform.tfvars**:
```hcl
# CHANGE THESE VALUES:
ec2_key_name   = "table-order-key"        # Your key pair name
ssh_allowed_ip = "YOUR_IP/32"             # Your IP (e.g., 1.2.3.4/32)
db_password    = "STRONG_PASSWORD_HERE"   # Use strong password (min 8 chars)
```

**Optional Changes**:
```hcl
# Adjust if needed:
project_name       = "table-order"
aws_region         = "ap-northeast-2"
ec2_instance_type  = "t3.medium"
db_instance_class  = "db.t3.small"
redis_node_type    = "cache.t3.micro"
```

### Step 3: Initialize Terraform

```bash
terraform init
```

**Expected Output**:
```
Initializing modules...
Initializing the backend...
Initializing provider plugins...
Terraform has been successfully initialized!
```

### Step 4: Validate Configuration

```bash
terraform validate
```

**Expected Output**:
```
Success! The configuration is valid.
```

### Step 5: Format Check (Optional)

```bash
terraform fmt -check -recursive
```

### Step 6: Create Execution Plan

```bash
terraform plan
```

**Review the plan**:
- Check resource count (should be ~25 resources)
- Verify resource names and configurations
- Look for any errors or warnings

**Save plan (optional)**:
```bash
terraform plan -out=tfplan
```

### Step 7: Apply Infrastructure

```bash
terraform apply
```

**Or if you saved the plan**:
```bash
terraform apply tfplan
```

**Confirmation**:
- Review the plan one more time
- Type `yes` to confirm
- Wait for completion (15-25 minutes)

**Expected Timeline**:
- VPC, Subnets, Security Groups: 1-2 minutes
- EC2 Instance: 2-3 minutes
- RDS PostgreSQL: 15-20 minutes (longest)
- ElastiCache Redis: 10-15 minutes
- S3, CloudWatch: 1-2 minutes

### Step 8: Verify Deployment

```bash
# Check all outputs
terraform output

# Get specific outputs
terraform output ec2_public_ip
terraform output rds_endpoint
terraform output redis_endpoint
terraform output s3_bucket_name
```

---

## Using Deployment Scripts

### Automated Deployment

```bash
cd table-order-infrastructure

# Make scripts executable
chmod +x scripts/*.sh

# Run deployment script
./scripts/deploy.sh
```

**The script will**:
1. Check prerequisites
2. Verify AWS credentials
3. Check terraform.tfvars exists
4. Initialize Terraform
5. Validate configuration
6. Create plan
7. Ask for confirmation
8. Apply infrastructure

### Validation Only

```bash
./scripts/validate.sh
```

### Cleanup (Destroy)

```bash
./scripts/destroy.sh
```

**Warning**: This will delete ALL resources including databases!

---

## Post-Deployment Verification

### 1. Check EC2 Instance

```bash
# Get EC2 public IP
EC2_IP=$(terraform output -raw ec2_public_ip)

# SSH to EC2
ssh -i table-order-key.pem ec2-user@$EC2_IP

# Check initialization logs
sudo cat /var/log/cloud-init-output.log

# Check installed software
python3 --version  # Should be 3.11+
nginx -v
psql --version
redis-cli --version

# Exit EC2
exit
```

### 2. Check RDS Connection (from EC2)

```bash
# SSH to EC2
ssh -i table-order-key.pem ec2-user@$EC2_IP

# Get RDS endpoint
RDS_ENDPOINT=$(terraform output -raw rds_address)

# Connect to PostgreSQL
psql -h $RDS_ENDPOINT -U admin -d tableorder
# Enter password when prompted

# Test connection
\l  # List databases
\q  # Quit

exit
```

### 3. Check Redis Connection (from EC2)

```bash
# SSH to EC2
ssh -i table-order-key.pem ec2-user@$EC2_IP

# Get Redis endpoint
REDIS_ENDPOINT=$(terraform output -raw redis_address)

# Connect to Redis
redis-cli -h $REDIS_ENDPOINT

# Test connection
PING  # Should return PONG
INFO  # Show Redis info
QUIT

exit
```

### 4. Check S3 Bucket

```bash
# Get bucket name
S3_BUCKET=$(terraform output -raw s3_bucket_name)

# List bucket (should be empty)
aws s3 ls s3://$S3_BUCKET/

# Test upload (from local machine)
echo "test" > test.txt
aws s3 cp test.txt s3://$S3_BUCKET/test.txt
aws s3 ls s3://$S3_BUCKET/
aws s3 rm s3://$S3_BUCKET/test.txt
rm test.txt
```

### 5. Check CloudWatch Logs

```bash
# List log groups
aws logs describe-log-groups \
  --log-group-name-prefix "/aws/ec2/table-order"

# Should show:
# - /aws/ec2/table-order/fastapi
# - /aws/ec2/table-order/nginx
```

### 6. Check Nginx

```bash
# Test HTTP access
curl http://$EC2_IP/

# Should return Nginx default page or 404 (normal, no app deployed yet)
```

---

## Troubleshooting

### Issue 1: Terraform Init Fails

**Symptom**: Error downloading providers

**Solution**:
```bash
# Clear cache
rm -rf .terraform .terraform.lock.hcl

# Reinitialize
terraform init
```

### Issue 2: AWS Credentials Error

**Symptom**: "Unable to locate credentials"

**Solution**:
```bash
# Check credentials
aws sts get-caller-identity

# If fails, reconfigure
aws configure
```

### Issue 3: Key Pair Not Found

**Symptom**: "InvalidKeyPair.NotFound"

**Solution**:
```bash
# List existing key pairs
aws ec2 describe-key-pairs

# Create new key pair if needed
aws ec2 create-key-pair --key-name table-order-key \
  --query 'KeyMaterial' --output text > table-order-key.pem

chmod 400 table-order-key.pem
```

### Issue 4: RDS Creation Timeout

**Symptom**: RDS takes very long time

**Solution**:
- RDS creation normally takes 15-20 minutes
- Be patient and wait
- Check AWS Console → RDS for status

### Issue 5: SSH Connection Refused

**Symptom**: Cannot SSH to EC2

**Solution**:
```bash
# Check security group allows your IP
terraform output ec2_public_ip

# Verify your current IP
curl ifconfig.me

# If IP changed, update terraform.tfvars and reapply
terraform apply
```

### Issue 6: Plan Shows Unexpected Changes

**Symptom**: Terraform plan shows changes when nothing changed

**Solution**:
```bash
# Refresh state
terraform refresh

# Plan again
terraform plan
```

### Issue 7: Apply Fails Midway

**Symptom**: Some resources created, some failed

**Solution**:
```bash
# Check what was created
terraform show

# Try applying again (Terraform is idempotent)
terraform apply

# If still fails, check specific error message
```

---

## Next Steps After Deployment

### 1. Deploy Backend Application (Unit 1)

```bash
# SSH to EC2
ssh -i table-order-key.pem ec2-user@$EC2_IP

# Clone backend repository
cd /opt/table-order/backend
git clone <backend-repo-url> .

# Install dependencies
pip3 install -r requirements.txt

# Configure environment variables
cat > .env <<EOF
DATABASE_URL=postgresql://admin:PASSWORD@$RDS_ENDPOINT:5432/tableorder
REDIS_URL=redis://$REDIS_ENDPOINT:6379/0
S3_BUCKET=$S3_BUCKET
AWS_REGION=ap-northeast-2
EOF

# Run database migrations
alembic upgrade head

# Start backend service
sudo systemctl start table-order-backend
sudo systemctl enable table-order-backend

# Check status
sudo systemctl status table-order-backend
```

### 2. Deploy Frontend Applications (Unit 2, 3, 4)

```bash
# Build React apps locally
cd table-order-customer-ui
npm run build

cd ../table-order-admin-ui
npm run build

cd ../table-order-superadmin-ui
npm run build

# Copy build files to EC2
scp -i table-order-key.pem -r table-order-customer-ui/build \
  ec2-user@$EC2_IP:/opt/table-order/frontend/customer-ui/

scp -i table-order-key.pem -r table-order-admin-ui/build \
  ec2-user@$EC2_IP:/opt/table-order/frontend/admin-ui/

scp -i table-order-key.pem -r table-order-superadmin-ui/build \
  ec2-user@$EC2_IP:/opt/table-order/frontend/superadmin-ui/

# Restart Nginx
ssh -i table-order-key.pem ec2-user@$EC2_IP \
  "sudo systemctl restart nginx"
```

### 3. Test End-to-End

```bash
# Get EC2 IP
EC2_IP=$(terraform output -raw ec2_public_ip)

# Test Backend API
curl http://$EC2_IP:8000/api/health

# Test Customer UI
curl http://$EC2_IP/

# Test Admin UI
curl http://$EC2_IP/admin

# Test SuperAdmin UI
curl http://$EC2_IP/superadmin
```

### 4. Configure Monitoring

```bash
# Check CloudWatch Logs
aws logs tail /aws/ec2/table-order/fastapi --follow

# Set up CloudWatch Alarms (optional)
# - High CPU usage
# - High memory usage
# - RDS connection count
# - RDS storage space
```

### 5. Security Hardening

```bash
# Enable HTTPS (optional, requires SSL certificate)
# - Get SSL certificate from AWS Certificate Manager
# - Configure Nginx for HTTPS
# - Update security group to allow port 443

# Enable VPC Flow Logs (optional)
# - Monitor network traffic
# - Detect security issues

# Enable AWS Config (optional)
# - Track configuration changes
# - Compliance monitoring
```

---

## Maintenance

### Regular Tasks

**Daily**:
- Check CloudWatch Logs for errors
- Monitor RDS backup status

**Weekly**:
- Review CloudWatch metrics
- Check disk space on EC2
- Review security group rules

**Monthly**:
- Apply OS security patches
- Review and optimize costs
- Test disaster recovery
- Rotate credentials

### Updating Infrastructure

```bash
# Make changes to Terraform files
nano main.tf

# Plan changes
terraform plan

# Apply changes
terraform apply
```

### Backup and Restore

**RDS Backup**:
- Automated daily backups (7 days retention)
- Manual snapshots: AWS Console → RDS → Snapshots

**EC2 Backup**:
```bash
# Create AMI
aws ec2 create-image \
  --instance-id $(terraform output -raw ec2_instance_id) \
  --name "table-order-backup-$(date +%Y%m%d)" \
  --description "Table Order EC2 backup"
```

---

## Cost Management

### Monitor Costs

```bash
# Check current month costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

### Estimated Monthly Cost

| Service | Cost (USD) |
|---------|-----------|
| EC2 t3.medium | ~$30 |
| RDS db.t3.small | ~$25 |
| ElastiCache Redis | ~$12 |
| S3 + Data Transfer | ~$10 |
| CloudWatch | ~$2 |
| **Total** | **~$79** |

### Cost Optimization

- Stop EC2 when not in use (dev environment)
- Use Reserved Instances (40% savings)
- Right-size instances based on usage
- Enable S3 Intelligent-Tiering
- Clean up old snapshots and logs

---

## Cleanup

### Destroy All Resources

```bash
# Using script
./scripts/destroy.sh

# Or manually
cd environments/prod
terraform destroy
```

**Warning**: This will delete:
- EC2 instance
- RDS database (all data lost)
- ElastiCache Redis
- S3 bucket (all images deleted)
- VPC and networking

**Before destroying**:
- Backup important data
- Export database
- Download S3 files
- Save configuration

---

## Support and Resources

### Documentation
- Terraform: https://www.terraform.io/docs
- AWS: https://docs.aws.amazon.com
- Project README: `table-order-infrastructure/README.md`

### Troubleshooting
- Check CloudWatch Logs
- Review Terraform state: `terraform show`
- Enable debug logging: `export TF_LOG=DEBUG`

### Getting Help
- AWS Support: https://console.aws.amazon.com/support
- Terraform Community: https://discuss.hashicorp.com

---

## Checklist

### Pre-Deployment
- [ ] Terraform installed (>= 1.5.0)
- [ ] AWS CLI installed (>= 2.0)
- [ ] AWS credentials configured
- [ ] EC2 key pair created
- [ ] Public IP obtained
- [ ] terraform.tfvars configured

### Deployment
- [ ] terraform init successful
- [ ] terraform validate passed
- [ ] terraform plan reviewed
- [ ] terraform apply completed
- [ ] All outputs available

### Post-Deployment
- [ ] EC2 SSH access verified
- [ ] RDS connection tested
- [ ] Redis connection tested
- [ ] S3 bucket accessible
- [ ] CloudWatch logs streaming
- [ ] Nginx running

### Application Deployment
- [ ] Backend deployed
- [ ] Database migrated
- [ ] Frontend deployed
- [ ] End-to-end tested

### Production Ready
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Security hardened
- [ ] Documentation updated

