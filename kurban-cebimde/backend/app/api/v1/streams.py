from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.stream import Stream
from app.models.user import User
from app.models.donation import Donation
from app.schemas.stream import StreamCreate, StreamUpdate, StreamResponse, StreamTokenRequest, StreamTokenResponse
from app.api.v1.auth import get_current_user
from app.core.config import settings
from typing import List
import time
import uuid
from agora_token_builder import RtcTokenBuilder

router = APIRouter()

@router.get("/", response_model=List[StreamResponse])
async def get_streams(db: Session = Depends(get_db)):
    """Get all streams (public)"""
    
    streams = db.query(Stream).join(Donation, Stream.donation_id == Donation.id, isouter=True).filter(
        Stream.status.in_(["scheduled", "live"])
    ).all()
    
    # Stream bilgilerini donation bilgileriyle birleştir
    stream_data = []
    for stream in streams:
        stream_dict = {
            "id": stream.id,
            "title": stream.title,
            "channel": stream.channel,
            "status": stream.status,
            "donation_id": stream.donation_id,
            "created_by": stream.created_by,
            "started_at": stream.started_at,
            "ended_at": stream.ended_at,
            "duration_seconds": stream.duration_seconds,
            "description": stream.description,
            "created_at": stream.created_at,
            "updated_at": stream.updated_at,
            "donor_name": stream.donation.name if stream.donation else None,
            "donor_surname": stream.donation.surname if stream.donation else None,
            "donor_phone": stream.donation.phone if stream.donation else None,
            "animal_type": stream.donation.animal_type if stream.donation else None,
            "amount": str(stream.donation.amount) if stream.donation else None,
        }
        stream_data.append(stream_dict)
    
    return stream_data

@router.post("/", response_model=StreamResponse)
async def create_stream(
    stream_data: StreamCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new stream"""
    # Check if user is admin
    if not (current_user.is_admin or current_user.is_super_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin yetkisi gerekli"
        )
    
    # Generate unique channel name
    channel = f"kc_{int(time.time())}"
    
    stream = Stream(
        title=stream_data.title,
        channel=channel,
        description=stream_data.description,
        donation_id=stream_data.donation_id,
        duration_seconds=str(stream_data.duration_seconds) if stream_data.duration_seconds else None,
        created_by=current_user.id
    )
    
    db.add(stream)
    db.commit()
    db.refresh(stream)
    
    return stream

@router.post("/{stream_id}/token", response_model=StreamTokenResponse)
async def get_stream_token(
    stream_id: str,
    token_request: StreamTokenRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Agora token for stream"""
    stream = db.query(Stream).filter(Stream.id == stream_id).first()
    if not stream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stream bulunamadı"
        )
    
    # Check if stream is active
    if stream.status not in ["SCHEDULED", "LIVE"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stream aktif değil"
        )
    
    # Agora token generation
    app_id = settings.AGORA_APP_ID
    app_certificate = settings.AGORA_APP_CERTIFICATE
    channel_name = stream.channel
    uid = current_user.id  # Use user ID as UID
    role = RtcTokenBuilder.Role.PUBLISHER if token_request.role == "broadcaster" else RtcTokenBuilder.Role.SUBSCRIBER
    expire_time_in_seconds = 3600  # 1 hour
    current_timestamp = int(time.time())
    privilege_expired_ts = current_timestamp + expire_time_in_seconds
    
    try:
        # Generate Agora token
        rtc_token = RtcTokenBuilder.build_token_with_uid(
            app_id, 
            app_certificate, 
            channel_name, 
            uid, 
            role, 
            privilege_expired_ts
        )
    except Exception as e:
        # Fallback to mock token if Agora credentials are not set
        print(f"Agora token generation failed: {e}")
        rtc_token = f"mock_token_{stream_id}_{token_request.role}_{int(time.time())}"
        app_id = app_id or "mock_app_id"
    
    return StreamTokenResponse(
        appId=app_id,
        channel=channel_name,
        rtcToken=rtc_token,
        uid=uid
    )
