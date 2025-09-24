from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.donation import Donation
from app.models.user import User
from app.schemas.donation import DonationResponse, DonationUpdate
from app.api.admin.v1.auth import get_current_admin_user
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/", response_model=dict)
async def get_donations(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by user name or phone"),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all donations with user info (admin only)"""
    
    # Join with users table to get user info
    query = db.query(Donation).join(User, Donation.user_id == User.id)
    
    # Status filter
    if status:
        query = query.filter(Donation.status == status)
    
    # Search filter
    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) |
            (User.surname.ilike(f"%{search}%")) |
            (User.phone.ilike(f"%{search}%"))
        )
    
    # Pagination
    total = query.count()
    donations = query.order_by(Donation.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    # Format response with user info
    formatted_donations = []
    for donation in donations:
        formatted_donations.append({
            "id": donation.id,
            "amount": donation.amount,
            "currency": donation.currency,
            "status": donation.status,
            "video_url": donation.video_url,
            "certificate_url": donation.certificate_url,
            "notes": donation.notes,
            "created_at": donation.created_at,
            "updated_at": donation.updated_at,
            "user": {
                "id": donation.user.id,
                "name": donation.user.name,
                "surname": donation.user.surname,
                "phone": donation.user.phone,
                "email": donation.user.email
            }
        })
    
    return {
        "items": formatted_donations,
        "total": total,
        "page": page,
        "size": size
    }

@router.patch("/{donation_id}", response_model=DonationResponse)
async def update_donation(
    donation_id: str,
    donation_update: DonationUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update donation (admin only)"""
    # Check if user is admin or super_admin
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin yetkisi gerekli"
        )
    
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bağış bulunamadı"
        )
    
    # Update fields
    if donation_update.status:
        donation.status = donation_update.status
    if donation_update.video_url:
        donation.video_url = donation_update.video_url
    if donation_update.certificate_url:
        donation.certificate_url = donation_update.certificate_url
    if donation_update.notes:
        donation.notes = donation_update.notes
    
    db.commit()
    db.refresh(donation)
    
    return donation

@router.get("/stats", response_model=dict)
async def get_donation_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get donation statistics (admin only)"""
    # Check if user is admin or super_admin
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin yetkisi gerekli"
        )
    
    # Total donations
    total_donations = db.query(Donation).count()
    
    # Total amount
    total_amount = db.query(Donation).filter(Donation.status == "PAID").all()
    total_amount_sum = sum(float(d.amount) for d in total_amount)
    
    # Status counts
    pending_count = db.query(Donation).filter(Donation.status == "PENDING").count()
    paid_count = db.query(Donation).filter(Donation.status == "PAID").count()
    assigned_count = db.query(Donation).filter(Donation.status == "ASSIGNED").count()
    completed_count = db.query(Donation).filter(Donation.status == "COMPLETED").count()
    
    # Recent donations (last 7 days)
    week_ago = datetime.now() - timedelta(days=7)
    recent_donations = db.query(Donation).filter(Donation.created_at >= week_ago).count()
    
    return {
        "total_donations": total_donations,
        "total_amount": total_amount_sum,
        "currency": "TRY",
        "status_counts": {
            "pending": pending_count,
            "paid": paid_count,
            "assigned": assigned_count,
            "completed": completed_count
        },
        "recent_donations_7d": recent_donations
    }
