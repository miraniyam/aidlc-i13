# Business Rules - Unit 3 (Admin Frontend)

## Overview

Admin Frontend의 비즈니스 규칙을 정의합니다. 검증 규칙, 제약 조건, 상태 전이 규칙 등을 명시합니다.

---

## 1. Authentication Rules

### 1.1 Login Validation

**Required Fields**:
- store_id: 필수
- username: 필수
- password: 필수

**Field Constraints**:
```typescript
const loginValidationRules = {
  store_id: {
    required: true,
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    message: '올바른 매장 식별자 형식이 아닙니다 (UUID)'
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    message: '사용자명은 3-50자여야 합니다'
  },
  password: {
    required: true,
    minLength: 8,
    message: '비밀번호는 최소 8자 이상이어야 합니다'
  }
};
```

---

### 1.2 Token Validation

**Token Expiry**:
- JWT 토큰 유효 기간: 16시간
- 만료 시 자동 로그아웃 (Q12)

**Token Storage**:
- localStorage key: 'admin_token'
- 페이지 새로고침 시에도 유지

---

## 2. Order Status Transition Rules

### 2.1 Allowed Transitions (Frontend Validation)

**State Machine**:
```
pending → preparing → cooked → delivered
```

**Transition Matrix**:
| Current Status | Allowed Next Status |
|----------------|---------------------|
| pending        | preparing           |
| preparing      | cooked              |
| cooked         | delivered           |
| delivered      | (none)              |

**Validation Function**:
```typescript
const validateStatusTransition = (
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean => {
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    'pending': ['preparing'],
    'preparing': ['cooked'],
    'cooked': ['delivered'],
    'delivered': []
  };
  
  return allowedTransitions[currentStatus]?.includes(newStatus) || false;
};
```

**UI Rule**:
- 허용되지 않은 전이는 버튼 비활성화
- delivered 상태는 버튼 대신 Badge 표시

---

### 2.2 Status Change Confirmation

**Rule**: 모든 상태 변경은 확인 팝업 필요 (Q11: Custom Modal)

**Confirmation Message**:
```typescript
const getStatusChangeConfirmMessage = (newStatus: OrderStatus): string => {
  const messages: Record<OrderStatus, string> = {
    'preparing': '주문을 "준비중"으로 변경하시겠습니까?',
    'cooked': '주문을 "요리완료"로 변경하시겠습니까?',
    'delivered': '주문을 "전달완료"로 변경하시겠습니까?',
    'pending': '' // Not used
  };
  
  return messages[newStatus];
};
```

---

## 3. Menu Management Rules

### 3.1 Menu Validation

**Required Fields**:
- menu_name: 필수
- price: 필수
- category_id: 필수

**Field Constraints**:
```typescript
const menuValidationRules = {
  menu_name: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: '메뉴명은 1-100자여야 합니다'
  },
  price: {
    required: true,
    min: 0,
    max: 1000000,
    type: 'number',
    message: '가격은 0원 이상 1,000,000원 이하여야 합니다'
  },
  description: {
    required: false,
    maxLength: 500,
    message: '설명은 최대 500자까지 입력 가능합니다'
  },
  category_id: {
    required: true,
    message: '카테고리를 선택해주세요'
  }
};
```

---

### 3.2 Image Upload Rules

**File Size Limit**: 5MB

**Allowed Formats**: JPG, PNG, WEBP

**Validation**:
```typescript
const validateImageFile = (file: File): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Size check
  if (file.size > 5 * 1024 * 1024) {
    errors.push({
      field: 'image',
      message: '이미지 파일 크기는 5MB 이하여야 합니다'
    });
  }
  
  // Format check
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push({
      field: 'image',
      message: '이미지 형식은 JPG, PNG, WEBP만 가능합니다'
    });
  }
  
  return errors;
};
```

---

### 3.3 Menu Deletion Rules

**Frontend Pre-check**: 활성 주문에 포함된 메뉴인지 확인

