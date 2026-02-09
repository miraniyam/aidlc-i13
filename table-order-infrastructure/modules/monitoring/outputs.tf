# Monitoring Module Outputs

output "fastapi_log_group_name" {
  description = "Name of the FastAPI CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.fastapi.name
}

output "fastapi_log_group_arn" {
  description = "ARN of the FastAPI CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.fastapi.arn
}

output "nginx_log_group_name" {
  description = "Name of the Nginx CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.nginx.name
}

output "nginx_log_group_arn" {
  description = "ARN of the Nginx CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.nginx.arn
}
