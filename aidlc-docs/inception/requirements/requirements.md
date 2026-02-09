# Requirements Document - 테이블오더 서비스

## Intent Analysis

### User Request
테이블오더 서비스 구축 - 고객용 주문 인터페이스, 관리자용 관리 인터페이스, 실시간 주문 모니터링

### Request Type
New Project - 신규 프로젝트

### Scope Estimate
System-wide - 고객용 인터페이스, 관리자용 인터페이스, 서버 시스템, 데이터 저장소

### Complexity Estimate
Complex - 실시간 주문 모니터링(SSE), 세션 관리, 다중 사용자 타입, 테이블별 주문 관리

---

## 1. Functional Requirements

### 1.1 고객용 기능

#### FR-1.1: 테이블 태블릿 자동 로그인 및 세션 관리
- **초기 설정** (관리자가 1회 수행):
  - 매장 식별자 입력 (UUID 형식)
  - 테이블 번호 입력
  - 테이블 비밀번호 입력
  - 로그인 정보 로컬 저장
- **자동 로그인**: 저장된 정보로 자동 로그인
- **세션 관리**: 첫 주문 시 자동으로 세션 생성, 관리자가 수동 종료

#### FR-1.2: 메뉴 조회 및 탐색
- 메뉴 화면이 기본 화면으로 표시
- 단일 레벨 카테고리별 메뉴 분류 (예: 메인요리, 사이드, 음료)
- 메뉴 상세 정보 표시: 메뉴명, 가격, 설명, 이미지
- 카테고리 간 빠른 이동
- 카드 형태 레이아웃, 터치 친화적 버튼 (최소 44x44px)

#### FR-1.3: 장바구니 관리
- 메뉴 추가/삭제
- 수량 조절 (증가/감소)
- 총 금액 실시간 계산
- 장바구니 비우기
- 로컬 저장 (페이지 새로고침 시에도 유지)

#### FR-1.4: 주문 생성
- 주문 내역 최종 확인
- 주문 확정 버튼
- 주문 성공 시: 주문 번호 표시, 장바구니 자동 비우기, 메뉴 화면으로 자동 리다이렉트
- 주문 실패 시: 에러 메시지 표시, 장바구니 유지
- 주문 정보: 매장 ID, 테이블 ID, 주문 메뉴 목록, 총 금액, 세션 ID

#### FR-1.5: 주문 내역 조회
- 주문 시간 순 정렬
- 주문별 상세 정보: 주문 번호, 시각, 메뉴 및 수량, 금액, 상태 (대기중/준비중/요리완료/전달완료)
- 현재 테이블 세션 주문만 표시 (이전 세션 제외)
- 30초마다 폴링 방식으로 자동 업데이트

### 1.2 관리자용 기능

#### FR-2.1: 매장 인증
- 매장 식별자 입력 (UUID)
- 사용자명 및 비밀번호 입력
- 16시간 세션 유지 (JWT 토큰 기반)
- 브라우저 새로고침 시 세션 유지
- 비밀번호 bcrypt 해싱

#### FR-2.2: 실시간 주문 모니터링
- Server-Sent Events(SSE) 기반 실시간 업데이트
- 그리드/대시보드 레이아웃: 테이블별 카드 형태
- 각 테이블 카드: 총 주문액, 최신 주문 n개 미리보기
- 주문 카드 클릭 시 전체 메뉴 목록 상세 보기
- 주문 상태 변경 (관리자만 수동 변경: 대기중 → 준비중 → 요리완료 → 전달완료)
- 신규 주문 시각적 강조
- 2초 이내 주문 표시

#### FR-2.3: 테이블 관리
- **테이블 태블릿 초기 설정**: 테이블 번호 및 비밀번호 설정 (사전 설정 방식)
- **주문 삭제**: 특정 주문 삭제, 확인 팝업, 총 주문액 재계산
- **테이블 세션 처리**: 
  - 첫 주문 시 자동 세션 시작
  - 관리자가 "이용 완료" 버튼으로 수동 종료
  - 세션 종료 시 주문 내역을 과거 이력으로 이동
  - 테이블 현재 주문 목록 및 총 주문액 0으로 리셋
- **과거 주문 내역 조회**: 테이블별 과거 주문 목록, 날짜 필터링

#### FR-2.4: 슈퍼 관리자 기능
- 매장 관리자 계정 생성
- 매장 관리자 계정 관리 (활성화/비활성화)

