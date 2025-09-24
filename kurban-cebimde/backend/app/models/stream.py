from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Stream(Base):
    __tablename__ = "streams"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    channel = Column(String(100), unique=True, nullable=False)
    status = Column(String(20), default="scheduled")  # scheduled, live, ended
    donation_id = Column(String, ForeignKey("donations.id"), nullable=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    creator = relationship("User")
    donation = relationship("Donation")
    
    def __repr__(self):
        return f"<Stream(id={self.id}, title={self.title}, status={self.status})>"
