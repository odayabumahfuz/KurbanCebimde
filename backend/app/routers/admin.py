from fastapi import APIRouter, HTTPException, Header, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import uuid
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings
from ..services.storage_service import storage_service

router = APIRouter(tags=["admin"])
class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:password@postgres:5432/kurban_cebimde"
    LIVEKIT_API_KEY: str = "APIjcAygxUNnX6kb"
    LIVEKIT_API_SECRET: str = "your-livekit-secret-key"  # TODO: LiveKit Cloud'dan gerçek secret al
    # JWT için tek kaynak: docker-compose ile gelen SECRET_KEY'i kullan
    # Not: Önceden kullanılan anahtar ile uyum için varsayılanı koruyoruz
    SECRET_KEY: str = "your-secret-key-change-in-production"

settings = Settings()
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

async def _validate_admin_token(authorization: Optional[str] = Header(default=None)):
    """Admin endpoint'leri için token validation"""
    import jwt  # type: ignore
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token gerekli")
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])  # type: ignore
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Geçersiz token")
        with engine.connect() as conn:
            result = conn.execute(text(
                """
                SELECT id, COALESCE(is_admin, FALSE) as is_admin,
                       COALESCE(is_super_admin, FALSE) as is_super_admin
                FROM users WHERE id = :user_id
                """
            ), {"user_id": user_id}).fetchone()
            if not result:
                raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
            if not result.is_admin and not result.is_super_admin:
                raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
            return result.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token doğrulama hatası: {str(e)}")

async def send_stream_notification(stream_id: str, stream_title: str):
    """Bağış sahibine yayın bildirimi gönder (Expo Push ile gerçek tetikleme)"""
    try:
        with engine.connect() as conn:
            # Stream sahibini ve aktif push token'larını çek
            owner = conn.execute(text("""
                SELECT s.user_id, u.phone, u.name
                FROM streams s
                JOIN users u ON s.user_id = u.id
                WHERE s.id = :stream_id
            """), {"stream_id": stream_id}).fetchone()

            if not owner:
                return False

            tokens = conn.execute(text("""
                SELECT expo_push_token, platform
                FROM user_push_tokens
                WHERE user_id = :user_id
                ORDER BY updated_at DESC
            """), {"user_id": owner.user_id}).fetchall()

            if not tokens:
                print("Push token yok, bildirim atlanıyor")
                return False

            import requests, json
            expo_api = "https://exp.host/--/api/v2/push/send"
            payload = {
                "to": [t.expo_push_token for t in tokens],
                "title": "📺 Canlı Yayın",
                "body": f"{stream_title}: Yayın başladı",
                "data": {"type": "stream", "stream_id": stream_id, "title": stream_title},
                "sound": "default",
                "badge": 1
            }
            resp = requests.post(expo_api, headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-encoding": "gzip, deflate"
            }, data=json.dumps(payload), timeout=10)
            print("Expo push response:", resp.status_code, resp.text[:200])
            return resp.status_code == 200
    except Exception as e:
        print(f"Bildirim gönderme hatası: {e}")
        return False


# ---- Media (Admin) Endpoints ----
from fastapi import Body

class UploadUrlRequest(BaseModel):
    donationId: str
    broadcastId: str
    mimeType: str
    sizeBytes: Optional[int] = None

@router.post("/media/upload-url")
async def get_upload_url(req: UploadUrlRequest, _: str = Depends(_validate_admin_token)):
    try:
        # storage key: media/YYYY/MM/<donation>/<timestamp>.ext
        import datetime, uuid as pyuuid
        now = datetime.datetime.utcnow()
        ext = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "video/mp4": ".mp4",
        }.get(req.mimeType, "")
        key = f"media/{now.year}/{now.month:02d}/{req.donationId}/{pyuuid.uuid4()}{ext}"
        url = storage_service.presign_put(key, req.mimeType, req.sizeBytes)
        return {"uploadUrl": url, "storageKey": key}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class CommitRequest(BaseModel):
    storageKey: str
    donationId: Optional[str] = None
    broadcastId: Optional[str] = None
    mimeType: str
    width: Optional[int] = None
    height: Optional[int] = None
    durationSeconds: Optional[int] = None
    sizeBytes: Optional[int] = None

