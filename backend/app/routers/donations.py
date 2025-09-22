from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
import uuid
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings
import jwt
from datetime import datetime
import os

router = APIRouter(tags=["donations"])

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:password@postgres:5432/kurban_cebimde"
    SECRET_KEY: str = "your-secret-key-change-in-production"

settings = Settings()
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Pydantic Models
class DonationCreate(BaseModel):
    amount: float
    donor_name: str
    donor_phone: Optional[str] = None
    donor_email: Optional[str] = None
    payment_method: Optional[str] = "iyzico"
    notes: Optional[str] = None

class DonationResponse(BaseModel):
    id: str
    user_id: str
    amount: float
    donor_name: str
    donor_phone: Optional[str]
    donor_email: Optional[str]
    payment_method: Optional[str]
    payment_status: str
    payment_reference: Optional[str]
    payment_date: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

class PaymentRequest(BaseModel):
    payment_method: str = "iyzico"
    payment_reference: Optional[str] = None

class CertificateResponse(BaseModel):
    id: str
    certificate_type: str
    pdf_path: Optional[str]
    qr_code: Optional[str]
    verification_code: str
    created_at: datetime

# Helper Functions
def get_current_user(authorization: str = Header(None)):
    """JWT token'dan kullanıcı bilgilerini al"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token gerekli")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Geçersiz token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token süresi dolmuş")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Geçersiz token")

def get_db():
    """Database session al"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Endpoints

