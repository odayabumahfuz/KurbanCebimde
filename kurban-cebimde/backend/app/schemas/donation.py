from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime

class DonationCreate(BaseModel):
    amount: Decimal
    currency: str = "TRY"

class DonationUpdate(BaseModel):
    status: Optional[str] = None
    video_url: Optional[str] = None
    certificate_url: Optional[str] = None
    notes: Optional[str] = None

class DonationResponse(BaseModel):
    id: str
    user_id: str
    amount: Decimal
    currency: str
    status: str
    video_url: Optional[str] = None
    certificate_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
