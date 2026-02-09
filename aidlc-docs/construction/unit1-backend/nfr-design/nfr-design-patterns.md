# NFR Design Patterns - Unit 1: Backend API & Database

## Overview

테이블오더 서비스 백엔드의 NFR 요구사항을 충족하기 위한 설계 패턴을 정의합니다. 성능, 확장성, 가용성, 보안을 위한 구체적인 구현 패턴을 제시합니다.

---

## 1. Performance Patterns (성능 패턴)

### 1.1 캐싱 전략 (Cache-Aside Pattern)

**목적**: 데이터베이스 부하 감소, 응답 시간 단축

**적용 대상**:
- OrderHistory 조회 (자주 조회되는 과거 주문)
- Menu 조회 (메뉴 목록)
- MenuCategory 조회 (카테고리 목록)

**캐시 키 네이밍**:
```
{store_id}:{entity}:{id}
예: uuid-1234:order_history:123
예: uuid-1234:menu:45
예: uuid-1234:menu_category:all
```

**캐시 무효화 전략**: TTL + 명시적 삭제 (하이브리드)
- TTL: 5분 (기본)
- 명시적 삭제: 데이터 변경 시 (메뉴 수정, 삭제)

**구현 예시**:
```python
class CacheManager:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.default_ttl = 300  # 5분
    
    async def get(self, key: str):
        value = await self.redis.get(key)
        if value:
            return json.loads(value)
        return None
    
    async def set(self, key: str, value: dict, ttl: int = None):
        ttl = ttl or self.default_ttl
        await self.redis.setex(key, ttl, json.dumps(value))
    
    async def delete(self, key: str):
        await self.redis.delete(key)
    
    async def delete_pattern(self, pattern: str):
        keys = await self.redis.keys(pattern)
        if keys:
            await self.redis.delete(*keys)

# 사용 예시
async def get_menu(menu_id: int, store_id: str):
    cache_key = f"{store_id}:menu:{menu_id}"
    
    # 캐시 확인
    cached = await cache_manager.get(cache_key)
    if cached:
        return cached
    
    # DB 조회
    menu = await db.query(Menu).filter(Menu.id == menu_id).first()
    
    # 캐시 저장
    await cache_manager.set(cache_key, menu.dict())
    return menu

async def update_menu(menu_id: int, store_id: str, data: dict):
    # DB 업데이트
    menu = await db.query(Menu).filter(Menu.id == menu_id).first()
    menu.update(data)
    await db.commit()
    
    # 캐시 무효화
    cache_key = f"{store_id}:menu:{menu_id}"
    await cache_manager.delete(cache_key)
    await cache_manager.delete_pattern(f"{store_id}:menu_category:*")
```

---

### 1.2 데이터베이스 쿼리 최적화

**느린 쿼리 감지**:
- 임계값: **2초**
- 조치: 로그 기록 + 모니터링 알림

**쿼리 최적화 기법**:

**1) N+1 문제 해결 (Eager Loading)**:
```python
# Bad: N+1 쿼리
orders = await db.query(Order).all()
for order in orders:
    items = await db.query(OrderItem).filter(OrderItem.order_id == order.id).all()

# Good: Eager Loading
from sqlalchemy.orm import selectinload

orders = await db.query(Order).options(
    selectinload(Order.order_items)
).all()
```

**2) 인덱스 활용**:
```python
# 복합 인덱스 사용
Index('idx_order_session_status', Order.table_session_id, Order.status)

# 쿼리
orders = await db.query(Order).filter(
    Order.table_session_id == session_id,
    Order.status == 'pending'
).all()
```

**3) 페이지네이션**:
```python
async def get_order_history(table_id: int, page: int = 1, page_size: int = 50):
    offset = (page - 1) * page_size
    
    query = db.query(OrderHistory).filter(
        OrderHistory.table_session_id.in_(
            db.query(TableSession.id).filter(TableSession.table_id == table_id)
        )
    ).order_by(OrderHistory.archived_at.desc())
    
    total = await query.count()
    items = await query.offset(offset).limit(page_size).all()
    
    return {
        "items": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_count": total,
            "total_pages": (total + page_size - 1) // page_size
        }
    }
```

**4) 쿼리 모니터링**:
```python
import time
from functools import wraps

def monitor_query(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.time()
        result = await func(*args, **kwargs)
        duration = time.time() - start
        
        if duration > 2.0:  # 2초 초과
            logger.warning(f"Slow query detected: {func.__name__} took {duration:.2f}s")
            # Prometheus 메트릭 기록
            slow_query_counter.inc()
        
        return result
    return wrapper
```

---

### 1.3 연결 풀 관리

