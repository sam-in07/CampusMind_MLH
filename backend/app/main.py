import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.database.mongodb import init_mongo
from backend.app.api import health, academic, ai, materials, assessments, cgpa, profile

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("campusmind")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Starting CampusMind backend for IIUC students...")
    mongo_ok = init_mongo()
    if mongo_ok:
        logger.info("MongoDB Atlas connected successfully.")
    else:
        logger.info("MongoDB not connected; using local JSON fallback persistence mode.")
    yield
    # Shutdown actions
    logger.info("CampusMind backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CampusMind: Complete AI-Powered Student Study Assistant for IIUC Students",
    lifespan=lifespan
)

# Configure CORS
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(academic.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(materials.router, prefix="/api")
app.include_router(assessments.router, prefix="/api")
app.include_router(cgpa.router, prefix="/api")
app.include_router(profile.router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "CampusMind",
        "tagline": "Your Department. Your Studies. Your AI.",
        "university": "International Islamic University Chittagong (IIUC)",
        "docs": "/docs",
        "api_health": "/api/health",
        "ai_health": "/api/health/ai"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
