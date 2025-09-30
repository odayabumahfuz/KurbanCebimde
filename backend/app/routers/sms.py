from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os
from typing import Optional
from urllib.parse import quote

router = APIRouter(tags=["sms"])

# NetGSM Configuration
NETGSM_USER = os.getenv("NETGSM_USER", "8503033128")
NETGSM_PASS = os.getenv("NETGSM_PASS", "")
NETGSM_HEADER = os.getenv("NETGSM_HEADER", "KURBANCB")
NETGSM_URL = "https://api.netgsm.com.tr/sms/send/get/"

class SMSRequest(BaseModel):
    to: str
    message: str
    header: Optional[str] = None

class SMSResponse(BaseModel):
    success: bool
    message_id: Optional[str] = None
    error: Optional[str] = None

def send_sms(to: str, message: str, header: str = None) -> dict:
    """NetGSM ile SMS gönder"""
    try:
        # Telefon numarası formatı (90 ile başlamalı)
        if not to.startswith("90"):
            to = "90" + to.lstrip("0")
        
        # NetGSM API parametreleri
        params = {
            "usercode": NETGSM_USER,
            "password": NETGSM_PASS,
            "gsmno": to,
            "msg": message,
            "msgheader": header or NETGSM_HEADER,
            "dil": "TR"  # Türkçe karakter desteği
        }
        
        # URL encoding için params'ı string'e çevir
        param_string = "&".join([f"{k}={quote(str(v))}" for k, v in params.items()])
        full_url = f"{NETGSM_URL}?{param_string}"
        
        print(f"📱 SMS gönderiliyor: {to} - {message[:50]}...")
        print(f"🔑 NetGSM Params: usercode={NETGSM_USER}, password=***, gsmno={to}, header={header or NETGSM_HEADER}")
        
        # NetGSM API çağrısı - POST ile
        response = requests.post(NETGSM_URL, data=params, timeout=30)
        
        print(f"📡 NetGSM Response: {response.status_code} - {response.text}")
        print(f"🔗 NetGSM URL: {full_url}")
        
        if response.status_code == 200:
            result = response.text.strip()
            
            # Başarılı gönderim kontrolü
            if result.isdigit() and len(result) > 5:
                return {
                    "success": True,
                    "message_id": result,
                    "error": None
                }
            else:
                return {
                    "success": False,
                    "message_id": None,
                    "error": f"NetGSM Error: {result}"
                }
        else:
            return {
                "success": False,
                "message_id": None,
                "error": f"HTTP Error: {response.status_code}"
            }
            
    except Exception as e:
        print(f"❌ SMS gönderim hatası: {e}")
        return {
            "success": False,
            "message_id": None,
            "error": str(e)
        }

@router.post("/send", response_model=SMSResponse)
async def send_sms_endpoint(request: SMSRequest):
    """SMS gönder endpoint'i"""
    try:
        if not NETGSM_PASS:
            raise HTTPException(status_code=500, detail="NetGSM şifresi tanımlanmamış")
        
        result = send_sms(
            to=request.to,
            message=request.message,
            header=request.header
        )
        
        if result["success"]:
            return SMSResponse(
                success=True,
                message_id=result["message_id"],
                error=None
            )
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SMS gönderim hatası: {str(e)}")

@router.post("/test")
async def test_sms(to: str = "5397426943", message: str = "Test"):
    """Test SMS gönder"""
    try:
        if not NETGSM_PASS:
            return {
                "success": False,
                "error": "NetGSM şifresi tanımlanmamış. docker-compose.yml'de NETGSM_PASS ekle."
            }
        
        # Manuel test URL'i oluştur
        test_url = f"https://api.netgsm.com.tr/sms/send/get?usercode={NETGSM_USER}&password={NETGSM_PASS}&gsmno=90{to.lstrip('0')}&message={quote(message)}&msgheader={NETGSM_HEADER}&filter=0&startdate=&stopdate=&encoding=TR&iysfilter=0"
        
        print(f"🧪 Manuel test URL: {test_url}")
        
        # Manuel test
        import requests
        manual_response = requests.get(test_url, timeout=30)
        print(f"🧪 Manuel test response: {manual_response.status_code} - {manual_response.text}")
        
        result = send_sms(to=to, message=message)
        
        return {
            "success": result["success"],
            "to": to,
            "message": message,
            "message_id": result.get("message_id"),
            "error": result.get("error"),
            "manual_test": {
                "url": test_url,
                "status": manual_response.status_code,
                "response": manual_response.text
            },
            "netgsm_config": {
                "user": NETGSM_USER,
                "header": NETGSM_HEADER,
                "pass_configured": bool(NETGSM_PASS)
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@router.get("/config")
async def get_sms_config():
    """SMS konfigürasyonunu göster (güvenlik için şifre gizli)"""
    return {
        "user": NETGSM_USER,
        "header": NETGSM_HEADER,
        "pass_configured": bool(NETGSM_PASS),
        "url": NETGSM_URL
    }
