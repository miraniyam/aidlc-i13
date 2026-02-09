# Logical Components - Unit 1: Backend API & Database

## Overview

테이블오더 서비스 백엔드의 논리적 컴포넌트를 정의합니다. 인프라 컴포넌트(EventBus, SSEPublisher, CacheManager, RateLimiter)의 인터페이스와 구현을 명시합니다.

---

## 1. EventBus Component

### 1.1 인터페이스 설계

**추상 인터페이스 + 구현체 주입 (Dependency Injection)**

```python
from abc import ABC, abstractmethod
from typing import Callable, Dict, List

class EventBus(ABC):
    @abstractmethod
    async def publish(self, event_type: str, payload: dict):
        """이벤트 발행"""
        pass
    
    @abstractmethod
    async def subscribe(self, event_type: str, callback: Callable):
        """이벤트 구독"""
        pass
    
    @abstractmethod
    async def unsubscribe(self, event_type: str, callback: Callable):
        """구독 해제"""
        pass
```

---

### 1.2 In-Memory 구현 (Development)

```python
import asyncio
from collections import defaultdict

class InMemoryEventBus(EventBus):
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = defaultdict(list)
        self.queue = asyncio.Queue()
    
    async def publish(self, event_type: str, payload: dict):
        event = {"type": event_type, "payload": payload}
        await self.queue.put(event)
        
        # 구독자에게 즉시 전달
        for callback in self.subscribers.get(event_type, []):
            asyncio.create_task(callback(payload))
    
    async def subscribe(self, event_type: str, callback: Callable):
        self.subscribers[event_type].append(callback)
    
    async def unsubscribe(self, event_type: str, callback: Callable):
        if callback in self.subscribers[event_type]:
            self.subscribers[event_type].remove(callback)
```

---

### 1.3 RabbitMQ 구현 (Production)

```python
import aio_pika
import json
from tenacity import retry, stop_after_attempt, wait_exponential

class RabbitMQEventBus(EventBus):
    def __init__(self, rabbitmq_url: str):
        self.url = rabbitmq_url
        self.connection = None
        self.channel = None
        self.exchange = None
    
    async def connect(self):
        self.connection = await aio_pika.connect_robust(self.url)
        self.channel = await self.connection.channel()
        self.exchange = await self.channel.declare_exchange(
            "table-order-events",
            aio_pika.ExchangeType.TOPIC,
            durable=True
        )
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
    async def publish(self, event_type: str, payload: dict):
        if not self.exchange:
            await self.connect()
        
        routing_key = event_type.replace("_", ".")  # order_created → order.created
        message = aio_pika.Message(
            body=json.dumps(payload).encode(),
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT
        )
        
        await self.exchange.publish(message, routing_key=routing_key)
    
    async def subscribe(self, event_type: str, callback: Callable):
        if not self.channel:
            await self.connect()
        
        routing_key = event_type.replace("_", ".")
        queue_name = f"{event_type}-queue"
        
        queue = await self.channel.declare_queue(queue_name, durable=True)
        await queue.bind(self.exchange, routing_key=routing_key)
        
        async def on_message(message: aio_pika.IncomingMessage):
            async with message.process():
                payload = json.loads(message.body.decode())
                await callback(payload)
        
        await queue.consume(on_message)
    
    async def unsubscribe(self, event_type: str, callback: Callable):
        # RabbitMQ는 Queue 삭제로 구독 해제
        pass
```

---

### 1.4 Factory Pattern

```python
def create_event_bus(env: str = "development") -> EventBus:
    if env == "production":
        return RabbitMQEventBus(RABBITMQ_URL)
    else:
        return InMemoryEventBus()

# 사용
event_bus = create_event_bus(os.getenv("ENV", "development"))
```

---

## 2. SSEPublisher Component

### 2.1 인터페이스