@router.post("/media/commit")
async def commit_media(req: CommitRequest, _: str = Depends(_validate_admin_token)):
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                INSERT INTO media_assets (
                    owner_donation_id, broadcast_id, storage_key, mime_type,
                    duration_seconds, width, height, size_bytes, status, created_by, created_at
                ) VALUES (
                    :donation_id, :broadcast_id, :storage_key, :mime_type,
                    :duration_seconds, :width, :height, :size_bytes, 'uploaded', NULL, NOW()
                )
                RETURNING id, status
            """), {
                "donation_id": req.donationId,
                "broadcast_id": req.broadcastId,
                "storage_key": req.storageKey,
                "mime_type": req.mimeType,
                "duration_seconds": req.durationSeconds,
                "width": req.width,
                "height": req.height,
                "size_bytes": req.sizeBytes,
            })
            res = conn.fetchone()
            conn.commit()
            return {"assetId": res.id, "status": res.status}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Review & Package endpoints (skeletons for sprint)
class ReviewRequest(BaseModel):
    action: str  # approve | reject
    note: Optional[str] = None

@router.get("/media")
async def list_media(status: Optional[str] = None, donationId: Optional[str] = None, _: str = Depends(_validate_admin_token)):
    query = "SELECT id, owner_donation_id, storage_key, mime_type, status, created_at FROM media_assets"
    params = {}
    clauses = []
    if status:
        clauses.append("status = :status")
        params["status"] = status
    if donationId:
        clauses.append("owner_donation_id = :donation_id")
        params["donation_id"] = donationId
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY created_at DESC LIMIT 200"
    with engine.connect() as conn:
        rows = conn.execute(text(query), params).fetchall()
        return {"items": [dict(r._mapping) for r in rows]}

@router.patch("/media/{asset_id}/review")
async def review_media(asset_id: str, req: ReviewRequest, _: str = Depends(_validate_admin_token)):
    if req.action not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="invalid action")
    new_status = "approved" if req.action == "approve" else "rejected"
    with engine.connect() as conn:
        conn.execute(text("""
            UPDATE media_assets SET status = :st, reviewed_at = NOW() WHERE id = :id
        """), {"st": new_status, "id": asset_id})
        conn.commit()
    return {"assetId": asset_id, "status": new_status}

class CreatePackageRequest(BaseModel):
    donationId: str
    title: str
    note: Optional[str] = None

@router.post("/media-packages")
async def create_package(req: CreatePackageRequest, _: str = Depends(_validate_admin_token)):
    with engine.connect() as conn:
        row = conn.execute(text("""
            INSERT INTO media_packages (donation_id, title, note, status, created_by, created_at)
            VALUES (:donation_id, :title, :note, 'draft', NULL, NOW())
            RETURNING id, status
        """), {"donation_id": req.donationId, "title": req.title, "note": req.note}).fetchone()
        conn.commit()
        return {"packageId": row.id, "status": row.status}

class AddItemsRequest(BaseModel):
    mediaAssetIds: List[str]
    positions: Optional[List[int]] = None

@router.post("/media-packages/{package_id}/items")
async def add_items(package_id: str, req: AddItemsRequest, _: str = Depends(_validate_admin_token)):
    with engine.connect() as conn:
        for idx, asset_id in enumerate(req.mediaAssetIds):
            pos = req.positions[idx] if req.positions and idx < len(req.positions) else idx
            conn.execute(text("""
                INSERT INTO media_package_items (package_id, media_asset_id, position)
                VALUES (:pid, :aid, :pos)
                ON CONFLICT (package_id, media_asset_id) DO UPDATE SET position = EXCLUDED.position
            """), {"pid": package_id, "aid": asset_id, "pos": pos})
        conn.commit()
    return {"packageId": package_id, "itemsCount": len(req.mediaAssetIds)}

class UpdatePackageRequest(BaseModel):
    status: str  # published | draft

@router.patch("/media-packages/{package_id}")
async def update_package(package_id: str, req: UpdatePackageRequest, _: str = Depends(_validate_admin_token)):
    if req.status not in ("published", "draft"):
        raise HTTPException(status_code=400, detail="invalid status")
    with engine.connect() as conn:
        donation_id = conn.execute(text("SELECT donation_id FROM media_packages WHERE id = :id"), {"id": package_id}).scalar()
        if req.status == "published":
            conn.execute(text("""
                UPDATE media_packages SET status = 'published', published_at = NOW() WHERE id = :id
            """), {"id": package_id})
        else:
            conn.execute(text("""
                UPDATE media_packages SET status = 'draft', published_at = NULL WHERE id = :id
            """), {"id": package_id})
        conn.commit()
    # Push notification to donor when published
    if req.status == "published" and donation_id:
        try:
            with engine.connect() as conn:
                user_id = conn.execute(text("SELECT user_id FROM donations WHERE id = :did"), {"did": donation_id}).scalar()
                if user_id:
                    tokens = conn.execute(text("""
                        SELECT expo_push_token FROM user_push_tokens WHERE user_id = :uid ORDER BY updated_at DESC
                    """), {"uid": user_id}).fetchall()
                    if tokens:
                        import requests, json
                        expo_api = "https://exp.host/--/api/v2/push/send"
                        expo_tokens = [t.expo_push_token for t in tokens]
                        deeplink = f"kurbancebimde://media-package/{package_id}"
                        payload = {
                            "to": expo_tokens,
                            "title": "Kesim Görselleriniz Hazır",
                            "body": "Kurban kesim medya paketiniz yayına alındı. İncelemek için dokunun.",
                            "data": {"type": "media_package", "packageId": str(package_id), "url": deeplink},
                            "sound": "default",
                            "badge": 1
                        }
                        requests.post(
                            expo_api,
                            headers={"Content-Type": "application/json", "Accept": "application/json", "Accept-encoding": "gzip, deflate"},
                            data=json.dumps(payload),
                            timeout=10,
                        )
        except Exception as e:
            print("Publish push error:", e)
    return {"packageId": package_id, "status": req.status}

# ---------- Dashboard & Reports Endpoints ----------
@router.get("/metrics/summary")
async def metrics_summary(_: str = Depends(_validate_admin_token)):
    try:
        with engine.connect() as conn:
            total_users = conn.execute(text("SELECT COUNT(*) FROM users")).scalar() or 0
            active_users = conn.execute(text("SELECT COUNT(*) FROM users WHERE COALESCE(is_active, TRUE) = TRUE")).scalar() or 0
            donations_sum_7d = conn.execute(text(
                """
                SELECT COALESCE(SUM(amount),0)
                FROM donations
                WHERE COALESCE(created_at, NOW()) >= NOW() - INTERVAL '7 days'
                """
            )).scalar() or 0
            active_broadcasts = conn.execute(text("SELECT COUNT(*) FROM streams WHERE COALESCE(status,'draft') = 'live'")) .scalar() or 0
        return {
            "total_users": int(total_users),
            "active_users": int(active_users),
            "donations_sum_7d": float(donations_sum_7d),
            "active_broadcasts": int(active_broadcasts),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/donations/trend")
async def donations_trend(range: str = "7d", _: str = Depends(_validate_admin_token)):
    try:
        # Sadece 7d destekliyoruz şimdilik
        with engine.connect() as conn:
            rows = conn.execute(text(
                """
                SELECT to_char(date_trunc('day', COALESCE(created_at, NOW())), 'YYYY-MM-DD') as date,
                       COALESCE(SUM(amount),0) as amount
                FROM donations
                WHERE COALESCE(created_at, NOW()) >= NOW() - INTERVAL '7 days'
                GROUP BY 1
                ORDER BY 1
                """
            )).mappings().all()
        return {"items": [{"date": r["date"], "amount": float(r["amount"]) } for r in rows]}
    except Exception as e:
        return {"items": []}


@router.get("/reports/broadcasts/avg-viewers")
async def reports_avg_viewers(_: str = Depends(_validate_admin_token)):
    try:
        with engine.connect() as conn:
            rows = conn.execute(text(
                """
                SELECT COALESCE(title,'Yayın') as title,
                       COALESCE(AVG(COALESCE(viewers,0)),0) as avg
                FROM streams
                GROUP BY 1
                ORDER BY avg DESC
                LIMIT 5
                """
            )).mappings().all()
        return {"items": [{"title": r["title"], "avg": float(r["avg"]) } for r in rows]}
    except Exception:
        return {"items": []}


@router.get("/audit")
async def audit_latest(size: int = 10, _: str = Depends(_validate_admin_token)):
    try:
        with engine.connect() as conn:
            exists = conn.execute(text(
                """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'audit_logs'
                );
                """
            )).scalar()
            if not exists:
                return {"items": []}
            rows = conn.execute(text(
                """
                SELECT id, COALESCE(ts, NOW()) as ts, COALESCE(actor,'system') as actor,
                       COALESCE(action,'unknown') as action, target
                FROM audit_logs
                ORDER BY ts DESC
                LIMIT :size
                """
            ), {"size": size}).mappings().all()
        items = [{
            "id": str(r["id"]),
            "ts": (r["ts"].isoformat() if hasattr(r["ts"], 'isoformat') else str(r["ts"])),
            "actor": r["actor"],
            "action": r["action"],
            "target": r.get("target")
        } for r in rows]
        return {"items": items}
    except Exception:
        return {"items": []}

# ---------- Notifications (list) ----------
@router.get("/notifications")
async def list_notifications(page: int = 1, size: int = 20, _: str = Depends(_validate_admin_token)):
    try:
        with engine.connect() as conn:
            # tablo var mı kontrol
            exists = conn.execute(text(
                """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'notifications'
                );
                """
            )).scalar()
            if not exists:
                return {"items": [], "page": page, "size": size, "total": 0}
            offset = (page - 1) * size
            rows = conn.execute(text(
                """
                SELECT id, user_id, title, message, COALESCE(channel,'push') AS channel,
                       COALESCE(status,'pending') AS status,
                       COALESCE(sent_at, created_at) AS sent_at
                FROM notifications
                ORDER BY COALESCE(sent_at, created_at) DESC
                LIMIT :size OFFSET :offset
                """
            ), {"size": size, "offset": offset}).mappings().all()
            total = conn.execute(text("SELECT COUNT(*) FROM notifications")).scalar() or 0
        items = [
            {
                "id": str(r["id"]),
                "user_id": str(r["user_id"]) if r.get("user_id") else None,
                "title": r.get("title"),
                "message": r.get("message"),
                "channel": r.get("channel"),
                "status": r.get("status"),
                "sent_at": (r.get("sent_at").isoformat() if hasattr(r.get("sent_at"), 'isoformat') else r.get("sent_at"))
            }
            for r in rows
        ]
        return {"items": items, "page": page, "size": size, "total": int(total)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class LoginRequest(BaseModel):
    phoneOrEmail: str
    password: str
    otp_code: Optional[str] = None


class Role(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    permissions: List[str] = []


class UserInfo(BaseModel):
    id: str
    name: str
    surname: str
    email: str
    phone: str
    roles: List[Role]
    permissions: List[str]


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: UserInfo


async def _validate_admin_token(authorization: Optional[str] = Header(default=None)):
    """Admin endpoint'leri için token validation"""
    # JWT import'unu fonksiyonun başında yap
    import jwt
    
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token gerekli")
        
        token = authorization.split(" ")[1]
        
        # JWT token'ı decode et
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Geçersiz token")
        
        # Kullanıcının admin yetkisi var mı kontrol et
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, COALESCE(is_admin, FALSE) as is_admin,
                       COALESCE(is_super_admin, FALSE) as is_super_admin
                FROM users WHERE id = :user_id
            """), {"user_id": user_id}).fetchone()
            
            if not result:
                raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
            
            if not result.is_admin and not result.is_super_admin:
                raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
            
            return result.id
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token süresi dolmuş")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token doğrulama hatası: {str(e)}")


@router.post("/auth/login", response_model=LoginResponse)
async def admin_login(payload: LoginRequest):
    try:
        import bcrypt
        
        with engine.connect() as conn:
            # Email veya username ile kullanıcı ara
            user_result = conn.execute(text("""
                SELECT id, name, surname, email, phone, password_hash, role, is_admin, is_super_admin
                FROM users 
                WHERE (email = :phoneOrEmail OR phone = :phoneOrEmail) 
                AND is_active = true
            """), {"phoneOrEmail": payload.phoneOrEmail}).fetchone()
            
            if not user_result:
                raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
            
            # Şifre kontrolü
            if not bcrypt.checkpw(payload.password.encode('utf-8'), user_result.password_hash.encode('utf-8')):
                raise HTTPException(status_code=401, detail="Geçersiz şifre")
            
            # Admin yetkisi kontrolü
            if not (user_result.is_admin or user_result.is_super_admin):
                raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
            
            # JWT Token oluştur
            import jwt
            from datetime import datetime, timedelta
            
            # Access token oluştur
            access_payload = {
                "user_id": user_result.id,
                "role": user_result.role,
                "is_admin": user_result.is_admin,
                "is_super_admin": user_result.is_super_admin,
                "exp": datetime.utcnow() + timedelta(hours=1),
                "iat": datetime.utcnow()
            }
            access = jwt.encode(access_payload, settings.SECRET_KEY, algorithm="HS256")
            
            # Refresh token oluştur
            refresh_payload = {
                "user_id": user_result.id,
                "exp": datetime.utcnow() + timedelta(days=7),
                "iat": datetime.utcnow()
            }
            refresh = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm="HS256")
            
            # Rol bilgilerini hazırla
            roles = []
            if user_result.is_super_admin:
                roles.append(Role(id="super_admin", name="Super Admin", permissions=["*"]))
            elif user_result.is_admin:
                roles.append(Role(id="admin", name="Admin", permissions=["admin"]))
            
            return LoginResponse(
                access_token=access,
                refresh_token=refresh,
                token_type="bearer",
                expires_in=int(timedelta(hours=1).total_seconds()),
                user=UserInfo(
                    id=user_result.id,
                    name=user_result.name,
                    surname=user_result.surname,
                    email=user_result.email or "",
                    phone=user_result.phone or "",
                    roles=roles,
                    permissions=["*"] if user_result.is_super_admin else ["admin"]
                )
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Admin login error: {e}")
        raise HTTPException(status_code=500, detail="Giriş sırasında hata oluştu")


@router.get("/roles")
async def list_roles(_: str = Depends(_validate_admin_token)):
    # Basit stub
    return {"roles": ["owner","admin","publisher","viewer","super_admin"]}

class MatrixEntry(BaseModel):
    page: str
    permissions: dict

@router.get("/roles/matrix")
async def get_role_matrix(_: str = Depends(_validate_admin_token)):
    matrix = [
        {"page":"dashboard","permissions":{"view":["owner","admin","publisher","viewer"]}},
        {"page":"users","permissions":{"view":["owner","admin"],"update":["owner","admin"]}},
        {"page":"donations","permissions":{"view":["owner","admin","publisher"]}},
    ]
    return {"matrix": matrix}


class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/auth/refresh")
async def refresh_token(payload: RefreshRequest):
    try:
        import jwt
        from datetime import datetime, timedelta
        
        if not payload.refresh_token:
            raise HTTPException(status_code=400, detail="refresh_token is required")
        
        # Refresh token'ı decode et
        refresh_payload = jwt.decode(payload.refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = refresh_payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Geçersiz refresh token")
        
        # Kullanıcı bilgilerini al
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, COALESCE(role, 'kullanıcı') as role,
                       COALESCE(is_admin, FALSE) as is_admin,
                       COALESCE(is_super_admin, FALSE) as is_super_admin
                FROM users 
                WHERE id = :user_id
            """), {"user_id": user_id}).fetchone()
            
            if not result:
                raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
            
            # Yeni access token oluştur
            access_payload = {
                "user_id": result.id,
                "role": result.role,
                "is_admin": result.is_admin,
                "is_super_admin": result.is_super_admin,
                "exp": datetime.utcnow() + timedelta(hours=1),
                "iat": datetime.utcnow()
            }
            access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm="HS256")
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": 3600
            }
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token süresi dolmuş")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz refresh token")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Refresh token error: {e}")
        raise HTTPException(status_code=500, detail="Token yenilenemedi")


