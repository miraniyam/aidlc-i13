from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from src.core.database import get_db
from src.core.security import require_role
from src.services.manage_admin_service import ManageAdminService

router = APIRouter(prefix="/api/superadmin/admins", tags=["superadmin-admins"])

class CreateAdminRequest(BaseModel):
    username: str
    password: str
    role: str
    store_id: str = None

@router.post("")
async def create_admin(request: CreateAdminRequest, db: AsyncSession = Depends(get_db), 
                      user: dict = Depends(require_role("super_admin"))):
    return await ManageAdminService.create_admin(request.username, request.password, request.role, db, request.store_id)

@router.get("")
async def get_admins(db: AsyncSession = Depends(get_db), user: dict = Depends(require_role("super_admin"))):
    return await ManageAdminService.get_all_admins(db)

@router.patch("/{admin_id}/activate")
async def activate_admin(admin_id: int, db: AsyncSession = Depends(get_db), 
                        user: dict = Depends(require_role("super_admin"))):
    return await ManageAdminService.activate_admin(admin_id, db)

@router.patch("/{admin_id}/deactivate")
async def deactivate_admin(admin_id: int, db: AsyncSession = Depends(get_db), 
                          user: dict = Depends(require_role("super_admin"))):
    return await ManageAdminService.deactivate_admin(admin_id, db)
