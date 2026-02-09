# NFR Requirements - Unit 3 (Admin Frontend)

## Overview

Admin Frontend의 비기능 요구사항(Non-Functional Requirements)을 정의합니다. 성능, 확장성, 가용성, 보안, 신뢰성, 사용성 측면의 목표와 제약사항을 명시합니다.

---

## 1. Performance Requirements

### 1.1 Dashboard Loading Performance

**Target**: 2-3초 이내

**Measurement**:
- 대시보드 페이지 진입 시점부터 모든 테이블 카드 렌더링 완료까지
- 초기 API 호출 (GET /api/admin/dashboard) 응답 시간 포함

**Optimization Strategies**:
- React Query 캐싱 활용
- 테이블 카드 lazy rendering (viewport 내 우선)
- 이미지 lazy loading
- 번들 크기 최적화 (code splitting)

**Acceptance Criteria**:
- 테이블 10개: 2초 이내
- 테이블 50개: 3초 이내

---

### 1.2 SSE Connection Latency

**Target**: 1-2초 이내

**Measurement**:
- Backend에서 이벤트 발행 시점부터 Frontend UI 업데이트 완료까지
- 네트워크 지연 + 렌더링 시간 포함

**Optimization Strategies**:
- SSE 이벤트 핸들러 최적화
- React 상태 업데이트 최소화 (불필요한 리렌더링 방지)
- Virtual DOM diffing 최적화

**Acceptance Criteria**:
- 신규 주문 이벤트: 1초 이내 UI 반영
- 주문 상태 변경 이벤트: 1초 이내 UI 반영

---

### 1.3 API Response Time

**Target**: 1-2초 이내

**Measurement**:
- API 요청 전송부터 응답 수신까지
- 주문 상태 변경, 메뉴 CRUD, 세션 종료 등 모든 API 호출

**Optimization Strategies**:
- Axios 인터셉터로 요청 최적화
- React Query로 중복 요청 방지
- Optimistic update로 체감 속도 향상

**Acceptance Criteria**:
- 주문 상태 변경: 1초 이내
- 메뉴 등록/수정: 2초 이내 (이미지 제외)
- 세션 종료: 2초 이내

---

### 1.4 Image Upload Performance

**Target**: 5초 이내

**Measurement**:
- 이미지 파일 선택부터 업로드 완료까지
- 최대 5MB 이미지 기준

**Optimization Strategies**:
- 클라이언트 측 이미지 압축 (선택적)
- 업로드 진행률 표시
- 미리보기 즉시 표시 (Base64)

**Acceptance Criteria**:
- 1MB 이미지: 2초 이내
- 5MB 이미지: 5초 이내

---

## 2. Scalability Requirements

### 2.1 Concurrent Admin Users

**Capacity**: 10명

**Rationale**:
- 요구사항 명시: "동시 접속 관리자 10명"
- 중형 레스토랑 규모 (테이블 10-50개)
- 일반적으로 관리자 2-5명, 피크 시간 10명

**Scalability Considerations**:
- SSE 연결 10개 동시 유지
- React Query 캐시 독립적 관리
- 동시 API 호출 처리

**Testing**:
- 10명 동시 접속 시나리오 테스트
- SSE 연결 안정성 테스트

---

### 2.2 Table/Order Scale

**Capacity**: Medium

**Specifications**:
- 테이블: 20-50개
- 동시 활성 주문: 100-200개
- 테이블당 평균 주문: 2-4개

**Rationale**:
- 요구사항 명시: "테이블 10-50개"
- 중형 레스토랑 규모

**Performance Impact**:
- 대시보드 렌더링: 50개 테이블 카드
- SSE 이벤트 처리: 초당 5-10개 이벤트 (피크 시간)
- 메모리 사용: 약 50-100MB (브라우저)

**Optimization**:
- Virtual scrolling (테이블 50개 이상 시)
- 테이블 카드 최신 3개 주문만 표시
- 주기적 동기화로 메모리 정리

---

### 2.3 SSE Connection Scaling

**Strategy**: Backend 팀 결정 대기

**Rationale**:
- Admin Frontend는 Backend SSE 구현에 의존
- 관리자 10명 수준에서는 Direct 연결도 충분
- Backend 팀이 Redis Pub/Sub 또는 Direct 선택

**Frontend Requirements**:
- SSE 연결 관리 (EventSource API)
- Auto-reconnect with exponential backoff
- 연결 상태 모니터링

**Backend Options** (참고):
- Direct: 각 관리자가 Backend에 직접 연결 (10명 충분)
- Redis Pub/Sub: Backend가 Redis 사용 (확장성, 다중 인스턴스)

