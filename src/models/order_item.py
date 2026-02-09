from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, CheckConstraint, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from src.core.database import Base

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    menu_id = Column(Integer, ForeignKey("menus.id", ondelete="RESTRICT"), nullable=False)
    menu_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    order = relationship("Order", back_populates="order_items")
    menu = relationship("Menu", back_populates="order_items")
    
    __table_args__ = (
        CheckConstraint("quantity > 0", name="order_item_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="order_item_unit_price_non_negative"),
    )
