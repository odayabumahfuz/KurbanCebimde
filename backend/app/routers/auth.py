from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import bcrypt
import uuid
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings
import jwt
from datetime import datetime, timedelta
import os

router = APIRouter(tags=["auth"])

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:password@postgres:5432/kurban_cebimde"
    SECRET_KEY: str = "your-secret-key-change-in-production"

settings = Settings()
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

class LoginRequest(BaseModel):
    phoneOrEmail: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    surname: str
    phone: str
    email: Optional[str] = None
    password: str

class PushTokenRequest(BaseModel):
    user_id: str
    expo_push_token: str
    platform: str

class DonationRequest(BaseModel):
    amount: int
    currency: str = "TRY"

class UserResponse(BaseModel):
    id: str
    name: str
    surname: str
    phone: str
    email: Optional[str]
    role: str
    is_admin: bool
    is_super_admin: bool

def create_access_token(user_id: str, role: str, is_admin: bool, is_super_admin: bool):
    """JWT access token oluştur"""
    payload = {
        "user_id": user_id,
        "role": role,
        "is_admin": is_admin,
        "is_super_admin": is_super_admin,
        "exp": datetime.utcnow() + timedelta(hours=24),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def create_refresh_token(user_id: str):
    """JWT refresh token oluştur"""
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=30),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

@router.post("/auth/login")
async def login(request: LoginRequest):
    """Mobil uygulama için login"""
    try:
        # Email mi telefon mu kontrol et
        if "@" in request.phoneOrEmail:
            # Email ile login
            email = request.phoneOrEmail
            phone = None
        else:
            # Telefon numarasını temizle - tüm özel karakterleri kaldır
            phone = request.phoneOrEmail.replace(" ", "").replace("-", "").replace("(", "").replace(")", "").replace("+", "")
            
            # Türkiye telefon numarası formatı kontrolü
            if phone.startswith("90") and len(phone) == 12:
                phone = phone[2:]  # 90 prefix'ini kaldır
            elif phone.startswith("0") and len(phone) == 11:
                phone = phone[1:]  # 0 prefix'ini kaldır
            elif not phone.startswith("5") or len(phone) != 10:
                raise HTTPException(status_code=400, detail="Geçersiz telefon numarası formatı")
            email = None
        
        with engine.connect() as conn:
            # Kullanıcıyı bul
            if email:
                result = conn.execute(text("""
                    SELECT id, name, surname, phone, email, password_hash, 
                           COALESCE(role, 'kullanıcı') as role,
                           COALESCE(is_admin, FALSE) as is_admin,
                           COALESCE(is_super_admin, FALSE) as is_super_admin
                    FROM users 
                    WHERE email = :email
                """), {"email": email})
            else:
                result = conn.execute(text("""
                    SELECT id, name, surname, phone, email, password_hash, 
                           COALESCE(role, 'kullanıcı') as role,
                           COALESCE(is_admin, FALSE) as is_admin,
                           COALESCE(is_super_admin, FALSE) as is_super_admin
                    FROM users 
                    WHERE phone = :phone
                """), {"phone": phone})
            
            user = result.fetchone()
            if not user:
                raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
            
            # Şifre kontrolü
            if not bcrypt.checkpw(request.password.encode('utf-8'), user.password_hash.encode('utf-8')):
                raise HTTPException(status_code=401, detail="Geçersiz şifre")
            
            # Token'ları oluştur
            access_token = create_access_token(user.id, user.role, user.is_admin, user.is_super_admin)
            refresh_token = create_refresh_token(user.id)
            
            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": 3600,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "surname": user.surname,
                    "phone": user.phone,
                    "email": user.email,
                    "role": user.role,
                    "is_admin": user.is_admin,
                    "is_super_admin": user.is_super_admin
                }
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Giriş yapılamadı")

