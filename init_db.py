import asyncio
from src.core.database import engine, Base
from src.models import *
from src.core.security import hash_password
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database import AsyncSessionLocal

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create super admin
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        result = await session.execute(select(Admin).where(Admin.username == "superadmin"))
        if not result.scalar_one_or_none():
            admin = Admin(
                username="superadmin",
                password_hash=hash_password("super123"),
                role="super_admin",
                is_active=True
            )
            session.add(admin)
            await session.commit()
            print("Created superadmin user")
        else:
            print("superadmin already exists")

if __name__ == "__main__":
    asyncio.run(init_db())
