# 관리자 계정 생성 가이드

## 방법 1: Python 스크립트 (권장)

### 1. 스크립트 실행
```bash
python create_admin.py
```

### 2. 생성되는 계정
- **Store Admin**
  - Username: `admin`
  - Password: `admin123`
  - Role: `store_admin`
  - Store ID: `store-001`

- **Super Admin** (선택 사항)
  - Username: `superadmin`
  - Password: `super123`
  - Role: `super_admin`

### 3. Admin Frontend 로그인
```
URL: http://localhost:3001/login
Username: admin
Password: admin123
```

---

## 방법 2: API 호출

### SuperAdmin API로 Admin 생성

```bash
# 1. SuperAdmin 로그인 (먼저 SuperAdmin 계정 필요)
curl -X POST http://localhost:8000/api/superadmin/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=superadmin&password=super123"

# 2. Store Admin 생성
curl -X POST http://localhost:8000/api/superadmin/admins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "role": "store_admin",
    "store_id": "store-001"
  }'
```

---

## 방법 3: 데이터베이스 직접 삽입

```sql
-- PostgreSQL에서 직접 실행
INSERT INTO admins (username, password_hash, role, store_id, is_active, created_at, updated_at)
VALUES (
  'admin',
  '$2b$12$...',  -- bcrypt 해시 필요
  'store_admin',
  'store-001',
  true,
  NOW(),
  NOW()
);
```

**주의**: 비밀번호는 bcrypt로 해시해야 합니다.

---

## 비밀번호 변경

관리자 비밀번호를 변경하려면 `create_admin.py` 스크립트를 수정하거나 새 스크립트를 만드세요:

```python
from src.core.security import hash_password

# 비밀번호 해시 생성
hashed = hash_password("new_password")
print(hashed)
```

---

## 테스트 계정 (개발용)

개발 환경에서는 다음 계정을 사용하세요:

| Username | Password | Role | Store ID |
|----------|----------|------|----------|
| admin | admin123 | store_admin | store-001 |
| superadmin | super123 | super_admin | - |

**⚠️ 프로덕션 환경에서는 반드시 강력한 비밀번호로 변경하세요!**
