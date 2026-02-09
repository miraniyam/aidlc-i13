# Monitoring Module - CloudWatch Logs
# Creates CloudWatch Log Groups for application logs

# CloudWatch Log Group for FastAPI
resource "aws_cloudwatch_log_group" "fastapi" {
  name              = "/aws/ec2/${var.project_name}/fastapi"
  retention_in_days = var.log_retention_days

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-fastapi-logs"
    }
  )
}

# CloudWatch Log Group for Nginx
resource "aws_cloudwatch_log_group" "nginx" {
  name              = "/aws/ec2/${var.project_name}/nginx"
  retention_in_days = var.log_retention_days

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-nginx-logs"
    }
  )
}
