from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.services.ollama_service import OllamaService
from backend.app.database.mongodb import get_db_status

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
async def health_check():
    """Check backend API availability."""
    db_status = get_db_status()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status
    }

@router.get("/health/ai")
async def ai_health_check():
    """Check whether Ollama and the configured Gemma model are accessible."""
    ollama_info = await OllamaService.check_health()
    return {
        "service": settings.PROJECT_NAME,
        "ai_engine": ollama_info,
        "database": get_db_status()
    }
