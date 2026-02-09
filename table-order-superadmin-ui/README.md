# Table Order - SuperAdmin UI

슈퍼 관리자용 웹 인터페이스입니다.

## 기능

- 슈퍼 관리자 로그인 (US-SA01)
- 매장 관리자 계정 생성 (US-SA02)
- 매장 관리자 계정 조회 (US-SA03)
- 매장 관리자 계정 비활성화 (US-SA04)
- 매장 관리자 계정 활성화 (US-SA05)

## 설치 및 실행

```bash
npm install
npm run dev
```

## 환경변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000/api` |
| `VITE_USE_MOCK_API` | Mock API 사용 여부 | `true` |

## Mock API

현재 Backend가 완료되지 않아 Mock API를 사용합니다.

**Mock 로그인 정보:**
- Username: `superadmin`
- Password: `super123`

## Backend 연동 시

1. `.env.development` 파일에서 `VITE_USE_MOCK_API=false` 설정
2. `VITE_API_BASE_URL`을 실제 Backend URL로 변경

## 기술 스택

- React 18
- TypeScript
- Vite
- React Query
- Zustand
- Tailwind CSS
- Axios
