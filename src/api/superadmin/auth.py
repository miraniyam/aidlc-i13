from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from src.core.database import get_db
from src.services.authentication_service import AuthenticationService

router = APIRouter(prefix="/api/superadmin/auth", tags=["superadmin-auth"])

class SuperAdminLoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(request: SuperAdminLoginRequest, db: AsyncSession = Depends(get_db)):
    return await AuthenticationService.authenticate_super_admin(request.username, request.password, db)
