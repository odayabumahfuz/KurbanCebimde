from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    name: str
    surname: str
    phone: str
    email: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    phoneOrEmail: str
    password: str
    
    class Config:
        # Allow both phoneOrEmail and phone fields
        extra = "allow"

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    surname: str
    phone: str
    email: Optional[str] = None
    role: str
    
    class Config:
        from_attributes = True
