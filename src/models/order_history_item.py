from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint, Numeric
from sqlalchemy.orm import relationship
from src.core.database import Base

class OrderHistoryItem(Base):
    __tablename__ = "order_history_items"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_history_id = Column(Integer, ForeignKey("order_histories.id", ondelete="CASCADE"), nullable=False)
    menu_id = Column(Integer, ForeignKey("menus.id", ondelete="SET NULL"), nullable=True)
    menu_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    
    order_history = relationship("OrderHistory", back_populates="order_history_items")
    
    __table_args__ = (
        CheckConstraint("quantity > 0", name="order_history_item_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="order_history_item_unit_price_non_negative"),
    )
