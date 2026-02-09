from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from src.models import Menu, MenuCategory
from fastapi import HTTPException, status
import uuid
import os

class MenuService:
    @staticmethod
    async def get_menus_by_category(category_id: int | None, store_id: str, db: AsyncSession):
        query = select(Menu).join(MenuCategory).where(MenuCategory.store_id == store_id)
        if category_id:
            query = query.where(Menu.category_id == category_id)
        query = query.order_by(Menu.display_order)
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_menu_by_id(menu_id: int, store_id: str, db: AsyncSession):
        result = await db.execute(
            select(Menu).join(MenuCategory).where(Menu.id == menu_id, MenuCategory.store_id == store_id)
        )
        menu = result.scalar_one_or_none()
        if not menu:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MENU_NOT_FOUND")
        return menu
    
    @staticmethod
    async def create_menu(category_id: int, name: str, price: float, store_id: str, db: AsyncSession, 
                         description: str = None, image_file = None):
        result = await db.execute(select(MenuCategory).where(MenuCategory.id == category_id, MenuCategory.store_id == store_id))
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CATEGORY_NOT_FOUND")
        
        image_path = None
        if image_file:
            ext = image_file.filename.split('.')[-1]
            filename = f"{uuid.uuid4()}.{ext}"
            image_path = f"/uploads/menus/{filename}"
            with open(f"uploads/menus/{filename}", "wb") as f:
                f.write(await image_file.read())
        
        menu = Menu(category_id=category_id, name=name, description=description, price=price, image_path=image_path)
        db.add(menu)
        await db.commit()
        await db.refresh(menu)
        return menu
    
    @staticmethod
    async def update_menu(menu_id: int, store_id: str, db: AsyncSession, **kwargs):
        menu = await MenuService.get_menu_by_id(menu_id, store_id, db)
        for key, value in kwargs.items():
            if value is not None and hasattr(menu, key):
                setattr(menu, key, value)
        await db.commit()
        await db.refresh(menu)
        return menu
    
    @staticmethod
    async def delete_menu(menu_id: int, store_id: str, db: AsyncSession):
        menu = await MenuService.get_menu_by_id(menu_id, store_id, db)
        if menu.image_path and os.path.exists(f".{menu.image_path}"):
            os.remove(f".{menu.image_path}")
        await db.delete(menu)
        await db.commit()
        return True
