from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StreamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    donation_id: Optional[str] = None
    duration_seconds: Optional[int] = None

class StreamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class StreamTokenRequest(BaseModel):
    role: str  # "broadcaster" or "audience"

class StreamTokenResponse(BaseModel):
    appId: str
    channel: str
    rtcToken: str
    uid: str

class StreamResponse(BaseModel):
    id: str
    title: str
    channel: str
    status: str
    donation_id: Optional[str] = None
    created_by: str
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Donation bilgileri
    donor_name: Optional[str] = None
    donor_surname: Optional[str] = None
    donor_phone: Optional[str] = None
    animal_type: Optional[str] = None
    amount: Optional[str] = None
    
    class Config:
        from_attributes = True
