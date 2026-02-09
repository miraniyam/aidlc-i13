from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from src.core.database import Base

class Table(Base):
    __tablename__ = "tables"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    table_number = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    store = relationship("Store", back_populates="tables")
    sessions = relationship("TableSession", back_populates="table")
    
    __table_args__ = (
        UniqueConstraint("store_id", "table_number", name="uq_store_table_number"),
    )
