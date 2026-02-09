# Application Design Plan - 테이블오더 서비스

## Purpose
테이블오더 서비스의 고수준 컴포넌트 식별 및 서비스 레이어 설계

## Context
- **Tech Stack**: Python FastAPI (Backend), React (Frontend), PostgreSQL (Database)
- **User Types**: 고객, 매장 관리자, 슈퍼 관리자
- **Core Features**: 주문 관리, 실시간 모니터링, 테이블 세션 관리, 메뉴 관리, 계정 관리

---

## Design Questions

### Question 1: Component Organization
백엔드 컴포넌트를 어떻게 구성하시겠습니까?

A) 도메인 기반 (Order, Menu, Table, Admin 도메인별 컴포넌트)
B) 레이어 기반 (Controller, Service, Repository 레이어별 컴포넌트)
C) 기능 기반 (Customer, StoreAdmin, SuperAdmin 기능별 컴포넌트)
D) 혼합 (도메인 + 레이어)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 2: Service Layer Granularity
서비스 레이어를 어느 수준으로 나누시겠습니까?

A) 큰 단위 (OrderService, MenuService, AdminService 등 도메인별 큰 서비스)
B) 작은 단위 (CreateOrderService, UpdateOrderStatusService 등 기능별 작은 서비스)
C) 중간 단위 (도메인별 서비스 + 주요 기능별 메서드)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 3: Real-time Communication Pattern
실시간 주문 모니터링(SSE)을 어떻게 구현하시겠습니까?

A) 전용 SSE 서비스 (별도 SSEService 컴포넌트)
B) OrderService에 통합 (OrderService가 SSE 엔드포인트 제공)
C) 이벤트 기반 (Event Bus + SSE Publisher)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 4: Authentication & Authorization
인증/인가를 어떻게 처리하시겠습니까?

A) 전용 Auth 컴포넌트 (AuthService, AuthMiddleware)
B) 각 서비스에 통합 (각 서비스가 자체 인증 처리)
C) FastAPI Dependency Injection (의존성 주입으로 인증 처리)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 5: Data Access Pattern
데이터 접근을 어떻게 구성하시겠습니까?

A) Repository 패턴 (각 도메인별 Repository 클래스)
B) ORM 직접 사용 (SQLAlchemy 직접 사용, Repository 없음)
C) DAO 패턴 (Data Access Object)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 6: Frontend Component Structure
React 프론트엔드 컴포넌트를 어떻게 구성하시겠습니까?

A) 페이지 기반 (CustomerPage, AdminPage 등 페이지별 컴포넌트)
B) 기능 기반 (Menu, Cart, Order 등 기능별 컴포넌트)
C) Atomic Design (Atoms, Molecules, Organisms, Templates, Pages)
D) 혼합 (페이지 + 기능 컴포넌트)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 7: State Management
프론트엔드 상태 관리를 어떻게 하시겠습니까?

A) React Context API
B) Redux
C) Zustand
D) React Query + Local State
E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 8: API Communication
프론트엔드-백엔드 API 통신을 어떻게 구성하시겠습니까?

A) Axios 직접 사용 (각 컴포넌트에서 직접 호출)
B) API Service 레이어 (전용 API 서비스 클래스)
C) React Query (데이터 페칭 라이브러리)
D) 혼합 (API Service + React Query)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Application Design Plan

### Phase 1: Component Identification
- [ ] Identify backend domain components
- [ ] Identify backend service components
- [ ] Identify frontend page components
- [ ] Identify frontend feature components
- [ ] Identify shared/common components

### Phase 2: Component Responsibilities
- [ ] Define each component's purpose
- [ ] Define component boundaries
- [ ] Identify component interfaces
- [ ] Document high-level responsibilities

### Phase 3: Component Methods
- [ ] Define method signatures for each component
- [ ] Specify input/output types
- [ ] Document high-level method purpose
- [ ] Note: Detailed business rules will be defined in Functional Design (CONSTRUCTION phase)

### Phase 4: Service Layer Design
- [ ] Define service layer structure
- [ ] Identify service orchestration patterns
- [ ] Define service responsibilities
- [ ] Document service interactions

### Phase 5: Component Dependencies
- [ ] Create dependency matrix
- [ ] Identify communication patterns
- [ ] Document data flow
- [ ] Validate dependency consistency

### Phase 6: Generate Artifacts
- [ ] Create components.md
- [ ] Create component-methods.md
- [ ] Create services.md
- [ ] Create component-dependency.md

### Phase 7: Validation
- [ ] Verify all requirements covered
- [ ] Check design consistency
- [ ] Validate component boundaries
- [ ] Review for completeness

---

## Mandatory Artifacts

### 1. components.md
- [ ] All component definitions
- [ ] Component responsibilities
- [ ] Component interfaces

### 2. component-methods.md
- [ ] Method signatures for each component
- [ ] Input/output types
- [ ] High-level method purpose

### 3. services.md
- [ ] Service definitions
- [ ] Service responsibilities
- [ ] Service orchestration patterns

### 4. component-dependency.md
- [ ] Dependency matrix
- [ ] Communication patterns
- [ ] Data flow diagrams

---

**Instructions**: Please fill in all [Answer]: tags above. Once completed, let me know and I will proceed with application design generation based on your answers.
