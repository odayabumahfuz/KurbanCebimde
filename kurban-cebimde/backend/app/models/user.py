from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    surname = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, nullable=True)
    phone = Column(String(20), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # user, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    donations = relationship("Donation", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, phone={self.phone}, name={self.name})>"
