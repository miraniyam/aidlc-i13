# Cache Module - ElastiCache Redis
# Creates ElastiCache Redis cluster in private subnet

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-redis-subnet-group"
  subnet_ids = [var.private_subnet_id]

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-redis-subnet-group"
    }
  )
}

# ElastiCache Redis Cluster
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${var.project_name}-redis"
  engine               = "redis"
  engine_version       = var.engine_version
  node_type            = var.node_type
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379

  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [var.security_group_id]

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-redis"
    }
  )
}
