from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict
import time

from ..services.notification_service import notification_service, ExpoPushMessage

router = APIRouter()

# Request Models
class PushNotificationRequest(BaseModel):
    to: str
    title: str
    body: str
    data: Optional[Dict] = None
    sound: str = "default"
    badge: Optional[int] = None
    channelId: str = "default"

class BulkNotificationRequest(BaseModel):
    messages: List[PushNotificationRequest]

class KurbanNotificationRequest(BaseModel):
    expo_token: str
    kurban_title: str
    message: str
    kurban_id: Optional[str] = None

class DonationNotificationRequest(BaseModel):
    expo_token: str
    amount: float
    donor_name: str

class StreamNotificationRequest(BaseModel):
    expo_token: str
    stream_title: str
    message: str

# Endpoints
@router.post("/send")
async def send_push_notification(request: PushNotificationRequest):
    """Tek bir push bildirimi gönder"""
    try:
        message = ExpoPushMessage(**request.dict())
        result = await notification_service.send_push_notification(message)
        
        if result["success"]:
            return {
                "success": True,
                "message": "Bildirim başarıyla gönderildi",
                "data": result["data"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bildirim gönderilirken hata: {str(e)}")

@router.post("/send-bulk")
async def send_bulk_notifications(request: BulkNotificationRequest):
    """Toplu push bildirimi gönder"""
    try:
        messages = [ExpoPushMessage(**msg.dict()) for msg in request.messages]
        result = await notification_service.send_bulk_notifications(messages)
        
        if result["success"]:
            return {
                "success": True,
                "message": f"{len(messages)} bildirim gönderildi",
                "data": result["data"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Toplu bildirim gönderilirken hata: {str(e)}")

@router.post("/kurban")
async def send_kurban_notification(request: KurbanNotificationRequest):
    """Kurban ile ilgili bildirim gönder"""
    try:
        result = await notification_service.send_kurban_notification(
            expo_token=request.expo_token,
            kurban_title=request.kurban_title,
            message=request.message,
            kurban_id=request.kurban_id
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "Kurban bildirimi gönderildi",
                "data": result["data"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kurban bildirimi gönderilirken hata: {str(e)}")

@router.post("/donation")
async def send_donation_notification(request: DonationNotificationRequest):
    """Bağış bildirimi gönder"""
    try:
        result = await notification_service.send_donation_notification(
            expo_token=request.expo_token,
            amount=request.amount,
            donor_name=request.donor_name
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "Bağış bildirimi gönderildi",
                "data": result["data"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bağış bildirimi gönderilirken hata: {str(e)}")

@router.post("/stream")
async def send_stream_notification(request: StreamNotificationRequest):
    """Canlı yayın bildirimi gönder"""
    try:
        result = await notification_service.send_stream_notification(
            expo_token=request.expo_token,
            stream_title=request.stream_title,
            message=request.message
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "Yayın bildirimi gönderildi",
                "data": result["data"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yayın bildirimi gönderilirken hata: {str(e)}")

@router.get("/test")
async def test_notification():
    """Test bildirimi gönder"""
    try:
        # Test için örnek token (gerçek uygulamada kullanıcıdan alınacak)
        test_token = "ExponentPushToken[test_token_here]"
        
        message = ExpoPushMessage(
            to=test_token,
            title="🧪 Test Bildirimi",
            body="Bu bir test bildirimidir. Sistem çalışıyor!",
            data={
                "type": "test",
                "timestamp": int(time.time())
            },
            channelId="test_notifications"
        )
        
        result = await notification_service.send_push_notification(message)
        
        return {
            "success": result["success"],
            "message": "Test bildirimi gönderildi",
            "data": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test bildirimi gönderilirken hata: {str(e)}")

@router.get("/status")
async def notification_status():
    """Bildirim servisi durumu"""
    return {
        "service": "Expo Push Notifications",
        "status": "active",
        "api_url": "https://exp.host/--/api/v2/push/send",
        "timestamp": int(time.time())
    }
