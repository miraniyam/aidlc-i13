from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models import Order, OrderItem, TableSession, Menu
from src.infrastructure.event_bus import event_bus
from fastapi import HTTPException, status
from datetime import datetime

class CreateOrderService:
    @staticmethod
    async def create_order(session_id: int, items: list, db: AsyncSession):
        result = await db.execute(select(TableSession).where(TableSession.id == session_id, TableSession.is_active == True))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SESSION_NOT_FOUND")
        
        if not items:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="EMPTY_ORDER")
        
        order = Order(table_session_id=session_id, status="pending", total_price=0)
        db.add(order)
        await db.flush()
        
        total = 0
        for item in items:
            result = await db.execute(select(Menu).where(Menu.id == item["menu_id"], Menu.is_available == True))
            menu = result.scalar_one_or_none()
            if not menu:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="MENU_NOT_AVAILABLE")
            
            subtotal = menu.price * item["quantity"]
            order_item = OrderItem(
                order_id=order.id,
                menu_id=menu.id,
                menu_name=menu.name,
                quantity=item["quantity"],
                unit_price=menu.price,
                subtotal=subtotal
            )
            db.add(order_item)
            total += subtotal
        
        order.total_price = total
        await db.commit()
        await db.refresh(order)
        
        await event_bus.publish("OrderCreated", {
            "event_type": "OrderCreated",
            "order_id": order.id,
            "table_id": session.table_id,
            "store_id": str(session.table.store_id),
            "total_price": float(order.total_price),
            "status": order.status,
            "created_at": order.created_at.isoformat()
        })
        
        return order