**SQLAlchemy Connection Pool 설정**:
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    DATABASE_URL,
    pool_size=50,           # 기본 연결 수
    max_overflow=10,        # 추가 연결 수 (최대 60개)
    pool_timeout=60,        # 연결 대기 타임아웃 (초)
    pool_recycle=3600,      # 연결 재사용 시간 (1시간)
    pool_pre_ping=True,     # 연결 유효성 사전 확인
    echo=False              # SQL 로그 비활성화 (프로덕션)
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)
```

**연결 실패 재시도 패턴**:
```python
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10)
)
async def get_db_session():
    try:
        async with AsyncSessionLocal() as session:
            yield session
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise
```

---

### 1.4 이미지 처리 최적화

**비동기 이미지 처리**:
```python
from PIL import Image
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

async def process_image(image_path: str, thumbnail_path: str):
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(executor, _process_image_sync, image_path, thumbnail_path)

def _process_image_sync(image_path: str, thumbnail_path: str):
    img = Image.open(image_path)
    img.thumbnail((300, 300))
    img.save(thumbnail_path, "JPEG", quality=80, optimize=True)
```

**이미지 업로드 스트리밍**:
```python
from fastapi import UploadFile
import aiofiles

async def save_image(file: UploadFile, save_path: str):
    async with aiofiles.open(save_path, 'wb') as f:
        while chunk := await file.read(8192):  # 8KB 청크
            await f.write(chunk)
```

---

## 2. Scalability Patterns (확장성 패턴)

### 2.1 수평 확장 아키텍처

**Stateless 서비스 설계**:
- 세션 상태: Redis + PostgreSQL (하이브리드)
- JWT 토큰: Stateless (서버에 저장 안 함)
- 파일 업로드: 로컬 파일 시스템 (향후 S3로 마이그레이션)

**세션 상태 관리**:
```python
class SessionManager:
    def __init__(self, redis_client, db_session):
        self.redis = redis_client
        self.db = db_session
    
    async def get_session(self, session_id: int):
        # 1. Redis 캐시 확인
        cache_key = f"session:{session_id}"
        cached = await self.redis.get(cache_key)
        if cached:
            return json.loads(cached)
        
        # 2. DB 조회
        session = await self.db.query(TableSession).filter(
            TableSession.id == session_id,
            TableSession.is_active == True
        ).first()
        
        if session:
            # 3. Redis 캐싱 (TTL 1시간)
            await self.redis.setex(cache_key, 3600, json.dumps(session.dict()))
        
        return session
    
    async def invalidate_session(self, session_id: int):
        cache_key = f"session:{session_id}"
        await self.redis.delete(cache_key)
```

**JWT 토큰 검증 (Stateless)**:
```python
from jose import jwt, JWTError

async def verify_token(token: str):
    try:
        # JWT 페이로드만 검증 (DB 조회 없음)
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"])
        return payload
    except JWTError:
        raise UnauthorizedError("Invalid token")
```

---

### 2.2 이벤트 기반 아키텍처 (RabbitMQ)

**RabbitMQ 토폴로지**:
- **Exchange 타입**: Topic (패턴 매칭)
- **Exchange 이름**: `table-order-events`
- **Queue 구조**: 이벤트 타입별 Queue

**토폴로지 설정**:
```
Exchange: table-order-events (Topic)
  |
  ├─ Routing Key: order.created → Queue: order-created-queue
  ├─ Routing Key: order.status_changed → Queue: order-status-changed-queue
  └─ Routing Key: order.* → Queue: all-order-events-queue (모니터링용)
```

**RabbitMQ 설정 코드**:
```python
import aio_pika

async def setup_rabbitmq():
    connection = await aio_pika.connect_robust(RABBITMQ_URL)
    channel = await connection.channel()
    
    # Exchange 생성
    exchange = await channel.declare_exchange(
        "table-order-events",
        aio_pika.ExchangeType.TOPIC,
        durable=True
    )
    
    # Queue 생성
    order_created_queue = await channel.declare_queue(
        "order-created-queue",
        durable=True
    )
    order_status_queue = await channel.declare_queue(
        "order-status-changed-queue",
        durable=True
    )
    
    # Binding
    await order_created_queue.bind(exchange, routing_key="order.created")
    await order_status_queue.bind(exchange, routing_key="order.status_changed")
    
    return channel, exchange
```

---

### 2.3 로드 밸런싱 전략

**Application Load Balancer (ALB)**:
- 알고리즘: Round Robin
- 헬스 체크: GET /health (30초 간격)
- Sticky Session: 불필요 (Stateless)

**ALB 설정 (Terraform)**:
```hcl
resource "aws_lb" "api" {
  name               = "table-order-api-lb"
  internal           = false
  load_balancer_type = "application"
  subnets            = var.public_subnet_ids
}

