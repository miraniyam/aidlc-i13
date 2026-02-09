import pytest
from src.models import Store, Admin, Table, Menu, MenuCategory

@pytest.mark.asyncio
async def test_create_store(db_session):
    store = Store(name="Test Store")
    db_session.add(store)
    await db_session.commit()
    await db_session.refresh(store)
    assert store.id is not None
    assert store.name == "Test Store"

@pytest.mark.asyncio
async def test_create_admin(db_session):
    store = Store(name="Test Store")
    db_session.add(store)
    await db_session.commit()
    
    admin = Admin(username="admin1", password_hash="hashed", role="store_admin", store_id=store.id)
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    assert admin.id is not None
    assert admin.username == "admin1"
