from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from src.models import Table, TableSession, Admin
from src.core.security import verify_password, create_jwt_token
from fastapi import HTTPException, status

class AuthenticationService:
    @staticmethod
    async def authenticate_table(table_number: str, password: str, store_id: str, db: AsyncSession):
        result = await db.execute(
            select(Table).where(Table.store_id == store_id, Table.table_number == table_number)
        )
        table = result.scalar_one_or_none()
        if not table or not verify_password(password, table.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_CREDENTIALS")
        
        result = await db.execute(
            select(TableSession).where(TableSession.table_id == table.id, TableSession.is_active == True)
        )
        session = result.scalar_one_or_none()
        
        if not session:
            session = TableSession(table_id=table.id, started_at=datetime.utcnow(), is_active=True)
            db.add(session)
            await db.commit()
            await db.refresh(session)
        
        token = create_jwt_token({"table_id": table.id, "session_id": session.id, "role": "table", "store_id": str(store_id)})
        return {"token": token, "session_id": session.id, "table_id": table.id}
    
    @staticmethod
    async def authenticate_admin(username: str, password: str, store_id: str, db: AsyncSession):
        result = await db.execute(
            select(Admin).where(Admin.username == username, Admin.store_id == store_id, Admin.role == "store_admin")
        )
        admin = result.scalar_one_or_none()
        if not admin or not admin.is_active or not verify_password(password, admin.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_CREDENTIALS")
        
        token = create_jwt_token({"admin_id": admin.id, "store_id": str(store_id), "role": "store_admin"})
        return {"token": token, "admin_id": admin.id, "role": "store_admin"}
    
    @staticmethod
    async def authenticate_super_admin(username: str, password: str, db: AsyncSession):
        result = await db.execute(
            select(Admin).where(Admin.username == username, Admin.role == "super_admin")
        )
        admin = result.scalar_one_or_none()
        if not admin or not admin.is_active or not verify_password(password, admin.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_CREDENTIALS")
        
        token = create_jwt_token({"admin_id": admin.id, "role": "super_admin"})
        return {"token": token, "admin_id": admin.id, "role": "super_admin"}