@router.post("/auth/logout")
async def logout(_: str = Depends(_validate_admin_token)):
    return {"message": "ok"}


class UsersResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int


class CreateUserRequest(BaseModel):
    name: str
    surname: str
    email: str
    phone: str
    password: str
    role: str = "kullanıcı"

@router.post("/users")
async def create_user(user_data: CreateUserRequest, _: str = Depends(_validate_admin_token)):
    """Admin tarafından yeni kullanıcı oluştur"""
    try:
        # Email kontrolü
        with engine.connect() as conn:
            existing_user = conn.execute(text("""
                SELECT id FROM users WHERE email = :email OR phone = :phone
            """), {"email": user_data.email, "phone": user_data.phone}).fetchone()
            
            if existing_user:
                raise HTTPException(status_code=400, detail="Bu email adresi veya telefon numarası zaten kayıtlı")
            
            # Şifreyi hash'le
            import bcrypt
            hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Kullanıcıyı oluştur
            user_id = str(uuid.uuid4())
            conn.execute(text("""
                INSERT INTO users (id, name, surname, email, phone, password_hash, role, is_admin, is_super_admin, is_active, created_at, updated_at)
                VALUES (:id, :name, :surname, :email, :phone, :password_hash, :role, :is_admin, :is_super_admin, :is_active, :created_at, :updated_at)
            """), {
                "id": user_id,
                "name": user_data.name,
                "surname": user_data.surname,
                "email": user_data.email,
                "phone": user_data.phone,
                "password_hash": hashed_password,
                "role": user_data.role,
                "is_admin": False,
                "is_super_admin": False,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            
            conn.commit()
            
            return {
                "success": True,
                "message": "Kullanıcı başarıyla oluşturuldu",
                "user_id": user_id
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create user error: {e}")
        raise HTTPException(status_code=500, detail="Kullanıcı oluşturulamadı")

@router.get("/users", response_model=UsersResponse)
async def list_users(_: str = Depends(_validate_admin_token)):
    try:
        with engine.connect() as conn:
            # Önce users tablosunun var olup olmadığını kontrol et
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'users'
                );
            """)).scalar()
            
            if not result:
                # Users tablosu yoksa boş liste döndür
                return UsersResponse(items=[], total=0, page=1, size=100)
            
            rows = conn.execute(text("""
                SELECT 
                  u.id,
                  COALESCE(u.name,'') AS name,
                  COALESCE(u.surname,'') AS surname,
                  COALESCE(u.email,'') AS email,
                  COALESCE(u.phone,'') AS phone,
                  COALESCE(u.role,'kullanıcı') AS role,
                  COALESCE(u.is_admin, FALSE) AS is_admin,
                  COALESCE(u.is_super_admin, FALSE) AS is_super_admin,
                  COALESCE(u.is_active, FALSE) AS is_enabled,
                  CASE 
                    WHEN EXISTS (
                      SELECT 1 FROM information_schema.tables 
                      WHERE table_schema = 'public' AND table_name = 'user_sessions'
                    ) THEN EXISTS (
                      SELECT 1 FROM user_sessions s 
                      WHERE s.user_id = u.id AND COALESCE(s.expires_at, NOW() - INTERVAL '1 second') > NOW()
                    )
                    ELSE FALSE
                  END AS is_online,
                  -- Geriye uyumluluk: eski frontend alanı
                  CASE 
                    WHEN EXISTS (
                      SELECT 1 FROM information_schema.tables 
                      WHERE table_schema = 'public' AND table_name = 'user_sessions'
                    ) THEN EXISTS (
                      SELECT 1 FROM user_sessions s 
                      WHERE s.user_id = u.id AND COALESCE(s.expires_at, NOW() - INTERVAL '1 second') > NOW()
                    )
                    ELSE FALSE
                  END AS is_active,
                  CASE 
                    WHEN EXISTS (
                      SELECT 1 FROM information_schema.tables 
                      WHERE table_schema = 'public' AND table_name = 'user_sessions'
                    ) THEN (
                      SELECT MAX(COALESCE(s.last_activity, s.started_at)) FROM user_sessions s WHERE s.user_id = u.id
                    )
                    ELSE NULL
                  END AS last_seen,
                  COALESCE(u.created_at, NOW()) AS created_at,
                  CASE 
                    WHEN COALESCE(u.email,'') <> '' OR COALESCE(u.phone,'') <> '' THEN TRUE
                    ELSE FALSE
                  END AS is_verified
                FROM users u
                ORDER BY u.created_at DESC
                LIMIT 100
            """)).mappings().all()
            items = [dict(r) for r in rows]
            return UsersResponse(items=items, total=len(items), page=1, size=100)
    except Exception as e:
        print(f"Users endpoint error: {e}")
        return UsersResponse(items=[], total=0, page=1, size=100)


class DonationsResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int


@router.get("/donations", response_model=DonationsResponse)
async def list_donations(_: str = Depends(_validate_admin_token)):
    try:
        with engine.connect() as conn:
            # Önce donations tablosunun var olup olmadığını kontrol et
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'donations'
                );
            """)).scalar()
            
            if not result:
                # Donations tablosu yoksa boş liste döndür
                return DonationsResponse(items=[], total=0, page=1, size=100)
            
            rows = conn.execute(text("""
                SELECT 
                  d.id, d.user_id, d.amount, 
                  COALESCE(d.status,'bekliyor') AS status,
                  COALESCE(d.created_at, NOW()) AS created_at,
                  u.name, u.surname, u.phone,
                  CASE WHEN EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='public' AND table_name='donations' AND column_name='animal_type'
                  ) THEN d.animal_type ELSE NULL END AS animal_type,
                  CASE WHEN EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='public' AND table_name='donations' AND column_name='animal_count'
                  ) THEN d.animal_count ELSE NULL END AS animal_count,
                  CASE WHEN EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='public' AND table_name='donations' AND column_name='slaughter_intent'
                  ) THEN d.slaughter_intent ELSE NULL END AS slaughter_intent
                FROM donations d
                LEFT JOIN users u ON d.user_id = u.id
                ORDER BY d.created_at DESC
                LIMIT 100
            """)).mappings().all()
            items = [dict(r) for r in rows]
            return DonationsResponse(items=items, total=len(items), page=1, size=100)
    except Exception as e:
        print(f"Donations endpoint error: {e}")
        return DonationsResponse(items=[], total=0, page=1, size=100)


class StreamsResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int


@router.get("/streams", response_model=StreamsResponse)
async def list_streams(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    _: str = Depends(_validate_admin_token)
):
    with engine.connect() as conn:
        # WHERE koşulu oluştur
        where_clause = ""
        params = {}
        
        if status and status != "all":
            where_clause = "WHERE COALESCE(status,'draft') = :status"
            params["status"] = status
        
        # Offset hesapla
        offset = (page - 1) * size
        
        # Streams'leri çek (kullanıcı bilgileri ile)
        query = f"""
            SELECT s.id, s.title, s.description, s.channel, s.kurban_id, 
                   COALESCE(s.status,'draft') AS status,
                   COALESCE(s.location,'Türkiye') AS location,
                   COALESCE(s.animal_count,1) AS animal_count,
                   COALESCE(s.viewers,0) AS viewers,
                   COALESCE(s.duration,'0:00') AS duration,
                   CASE WHEN EXISTS (
                     SELECT 1 FROM information_schema.columns 
                     WHERE table_schema='public' AND table_name='streams' AND column_name='animal_type'
                   ) THEN s.animal_type ELSE NULL END AS animal_type,
                   CASE WHEN EXISTS (
                     SELECT 1 FROM information_schema.columns 
                     WHERE table_schema='public' AND table_name='streams' AND column_name='slaughter_intent'
                   ) THEN s.slaughter_intent ELSE NULL END AS slaughter_intent,
                   COALESCE(s.created_at, NOW()) AS created_at,
                   COALESCE(s.started_at, NULL) AS started_at,
                   COALESCE(s.ended_at, NULL) AS ended_at,
                   u.name AS user_name,
                   u.surname AS user_surname,
                   u.email AS user_email,
                   u.phone AS user_phone
            FROM streams s
            LEFT JOIN users u ON s.kurban_id = u.id
            {where_clause}
            ORDER BY s.created_at DESC
            LIMIT :size OFFSET :offset
        """
        
        params.update({"size": size, "offset": offset})
        rows = conn.execute(text(query), params).mappings().all()
        
        # Toplam sayıyı al
        count_query = f"SELECT COUNT(*) as total FROM streams {where_clause}"
        count_params = {k: v for k, v in params.items() if k != "size" and k != "offset"}
        total = conn.execute(text(count_query), count_params).scalar()
        
        items = [dict(r) for r in rows]
        return StreamsResponse(items=items, total=total, page=page, size=size)


class CartsResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int


class CreateUserRequest(BaseModel):
    name: str
    surname: str
    email: str
    phone: str
    password: str
    role: str = "kullanıcı"  # kullanıcı, admin, super_admin


@router.get("/carts", response_model=CartsResponse)
async def list_carts(_: str = Depends(_validate_admin_token)):
    try:
        with engine.connect() as conn:
            # Önce carts tablosunun var olup olmadığını kontrol et
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'carts'
                );
            """)).scalar()
            
            if not result:
                # Carts tablosu yoksa boş liste döndür
                return CartsResponse(items=[], total=0, page=1, size=100)
            
            rows = conn.execute(text("""
                SELECT id, user_id, user_name, phone, 
                       COALESCE(status,'active') AS status,
                       COALESCE(total_amount,0) AS total_amount,
                       COALESCE(items,'[]') AS items,
                       COALESCE(created_at, NOW()) AS created_at,
                       COALESCE(updated_at, NOW()) AS updated_at
                FROM carts
                ORDER BY created_at DESC
                LIMIT 100
            """)).mappings().all()
            items = [dict(r) for r in rows]
            return CartsResponse(items=items, total=len(items), page=1, size=100)
    except Exception as e:
        print(f"Carts endpoint error: {e}")
        return CartsResponse(items=[], total=0, page=1, size=100)


@router.post("/users")
async def create_user(user_data: CreateUserRequest, _: str = Depends(_validate_admin_token)):
    """Yeni kullanıcı oluştur"""
    try:
        import bcrypt
        import uuid
        
        # Şifreyi hash'le
        hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Rol kontrolü
        is_admin = user_data.role in ['admin', 'super_admin']
        is_super_admin = user_data.role == 'super_admin'
        
        user_id = str(uuid.uuid4())
        
        with engine.connect() as conn:
            # Email ve telefon kontrolü
            existing_email = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": user_data.email}).fetchone()
            if existing_email:
                raise HTTPException(status_code=400, detail="Bu email adresi zaten kayıtlı")
            
            existing_phone = conn.execute(text("SELECT id FROM users WHERE phone = :phone"), {"phone": user_data.phone}).fetchone()
            if existing_phone:
                raise HTTPException(status_code=400, detail="Bu telefon numarası zaten kayıtlı")
            
            conn.execute(text("""
                INSERT INTO users (id, name, surname, email, phone, password_hash, 
                                 role, is_admin, is_super_admin, created_at, updated_at)
                VALUES (:id, :name, :surname, :email, :phone, :password_hash,
                        :role, :is_admin, :is_super_admin, NOW(), NOW())
            """), {
                "id": user_id,
                "name": user_data.name,
                "surname": user_data.surname,
                "email": user_data.email,
                "phone": user_data.phone,
                "password_hash": hashed_password,
                "role": user_data.role,
                "is_admin": is_admin,
                "is_super_admin": is_super_admin
            })
            conn.commit()
        
        return {
            "id": user_id,
            "name": user_data.name,
            "surname": user_data.surname,
            "email": user_data.email,
            "phone": user_data.phone,
            "role": user_data.role,
            "is_admin": is_admin,
            "is_super_admin": is_super_admin,
            "message": "Kullanıcı başarıyla oluşturuldu"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"User creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Kullanıcı oluşturulamadı: {str(e)}")


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


@router.patch("/users/{user_id}")
async def update_user(user_id: str, user_data: UpdateUserRequest, _: str = Depends(_validate_admin_token)):
    """Kullanıcı bilgilerini güncelle"""
    try:
        with engine.connect() as conn:
            # Kullanıcının var olup olmadığını kontrol et
            user_exists = conn.execute(text("SELECT id FROM users WHERE id = :user_id"), {"user_id": user_id}).fetchone()
            if not user_exists:
                raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
            
            # Güncellenecek alanları hazırla
            update_fields = []
            update_values = {"user_id": user_id}
            
            if user_data.name is not None:
                update_fields.append("name = :name")
                update_values["name"] = user_data.name
            
            if user_data.surname is not None:
                update_fields.append("surname = :surname")
                update_values["surname"] = user_data.surname
            
            if user_data.email is not None:
                update_fields.append("email = :email")
                update_values["email"] = user_data.email
            
            if user_data.phone is not None:
                update_fields.append("phone = :phone")
                update_values["phone"] = user_data.phone
            
            if user_data.role is not None:
                update_fields.append("role = :role")
                update_values["role"] = user_data.role
                
                # Rol değişikliğinde admin flag'lerini güncelle
                is_admin = user_data.role in ['admin', 'super_admin']
                is_super_admin = user_data.role == 'super_admin'
                update_fields.append("is_admin = :is_admin")
                update_fields.append("is_super_admin = :is_super_admin")
                update_values["is_admin"] = is_admin
                update_values["is_super_admin"] = is_super_admin
            
            if user_data.is_active is not None:
                update_fields.append("is_active = :is_active")
                update_values["is_active"] = user_data.is_active
            
            if not update_fields:
                raise HTTPException(status_code=400, detail="Güncellenecek alan bulunamadı")
            
            # Güncelleme sorgusu
            update_fields.append("updated_at = NOW()")
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = :user_id"
            
            conn.execute(text(query), update_values)
            conn.commit()
        
        return {"message": "Kullanıcı başarıyla güncellendi"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"User update error: {e}")
        raise HTTPException(status_code=500, detail=f"Kullanıcı güncellenemedi: {str(e)}")


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, _: str = Depends(_validate_admin_token)):
    """Kullanıcıyı sil"""
    try:
        with engine.connect() as conn:
            # Kullanıcının var olup olmadığını kontrol et
            user_exists = conn.execute(text("SELECT id FROM users WHERE id = :user_id"), {"user_id": user_id}).fetchone()
            if not user_exists:
                raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
            
            # Kullanıcıyı sil
            conn.execute(text("DELETE FROM users WHERE id = :user_id"), {"user_id": user_id})
            conn.commit()
        
        return {"message": "Kullanıcı başarıyla silindi"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"User deletion error: {e}")
        raise HTTPException(status_code=500, detail=f"Kullanıcı silinemedi: {str(e)}")


class CreateStreamRequest(BaseModel):
    donation_id: str
    title: str
    description: Optional[str] = None
    duration_seconds: int = 120  # Test için 2 dakika (120 saniye)

class CreateStreamForUserRequest(BaseModel):
    user_id: str
    title: str
    description: Optional[str] = None
    duration_seconds: int = 120


@router.post("/streams/create")
async def create_stream_for_user(request: CreateStreamRequest, _: str = Depends(_validate_admin_token)):
    """Kullanıcı için kesim yayını oluştur"""
    try:
        import uuid
        from datetime import datetime, timedelta
        
        # Bağışın var olup olmadığını kontrol et ve kullanıcı bilgisini al
        with engine.connect() as conn:
            donation = conn.execute(text("""
                SELECT d.id, d.user_id, d.amount, u.name, u.surname, u.email, u.phone 
                FROM donations d
                JOIN users u ON d.user_id = u.id
                WHERE d.id = :donation_id
            """), {"donation_id": request.donation_id}).fetchone()
            
            if not donation:
                raise HTTPException(status_code=404, detail="Bağış bulunamadı")
            
            # Yayın ID'si oluştur
            stream_id = str(uuid.uuid4())
            room_name = f"kurban_stream_{stream_id[:8]}"
            
            # Yayını veritabanına kaydet
            conn.execute(text("""
                INSERT INTO streams (id, title, description, channel, kurban_id, 
                                   status, location, animal_count, viewers, duration,
                                   target_amount, created_at, updated_at, started_at)
                VALUES (:id, :title, :description, :channel, :kurban_id,
                        'scheduled', 'Türkiye', 1, 0, :duration,
                        1000, NOW(), NOW(), NOW())
            """), {
                "id": stream_id,
                "title": request.title,
                "description": request.description or f"{donation.name} {donation.surname} için kurban kesim yayını",
                "channel": room_name,
                "kurban_id": donation.user_id,
                "duration": f"{request.duration_seconds // 60}:{request.duration_seconds % 60:02d}"
            })
            
            conn.commit()
            
            return {
                "stream_id": stream_id,
                "room_name": room_name,
                "user": {
                    "id": donation.user_id,
                    "name": donation.name,
                    "surname": donation.surname,
                    "email": donation.email,
                    "phone": donation.phone
                },
                "title": request.title,
                "description": request.description,
                "duration_seconds": request.duration_seconds,
                "status": "scheduled",
                "message": "Yayın başarıyla oluşturuldu"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Stream creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Yayın oluşturulamadı: {str(e)}")


@router.post("/streams/create-for-user")
async def create_stream_for_user_direct(request: CreateStreamForUserRequest, _: str = Depends(_validate_admin_token)):
    """Admin uygulamasından direkt kullanıcı ID'si ile yayın oluştur"""
    try:
        import uuid
        from datetime import datetime, timedelta
        
        # Kullanıcının var olup olmadığını kontrol et
        with engine.connect() as conn:
            user = conn.execute(text("""
                SELECT id, name, surname, email, phone 
                FROM users 
                WHERE id = :user_id
            """), {"user_id": request.user_id}).fetchone()
            
            if not user:
                raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
            
            # Yayın ID'si oluştur
            stream_id = str(uuid.uuid4())
            room_name = f"kurban_stream_{stream_id[:8]}"
            
            # Yayını veritabanına kaydet
            conn.execute(text("""
                INSERT INTO streams (id, title, description, channel, kurban_id, 
                                   status, location, animal_count, viewers, duration,
                                   target_amount, created_at, updated_at, started_at)
                VALUES (:id, :title, :description, :channel, :kurban_id,
                        'scheduled', 'Türkiye', 1, 0, :duration,
                        1000, NOW(), NOW(), NOW())
            """), {
                "id": stream_id,
                "title": request.title,
                "description": request.description or f"{user.name} {user.surname} için kurban kesim yayını",
                "channel": room_name,
                "kurban_id": user.id,
                "duration": f"{request.duration_seconds // 60}:{request.duration_seconds % 60:02d}"
            })
            
            conn.commit()
            
            return {
                "stream_id": stream_id,
                "channel": room_name,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "surname": user.surname,
                    "email": user.email,
                    "phone": user.phone
                },
                "title": request.title,
                "description": request.description,
                "duration_seconds": request.duration_seconds,
                "status": "scheduled",
                "message": "Yayın başarıyla oluşturuldu"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Stream creation for user error: {e}")
        raise HTTPException(status_code=500, detail=f"Yayın oluşturulamadı: {str(e)}")


