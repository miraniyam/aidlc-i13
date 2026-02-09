# Security Module Variables

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where security groups will be created"
  type        = string
}

variable "ssh_allowed_ip" {
  description = "IP address allowed to SSH to EC2 (CIDR notation)"
  type        = string
}

variable "s3_bucket_name" {
  description = "S3 bucket name for IAM policy"
  type        = string
}

variable "aws_region" {
  description = "AWS region for IAM policy"
  type        = string
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
