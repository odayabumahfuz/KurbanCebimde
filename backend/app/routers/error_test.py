from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Dict, List, Optional
import time
import random

from ..middleware.error_handler import CustomHTTPException, create_error_response

router = APIRouter(tags=["error-test"])

# Test Models
class ErrorTestRequest(BaseModel):
    error_type: str
    message: Optional[str] = None
    status_code: Optional[int] = None

# Error Testing Endpoints
@router.get("/")
async def error_test_root():
    """Error test root endpoint"""
    return {
        "message": "Error Testing API 🚨",
        "timestamp": int(time.time()),
        "status": "active",
        "available_tests": [
            "validation_error",
            "authentication_error", 
            "authorization_error",
            "not_found_error",
            "internal_server_error",
            "database_error",
            "rate_limit_error",
            "custom_error"
        ]
    }

@router.post("/validation")
async def test_validation_error(request: ErrorTestRequest):
    """Validation error test"""
    if request.error_type == "validation_error":
        # Geçersiz veri gönder
        raise HTTPException(
            status_code=422,
            detail="Validation error test - geçersiz veri"
        )
    else:
        return {"message": "Validation error test başarılı"}

@router.get("/authentication")
async def test_authentication_error():
    """Authentication error test"""
    raise CustomHTTPException(
        status_code=401,
        detail="Authentication error test",
        error_code="AUTH_INVALID_CREDENTIALS",
        extra_data={"test": True}
    )

@router.get("/authorization")
async def test_authorization_error():
    """Authorization error test"""
    raise CustomHTTPException(
        status_code=403,
        detail="Authorization error test",
        error_code="AUTH_INSUFFICIENT_PERMISSIONS",
        extra_data={"required_role": "admin"}
    )

@router.get("/not_found")
async def test_not_found_error():
    """Not found error test"""
    raise CustomHTTPException(
        status_code=404,
        detail="Not found error test",
        error_code="RESOURCE_NOT_FOUND",
        extra_data={"resource": "test_resource"}
    )

@router.get("/internal_server")
async def test_internal_server_error():
    """Internal server error test"""
    raise CustomHTTPException(
        status_code=500,
        detail="Internal server error test",
        error_code="INTERNAL_SERVER_ERROR",
        extra_data={"error_id": f"test_{int(time.time())}"}
    )

@router.get("/database")
async def test_database_error():
    """Database error test"""
    raise CustomHTTPException(
        status_code=500,
        detail="Database error test",
        error_code="DATABASE_CONNECTION_ERROR",
        extra_data={"database": "postgresql"}
    )

@router.get("/rate_limit")
async def test_rate_limit_error():
    """Rate limit error test"""
    raise CustomHTTPException(
        status_code=429,
        detail="Rate limit error test",
        error_code="RATE_LIMIT_EXCEEDED",
        extra_data={"limit": 100, "window": 3600}
    )

@router.post("/custom")
async def test_custom_error(request: ErrorTestRequest):
    """Custom error test"""
    status_code = request.status_code or 400
    message = request.message or "Custom error test"
    
    raise CustomHTTPException(
        status_code=status_code,
        detail=message,
        error_code="CUSTOM_ERROR",
        extra_data={
            "test": True,
            "timestamp": int(time.time()),
            "random": random.randint(1, 1000)
        }
    )

@router.get("/random")
async def test_random_error():
    """Random error test"""
    error_types = [
        ("validation_error", 422),
        ("authentication_error", 401),
        ("authorization_error", 403),
        ("not_found_error", 404),
        ("internal_server_error", 500),
        ("database_error", 500),
        ("rate_limit_error", 429)
    ]
    
    error_type, status_code = random.choice(error_types)
    
    raise CustomHTTPException(
        status_code=status_code,
        detail=f"Random error test: {error_type}",
        error_code=error_type.upper(),
        extra_data={
            "error_type": error_type,
            "status_code": status_code,
            "random": True
        }
    )

