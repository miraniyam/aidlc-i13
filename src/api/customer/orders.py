from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from src.core.database import get_db
from src.core.security import get_current_user
from src.services.create_order_service import CreateOrderService
from src.services.order_query_service import OrderQueryService

router = APIRouter(prefix="/api/customer/orders", tags=["customer-orders"])

class OrderItemRequest(BaseModel):
    menu_id: int
    quantity: int

class CreateOrderRequest(BaseModel):
    items: list[OrderItemRequest]

@router.post("")
async def create_order(request: CreateOrderRequest, db: AsyncSession = Depends(get_db), 
                      user: dict = Depends(get_current_user)):
    items = [{"menu_id": item.menu_id, "quantity": item.quantity} for item in request.items]
    return await CreateOrderService.create_order(user["session_id"], items, db)

@router.get("")
async def get_orders(db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    return await OrderQueryService.get_orders_by_session(user["session_id"], db)