@router.post("/streams/{stream_id}/start")
async def start_stream(stream_id: str, _: str = Depends(_validate_admin_token)):
    """Yayını başlat"""
    try:
        with engine.connect() as conn:
            # Yayının var olup olmadığını kontrol et
            stream = conn.execute(text("""
                SELECT id, title, status, duration 
                FROM streams WHERE id = :stream_id
            """), {"stream_id": stream_id}).fetchone()
            
            if not stream:
                raise HTTPException(status_code=404, detail="Yayın bulunamadı")
            
            if stream.status == "live":
                raise HTTPException(status_code=400, detail="Yayın zaten aktif")
            
            # Yayını aktif yap
            conn.execute(text("""
                UPDATE streams 
                SET status = 'live', started_at = NOW(), updated_at = NOW()
                WHERE id = :stream_id
            """), {"stream_id": stream_id})
            
            conn.commit()
            
            # Bağış sahibine push bildirimi gönder
            try:
                await send_stream_notification(stream_id, stream.title)
            except Exception as notification_error:
                print(f"Bildirim gönderme hatası: {notification_error}")
            
            return {
                "stream_id": stream_id,
                "status": "live",
                "started_at": datetime.now().isoformat(),
                "message": "Yayın başlatıldı"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Stream start error: {e}")
        raise HTTPException(status_code=500, detail=f"Yayın başlatılamadı: {str(e)}")


@router.post("/streams/{stream_id}/end")
async def end_stream(stream_id: str, _: str = Depends(_validate_admin_token)):
    """Yayını sonlandır"""
    try:
        with engine.connect() as conn:
            # Yayının var olup olmadığını kontrol et
            stream = conn.execute(text("""
                SELECT id, status 
                FROM streams WHERE id = :stream_id
            """), {"stream_id": stream_id}).fetchone()
            
            if not stream:
                raise HTTPException(status_code=404, detail="Yayın bulunamadı")
            
            if stream.status == "ended":
                raise HTTPException(status_code=400, detail="Yayın zaten sonlandırılmış")
            
            # Yayını sonlandır
            conn.execute(text("""
                UPDATE streams 
                SET status = 'ended', ended_at = NOW(), updated_at = NOW()
                WHERE id = :stream_id
            """), {"stream_id": stream_id})
            
            conn.commit()
            
            return {
                "stream_id": stream_id,
                "status": "ended",
                "ended_at": datetime.now().isoformat(),
                "message": "Yayın sonlandırıldı"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Stream end error: {e}")
        raise HTTPException(status_code=500, detail=f"Yayın sonlandırılamadı: {str(e)}")


@router.delete("/streams/{stream_id}")
async def delete_stream(stream_id: str, _: str = Depends(_validate_admin_token)):
    """Yayını sil"""
    try:
        with engine.connect() as conn:
            # Yayının var olup olmadığını kontrol et
            stream = conn.execute(text("""
                SELECT id, status 
                FROM streams WHERE id = :stream_id
            """), {"stream_id": stream_id}).fetchone()
            
            if not stream:
                raise HTTPException(status_code=404, detail="Yayın bulunamadı")
            
            # Yayını sil
            conn.execute(text("""
                DELETE FROM streams 
                WHERE id = :stream_id
            """), {"stream_id": stream_id})
            
            conn.commit()
            
            return {
                "stream_id": stream_id,
                "message": "Yayın başarıyla silindi"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Stream delete error: {e}")
        raise HTTPException(status_code=500, detail=f"Yayın silinemedi: {str(e)}")


class SendNotificationRequest(BaseModel):
    user_id: str
    title: str
    body: str
    data: Optional[dict] = None


@router.post("/notifications/send")
async def send_notification_to_user(request: SendNotificationRequest, _: str = Depends(_validate_admin_token)):
    """Kullanıcıya bildirim gönder"""
    try:
        # Kullanıcının push token'larını al
        with engine.connect() as conn:
            # Önce user_push_tokens tablosunun var olup olmadığını kontrol et
            table_exists = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'user_push_tokens'
                );
            """)).scalar()
            
            if not table_exists:
                # Tablo yoksa oluştur
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS user_push_tokens (
                        id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255) NOT NULL,
                        expo_push_token VARCHAR(500) NOT NULL,
                        platform VARCHAR(50) NOT NULL,
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW(),
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                """))
                conn.commit()
            
            # Kullanıcının push token'larını al
            tokens = conn.execute(text("""
                SELECT expo_push_token, platform 
                FROM user_push_tokens 
                WHERE user_id = :user_id
                ORDER BY updated_at DESC
            """), {"user_id": request.user_id}).fetchall()
            
            if not tokens:
                return {
                    "success": False,
                    "message": "Kullanıcının push token'ı bulunamadı",
                    "user_id": request.user_id
                }
            
            # Expo Push API'sine bildirim gönder
            import requests
            
            expo_tokens = [token.expo_push_token for token in tokens]
            
            # Expo Push API payload
            payload = {
                "to": expo_tokens,
                "title": request.title,
                "body": request.body,
                "data": request.data or {},
                "sound": "default",
                "badge": 1
            }
            
            # Expo Push API'sine gönder
            response = requests.post(
                "https://exp.host/--/api/v2/push/send",
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Accept-encoding": "gzip, deflate"
                },
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "message": "Bildirim başarıyla gönderildi",
                    "user_id": request.user_id,
                    "tokens_sent": len(expo_tokens),
                    "expo_response": result
                }
            else:
                return {
                    "success": False,
                    "message": f"Bildirim gönderilemedi: {response.status_code}",
                    "user_id": request.user_id,
                    "error": response.text
                }
                
    except Exception as e:
        print(f"Notification send error: {e}")
        raise HTTPException(status_code=500, detail=f"Bildirim gönderilemedi: {str(e)}")


