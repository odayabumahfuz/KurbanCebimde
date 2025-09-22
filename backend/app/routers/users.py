from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
import uuid
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings
import jwt
from datetime import datetime, timedelta
import os

router = APIRouter(tags=["users"])

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:password@postgres:5432/kurban_cebimde"
    SECRET_KEY: str = "your-secret-key-change-in-production"

settings = Settings()
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Pydantic Models
class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    surname: str
    phone: str
    email: Optional[str]
    role: str
    is_admin: bool
    is_super_admin: bool
    is_active: bool
    email_verified: bool
    phone_verified: bool
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime

class DonationResponse(BaseModel):
    id: str
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

class CertificateResponse(BaseModel):
    id: str
    certificate_type: str
    certificate_data: Optional[dict]
    pdf_path: Optional[str]
    qr_code: Optional[str]
    verification_code: str
    is_verified: bool
    verified_at: Optional[datetime]
    created_at: datetime

class StreamResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: str
    scheduled_at: Optional[datetime]
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    duration_minutes: Optional[int]
    room_name: Optional[str]
    participant_count: int
    max_participants: int
    created_at: datetime
    updated_at: datetime

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

@router.get("/users/profile", response_model=UserResponse)
async def get_user_profile(
    current_user_id: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Kullanıcı profil bilgilerini getir"""
    try:
        result = db.execute(text("""
            SELECT id, name, surname, phone, email, role, is_admin, is_super_admin, 
                   is_active, email_verified, phone_verified, last_login, created_at, updated_at
            FROM users WHERE id = :user_id
        """), {"user_id": current_user_id})
        
        user = result.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
        return UserResponse(
            id=str(user.id),
            name=user.name,
            surname=user.surname,
            phone=user.phone,
            email=user.email,
            role=user.role,
            is_admin=user.is_admin,
            is_super_admin=user.is_super_admin,
            is_active=user.is_active,
            email_verified=user.email_verified,
            phone_verified=user.phone_verified,
            last_login=user.last_login,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profil getirilemedi: {str(e)}")

@router.put("/users/profile", response_model=UserResponse)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user_id: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Kullanıcı profil bilgilerini güncelle"""
    try:
        # Güncellenecek alanları hazırla
        update_fields = []
        params = {"user_id": current_user_id}
        
        if profile_data.name is not None:
            update_fields.append("name = :name")
            params["name"] = profile_data.name
            
        if profile_data.surname is not None:
            update_fields.append("surname = :surname")
            params["surname"] = profile_data.surname
            
        if profile_data.email is not None:
            update_fields.append("email = :email")
            params["email"] = profile_data.email
            
        if profile_data.phone is not None:
            update_fields.append("phone = :phone")
            params["phone"] = profile_data.phone
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="Güncellenecek alan bulunamadı")
        
        # Updated_at ekle
        update_fields.append("updated_at = NOW()")
        
        query = f"""
            UPDATE users 
            SET {', '.join(update_fields)}
            WHERE id = :user_id
            RETURNING id, name, surname, phone, email, role, is_admin, is_super_admin, 
                     is_active, email_verified, phone_verified, last_login, created_at, updated_at
        """
        
        result = db.execute(text(query), params)
        user = result.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
        db.commit()
        
        return UserResponse(
            id=str(user.id),
            name=user.name,
            surname=user.surname,
            phone=user.phone,
            email=user.email,
            role=user.role,
            is_admin=user.is_admin,
            is_super_admin=user.is_super_admin,
            is_active=user.is_active,
            email_verified=user.email_verified,
            phone_verified=user.phone_verified,
            last_login=user.last_login,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Profil güncellenemedi: {str(e)}")

@router.get("/users/donations", response_model=List[DonationResponse])
async def get_user_donations(
    current_user_id: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Kullanıcının bağışlarını getir"""
    try:
        result = db.execute(text("""
            SELECT id, amount, donor_name, donor_phone, donor_email, payment_method,
                   payment_status, payment_reference, payment_date, notes, created_at, updated_at
            FROM donations 
            WHERE user_id = :user_id
            ORDER BY created_at DESC
        """), {"user_id": current_user_id})
        
        donations = result.fetchall()
        
        return [
            DonationResponse(
                id=str(donation.id),
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

@router.get("/users/certificates", response_model=List[CertificateResponse])
async def get_user_certificates(
    current_user_id: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Kullanıcının sertifikalarını getir"""
    try:
        result = db.execute(text("""
            SELECT id, certificate_type, certificate_data, pdf_path, qr_code,
                   verification_code, is_verified, verified_at, created_at
            FROM certificates 
            WHERE user_id = :user_id
            ORDER BY created_at DESC
        """), {"user_id": current_user_id})
        
        certificates = result.fetchall()
        
        return [
            CertificateResponse(
                id=str(cert.id),
                certificate_type=cert.certificate_type,
                certificate_data=cert.certificate_data,
                pdf_path=cert.pdf_path,
                qr_code=cert.qr_code,
                verification_code=cert.verification_code,
                is_verified=cert.is_verified,
                verified_at=cert.verified_at,
                created_at=cert.created_at
            )
            for cert in certificates
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sertifikalar getirilemedi: {str(e)}")

@router.get("/users/streams", response_model=List[StreamResponse])
async def get_user_streams(
    current_user_id: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Kullanıcının yayınlarını getir"""
    try:
        result = db.execute(text("""
            SELECT id, title, description, status, scheduled_at, started_at, ended_at,
                   duration_minutes, room_name, participant_count, max_participants, created_at, updated_at
            FROM streams 
            WHERE user_id = :user_id
            ORDER BY created_at DESC
        """), {"user_id": current_user_id})
        
        streams = result.fetchall()
        
        return [
            StreamResponse(
                id=str(stream.id),
                title=stream.title,
                description=stream.description,
                status=stream.status,
                scheduled_at=stream.scheduled_at,
                started_at=stream.started_at,
                ended_at=stream.ended_at,
                duration_minutes=stream.duration_minutes,
                room_name=stream.room_name,
                participant_count=stream.participant_count,
                max_participants=stream.max_participants,
                created_at=stream.created_at,
                updated_at=stream.updated_at
            )
            for stream in streams
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yayınlar getirilemedi: {str(e)}")
