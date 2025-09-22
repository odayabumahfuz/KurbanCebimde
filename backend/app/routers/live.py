from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import os
import time
import logging
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings

load_dotenv()

router = APIRouter(tags=["live"])

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


class CreateStreamBody(BaseModel):
    kurban_id: str
    start_at: str | None = None


class StartStopBody(BaseModel):
    stream_id: str


def _build_token(channel: str, uid: int, role: str, expire_sec: int = 3600) -> str:
    if not APP_ID or not APP_CERT:
        raise HTTPException(status_code=500, detail="Agora kimlik bilgileri eksik")
    try:
        from agora_token_builder import RtcTokenBuilder
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token builder yüklenemedi: {e}")

    role_enum = 1 if role == "publisher" else 2  # 1=broadcaster, 2=audience
    expire_ts = int(time.time()) + expire_sec
    return RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERT, channel, uid, role_enum, expire_ts)


@router.post("/live/create")
async def create_stream(body: CreateStreamBody):
    try:
        channel = f"kc_{body.kurban_id}_{int(time.time())}"
        stream_id = channel
        
        # DB'ye stream kaydı ekle
        with engine.connect() as conn:
            # Önce kullanıcı bilgilerini donations tablosundan al
            donation_result = conn.execute(text("""
                SELECT d.user_id, u.name, u.surname, d.amount
                FROM donations d
                LEFT JOIN users u ON d.user_id = u.id
                WHERE d.id = :kurban_id
                LIMIT 1
            """), {"kurban_id": body.kurban_id}).fetchone()
            
            user_id = None
            user_name = None
            kurban_type = "Belirtilmemiş"
            
            if donation_result:
                user_id = donation_result[0]
                user_name = f"{donation_result[1]} {donation_result[2]}" if donation_result[1] and donation_result[2] else "Bilinmeyen Kullanıcı"
                # Amount'a göre kurban tipini belirle
                amount = donation_result[3] or 0
                if amount >= 15000:
                    kurban_type = "Sığır"
                elif amount >= 3000:
                    kurban_type = "Koç"
                else:
                    kurban_type = "Koyun"
            
            conn.execute(text("""
                INSERT INTO streams (id, title, description, channel, kurban_id, user_id, user_name, kurban_type, status, created_at, updated_at)
                VALUES (:id, :title, :description, :channel, :kurban_id, :user_id, :user_name, :kurban_type, 'draft', NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                user_id = EXCLUDED.user_id,
                user_name = EXCLUDED.user_name,
                kurban_type = EXCLUDED.kurban_type,
                updated_at = NOW()
            """), {
                "id": stream_id,
                "title": f"Kurban Kesimi - {body.kurban_id}",
                "description": f"Kurban kesimi canlı yayını - {body.kurban_id}",
                "channel": channel,
                "kurban_id": body.kurban_id,
                "user_id": user_id,
                "user_name": user_name,
                "kurban_type": kurban_type
            })
            conn.commit()
        
        logger.info(f"Stream created: {stream_id} for kurban {body.kurban_id} with user {user_name}")
        return {"channel": channel, "stream_id": stream_id, "status": "draft"}
        
    except Exception as e:
        logger.error(f"Stream creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Stream oluşturulamadı: {str(e)}")


@router.post("/live/token")
async def get_token(role: str = Query(..., regex="^(publisher|audience)$"), channel: str = Query(...)):
    try:
        uid = int(time.time()) % 1000000000
        token = _build_token(channel, uid, role)
        
        logger.info(f"Token generated for channel {channel}, role {role}, uid {uid}")
        return {"rtcToken": token, "appId": APP_ID, "channel": channel, "uid": uid}
        
    except Exception as e:
        logger.error(f"Token generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Token oluşturulamadı: {str(e)}")


