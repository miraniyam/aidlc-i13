# Production Environment - Root Module
# Integrates all modules to create complete infrastructure

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.tags
  }
}

# VPC Module
module "vpc" {
  source = "../../modules/vpc"

  project_name        = var.project_name
  vpc_cidr            = var.vpc_cidr
  public_subnet_cidr  = var.public_subnet_cidr
  private_subnet_cidr = var.private_subnet_cidr
  availability_zone   = var.availability_zone

  tags = var.tags
}

# Security Module
module "security" {
  source = "../../modules/security"

  project_name    = var.project_name
  vpc_id          = module.vpc.vpc_id
  ssh_allowed_ip  = var.ssh_allowed_ip
  s3_bucket_name  = "${var.project_name}-menu-images-${data.aws_caller_identity.current.account_id}"
  aws_region      = var.aws_region

  tags = var.tags
}

# Compute Module
module "compute" {
  source = "../../modules/compute"

  project_name         = var.project_name
  instance_type        = var.ec2_instance_type
  key_name             = var.ec2_key_name
  subnet_id            = module.vpc.public_subnet_id
  security_group_id    = module.security.ec2_security_group_id
  iam_instance_profile = module.security.ec2_instance_profile_name

  tags = var.tags

  depends_on = [module.vpc, module.security]
}

# Database Module
module "database" {
  source = "../../modules/database"

  project_name          = var.project_name
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  db_name               = var.db_name
  db_username           = var.db_username
  db_password           = var.db_password
  private_subnet_id     = module.vpc.private_subnet_id
  security_group_id     = module.security.rds_security_group_id
  multi_az              = var.db_multi_az
  backup_retention_period = var.db_backup_retention_period

  tags = var.tags

  depends_on = [module.vpc, module.security]
}

# Cache Module
module "cache" {
  source = "../../modules/cache"

  project_name      = var.project_name
  node_type         = var.redis_node_type
  private_subnet_id = module.vpc.private_subnet_id
  security_group_id = module.security.redis_security_group_id

  tags = var.tags

  depends_on = [module.vpc, module.security]
}

# Storage Module
module "storage" {
  source = "../../modules/storage"

  project_name      = var.project_name
  ec2_iam_role_arn  = module.security.ec2_iam_role_arn

  tags = var.tags

  depends_on = [module.security]
}

# Monitoring Module
module "monitoring" {
  source = "../../modules/monitoring"

  project_name       = var.project_name
  log_retention_days = var.log_retention_days

  tags = var.tags
}

# Data source for AWS account ID
data "aws_caller_identity" "current" {}
