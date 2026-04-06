from fastapi import APIRouter
from app.core.database import check_db_connection
from app.core.config import settings

router = APIRouter()


@router.get("/health", tags=["Health"])
def health_check():
    db_ok = check_db_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "database": "connected" if db_ok else "unreachable",
    }
