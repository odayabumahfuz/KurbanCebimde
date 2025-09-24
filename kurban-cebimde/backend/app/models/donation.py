from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Donation(Base):
    __tablename__ = "donations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="TRY")
    status = Column(String(20), default="PENDING")  # PENDING, PAID, ASSIGNED, COMPLETED
    video_url = Column(Text, nullable=True)
    certificate_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="donations")
    
    def __repr__(self):
        return f"<Donation(id={self.id}, amount={self.amount}, status={self.status})>"
