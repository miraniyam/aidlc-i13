# NFR Requirements Plan - Unit 1: Backend API & Database

## Unit Context

### Unit Name
**Unit 1: Backend API & Database** (table-order-backend)

### Functional Design Summary
- **9개 서비스**: Authentication, Menu, CreateOrder, OrderQuery, UpdateOrderStatus, DeleteOrder, CompleteTableSession, OrderHistoryQuery, ManageAdmin
- **10개 엔티티**: Store, Admin, Table, TableSession, MenuCategory, Menu, Order, OrderItem, OrderHistory, OrderHistoryItem
- **이벤트 기반**: EventBus + SSEPublisher (실시간 주문 모니터링)
- **Multi-tenant**: store_id로 매장별 데이터 격리
- **트랜잭션**: 복잡한 트랜잭션 (세션 종료 시 Order → OrderHistory 이동)

### Technology Stack (Proposed)
- Python 3.11+ / FastAPI
- SQLAlchemy 2.0 (ORM)
- PostgreSQL 15+
- JWT (PyJWT) / bcrypt
- Server-Sent Events (SSE)
- In-memory EventBus (Redis Pub/Sub for production)

---

## NFR Requirements Plan

### Phase 1: Scalability Assessment
- [ ] 1.1 동시 사용자 수 예측
- [ ] 1.2 데이터 증가율 예측
- [ ] 1.3 수평 확장 전략 수립
- [ ] 1.4 데이터베이스 확장 전략

### Phase 2: Performance Requirements
- [ ] 2.1 API 응답 시간 목표 설정
- [ ] 2.2 SSE 실시간 업데이트 지연 시간 목표
- [ ] 2.3 데이터베이스 쿼리 성능 목표
- [ ] 2.4 이미지 업로드/다운로드 성능 목표

### Phase 3: Availability Requirements
- [ ] 3.1 시스템 가용성 목표 설정
- [ ] 3.2 장애 복구 전략 수립
- [ ] 3.3 백업 및 복원 전략

### Phase 4: Security Requirements
- [ ] 4.1 인증/인가 보안 수준 설정
- [ ] 4.2 데이터 암호화 요구사항
- [ ] 4.3 API 보안 (Rate Limiting, CORS)
- [ ] 4.4 컴플라이언스 요구사항

### Phase 5: Tech Stack Decisions
- [ ] 5.1 프로덕션 EventBus 선택 (Redis vs 대안)
- [ ] 5.2 데이터베이스 연결 풀 설정
- [ ] 5.3 로깅 및 모니터링 도구 선택
- [ ] 5.4 배포 환경 설정

---

## Clarification Questions

### Scalability Questions

#### Q1: 예상 동시 사용자 수
현재 시스템은 중규모 동시 사용자(10-50명)를 가정하고 있습니다. 구체적인 사용자 수와 성장 예측을 명확히 해야 합니다.

**Questions:**
- 초기 런칭 시 예상 동시 접속자 수는?
  - A) 10명 이하 (소규모 매장 1-2개)
  - B) 10-50명 (중규모 매장 5-10개)
  - C) 50-100명 (대규모 매장 10-20개)
  - D) 100명 이상 (다수 매장)

[Answer]: 
a

- 1년 후 예상 성장률은?
  - A) 2배 이하
  - B) 2-5배
  - C) 5-10배
  - D) 10배 이상

[Answer]: 
b

---

#### Q2: 데이터 증가율
주문 데이터는 시간이 지남에 따라 누적됩니다. 데이터 증가율과 보관 정책을 결정해야 합니다.

**Questions:**
- 일일 예상 주문 건수는?
  - A) 100건 이하
  - B) 100-500건
  - C) 500-1000건
  - D) 1000건 이상

[Answer]: 
b

- OrderHistory 데이터 보관 기간은?
  - A) 1년
  - B) 3년
  - C) 5년
  - D) 영구 보관

[Answer]: 
a

- 오래된 데이터 아카이빙 전략은?
  - A) 필요 없음 (모두 DB에 보관)
  - B) 1년 이상 데이터는 별도 스토리지로 이동
  - C) 3년 이상 데이터는 콜드 스토리지로 이동

[Answer]: 
a

