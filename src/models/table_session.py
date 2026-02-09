from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from src.core.database import Base

class TableSession(Base):
    __tablename__ = "table_sessions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    table_id = Column(Integer, ForeignKey("tables.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    table = relationship("Table", back_populates="sessions")
    orders = relationship("Order", back_populates="table_session")
    order_histories = relationship("OrderHistory", back_populates="table_session")
    
    __table_args__ = (
        CheckConstraint("ended_at IS NULL OR ended_at >= started_at", name="session_end_after_start"),
        CheckConstraint("is_active = false OR ended_at IS NULL", name="inactive_session_has_end"),
    )
