# Backend Alignment Summary - Unit 3 (Admin Frontend)

## Overview

Unit 1 (Backend) 실제 구현을 기준으로 Unit 3 (Admin Frontend) 설계를 수정했습니다.

**수정 날짜**: 2026-02-09T16:53:00+09:00

---

## API Endpoint Mapping

### Authentication
- **Frontend 설계**: `/api/admin/login`
- **Backend 실제**: `/api/admin/auth/login` ✅
- **수정**: Frontend에서 `/api/admin/auth/login` 사용

### SSE Stream
- **Frontend 설계**: `/api/admin/events`
- **Backend 실제**: `/api/admin/sse` ✅
- **수정**: Frontend에서 `/api/admin/sse` 사용

### Orders
- **Frontend 설계**: `/api/admin/orders`
- **Backend 실제**: `/api/admin/orders` ✅
- **수정**: 없음

### Menus
- **Frontend 설계**: `/api/admin/menus`
- **Backend 실제**: `/api/admin/menus` ✅
- **수정**: 없음

### Tables
- **Frontend 설계**: `/api/admin/tables/{table_id}/complete-session`
- **Backend 실제**: `/api/admin/tables/{table_id}/complete-session` ✅
- **수정**: 없음

### Order History
- **Frontend 설계**: `/api/admin/orders/history`
- **Backend 실제**: `/api/admin/tables/{table_id}/order-history` ✅
- **수정**: Frontend에서 `/api/admin/tables/{table_id}/order-history` 사용

---

## Request/Response Schema Changes

### 1. UpdateOrderStatusRequest

**Before (설계)**:
```typescript
interface UpdateOrderStatusRequest {
  new_status: OrderStatus;
  current_version: number; // Optimistic Locking
}
```

**After (실제)**:
```typescript
interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
```

**Reason**: Backend에 Optimistic Locking 미구현

---

### 2. CompleteSessionRequest

**Before (설계)**:
```typescript
interface CompleteSessionRequest {
  table_id: string;
  force?: boolean; // 강제 종료
}
```

**After (실제)**:
```typescript
// Request body 없음 (table_id는 URL 파라미터)
```

**Reason**: Backend에 force 옵션 미구현

---

### 3. Order Entity

**Before (설계)**:
```typescript
interface Order {
  order_id: string;
  session_id: string;
  status: OrderStatus;
  total_amount: number;
  version: number; // Optimistic Locking
  is_archived: boolean; // 세션 종료 후 보존
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

type OrderStatus = 'pending' | 'preparing' | 'cooked' | 'delivered';
```

**After (실제)**:
```typescript
interface Order {
  order_id: string;
  session_id: string;
  status: OrderStatus;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
```

**Reason**: Backend 실제 구현 기준

---

## Removed Features (Phase 2로 연기)

### 1. Optimistic Locking (동시성 제어)
- **설계**: Order.version 필드로 낙관적 잠금
- **실제**: 미구현
- **영향**: 
  - 동시 주문 상태 변경 시 충돌 감지 불가
  - Last-Write-Wins 방식으로 동작
- **Phase 2**: Backend에 version 필드 추가

### 2. 세션 강제 종료
- **설계**: force 옵션으로 미전달 주문 있어도 종료
- **실제**: 미구현
- **영향**: 
  - 미전달 주문 있으면 세션 종료 불가
  - 관리자가 모든 주문을 'served'로 변경 후 종료 필요
- **Phase 2**: Backend에 force 파라미터 추가

### 3. Order Archiving
- **설계**: is_archived 필드로 세션 종료 후 주문 보존
- **실제**: 미구현
- **영향**: 
  - 세션 종료 후 주문 데이터 처리 방식 불명확
  - Backend 로직 확인 필요
- **Phase 2**: Backend 로직 확인 후 결정

### 4. Dashboard API
- **설계**: `/api/admin/dashboard` (테이블 목록 + 주문 요약)
- **실제**: 미구현
- **영향**: 
  - Frontend에서 여러 API 조합 필요
  - 성능 저하 가능성
- **Phase 2**: Backend에 Dashboard API 추가

### 5. Category Management API
- **설계**: `/api/admin/categories` (CRUD)
- **실제**: 미구현
- **영향**: 
  - 카테고리 관리 기능 제거
  - 메뉴 생성 시 category_id만 사용
- **Phase 2**: Backend에 Category API 추가

### 6. Image Upload API
- **설계**: `/api/admin/upload` (별도 엔드포인트)
- **실제**: 메뉴 생성/수정 시 통합
- **영향**: 
  - 이미지 미리보기 후 업로드 불가
  - 메뉴 생성/수정과 동시에 업로드
- **Phase 2**: Backend에 별도 Upload API 추가 (선택적)

---

## Modified Files

### Functional Design
- [x] `domain-entities.md` - Order, UpdateOrderStatusRequest, CompleteSessionRequest 수정
- [ ] `business-logic-model.md` - 동시성 제어 로직 제거 필요
- [ ] `business-rules.md` - 동시성 제어 규칙 제거 필요

### NFR Requirements
- [ ] `nfr-requirements.md` - Optimistic Locking 관련 내용 제거 필요
- [ ] `tech-stack-decisions.md` - 동시성 제어 관련 내용 제거 필요

### TDD Artifacts
- [ ] `unit3-admin-ui-contracts.md` - API 엔드포인트 경로 수정 필요
- [ ] `unit3-admin-ui-test-plan.md` - 버전 충돌, 강제 종료 테스트 제거 필요
- [ ] `unit3-admin-ui-tdd-code-generation-plan.md` - 구현 범위 조정 필요

---

## Action Items

### Immediate (Unit 3 개발 전)
1. [x] Domain Entities 수정
2. [ ] Business Logic Model 수정
3. [ ] Business Rules 수정
4. [ ] TDD Contracts 수정
5. [ ] TDD Test Plan 수정
6. [ ] TDD Code Generation Plan 수정

### Phase 2 (Unit 1 개선)
1. [ ] Optimistic Locking 추가 (Order.version)
2. [ ] 세션 강제 종료 추가 (force 파라미터)
3. [ ] Dashboard API 추가
4. [ ] Category Management API 추가
5. [ ] Image Upload API 추가 (선택적)

---

## Summary

**제거된 기능**: 5개
**수정된 API 엔드포인트**: 3개
**수정된 Request/Response**: 2개

**영향도**: 중간 (핵심 기능은 유지, 고급 기능 제거)

**권장 사항**: 
- Unit 3 개발 진행 (핵심 기능 먼저)
- Phase 2에서 고급 기능 추가