---

#### Q3: 수평 확장 전략
트래픽 증가 시 시스템 확장 방식을 결정해야 합니다.

**Questions:**
- 백엔드 API 서버 확장 방식은?
  - A) 단일 서버 (확장 불필요)
  - B) 수평 확장 (Load Balancer + 다중 인스턴스)
  - C) Auto Scaling (트래픽에 따라 자동 확장)

[Answer]: 
b

- 수평 확장 시 EventBus 전략은?
  - A) In-memory 유지 (단일 서버만 지원)
  - B) Redis Pub/Sub로 전환 (다중 서버 지원)
  - C) 메시지 큐 (RabbitMQ, Kafka)

[Answer]: 
c

---

### Performance Questions

#### Q4: API 응답 시간 목표
현재 요구사항은 2-3초 이내입니다. 구체적인 성능 목표를 설정해야 합니다.

**Questions:**
- 일반 API (메뉴 조회, 주문 조회) 응답 시간 목표는?
  - A) 500ms 이하
  - B) 1초 이하
  - C) 2초 이하
  - D) 3초 이하

[Answer]: 
b

- 복잡한 API (주문 생성, 세션 종료) 응답 시간 목표는?
  - A) 1초 이하
  - B) 2초 이하
  - C) 3초 이하
  - D) 5초 이하

[Answer]: 
c

- 성능 목표 미달 시 대응 방안은?
  - A) 로그 기록만 (에러 없음)
  - B) 경고 로그 + 모니터링 알림
  - C) 타임아웃 에러 반환

[Answer]: 
b

---

#### Q5: SSE 실시간 업데이트 지연 시간
관리자는 SSE를 통해 실시간 주문 업데이트를 받습니다. 지연 시간 목표를 설정해야 합니다.

**Questions:**
- 주문 생성 후 관리자 화면 업데이트까지 허용 지연 시간은?
  - A) 500ms 이하 (거의 즉시)
  - B) 1초 이하
  - C) 2초 이하
  - D) 5초 이하

[Answer]: 
a

- SSE 연결 끊김 시 재연결 전략은?
  - A) 클라이언트 자동 재연결 (백엔드는 신경 안 씀)
  - B) 백엔드에서 재연결 로직 제공
  - C) 연결 끊김 시 알림 + 수동 재연결

[Answer]: 
a

---

#### Q6: 데이터베이스 쿼리 성능
복잡한 쿼리(주문 내역 조회, 세션 종료)의 성능 목표를 설정해야 합니다.

**Questions:**
- 주문 내역 조회 (OrderHistory) 쿼리 시간 목표는?
  - A) 500ms 이하
  - B) 1초 이하
  - C) 2초 이하

[Answer]: 
c

- 세션 종료 트랜잭션 (Order → OrderHistory 이동) 시간 목표는?
  - A) 1초 이하
  - B) 2초 이하
  - C) 5초 이하
  - D) 10초 이하

[Answer]: 
c

- 쿼리 성능 최적화 전략은?
  - A) 인덱스만 사용 (추가 최적화 없음)
  - B) 쿼리 캐싱 (Redis)
  - C) 읽기 전용 복제본 (Read Replica)

[Answer]: 
b

---

#### Q7: 이미지 업로드/다운로드 성능
메뉴 이미지는 로컬 파일 시스템에 저장됩니다. 성능 목표를 설정해야 합니다.

**Questions:**
- 이미지 업로드 시간 목표는? (파일 크기: 1-5MB)
  - A) 2초 이하
  - B) 5초 이하
  - C) 10초 이하

[Answer]: 
a

- 이미지 다운로드 시간 목표는?
  - A) 500ms 이하
  - B) 1초 이하
  - C) 2초 이하

[Answer]: 
a

- 이미지 최적화 전략은?
  - A) 원본 그대로 저장 (최적화 없음)
  - B) 리사이징 + 압축 (썸네일 생성)
  - C) CDN 사용 (S3 + CloudFront)

[Answer]: 
b

---

### Availability Questions

#### Q8: 시스템 가용성 목표
시스템 다운타임 허용 수준을 결정해야 합니다.

