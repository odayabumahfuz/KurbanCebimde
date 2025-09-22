from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import psutil, time
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import uuid
import logging
import traceback

from .middleware.error_handler import (
    global_exception_handler,
    validation_exception_handler,
    http_exception_handler,
    CustomHTTPException
)
from .middleware.rate_limiter import rate_limit_middleware

from .routers.live import router as live_router
from .routers.streams import router as streams_router
from .routers.admin import router as admin_router
from .routers.auth import router as auth_router
from .routers.users import router as users_router
from .routers.donations import router as donations_router
from .routers.livekit import router as livekit_router
from .routers.notifications import router as notifications_router
from .routers.certificates import router as certificates_router
from .routers.test import router as test_router
from .routers.error_test import router as error_test_router

load_dotenv()

def create_tables():
    """Tüm tabloları oluştur - Sistem Mimarisi Uyumlu"""
    try:
        DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:password@postgres:5432/kurban_cebimde")
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        
        with engine.connect() as conn:
            # Users tablosu (Sistem Mimarisi Uyumlu)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(100) NOT NULL,
                    surname VARCHAR(100) NOT NULL,
                    email VARCHAR(255) UNIQUE,
                    phone VARCHAR(20) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'user',
                    is_admin BOOLEAN DEFAULT FALSE,
                    is_super_admin BOOLEAN DEFAULT FALSE,
                    is_active BOOLEAN DEFAULT TRUE,
                    email_verified BOOLEAN DEFAULT FALSE,
                    phone_verified BOOLEAN DEFAULT FALSE,
                    last_login TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """))
            
            # Donations tablosu (Sistem Mimarisi Uyumlu)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS donations (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    amount DECIMAL(10,2) NOT NULL,
                    donor_name VARCHAR(100) NOT NULL,
                    donor_phone VARCHAR(20),
                    donor_email VARCHAR(255),
                    payment_method VARCHAR(50),
                    payment_status VARCHAR(50) DEFAULT 'pending',
                    payment_reference VARCHAR(255),
                    payment_date TIMESTAMP,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """))
            
            # Streams tablosu (Sistem Mimarisi Uyumlu)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS streams (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    admin_id UUID REFERENCES users(id),
                    title VARCHAR(200) NOT NULL,
                    description TEXT,
                    status VARCHAR(50) DEFAULT 'scheduled',
                    scheduled_at TIMESTAMP,
                    started_at TIMESTAMP,
                    ended_at TIMESTAMP,
                    duration_minutes INTEGER,
                    room_name VARCHAR(100),
                    participant_count INTEGER DEFAULT 0,
                    max_participants INTEGER DEFAULT 100,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """))
            
            # Certificates tablosu (Sistem Mimarisi Uyumlu)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS certificates (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    donation_id UUID REFERENCES donations(id),
                    stream_id UUID REFERENCES streams(id),
                    certificate_type VARCHAR(50) NOT NULL,
                    certificate_data JSONB,
                    pdf_path VARCHAR(500),
                    qr_code VARCHAR(500),
                    verification_code VARCHAR(100) UNIQUE,
                    is_verified BOOLEAN DEFAULT FALSE,
                    verified_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """))
            
            # Notifications tablosu (Sistem Mimarisi Uyumlu)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR(200) NOT NULL,
                    message TEXT NOT NULL,
                    notification_type VARCHAR(50),
                    channel VARCHAR(50),
                    status VARCHAR(50) DEFAULT 'pending',
                    sent_at TIMESTAMP,
                    read_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """))
            
            # User Sessions tablosu (Redis backup)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    session_token VARCHAR(500) UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """))
            
            # Performance indexes
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(payment_status)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_streams_user_id ON streams(user_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_streams_status ON streams(status)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_streams_scheduled_at ON streams(scheduled_at)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status)"))
            
            conn.commit()
            print("✅ Sistem Mimarisi Uyumlu Tüm Tablolar Oluşturuldu!")
    except Exception as e:
        print(f"❌ Tablolar oluşturulamadı: {e}")


def create_app() -> FastAPI:
    # Migration'ı çalıştır
    create_tables()
    
    app = FastAPI(
        title="KurbanCebimde Backend", 
        version="1.0.0",
        description="KurbanCebimde API - Push Notifications & Certificates",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Request ID middleware
    @app.middleware("http")
    async def add_request_id(request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    # Detailed error logging middleware
    @app.middleware("http")
    async def log_errors(request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            logging.exception(f"🚨 ERROR: {request.method} {request.url} -> {str(e)}")
            logging.exception(f"📋 Stack trace: {traceback.format_exc()}")
            raise

    # Rate limiting middleware - TEMPORARILY DISABLED
    # app.middleware("http")(rate_limit_middleware)

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Error handlers
    app.add_exception_handler(Exception, global_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)

    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(users_router, prefix="/api/v1")
    app.include_router(donations_router, prefix="/api/v1")
    app.include_router(live_router, prefix="/api/v1")
    app.include_router(streams_router, prefix="/api/v1")
    app.include_router(admin_router, prefix="/api/admin/v1")
    app.include_router(livekit_router, prefix="/api/livekit/v1")
    app.include_router(notifications_router, prefix="/api/notifications/v1")
    app.include_router(certificates_router, prefix="/api/certificates/v1")
    app.include_router(test_router, prefix="/api/test/v1")
    app.include_router(error_test_router, prefix="/api/error-test/v1")

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    # --- Monitor uçları (panel için basit health) ---
    @app.get("/api/monitor/status")
    async def monitor_status():
        return {
            "backend": {"status": "online"},
            "admin_panel": {"status": "online"},
            "database": {"status": "unknown"},
            "time": int(time.time()),
        }

    @app.get("/api/monitor/system")
    async def monitor_system():
        return {
            "cpu_usage": f"{psutil.cpu_percent(interval=0.1)}%",
            "memory_usage": f"{psutil.virtual_memory().percent}%",
            "disk_usage": f"{psutil.disk_usage('/').percent}%",
            "uptime": int(time.time() - psutil.boot_time()),
        }

    @app.get("/api/monitor/logs")
    async def monitor_logs():
        return {"logs": []}

    @app.get("/api/ws/status")
    async def ws_status():
        return {"ok": True}

    return app


app = create_app()


