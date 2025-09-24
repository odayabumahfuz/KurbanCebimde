from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.donation import Donation
from app.models.user import User
from app.schemas.donation import DonationCreate, DonationUpdate, DonationResponse
from app.api.v1.auth import get_current_user
from typing import List, Optional
from decimal import Decimal

router = APIRouter()

@router.post("/", response_model=DonationResponse)
async def create_donation(
    donation_data: DonationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new donation"""
    donation = Donation(
        user_id=current_user.id,
        amount=donation_data.amount,
        currency=donation_data.currency,
        status="PENDING"  # Başlangıçta bekleyen durumda
    )
    
    db.add(donation)
    db.commit()
    db.refresh(donation)
    
    return donation

@router.get("/me", response_model=List[DonationResponse])
async def get_my_donations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """Get current user's donations"""
    query = db.query(Donation).filter(Donation.user_id == current_user.id)
    
    if status:
        query = query.filter(Donation.status == status)
    
    donations = query.order_by(Donation.created_at.desc()).all()
    return donations

@router.get("/{donation_id}", response_model=DonationResponse)
async def get_donation(
    donation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific donation by ID"""
    donation = db.query(Donation).filter(
        Donation.id == donation_id,
        Donation.user_id == current_user.id
    ).first()
    
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bağış bulunamadı"
        )
    
    return donation

@router.post("/{donation_id}/pay", response_model=dict)
async def process_payment(
    donation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process payment for donation (mock implementation)"""
    donation = db.query(Donation).filter(
        Donation.id == donation_id,
        Donation.user_id == current_user.id
    ).first()
    
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bağış bulunamadı"
        )
    
    if donation.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu bağış zaten işlenmiş"
        )
    
    # Mock payment processing
    # Gerçek uygulamada burada Stripe, Iyzico vs. entegrasyonu olur
    donation.status = "PAID"
    db.commit()
    
    return {
        "message": "Ödeme başarıyla işlendi",
        "donation_id": donation.id,
        "status": donation.status,
        "payment_id": f"mock_payment_{donation.id}"
    }
