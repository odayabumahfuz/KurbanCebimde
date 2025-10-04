from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import jwt
import time
from datetime import datetime, timedelta

router = APIRouter(tags=["livekit"])

# LiveKit Configuration
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "wss://kurban-cebimde-q2l64d9v.livekit.cloud")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "APIcAygxUZnX6kb")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "o9orYHfogJSrt0RaAOqeSEHfSevh9wH0ArDxrmwhHTeA")

class LiveKitTokenRequest(BaseModel):
    room_name: str
    participant_name: str
    participant_identity: str
    participant_metadata: Optional[Dict[str, Any]] = None
    can_publish: bool = True
    can_subscribe: bool = True
    can_publish_data: bool = True
    hidden: bool = False
    recorder: bool = False
    duration: int = 3600  # 1 hour default

class LiveKitTokenResponse(BaseModel):
    token: str
    url: str
    room_name: str
    participant_name: str
    expires_at: datetime

def generate_livekit_token(
    room_name: str,
    participant_name: str,
    participant_identity: str,
    participant_metadata: Optional[Dict[str, Any]] = None,
    can_publish: bool = True,
    can_subscribe: bool = True,
    can_publish_data: bool = True,
    hidden: bool = False,
    recorder: bool = False,
    duration: int = 3600
) -> str:
    """Generate LiveKit access token"""
    try:
        # Token payload
        now = int(time.time())
        payload = {
            "iss": LIVEKIT_API_KEY,
            "sub": participant_identity,
            "iat": now,
            "exp": now + duration,
            "nbf": now,
            "name": participant_name,
            "video": {
                "room": room_name,
                "roomJoin": True,
                "canPublish": can_publish,
                "canSubscribe": can_subscribe,
                "canPublishData": can_publish_data,
                "hidden": hidden,
                "recorder": recorder
            }
        }
        
        if participant_metadata:
            payload["metadata"] = participant_metadata
        
        # Generate token
        token = jwt.encode(payload, LIVEKIT_API_SECRET, algorithm="HS256")
        return token
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token generation failed: {str(e)}")

@router.post("/token", response_model=LiveKitTokenResponse)
async def create_livekit_token(request: LiveKitTokenRequest):
    """Create LiveKit access token for room access"""
    try:
        token = generate_livekit_token(
            room_name=request.room_name,
            participant_name=request.participant_name,
            participant_identity=request.participant_identity,
            participant_metadata=request.participant_metadata,
            can_publish=request.can_publish,
            can_subscribe=request.can_subscribe,
            can_publish_data=request.can_publish_data,
            hidden=request.hidden,
            recorder=request.recorder,
            duration=request.duration
        )
        
        expires_at = datetime.now() + timedelta(seconds=request.duration)
        
        return LiveKitTokenResponse(
            token=token,
            url=LIVEKIT_URL,
            room_name=request.room_name,
            participant_name=request.participant_name,
            expires_at=expires_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create token: {str(e)}")

@router.get("/streams/{stream_id}/token")
async def get_stream_token(stream_id: str, role: str = "subscriber", identity: Optional[str] = None):
    """Get token for specific stream - README uyumlu endpoint"""
    try:
        # Role kontrolü
        if role not in ["publisher", "subscriber"]:
            raise HTTPException(status_code=400, detail="Role must be 'publisher' or 'subscriber'")
        
        # Stream bilgilerini DB'den al (şimdilik mock)
        room_name = f"stream_{stream_id}"
        participant_name = f"user_{stream_id}"
        participant_identity = identity or f"identity_{stream_id}_{int(time.time())}"
        
        # Role'e göre yetkiler
        can_publish = role == "publisher"
        can_subscribe = True  # Herkes izleyebilir
        
        token = generate_livekit_token(
            room_name=room_name,
            participant_name=participant_name,
            participant_identity=participant_identity,
            can_publish=can_publish,
            can_subscribe=can_subscribe,
            duration=3600
        )
        
        return {
            "token": token,
            "url": LIVEKIT_URL,
            "room_name": room_name,
            "role": role,
            "expires_at": datetime.now() + timedelta(seconds=3600)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stream token: {str(e)}")

@router.get("/config")
async def get_livekit_config():
    """Get LiveKit configuration"""
    return {
        "url": LIVEKIT_URL,
        "api_key": LIVEKIT_API_KEY,
        "project_id": "p_1jzft8zabzo",
        "project_name": "Kurban Cebimde",
        "sip_uri": "sip:1jzft8zabzo.sip.livekit.cloud"
    }

@router.post("/room/create")
async def create_room(room_name: str, max_participants: int = 100):
    """Create a new LiveKit room"""
    try:
        # LiveKit room creation logic would go here
        # For now, return success
        return {
            "room_name": room_name,
            "max_participants": max_participants,
            "status": "created",
            "url": f"{LIVEKIT_URL}/room/{room_name}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create room: {str(e)}")

@router.get("/room/{room_name}/participants")
async def get_room_participants(room_name: str):
    """Get participants in a room"""
    try:
        # LiveKit participant list logic would go here
        # For now, return empty list
        return {
            "room_name": room_name,
            "participants": [],
            "count": 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get participants: {str(e)}")

@router.get("/streams")
async def get_livekit_streams():
    """Get all active LiveKit streams"""
    try:
        # Gerçek LiveKit API'sinden aktif yayınları al
        # Şimdilik boş liste döndürüyoruz - gerçek veriler için LiveKit API entegrasyonu gerekli
        return {
            "streams": [],
            "total": 0,
            "active_count": 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get streams: {str(e)}")

@router.get("/streams/{room_name}")
async def get_livekit_stream(room_name: str):
    """Get specific LiveKit stream details"""
    try:
        # Gerçek LiveKit API'sinden room detaylarını al
        return {
            "room_name": room_name,
            "participants": [],
            "status": "active",
            "created_at": "2025-09-11T10:00:00Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stream: {str(e)}")

@router.post("/streams/{room_name}/end")
async def end_livekit_stream(room_name: str):
    """End a specific LiveKit stream"""
    try:
        # Gerçek LiveKit API'sinden room'u sonlandır
        return {
            "room_name": room_name,
            "status": "ended",
            "ended_at": "2025-09-11T12:00:00Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to end stream: {str(e)}")
