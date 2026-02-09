from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from src.core.database import get_db
from src.services.authentication_service import AuthenticationService

router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"])

class AdminLoginRequest(BaseModel):
    username: str
    password: str
    store_id: str

@router.post("/login")
async def login(request: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    return await AuthenticationService.authenticate_admin(
        request.username, request.password, request.store_id, db
    )
