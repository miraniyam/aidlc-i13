from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from src.models import OrderHistory, TableSession
from datetime import date

class OrderHistoryQueryService:
    @staticmethod
    async def get_order_history(table_id: int, store_id: str, db: AsyncSession, 
                                from_date: date = None, to_date: date = None):
        query = select(OrderHistory).join(TableSession).where(
            TableSession.table_id == table_id,
            TableSession.is_active == False
        ).options(selectinload(OrderHistory.order_history_items))
        
        if from_date:
            query = query.where(OrderHistory.archived_at >= from_date)
        if to_date:
            query = query.where(OrderHistory.archived_at <= to_date)
        
        query = query.order_by(OrderHistory.archived_at.desc())
        result = await db.execute(query)
        return result.scalars().all()