@router.post("/streams/{stream_id}/notify")
async def notify_user_about_stream(stream_id: str, _: str = Depends(_validate_admin_token)):
    """Kullanıcıya yayın bildirimi gönder"""
    try:
        with engine.connect() as conn:
            # Yayın bilgilerini al
            stream = conn.execute(text("""
                SELECT s.id, s.title, s.kurban_id, u.name, u.surname
                FROM streams s
                JOIN users u ON s.kurban_id = u.id
                WHERE s.id = :stream_id
            """), {"stream_id": stream_id}).fetchone()
            
            if not stream:
                raise HTTPException(status_code=404, detail="Yayın bulunamadı")
            
            # Bildirim gönder
            notification_request = SendNotificationRequest(
                user_id=stream.kurban_id,
                title="🎥 Yayın Bildirimi",
                body="1dk içerisinde yayınınız başlayacaktır",
                data={
                    "type": "stream_notification",
                    "stream_id": stream_id,
                    "title": stream.title,
                    "user_name": f"{stream.name} {stream.surname}"
                }
            )
            
            # Bildirim gönderme fonksiyonunu çağır
            result = await send_notification_to_user(notification_request, _)
            
            return {
                "stream_id": stream_id,
                "user_id": stream.kurban_id,
                "notification_result": result,
                "message": "Yayın bildirimi gönderildi"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Stream notification error: {e}")
        raise HTTPException(status_code=500, detail=f"Yayın bildirimi gönderilemedi: {str(e)}")


@router.post("/users/{user_id}/toggle-status")
async def toggle_user_status(user_id: str, _: str = Depends(_validate_admin_token)):
    """Kullanıcı aktif/pasif durumunu değiştir"""
    try:
        with engine.connect() as conn:
            # Kullanıcının mevcut durumunu al
            user = conn.execute(text("SELECT id, is_active FROM users WHERE id = :user_id"), {"user_id": user_id}).fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
            
            # Durumu tersine çevir
            new_status = not user.is_active if user.is_active is not None else True
            
            conn.execute(text("UPDATE users SET is_active = :is_active, updated_at = NOW() WHERE id = :user_id"), {
                "user_id": user_id,
                "is_active": new_status
            })
            conn.commit()
        
        status_text = "aktif" if new_status else "pasif"
        return {"message": f"Kullanıcı {status_text} duruma getirildi", "is_active": new_status}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"User status toggle error: {e}")
        raise HTTPException(status_code=500, detail=f"Kullanıcı durumu değiştirilemedi: {str(e)}")


class DonationsResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int


@router.get("/donations", response_model=DonationsResponse)
async def list_donations(_: str = Depends(_validate_admin_token)):
    """Bağışları kullanıcı bilgileri ile listele"""
    try:
        with engine.connect() as conn:
            rows = conn.execute(text("""
                SELECT d.id, d.amount, d.status, d.payment_method, d.transaction_id, 
                       d.notes, d.created_at, d.updated_at,
                       u.id as user_id, u.name, u.surname, u.phone, u.email,
                       u.role, u.is_admin, u.is_super_admin
                FROM donations d
                JOIN users u ON d.user_id = u.id
                ORDER BY d.created_at DESC
                LIMIT 100
            """)).mappings().all()
            
            items = []
            for row in rows:
                items.append({
                    "id": row.id,
                    "amount": float(row.amount),
                    "status": row.status,
                    "payment_method": row.payment_method,
                    "transaction_id": row.transaction_id,
                    "notes": row.notes,
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                    "updated_at": row.updated_at.isoformat() if row.updated_at else None,
                    "user": {
                        "id": row.user_id,
                        "name": row.name,
                        "surname": row.surname,
                        "phone": row.phone,
                        "email": row.email,
                        "role": row.role,
                        "is_admin": row.is_admin,
                        "is_super_admin": row.is_super_admin
                    }
                })
            
            return DonationsResponse(items=items, total=len(items), page=1, size=100)
            
    except Exception as e:
        print(f"Donations endpoint error: {e}")
        return DonationsResponse(items=[], total=0, page=1, size=100)


