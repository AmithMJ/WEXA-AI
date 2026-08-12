from fastapi import APIRouter
from app.services.graph_service import GraphService
from app.database.connection import DatabaseConnection

router = APIRouter(prefix="/api/seed", tags=["Database Seed"])

@router.post("")
def seed_database():
    """Trigger seed data population into CognoDB openCypher and in-memory store."""
    driver = DatabaseConnection.get_driver()
    cogno_seeded = False
    if driver:
        try:
            with driver.session() as session:
                GraphService.run_seed_queries(session)
                cogno_seeded = True
        except Exception as e:
            pass

    GraphService.populate_in_memory_seed()
    
    return {
        "status": "success",
        "message": "Database successfully populated with sample Developers, Skills, Jobs, Companies, and Learning Resources.",
        "cogno_database_seeded": cogno_seeded,
        "fallback_store_seeded": True
    }
