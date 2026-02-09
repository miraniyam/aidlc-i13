from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from src.models import TableSession, Order, OrderHistory, OrderHistoryItem
from fastapi import HTTPException, status
from datetime import datetime

class CompleteTableSessionService:
    @staticmethod
    async def complete_session(table_id: int, store_id: str, db: AsyncSession):
        result = await db.execute(
            select(TableSession).where(TableSession.table_id == table_id, TableSession.is_active == True)
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SESSION_NOT_FOUND")
        
        result = await db.execute(
            select(Order).where(Order.table_session_id == session.id).options(selectinload(Order.order_items))
        )
        orders = result.scalars().all()
        
        for order in orders:
            history = OrderHistory(
                table_session_id=session.id,
                original_order_id=order.id,
                status=order.status,
                total_price=order.total_price,
                order_created_at=order.created_at,
                archived_at=datetime.utcnow()
            )
            db.add(history)
            await db.flush()
            
            for item in order.order_items:
                history_item = OrderHistoryItem(
                    order_history_id=history.id,
                    menu_id=item.menu_id,
                    menu_name=item.menu_name,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    subtotal=item.subtotal
                )
                db.add(history_item)
            
            await db.delete(order)
        
        session.is_active = False
        session.ended_at = datetime.utcnow()
        await db.commit()
        await db.refresh(session)
        
        return {"session": session, "archived_orders_count": len(orders)}
