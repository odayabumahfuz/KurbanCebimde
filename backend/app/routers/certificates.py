from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict

from ..services.certificate_service import certificate_service, Certificate

router = APIRouter()

# Request Models
class CreateCertificateRequest(BaseModel):
    user_id: str
    kurban_id: str
    certificate_type: str  # "kurban", "bagis", "katilim"
    title: str
    description: str
    metadata: Dict = {}

# Endpoints
@router.post("/create")
async def create_certificate(request: CreateCertificateRequest):
    """Yeni sertifika oluştur"""
    try:
        certificate = await certificate_service.create_certificate(
            user_id=request.user_id,
            kurban_id=request.kurban_id,
            certificate_type=request.certificate_type,
            title=request.title,
            description=request.description,
            metadata=request.metadata
        )
        
        return {
            "success": True,
            "message": "Sertifika başarıyla oluşturuldu",
            "data": certificate.dict()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sertifika oluşturulurken hata: {str(e)}")

@router.get("/{cert_id}")
async def get_certificate(cert_id: str):
    """Sertifika detaylarını getir"""
    try:
        certificate = await certificate_service.get_certificate(cert_id)
        
        if not certificate:
            raise HTTPException(status_code=404, detail="Sertifika bulunamadı")
        
        return {
            "success": True,
            "data": certificate.dict()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sertifika getirilirken hata: {str(e)}")

@router.get("/user/{user_id}")
async def get_user_certificates(user_id: str):
    """Kullanıcının sertifikalarını getir"""
    try:
        certificates = await certificate_service.get_user_certificates(user_id)
        
        return {
            "success": True,
            "data": [cert.dict() for cert in certificates],
            "count": len(certificates)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kullanıcı sertifikaları getirilirken hata: {str(e)}")

@router.get("/verify/{verification_code}")
async def verify_certificate(verification_code: str):
    """Sertifika doğrula"""
    try:
        certificate = await certificate_service.verify_certificate(verification_code)
        
        if not certificate:
            raise HTTPException(status_code=404, detail="Geçersiz doğrulama kodu")
        
        return {
            "success": True,
            "message": "Sertifika doğrulandı",
            "data": certificate.dict()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sertifika doğrulanırken hata: {str(e)}")

@router.delete("/{cert_id}/revoke")
async def revoke_certificate(cert_id: str):
    """Sertifikayı iptal et"""
    try:
        success = await certificate_service.revoke_certificate(cert_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Sertifika bulunamadı")
        
        return {
            "success": True,
            "message": "Sertifika iptal edildi"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sertifika iptal edilirken hata: {str(e)}")

@router.get("/")
async def get_all_certificates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    certificate_type: Optional[str] = Query(None)
):
    """Tüm sertifikaları getir (filtreleme ile)"""
    try:
        certificates = await certificate_service.get_all_certificates(
            skip=skip,
            limit=limit,
            status=status,
            certificate_type=certificate_type
        )
        
        return {
            "success": True,
            "data": [cert.dict() for cert in certificates],
            "count": len(certificates),
            "pagination": {
                "skip": skip,
                "limit": limit,
                "has_more": len(certificates) == limit
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sertifikalar getirilirken hata: {str(e)}")

@router.get("/stats/overview")
async def get_certificate_stats():
    """Sertifika istatistikleri"""
    try:
        stats = await certificate_service.get_certificate_stats()
        
        return {
            "success": True,
            "data": stats
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"İstatistikler getirilirken hata: {str(e)}")

@router.get("/{cert_id}/download")
async def download_certificate_pdf(cert_id: str):
    """Sertifika PDF'ini indir"""
    try:
        result = await certificate_service.generate_certificate_pdf(cert_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return {
            "success": True,
            "message": "PDF başarıyla oluşturuldu",
            "data": result["data"],
            "download_url": result["pdf_url"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF oluşturulurken hata: {str(e)}")

@router.get("/mock/sample")
async def get_sample_certificates():
    """Örnek sertifikaları getir (test için)"""
    try:
        # İlk 3 sertifikayı döndür
        certificates = list(certificate_service.certificates.values())[:3]
        
        return {
            "success": True,
            "message": "Örnek sertifikalar",
            "data": [cert.dict() for cert in certificates]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Örnek sertifikalar getirilirken hata: {str(e)}")

@router.post("/mock/generate")
async def generate_mock_certificate():
    """Mock sertifika oluştur (test için)"""
    try:
        certificate = await certificate_service.create_certificate(
            user_id="mock_user_123",
            kurban_id="mock_kurban_456",
            certificate_type="kurban",
            title="Mock Kurban Sertifikası",
            description="Test amaçlı oluşturulmuş sertifika",
            metadata={
                "animal_type": "koyun",
                "weight": "50kg",
                "location": "Test Lokasyonu",
                "imam": "Test İmam"
            }
        )
        
        return {
            "success": True,
            "message": "Mock sertifika oluşturuldu",
            "data": certificate.dict()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mock sertifika oluşturulurken hata: {str(e)}")
