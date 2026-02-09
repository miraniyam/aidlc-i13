from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models import Order
from fastapi import HTTPException, status

class DeleteOrderService:
    @staticmethod
    async def delete_order(order_id: int, store_id: str, db: AsyncSession):
        result = await db.execute(select(Order).where(Order.id == order_id))
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ORDER_NOT_FOUND")
        
        if order.status in ["served", "cancelled"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ORDER_CANNOT_DELETE")
        
        await db.delete(order)
        await db.commit()
        return True
