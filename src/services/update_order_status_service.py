from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models import Order
from src.infrastructure.event_bus import event_bus
from fastapi import HTTPException, status
from datetime import datetime

VALID_TRANSITIONS = {
    "pending": ["preparing", "cancelled"],
    "preparing": ["ready", "cancelled"],
    "ready": ["served"],
    "served": [],
    "cancelled": []
}

class UpdateOrderStatusService:
    @staticmethod
    async def update_order_status(order_id: int, new_status: str, store_id: str, db: AsyncSession):
        result = await db.execute(select(Order).where(Order.id == order_id))
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ORDER_NOT_FOUND")
        
        if new_status not in VALID_TRANSITIONS.get(order.status, []):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="INVALID_STATUS_TRANSITION")
        
        old_status = order.status
        order.status = new_status
        order.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(order)
        
        await event_bus.publish("OrderStatusChanged", {
            "event_type": "OrderStatusChanged",
            "order_id": order.id,
            "store_id": store_id,
            "old_status": old_status,
            "new_status": new_status,
            "updated_at": order.updated_at.isoformat()
        })
        
        return order
