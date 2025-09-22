from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional, List
import os
import time
import logging
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings

router = APIRouter(tags=["streams"])

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:password@postgres:5432/kurban_cebimde"

settings = Settings()
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

APP_ID = os.getenv("AGORA_APP_ID", "demo_app_id")
APP_CERT = os.getenv("AGORA_APP_CERT", "demo_app_cert")

class StreamTokenRequest(BaseModel):
    role: str = "audience"  # publisher or audience

class StreamResponse(BaseModel):
    id: str
    title: str
    description: str
    channel: str
    status: str
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

def _build_token(channel: str, uid: int, role: str, expire_sec: int = 3600) -> str:
    """Agora token oluştur"""
    if not APP_ID or not APP_CERT:
        raise HTTPException(status_code=500, detail="Agora kimlik bilgileri eksik")
    try:
        from agora_token_builder import RtcTokenBuilder
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token builder yüklenemedi: {e}")

    role_enum = 1 if role == "publisher" else 2  # 1=broadcaster, 2=audience
    expire_ts = int(time.time()) + expire_sec
    return RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERT, channel, uid, role_enum, expire_ts)

@router.get("/streams/", response_model=List[StreamResponse])
async def list_streams():
    """Tüm streamleri listele"""
    try:
        with engine.connect() as conn:
            rows = conn.execute(text("""
                SELECT id, title, description, channel, 
                       COALESCE(status,'draft') AS status,
                       COALESCE(created_at, NOW()) AS created_at,
                       COALESCE(started_at, NULL) AS started_at,
                       COALESCE(ended_at, NULL) AS ended_at
                FROM streams
                ORDER BY created_at DESC
                LIMIT 100
            """)).mappings().all()
            
            streams = []
            for row in rows:
                streams.append({
                    "id": row["id"],
                    "title": row["title"],
                    "description": row["description"],
                    "channel": row["channel"],
                    "status": row["status"],
                    "created_at": row["created_at"],
                    "started_at": row["started_at"],
                    "ended_at": row["ended_at"]
                })
            
            return streams
            
    except Exception as e:
        logger.error(f"Streams list failed: {e}")
        raise HTTPException(status_code=500, detail=f"Streamler listelenemedi: {str(e)}")

@router.get("/streams/{stream_id}", response_model=StreamResponse)
async def get_stream(stream_id: str):
    """Belirli bir stream'i getir"""
    try:
        with engine.connect() as conn:
            row = conn.execute(text("""
                SELECT id, title, description, channel, 
                       COALESCE(status,'draft') AS status,
                       COALESCE(created_at, NOW()) AS created_at,
                       COALESCE(started_at, NULL) AS started_at,
                       COALESCE(ended_at, NULL) AS ended_at
                FROM streams
                WHERE id = :stream_id
            """), {"stream_id": stream_id}).fetchone()
            
            if not row:
                raise HTTPException(status_code=404, detail="Stream bulunamadı")
            
            return {
                "id": row["id"],
                "title": row["title"],
                "description": row["description"],
                "channel": row["channel"],
                "status": row["status"],
                "created_at": row["created_at"],
                "started_at": row["started_at"],
                "ended_at": row["ended_at"]
            }
            
    except Exception as e:
        logger.error(f"Stream get failed: {e}")
        raise HTTPException(status_code=500, detail=f"Stream alınamadı: {str(e)}")

@router.post("/streams/{stream_id}/token")
async def get_stream_token(stream_id: str, request: StreamTokenRequest):
    """Stream için token oluştur"""
    try:
        # Stream bilgilerini al
        with engine.connect() as conn:
            stream = conn.execute(text("""
                SELECT channel FROM streams WHERE id = :stream_id
            """), {"stream_id": stream_id}).fetchone()
            
            if not stream:
                raise HTTPException(status_code=404, detail="Stream bulunamadı")
            
            channel = stream[0]
            uid = int(time.time()) % 1000000000
            token = _build_token(channel, uid, request.role)
            
            logger.info(f"Stream token generated for {stream_id}, channel {channel}, role {request.role}")
            return {
                "rtcToken": token, 
                "appId": APP_ID, 
                "channel": channel, 
                "uid": uid,
                "stream_id": stream_id,
                "role": request.role
            }
            
    except Exception as e:
        logger.error(f"Stream token generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Stream token oluşturulamadı: {str(e)}")

@router.post("/streams/{stream_id}/start")
async def start_stream(stream_id: str):
    """Stream'i başlat"""
    try:
        with engine.connect() as conn:
            # Stream durumunu güncelle
            conn.execute(text("""
                UPDATE streams 
                SET status = 'LIVE', started_at = NOW(), updated_at = NOW()
                WHERE id = :stream_id
            """), {"stream_id": stream_id})
            conn.commit()
            
            logger.info(f"Stream started: {stream_id}")
            return {"message": "Stream başlatıldı", "stream_id": stream_id, "status": "LIVE"}
            
    except Exception as e:
        logger.error(f"Stream start failed: {e}")
        raise HTTPException(status_code=500, detail=f"Stream başlatılamadı: {str(e)}")

@router.post("/streams/{stream_id}/stop")
async def stop_stream(stream_id: str):
    """Stream'i durdur"""
    try:
        with engine.connect() as conn:
            # Stream durumunu güncelle
            conn.execute(text("""
                UPDATE streams 
                SET status = 'ENDED', ended_at = NOW(), updated_at = NOW()
                WHERE id = :stream_id
            """), {"stream_id": stream_id})
            conn.commit()
            
            logger.info(f"Stream stopped: {stream_id}")
            return {"message": "Stream durduruldu", "stream_id": stream_id, "status": "ENDED"}
            
    except Exception as e:
        logger.error(f"Stream stop failed: {e}")
        raise HTTPException(status_code=500, detail=f"Stream durdurulamadı: {str(e)}")
