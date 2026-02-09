from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from src.core.database import Base

class Store(Base):
    __tablename__ = "stores"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    admins = relationship("Admin", back_populates="store")
    tables = relationship("Table", back_populates="store")
    menu_categories = relationship("MenuCategory", back_populates="store")