```python
class SSEPublisher:
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.connections: Dict[str, List[asyncio.Queue]] = defaultdict(list)
    
    async def subscribe(self, store_id: str) -> asyncio.Queue:
        """SSE 연결 생성"""
        queue = asyncio.Queue()
        self.connections[store_id].append(queue)
        return queue
    
    async def unsubscribe(self, store_id: str, queue: asyncio.Queue):
        """SSE 연결 해제"""
        if queue in self.connections[store_id]:
            self.connections[store_id].remove(queue)
    
    async def start(self):
        """EventBus 구독 시작"""
        await self.event_bus.subscribe("order_created", self._on_order_event)
        await self.event_bus.subscribe("order_status_changed", self._on_order_event)
    
    async def _on_order_event(self, payload: dict):
        """이벤트 수신 → SSE 클라이언트에 전송"""
        store_id = payload.get("store_id")
        if store_id:
            for queue in self.connections.get(store_id, []):
                await queue.put(payload)
```

---

### 2.2 SSE 스트림 엔드포인트

```python
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio

router = APIRouter()

@router.get("/api/admin/orders/stream")
async def stream_orders(store_id: str = Depends(get_store_id_from_jwt)):
    queue = await sse_publisher.subscribe(store_id)
    
    async def event_generator():
        try:
            while True:
                # Heartbeat (30초마다)
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    yield f": heartbeat\n\n"  # 주석 형태의 heartbeat
        except asyncio.CancelledError:
            await sse_publisher.unsubscribe(store_id, queue)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Nginx 버퍼링 비활성화
        }
    )
```

---

## 3. CacheManager Component

### 3.1 인터페이스

```python
import redis.asyncio as aioredis
import json
from typing import Optional

class CacheManager:
    def __init__(self, redis_url: str):
        self.redis = aioredis.from_url(redis_url, decode_responses=True)
        self.default_ttl = 300  # 5분
    
    async def get(self, key: str) -> Optional[dict]:
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
        keys = []
        async for key in self.redis.scan_iter(match=pattern):
            keys.append(key)
        if keys:
            await self.redis.delete(*keys)
    
    async def exists(self, key: str) -> bool:
        return await self.redis.exists(key) > 0
```

---

### 3.2 캐싱 데코레이터

```python
from functools import wraps

def cached(key_prefix: str, ttl: int = 300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 캐시 키 생성
            cache_key = f"{key_prefix}:{':'.join(map(str, args))}"
            
            # 캐시 확인
            cached_value = await cache_manager.get(cache_key)
            if cached_value:
                return cached_value
            
            # 함수 실행
            result = await func(*args, **kwargs)
            
            # 캐시 저장
            await cache_manager.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator

# 사용 예시
@cached(key_prefix="menu", ttl=600)
async def get_menu(menu_id: int, store_id: str):
    return await db.query(Menu).filter(Menu.id == menu_id).first()
```

---

## 4. RateLimiter Component

### 4.1 Sliding Window 구현

```python
import time
from fastapi import HTTPException, status

class RateLimiter:
    def __init__(self, redis_client, limit: int = 100, window: int = 60):
        self.redis = redis_client
        self.limit = limit
        self.window = window
    
    async def check_rate_limit(self, user_id: str):
        key = f"rate_limit:{user_id}"
        now = time.time()
        
        # Sliding Window
        pipe = self.redis.pipeline()
        pipe.zremrangebyscore(key, 0, now - self.window)
        pipe.zcard(key)
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, self.window)
        
        results = await pipe.execute()
        count = results[1]
        
        if count >= self.limit:
            ttl = await self.redis.ttl(key)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": "요청 한도를 초과했습니다."
                    }
                },
                headers={"Retry-After": str(ttl)}
            )
    
    async def get_remaining(self, user_id: str) -> int:
        key = f"rate_limit:{user_id}"
        now = time.time()
        
        await self.redis.zremrangebyscore(key, 0, now - self.window)
        count = await self.redis.zcard(key)
        return max(0, self.limit - count)
```

---

### 4.2 미들웨어 통합

