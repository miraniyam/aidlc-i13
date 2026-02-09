# NFR Requirements - Unit 2: Customer Frontend

## Overview

Unit 2 (Customer Frontend)의 비기능 요구사항(Non-Functional Requirements)을 정의합니다. 이 문서는 성능, 확장성, 가용성, 보안, 사용성, 신뢰성, 유지보수성 측면의 요구사항을 포함합니다.

---

## 1. Performance Requirements

### 1.1 Response Time

**Requirement**: 빠른 응답 시간 제공

**Metrics**:
- **UI Interactions**: < 200ms
  - 버튼 클릭, 탭 전환, 모달 열기/닫기
  - 장바구니 추가/삭제, 수량 조절
- **API Calls**: < 1초
  - 메뉴 조회, 주문 생성, 주문 내역 조회
  - 로그인 요청

**Rationale**: 태블릿 환경에서 고객이 빠르게 메뉴를 탐색하고 주문할 수 있어야 함

**Implementation**:
- React의 가상 DOM 최적화 활용
- React Query 캐싱으로 API 응답 시간 단축
- Debouncing/Throttling 적용 (필요 시)

---

### 1.2 Initial Load Time

**Requirement**: 빠른 초기 로딩

**Metrics**:
- **First Contentful Paint (FCP)**: < 1.5초
- **Time to Interactive (TTI)**: < 2초
- **Total Load Time**: < 2초

**Rationale**: 고객이 태블릿을 켰을 때 빠르게 메뉴를 볼 수 있어야 함

**Implementation**:
- Vite의 빠른 빌드 및 HMR 활용
- Code splitting (React.lazy)
- Tree shaking으로 불필요한 코드 제거
- Critical CSS 인라인화

---

### 1.3 Image Loading

**Requirement**: 효율적인 이미지 로딩

**Strategy**: Lazy loading (화면에 보일 때만 로드)

**Implementation**:
```typescript
<img 
  src={menu.imageUrl} 
  alt={menu.menuName} 
  loading="lazy"
  onError={() => setImageError(true)}
/>
```

**Features**:
- Native lazy loading (`loading="lazy"`)
- Placeholder 이미지 (로드 실패 시)
- 이미지 최적화 (WebP 포맷 권장)

**Rationale**: 메뉴 이미지가 많을 경우 초기 로딩 시간을 단축하고 네트워크 대역폭 절약

---

### 1.4 Bundle Size

**Requirement**: 작은 번들 크기

**Target**: < 200KB (gzipped)

**Breakdown**:
- **Vendor bundle**: < 150KB (React, React Router, Zustand, React Query, Axios)
- **Application bundle**: < 50KB (컴포넌트, 페이지, 로직)

**Implementation**:
- Vite의 자동 code splitting
- Tree shaking 활성화
- Dynamic imports for routes
- 불필요한 라이브러리 제거

**Monitoring**:
```bash
npm run build
# Check dist/ folder size
```

---

## 2. Scalability Requirements

### 2.1 Concurrent Users

**Requirement**: 태블릿 당 단일 사용자

**Metrics**:
- **Users per Tablet**: 1명
- **Concurrent Sessions**: 태블릿 수와 동일

**Rationale**: 각 테이블에 1개의 태블릿, 1개의 세션

**Implementation**:
- 세션 기반 인증 (테이블 ID + 비밀번호)
- localStorage에 토큰 저장 (브라우저 새로고침 시에도 유지)

---

### 2.2 Expected Scale

**Requirement**: 소규모 매장 지원

**Metrics**:
- **Tablets**: 1-10대
- **Menu Items**: 1-50개
- **Orders per Day**: ~100-500개

**Rationale**: MVP는 소규모 매장을 타겟으로 함

**Implementation**:
- 클라이언트 측 캐싱으로 서버 부하 감소
- React Query 캐싱 (5분)
- 폴링 간격 최적화 (30초)

---

## 3. Availability Requirements

### 3.1 Uptime

**Requirement**: 99% 가용성

**Metrics**:
- **Uptime**: 99% (연간 3.65일 다운타임 허용)
- **Planned Maintenance**: 월 1회, 새벽 시간대

**Rationale**: 영업 시간 중 서비스 중단 최소화

