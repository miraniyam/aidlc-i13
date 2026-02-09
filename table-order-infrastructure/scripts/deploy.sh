#!/bin/bash
# Deployment Script for Table Order Infrastructure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_DIR="$PROJECT_ROOT/environments/prod"

echo "=========================================="
echo "Table Order Infrastructure Deployment"
echo "=========================================="
echo ""

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "Error: Terraform is not installed"
    echo "Please install Terraform: https://www.terraform.io/downloads"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS credentials not configured"
    echo "Please run: aws configure"
    exit 1
fi

echo "AWS credentials OK"
echo ""

# Check if terraform.tfvars exists
if [ ! -f "$ENV_DIR/terraform.tfvars" ]; then
    echo "Error: terraform.tfvars not found"
    echo "Please copy terraform.tfvars.example to terraform.tfvars and fill in your values"
    echo "  cp $ENV_DIR/terraform.tfvars.example $ENV_DIR/terraform.tfvars"
    exit 1
fi

# Change to environment directory
cd "$ENV_DIR"

# Initialize Terraform
echo "Initializing Terraform..."
terraform init
echo ""

# Validate configuration
echo "Validating Terraform configuration..."
terraform validate
echo ""

# Format check
echo "Checking Terraform formatting..."
terraform fmt -check -recursive || {
    echo "Warning: Some files need formatting. Run 'terraform fmt -recursive' to fix."
}
echo ""

# Plan
echo "Creating Terraform plan..."
terraform plan -out=tfplan
echo ""

# Ask for confirmation
read -p "Do you want to apply this plan? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled"
    rm -f tfplan
    exit 0
fi

# Apply
echo ""
echo "Applying Terraform plan..."
terraform apply tfplan
rm -f tfplan

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "To view outputs:"
echo "  terraform output"
echo ""
echo "To get EC2 public IP:"
echo "  terraform output ec2_public_ip"
echo ""
echo "To SSH to EC2:"
echo "  ssh -i your-key.pem ec2-user@\$(terraform output -raw ec2_public_ip)"
echo ""
