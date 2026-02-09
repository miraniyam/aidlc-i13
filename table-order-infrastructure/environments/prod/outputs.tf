# Production Environment Outputs

# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = module.vpc.public_subnet_id
}

output "private_subnet_id" {
  description = "ID of the private subnet"
  value       = module.vpc.private_subnet_id
}

# EC2 Outputs
output "ec2_instance_id" {
  description = "ID of the EC2 instance"
  value       = module.compute.instance_id
}

output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = module.compute.instance_public_ip
}

output "ec2_private_ip" {
  description = "Private IP address of the EC2 instance"
  value       = module.compute.instance_private_ip
}

# RDS Outputs
output "rds_endpoint" {
  description = "Connection endpoint for RDS PostgreSQL"
  value       = module.database.db_endpoint
}

output "rds_address" {
  description = "Hostname of the RDS instance"
  value       = module.database.db_address
}

output "rds_port" {
  description = "Port of the RDS instance"
  value       = module.database.db_port
}

output "rds_database_name" {
  description = "Name of the database"
  value       = module.database.db_name
}

# Redis Outputs
output "redis_endpoint" {
  description = "Connection endpoint for Redis"
  value       = module.cache.redis_configuration_endpoint
}

output "redis_address" {
  description = "Hostname of the Redis cluster"
  value       = module.cache.redis_endpoint
}

output "redis_port" {
  description = "Port of the Redis cluster"
  value       = module.cache.redis_port
}

# S3 Outputs
output "s3_bucket_name" {
  description = "Name of the S3 bucket for menu images"
  value       = module.storage.bucket_name
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = module.storage.bucket_arn
}

# CloudWatch Outputs
output "fastapi_log_group" {
  description = "CloudWatch Log Group for FastAPI"
  value       = module.monitoring.fastapi_log_group_name
}

output "nginx_log_group" {
  description = "CloudWatch Log Group for Nginx"
  value       = module.monitoring.nginx_log_group_name
}

# Connection Strings (for convenience)
output "database_connection_string" {
  description = "PostgreSQL connection string (without password)"
  value       = "postgresql://${var.db_username}:PASSWORD@${module.database.db_address}:${module.database.db_port}/${module.database.db_name}"
  sensitive   = true
}

output "redis_connection_string" {
  description = "Redis connection string"
  value       = "redis://${module.cache.redis_endpoint}:${module.cache.redis_port}/0"
}

# Deployment Information
output "deployment_info" {
  description = "Deployment information summary"
  value = {
    ec2_ssh_command = "ssh -i your-key.pem ec2-user@${module.compute.instance_public_ip}"
    backend_url     = "http://${module.compute.instance_public_ip}:8000"
    frontend_url    = "http://${module.compute.instance_public_ip}"
    admin_url       = "http://${module.compute.instance_public_ip}/admin"
    superadmin_url  = "http://${module.compute.instance_public_ip}/superadmin"
  }
}
