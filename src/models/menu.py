from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, CheckConstraint, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from src.core.database import Base

class Menu(Base):
    __tablename__ = "menus"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("menu_categories.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    image_path = Column(String, nullable=True)
    is_available = Column(Boolean, nullable=False, default=True)
    display_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    category = relationship("MenuCategory", back_populates="menus")
    order_items = relationship("OrderItem", back_populates="menu")
    
    __table_args__ = (
        CheckConstraint("price > 0", name="menu_price_positive"),
    )
