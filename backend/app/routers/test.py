from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List
import time
import random
import os
from sqlalchemy import create_engine, text

from ..services.notification_service import notification_service
from ..services.certificate_service import certificate_service

router = APIRouter(tags=["test"])

# Test Models
class TestNotificationRequest(BaseModel):
    expo_token: str
    message: str = "Test bildirimi"

class TestCertificateRequest(BaseModel):
    user_id: str = "test_user_123"
    kurban_id: str = "test_kurban_456"

@router.post("/login-as-admin")
async def login_as_admin():
    # Test amaçlı: üretimde kapatılmalı. ENV != test olsa da local geliştirme için token üret.
    try:
        # Basit: kullanıcı tablosundan admin var mı, yoksa oluştur ve token döndür
        import jwt
        from datetime import datetime, timedelta
        SECRET_KEY = os.getenv("SECRET_KEY", "test_secret")
        DATABASE_URL = os.getenv("DATABASE_URL")
        if not DATABASE_URL:
            return {"access_token": "test", "token_type": "bearer"}
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            row = conn.execute(text("SELECT id FROM users WHERE is_super_admin = TRUE LIMIT 1")).fetchone()
            user_id = row.id if row else "00000000-0000-0000-0000-000000000000"
        payload = {
            "user_id": str(user_id),
            "is_admin": True,
            "is_super_admin": True,
            "exp": datetime.utcnow() + timedelta(hours=1),
            "iat": datetime.utcnow(),
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        return {"access_token": token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Test Endpoints
@router.get("/")
async def test_root():
    """Test root endpoint"""
    return {
        "message": "Test API çalışıyor! 🚀",
        "timestamp": int(time.time()),
        "status": "active"
    }

@router.get("/notification")
async def test_notification_service():
    """Bildirim servisi test"""
    try:
        # Test token (gerçek uygulamada kullanıcıdan alınacak)
        test_token = "ExponentPushToken[test_token_here]"
        
        from ..services.notification_service import ExpoPushMessage
        
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
            "data": result,
            "service_status": "active"
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Test bildirimi gönderilemedi",
            "service_status": "error"
        }

@router.post("/notification/custom")
async def test_custom_notification(request: TestNotificationRequest):
    """Özel test bildirimi gönder"""
    try:
        from ..services.notification_service import ExpoPushMessage
        
        message = ExpoPushMessage(
            to=request.expo_token,
            title="🎯 Özel Test Bildirimi",
            body=request.message,
            data={
                "type": "custom_test",
                "timestamp": int(time.time()),
                "custom_message": request.message
            },
            channelId="test_notifications"
        )
        
        result = await notification_service.send_push_notification(message)
        
        return {
            "success": result["success"],
            "message": "Özel test bildirimi gönderildi",
            "data": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Özel test bildirimi gönderilemedi: {str(e)}")

@router.get("/certificate")
async def test_certificate_service():
    """Sertifika servisi test"""
    try:
        # Mock sertifika oluştur
        certificate = await certificate_service.create_certificate(
            user_id="test_user_123",
            kurban_id="test_kurban_456",
            certificate_type="kurban",
            title="Test Kurban Sertifikası",
            description="Test amaçlı oluşturulmuş sertifika",
            metadata={
                "animal_type": "koyun",
                "weight": "50kg",
                "location": "Test Lokasyonu",
                "imam": "Test İmam"
            }
        )
        
        # İstatistikleri al
        stats = await certificate_service.get_certificate_stats()
        
        return {
            "success": True,
            "message": "Test sertifikası oluşturuldu",
            "data": {
                "certificate": certificate.dict(),
                "stats": stats
            },
            "service_status": "active"
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Test sertifikası oluşturulamadı",
            "service_status": "error"
        }

@router.post("/certificate/custom")
async def test_custom_certificate(request: TestCertificateRequest):
    """Özel test sertifikası oluştur"""
    try:
        certificate = await certificate_service.create_certificate(
            user_id=request.user_id,
            kurban_id=request.kurban_id,
            certificate_type="kurban",
            title="Özel Test Sertifikası",
            description="Özel test amaçlı oluşturulmuş sertifika",
            metadata={
                "animal_type": "koyun",
                "weight": f"{random.randint(40, 60)}kg",
                "location": "Test Lokasyonu",
                "imam": "Test İmam",
                "test_id": f"test_{int(time.time())}"
            }
        )
        
        return {
            "success": True,
            "message": "Özel test sertifikası oluşturuldu",
            "data": certificate.dict()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Özel test sertifikası oluşturulamadı: {str(e)}")

@router.get("/certificate/sample")
async def get_sample_certificates():
    """Örnek sertifikaları getir"""
    try:
        certificates = await certificate_service.get_all_certificates(limit=5)
        
        return {
            "success": True,
            "message": "Örnek sertifikalar getirildi",
            "data": [cert.dict() for cert in certificates],
            "count": len(certificates)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Örnek sertifikalar getirilemedi: {str(e)}")

@router.get("/certificate/verify/{verification_code}")
async def test_certificate_verification(verification_code: str):
    """Sertifika doğrulama test"""
    try:
        certificate = await certificate_service.verify_certificate(verification_code)
        
        if certificate:
            return {
                "success": True,
                "message": "Sertifika doğrulandı",
                "data": certificate.dict()
            }
        else:
            return {
                "success": False,
                "message": "Geçersiz doğrulama kodu",
                "verification_code": verification_code
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sertifika doğrulanamadı: {str(e)}")

@router.get("/bulk/notification")
async def test_bulk_notifications():
    """Toplu bildirim test"""
    try:
        from ..services.notification_service import ExpoPushMessage
        
        # Test token'ları (gerçek uygulamada veritabanından alınacak)
        test_tokens = [
            "ExponentPushToken[test_token_1]",
            "ExponentPushToken[test_token_2]",
            "ExponentPushToken[test_token_3]"
        ]
        
        messages = [
            ExpoPushMessage(
                to=token,
                title="📢 Toplu Test Bildirimi",
                body=f"Bu {i+1}. test bildirimidir",
                data={
                    "type": "bulk_test",
                    "index": i+1,
                    "timestamp": int(time.time())
                },
                channelId="test_notifications"
            )
            for i, token in enumerate(test_tokens)
        ]
        
        result = await notification_service.send_bulk_notifications(messages)
        
        return {
            "success": result["success"],
            "message": f"{len(messages)} toplu test bildirimi gönderildi",
            "data": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Toplu test bildirimi gönderilemedi: {str(e)}")

@router.get("/integration")
async def test_integration():
    """Entegrasyon testi - hem bildirim hem sertifika"""
    try:
        # Sertifika oluştur
        certificate = await certificate_service.create_certificate(
            user_id="integration_test_user",
            kurban_id="integration_test_kurban",
            certificate_type="kurban",
            title="Entegrasyon Test Sertifikası",
            description="Bildirim ve sertifika entegrasyon testi",
            metadata={
                "animal_type": "koyun",
                "weight": "55kg",
                "location": "Entegrasyon Test Lokasyonu",
                "imam": "Test İmam",
                "test_type": "integration"
            }
        )
        
        # Bildirim gönder
        from ..services.notification_service import ExpoPushMessage
        
        notification_message = ExpoPushMessage(
            to="ExponentPushToken[integration_test_token]",
            title="🎉 Entegrasyon Testi Başarılı!",
            body=f"Sertifika oluşturuldu: {certificate.title}",
            data={
                "type": "integration_test",
                "certificate_id": certificate.id,
                "verification_code": certificate.verification_code,
                "timestamp": int(time.time())
            },
            channelId="test_notifications"
        )
        
        notification_result = await notification_service.send_push_notification(notification_message)
        
        return {
            "success": True,
            "message": "Entegrasyon testi tamamlandı",
            "data": {
                "certificate": certificate.dict(),
                "notification": notification_result,
                "integration_status": "success"
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Entegrasyon testi başarısız: {str(e)}")

@router.get("/status")
async def test_services_status():
    """Tüm servislerin durumunu kontrol et"""
    try:
        # Bildirim servisi durumu
        notification_status = "active"
        try:
            from ..services.notification_service import ExpoPushMessage
            await notification_service.send_push_notification(
                ExpoPushMessage(
                    to="ExponentPushToken[status_test]",
                    title="Status Test",
                    body="Servis durumu kontrol ediliyor",
                    data={"type": "status_test"}
                )
            )
        except:
            notification_status = "error"
        
        # Sertifika servisi durumu
        certificate_status = "active"
        try:
            await certificate_service.get_certificate_stats()
        except:
            certificate_status = "error"
        
        return {
            "success": True,
            "message": "Servis durumları kontrol edildi",
            "data": {
                "notification_service": notification_status,
                "certificate_service": certificate_status,
                "timestamp": int(time.time()),
                "overall_status": "active" if notification_status == "active" and certificate_status == "active" else "error"
            }
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Servis durumları kontrol edilemedi",
            "data": {
                "notification_service": "unknown",
                "certificate_service": "unknown",
                "timestamp": int(time.time()),
                "overall_status": "error"
            }
        }
