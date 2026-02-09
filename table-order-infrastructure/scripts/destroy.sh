#!/bin/bash
# Cleanup Script for Table Order Infrastructure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_DIR="$PROJECT_ROOT/environments/prod"

echo "=========================================="
echo "Table Order Infrastructure Cleanup"
echo "=========================================="
echo ""

# Warning
echo "WARNING: This will destroy ALL infrastructure resources!"
echo "This includes:"
echo "  - EC2 instance"
echo "  - RDS database (all data will be lost)"
echo "  - ElastiCache Redis"
echo "  - S3 bucket (all images will be deleted)"
echo "  - VPC and networking"
echo ""

read -p "Are you sure you want to destroy all resources? (type 'yes' to confirm): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Cleanup cancelled"
    exit 0
fi

echo ""
read -p "Last chance! Type 'destroy' to proceed: " final_confirm
if [ "$final_confirm" != "destroy" ]; then
    echo "Cleanup cancelled"
    exit 0
fi

# Change to environment directory
cd "$ENV_DIR"

# Destroy
echo ""
echo "Destroying infrastructure..."
terraform destroy

echo ""
echo "=========================================="
echo "Cleanup Complete!"
echo "=========================================="
echo ""