@router.get("/stats")
async def get_admin_stats(_: str = Depends(_validate_admin_token)):
    """Admin panel için istatistikler"""
    try:
        with engine.connect() as conn:
            # Toplam kullanıcı sayısı
            total_users = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
            
            # Aktif kullanıcı sayısı
            active_users = conn.execute(text("SELECT COUNT(*) FROM users WHERE is_active = true")).scalar()
            
            # Toplam bağış sayısı
            total_donations = conn.execute(text("SELECT COUNT(*) FROM donations")).scalar()
            
            # Bekleyen bağış sayısı (yayın yapılmamış)
            pending_donations = conn.execute(text("""
                SELECT COUNT(*) FROM donations d
                LEFT JOIN streams s ON d.user_id = s.user_id AND s.status = 'live'
                WHERE s.id IS NULL
            """)).scalar()
            
            # Canlı yayın sayısı
            live_streams = conn.execute(text("SELECT COUNT(*) FROM streams WHERE status = 'live'")).scalar()
            
            return {
                "success": True,
                "data": {
                    "total_users": total_users or 0,
                    "active_users": active_users or 0,
                    "total_donations": total_donations or 0,
                    "pending_streams": pending_donations or 0,
                    "live_streams": live_streams or 0
                }
            }
            
    except Exception as e:
        print(f"Stats endpoint error: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "total_users": 0,
                "active_users": 0,
                "total_donations": 0,
                "pending_streams": 0,
            "live_streams": 0
        }
    }

@router.post("/streams/{stream_id}/token")
async def get_stream_token(stream_id: str, _: str = Depends(_validate_admin_token)):
    """Yayın izleme için token al"""
    try:
        import jwt
        from datetime import datetime, timedelta
        
        # Stream bilgilerini al
        with engine.connect() as conn:
            stream = conn.execute(text("""
                SELECT id, channel, status
                FROM streams 
                WHERE id = :stream_id
            """), {"stream_id": stream_id}).fetchone()
            
            if not stream:
                raise HTTPException(status_code=404, detail="Stream bulunamadı")
            
            if stream.status != 'live':
                raise HTTPException(status_code=400, detail="Stream aktif değil")
        
        # LiveKit token oluştur
        settings = Settings()
        
        # Token payload
        token_payload = {
            "iss": settings.LIVEKIT_API_KEY,
            "sub": f"viewer_{stream_id}",
            "iat": int(datetime.now().timestamp()),
            "exp": int((datetime.now() + timedelta(hours=1)).timestamp()),
            "name": f"Viewer {stream_id}",
            "video": {
                "room": stream.channel,
                "roomJoin": True,
                "canSubscribe": True,
                "canPublish": False,
                "canPublishData": False,
                "hidden": False,
                "recorder": False
            }
        }
        
        # Token oluştur
        token = jwt.encode(token_payload, settings.LIVEKIT_API_SECRET, algorithm="HS256")
        
        return {
            "token": token,
            "room_name": stream.channel,
            "stream_id": stream_id,
            "expires_in": 3600
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Stream token error: {e}")
        raise HTTPException(status_code=500, detail=f"Token oluşturulamadı: {str(e)}")

@router.post("/streams/{stream_id}/ingress")
async def create_ingress(stream_id: str, _: str = Depends(_validate_admin_token)):
    """RTMP Ingress oluştur"""
    try:
        import requests
        import jwt
        from datetime import datetime, timedelta
        
        # Stream bilgilerini al
        with engine.connect() as conn:
            stream = conn.execute(text("""
                SELECT id, channel, status
                FROM streams 
                WHERE id = :stream_id
            """), {"stream_id": stream_id}).fetchone()
            
            if not stream:
                raise HTTPException(status_code=404, detail="Stream bulunamadı")
        
        settings = Settings()
        
        # LiveKit Ingress API token oluştur
        ingress_token_payload = {
            "iss": settings.LIVEKIT_API_KEY,
            "sub": f"ingress_{stream_id}",
            "iat": int(datetime.now().timestamp()),
            "exp": int((datetime.now() + timedelta(hours=24)).timestamp()),
            "name": f"Ingress {stream_id}",
            "video": {
                "room": stream.channel,
                "roomJoin": True,
                "canPublish": True,
                "canSubscribe": False,
                "canPublishData": False,
                "hidden": False,
                "recorder": False
            }
        }
        
        ingress_token = jwt.encode(ingress_token_payload, settings.LIVEKIT_API_SECRET, algorithm="HS256")
        
        # LiveKit Ingress API çağrısı
        ingress_data = {
            "inputType": "RTMP_INPUT",
            "name": f"kurban_stream_{stream_id}",
            "roomName": stream.channel,
            "participantIdentity": f"publisher_{stream_id}",
            "participantName": f"Kurban Yayını {stream_id}",
            "enableTranscoding": True
        }
        
        headers = {
            "Authorization": f"Bearer {ingress_token}",
            "Content-Type": "application/json"
        }
        
        try:
            # LiveKit Ingress API çağrısı yap
            response = requests.post(
                f"{settings.LIVEKIT_URL}/twirp/livekit.IngressService/CreateIngress",
                headers=headers,
                json=ingress_data,
                timeout=10
            )
            
            if response.status_code == 200:
                ingress_info = response.json()
                return {
                    "rtmp_url": f"rtmp://kurban-cebimde-q2l64d9v.livekit.cloud/live",
                    "stream_key": ingress_info.get("streamKey", f"kurban_stream_{stream_id}"),
                    "ingress_id": ingress_info.get("ingressId", f"ingress_{stream_id}"),
                    "room_name": stream.channel,
                    "stream_id": stream_id,
                    "status": "success"
                }
            else:
                print(f"❌ RTMP Ingress API hatası: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ RTMP Ingress API çağrısı hatası: {e}")
        
        # Fallback: Basit RTMP bilgileri döndür
        return {
            "rtmp_url": "rtmp://kurban-cebimde-q2l64d9v.livekit.cloud/live",
            "stream_key": f"kurban_stream_{stream_id}",
            "ingress_id": f"ingress_{stream_id}",
            "room_name": stream.channel,
            "stream_id": stream_id,
            "note": "RTMP Ingress API hatası - Fallback bilgileri"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Ingress creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Ingress oluşturulamadı: {str(e)}")


