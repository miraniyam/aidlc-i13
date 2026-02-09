# NFR Design Plan - Unit 1: Backend API & Database

## Unit Context

### Unit Name
**Unit 1: Backend API & Database** (table-order-backend)

### NFR Requirements Summary
- **Scalability**: 초기 10명 → 1년 후 20-50명, 수평 확장, RabbitMQ
- **Performance**: API 1초/3초, SSE 500ms, DB 쿼리 2초/5초, Redis 캐싱
- **Availability**: 99.99% 가용성, Multi-AZ RDS, 매일 백업, RTO 4시간
- **Security**: RS256 JWT, HTTPS, RDS 암호화, Rate Limiting, CORS
- **Monitoring**: Prometheus + Grafana, Slack 알림, 파일 로깅

### Tech Stack Decisions
- Python 3.11 + FastAPI + SQLAlchemy 2.0 + PostgreSQL 15
- RabbitMQ (EventBus), Redis (캐싱), Prometheus + Grafana (모니터링)

---

## NFR Design Plan

### Phase 1: Performance Patterns
- [ ] 1.1 캐싱 전략 설계 (Redis)
- [ ] 1.2 데이터베이스 쿼리 최적화 패턴
- [ ] 1.3 연결 풀 관리 패턴
- [ ] 1.4 이미지 처리 최적화 패턴

### Phase 2: Scalability Patterns
- [ ] 2.1 수평 확장 아키텍처 설계
- [ ] 2.2 Stateless 서비스 패턴
- [ ] 2.3 이벤트 기반 아키텍처 (RabbitMQ)
- [ ] 2.4 로드 밸런싱 전략

### Phase 3: Availability Patterns
- [ ] 3.1 헬스 체크 및 모니터링
- [ ] 3.2 Failover 및 복구 전략
- [ ] 3.3 Circuit Breaker 패턴
- [ ] 3.4 Graceful Shutdown 패턴

### Phase 4: Security Patterns
- [ ] 4.1 JWT 인증 미들웨어 설계
- [ ] 4.2 Rate Limiting 구현 패턴
- [ ] 4.3 CORS 설정 패턴
- [ ] 4.4 입력 검증 및 Sanitization

### Phase 5: Logical Components
- [ ] 5.1 EventBus 컴포넌트 설계
- [ ] 5.2 SSEPublisher 컴포넌트 설계
- [ ] 5.3 CacheManager 컴포넌트 설계
- [ ] 5.4 RateLimiter 컴포넌트 설계

---

## Clarification Questions

### Performance Patterns

#### Q1: 캐싱 전략 세부사항
Redis 캐싱 전략의 구체적인 구현 방법을 결정해야 합니다.

**Questions:**
- 캐시 키 네이밍 규칙은?
  - A) `{entity}:{id}` (예: `order:123`)
  - B) `{service}:{entity}:{id}` (예: `order_query:order:123`)
  - C) `{store_id}:{entity}:{id}` (예: `uuid:order:123`)

[Answer]: 
b

- 캐시 무효화(Invalidation) 전략은?
  - A) TTL만 사용 (시간 기반)
  - B) 데이터 변경 시 명시적 삭제
  - C) TTL + 명시적 삭제 (하이브리드)

[Answer]: 

---

#### Q2: 느린 쿼리 처리
데이터베이스 쿼리 성능 목표를 초과하는 경우 처리 방법을 결정해야 합니다.

**Questions:**
- 느린 쿼리 감지 임계값은?
  - A) 1초
  - B) 2초
  - C) 3초

[Answer]: 

- 느린 쿼리 감지 시 조치는?
  - A) 로그만 기록
  - B) 로그 + 모니터링 알림
  - C) 로그 + 알림 + 자동 쿼리 분석

[Answer]: 

---

### Scalability Patterns

#### Q3: 세션 상태 관리
수평 확장 시 세션 상태(TableSession) 관리 방법을 결정해야 합니다.

**Questions:**
- 세션 상태 저장소는?
  - A) 데이터베이스만 (PostgreSQL)
  - B) Redis (캐싱) + 데이터베이스 (영속화)
  - C) Redis만 (TTL 기반)

[Answer]: 

- JWT 토큰 검증 시 DB 조회 필요 여부는?
  - A) 매 요청마다 DB 조회 (세션 활성 여부 확인)
  - B) JWT 페이로드만 검증 (DB 조회 없음)
  - C) Redis 캐시 확인 → DB 조회 (캐시 미스 시)

[Answer]: 

---

#### Q4: RabbitMQ 토폴로지
RabbitMQ Exchange 및 Queue 구조를 결정해야 합니다.

