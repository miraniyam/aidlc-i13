# Development Guide

## Setup

1. Clone repository
2. Create virtual environment: `python -m venv .venv`
3. Activate: `source .venv/bin/activate` (Linux/Mac) or `.venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and configure
6. Run migrations: `alembic upgrade head`

## Database Migrations

### Create migration
```bash
alembic revision --autogenerate -m "Description"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback
```bash
alembic downgrade -1
```

## Running Tests

```bash
pytest
pytest -v  # verbose
pytest tests/test_models.py  # specific file
```

## Code Structure

### Models (`src/models/`)
SQLAlchemy ORM models representing database tables.

### Services (`src/services/`)
Business logic layer. Each service handles specific domain operations.

### API (`src/api/`)
FastAPI routers organized by user role (customer, admin, superadmin).

### Infrastructure (`src/infrastructure/`)
Event bus and SSE publisher for real-time notifications.

### Core (`src/core/`)
Configuration, database connection, and security utilities.

## Adding New Features

1. Define model in `src/models/`
2. Create migration: `alembic revision --autogenerate`
3. Implement service in `src/services/`
4. Create API endpoint in `src/api/`
5. Write tests in `tests/`

## Debugging

Run with debugger:
```bash
python -m debugpy --listen 5678 -m uvicorn src.main:app --reload
```

## Production Deployment

1. Set production environment variables
2. Use production-grade ASGI server (e.g., Gunicorn with Uvicorn workers)
3. Configure PostgreSQL connection pooling
4. Set up reverse proxy (Nginx)
5. Enable HTTPS
6. Configure CORS properly
