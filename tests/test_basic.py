import pytest
from src.models import Store, Admin, Menu, Order
from src.core.security import hash_password, verify_password, create_jwt_token, decode_jwt_token

def test_password_hashing():
    """Test password hashing and verification"""
    password = "test123"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrong", hashed)

def test_jwt_token():
    """Test JWT token creation and decoding"""
    payload = {"user_id": 123, "role": "admin"}
    token = create_jwt_token(payload)
    assert token is not None
    decoded = decode_jwt_token(token)
    assert decoded["user_id"] == 123
    assert decoded["role"] == "admin"

def test_model_attributes():
    """Test model class attributes exist"""
    assert hasattr(Store, '__tablename__')
    assert hasattr(Admin, '__tablename__')
    assert hasattr(Menu, '__tablename__')
    assert hasattr(Order, '__tablename__')
    assert Store.__tablename__ == 'stores'
    assert Admin.__tablename__ == 'admins'

def test_order_status_enum():
    """Test OrderStatus enum values"""
    from src.models.order import OrderStatus
    assert OrderStatus.PENDING == "pending"
    assert OrderStatus.PREPARING == "preparing"
    assert OrderStatus.READY == "ready"
    assert OrderStatus.SERVED == "served"
    assert OrderStatus.CANCELLED == "cancelled"

def test_admin_role_enum():
    """Test AdminRole enum values"""
    from src.models.admin import AdminRole
    assert AdminRole.STORE_ADMIN == "store_admin"
    assert AdminRole.SUPER_ADMIN == "super_admin"
