from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import time
import redis
import os
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# Redis connection (optional, falls back to in-memory)
try:
    redis_client = redis.Redis.from_url(
        os.getenv("REDIS_URL", "redis://redis:6379"),
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5
    )
    redis_client.ping()  # Test connection
    logger.info("Redis connected for rate limiting")
except Exception as e:
    logger.warning(f"Redis not available, using in-memory rate limiting: {e}")
    redis_client = None

# In-memory storage for rate limiting (fallback)
memory_storage: Dict[str, Dict] = {}

class CustomRateLimiter:
    """Özel rate limiter sınıfı"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.memory_storage = memory_storage
    
    def get_client_ip(self, request: Request) -> str:
        """Client IP adresini al"""
        # X-Forwarded-For header'ını kontrol et (proxy arkasında)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        # X-Real-IP header'ını kontrol et
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Default client IP
        return get_remote_address(request)
    
    def get_user_id(self, request: Request) -> Optional[str]:
        """Request'ten user ID al (JWT token'dan)"""
        try:
            authorization = request.headers.get("Authorization")
            if authorization and authorization.startswith("Bearer "):
                token = authorization.split(" ")[1]
                # JWT token'ı decode et (basit implementation)
                import jwt
                payload = jwt.decode(token, options={"verify_signature": False})
                return payload.get("user_id")
        except Exception:
            pass
        return None
    
    def get_key(self, request: Request, identifier: str = "ip") -> str:
        """Rate limit key oluştur"""
        if identifier == "user":
            user_id = self.get_user_id(request)
            if user_id:
                return f"rate_limit:user:{user_id}"
        
        # Default: IP-based
        client_ip = self.get_client_ip(request)
        return f"rate_limit:ip:{client_ip}"
    
    def is_allowed(self, key: str, limit: int, window: int) -> tuple[bool, Dict]:
        """Rate limit kontrolü yap"""
        current_time = int(time.time())
        window_start = current_time - window
        
        if self.redis_client:
            return self._redis_check(key, limit, window, current_time, window_start)
        else:
            return self._memory_check(key, limit, window, current_time, window_start)
    
    def _redis_check(self, key: str, limit: int, window: int, current_time: int, window_start: int) -> tuple[bool, Dict]:
        """Redis ile rate limit kontrolü"""
        try:
            pipe = self.redis_client.pipeline()
            
            # Eski kayıtları temizle
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Mevcut istekleri say
            pipe.zcard(key)
            
            # Yeni isteği ekle
            pipe.zadd(key, {str(current_time): current_time})
            
            # TTL ayarla
            pipe.expire(key, window)
            
            results = pipe.execute()
            current_count = results[1]
            
            if current_count >= limit:
                # Rate limit aşıldı
                remaining = 0
                reset_time = current_time + window
            else:
                remaining = limit - current_count - 1
                reset_time = current_time + window
            
            return False, {
                "limit": limit,
                "remaining": remaining,
                "reset_time": reset_time,
                "window": window
            }
            
        except Exception as e:
            logger.error(f"Redis rate limit error: {e}")
            # Redis hatası durumunda memory'ye fallback
            return self._memory_check(key, limit, window, current_time, window_start)
    
    def _memory_check(self, key: str, limit: int, window: int, current_time: int, window_start: int) -> tuple[bool, Dict]:
        """Memory ile rate limit kontrolü"""
        if key not in self.memory_storage:
            self.memory_storage[key] = {
                "requests": [],
                "last_cleanup": current_time
            }
        
        storage = self.memory_storage[key]
        
        # Eski kayıtları temizle
        storage["requests"] = [req_time for req_time in storage["requests"] if req_time > window_start]
        
        # Mevcut istekleri say
        current_count = len(storage["requests"])
        
        if current_count >= limit:
            # Rate limit aşıldı
            remaining = 0
            reset_time = current_time + window
            allowed = False
        else:
            # İsteği ekle
            storage["requests"].append(current_time)
            remaining = limit - current_count - 1
            reset_time = current_time + window
            allowed = True
        
        return allowed, {
            "limit": limit,
            "remaining": remaining,
            "reset_time": reset_time,
            "window": window
        }

# Global rate limiter instance
rate_limiter = CustomRateLimiter(redis_client)

# SlowAPI limiter (fallback)
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=os.getenv("REDIS_URL", "memory://"),
    default_limits=["1000/hour"]
)

def rate_limit_decorator(limit: str, identifier: str = "ip"):
    """Rate limit decorator"""
    def decorator(func):
        async def wrapper(request: Request, *args, **kwargs):
            key = rate_limiter.get_key(request, identifier)
            
            # Limit formatını parse et (örn: "10/minute", "100/hour")
            limit_parts = limit.split("/")
            limit_count = int(limit_parts[0])
            limit_window = limit_parts[1]
            
            # Window'u saniyeye çevir
            window_map = {
                "second": 1,
                "minute": 60,
                "hour": 3600,
                "day": 86400
            }
            window_seconds = window_map.get(limit_window, 60)
            
            # Rate limit kontrolü
            allowed, info = rate_limiter.is_allowed(key, limit_count, window_seconds)
            
            if not allowed:
                error_response = {
                    "success": False,
                    "error": "Rate limit exceeded",
                    "error_code": "RATE_LIMIT_EXCEEDED",
                    "message": f"Çok fazla istek gönderildi. Limit: {limit}",
                    "details": {
                        "limit": info["limit"],
                        "remaining": info["remaining"],
                        "reset_time": info["reset_time"],
                        "window": info["window"]
                    },
                    "timestamp": int(time.time())
                }
                
                response = JSONResponse(
                    status_code=429,
                    content=error_response,
                    headers={
                        "X-RateLimit-Limit": str(info["limit"]),
                        "X-RateLimit-Remaining": str(info["remaining"]),
                        "X-RateLimit-Reset": str(info["reset_time"]),
                        "Retry-After": str(info["window"])
                    }
                )
                return response
            
            # Rate limit headers ekle
            request.state.rate_limit_info = info
            
            return await func(request, *args, **kwargs)
        
        return wrapper
    return decorator

# Rate limit exceeded handler
def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Rate limit aşıldığında çağrılan handler"""
    response = JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": "Rate limit exceeded",
            "error_code": "RATE_LIMIT_EXCEEDED",
            "message": "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.",
            "details": {
                "limit": exc.detail,
                "retry_after": getattr(exc, 'retry_after', 60)
            },
            "timestamp": int(time.time())
        },
        headers={
            "Retry-After": str(getattr(exc, 'retry_after', 60))
        }
    )
    return response

