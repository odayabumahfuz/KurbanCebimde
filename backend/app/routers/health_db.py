from fastapi import APIRouter, HTTPException
from sqlalchemy import create_engine, text
import os

router = APIRouter(tags=["health"]) 

@router.get("/healthz")
def healthz():
    url = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:password@postgres:5432/kurban_cebimde")
    try:
        engine = create_engine(url, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"db check failed: {e}")