#### FR-2.5: 메뉴 관리
- 메뉴 조회 (카테고리별)
- 메뉴 등록: 메뉴명, 가격, 설명, 카테고리, 이미지 (로컬 파일 시스템 저장)
- 메뉴 수정
- 메뉴 삭제
- 메뉴 노출 순서 조정

---

## 2. Non-Functional Requirements

### NFR-1: Performance
- **응답 시간**: 주문 생성 및 조회 2-3초 이내
- **동시 사용자**: 중규모 (10-50명) 지원
- **실시간 업데이트**: 
  - 관리자 대시보드 SSE 2초 이내
  - 고객용 주문 내역 30초 폴링

### NFR-2: Scalability
- 중형 레스토랑 규모 (테이블 10-50개)
- 향후 다중 매장 확장 가능한 구조

### NFR-3: Security
- 비밀번호 bcrypt 해싱
- JWT 토큰 기반 인증 (16시간 세션)
- 로그인 시도 제한
- 테이블별 비밀번호 인증

### NFR-4: Usability
- 터치 친화적 UI (최소 44x44px 버튼)
- 직관적인 메뉴 탐색
- 명확한 시각적 피드백

### NFR-5: Reliability
- 장바구니 로컬 저장 (페이지 새로고침 시에도 유지)
- 주문 실패 시 장바구니 유지
- 세션 유지 (브라우저 새로고침 시에도 유지)

### NFR-6: Data Management
- 과거 주문 내역 6개월 보관
- 6개월 이상 된 주문 자동 삭제

---

## 3. Technical Stack

### 3.1 Backend
- **Framework**: Python + FastAPI
- **Features**: 빠른 개발, 비동기 지원, SSE 지원

### 3.2 Frontend
- **Framework**: React
- **Features**: 컴포넌트 기반, TypeScript 지원, 생태계 풍부

### 3.3 Database
- **DBMS**: PostgreSQL
- **Features**: 관계형, ACID 보장, 복잡한 쿼리 지원

### 3.4 Deployment
- **Development**: 로컬 환경
- **Production**: AWS (EC2, RDS, S3)
- **Infrastructure as Code**: Terraform

### 3.5 Image Storage
- 로컬 파일 시스템 (서버에 이미지 파일 저장)

---

## 4. Data Model

### 4.1 Core Entities

#### Store (매장)
- store_id (UUID, PK)
- store_name
- created_at
- updated_at

#### Admin (관리자)
- admin_id (PK)
- store_id (FK)
- username
- password_hash
- role (super_admin, store_admin)
- created_at
- updated_at

#### Table (테이블)
- table_id (PK)
- store_id (FK)
- table_number
- table_password_hash
- created_at
- updated_at

#### TableSession (테이블 세션)
- session_id (PK)
- table_id (FK)
- start_time
- end_time (nullable)
- status (active, completed)

#### MenuCategory (메뉴 카테고리)
- category_id (PK)
- store_id (FK)
- category_name
- display_order

#### Menu (메뉴)
- menu_id (PK)
- store_id (FK)
- category_id (FK)
- menu_name
- price
- description
- image_path
- display_order
- created_at
- updated_at

#### Order (주문)
- order_id (PK)
- session_id (FK)
- table_id (FK)
- store_id (FK)
- order_number
- total_amount
- status (pending, preparing, cooked, delivered)
- created_at
- updated_at

#### OrderItem (주문 항목)
- order_item_id (PK)
- order_id (FK)
- menu_id (FK)
- menu_name
- quantity
- unit_price
- subtotal

#### OrderHistory (과거 주문 내역)
- history_id (PK)
- session_id (FK)
- table_id (FK)
- store_id (FK)
- order_id (FK)
- completed_at
- archived_at

---

## 5. User Scenarios

### 5.1 고객 주문 시나리오
1. 고객이 테이블 태블릿 접속 (자동 로그인)
2. 메뉴 화면에서 카테고리별 메뉴 탐색
3. 원하는 메뉴를 장바구니에 추가
4. 수량 조절 및 총 금액 확인
5. 주문 확정 버튼 클릭
6. 주문 번호 확인 후 메뉴 화면으로 자동 이동
7. 주문 내역 조회 화면에서 주문 상태 확인 (30초마다 자동 업데이트)

