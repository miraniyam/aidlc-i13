from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models import Admin, Store
from src.core.security import hash_password
from fastapi import HTTPException, status

class ManageAdminService:
    @staticmethod
    async def create_admin(username: str, password: str, role: str, db: AsyncSession, store_id: str = None):
        result = await db.execute(select(Admin).where(Admin.username == username))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="USERNAME_ALREADY_EXISTS")
        
        if role == "store_admin" and not store_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="STORE_ID_REQUIRED")
        
        admin = Admin(
            username=username,
            password_hash=hash_password(password),
            role=role,
            store_id=store_id,
            is_active=True
        )
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        return admin
    
    @staticmethod
    async def get_all_admins(db: AsyncSession):
        result = await db.execute(select(Admin).order_by(Admin.created_at.desc()))
        return result.scalars().all()
    
    @staticmethod
    async def activate_admin(admin_id: int, db: AsyncSession):
        result = await db.execute(select(Admin).where(Admin.id == admin_id))
        admin = result.scalar_one_or_none()
        if not admin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ADMIN_NOT_FOUND")
        admin.is_active = True
        await db.commit()
        await db.refresh(admin)
        return admin
    
    @staticmethod
    async def deactivate_admin(admin_id: int, db: AsyncSession):
        result = await db.execute(select(Admin).where(Admin.id == admin_id))
        admin = result.scalar_one_or_none()
        if not admin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ADMIN_NOT_FOUND")
        admin.is_active = False
        await db.commit()
        await db.refresh(admin)
        return admin
