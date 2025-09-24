from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, verify_token
from app.models.user import User
from app.schemas.auth import Token, UserResponse
from datetime import timedelta
from app.core.config import settings
from pydantic import BaseModel

router = APIRouter()
security = HTTPBearer()

def get_current_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated admin user"""
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
    
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin yetkisi gerekli"
        )
    
    return user

router = APIRouter()

class AdminLogin(BaseModel):
    phoneOrEmail: str
    password: str

@router.post("/login", response_model=Token)
async def admin_login(credentials: AdminLogin, db: Session = Depends(get_db)):
    """Admin login"""
    print(f"🔐 Admin login attempt: phoneOrEmail='{credentials.phoneOrEmail}', password='{credentials.password}'")
    
    # Simple admin check (in production, use proper admin table)
    if credentials.phoneOrEmail == "admin" and credentials.password == "admin123":
        # Find admin user by email
        admin_user = db.query(User).filter(User.email == "admin@kurbancebimde.com").first()
        if not admin_user:
            # Create admin user if not exists
            admin_user = User(
                name="Admin",
                surname="User",
                phone="0000000000",
                email="admin@kurbancebimde.com",
                password_hash="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K",  # admin123
                role="admin",
                is_admin=True,
                is_super_admin=True,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": admin_user.id}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kullanıcı adı veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
