# Cache Module Outputs

output "redis_cluster_id" {
  description = "ID of the Redis cluster"
  value       = aws_elasticache_cluster.redis.id
}

output "redis_endpoint" {
  description = "Connection endpoint for Redis"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "redis_port" {
  description = "Port of the Redis cluster"
  value       = aws_elasticache_cluster.redis.port
}

output "redis_configuration_endpoint" {
  description = "Configuration endpoint for Redis"
  value       = "${aws_elasticache_cluster.redis.cache_nodes[0].address}:${aws_elasticache_cluster.redis.port}"
}
