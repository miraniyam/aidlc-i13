# TableOrder Service

테이블오더 서비스 - 매장 내 테이블 주문 시스템

## 개요

고객이 테이블에서 QR 코드를 스캔하여 메뉴를 조회하고 주문할 수 있는 시스템입니다. 관리자는 실시간으로 주문을 확인하고 상태를 관리할 수 있습니다.

## 기술 스택

- **Backend**: Python 3.11+, FastAPI
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0 (Async)
- **Authentication**: JWT
- **Real-time**: Server-Sent Events (SSE)

## 설치 및 실행

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 수정:

```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/tableorder
JWT_SECRET=your-secret-key-here
```

### 3. 데이터베이스 마이그레이션

```bash
alembic upgrade head
```

### 4. 애플리케이션 실행

```bash
python -m src.main
```

또는:

```bash
uvicorn src.main:app --reload
```

API는 `http://localhost:8000`에서 실행됩니다.

## API 문서

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

자세한 API 문서는 `docs/API.md`를 참조하세요.

## 테스트

```bash
pytest
```

## 프로젝트 구조

```
src/
├── models/          # SQLAlchemy ORM 모델
├── services/        # 비즈니스 로직
├── api/             # FastAPI 라우터
│   ├── customer/    # 고객 API
│   ├── admin/       # 관리자 API
│   └── superadmin/  # 슈퍼 관리자 API
├── infrastructure/  # 이벤트 버스, SSE
├── core/            # 설정, 데이터베이스, 보안
└── main.py          # 애플리케이션 진입점

tests/               # 테스트
migrations/          # Alembic 마이그레이션
uploads/menus/       # 메뉴 이미지
```

## 주요 기능

- 고객 테이블 로그인
- 메뉴 조회 및 주문
- 실시간 주문 알림 (SSE)
- 주문 상태 관리
- 메뉴 관리
- 테이블 세션 관리
- 주문 히스토리 조회
- 관리자 계정 관리

## 개발 가이드

자세한 개발 가이드는 `docs/DEVELOPMENT.md`를 참조하세요.

## 라이선스

MIT