---

## 3. Availability Requirements

### 3.1 Uptime Expectation

**Target**: 99% (연간 다운타임 3.65일)

**Rationale**:
- 내부 관리자 도구
- 레스토랑 영업 시간 외 유지보수 가능
- Frontend는 Backend 가용성에 의존

**Downtime Scenarios**:
- 계획된 유지보수: 영업 시간 외
- 긴급 패치: 최소화
- Backend 다운타임: Frontend도 영향

**Monitoring**:
- Backend API 상태 체크
- SSE 연결 상태 모니터링
- 에러 발생률 추적

---

### 3.2 Offline Capability

**Strategy**: Graceful Degradation

**Behavior**:
- 네트워크 끊김 시 에러 메시지 표시
- SSE 자동 재연결 시도 (exponential backoff)
- 사용자에게 네트워크 상태 알림

**No Offline Support**:
- Service Worker 미사용
- 오프라인 데이터 저장 없음
- 실시간 데이터 필수

**Rationale**:
- 관리자는 항상 온라인 환경
- 실시간 주문 모니터링 필수
- 오프라인 지원 불필요

---

## 4. Security Requirements

### 4.1 HTTPS Requirement

**Requirement**: 운영 환경 HTTPS 필수

**Enforcement**:
- 운영 환경: HTTPS only
- 개발 환경: HTTP 허용 (localhost)
- HTTP → HTTPS 자동 리다이렉트

**Certificate**:
- Let's Encrypt 또는 AWS Certificate Manager
- 자동 갱신 설정

---

### 4.2 XSS/CSRF Protection

**Level**: Standard

**XSS Protection**:
- React 기본 XSS 방어 (자동 escaping)
- dangerouslySetInnerHTML 사용 금지
- User input sanitization (메뉴명, 설명 등)
- **DOMPurify 추가**: Rich text 입력 sanitization

**CSRF Protection**:
- Backend CSRF 토큰 사용
- SameSite Cookie 설정 (Backend)
- JWT 토큰 Authorization 헤더 전송

**Content Security Policy**:
- CSP 헤더 설정 (Backend와 협의 필요)
- 권장 정책: `script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;`
- **Note**: Backend 팀과 협의하여 설정

**Rate Limiting** (Frontend):
- API 호출 제한 (초당 10회)
- Axios 인터셉터로 구현
- Brute force 공격 방지

**Implementation**:
```typescript
// DOMPurify for sanitization
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

// Rate limiting
const rateLimiter = {
  requests: [] as number[],
  limit: 10, // per second
  
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < 1000);
    
    if (this.requests.length >= this.limit) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
};

apiClient.interceptors.request.use((config) => {
  if (!rateLimiter.canMakeRequest()) {
    return Promise.reject(new Error('Too many requests'));
  }
  return config;
});
```

---

### 4.3 Sensitive Data Handling

**Strategy**: Plain (평문 저장)

**localStorage Data**:
- admin_token: JWT (서명됨, 평문 저장)
- admin_user: Admin 정보 (평문 저장)
- store_info: Store 정보 (평문 저장)

**Rationale**:
- JWT는 이미 서명되어 변조 방지
- localStorage 암호화는 XSS 공격 시 무의미 (JavaScript로 복호화 가능)
- 브라우저 환경에서 키 관리 어려움
- 실질적 보안 향상 없음

**Alternative Considered**:
- sessionStorage: 탭 닫으면 삭제 (더 안전하지만 UX 저하)
- 선택: localStorage (16시간 세션 유지)

**Security Best Practices**:
- JWT 토큰 만료 시간 16시간
- 401 Unauthorized 시 자동 로그아웃
- XSS 방어로 localStorage 접근 차단

---

## 5. Reliability Requirements

### 5.1 Error Recovery

**Strategy**: Auto Retry (최대 3회)

**Retry Logic**:
```typescript
// React Query retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    },
    mutations: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});
```

**Retry Scenarios**:
- 네트워크 에러 (연결 실패)
- 5xx 서버 에러
- Timeout

**No Retry Scenarios**:
- 4xx 클라이언트 에러 (400, 401, 403, 404)
- 비즈니스 로직 에러

**User Feedback**:
- 재시도 중: Loading indicator
- 재시도 실패: 에러 메시지 (Toast 또는 Modal)

---

### 5.2 Monitoring & Logging

**Level**: Basic

**Client-Side Logging**:
- Console.log (개발 환경)
- Console.error (운영 환경, 에러만)
- 중요 이벤트 로깅 (로그인, 주문 상태 변경 등)

