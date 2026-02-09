# NFR Requirements - Unit 1: Backend API & Database

## Overview

테이블오더 서비스 백엔드의 비기능 요구사항(Non-Functional Requirements)을 정의합니다. 이 문서는 시스템 품질 속성(Scalability, Performance, Availability, Security)과 운영 요구사항을 명시합니다.

---

## 1. Scalability Requirements (확장성)

### 1.1 사용자 확장성

**초기 목표**:
- 동시 접속자: 10명 이하
- 대상: 소규모 매장 1-2개
- 테이블 수: 10-20개

**1년 후 목표**:
- 동시 접속자: 20-50명 (2-5배 성장)
- 대상: 중규모 매장 5-10개
- 테이블 수: 50-100개

**확장 전략**:
- 수평 확장 (Horizontal Scaling)
- Load Balancer + 다중 API 서버 인스턴스
- Stateless 아키텍처 (세션 정보는 DB/Redis에 저장)

---

### 1.2 데이터 확장성

**데이터 증가율**:
- 일일 주문 건수: 100-500건
- 월간 주문 건수: 3,000-15,000건
- 연간 주문 건수: 36,000-180,000건

**데이터 보관 정책**:
- OrderHistory 보관 기간: 1년
- 1년 이상 데이터: DB에 계속 보관 (아카이빙 불필요)
- 예상 DB 크기: 1년 후 약 5-10GB

**데이터베이스 확장 전략**:
- 초기: 단일 RDS 인스턴스 (db.t3.medium)
- 성장 시: 인스턴스 크기 증가 (Vertical Scaling)
- 필요 시: Read Replica 추가 (읽기 부하 분산)

---

### 1.3 이벤트 버스 확장성

**초기 구현**:
- In-memory EventBus (단일 서버)
- 개발 및 초기 운영 단계

**프로덕션 구현**:
- **RabbitMQ** (메시지 큐)
- 다중 서버 지원
- 이벤트 재시도 및 영속화
- 장애 복구 기능

**RabbitMQ 선택 이유**:
- 메시지 영속화 지원 (이벤트 손실 방지)
- 재시도 메커니즘 내장
- 관리 UI 제공
- AWS에서 Amazon MQ로 관리형 서비스 제공

---

## 2. Performance Requirements (성능)

### 2.1 API 응답 시간

**일반 API** (메뉴 조회, 주문 조회):
- 목표: **1초 이하**
- 측정: P95 (95th percentile)
- 초과 시: 경고 로그 + 모니터링 알림

**복잡한 API** (주문 생성, 세션 종료):
- 목표: **3초 이하**
- 측정: P95
- 초과 시: 경고 로그 + 모니터링 알림

**타임아웃 설정**:
- 일반 API: 5초
- 복잡한 API: 10초
- 초과 시: 504 Gateway Timeout 반환

---

### 2.2 SSE 실시간 업데이트

**지연 시간 목표**:
- 주문 생성 → 관리자 화면 업데이트: **500ms 이하**
- 측정: End-to-end latency

**연결 관리**:
- 연결 타임아웃: 무제한 (keep-alive)
- 재연결: 클라이언트 책임 (자동 재연결)
- Heartbeat: 30초마다 ping 메시지

**성능 최적화**:
- EventBus → SSE 전송 최소화 (필터링)
- 매장별 이벤트 필터링 (store_id)
- 불필요한 데이터 제거 (최소 페이로드)

---

### 2.3 데이터베이스 쿼리 성능

**주문 내역 조회** (OrderHistory):
- 목표: **2초 이하**
- 최적화: 인덱스 + 쿼리 캐싱 (Redis)
- 캐시 TTL: 5분

**세션 종료 트랜잭션** (Order → OrderHistory):
- 목표: **5초 이하**
- 최적화: 배치 INSERT, 트랜잭션 최소화
- 대용량 주문 시: 비동기 처리 고려

**쿼리 최적화 전략**:
- 인덱스 활용 (20개 인덱스 정의됨)
- Redis 캐싱 (자주 조회되는 데이터)
- 쿼리 실행 계획 모니터링 (EXPLAIN ANALYZE)

---

### 2.4 이미지 업로드/다운로드 성능

**이미지 업로드** (1-5MB):
- 목표: **2초 이하**
- 최적화: 리사이징 + 압축 (썸네일 생성)
- 썸네일 크기: 300x300px, JPEG 80% 품질

**이미지 다운로드**:
- 목표: **500ms 이하**
- 최적화: FastAPI static files 서빙
- 캐싱: 브라우저 캐시 (Cache-Control: max-age=86400)

**이미지 최적화**:
- 원본: 저장 (최대 5MB)
- 썸네일: 자동 생성 (300x300px)
- 포맷: JPEG (압축률 우수)

---

## 3. Availability Requirements (가용성)

### 3.1 시스템 가용성 목표

**목표 가용성**: **99.99%** (Four Nines)
- 월간 다운타임: 최대 4분
- 연간 다운타임: 최대 52분

