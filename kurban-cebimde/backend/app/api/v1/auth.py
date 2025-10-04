from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, verify_token
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from datetime import timedelta
from app.core.config import settings

router = APIRouter()
security = HTTPBearer()

def normalize_phone(phone_raw: str) -> str:
    """Normalize phone number"""
    if not phone_raw:
        return ""
    # Sadece rakamları al
    digits = ''.join(ch for ch in str(phone_raw) if ch.isdigit())
    # Ülke kodu 90 ise at
    if digits.startswith('90') and len(digits) >= 12:
        digits = digits[2:]
    # Başta 0 varsa at
    if digits.startswith('0') and len(digits) >= 11:
        digits = digits[1:]
    # 10 haneden uzunsa son 10 haneyi al
    if len(digits) > 10:
        digits = digits[-10:]
    return digits

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı bulunamadı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

@router.post("/otp/send", response_model=dict)
async def send_otp(request: dict, db: Session = Depends(get_db)):
    """Send OTP to phone number"""
    # Get phone from request
    phone = request.get("phone", "")
    # Normalize phone
    normalized_phone = normalize_phone(phone)
    
    if not normalized_phone or len(normalized_phone) != 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz telefon numarası"
        )
    
    # Generate OTP (for testing, use 123456)
    otp_code = "123456"
    
    # TODO: Implement SMS sending with NetGSM
    # For now, just return success
    
    return {
        "success": True,
        "message": "OTP gönderildi",
        "phone": normalized_phone,
        "otp": otp_code  # Remove this in production
    }

@router.post("/otp/verify", response_model=dict)
async def verify_otp(request: dict, db: Session = Depends(get_db)):
    """Verify OTP and login/register user"""
    # Get phone and otp from request
    phone = request.get("phone", "")
    otp = request.get("otp", "")
    # Normalize phone
    normalized_phone = normalize_phone(phone)
    
    if not normalized_phone or len(normalized_phone) != 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz telefon numarası"
        )
    
    # For testing, accept any OTP
    if otp != "123456":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz OTP kodu"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.phone == normalized_phone).first()
    
    if not user:
        # Create new user
        user = User(
            phone=normalized_phone,
            name=f"User {normalized_phone}",
            role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id), "phone": user.phone, "role": user.role},
        expires_delta=timedelta(hours=24)
    )
    
    return {
        "success": True,
        "message": "Giriş başarılı",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "phone": user.phone,
            "name": user.name,
            "role": user.role
        }
    }

@router.post("/register", response_model=dict)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register new user"""
    # Normalize phone
    phone = normalize_phone(user_data.phone)
    
    # Check if phone already exists
    existing_user = db.query(User).filter(User.phone == phone).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu telefon numarası zaten kayıtlı"
        )
    
    # Check if email already exists (if provided)
    if user_data.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bu email zaten kayıtlı"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    username = f"{user_data.name.lower()}{user_data.phone[:8]}"
    
    user = User(
        name=user_data.name,
        surname=user_data.surname,
        username=username,
        phone=phone,
        email=user_data.email,
        password_hash=hashed_password
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {"message": "Kayıt başarılı", "user_id": user.id}

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    # Normalize phone/email
    phone_or_email = normalize_phone(credentials.phoneOrEmail)
    
    # Find user by phone or email
    user = db.query(User).filter(
        or_(User.phone == phone_or_email, User.email == credentials.phoneOrEmail)
    ).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz telefon/email veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (token will expire naturally)"""
    return {"message": "Çıkış yapıldı"}
