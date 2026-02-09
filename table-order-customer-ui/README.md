# Table Order Customer UI

고객용 테이블오더 프론트엔드 애플리케이션

## 기술 스택

- **React 18+** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **React Router** - 라우팅
- **Zustand** - 클라이언트 상태 관리
- **React Query** - 서버 상태 관리
- **Axios** - HTTP 클라이언트
- **Tailwind CSS** - 스타일링
- **React Hot Toast** - 알림

## 프로젝트 구조

```
table-order-customer-ui/
├── src/
│   ├── api/              # API 클라이언트
│   ├── components/       # React 컴포넌트
│   ├── hooks/            # Custom hooks
│   ├── lib/              # 라이브러리 설정
│   ├── pages/            # 페이지 컴포넌트
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript 타입
│   ├── utils/            # 유틸리티 함수
│   ├── App.tsx           # 앱 루트
│   ├── main.tsx          # 엔트리 포인트
│   └── index.css         # 글로벌 스타일
├── public/               # 정적 파일
├── .env.development      # 개발 환경 변수
├── .env.production       # 프로덕션 환경 변수
└── package.json
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 http://localhost:3000 에서 실행됩니다.

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 4. 프로덕션 미리보기

```bash
npm run preview
```

## 환경 변수

### .env.development
```
VITE_API_BASE_URL=http://localhost:8000
```

### .env.production
```
VITE_API_BASE_URL=https://api.example.com
```

## 주요 기능

### 1. 자동 로그인 (US-C01)
- 테이블 ID + 비밀번호로 로그인
- JWT 토큰 localStorage 저장
- 토큰 만료 시 자동 로그아웃

### 2. 메뉴 탐색 (US-C02, US-C03)
- 카테고리별 메뉴 조회
- 메뉴 상세 정보 모달
- React Query 캐싱 (5분)

### 3. 장바구니 관리 (US-C04~C07)
- Zustand로 상태 관리
- localStorage 영속성
- 수량 조절, 삭제, 비우기

### 4. 주문 생성 (US-C08)
- 클라이언트 측 검증
- 주문 성공 시 장바구니 자동 비우기
- 5초 후 메뉴 화면으로 자동 이동

### 5. 주문 내역 조회 (US-C09, US-C10)
- React Query 폴링 (30초 간격)
- 주문 상태 배지 표시
- 페이지 이탈 시 폴링 자동 중지

## 상태 관리

### Zustand (클라이언트 상태)
- **cartStore**: 장바구니 상태
- **authStore**: 인증 상태

### React Query (서버 상태)
- **useMenus**: 메뉴 조회
- **useOrders**: 주문 내역 조회 (폴링)
- **useCreateOrder**: 주문 생성

## API 통합

### Axios Interceptors
- **Request**: 자동 Authorization 헤더 추가
- **Response**: 401 에러 시 자동 로그아웃

### Mock Types
현재는 Mock 타입을 사용하며, Backend OpenAPI 스키마 준비 시 자동 생성으로 교체 예정:

```bash
npx openapi-typescript ../table-order-backend/openapi.json -o src/types/api.ts
```

## 라우팅

- `/` - 메뉴 페이지로 리다이렉트
- `/login` - 로그인 페이지
- `/menu` - 메뉴 페이지 (보호됨)
- `/cart` - 장바구니 페이지 (보호됨)
- `/orders` - 주문 내역 페이지 (보호됨)

## 스타일링

Tailwind CSS를 사용하며, 다음 커스텀 설정이 적용됨:
- Primary 색상: Blue (sky)
- 터치 친화적 디자인 (최소 44x44px 버튼)
- 반응형 레이아웃

## 개발 가이드

### 새 컴포넌트 추가
1. `src/components/` 에 컴포넌트 파일 생성
2. TypeScript + Tailwind CSS 사용
3. Props 타입 정의

### 새 API 엔드포인트 추가
1. `src/types/api.ts` 에 타입 추가
2. `src/api/` 에 API 함수 추가
3. `src/hooks/` 에 React Query hook 추가

### 새 페이지 추가
1. `src/pages/` 에 페이지 컴포넌트 생성
2. `src/App.tsx` 에 라우트 추가
3. 필요시 ProtectedRoute로 보호

## 주의사항

- Backend API가 준비되지 않은 경우 Mock 데이터로 개발
- 환경 변수는 반드시 `VITE_` 접두사 사용
- localStorage 사용 시 에러 핸들링 필수
- 모든 API 호출은 React Query 사용 권장

## 다음 단계

1. **MenuPage 컴포넌트 완성**: CategoryTabs, MenuList, MenuItem 구현
2. **MenuDetailModal 구현**: 메뉴 상세 정보 표시 및 장바구니 추가
3. **이미지 처리**: Lazy loading + placeholder 구현
4. **에러 바운더리**: 전역 에러 처리 개선
5. **테스트 작성**: 주요 컴포넌트 및 hooks 테스트

## 라이선스

Private