**Implementation**:
- 프론트엔드는 정적 파일이므로 CDN 활용 시 높은 가용성 확보
- Backend API 가용성에 의존

---

### 3.2 Offline Support

**Requirement**: 오프라인 감지 및 안내

**Strategy**: 오프라인 감지만 (에러 메시지 표시)

**Implementation**:
```typescript
// In App.tsx
useEffect(() => {
  const handleOffline = () => {
    toast.error('네트워크 연결이 끊어졌습니다');
  };

  const handleOnline = () => {
    toast.success('네트워크 연결이 복구되었습니다');
  };

  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);

  return () => {
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('online', handleOnline);
  };
}, []);
```

**Rationale**: 완전한 오프라인 지원은 MVP 범위를 벗어남. 네트워크 연결 필요성 안내만 제공

---

### 3.3 Error Recovery

**Requirement**: 수동 재시도 지원

**Strategy**: 사용자가 "다시 시도" 버튼 클릭

**Implementation**:
```typescript
// In ErrorMessage component
<div className="error-container">
  <p>{error.message}</p>
  <button onClick={() => refetch()}>다시 시도</button>
</div>
```

**Features**:
- Toast notification with retry button
- Inline error message with retry button
- React Query의 refetch 활용

**Rationale**: 자동 재시도는 불필요한 서버 부하를 유발할 수 있음. 사용자가 명시적으로 재시도하도록 함

---

## 4. Security Requirements

### 4.1 Authentication

**Requirement**: JWT 기반 인증

**Method**: JWT (Bearer token)

**Flow**:
1. 사용자가 테이블 ID + 비밀번호 입력
2. Backend에서 JWT 토큰 발급 (16시간 유효)
3. 프론트엔드에서 localStorage에 저장
4. 모든 API 요청에 Authorization 헤더 추가

**Implementation**:
```typescript
// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### 4.2 Token Storage

**Requirement**: localStorage에 토큰 저장

**Storage**: localStorage

**Rationale**:
- 브라우저 새로고침 시에도 로그인 상태 유지
- 태블릿 환경에서 XSS 공격 위험 낮음
- HttpOnly Cookie는 SSR 없이 사용 불가

**Security Measures**:
- 토큰 만료 시간 검증 (클라이언트 측)
- 401 응답 시 자동 로그아웃
- HTTPS 사용 (프로덕션 환경)

---

### 4.3 XSS Protection

**Requirement**: React 기본 XSS 방어 사용

**Strategy**: React의 기본 XSS 방어만 사용

**Features**:
- React는 기본적으로 모든 값을 escape 처리
- `dangerouslySetInnerHTML` 사용 금지
- 사용자 입력 검증 (클라이언트 + 서버)

**Rationale**: 태블릿 환경에서 사용자 입력이 제한적이므로 React의 기본 방어로 충분

---

### 4.4 HTTPS

**Requirement**: 프로덕션 환경에서 HTTPS 필수

**Environments**:
- **Development**: HTTP 허용 (localhost)
- **Production**: HTTPS 필수

**Implementation**:
- CDN/Load Balancer에서 SSL/TLS 인증서 설정
- HTTP → HTTPS 자동 리다이렉트

**Rationale**: JWT 토큰 및 사용자 데이터 보호

---

## 5. Usability Requirements

### 5.1 Target Device

**Requirement**: 태블릿 전용 (10-13인치)

**Target Devices**:
- iPad (10.2", 10.9", 12.9")
- Samsung Galaxy Tab
- 기타 Android 태블릿

**Screen Resolutions**:
- 1024x768 (최소)
- 1920x1080 (권장)
- 2732x2048 (최대)

**Implementation**:
- Tailwind CSS의 반응형 breakpoints 활용
- 태블릿 화면 크기에 최적화된 레이아웃

---

### 5.2 Touch Optimization

**Requirement**: 기본 터치 최적화

**Standards**:
- **Minimum Touch Target**: 44x44px (Apple HIG, Material Design)
- **Spacing**: 최소 8px 간격

**Implementation**:
```css
/* Tailwind CSS classes */
.btn {
  @apply px-4 py-2; /* 최소 44x44px 확보 */
}