```python
from fastapi import Request
from jose import jwt

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # JWT에서 user_id 추출
    auth_header = request.headers.get("Authorization")
    if auth_header:
        try:
            token = auth_header.replace("Bearer ", "")
            payload = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"])
            user_id = str(payload.get("user_id"))
            
            # Rate Limit 확인
            await rate_limiter.check_rate_limit(user_id)
            
            # 남은 요청 수 헤더 추가
            remaining = await rate_limiter.get_remaining(user_id)
            response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(rate_limiter.limit)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            return response
        except:
            pass
    
    return await call_next(request)
```

---

## 5. Component Initialization

### 5.1 Dependency Injection

```python
from fastapi import FastAPI

# 전역 컴포넌트
event_bus: EventBus = None
sse_publisher: SSEPublisher = None
cache_manager: CacheManager = None
rate_limiter: RateLimiter = None

@app.on_event("startup")
async def startup_event():
    global event_bus, sse_publisher, cache_manager, rate_limiter
    
    # EventBus 초기화
    env = os.getenv("ENV", "development")
    event_bus = create_event_bus(env)
    
    # SSEPublisher 초기화
    sse_publisher = SSEPublisher(event_bus)
    await sse_publisher.start()
    
    # CacheManager 초기화
    cache_manager = CacheManager(REDIS_URL)
    
    # RateLimiter 초기화
    redis_client = aioredis.from_url(REDIS_URL)
    rate_limiter = RateLimiter(redis_client, limit=100, window=60)
    
    logger.info("All components initialized successfully")

@app.on_event("shutdown")
async def shutdown_event():
    # 연결 정리
    if hasattr(event_bus, 'connection'):
        await event_bus.connection.close()
    
    await cache_manager.redis.close()
    await rate_limiter.redis.close()
    
    logger.info("All components shut down successfully")
```

---

## 6. Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Application                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Controllers  │  │ Middlewares  │  │   Services   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
├────────────────────────────┼─────────────────────────────┤
│        Infrastructure Components                         │
├────────────────────────────┼─────────────────────────────┤
│                            │                             │
│  ┌──────────────┐  ┌──────▼───────┐  ┌──────────────┐  │
│  │  EventBus    │  │ CacheManager │  │ RateLimiter  │  │
│  │ (Abstract)   │  │              │  │              │  │
│  └──────┬───────┘  └──────────────┘  └──────────────┘  │
│         │                                                │
│    ┌────┴────┐                                          │
│    │         │                                          │
│ ┌──▼──┐  ┌──▼──────┐         ┌──────────────┐         │
│ │InMem│  │RabbitMQ │         │SSEPublisher  │         │
│ │ory  │  │EventBus │         │              │         │
│ └─────┘  └─────────┘         └──────────────┘         │
│                                                          │
└──────────────────────────────────────────────────────────┘
           │              │              │
           ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │PostgreSQL│   │  Redis   │   │RabbitMQ  │
    └──────────┘   └──────────┘   └──────────┘
```

---

## Summary

### 컴포넌트 요약

| 컴포넌트 | 역할 | 구현 방식 |
|---------|------|----------|
| **EventBus** | 이벤트 발행/구독 | 추상 인터페이스 + DI (InMemory/RabbitMQ) |
| **SSEPublisher** | SSE 스트림 관리 | EventBus 구독 + asyncio.Queue |
| **CacheManager** | Redis 캐싱 | Cache-Aside 패턴, TTL + 명시적 삭제 |
| **RateLimiter** | 요청 제한 | Sliding Window, Redis Sorted Set |

### 주요 설계 결정

1. **EventBus**: 추상 인터페이스 + 구현체 주입 (환경별 전환 용이)
2. **이벤트 발행 실패**: 재시도 3회 (RabbitMQ tenacity)
3. **SSE 연결**: In-memory dict (단일 서버), Heartbeat 30초
4. **캐싱**: 데코레이터 패턴, 자동 캐시 키 생성
5. **Rate Limiting**: Sliding Window, Retry-After 헤더

---

**End of Logical Components Document**
