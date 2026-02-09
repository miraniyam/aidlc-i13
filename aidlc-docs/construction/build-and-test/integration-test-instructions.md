# Integration Test Instructions - Unit 4: SuperAdmin Frontend

## 현재 상태

Unit 4는 현재 **Mock API**를 사용하므로, Backend (Unit 1)와의 실제 통합 테스트는 Unit 1 완료 후 진행합니다.

## Mock API 통합 테스트

현재 Mock API와의 통합이 정상 동작하는지 확인합니다.

### 테스트 시나리오

#### Scenario 1: 인증 플로우

1. **Setup**: 개발 서버 실행 (`npm run dev`)
2. **Test Steps**:
   - 로그인 페이지 접속
   - Mock 계정으로 로그인 (`superadmin` / `super123`)
   - JWT 토큰이 localStorage에 저장되는지 확인
   - 보호된 페이지 접근 가능 확인
3. **Expected**: 로그인 성공, 토큰 저장, 페이지 접근 가능
4. **Verification**:
   ```javascript
   // 브라우저 콘솔에서 확인
   localStorage.getItem('token')  // 'mock-jwt-token'
   localStorage.getItem('user')   // '{"id":"super-1",...}'
   ```

#### Scenario 2: 관리자 CRUD 플로우

1. **Setup**: 로그인 완료 상태
2. **Test Steps**:
   - 관리자 목록 조회 (GET)
   - 새 관리자 생성 (POST)
   - 목록에 추가 확인
   - 상태 변경 (PATCH)
3. **Expected**: 모든 CRUD 작업 성공, UI 즉시 반영
4. **Verification**: React Query DevTools로 캐시 상태 확인

## 향후 Backend 통합 테스트

Unit 1 (Backend) 완료 후 진행할 테스트:

### 환경 설정

```bash
# .env.development 수정
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000/api
```

### 테스트 시나리오

#### Scenario 1: SuperAdmin → Backend 인증

- **Endpoint**: `POST /api/superadmin/login`
- **Request**: `{ "username": "...", "password": "..." }`
- **Expected Response**: `{ "access_token": "...", "user": {...} }`

#### Scenario 2: SuperAdmin → Backend 관리자 조회

- **Endpoint**: `GET /api/superadmin/admins`
- **Headers**: `Authorization: Bearer {token}`
- **Expected Response**: `{ "admins": [...] }`

#### Scenario 3: SuperAdmin → Backend 관리자 생성

- **Endpoint**: `POST /api/superadmin/admins`
- **Request**: `{ "store_id": "...", "username": "...", "password": "..." }`
- **Expected Response**: `{ "admin": {...} }`

#### Scenario 4: SuperAdmin → Backend 상태 변경

- **Endpoint**: `PATCH /api/superadmin/admins/{id}/activate`
- **Endpoint**: `PATCH /api/superadmin/admins/{id}/deactivate`
- **Expected Response**: `{ "admin": {...} }`

## 통합 테스트 실행 체크리스트

- [ ] Backend 서버 실행 확인
- [ ] 환경변수 `VITE_USE_MOCK_API=false` 설정
- [ ] Frontend 개발 서버 재시작
- [ ] 모든 API 엔드포인트 동작 확인
- [ ] 에러 처리 확인 (401, 404, 500)