**Backend Logging**:
- API 호출 로그 (Backend)
- 에러 로그 (Backend)
- SSE 연결 로그 (Backend)

**No APM Tool** (MVP 단계):
- Sentry, DataDog 등 미사용
- 개발 비용 절감
- Post-MVP에서 고려

**Error Tracking**:
- Console.error로 에러 확인
- Backend 로그와 연계
- 사용자 피드백 수집

---

## 6. Usability Requirements

### 6.1 Browser Support

**Supported Browsers**: Extended

**Browser Matrix**:
- Chrome: 최신 2개 버전
- Edge: 최신 2개 버전
- Safari: 최신 2개 버전
- Firefox: 최신 2개 버전

**No Support**:
- Internet Explorer 11
- 구형 브라우저

**Testing**:
- Chrome (주요 테스트)
- Safari (macOS 관리자)
- Edge (Windows 관리자)

**Polyfills**:
- Vite 자동 polyfill
- ES6+ 기능 사용 가능

---

### 6.2 Responsive Design

**Support Range**: Desktop + Tablet (768px 이상)

**Breakpoints**:
- Desktop: 1280px 이상 (주요 타겟)
- Tablet: 768px - 1279px (부가 지원)
- Mobile: 미지원 (768px 미만)

**Rationale**:
- 관리자는 주로 데스크톱/태블릿 사용
- 모바일 지원 불필요 (요구사항 없음)
- 개발 비용 절감

**Layout**:
- Desktop: 사이드바 + 메인 콘텐츠
- Tablet: 사이드바 축소 또는 햄버거 메뉴

---

### 6.3 Accessibility (a11y)

**Level**: Basic

**Support**:
- 키보드 네비게이션 (Tab, Enter, Esc)
- 스크린 리더 기본 지원 (ARIA labels)
- Focus 상태 표시
- 색상 대비 (최소 4.5:1)

**No WCAG 2.1 AA Compliance**:
- 내부 관리자 도구
- 접근성 표준 준수 불필요
- 개발 비용 절감

**Best Practices**:
- Semantic HTML 사용
- Button, Input 등 적절한 태그
- Alt text for images
- Form labels

---

## 7. Data Management Requirements

### 7.1 Client-Side Caching

**Strategy**: React Query

**Cache Configuration**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    }
  }
});
```

**Cached Data**:
- 대시보드 데이터 (5분 stale)
- 메뉴 목록 (5분 stale)
- 카테고리 목록 (10분 stale)

**Cache Invalidation**:
- 주문 상태 변경 후: 대시보드 무효화
- 메뉴 등록/수정/삭제 후: 메뉴 목록 무효화
- 세션 종료 후: 대시보드 무효화

---

### 7.2 Local Storage Management

**Stored Data**:
- admin_token: JWT 토큰
- admin_user: Admin 정보
- store_info: Store 정보

**Storage Limit**: 5MB (localStorage 기본 제한)

**Data Cleanup**:
- 로그아웃 시: 모든 데이터 삭제
- 토큰 만료 시: 모든 데이터 삭제

---

## 8. Deployment Requirements

### 8.1 Build Configuration

**Build Tool**: Vite

**Build Optimization**:
- Code splitting (React.lazy)
- Tree shaking
- Minification
- Gzip compression

**Bundle Size Target**: < 500KB (gzipped)

---

### 8.2 Environment Configuration

**Environments**:
- Development: localhost
- Production: AWS (S3 + CloudFront or Nginx)

**Environment Variables**:
```
VITE_API_BASE_URL=http://localhost:8000 (dev)
VITE_API_BASE_URL=https://api.example.com (prod)
```

---

## Summary

### Performance Targets
- Dashboard Loading: 2-3초
- SSE Latency: 1-2초
- API Response: 1-2초
- Image Upload: 5초

### Scalability Limits
- Concurrent Admins: 10명
- Tables: 20-50개
- Active Orders: 100-200개

### Availability
- Uptime: 99%
- Offline: Graceful Degradation

### Security
- HTTPS: Required (운영)
- XSS/CSRF: Standard
- Data Storage: Plain (JWT 서명)

### Reliability
- Error Recovery: Auto Retry (3회)
- Monitoring: Basic (Console + Backend)

### Usability
- Browsers: Chrome/Edge/Safari/Firefox (최신 2개)
- Responsive: Desktop + Tablet (768px+)
- Accessibility: Basic (키보드 + 스크린 리더)

---

**All NFR requirements are defined and ready for implementation.**
