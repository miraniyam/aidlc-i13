# Storage Module Variables

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "ec2_iam_role_arn" {
  description = "ARN of EC2 IAM role for bucket policy"
  type        = string
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