**Pre-check Logic**:
```typescript
const canDeleteMenu = (menuId: string, activeOrders: Order[]): boolean => {
  return !activeOrders.some(order => 
    order.items.some(item => item.menu_id === menuId)
  );
};
```

**Pre-check Error Message**: "이 메뉴는 현재 활성 주문에 포함되어 있어 삭제할 수 없습니다. 모든 주문이 완료된 후 삭제해주세요."

**Confirmation Required**: Yes (Q11: Custom Modal)

**Confirmation Message**: "이 메뉴를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."

**Backend Validation**: 
- 활성 주문에 포함된 메뉴는 삭제 불가 (Backend에서 최종 검증)
- Frontend는 UX 향상 목적으로 사전 체크

**Note**: 메뉴 삭제 시 OrderItem.menu_id는 null로 변경 (과거 주문 보존)

---

## 4. Category Management Rules

### 4.1 Category Validation

**Required Fields**:
- category_name: 필수

**Field Constraints**:
```typescript
const categoryValidationRules = {
  category_name: {
    required: true,
    minLength: 1,
    maxLength: 50,
    message: '카테고리명은 1-50자여야 합니다'
  },
  display_order: {
    required: false,
    min: 0,
    type: 'number',
    message: '노출 순서는 0 이상이어야 합니다'
  }
};
```

---

### 4.2 Category Deletion Rules

**Frontend Pre-check**: 카테고리에 메뉴가 있는지 확인

**Pre-check Logic**:
```typescript
const canDeleteCategory = (categoryId: string, menus: Menu[]): boolean => {
  return !menus.some(menu => menu.category_id === categoryId);
};
```

**Pre-check Error Message**: "이 카테고리에 N개의 메뉴가 있어 삭제할 수 없습니다. 먼저 메뉴를 다른 카테고리로 이동하거나 삭제해주세요."

**Confirmation Required**: Yes

**Deletion Constraint**: 
- 카테고리에 메뉴가 있으면 삭제 불가
- Backend에서 최종 검증, Frontend는 UX 향상 목적 사전 체크

---

## 5. Table Session Rules

### 5.1 Complete Session Rules

**Confirmation Required**: Yes (Q11: Custom Modal)

**Precondition Check**:
```typescript
const canCompleteSession = (orders: Order[]): { 
  canComplete: boolean; 
  undeliveredCount: number;
} => {
  const undeliveredOrders = orders.filter(o => o.status !== 'delivered');
  
  return {
    canComplete: undeliveredOrders.length === 0,
    undeliveredCount: undeliveredOrders.length
  };
};
```

**Warning Rule**: 미전달 주문 있으면 경고 모달 표시

**Warning Message**: "N개의 주문이 아직 전달되지 않았습니다. 계속하시겠습니까?"

**Confirmation Message**: "이 테이블의 세션을 종료하시겠습니까? 모든 주문이 과거 내역으로 이동합니다."

**Precondition**: 
- 활성 세션이 존재해야 함
- 세션에 주문이 있어야 함 (없으면 버튼 비활성화)

**Postcondition**:
- 테이블 주문 목록 0으로 리셋
- 총 주문액 0으로 리셋
- 세션 상태 'completed'
- Order.is_archived = true

---

### 5.2 Order History Query Rules

**Default Date Range**: 최근 7일 (Q8)

**Date Range Validation**:
```typescript
const validateDateRange = (fromDate: string, toDate: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  // from_date <= to_date
  if (from > to) {
    errors.push({
      field: 'date_range',
      message: '시작일은 종료일보다 이전이어야 합니다'
    });
  }
  
  // Max range: 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  if (from < sixMonthsAgo) {
    errors.push({
      field: 'from_date',
      message: '조회 기간은 최대 6개월입니다'
    });
  }
  
  return errors;
};
```

---

## 6. Dashboard Rules

### 6.1 Table Card Display Rules (Q4: Standard)

**Display Limit**: 최신 주문 3개

**Sorting**: 주문 생성 시간 역순 (최신 순)

**Total Amount Calculation**:
```typescript
const calculateTotalAmount = (orders: Order[]): number => {
  return orders.reduce((sum, order) => sum + order.total_amount, 0);
};
```

