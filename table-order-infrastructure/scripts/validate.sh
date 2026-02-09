#!/bin/bash
# Validation Script for Table Order Infrastructure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_DIR="$PROJECT_ROOT/environments/prod"

echo "=========================================="
echo "Table Order Infrastructure Validation"
echo "=========================================="
echo ""

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "Error: Terraform is not installed"
    exit 1
fi

# Change to environment directory
cd "$ENV_DIR"

# Initialize (if needed)
if [ ! -d ".terraform" ]; then
    echo "Initializing Terraform..."
    terraform init
    echo ""
fi

# Validate
echo "Validating Terraform configuration..."
terraform validate

if [ $? -eq 0 ]; then
    echo "✓ Validation successful"
else
    echo "✗ Validation failed"
    exit 1
fi

echo ""

# Format check
echo "Checking Terraform formatting..."
terraform fmt -check -recursive

if [ $? -eq 0 ]; then
    echo "✓ Formatting check passed"
else
    echo "✗ Formatting check failed"
    echo "Run 'terraform fmt -recursive' to fix formatting"
    exit 1
fi

echo ""
echo "=========================================="
echo "All checks passed!"
echo "=========================================="
echo ""
