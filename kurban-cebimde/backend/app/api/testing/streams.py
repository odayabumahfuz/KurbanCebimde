from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Stream
import os

router = APIRouter()

# Only enable in E2E test mode
if os.getenv("E2E_TEST") != "true":
    raise HTTPException(status_code=404, detail="Testing endpoints not available")

@router.get("/streams/{stream_id}/state")
async def get_stream_state(stream_id: str, db: Session = Depends(get_db)):
    """Get current state of a stream for E2E testing"""
    stream = db.query(Stream).filter(Stream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    return {
        "id": stream.id,
        "status": stream.status,
        "started_at": stream.started_at,
        "ended_at": stream.ended_at,
        "duration_seconds": stream.duration_seconds,
    }

@router.post("/streams/{stream_id}/start")
async def start_stream_test(stream_id: str, db: Session = Depends(get_db)):
    """Start a stream for E2E testing"""
    stream = db.query(Stream).filter(Stream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    stream.status = "live"
    stream.started_at = db.query(func.now()).scalar()
    db.commit()
    
    return {"status": "live", "started_at": stream.started_at}

@router.post("/streams/{stream_id}/end")
async def end_stream_test(stream_id: str, db: Session = Depends(get_db)):
    """End a stream for E2E testing"""
    stream = db.query(Stream).filter(Stream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    stream.status = "ended"
    stream.ended_at = db.query(func.now()).scalar()
    db.commit()
    
    return {"status": "ended", "ended_at": stream.ended_at}