---

### 6.2 SSE Connection Rules (Q3: Auto-reconnect)

**Reconnection Strategy**: Exponential Backoff

**Backoff Formula**: `delay = min(1000 * 2^attempts, 30000)`

**Max Delay**: 30 seconds

**Reconnection Attempts**: Unlimited (계속 재시도)

**Connection State**:
- connected: 정상 연결
- disconnected: 연결 끊김
- reconnecting: 재연결 시도 중

---

### 6.3 Periodic Sync Rules (Q10: Periodic Refresh)

**Sync Interval**: 5분 (300,000ms)

**Sync Trigger**: 
- 자동: 5분마다
- 수동: 새로고침 버튼 클릭

**Sync Behavior**:
- 전체 대시보드 데이터 재조회
- 기존 데이터 완전 교체
- lastSyncTime 업데이트

---

## 7. Error Handling Rules (Q7: Combination)

### 7.1 Error Classification

**Toast Notifications** (일반 에러):
- 네트워크 에러
- 폼 검증 에러
- 일반 API 에러 (400, 404)
- Duration: 3-5초

**Modal Dialogs** (중요 에러):
- 인증 에러 (401)
- 권한 에러 (403)
- 서버 에러 (500)
- 비즈니스 로직 에러
- User must click "확인" to dismiss

---

### 7.2 Error Message Rules

**User-Friendly Messages**:
```typescript
const errorMessages: Record<number, string> = {
  400: '잘못된 요청입니다. 입력 내용을 확인해주세요.',
  401: '인증이 만료되었습니다. 다시 로그인해주세요.',
  403: '이 작업을 수행할 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  500: '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  503: '서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'
};
```

---

## 8. Notification Rules (Q14: Visual + Sound)

### 8.1 Visual Notification Rules

**Trigger**: SSE OrderCreatedEvent 수신

**Effect**:
- 테이블 카드 배경색 변경 (노란색 하이라이트)
- 애니메이션 효과 (펄스 또는 바운스)
- Duration: 3초

**CSS Class**: `highlight-new-order`

---

### 8.2 Sound Notification Rules

**Trigger**: SSE OrderCreatedEvent 수신

**Audio File**: `/sounds/notification.mp3`

**Volume**: 50% (0.5)

**Fallback**: 소리 재생 실패 시 무시 (에러 표시 안 함)

**User Preference** (선택적):
- 설정에서 알림 소리 on/off
- localStorage key: 'notification_sound_enabled'
- Default: true

---

## 9. Confirmation Dialog Rules (Q11: Custom Modal)

### 9.1 Confirmation Required Actions

**Actions Requiring Confirmation**:
1. 주문 상태 변경
2. 주문 삭제
3. 테이블 세션 종료
4. 메뉴 삭제
5. 카테고리 삭제

---

### 9.2 Confirmation Modal Structure

**Components**:
- Title: 작업 이름
- Message: 확인 메시지
- Buttons: "취소" (왼쪽), "확인" (오른쪽)

**Button Colors**:
- 취소: Gray
- 확인: Red (삭제 작업), Blue (기타 작업)

**Keyboard Support**:
- ESC: 취소
- Enter: 확인

---

## 10. Form Validation Rules

### 10.1 Client-Side Validation

**Validation Timing**:
- onBlur: 필드 벗어날 때 검증
- onSubmit: 폼 제출 시 전체 검증

**Error Display**:
- Inline: 필드 아래 빨간색 텍스트
- Summary: 폼 상단에 모든 에러 요약 (선택적)

---

### 10.2 Validation Error Format

```typescript
interface ValidationError {
  field: string;
  message: string;
}

interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
```

**Error Display Example**:
```tsx
{errors.menu_name && (
  <ErrorText>{errors.menu_name}</ErrorText>
)}
```

---

## 11. Data Consistency Rules

### 11.1 Optimistic Update Rules

**When to Use**:
- 주문 상태 변경 (SSE 이벤트로 확인)
- 주문 삭제 (로컬 상태 즉시 업데이트)

