"""
관리자 계정 생성 스크립트
Usage: python create_admin.py
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from src.models import Admin
from src.core.security import hash_password
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def create_admin():
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Store Admin 생성
        admin = Admin(
            username="admin",
            password_hash=hash_password("admin123"),
            role="store_admin",
            store_id="store-001",
            is_active=True
        )
        session.add(admin)
        
        # Super Admin 생성 (선택 사항)
        superadmin = Admin(
            username="superadmin",
            password_hash=hash_password("super123"),
            role="super_admin",
            store_id=None,
            is_active=True
        )
        session.add(superadmin)
        
        await session.commit()
        print("✅ 관리자 계정 생성 완료!")
        print("Store Admin - username: admin, password: admin123")
        print("Super Admin - username: superadmin, password: super123")

if __name__ == "__main__":
    asyncio.run(create_admin())
