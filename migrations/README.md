# Database Migrations

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure database URL in `.env`:
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/tableorder
```

3. Update `alembic.ini` with your database URL (or use environment variable)

## Running Migrations

### Create a new migration
```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback migrations
```bash
alembic downgrade -1
```

### View migration history
```bash
alembic history
```

## Initial Schema

The initial migration creates all tables for the TableOrder service:
- stores
- admins
- tables
- table_sessions
- menu_categories
- menus
- orders
- order_items
- order_histories
- order_history_items

All relationships, constraints, and indexes are included.