resource "aws_lb_target_group" "api" {
  name     = "table-order-api-tg"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  
  health_check {
    path                = "/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}
```

---

## 3. Availability Patterns (가용성 패턴)

### 3.1 헬스 체크

**헬스 체크 범위**: API + DB + Redis + RabbitMQ (모든 의존성)

**헬스 체크 엔드포인트**:
```python
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/health")
async def health_check():
    health_status = {
        "status": "ok",
        "checks": {}
    }
    
    # 1. Database 확인
    try:
        await db.execute("SELECT 1")
        health_status["checks"]["database"] = "ok"
    except Exception as e:
        health_status["checks"]["database"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    # 2. Redis 확인
    try:
        await redis.ping()
        health_status["checks"]["redis"] = "ok"
    except Exception as e:
        health_status["checks"]["redis"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    # 3. RabbitMQ 확인
    try:
        # RabbitMQ 연결 확인
        health_status["checks"]["rabbitmq"] = "ok"
    except Exception as e:
        health_status["checks"]["rabbitmq"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    # 4. 응답
    if health_status["status"] == "degraded":
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=health_status
        )
    
    return health_status
```

---

### 3.2 Graceful Shutdown

**목적**: 진행 중인 요청 완료 후 종료

**구현**:
```python
import signal
import asyncio

class GracefulShutdown:
    def __init__(self):
        self.is_shutting_down = False
        self.active_requests = 0
    
    async def shutdown(self):
        self.is_shutting_down = True
        logger.info("Graceful shutdown initiated...")
        
        # 진행 중인 요청 대기 (최대 30초)
        for _ in range(30):
            if self.active_requests == 0:
                break
            await asyncio.sleep(1)
        
        logger.info(f"Shutdown complete. {self.active_requests} requests were interrupted.")

shutdown_handler = GracefulShutdown()

@app.middleware("http")
async def track_requests(request, call_next):
    if shutdown_handler.is_shutting_down:
        return JSONResponse(
            status_code=503,
            content={"error": "Server is shutting down"}
        )
    
    shutdown_handler.active_requests += 1
    try:
        response = await call_next(request)
        return response
    finally:
        shutdown_handler.active_requests -= 1

def signal_handler(signum, frame):
    asyncio.create_task(shutdown_handler.shutdown())

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)
```

---

### 3.3 Circuit Breaker

**적용 여부**: 불필요 (내부 시스템만 사용)

**이유**:
- 외부 API 호출 없음
- 데이터베이스는 Multi-AZ RDS (자동 Failover)
- 향후 외부 API 통합 시 적용 고려

---

## 4. Security Patterns (보안 패턴)

### 4.1 JWT 인증 미들웨어

**JWT 검증 실패 응답**: 401 + 상세 에러 코드

**구현**:
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from jose import jwt, JWTError

security = HTTPBearer()

async def verify_jwt(credentials: HTTPAuthCredentials = Depends(security)):
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "TOKEN_EXPIRED",
                    "message": "JWT 토큰이 만료되었습니다. 다시 로그인해주세요."
                }
            }
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "INVALID_TOKEN",
                    "message": "유효하지 않은 JWT 토큰입니다."
                }
            }
        )

# 역할 기반 인증
def require_role(required_role: str):
    async def role_checker(payload: dict = Depends(verify_jwt)):
        if payload.get("role") != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": {
                        "code": "INSUFFICIENT_PERMISSIONS",
                        "message": "권한이 없습니다."
                    }
                }
            )
        return payload
    return role_checker

# 사용 예시
@router.get("/api/admin/orders")
async def get_orders(payload: dict = Depends(require_role("store_admin"))):
    store_id = payload["store_id"]
    # ...
```

**JWT 갱신 메커니즘**: 없음 (만료 시 재로그인)

---

### 4.2 Rate Limiting

**알고리즘**: Sliding Window (슬라이딩 시간 창)

**Rate Limit 초과 응답**: 429 + Retry-After 헤더

**구현**:
```python
from fastapi import Request, HTTPException
import time

class RateLimiter:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.limit = 100  # 분당 100회
        self.window = 60  # 60초
    
    async def check_rate_limit(self, user_id: str):
        key = f"rate_limit:{user_id}"
        now = time.time()
        
        # Sliding Window 구현
        # 1. 오래된 요청 제거 (60초 이전)
        await self.redis.zremrangebyscore(key, 0, now - self.window)
        
        # 2. 현재 요청 수 확인
        count = await self.redis.zcard(key)
        
        if count >= self.limit:
            # Rate Limit 초과
            ttl = await self.redis.ttl(key)
            raise HTTPException(
                status_code=429,
                detail={
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
                    }
                },
                headers={"Retry-After": str(ttl)}
            )
        
        # 3. 현재 요청 기록
        await self.redis.zadd(key, {str(now): now})
        await self.redis.expire(key, self.window)

rate_limiter = RateLimiter(redis_client)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # JWT에서 user_id 추출
    auth_header = request.headers.get("Authorization")
    if auth_header:
        token = auth_header.replace("Bearer ", "")
        try:
            payload = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"])
            user_id = payload.get("user_id")
            await rate_limiter.check_rate_limit(user_id)
        except:
            pass  # 인증 실패는 다른 미들웨어에서 처리
    
    response = await call_next(request)
    return response
```

---

### 4.3 CORS 설정

**CORS 정책**: 특정 도메인만 허용

**구현**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://customer.example.com",
        "https://admin.example.com",
        "https://superadmin.example.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=3600  # Preflight 캐시 (1시간)
)
```

---

### 4.4 입력 검증 및 Sanitization

**Pydantic 스키마 검증**:
```python
from pydantic import BaseModel, Field, validator

class CreateOrderRequest(BaseModel):
    items: list[OrderItemRequest] = Field(..., min_items=1)
    
    @validator('items')
    def validate_items(cls, items):
        if not items:
            raise ValueError("주문 항목이 비어있습니다.")
        return items

class OrderItemRequest(BaseModel):
    menu_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0, le=100)
    
    @validator('quantity')
    def validate_quantity(cls, quantity):
        if quantity <= 0:
            raise ValueError("수량은 1 이상이어야 합니다.")
        if quantity > 100:
            raise ValueError("수량은 100 이하여야 합니다.")
        return quantity
```

---

## 5. Monitoring Patterns (모니터링 패턴)

### 5.1 Prometheus 메트릭 수집

**메트릭 타입**:
- Counter: 요청 수, 에러 수
- Histogram: 응답 시간, 쿼리 시간
- Gauge: 활성 연결 수, 메모리 사용량

**구현**:
```python
from prometheus_client import Counter, Histogram, Gauge
from prometheus_fastapi_instrumentator import Instrumentator

# 메트릭 정의
request_count = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
request_duration = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])
active_connections = Gauge('active_connections', 'Active database connections')
slow_query_count = Counter('slow_queries_total', 'Total slow queries', ['query_name'])