**Questions:**
- 목표 가용성(Uptime)은?
  - A) 95% (월 36시간 다운타임 허용)
  - B) 99% (월 7.2시간 다운타임 허용)
  - C) 99.9% (월 43분 다운타임 허용)
  - D) 99.99% (월 4분 다운타임 허용)

[Answer]: 
d

- 계획된 유지보수 다운타임은?
  - A) 주간 유지보수 가능 (영업 시간 중 다운타임 허용)
  - B) 야간 유지보수만 가능 (영업 시간 외)
  - C) 무중단 배포 필수 (Blue-Green, Rolling)

[Answer]: 
b

---

#### Q9: 장애 복구 전략
시스템 장애 시 복구 방안을 수립해야 합니다.

**Questions:**
- 목표 복구 시간(RTO, Recovery Time Objective)은?
  - A) 1시간 이내
  - B) 4시간 이내
  - C) 24시간 이내
  - D) 제한 없음

[Answer]: 
b

- 목표 복구 시점(RPO, Recovery Point Objective)은?
  - A) 데이터 손실 없음 (실시간 복제)
  - B) 1시간 이내 데이터 손실 허용
  - C) 24시간 이내 데이터 손실 허용

[Answer]: 
a

- 장애 복구 방안은?
  - A) 수동 복구 (관리자가 직접 복구)
  - B) 자동 Failover (Multi-AZ RDS)
  - C) 재해 복구 사이트 (DR Site)

[Answer]: 
b

---

#### Q10: 백업 및 복원 전략
데이터 백업 정책을 수립해야 합니다.

**Questions:**
- 데이터베이스 백업 주기는?
  - A) 실시간 (Continuous Backup)
  - B) 매일 1회
  - C) 매주 1회
  - D) 백업 불필요

[Answer]: 
b
- 백업 보관 기간은?
  - A) 7일
  - B) 30일
  - C) 90일
  - D) 1년

[Answer]: 
a

- 백업 복원 테스트 주기는?
  - A) 매월 1회
  - B) 분기별 1회
  - C) 연 1회
  - D) 테스트 불필요

[Answer]: 
a

---

### Security Questions

#### Q11: 인증/인가 보안 수준
JWT 토큰 보안 및 권한 관리 수준을 결정해야 합니다.

**Questions:**
- JWT 토큰 서명 알고리즘은?
  - A) HS256 (대칭키)
  - B) RS256 (비대칭키)

[Answer]: 
b

- JWT Secret Key 관리 방식은?
  - A) 환경 변수 (.env 파일)
  - B) AWS Secrets Manager
  - C) HashiCorp Vault

[Answer]: 
a

- 비밀번호 정책은?
  - A) 제한 없음 (사용자 자유)
  - B) 최소 8자 이상
  - C) 최소 8자 + 영문/숫자/특수문자 조합

[Answer]: 
a

---

#### Q12: 데이터 암호화
데이터 보호 수준을 결정해야 합니다.

**Questions:**
- 전송 중 데이터 암호화는?
  - A) HTTP (암호화 없음)
  - B) HTTPS (TLS 1.2+)

[Answer]: 
b

- 저장 데이터 암호화는?
  - A) 암호화 없음
  - B) 데이터베이스 암호화 (RDS Encryption at Rest)
  - C) 애플리케이션 레벨 암호화 (민감 필드만)

[Answer]: 
b

- 개인정보 보호 요구사항은?
  - A) 없음 (개인정보 수집 안 함)
  - B) 최소한의 보호 (비밀번호 해싱만)
  - C) GDPR/개인정보보호법 준수

[Answer]: 
b

---

#### Q13: API 보안
API 남용 방지 및 보안 강화 방안을 결정해야 합니다.

**Questions:**
- Rate Limiting (요청 제한)은?
  - A) 불필요 (내부 시스템)
  - B) IP별 제한 (예: 분당 100회)
  - C) 사용자별 제한 (JWT 토큰 기반)

[Answer]: 
c

- CORS (Cross-Origin Resource Sharing) 정책은?
  - A) 모든 Origin 허용 (*)
  - B) 특정 도메인만 허용 (프론트엔드 도메인)
  - C) 동일 Origin만 허용