**Rollback Strategy**:
- API 호출 실패 시 이전 상태로 복원
- 에러 메시지 표시

---

### 11.2 Data Synchronization Rules

**SSE + Periodic Sync** (Q2: Hybrid):
- SSE: 실시간 이벤트 (OrderCreated, OrderStatusChanged)
- Periodic: 5분마다 전체 동기화
- Manual: 새로고침 버튼

**Conflict Resolution**:
- Periodic sync가 SSE 이벤트보다 우선 (최신 데이터로 덮어쓰기)

---

## 12. UI State Rules

### 12.1 Loading State Rules

**Show Loading Indicator**:
- 초기 데이터 로드 (대시보드, 메뉴 목록)
- API 호출 중 (주문 상태 변경, 메뉴 등록 등)

**Loading Indicator Type**:
- Full Page: 초기 로드
- Button: 버튼 클릭 액션 (버튼 비활성화 + 스피너)
- Inline: 부분 데이터 로드

---

### 12.2 Empty State Rules

**Empty State Display**:
- 테이블에 주문 없음: "주문이 없습니다"
- 메뉴 목록 없음: "등록된 메뉴가 없습니다"
- 과거 내역 없음: "조회된 주문 내역이 없습니다"

**Empty State Action**:
- 메뉴 목록: "메뉴 등록" 버튼 표시
- 기타: 안내 메시지만 표시

---

## 13. Navigation Rules

### 13.1 Protected Routes

**Authentication Required**:
- /dashboard
- /menu
- /menu/categories
- /settings (선택적)

**Redirect Rule**:
- 토큰 없으면 → /login
- 토큰 있으면 → 요청한 페이지

---

### 13.2 Default Route

**After Login**: /dashboard

**Root Path** (/): 
- 토큰 있으면 → /dashboard
- 토큰 없으면 → /login

---

## 14. Concurrency Control Rules

**Note**: Backend에 Optimistic Locking 미구현 (Phase 2로 연기)

**Current Behavior**: Last-Write-Wins
- 두 관리자가 동시에 같은 주문 상태 변경 시 마지막 요청이 적용됨
- 충돌 감지 없음

**Phase 2 개선 사항**:
- Order.version 필드 추가
- 409 Conflict 에러 처리
- Frontend에서 충돌 알림 및 새로고침

---

## 15. Data Archiving Rules

**Note**: Backend에 Order Archiving 미구현 (Phase 2로 연기)

**Current Behavior**: 세션 종료 후 주문 데이터 처리 방식 불명확 (Backend 로직 확인 필요)

**Phase 2 개선 사항**:
- Order.is_archived 필드 추가
- 세션 종료 시 자동 아카이빙
- OrderHistory에 order_ids 참조 저장
const archivedOrders = orders.filter(o => o.is_archived);
```

**Rationale**: 
- 과거 주문 상세 조회 가능
- 데이터 중복 최소화
- 메뉴 삭제 후에도 과거 주문 조회 가능 (OrderItem.menu_id nullable)

---

## Summary

### Validation Rules (5)
1. Login Validation
2. Menu Validation
3. Category Validation
4. Image Upload Validation
5. Date Range Validation

### Business Rules (10)
1. Order Status Transition (State Machine)
2. Menu Deletion Constraints (Frontend pre-check + Backend validation)
3. Category Deletion Constraints (Frontend pre-check + Backend validation)
4. Session Completion Rules (미전달 주문 경고)
5. Table Card Display Rules
6. SSE Reconnection Rules
7. Periodic Sync Rules
8. Confirmation Dialog Rules
9. Optimistic Locking (Order version)
10. Data Archiving (Order.is_archived)

### Error Handling Rules (2)
1. Error Classification (Toast vs Modal)
2. Error Message Mapping

### UI Rules (4)
1. Notification Rules (Visual + Sound)
2. Loading State Rules
3. Empty State Rules
4. Navigation Rules

### Total Rules: 21 categories (기존 19 + 신규 2)

---

**All business rules are defined and ready for implementation.**
