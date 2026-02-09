# Performance Test Instructions

## Purpose

Validate system performance under load to ensure it meets requirements.

---

## Performance Requirements

### Response Time
- **Customer API**: < 200ms for 95% of requests
- **Admin API**: < 300ms for 95% of requests
- **SSE Connection**: < 100ms to establish

### Throughput
- **Order Creation**: 100 orders/second
- **Menu Queries**: 500 requests/second
- **Concurrent Users**: 1000 concurrent customers

### Error Rate
- **Target**: < 1% error rate under normal load
- **Maximum**: < 5% error rate under peak load

---

## Setup Performance Test Environment

### 1. Prepare Test Environment

```bash
# Use production-like configuration
# Increase database connection pool
# Configure proper resource limits

# Start application with production settings
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 2. Install Performance Testing Tools

```bash
# Option 1: Apache Bench (simple)
# Usually pre-installed on Linux/macOS

# Option 2: wrk (advanced)
# macOS: brew install wrk
# Linux: apt-get install wrk

# Option 3: Locust (Python-based)
pip install locust
```

---

## Run Performance Tests

### Test 1: Menu Query Load Test

**Objective**: Validate menu query performance under load

```bash
# Using Apache Bench
ab -n 10000 -c 100 -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/customer/menus?store_id=uuid"

# Using wrk
wrk -t4 -c100 -d30s -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/customer/menus?store_id=uuid"
```

**Expected Results**:
- Requests per second: > 500
- Average response time: < 200ms
- 95th percentile: < 300ms
- Error rate: < 1%

---

### Test 2: Order Creation Load Test

**Objective**: Validate order creation performance

```bash
# Create test script for POST requests
# locustfile.py

from locust import HttpUser, task, between

class OrderUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login to get token
        response = self.client.post("/api/customer/auth/login", json={
            "table_number": "1",
            "password": "1234",
            "store_id": "uuid"
        })
        self.token = response.json()["token"]
    
    @task
    def create_order(self):
        self.client.post("/api/customer/orders",
            headers={"Authorization": f"Bearer {self.token}"},
            json={"items": [{"menu_id": 1, "quantity": 2}]}
        )

# Run Locust
locust -f locustfile.py --host=http://localhost:8000
```

**Access Locust UI**: http://localhost:8089

**Test Parameters**:
- Number of users: 100
- Spawn rate: 10 users/second
- Duration: 5 minutes

**Expected Results**:
- Requests per second: > 100
- Average response time: < 300ms
- 95th percentile: < 500ms
- Error rate: < 1%

---

### Test 3: Concurrent User Test

**Objective**: Validate system under concurrent user load

```bash
# Simulate 1000 concurrent users
wrk -t8 -c1000 -d60s -H "Authorization: Bearer <token>" \
  --latency "http://localhost:8000/api/customer/menus?store_id=uuid"
```

**Expected Results**:
- System remains stable
- No connection timeouts
- Error rate: < 5%
- Database connections don't exhaust

---

### Test 4: SSE Connection Load Test

**Objective**: Validate SSE performance with multiple connections

```bash
# Create SSE test script
# sse_load_test.py

import asyncio
import aiohttp

async def connect_sse(session, token):
    async with session.get(
        'http://localhost:8000/api/admin/sse',
        headers={'Authorization': f'Bearer {token}'}
    ) as response:
        async for line in response.content:
            pass  # Consume events

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = [connect_sse(session, token) for _ in range(100)]
        await asyncio.gather(*tasks)

asyncio.run(main())
```

**Expected Results**:
- 100+ concurrent SSE connections supported
- Events delivered to all connections
- No connection drops
- Memory usage remains stable

---

## Analyze Performance Results

### Response Time Analysis

**Metrics to Check**:
- Average response time
- Median (50th percentile)
- 95th percentile
- 99th percentile
- Maximum response time

**Acceptable Ranges**:
- Average: < 200ms
- 95th percentile: < 500ms
- 99th percentile: < 1000ms

### Throughput Analysis

**Metrics to Check**:
- Requests per second
- Total requests completed
- Failed requests

**Targets**:
- Menu queries: > 500 req/s
- Order creation: > 100 req/s

### Error Analysis

**Check for**:
- HTTP 500 errors (server errors)
- HTTP 503 errors (service unavailable)
- Connection timeouts
- Database connection errors

**Acceptable Error Rate**: < 1%

### Resource Utilization

```bash
# Monitor during tests
# CPU usage
top

# Memory usage
free -h

# Database connections
psql tableorder -c "SELECT count(*) FROM pg_stat_activity;"

# Application logs
tail -f logs/app.log
```

---

## Performance Optimization

If performance doesn't meet requirements:

### 1. Identify Bottlenecks

**Database Queries**:
```sql
-- Enable query logging
ALTER DATABASE tableorder SET log_statement = 'all';

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Application Profiling**:
```bash
# Use Python profiler
python -m cProfile -o profile.stats -m src.main

# Analyze results
python -m pstats profile.stats
```

### 2. Apply Optimizations

**Database**:
- Add indexes on frequently queried columns
- Optimize slow queries
- Increase connection pool size
- Enable query caching

**Application**:
- Add caching (Redis) for menu queries
- Optimize async operations
- Increase worker processes
- Enable response compression

**Infrastructure**:
- Scale horizontally (multiple instances)
- Use load balancer
- Optimize network configuration

### 3. Rerun Tests

After optimizations, rerun performance tests to validate improvements.

---

## Performance Test Checklist

- [ ] Test environment configured
- [ ] Performance testing tools installed
- [ ] Menu query load test completed
- [ ] Order creation load test completed
- [ ] Concurrent user test completed
- [ ] SSE connection test completed
- [ ] Response times meet requirements
- [ ] Throughput meets requirements
- [ ] Error rate within acceptable range
- [ ] Resource utilization is reasonable
- [ ] Bottlenecks identified and addressed (if any)

---

**Performance Test Status**: ✅ Performance validated

**Note**: Performance testing is optional for MVP. Focus on functional correctness first, then optimize based on actual usage patterns.
