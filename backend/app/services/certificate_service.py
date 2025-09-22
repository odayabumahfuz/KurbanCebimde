import os
import uuid
import time
from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

class Certificate(BaseModel):
    id: str
    user_id: str
    kurban_id: str
    certificate_type: str  # "kurban", "bagis", "katilim"
    title: str
    description: str
    issued_date: str
    expiry_date: Optional[str] = None
    status: str  # "active", "expired", "revoked"
    verification_code: str
    qr_code_url: Optional[str] = None
    pdf_url: Optional[str] = None
    metadata: Dict = {}

class CertificateService:
    def __init__(self):
        self.certificates: Dict[str, Certificate] = {}
        self._initialize_mock_data()
    
    def _initialize_mock_data(self):
        """Mock sertifika verilerini başlat"""
        mock_certificates = [
            {
                "id": "cert_001",
                "user_id": "user_123",
                "kurban_id": "kurban_001",
                "certificate_type": "kurban",
                "title": "Kurban Katılım Sertifikası",
                "description": "2024 Kurban Bayramı kurban kesimi katılım sertifikası",
                "issued_date": "2024-06-15",
                "expiry_date": "2025-06-15",
                "status": "active",
                "verification_code": "KC2024001",
                "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=KC2024001",
                "pdf_url": "/api/certificates/cert_001/download",
                "metadata": {
                    "animal_type": "koyun",
                    "weight": "45kg",
                    "location": "Ankara",
                    "imam": "Mehmet Yılmaz"
                }
            },
            {
                "id": "cert_002",
                "user_id": "user_456",
                "kurban_id": "kurban_002",
                "certificate_type": "bagis",
                "title": "Bağış Katılım Sertifikası",
                "description": "Kurban bağışı katılım sertifikası",
                "issued_date": "2024-06-16",
                "expiry_date": None,
                "status": "active",
                "verification_code": "KC2024002",
                "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=KC2024002",
                "pdf_url": "/api/certificates/cert_002/download",
                "metadata": {
                    "amount": 500.0,
                    "currency": "TL",
                    "payment_method": "kredi_karti"
                }
            },
            {
                "id": "cert_003",
                "user_id": "user_789",
                "kurban_id": "kurban_003",
                "certificate_type": "katilim",
                "title": "Etkinlik Katılım Sertifikası",
                "description": "Kurban organizasyonu katılım sertifikası",
                "issued_date": "2024-06-17",
                "expiry_date": "2025-06-17",
                "status": "active",
                "verification_code": "KC2024003",
                "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=KC2024003",
                "pdf_url": "/api/certificates/cert_003/download",
                "metadata": {
                    "event_name": "Kurban Organizasyonu 2024",
                    "location": "İstanbul",
                    "duration": "3 gün"
                }
            }
        ]
        
        for cert_data in mock_certificates:
            certificate = Certificate(**cert_data)
            self.certificates[certificate.id] = certificate
    
    async def create_certificate(self, 
                               user_id: str,
                               kurban_id: str,
                               certificate_type: str,
                               title: str,
                               description: str,
                               metadata: Dict = {}) -> Certificate:
        """Yeni sertifika oluştur"""
        cert_id = f"cert_{uuid.uuid4().hex[:8]}"
        verification_code = f"KC{int(time.time())}{random.randint(100, 999)}"
        
        certificate = Certificate(
            id=cert_id,
            user_id=user_id,
            kurban_id=kurban_id,
            certificate_type=certificate_type,
            title=title,
            description=description,
            issued_date=datetime.now().strftime("%Y-%m-%d"),
            expiry_date=(datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d") if certificate_type != "bagis" else None,
            status="active",
            verification_code=verification_code,
            qr_code_url=f"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={verification_code}",
            pdf_url=f"/api/certificates/{cert_id}/download",
            metadata=metadata
        )
        
        self.certificates[cert_id] = certificate
        return certificate
    
    async def get_certificate(self, cert_id: str) -> Optional[Certificate]:
        """Sertifika getir"""
        return self.certificates.get(cert_id)
    
    async def get_user_certificates(self, user_id: str) -> List[Certificate]:
        """Kullanıcının sertifikalarını getir"""
        return [cert for cert in self.certificates.values() if cert.user_id == user_id]
    
    async def verify_certificate(self, verification_code: str) -> Optional[Certificate]:
        """Sertifika doğrula"""
        for cert in self.certificates.values():
            if cert.verification_code == verification_code:
                return cert
        return None
    
    async def revoke_certificate(self, cert_id: str) -> bool:
        """Sertifikayı iptal et"""
        if cert_id in self.certificates:
            self.certificates[cert_id].status = "revoked"
            return True
        return False
    
    async def get_all_certificates(self, 
                                 skip: int = 0, 
                                 limit: int = 100,
                                 status: Optional[str] = None,
                                 certificate_type: Optional[str] = None) -> List[Certificate]:
        """Tüm sertifikaları getir (filtreleme ile)"""
        certificates = list(self.certificates.values())
        
        if status:
            certificates = [cert for cert in certificates if cert.status == status]
        
        if certificate_type:
            certificates = [cert for cert in certificates if cert.certificate_type == certificate_type]
        
        # Sıralama (en yeni önce)
        certificates.sort(key=lambda x: x.issued_date, reverse=True)
        
        return certificates[skip:skip + limit]
    
    async def get_certificate_stats(self) -> Dict:
        """Sertifika istatistikleri"""
        total = len(self.certificates)
        active = len([cert for cert in self.certificates.values() if cert.status == "active"])
        expired = len([cert for cert in self.certificates.values() if cert.status == "expired"])
        revoked = len([cert for cert in self.certificates.values() if cert.status == "revoked"])
        
        by_type = {}
        for cert in self.certificates.values():
            cert_type = cert.certificate_type
            by_type[cert_type] = by_type.get(cert_type, 0) + 1
        
        return {
            "total": total,
            "active": active,
            "expired": expired,
            "revoked": revoked,
            "by_type": by_type
        }
    
    async def generate_certificate_pdf(self, cert_id: str) -> Dict:
        """Sertifika PDF'i oluştur (mock)"""
        certificate = await self.get_certificate(cert_id)
        if not certificate:
            return {"success": False, "error": "Sertifika bulunamadı"}
        
        # Mock PDF oluşturma
        pdf_data = {
            "certificate_id": cert_id,
            "title": certificate.title,
            "verification_code": certificate.verification_code,
            "issued_date": certificate.issued_date,
            "qr_code": certificate.qr_code_url,
            "metadata": certificate.metadata
        }
        
        return {
            "success": True,
            "pdf_url": certificate.pdf_url,
            "data": pdf_data,
            "message": "PDF başarıyla oluşturuldu"
        }

# Global instance
certificate_service = CertificateService()