**계획된 유지보수**:
- 야간 유지보수만 가능 (영업 시간 외)
- 유지보수 시간: 새벽 2-4시
- 사전 공지: 최소 24시간 전

**무중단 배포**:
- 초기: 야간 배포 (다운타임 허용)
- 향후: Blue-Green 배포 또는 Rolling 배포

---

### 3.2 장애 복구 전략

**목표 복구 시간 (RTO)**:
- **4시간 이내**
- 장애 감지 → 복구 완료까지

**목표 복구 시점 (RPO)**:
- **데이터 손실 없음** (실시간 복제)
- Multi-AZ RDS 사용

**장애 복구 방안**:
- **자동 Failover** (Multi-AZ RDS)
- Primary 장애 시 Standby로 자동 전환
- 전환 시간: 1-2분

**장애 대응 절차**:
1. 모니터링 알림 수신 (Slack)
2. 장애 원인 파악 (로그 분석)
3. 자동 Failover 확인 (RDS)
4. 수동 복구 (필요 시)
5. 사후 분석 (Post-mortem)

---

### 3.3 백업 및 복원 전략

**백업 주기**:
- **매일 1회** (자동 백업)
- 백업 시간: 새벽 3시 (트래픽 최소)

**백업 보관 기간**:
- **7일**
- 7일 이상 백업은 자동 삭제

**백업 복원 테스트**:
- **매월 1회**
- 테스트 환경에서 백업 복원 검증
- 복원 시간 측정 및 기록

**백업 범위**:
- 데이터베이스: RDS 자동 백업
- 이미지 파일: S3 버킷 버전 관리 (향후)
- 설정 파일: Git 버전 관리

---

## 4. Security Requirements (보안)

### 4.1 인증/인가 보안

**JWT 토큰 서명**:
- 알고리즘: **RS256** (비대칭키)
- 공개키/개인키 쌍 사용
- 개인키: 서버에서 토큰 서명
- 공개키: 토큰 검증 (프론트엔드 공유 가능)

**JWT Secret Key 관리**:
- **환경 변수** (.env 파일)
- 개발: `.env.development`
- 프로덕션: `.env.production` (Git 제외)

**비밀번호 정책**:
- **제한 없음** (사용자 자유)
- 이유: 테이블 비밀번호는 간단해야 함 (고객 편의)
- 관리자 비밀번호: 최소 8자 권장 (강제 아님)

**비밀번호 해싱**:
- 알고리즘: bcrypt
- Cost factor: 12
- Salt: 자동 생성

---

### 4.2 데이터 암호화

**전송 중 암호화**:
- **HTTPS** (TLS 1.2+)
- 모든 API 통신 암호화
- SSL 인증서: Let's Encrypt (무료) 또는 AWS ACM

**저장 데이터 암호화**:
- **RDS Encryption at Rest**
- AES-256 암호화
- 데이터베이스 전체 암호화

**개인정보 보호**:
- **최소한의 보호** (비밀번호 해싱만)
- 개인정보 수집 최소화 (이름, 전화번호 없음)
- 비밀번호만 bcrypt 해싱

---

### 4.3 API 보안

**Rate Limiting**:
- **사용자별 제한** (JWT 토큰 기반)
- 제한: 분당 100회
- 초과 시: 429 Too Many Requests 반환

**CORS 정책**:
- **특정 도메인만 허용** (프론트엔드 도메인)
- 허용 도메인: `https://customer.example.com`, `https://admin.example.com`
- 허용 메서드: GET, POST, PATCH, DELETE
- 허용 헤더: Authorization, Content-Type

**SQL Injection 방어**:
- **ORM 사용** (SQLAlchemy)으로 충분
- Parameterized Query 자동 생성
- 추가 입력 검증 불필요

**기타 보안**:
- XSS 방어: FastAPI 자동 이스케이프
- CSRF 방어: SameSite Cookie (향후)
- 보안 헤더: Helmet.js 유사 미들웨어

---

## 5. Reliability Requirements (신뢰성)

### 5.1 에러 처리

**에러 응답 표준**:
- 일관된 에러 형식 (error code, message, details)
- HTTP 상태 코드 적절히 사용
- 사용자 친화적 메시지 (한국어)

**에러 로깅**:
- 모든 에러는 로그 기록
- 로그 레벨: ERROR
- 스택 트레이스 포함

**에러 복구**:
- 트랜잭션 롤백 (DB 일관성 보장)
- 재시도 로직 (DB 연결 실패 시 3회)
- Circuit Breaker (외부 API 호출 시, 향후)

---

### 5.2 모니터링 및 알림

**모니터링 도구**:
- **Prometheus + Grafana**
- 메트릭 수집: API 응답 시간, 에러율, DB 쿼리 시간
- 대시보드: Grafana (실시간 모니터링)

**알림 전략**:
- **Slack 알림**
- 알림 조건:
  - API 응답 시간 > 3초 (5분 이상 지속)
  - 에러율 > 5% (5분 이상 지속)
  - DB 연결 실패
  - RDS Failover 발생

