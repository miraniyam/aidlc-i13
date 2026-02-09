from fastapi import APIRouter, Depends, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database import get_db
from src.core.security import require_role
from src.services.menu_service import MenuService

router = APIRouter(prefix="/api/admin/menus", tags=["admin-menus"])

@router.get("")
async def get_menus(category_id: int = None, db: AsyncSession = Depends(get_db), 
                   user: dict = Depends(require_role("store_admin"))):
    return await MenuService.get_menus_by_category(category_id, user["store_id"], db)

@router.post("")
async def create_menu(
    category_id: int = Form(...),
    name: str = Form(...),
    price: float = Form(...),
    description: str = Form(None),
    image: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("store_admin"))
):
    return await MenuService.create_menu(category_id, name, price, user["store_id"], db, description, image)

@router.patch("/{menu_id}")
async def update_menu(
    menu_id: int,
    name: str = Form(None),
    price: float = Form(None),
    description: str = Form(None),
    is_available: bool = Form(None),
    image: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("store_admin"))
):
    return await MenuService.update_menu(menu_id, user["store_id"], db, name=name, price=price, 
                                        description=description, is_available=is_available)

@router.delete("/{menu_id}")
async def delete_menu(menu_id: int, db: AsyncSession = Depends(get_db), 
                     user: dict = Depends(require_role("store_admin"))):
    await MenuService.delete_menu(menu_id, user["store_id"], db)
    return {"success": True}