@router.post("/donations/create", response_model=DonationResponse)
async def create_donation(
    donation_data: DonationCreate,
    current_user_id: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Yeni bağış oluştur"""
    try:
        donation_id = str(uuid.uuid4())
        
        # Bağışı veritabanına kaydet
        db.execute(text("""
            INSERT INTO donations (id, user_id, amount, donor_name, donor_phone, donor_email, 
                                 payment_method, payment_status, notes, created_at, updated_at)
            VALUES (:id, :user_id, :amount, :donor_name, :donor_phone, :donor_email, 
                   :payment_method, 'pending', :notes, NOW(), NOW())
        """), {
            "id": donation_id,
            "user_id": current_user_id,
            "amount": donation_data.amount,
            "donor_name": donation_data.donor_name,
            "donor_phone": donation_data.donor_phone,
            "donor_email": donation_data.donor_email,
            "payment_method": donation_data.payment_method,
            "notes": donation_data.notes
        })
        
        # Oluşturulan bağışı getir
        result = db.execute(text("""
            SELECT id, user_id, amount, donor_name, donor_phone, donor_email, payment_method,
                   payment_status, payment_reference, payment_date, notes, created_at, updated_at
            FROM donations WHERE id = :id
        """), {"id": donation_id})
        
        donation = result.fetchone()
        db.commit()
        
        return DonationResponse(
            id=str(donation.id),
            user_id=str(donation.user_id),
            amount=float(donation.amount),
            donor_name=donation.donor_name,
            donor_phone=donation.donor_phone,
            donor_email=donation.donor_email,
            payment_method=donation.payment_method,
            payment_status=donation.payment_status,
            payment_reference=donation.payment_reference,
            payment_date=donation.payment_date,
            notes=donation.notes,
            created_at=donation.created_at,
            updated_at=donation.updated_at
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Bağış oluşturulamadı: {str(e)}")

@router.get("/donations/my-donations", response_model=List[DonationResponse])
async def get_my_donations(
    current_user_id: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Kullanıcının bağışlarını getir"""
    try:
        result = db.execute(text("""
            SELECT id, user_id, amount, donor_name, donor_phone, donor_email, payment_method,
                   payment_status, payment_reference, payment_date, notes, created_at, updated_at
            FROM donations 
            WHERE user_id = :user_id
            ORDER BY created_at DESC
        """), {"user_id": current_user_id})
        
        donations = result.fetchall()
        
        return [
            DonationResponse(
                id=str(donation.id),
                user_id=str(donation.user_id),
                amount=float(donation.amount),
                donor_name=donation.donor_name,
                donor_phone=donation.donor_phone,
                donor_email=donation.donor_email,
                payment_method=donation.payment_method,
                payment_status=donation.payment_status,
                payment_reference=donation.payment_reference,
                payment_date=donation.payment_date,
                notes=donation.notes,
                created_at=donation.created_at,
                updated_at=donation.updated_at
            )
            for donation in donations
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bağışlar getirilemedi: {str(e)}")

@router.get("/donations/{donation_id}", response_model=DonationResponse)
async def get_donation(
    donation_id: str,
    current_user_id: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Belirli bir bağışı getir"""
    try:
        result = db.execute(text("""
            SELECT id, user_id, amount, donor_name, donor_phone, donor_email, payment_method,
                   payment_status, payment_reference, payment_date, notes, created_at, updated_at
            FROM donations 
            WHERE id = :donation_id AND user_id = :user_id
        """), {"donation_id": donation_id, "user_id": current_user_id})
        
        donation = result.fetchone()
        if not donation:
            raise HTTPException(status_code=404, detail="Bağış bulunamadı")
        
        return DonationResponse(
            id=str(donation.id),
            user_id=str(donation.user_id),
            amount=float(donation.amount),
            donor_name=donation.donor_name,
            donor_phone=donation.donor_phone,
            donor_email=donation.donor_email,
            payment_method=donation.payment_method,
            payment_status=donation.payment_status,
            payment_reference=donation.payment_reference,
            payment_date=donation.payment_date,
            notes=donation.notes,
            created_at=donation.created_at,
            updated_at=donation.updated_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bağış getirilemedi: {str(e)}")

@router.post("/donations/{donation_id}/payment")
async def process_payment(
    donation_id: str,
    payment_data: PaymentRequest,
    current_user_id: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Bağış ödemesini işle"""
    try:
        # Bağışın var olduğunu kontrol et
        result = db.execute(text("""
            SELECT id, amount, payment_status FROM donations 
            WHERE id = :donation_id AND user_id = :user_id
        """), {"donation_id": donation_id, "user_id": current_user_id})
        
        donation = result.fetchone()
        if not donation:
            raise HTTPException(status_code=404, detail="Bağış bulunamadı")
        
        if donation.payment_status != "pending":
            raise HTTPException(status_code=400, detail="Bu bağış zaten işlenmiş")
        
        # Ödeme işlemini simüle et (gerçek ödeme gateway'i entegrasyonu burada olacak)
        payment_reference = f"PAY_{donation_id}_{int(datetime.now().timestamp())}"
        
        # Ödeme durumunu güncelle
        db.execute(text("""
            UPDATE donations 
            SET payment_status = 'completed', 
                payment_reference = :payment_reference,
                payment_date = NOW(),
                updated_at = NOW()
            WHERE id = :donation_id
        """), {
            "donation_id": donation_id,
            "payment_reference": payment_reference
        })
        
        db.commit()
        
        return {
            "success": True,
            "message": "Ödeme başarıyla tamamlandı",
            "payment_reference": payment_reference,
            "amount": float(donation.amount)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ödeme işlenemedi: {str(e)}")

@router.get("/donations/{donation_id}/certificate", response_model=CertificateResponse)
async def get_donation_certificate(
    donation_id: str,
    current_user_id: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Bağış sertifikasını getir"""
    try:
        # Bağışın var olduğunu kontrol et
        donation_result = db.execute(text("""
            SELECT id, amount, payment_status FROM donations 
            WHERE id = :donation_id AND user_id = :user_id
        """), {"donation_id": donation_id, "user_id": current_user_id})
        
        donation = donation_result.fetchone()
        if not donation:
            raise HTTPException(status_code=404, detail="Bağış bulunamadı")
        
        if donation.payment_status != "completed":
            raise HTTPException(status_code=400, detail="Ödeme tamamlanmamış bağışlar için sertifika oluşturulamaz")
        
        # Sertifikayı getir
        cert_result = db.execute(text("""
            SELECT id, certificate_type, pdf_path, qr_code, verification_code, created_at
            FROM certificates 
            WHERE donation_id = :donation_id
        """), {"donation_id": donation_id})
        
        certificate = cert_result.fetchone()
        if not certificate:
            raise HTTPException(status_code=404, detail="Bu bağış için sertifika bulunamadı")
        
        return CertificateResponse(
            id=str(certificate.id),
            certificate_type=certificate.certificate_type,
            pdf_path=certificate.pdf_path,
            qr_code=certificate.qr_code,
            verification_code=certificate.verification_code,
            created_at=certificate.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sertifika getirilemedi: {str(e)}")