@router.get("/chain")
async def test_error_chain():
    """Error chain test - bir hata başka hataya sebep olur"""
    try:
        # İlk hata
        raise ValueError("İlk hata: Geçersiz değer")
    except ValueError as e:
        # İkinci hata
        raise CustomHTTPException(
            status_code=500,
            detail=f"Error chain test: {str(e)}",
            error_code="ERROR_CHAIN",
            extra_data={
                "original_error": str(e),
                "chain_length": 2
            }
        )

@router.get("/timeout")
async def test_timeout_error():
    """Timeout error test"""
    import asyncio
    await asyncio.sleep(0.1)  # Kısa bekleme
    
    raise CustomHTTPException(
        status_code=504,
        detail="Timeout error test",
        error_code="REQUEST_TIMEOUT",
        extra_data={"timeout": 30}
    )

@router.get("/service_unavailable")
async def test_service_unavailable_error():
    """Service unavailable error test"""
    raise CustomHTTPException(
        status_code=503,
        detail="Service unavailable error test",
        error_code="SERVICE_UNAVAILABLE",
        extra_data={"service": "external_api"}
    )

@router.get("/bad_request")
async def test_bad_request_error():
    """Bad request error test"""
    raise CustomHTTPException(
        status_code=400,
        detail="Bad request error test",
        error_code="BAD_REQUEST",
        extra_data={"field": "test_field"}
    )

@router.get("/conflict")
async def test_conflict_error():
    """Conflict error test"""
    raise CustomHTTPException(
        status_code=409,
        detail="Conflict error test",
        error_code="RESOURCE_CONFLICT",
        extra_data={"resource": "duplicate_resource"}
    )

@router.get("/unprocessable_entity")
async def test_unprocessable_entity_error():
    """Unprocessable entity error test"""
    raise CustomHTTPException(
        status_code=422,
        detail="Unprocessable entity error test",
        error_code="UNPROCESSABLE_ENTITY",
        extra_data={"validation_errors": ["field1", "field2"]}
    )

@router.get("/too_many_requests")
async def test_too_many_requests_error():
    """Too many requests error test"""
    raise CustomHTTPException(
        status_code=429,
        detail="Too many requests error test",
        error_code="TOO_MANY_REQUESTS",
        extra_data={"retry_after": 60}
    )

@router.get("/all")
async def test_all_errors():
    """Tüm error türlerini test et"""
    return {
        "message": "Tüm error türleri test edildi",
        "timestamp": int(time.time()),
        "tests": [
            {"endpoint": "/error-test/validation", "status": "ready"},
            {"endpoint": "/error-test/authentication", "status": "ready"},
            {"endpoint": "/error-test/authorization", "status": "ready"},
            {"endpoint": "/error-test/not_found", "status": "ready"},
            {"endpoint": "/error-test/internal_server", "status": "ready"},
            {"endpoint": "/error-test/database", "status": "ready"},
            {"endpoint": "/error-test/rate_limit", "status": "ready"},
            {"endpoint": "/error-test/custom", "status": "ready"},
            {"endpoint": "/error-test/random", "status": "ready"},
            {"endpoint": "/error-test/chain", "status": "ready"},
            {"endpoint": "/error-test/timeout", "status": "ready"},
            {"endpoint": "/error-test/service_unavailable", "status": "ready"},
            {"endpoint": "/error-test/bad_request", "status": "ready"},
            {"endpoint": "/error-test/conflict", "status": "ready"},
            {"endpoint": "/error-test/unprocessable_entity", "status": "ready"},
            {"endpoint": "/error-test/too_many_requests", "status": "ready"}
        ]
    }

@router.get("/status")
async def error_test_status():
    """Error test servisi durumu"""
    return {
        "service": "Error Testing",
        "status": "active",
        "timestamp": int(time.time()),
        "description": "API error handling test servisi"
    }