.menu-item {
  @apply p-4; /* 충분한 터치 영역 */
}
```

**Features**:
- 큰 버튼 크기
- 충분한 간격
- 시각적 피드백 (hover, active states)

---

### 5.3 Accessibility

**Requirement**: 기본 접근성 지원

**Standards**: 기본 접근성 (ARIA labels, 색상 대비)

**Implementation**:
- ARIA labels for interactive elements
- 충분한 색상 대비 (WCAG AA 권장)
- 키보드 네비게이션 지원

**Example**:
```typescript
<button aria-label="장바구니에 추가">
  <CartIcon />
</button>
```

**Rationale**: 태블릿 환경에서 스크린 리더 사용은 드물지만 기본적인 접근성은 제공

---

### 5.4 Internationalization

**Requirement**: 한국어만 지원

**Languages**: 한국어 (ko-KR)

**Rationale**: MVP는 한국 시장만 타겟

**Future Consideration**: i18n 라이브러리 (react-i18next) 추가 시 다국어 지원 가능

---

## 6. Reliability Requirements

### 6.1 Error Logging

**Requirement**: 콘솔 로깅만

**Strategy**: 브라우저 콘솔에 에러 로그 출력

**Implementation**:
```typescript
// In API client
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

**Rationale**: MVP 단계에서는 중앙 집중식 로깅 불필요. 개발자 도구로 디버깅 가능

**Future Consideration**: Sentry, LogRocket 등 추가 가능

---

### 6.2 Monitoring & Analytics

**Requirement**: 모니터링 불필요

**Strategy**: MVP 단계에서는 모니터링 도구 미사용

**Rationale**: 소규모 매장에서는 서버 측 로그로 충분

**Future Consideration**: Google Analytics, Mixpanel 등 추가 가능

---

## 7. Maintainability Requirements

### 7.1 Code Quality

**Requirement**: 표준 코드 품질 기준

**Tools**:
- **ESLint**: recommended 규칙
- **Prettier**: 코드 포맷팅
- **TypeScript**: 타입 안정성

**Configuration**:
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ]
}
```

**Rationale**: 일관된 코드 스타일 유지, 버그 조기 발견

---

### 7.2 Testing

**Requirement**: 최소 테스트 (Unit tests만)

**Strategy**: Unit tests for critical logic

**Scope**:
- **Cart Store**: 장바구니 로직 (add, remove, update, clear)
- **Utility Functions**: tokenUtils, validation logic
- **API Clients**: Mock API 응답 테스트

**Tools**:
- **Vitest**: 빠른 unit test runner
- **React Testing Library**: 컴포넌트 테스트

**Rationale**: MVP 단계에서는 핵심 로직만 테스트. E2E 테스트는 향후 추가

---

### 7.3 Documentation

**Requirement**: 표준 문서화

**Documents**:
- **README.md**: 프로젝트 개요, 설치 방법, 실행 방법
- **API Documentation**: API 엔드포인트 및 타입 정의 (types/api.ts)

**Content**:
- 프로젝트 구조
- 개발 환경 설정
- 빌드 및 배포 방법
- 주요 컴포넌트 설명

**Rationale**: 팀원이 프로젝트를 이해하고 기여할 수 있도록 기본 문서 제공

---

## 8. Summary

### Performance
- **Response Time**: < 200ms (UI), < 1s (API)
- **Initial Load**: < 2초
- **Image Loading**: Lazy loading
- **Bundle Size**: < 200KB gzipped

### Scalability
- **Users**: 1명/태블릿
- **Tablets**: 1-10대
- **Menu Items**: 1-50개

### Availability
- **Uptime**: 99%
- **Offline**: 감지 및 안내만
- **Error Recovery**: 수동 재시도

### Security
- **Authentication**: JWT (Bearer token)
- **Token Storage**: localStorage
- **XSS Protection**: React 기본 방어
- **HTTPS**: 프로덕션 필수

### Usability
- **Target Device**: 태블릿 (10-13인치)
- **Touch**: 44x44px 최소
- **Accessibility**: 기본 지원
- **i18n**: 한국어만

### Reliability
- **Error Logging**: 콘솔만
- **Monitoring**: 불필요

### Maintainability
- **Code Quality**: ESLint + Prettier
- **Testing**: Unit tests만
- **Documentation**: README + API docs

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-09  
**Status**: Draft
