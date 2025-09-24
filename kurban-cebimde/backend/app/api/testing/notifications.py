from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Notification
import os

router = APIRouter()

# Only enable in E2E test mode
if os.getenv("E2E_TEST") != "true":
    raise HTTPException(status_code=404, detail="Testing endpoints not available")

@router.get("/notifications/last")
async def get_last_notification(
    userId: str = Query(..., description="User ID to get last notification for"),
    db: Session = Depends(get_db)
):
    """Get the last notification sent to a user for E2E testing"""
    notification = db.query(Notification).filter(
        Notification.user_id == userId
    ).order_by(Notification.created_at.desc()).first()
    
    if not notification:
        return {"message": None, "created_at": None}
    
    return {
        "message": notification.message,
        "created_at": notification.created_at,
        "user_id": notification.user_id,
        "type": notification.type,
    }

@router.post("/notifications/send")
async def send_test_notification(
    user_id: str,
    message: str,
    notification_type: str = "broadcast",
    db: Session = Depends(get_db)
):
    """Send a test notification for E2E testing"""
    notification = Notification(
        user_id=user_id,
        message=message,
        type=notification_type,
        is_sent=True
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return {
        "id": notification.id,
        "message": notification.message,
        "user_id": notification.user_id,
        "created_at": notification.created_at,
    }