@router.post("/auth/register")
async def register(request: RegisterRequest):
    """Mobil uygulama için kayıt"""
    try:
        # Telefon numarasını temizle - tüm özel karakterleri kaldır
        phone = request.phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "").replace("+", "")
        
        # Türkiye telefon numarası formatı kontrolü
        if phone.startswith("90") and len(phone) == 12:
            phone = phone[2:]  # 90 prefix'ini kaldır
        elif phone.startswith("0") and len(phone) == 11:
            phone = phone[1:]  # 0 prefix'ini kaldır
        elif not phone.startswith("5") or len(phone) != 10:
            raise HTTPException(status_code=400, detail="Geçersiz telefon numarası formatı")
        
        # Şifreyi hash'le
        hashed_password = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        user_id = str(uuid.uuid4())
        
        with engine.connect() as conn:
            # Telefon numarası kontrolü
            existing = conn.execute(text("SELECT id FROM users WHERE phone = :phone"), {"phone": phone}).fetchone()
            if existing:
                raise HTTPException(status_code=400, detail="Bu telefon numarası zaten kayıtlı")
            
            # Kullanıcıyı oluştur
            conn.execute(text("""
                INSERT INTO users (id, name, surname, phone, email, password_hash, 
                                 role, is_admin, is_super_admin, created_at, updated_at)
                VALUES (:id, :name, :surname, :phone, :email, :password_hash,
                        'kullanıcı', FALSE, FALSE, NOW(), NOW())
            """), {
                "id": user_id,
                "name": request.name,
                "surname": request.surname,
                "phone": phone,
                "email": request.email,
                "password_hash": hashed_password
            })
            conn.commit()
            
            # Token'ları oluştur
            access_token = create_access_token(user_id, "kullanıcı", False, False)
            refresh_token = create_refresh_token(user_id)
            
            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": 3600,
                "user": {
                    "id": user_id,
                    "name": request.name,
                    "surname": request.surname,
                    "phone": phone,
                    "email": request.email,
                    "role": "kullanıcı",
                    "is_admin": False,
                    "is_super_admin": False
                }
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Register error: {e}")
        raise HTTPException(status_code=500, detail="Kayıt yapılamadı")

@router.get("/auth/me")
async def get_current_user(authorization: str = Header(None)):
    """Mevcut kullanıcı bilgilerini getir"""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token gerekli")
        
        token = authorization.split(" ")[1]
        
        # Token'ı decode et
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Geçersiz token")
        
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, name, surname, phone, email, 
                       COALESCE(role, 'kullanıcı') as role,
                       COALESCE(is_admin, FALSE) as is_admin,
                       COALESCE(is_super_admin, FALSE) as is_super_admin
                FROM users 
                WHERE id = :user_id
            """), {"user_id": user_id})
            
            user = result.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
            
            return {
                "id": user.id,
                "name": user.name,
                "surname": user.surname,
                "phone": user.phone,
                "email": user.email,
                "role": user.role,
                "is_admin": user.is_admin,
                "is_super_admin": user.is_super_admin
            }
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token süresi dolmuş")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz token")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get current user error: {e}")
        raise HTTPException(status_code=500, detail="Kullanıcı bilgileri alınamadı")

@router.post("/auth/refresh")
async def refresh_token(request: dict):
    """Refresh token ile yeni access token al"""
    try:
        refresh_token = request.get("refresh_token")
        if not refresh_token:
            raise HTTPException(status_code=400, detail="Refresh token gerekli")
        
        # Refresh token'ı decode et
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Geçersiz refresh token")
        
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, COALESCE(role, 'kullanıcı') as role,
                       COALESCE(is_admin, FALSE) as is_admin,
                       COALESCE(is_super_admin, FALSE) as is_super_admin
                FROM users 
                WHERE id = :user_id
            """), {"user_id": user_id})
            
            user = result.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
            
            # Yeni access token oluştur
            access_token = create_access_token(user.id, user.role, user.is_admin, user.is_super_admin)
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": 3600
            }
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token süresi dolmuş")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz refresh token")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Refresh token error: {e}")
        raise HTTPException(status_code=500, detail="Token yenilenemedi")

