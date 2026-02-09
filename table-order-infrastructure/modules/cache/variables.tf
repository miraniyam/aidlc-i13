# Cache Module Variables

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.0"
}

variable "node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "private_subnet_id" {
  description = "Private subnet ID for Redis"
  type        = string
}

variable "security_group_id" {
  description = "Security group ID for Redis"
  type        = string
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