# FastAPI 계측
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# 커스텀 메트릭
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    
    request_count.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    request_duration.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    return response
```

---

### 5.2 구조화된 로깅

**JSON 로그 포맷**:
```python
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

# 로거 설정
handler = logging.FileHandler('/var/log/table-order/app.log')
handler.setFormatter(JSONFormatter())
logger = logging.getLogger('table-order')
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

---

## Summary

### 설계 패턴 요약

| 카테고리 | 패턴 | 구현 방법 |
|---------|------|----------|
| **Performance** | Cache-Aside | Redis, TTL + 명시적 삭제 |
| **Performance** | Query Optimization | Eager Loading, 인덱스, 페이지네이션 |
| **Performance** | Connection Pool | SQLAlchemy, 50개 연결, 재시도 |
| **Scalability** | Stateless Service | Redis + DB 하이브리드, JWT |
| **Scalability** | Event-Driven | RabbitMQ Topic Exchange |
| **Scalability** | Load Balancing | ALB Round Robin |
| **Availability** | Health Check | API + DB + Redis + RabbitMQ |
| **Availability** | Graceful Shutdown | 진행 중 요청 완료 후 종료 |
| **Security** | JWT Auth | RS256, 401 + 상세 에러 코드 |
| **Security** | Rate Limiting | Sliding Window, 429 + Retry-After |
| **Security** | CORS | 특정 도메인만 허용 |
| **Monitoring** | Metrics | Prometheus Counter/Histogram/Gauge |
| **Monitoring** | Logging | JSON 구조화 로그 |

### 주요 결정사항

1. **캐싱**: Redis Cache-Aside, TTL + 명시적 삭제
2. **세션 관리**: Redis 캐시 + DB 영속화 (하이브리드)
3. **RabbitMQ**: Topic Exchange, 이벤트 타입별 Queue
4. **헬스 체크**: 모든 의존성 확인, 503 응답
5. **JWT**: Stateless, Refresh 없음, 상세 에러 코드
6. **Rate Limiting**: Sliding Window, Retry-After 헤더
7. **Circuit Breaker**: 불필요 (내부 시스템만)

---

**End of NFR Design Patterns Document**