@router.post("/live/start")
async def start_stream(body: StartStopBody):
    try:
        # DB'de stream durumunu güncelle
        with engine.connect() as conn:
            result = conn.execute(text("""
                UPDATE streams 
                SET status = 'live', started_at = NOW(), updated_at = NOW()
                WHERE id = :stream_id
                RETURNING id, title, channel
            """), {"stream_id": body.stream_id})
            
            stream_data = result.fetchone()
            if not stream_data:
                raise HTTPException(status_code=404, detail="Stream bulunamadı")
            
            conn.commit()
        
        logger.info(f"Stream started: {body.stream_id}")
        return {"ok": True, "stream_id": body.stream_id, "status": "live", "started_at": datetime.now().isoformat()}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Stream start failed: {e}")
        raise HTTPException(status_code=500, detail=f"Stream başlatılamadı: {str(e)}")


@router.post("/live/stop")
async def stop_stream(body: StartStopBody):
    try:
        # DB'de stream durumunu güncelle
        with engine.connect() as conn:
            result = conn.execute(text("""
                UPDATE streams 
                SET status = 'ended', ended_at = NOW(), updated_at = NOW()
                WHERE id = :stream_id
                RETURNING id, title, channel
            """), {"stream_id": body.stream_id})
            
            stream_data = result.fetchone()
            if not stream_data:
                raise HTTPException(status_code=404, detail="Stream bulunamadı")
            
            conn.commit()
        
        logger.info(f"Stream stopped: {body.stream_id}")
        return {"ok": True, "stream_id": body.stream_id, "status": "ended", "ended_at": datetime.now().isoformat()}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Stream stop failed: {e}")
        raise HTTPException(status_code=500, detail=f"Stream durdurulamadı: {str(e)}")


@router.get("/live/streams")
async def list_streams():
    """Tüm streamleri listele"""
    try:
        with engine.connect() as conn:
            rows = conn.execute(text("""
                SELECT id, title, description, channel, kurban_id, 
                       COALESCE(user_id, '') AS user_id,
                       COALESCE(user_name, 'Bilinmeyen Kullanıcı') AS user_name,
                       COALESCE(kurban_type, 'Belirtilmemiş') AS kurban_type,
                       COALESCE(status,'draft') AS status,
                       COALESCE(location,'Türkiye') AS location,
                       COALESCE(animal_count,1) AS animal_count,
                       COALESCE(viewers,0) AS viewers,
                       COALESCE(duration,'0:00') AS duration,
                       COALESCE(created_at, NOW()) AS created_at,
                       COALESCE(started_at, NULL) AS started_at,
                       COALESCE(ended_at, NULL) AS ended_at
                FROM streams
                ORDER BY created_at DESC
                LIMIT 100
            """)).mappings().all()
            items = [dict(r) for r in rows]
            return {"items": items, "total": len(items), "page": 1, "size": 100}
    except Exception as e:
        logger.error(f"Streams list failed: {e}")
        raise HTTPException(status_code=500, detail=f"Streamler listelenemedi: {str(e)}")


@router.delete("/live/streams/{stream_id}")
async def delete_stream(stream_id: str):
    """Stream'i sil"""
    try:
        with engine.connect() as conn:
            # Stream var mı kontrol et
            stream = conn.execute(text("""
                SELECT id FROM streams WHERE id = :stream_id
            """), {"stream_id": stream_id}).fetchone()
            
            if not stream:
                raise HTTPException(status_code=404, detail="Stream bulunamadı")
            
            # Stream'i sil
            conn.execute(text("""
                DELETE FROM streams WHERE id = :stream_id
            """), {"stream_id": stream_id})
            conn.commit()
            
            logger.info(f"Stream deleted: {stream_id}")
            return {"message": "Stream silindi"}
    except Exception as e:
        logger.error(f"Stream deletion error: {e}")
        raise HTTPException(status_code=500, detail="Stream silinemedi")

@router.post("/live/streams/{stream_id}/token")
async def get_stream_token(stream_id: str, role: str = Query(..., regex="^(publisher|audience)$")):
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
            token = _build_token(channel, uid, role)
            
            logger.info(f"Stream token generated for {stream_id}, channel {channel}, role {role}")
            return {
                "rtcToken": token, 
                "appId": APP_ID, 
                "channel": channel, 
                "uid": uid,
                "stream_id": stream_id,
                "role": role
            }
            
    except Exception as e:
        logger.error(f"Stream token generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Stream token oluşturulamadı: {str(e)}")


