from sqlalchemy import Column, Integer, DateTime, ForeignKey, CheckConstraint, Numeric, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from src.models.order import OrderStatus
from src.core.database import Base

class OrderHistory(Base):
    __tablename__ = "order_histories"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    table_session_id = Column(Integer, ForeignKey("table_sessions.id", ondelete="CASCADE"), nullable=False)
    original_order_id = Column(Integer, nullable=False)
    status = Column(Enum(OrderStatus), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    order_created_at = Column(DateTime, nullable=False)
    archived_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    table_session = relationship("TableSession", back_populates="order_histories")
    order_history_items = relationship("OrderHistoryItem", back_populates="order_history", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint("total_price >= 0", name="order_history_total_price_non_negative"),
    )
