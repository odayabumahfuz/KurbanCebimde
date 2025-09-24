from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.stream import Stream
from app.models.user import User
from app.schemas.stream import StreamCreate, StreamUpdate, StreamResponse
from app.api.admin.v1.auth import get_current_admin_user
from typing import List, Optional
import time
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=dict)
async def get_streams(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all streams (admin only)"""
    from app.models.donation import Donation
    
    query = db.query(Stream).join(Donation, Stream.donation_id == Donation.id, isouter=True)
    
    # Status filter
    if status:
        query = query.filter(Stream.status == status)
    
    # Pagination
    total = query.count()
    streams = query.order_by(Stream.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
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
    
    return {
        "items": stream_data,
        "total": total,
        "page": page,
        "size": size
    }

@router.get("/{stream_id}", response_model=StreamResponse)
async def get_stream(
    stream_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get specific stream (admin only)"""
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin yetkisi gerekli"
        )
    
    stream = db.query(Stream).filter(Stream.id == stream_id).first()
    if not stream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stream bulunamadı"
        )
    
    return stream

@router.post("/", response_model=StreamResponse)
async def create_stream(
    stream_data: StreamCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create new stream (admin only)"""
    # Check if user is admin
    if current_user.role != "admin":
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

@router.post("/{stream_id}/start", response_model=StreamResponse)
async def start_stream(
    stream_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Start stream (admin only)"""
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin yetkisi gerekli"
        )
    
    stream = db.query(Stream).filter(Stream.id == stream_id).first()
    if not stream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stream bulunamadı"
        )
    
    stream.status = "live"
    stream.started_at = datetime.now()
    
    db.commit()
    db.refresh(stream)
    
    return stream

@router.post("/{stream_id}/stop", response_model=StreamResponse)
async def stop_stream(
    stream_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Stop stream (admin only)"""
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin yetkisi gerekli"
        )
    
    stream = db.query(Stream).filter(Stream.id == stream_id).first()
    if not stream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stream bulunamadı"
        )
    
    stream.status = "ended"
    stream.ended_at = datetime.now()
    
    db.commit()
    db.refresh(stream)
    
    return stream
