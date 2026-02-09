from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
from src.core.database import get_db
from src.core.security import require_role
from src.services.complete_table_session_service import CompleteTableSessionService
from src.services.order_history_query_service import OrderHistoryQueryService

router = APIRouter(prefix="/api/admin/tables", tags=["admin-tables"])

@router.post("/{table_id}/complete-session")
async def complete_session(table_id: int, db: AsyncSession = Depends(get_db), 
                          user: dict = Depends(require_role("store_admin"))):
    return await CompleteTableSessionService.complete_session(table_id, user["store_id"], db)

@router.get("/{table_id}/order-history")
async def get_order_history(table_id: int, from_date: date = None, to_date: date = None,
                           db: AsyncSession = Depends(get_db), 
                           user: dict = Depends(require_role("store_admin"))):
    return await OrderHistoryQueryService.get_order_history(table_id, user["store_id"], db, from_date, to_date)