**헬스 체크**:
- 엔드포인트: GET /health
- 응답: `{"status": "ok", "db": "connected"}`
- 주기: 30초마다

---

### 5.3 로깅

**로깅 도구**:
- **파일 로깅** (로컬 파일)
- 로그 파일: `/var/log/table-order/app.log`
- 로그 로테이션: 매일 또는 100MB 초과 시

**로그 레벨**:
- **INFO** (일반 정보)
- 개발 환경: DEBUG
- 프로덕션 환경: INFO

**로그 내용**:
- 요청/응답 로그 (API 호출)
- 에러 로그 (스택 트레이스)
- 비즈니스 이벤트 (주문 생성, 상태 변경)
- 성능 로그 (느린 쿼리)

**로그 보관**:
- 보관 기간: 30일
- 30일 이상 로그: 자동 삭제

---

## 6. Maintainability Requirements (유지보수성)

### 6.1 코드 품질

**코드 스타일**:
- PEP 8 (Python 코딩 컨벤션)
- Black (코드 포매터)
- Flake8 (린터)

**코드 리뷰**:
- Pull Request 필수
- 최소 1명 승인 필요

**문서화**:
- Docstring (함수/클래스 설명)
- OpenAPI 자동 생성 (FastAPI)
- README.md (프로젝트 설명)

---

### 6.2 테스트

**테스트 전략**:
- Unit Test: 서비스 로직
- Integration Test: API 엔드포인트
- E2E Test: 주요 시나리오 (주문 생성 ~ 세션 종료)

**테스트 커버리지**:
- 목표: 80% 이상
- 측정: pytest-cov

**테스트 자동화**:
- CI/CD 파이프라인에서 자동 실행
- 테스트 실패 시 배포 중단

---

### 6.3 배포

**환경 구성**:
- **로컬 개발만** (프로덕션 없음)
- 이유: 워크샵 프로젝트, 실제 배포 불필요

**환경별 설정**:
- **.env 파일** (환경 변수)
- `.env.development` (로컬 개발)
- `.env.test` (테스트)

**CI/CD 파이프라인**:
- **GitHub Actions** (자동 배포)
- 트리거: main 브랜치 push
- 단계:
  1. 코드 체크아웃
  2. 의존성 설치
  3. 린트 (Flake8)
  4. 테스트 (pytest)
  5. 빌드 (Docker 이미지)
  6. 배포 (향후)

---

## 7. Usability Requirements (사용성)

### 7.1 API 사용성

**OpenAPI 문서**:
- FastAPI 자동 생성
- 엔드포인트: `/docs` (Swagger UI)
- 엔드포인트: `/redoc` (ReDoc)

**에러 메시지**:
- 사용자 친화적 (한국어)
- 구체적인 오류 원인 제공
- 해결 방법 제시 (가능한 경우)

**API 버전 관리**:
- 초기: 버전 없음 (`/api/...`)
- 향후: 버전 추가 (`/api/v1/...`)

---

### 7.2 개발자 경험

**로컬 개발 환경**:
- Docker Compose (DB, Redis 등)
- 빠른 시작 (README.md 가이드)
- Hot Reload (FastAPI 자동 재시작)

**디버깅**:
- 상세한 로그 (DEBUG 레벨)
- 스택 트레이스 출력
- Postman Collection (API 테스트)

---

## Summary

### NFR 카테고리별 요약

| 카테고리 | 주요 요구사항 |
|---------|-------------|
| **Scalability** | 초기 10명 → 1년 후 20-50명, 수평 확장, RabbitMQ |
| **Performance** | API 1초/3초, SSE 500ms, DB 쿼리 2초/5초, 이미지 2초 |
| **Availability** | 99.99% 가용성, Multi-AZ RDS, 매일 백업, RTO 4시간 |
| **Security** | RS256 JWT, HTTPS, RDS 암호화, Rate Limiting, CORS |
| **Reliability** | Prometheus+Grafana, Slack 알림, 파일 로깅 |
| **Maintainability** | PEP 8, 80% 테스트 커버리지, GitHub Actions |
| **Usability** | OpenAPI 문서, 한국어 에러 메시지, Docker Compose |

### 주요 기술 스택 결정

| 항목 | 선택 | 이유 |
|-----|------|------|
| **EventBus** | RabbitMQ | 메시지 영속화, 재시도, 다중 서버 지원 |
| **JWT 알고리즘** | RS256 | 비대칭키, 공개키 공유 가능 |
| **암호화** | HTTPS + RDS Encryption | 전송/저장 데이터 보호 |
| **캐싱** | Redis | 쿼리 성능 최적화 |
| **모니터링** | Prometheus + Grafana | 오픈소스, 강력한 메트릭 수집 |
| **로깅** | 파일 로깅 | 단순성, 로컬 개발 환경 |
| **CI/CD** | GitHub Actions | 무료, GitHub 통합 |

---

**End of NFR Requirements Document**
