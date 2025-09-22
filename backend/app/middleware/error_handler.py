from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback
import logging
import time
from typing import Union

# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CustomHTTPException(HTTPException):
    """Özel HTTP exception sınıfı"""
    def __init__(self, status_code: int, detail: str, error_code: str = None, extra_data: dict = None):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        self.extra_data = extra_data or {}

class ErrorResponse:
    """Standart hata response formatı"""
    def __init__(self, 
                 success: bool = False,
                 error: str = None,
                 error_code: str = None,
                 message: str = None,
                 details: dict = None,
                 timestamp: int = None,
                 request_id: str = None):
        self.success = success
        self.error = error
        self.error_code = error_code
        self.message = message
        self.details = details or {}
        self.timestamp = timestamp or int(time.time())
        self.request_id = request_id

    def to_dict(self):
        return {
            "success": self.success,
            "error": self.error,
            "error_code": self.error_code,
            "message": self.message,
            "details": self.details,
            "timestamp": self.timestamp,
            "request_id": self.request_id
        }

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler"""
    request_id = getattr(request.state, 'request_id', None)
    
    # Log the error
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    
    # Custom HTTP Exception
    if isinstance(exc, CustomHTTPException):
        error_response = ErrorResponse(
            success=False,
            error=exc.detail,
            error_code=exc.error_code,
            message=exc.detail,
            details=exc.extra_data,
            request_id=request_id
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response.to_dict()
        )
    
    # FastAPI HTTP Exception
    elif isinstance(exc, HTTPException):
        error_response = ErrorResponse(
            success=False,
            error=exc.detail,
            error_code=f"HTTP_{exc.status_code}",
            message=exc.detail,
            request_id=request_id
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response.to_dict()
        )
    
    # Starlette HTTP Exception
    elif isinstance(exc, StarletteHTTPException):
        error_response = ErrorResponse(
            success=False,
            error=exc.detail,
            error_code=f"STARLETTE_{exc.status_code}",
            message=exc.detail,
            request_id=request_id
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response.to_dict()
        )
    
    # Validation Error
    elif isinstance(exc, RequestValidationError):
        errors = []
        for error in exc.errors():
            field = " -> ".join(str(loc) for loc in error["loc"])
            errors.append({
                "field": field,
                "message": error["msg"],
                "type": error["type"]
            })
        
        error_response = ErrorResponse(
            success=False,
            error="Validation Error",
            error_code="VALIDATION_ERROR",
            message="Gönderilen veriler geçersiz",
            details={"validation_errors": errors},
            request_id=request_id
        )
        return JSONResponse(
            status_code=422,
            content=error_response.to_dict()
        )
    
    # Database Error
    elif "database" in str(exc).lower() or "sql" in str(exc).lower():
        error_response = ErrorResponse(
            success=False,
            error="Database Error",
            error_code="DATABASE_ERROR",
            message="Veritabanı hatası oluştu",
            details={"original_error": str(exc)},
            request_id=request_id
        )
        return JSONResponse(
            status_code=500,
            content=error_response.to_dict()
        )
    
    # Network/Connection Error
    elif "connection" in str(exc).lower() or "network" in str(exc).lower():
        error_response = ErrorResponse(
            success=False,
            error="Connection Error",
            error_code="CONNECTION_ERROR",
            message="Bağlantı hatası oluştu",
            details={"original_error": str(exc)},
            request_id=request_id
        )
        return JSONResponse(
            status_code=503,
            content=error_response.to_dict()
        )
    
    # Generic Error
    else:
        error_response = ErrorResponse(
            success=False,
            error="Internal Server Error",
            error_code="INTERNAL_ERROR",
            message="Beklenmeyen bir hata oluştu",
            details={"original_error": str(exc)},
            request_id=request_id
        )
        return JSONResponse(
            status_code=500,
            content=error_response.to_dict()
        )

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Validation exception handler"""
    request_id = getattr(request.state, 'request_id', None)
    
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        errors.append({
            "field": field,
            "message": error["msg"],
            "type": error["type"],
            "input": error.get("input")
        })
    
    error_response = ErrorResponse(
        success=False,
        error="Validation Error",
        error_code="VALIDATION_ERROR",
        message="Gönderilen veriler geçersiz",
        details={
            "validation_errors": errors,
            "total_errors": len(errors)
        },
        request_id=request_id
    )
    
    logger.warning(f"Validation error: {errors}")
    
    return JSONResponse(
        status_code=422,
        content=error_response.to_dict()
    )

