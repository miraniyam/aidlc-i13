from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from src.models import Order, TableSession
from fastapi import HTTPException, status

class OrderQueryService:
    @staticmethod
    async def get_orders_by_session(session_id: int, db: AsyncSession):
        result = await db.execute(
            select(Order).where(Order.table_session_id == session_id)
            .options(selectinload(Order.order_items))
            .order_by(Order.created_at.desc())
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_orders_by_table(table_id: int, store_id: str, db: AsyncSession):
        result = await db.execute(
            select(TableSession).where(TableSession.table_id == table_id, TableSession.is_active == True)
        )
        session = result.scalar_one_or_none()
        if not session:
            return []
        return await OrderQueryService.get_orders_by_session(session.id, db)
