from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, donations, streams
from app.api.admin.v1 import auth as admin_auth, users, donations as admin_donations, streams as admin_streams
from app.api.testing import streams as testing_streams, notifications as testing_notifications

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="KurbanCebimde API",
    description="Kurban bağış platformu API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "KurbanCebimde API is running"}

# Test endpoint
@app.get("/test")
async def test():
    return {"message": "Test endpoint working"}

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(donations.router, prefix="/api/v1/donations", tags=["donations"])
app.include_router(streams.router, prefix="/api/v1/streams", tags=["streams"])

# Admin routers
app.include_router(admin_auth.router, prefix="/api/admin/v1/auth", tags=["admin-auth"])
app.include_router(users.router, prefix="/api/admin/v1/users", tags=["admin-users"])
app.include_router(admin_donations.router, prefix="/api/admin/v1/donations", tags=["admin-donations"])
app.include_router(admin_streams.router, prefix="/api/admin/v1/streams", tags=["admin-streams"])

# Testing routers (only available when E2E_TEST=true)
app.include_router(testing_streams.router, prefix="/testing", tags=["testing-streams"])
app.include_router(testing_notifications.router, prefix="/testing", tags=["testing-notifications"])

# Stats endpoint
@app.get("/api/admin/v1/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get admin stats"""
    from app.models.user import User
    from app.models.donation import Donation
    from app.models.stream import Stream
    
    total_users = db.query(User).count()
    total_donations = db.query(Donation).count()
    total_streams = db.query(Stream).count()
    active_streams = db.query(Stream).filter(Stream.status == "live").count()
    
    return {
        "total_users": total_users,
        "total_donations": total_donations,
        "total_streams": total_streams,
        "active_streams": active_streams
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT)
