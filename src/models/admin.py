from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from src.core.database import Base

class AdminRole(str, enum.Enum):
    STORE_ADMIN = "store_admin"
    SUPER_ADMIN = "super_admin"

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(String, ForeignKey("stores.id", ondelete="SET NULL"), nullable=True)
    username = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    store = relationship("Store", back_populates="admins")
