from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.api.admin.v1.auth import get_current_admin_user
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=dict)
async def get_users(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    
    query = db.query(User)
    
    # Search filter
    if search:
        query = query.filter(
            or_(
                User.name.ilike(f"%{search}%"),
                User.surname.ilike(f"%{search}%"),
                User.phone.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )
    
    # Pagination
    total = query.count()
    users = query.offset((page - 1) * size).limit(size).all()
    
    return {
        "items": users,
        "total": total,
        "page": page,
        "size": size
    }
