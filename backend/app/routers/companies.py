from fastapi import APIRouter
from typing import List
from app.models.company import Company
from app.services.graph_service import GraphService

router = APIRouter(prefix="/api/companies", tags=["Companies"])

@router.get("", response_model=List[Company])
def get_companies():
    """List partner companies."""
    return GraphService.get_companies()