async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """HTTP exception handler"""
    request_id = getattr(request.state, 'request_id', None)
    
    error_response = ErrorResponse(
        success=False,
        error=exc.detail,
        error_code=f"HTTP_{exc.status_code}",
        message=exc.detail,
        request_id=request_id
    )
    
    logger.warning(f"HTTP error {exc.status_code}: {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.to_dict()
    )

# Error codes mapping
ERROR_CODES = {
    # Authentication & Authorization
    "AUTH_INVALID_CREDENTIALS": "Geçersiz kullanıcı adı veya şifre",
    "AUTH_TOKEN_EXPIRED": "Token süresi dolmuş",
    "AUTH_TOKEN_INVALID": "Geçersiz token",
    "AUTH_INSUFFICIENT_PERMISSIONS": "Yetersiz yetki",
    "AUTH_USER_NOT_FOUND": "Kullanıcı bulunamadı",
    
    # Validation
    "VALIDATION_REQUIRED_FIELD": "Bu alan zorunludur",
    "VALIDATION_INVALID_FORMAT": "Geçersiz format",
    "VALIDATION_OUT_OF_RANGE": "Değer aralık dışında",
    "VALIDATION_DUPLICATE_VALUE": "Bu değer zaten kullanılıyor",
    
    # Database
    "DATABASE_CONNECTION_ERROR": "Veritabanı bağlantı hatası",
    "DATABASE_QUERY_ERROR": "Veritabanı sorgu hatası",
    "DATABASE_CONSTRAINT_ERROR": "Veritabanı kısıtlama hatası",
    
    # External Services
    "EXTERNAL_SERVICE_ERROR": "Dış servis hatası",
    "EXTERNAL_API_TIMEOUT": "Dış API zaman aşımı",
    "EXTERNAL_API_RATE_LIMIT": "Dış API rate limit",
    
    # Business Logic
    "BUSINESS_LOGIC_ERROR": "İş mantığı hatası",
    "BUSINESS_RULE_VIOLATION": "İş kuralı ihlali",
    "BUSINESS_INSUFFICIENT_BALANCE": "Yetersiz bakiye",
    
    # File Operations
    "FILE_NOT_FOUND": "Dosya bulunamadı",
    "FILE_UPLOAD_ERROR": "Dosya yükleme hatası",
    "FILE_SIZE_EXCEEDED": "Dosya boyutu aşıldı",
    "FILE_TYPE_NOT_SUPPORTED": "Desteklenmeyen dosya tipi",
    
    # Rate Limiting
    "RATE_LIMIT_EXCEEDED": "Rate limit aşıldı",
    "RATE_LIMIT_TOO_MANY_REQUESTS": "Çok fazla istek",
    
    # General
    "INTERNAL_SERVER_ERROR": "Sunucu hatası",
    "SERVICE_UNAVAILABLE": "Servis kullanılamıyor",
    "MAINTENANCE_MODE": "Bakım modu",
    "FEATURE_NOT_IMPLEMENTED": "Özellik henüz implement edilmedi"
}

def get_error_message(error_code: str) -> str:
    """Error code'dan mesaj al"""
    return ERROR_CODES.get(error_code, "Bilinmeyen hata")

def create_error_response(error_code: str, 
                         status_code: int = 400, 
                         details: dict = None,
                         request_id: str = None) -> JSONResponse:
    """Standart hata response oluştur"""
    error_response = ErrorResponse(
        success=False,
        error=get_error_message(error_code),
        error_code=error_code,
        message=get_error_message(error_code),
        details=details or {},
        request_id=request_id
    )
    
    return JSONResponse(
        status_code=status_code,
        content=error_response.to_dict()
    )
