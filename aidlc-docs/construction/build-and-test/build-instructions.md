# Build Instructions - Unit 4: SuperAdmin Frontend

## Prerequisites

- **Node.js**: 18.x 이상
- **npm**: 9.x 이상 (또는 pnpm, yarn)
- **OS**: Windows, macOS, Linux

## Build Steps

### 1. 프로젝트 디렉토리 이동

```bash
cd table-order-superadmin-ui
```

### 2. 의존성 설치

```bash
npm install
```

**설치되는 주요 패키지:**
- react, react-dom (18.x)
- react-router-dom (6.x)
- @tanstack/react-query (5.x)
- axios (1.x)
- zustand (4.x)
- tailwindcss (3.x)

### 3. 환경변수 설정

```bash
# .env.development 파일이 이미 생성되어 있음
# 필요시 수정:
cat .env.development
```

**환경변수:**
| 변수 | 값 | 설명 |
|------|-----|------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Backend API URL |
| `VITE_USE_MOCK_API` | `true` | Mock API 사용 여부 |

### 4. 개발 서버 실행

```bash
npm run dev
```

**예상 출력:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 5. 프로덕션 빌드

```bash
npm run build
```

**빌드 결과물:**
- `dist/` 디렉토리에 정적 파일 생성
- `dist/index.html` - 진입점
- `dist/assets/` - JS, CSS 번들

### 6. 빌드 미리보기

```bash
npm run preview
```

## Troubleshooting

### 의존성 설치 실패

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### TypeScript 컴파일 에러

```bash
# 타입 체크만 실행
npx tsc --noEmit
```

### Tailwind CSS 적용 안됨

```bash
# PostCSS 설정 확인
cat postcss.config.js
cat tailwind.config.js
```
