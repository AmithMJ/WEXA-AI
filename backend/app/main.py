from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database.connection import DatabaseConnection
from app.database.schema import init_schema
from app.services.graph_service import GraphService
from app.routers import developers, skills, jobs, companies, graph, seed

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("skillgraph.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown events."""
    logger.info("Initializing SkillGraph FastAPI Backend...")
    db_status = DatabaseConnection.verify_connection()
    if db_status["connected"]:
        logger.info("CognoDB connection verified on startup!")
        init_schema()
    else:
        logger.warning(f"CognoDB unavailable on startup: {db_status['error']}. App operating with high-performance in-memory graph store.")
    
    # Pre-seed fallback graph
    GraphService.seed_data_if_empty()
    yield

    logger.info("Shutting down SkillGraph FastAPI Backend...")
    DatabaseConnection.close_driver()

app = FastAPI(
    title="SkillGraph API",
    description="Developer Skill & Job Recommendation Platform powered by CognoDB openCypher Graph Database",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(developers.router)
app.include_router(skills.router)
app.include_router(jobs.router)
app.include_router(companies.router)
app.include_router(graph.router)
app.include_router(seed.router)

@app.get("/")
def read_root():
    return {
        "name": "SkillGraph API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

@app.get("/api/health")
def health_check():
    """Health check endpoint evaluating backend status and CognoDB connectivity."""
    db_health = DatabaseConnection.verify_connection()
    
    return {
        "status": "healthy" if db_health["connected"] else "degraded",
        "service": "skillgraph-backend",
        "database": {
            "provider": "CognoDB",
            "protocol": "Bolt (openCypher)",
            "uri": settings.COGNODB_URI,
            "connected": db_health["connected"],
            "status": db_health["status"],
            "error": db_health["error"]
        }
    }

