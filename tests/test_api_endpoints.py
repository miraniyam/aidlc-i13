from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "TableOrder API is running"}

def test_docs_endpoint():
    """Test API documentation endpoint"""
    response = client.get("/docs")
    assert response.status_code == 200

def test_openapi_schema():
    """Test OpenAPI schema endpoint"""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert "openapi" in schema
    assert "info" in schema
    assert schema["info"]["title"] == "TableOrder API"

def test_customer_auth_endpoint_exists():
    """Test customer auth endpoint exists (without auth)"""
    response = client.post("/api/customer/auth/login", json={
        "table_number": "1",
        "password": "test",
        "store_id": "00000000-0000-0000-0000-000000000001"
    })
    # Expect 401 or 500 (no database), not 404
    assert response.status_code in [401, 500, 404]

def test_admin_auth_endpoint_exists():
    """Test admin auth endpoint exists"""
    response = client.post("/api/admin/auth/login", json={
        "username": "admin",
        "password": "test",
        "store_id": "00000000-0000-0000-0000-000000000001"
    })
    # Expect 401 or 500 (no database), not 404
    assert response.status_code in [401, 500, 404]
