from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from src.core.database import get_db
from src.core.security import require_role
from src.services.order_query_service import OrderQueryService
from src.services.update_order_status_service import UpdateOrderStatusService
from src.services.delete_order_service import DeleteOrderService

router = APIRouter(prefix="/api/admin/orders", tags=["admin-orders"])

class UpdateStatusRequest(BaseModel):
    status: str

@router.get("")
async def get_orders(table_id: int, db: AsyncSession = Depends(get_db), 
                    user: dict = Depends(require_role("store_admin"))):
    return await OrderQueryService.get_orders_by_table(table_id, user["store_id"], db)

@router.patch("/{order_id}/status")
async def update_status(order_id: int, request: UpdateStatusRequest, db: AsyncSession = Depends(get_db), 
                       user: dict = Depends(require_role("store_admin"))):
    return await UpdateOrderStatusService.update_order_status(order_id, request.status, user["store_id"], db)

@router.delete("/{order_id}")
async def delete_order(order_id: int, db: AsyncSession = Depends(get_db), 
                      user: dict = Depends(require_role("store_admin"))):
    await DeleteOrderService.delete_order(order_id, user["store_id"], db)
    return {"success": True}
