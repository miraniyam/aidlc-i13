from sqlalchemy import Column, Integer, DateTime, ForeignKey, CheckConstraint, Numeric, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from src.core.database import Base

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"
    CANCELLED = "cancelled"

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    table_session_id = Column(Integer, ForeignKey("table_sessions.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(OrderStatus), nullable=False, default=OrderStatus.PENDING)
    total_price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    table_session = relationship("TableSession", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint("total_price >= 0", name="order_total_price_non_negative"),
    )