# Rate limit middleware
async def rate_limit_middleware(request: Request, call_next):
    """Rate limit middleware"""
    # Özel endpoint'ler için rate limit uygula
    if request.url.path.startswith("/api/"):
        # API endpoint'leri için genel rate limit
        key = rate_limiter.get_key(request, "ip")
        allowed, info = rate_limiter.is_allowed(key, 1000, 3600)  # 1000/hour
        
        if not allowed:
            error_response = {
                "success": False,
                "error": "Rate limit exceeded",
                "error_code": "RATE_LIMIT_EXCEEDED",
                "message": "API rate limit aşıldı. Lütfen daha sonra tekrar deneyin.",
                "details": {
                    "limit": info["limit"],
                    "remaining": info["remaining"],
                    "reset_time": info["reset_time"],
                    "window": info["window"]
                },
                "timestamp": int(time.time())
            }
            
            return JSONResponse(
                status_code=429,
                content=error_response,
                headers={
                    "X-RateLimit-Limit": str(info["limit"]),
                    "X-RateLimit-Remaining": str(info["remaining"]),
                    "X-RateLimit-Reset": str(info["reset_time"]),
                    "Retry-After": str(info["window"])
                }
            )
        
        # Rate limit bilgilerini request state'e ekle
        request.state.rate_limit_info = info
    
    response = await call_next(request)
    
    # Response headers'a rate limit bilgilerini ekle
    if hasattr(request.state, 'rate_limit_info'):
        info = request.state.rate_limit_info
        response.headers["X-RateLimit-Limit"] = str(info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(info["remaining"])
        response.headers["X-RateLimit-Reset"] = str(info["reset_time"])
    
    return response