@router.post("/user/push-token")
async def save_push_token(request: PushTokenRequest):
    """Kullanıcının push token'ını kaydet"""
    try:
        with engine.connect() as conn:
            # Push token tablosunu oluştur (yoksa)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_push_tokens (
                    id VARCHAR(255) PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    expo_push_token VARCHAR(500) NOT NULL,
                    platform VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """))
            
            # Mevcut token'ı kontrol et
            existing = conn.execute(text("""
                SELECT id FROM user_push_tokens 
                WHERE user_id = :user_id AND expo_push_token = :token
            """), {"user_id": request.user_id, "token": request.expo_push_token}).fetchone()
            
            if existing:
                # Token zaten kayıtlı, güncelle
                conn.execute(text("""
                    UPDATE user_push_tokens 
                    SET updated_at = NOW() 
                    WHERE user_id = :user_id AND expo_push_token = :token
                """), {"user_id": request.user_id, "token": request.expo_push_token})
            else:
                # Yeni token kaydet
                token_id = str(uuid.uuid4())
                conn.execute(text("""
                    INSERT INTO user_push_tokens (id, user_id, expo_push_token, platform, created_at, updated_at)
                    VALUES (:id, :user_id, :token, :platform, NOW(), NOW())
                """), {
                    "id": token_id,
                    "user_id": request.user_id,
                    "token": request.expo_push_token,
                    "platform": request.platform
                })
            
            conn.commit()
            
            return {
                "success": True,
                "message": "Push token başarıyla kaydedildi"
            }
            
    except Exception as e:
        print(f"Save push token error: {e}")
        raise HTTPException(status_code=500, detail="Push token kaydedilemedi")

@router.get("/user/{user_id}/push-tokens")
async def get_user_push_tokens(user_id: str):
    """Kullanıcının push token'larını getir"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT expo_push_token, platform, created_at, updated_at
                FROM user_push_tokens 
                WHERE user_id = :user_id
                ORDER BY updated_at DESC
            """), {"user_id": user_id})
            
            tokens = result.fetchall()
            
            return {
                "success": True,
                "data": [
                    {
                        "expo_push_token": token.expo_push_token,
                        "platform": token.platform,
                        "created_at": token.created_at.isoformat() if token.created_at else None,
                        "updated_at": token.updated_at.isoformat() if token.updated_at else None
                    }
                    for token in tokens
                ]
            }
            
    except Exception as e:
        print(f"Get push tokens error: {e}")
        raise HTTPException(status_code=500, detail="Push token'lar alınamadı")

@router.post("/donations")
async def create_donation(donation: DonationRequest, authorization: Optional[str] = Header(None)):
    """Kullanıcı bağışı oluştur"""
    try:
        # Token kontrolü
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token gerekli")
        
        token = authorization.split(" ")[1]
        
        # Token'ı decode et
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("user_id")
            if not user_id:
                raise HTTPException(status_code=401, detail="Geçersiz token")
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token süresi dolmuş")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Geçersiz token")
        
        # Veritabanına bağış kaydet
        db = SessionLocal()
        try:
            # Bağış tablosuna kaydet
            result = db.execute(text("""
                INSERT INTO donations (id, user_id, amount, status, created_at, updated_at)
                VALUES (:id, :user_id, :amount, :status, :created_at, :updated_at)
            """), {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "amount": donation.amount,
                "status": "pending",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            
            db.commit()
            
            return {
                "success": True,
                "message": "Bağış başarıyla oluşturuldu",
                "donation_id": result.lastrowid if hasattr(result, 'lastrowid') else None
            }
            
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create donation error: {e}")
        raise HTTPException(status_code=500, detail="Bağış oluşturulamadı")
