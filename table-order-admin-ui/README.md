# Admin Frontend (table-order-admin-ui)

관리자용 웹 애플리케이션 - 주문 관리, 메뉴 관리, 테이블 세션 관리

## 기술 스택

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Testing**: Vitest + React Testing Library
- **Security**: DOMPurify (XSS 방지)
- **Real-time**: Server-Sent Events (SSE)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.development` 파일이 이미 생성되어 있습니다:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_SSE_URL=http://localhost:8000/api/admin/sse
```

### 3. 개발 서버 실행

```bash
npm run dev
```

애플리케이션은 `http://localhost:3001`에서 실행됩니다.

### 4. 빌드

```bash
npm run build
```

### 5. 테스트

```bash
npm test
```

## 프로젝트 구조

```
src/
├── api/              # API 클라이언트 (Axios)
│   ├── client.ts
│   ├── auth.api.ts
│   ├── order.api.ts
│   ├── table.api.ts
│   └── menu.api.ts
├── stores/           # Zustand 상태 관리
│   ├── authStore.ts
│   └── uiStore.ts
├── services/         # 비즈니스 로직
│   └── sseManager.ts
├── utils/            # 유틸리티
│   ├── sanitizer.ts
│   ├── rateLimiter.ts
│   ├── tokenStorage.ts
│   ├── imagePreview.ts
│   └── dateFormatter.ts
├── components/       # React 컴포넌트
│   ├── pages/
│   ├── layout/
│   └── common/
├── types/            # TypeScript 타입
│   └── index.ts
└── test-utils/       # 테스트 유틸리티
    └── setup.ts
```

## 주요 기능

- ✅ 관리자 로그인 (JWT)
- ✅ 실시간 주문 알림 (SSE)
- ✅ 주문 상태 관리
- ✅ 메뉴 CRUD (이미지 업로드 포함)
- ✅ 테이블 세션 종료
- ✅ 주문 내역 조회
- ✅ XSS 방지 (Input Sanitization)
- ✅ Rate Limiting (Token Bucket)

## 테스트 커버리지

- **API Client Layer**: 9 tests
- **State Management Layer**: 7 tests
- **Security Layer**: 8 tests
- **Utility Layer**: 4 tests
- **Real-time Communication**: 1 test
- **Total**: 29 tests ✅

## API 엔드포인트

### 인증
- `POST /api/admin/auth/login` - 로그인

### 주문
- `GET /api/admin/orders?table_id={tableId}` - 테이블별 주문 조회
- `PATCH /api/admin/orders/{orderId}/status` - 주문 상태 변경

### 테이블
- `POST /api/admin/tables/{tableId}/complete-session` - 세션 종료
- `GET /api/admin/tables/{tableId}/order-history` - 주문 내역 조회

### 메뉴
- `POST /api/admin/menus` - 메뉴 생성 (FormData)
- `PATCH /api/admin/menus/{menuId}` - 메뉴 수정
- `DELETE /api/admin/menus/{menuId}` - 메뉴 삭제

### 실시간
- `GET /api/admin/sse` - SSE 연결

## 보안

- JWT 토큰 기반 인증
- XSS 방지 (DOMPurify)
- Rate Limiting (Token Bucket 알고리즘)
- HTTPS 권장 (프로덕션)

## 라이선스

MIT