**Questions:**
- Exchange 타입은?
  - A) Direct (라우팅 키 정확히 일치)
  - B) Topic (패턴 매칭)
  - C) Fanout (브로드캐스트)

[Answer]: 

- Queue 구조는?
  - A) 단일 Queue (모든 이벤트)
  - B) 이벤트 타입별 Queue (order.created, order.status_changed)
  - C) 매장별 Queue (store_id 기반)

[Answer]: 

---

### Availability Patterns

#### Q5: 헬스 체크 상세 설계
헬스 체크 엔드포인트의 검증 범위를 결정해야 합니다.

**Questions:**
- 헬스 체크에서 확인할 항목은?
  - A) API 서버만 (응답 가능 여부)
  - B) API + 데이터베이스 연결
  - C) API + DB + Redis + RabbitMQ (모든 의존성)

[Answer]: 

- 헬스 체크 실패 시 응답은?
  - A) 503 Service Unavailable
  - B) 200 OK (상태 정보 포함)
  - C) 500 Internal Server Error

[Answer]: 

---

#### Q6: Circuit Breaker 적용 범위
Circuit Breaker 패턴 적용 여부를 결정해야 합니다.

**Questions:**
- Circuit Breaker 적용 대상은?
  - A) 불필요 (내부 시스템만 사용)
  - B) 외부 API 호출 시만 (향후 확장)
  - C) 데이터베이스 연결에도 적용

[Answer]: 

---

### Security Patterns

#### Q7: JWT 미들웨어 구현
JWT 인증 미들웨어의 구체적인 동작을 결정해야 합니다.

**Questions:**
- JWT 검증 실패 시 응답은?
  - A) 401 Unauthorized (간단한 메시지)
  - B) 401 + 상세 에러 코드 (TOKEN_EXPIRED, INVALID_TOKEN)
  - C) 403 Forbidden

[Answer]: 

- JWT 토큰 갱신(Refresh) 메커니즘은?
  - A) 없음 (만료 시 재로그인)
  - B) Refresh Token 제공
  - C) Sliding Window (활동 시 자동 연장)

[Answer]: 

---

#### Q8: Rate Limiting 구현 방법
Rate Limiting의 구체적인 구현 방법을 결정해야 합니다.

**Questions:**
- Rate Limiting 알고리즘은?
  - A) Fixed Window (고정 시간 창)
  - B) Sliding Window (슬라이딩 시간 창)
  - C) Token Bucket (토큰 버킷)

[Answer]: 

- Rate Limit 초과 시 응답은?
  - A) 429 Too Many Requests (간단한 메시지)
  - B) 429 + Retry-After 헤더
  - C) 429 + 상세 정보 (남은 요청 수, 리셋 시간)

[Answer]: 

---

### Logical Components

#### Q9: EventBus 인터페이스 설계
EventBus 컴포넌트의 인터페이스를 결정해야 합니다.

**Questions:**
- EventBus 구현 전환 방법은?
  - A) 환경 변수로 전환 (IN_MEMORY vs RABBITMQ)
  - B) 추상 인터페이스 + 구현체 주입 (DI)
  - C) 조건부 import

[Answer]: 

- 이벤트 발행 실패 시 처리는?
  - A) 로그만 기록 (무시)
  - B) 재시도 (3회)
  - C) 예외 발생 (트랜잭션 롤백)

[Answer]: 

---

#### Q10: SSEPublisher 연결 관리
SSE 연결 관리 방법을 결정해야 합니다.

**Questions:**
- SSE 연결 저장소는?
  - A) In-memory dict (단일 서버)
  - B) Redis (다중 서버)
  - C) 저장 안 함 (EventBus 구독만)

[Answer]: 

- SSE 연결 끊김 감지 방법은?
  - A) Heartbeat (30초마다 ping)
  - B) 클라이언트 재연결 시 감지
  - C) 타임아웃 (5분)

[Answer]: 

---

## Plan Execution Checklist

### Pre-Execution
- [x] NFR Requirements analyzed
- [x] Design patterns identified
- [x] Clarification questions generated

### Execution
- [x] User answers collected
- [x] Ambiguities resolved
- [x] NFR design patterns documented
- [x] Logical components documented

### Post-Execution
- [x] Artifacts validated
- [x] User approval received
- [x] Progress logged in audit.md
- [x] aidlc-state.md updated

---

**Plan Status**: Complete - Approved by User (2026-02-09T16:17:06+09:00)

**Next Step**: User completes all [Answer]: tags, then AI proceeds to artifact generation.

**Note**: 질문이 많지 않습니다. NFR Requirements에서 대부분의 결정이 완료되었으므로, 구체적인 구현 패턴에만 집중합니다.