[Answer]: 
b
- SQL Injection 방어는?
  - A) ORM 사용 (SQLAlchemy)으로 충분
  - B) 추가 입력 검증 필요
  - C) WAF (Web Application Firewall) 사용

[Answer]: 
a

---

### Tech Stack Questions

#### Q14: 프로덕션 EventBus 선택
현재 In-memory EventBus는 단일 서버만 지원합니다. 프로덕션 환경에서 사용할 EventBus를 결정해야 합니다.

**Questions:**
- 프로덕션 EventBus 선택은?
  - A) In-memory 유지 (단일 서버 운영)
  - B) Redis Pub/Sub (간단한 메시징)
  - C) RabbitMQ (메시지 큐)
  - D) AWS SNS/SQS (클라우드 네이티브)

[Answer]: 
c

- EventBus 장애 시 대응 방안은?
  - A) 이벤트 손실 허용 (SSE만 영향)
  - B) 이벤트 재시도 (메시지 큐)
  - C) 이벤트 영속화 (DB 저장)

[Answer]: 
b

---

#### Q15: 데이터베이스 연결 풀
데이터베이스 연결 관리 전략을 결정해야 합니다.

**Questions:**
- 연결 풀 크기는?
  - A) 10개 (소규모)
  - B) 20개 (중규모)
  - C) 50개 (대규모)
  - D) 동적 조정 (트래픽에 따라)

[Answer]: 
c

- 연결 타임아웃 설정은?
  - A) 30초
  - B) 60초
  - C) 무제한

[Answer]: 
B

- 데이터베이스 연결 실패 시 재시도 전략은?
  - A) 즉시 에러 반환
  - B) 3회 재시도 (지수 백오프)
  - C) 무한 재시도 (서비스 중단 방지)

[Answer]: 
b

---

#### Q16: 로깅 및 모니터링
시스템 관찰성(Observability)을 위한 도구를 선택해야 합니다.

**Questions:**
- 로깅 도구는?
  - A) 표준 출력 (stdout)
  - B) 파일 로깅 (로컬 파일)
  - C) 중앙 로깅 (CloudWatch Logs, ELK Stack)

[Answer]: 
b

- 로그 레벨 전략은?
  - A) INFO (일반 정보)
  - B) DEBUG (상세 디버깅)
  - C) WARNING (경고만)
  - D) 환경별 다르게 (개발: DEBUG, 프로덕션: INFO)

[Answer]: 
a

- 모니터링 도구는?
  - A) 불필요 (로그만 확인)
  - B) CloudWatch Metrics (AWS 기본)
  - C) Prometheus + Grafana
  - D) Datadog, New Relic (상용 APM)

[Answer]: 
c

- 알림 전략은?
  - A) 알림 불필요
  - B) 이메일 알림
  - C) Slack/Teams 알림
  - D) PagerDuty (On-call)

[Answer]: 
c

---

#### Q17: 배포 환경 설정
개발, 스테이징, 프로덕션 환경 구성을 결정해야 합니다.

**Questions:**
- 환경 구성은?
  - A) 로컬 개발만 (프로덕션 없음)
  - B) 로컬 + 프로덕션
  - C) 로컬 + 스테이징 + 프로덕션

[Answer]: 
a

- 환경별 설정 관리 방식은?
  - A) .env 파일 (환경 변수)
  - B) AWS Parameter Store
  - C) Kubernetes ConfigMap/Secret

[Answer]: 
a

- CI/CD 파이프라인은?
  - A) 수동 배포
  - B) GitHub Actions (자동 배포)
  - C) Jenkins, GitLab CI

[Answer]: 
b

---

## Plan Execution Checklist

### Pre-Execution
- [x] Functional Design analyzed
- [x] NFR categories identified
- [x] Clarification questions generated

### Execution
- [x] User answers collected
- [x] Ambiguities resolved
- [x] NFR requirements documented
- [x] Tech stack decisions documented

### Post-Execution
- [x] Artifacts validated
- [x] User approval received
- [x] Progress logged in audit.md
- [x] aidlc-state.md updated

---

**Plan Status**: Complete - Approved by User (2026-02-09T16:09:23+09:00)

**Next Step**: User completes all [Answer]: tags, then AI proceeds to artifact generation.