### 5.2 관리자 주문 관리 시나리오
1. 관리자가 매장 관리 시스템 로그인
2. 실시간 주문 모니터링 대시보드 확인
3. 신규 주문 알림 (SSE, 2초 이내)
4. 테이블별 주문 카드 클릭하여 상세 보기
5. 주문 상태 변경 (대기중 → 준비중 → 요리완료 → 전달완료)
6. 고객 테이블 이용 완료 시 "이용 완료" 버튼 클릭
7. 과거 주문 내역으로 이동, 테이블 리셋

### 5.3 관리자 메뉴 관리 시나리오
1. 관리자가 메뉴 관리 화면 접속
2. 새 메뉴 등록: 메뉴명, 가격, 설명, 카테고리, 이미지 업로드
3. 기존 메뉴 수정 또는 삭제
4. 메뉴 노출 순서 조정
5. 변경 사항 저장

---

## 6. Business Rules

### BR-1: 세션 관리
- 테이블 세션은 첫 주문 시 자동 생성
- 세션은 관리자가 "이용 완료" 버튼으로 수동 종료
- 세션 종료 시 모든 주문 내역은 과거 이력으로 이동
- 새 세션 시작 시 이전 주문 내역은 표시되지 않음

### BR-2: 주문 상태 관리
- 주문 상태는 관리자만 수동 변경 가능
- 상태 전이: 대기중 → 준비중 → 요리완료 → 전달완료
- 각 상태의 의미:
  - 대기중 (pending): 주문 접수됨, 아직 조리 시작 전
  - 준비중 (preparing): 조리 시작됨
  - 요리완료 (cooked): 조리 완료, 서빙 대기 중
  - 전달완료 (delivered): 고객 테이블에 전달 완료

### BR-3: 데이터 보관
- 과거 주문 내역은 6개월 보관
- 6개월 이상 된 주문은 자동 삭제

### BR-4: 인증 및 권한
- 슈퍼 관리자: 매장 관리자 계정 생성 및 관리
- 매장 관리자: 자신의 매장 주문 및 메뉴 관리
- 테이블: 테이블 비밀번호로 인증

---

## 7. Constraints

### 제외 기능
- 실제 결제 처리 (모든 결제 기능 제외)
- 복잡한 사용자 인증 (OAuth, SNS 로그인)
- 이미지 리사이징/최적화
- 알림 시스템 (푸시, SMS, 이메일)
- 주방 기능
- 데이터 분석 및 리포트
- 재고 관리
- 외부 연동 (배달 플랫폼, POS)

---

## 8. Success Criteria

### 8.1 고객 관점
- 대기 시간 없이 즉시 주문 가능
- 직관적이고 사용하기 쉬운 인터페이스
- 주문 상태 실시간 확인 (30초 폴링)

### 8.2 관리자 관점
- 실시간 주문 모니터링 (2초 이내 업데이트)
- 효율적인 주문 관리 및 상태 변경
- 간편한 메뉴 관리

### 8.3 시스템 관점
- 응답 시간 2-3초 이내
- 중규모 동시 사용자 지원 (10-50명)
- 안정적인 세션 관리
- 데이터 무결성 보장

---

## 9. Assumptions

- 테이블 태블릿은 항상 온라인 상태
- 관리자는 웹 브라우저를 통해 접속
- 매장당 테이블 수는 50개 이하
- 메뉴 이미지는 로컬 파일 시스템에 저장
- 개발 환경은 로컬, 운영 환경은 AWS

---

## 10. Dependencies

- FastAPI (Python 백엔드 프레임워크)
- React (프론트엔드 프레임워크)
- PostgreSQL (데이터베이스)
- JWT (인증)
- bcrypt (비밀번호 해싱)
- Terraform (인프라 코드)
- AWS (EC2, RDS, S3)

---

## Summary

테이블오더 서비스는 고객이 테이블에서 직접 주문하고, 관리자가 실시간으로 주문을 모니터링하며 관리할 수 있는 시스템입니다. Python FastAPI 백엔드, React 프론트엔드, PostgreSQL 데이터베이스를 사용하며, 개발은 로컬에서 진행하고 운영은 AWS에 배포합니다. 실시간 주문 모니터링(SSE), 테이블 세션 관리, 메뉴 관리 등 핵심 기능을 제공하며, 결제 기능은 제외됩니다.
