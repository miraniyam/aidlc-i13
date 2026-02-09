from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database import get_db
from src.core.security import get_current_user
from src.services.menu_service import MenuService

router = APIRouter(prefix="/api/customer/menus", tags=["customer-menus"])

@router.get("")
async def get_menus(store_id: str, category_id: int = None, db: AsyncSession = Depends(get_db), 
                   user: dict = Depends(get_current_user)):
    return await MenuService.get_menus_by_category(category_id, store_id, db)

@router.get("/{menu_id}")
async def get_menu(menu_id: int, store_id: str, db: AsyncSession = Depends(get_db), 
                  user: dict = Depends(get_current_user)):
    return await MenuService.get_menu_by_id(menu_id, store_id, db)
