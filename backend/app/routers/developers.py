from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.developer import Developer, DeveloperCreate, DeveloperSummary
from app.models.job import JobRecommendation
from app.services.graph_service import GraphService

router = APIRouter(prefix="/api/developers", tags=["Developers"])

@router.get("", response_model=List[DeveloperSummary])
def get_developers():
    """List all developer summaries."""
    return GraphService.get_developers()

@router.get("/{dev_id}", response_model=Developer)
def get_developer(dev_id: str):
    """Retrieve detailed developer profile."""
    dev = GraphService.get_developer(dev_id)
    if not dev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Developer with ID '{dev_id}' not found.")
    return dev

@router.post("", response_model=Developer, status_code=status.HTTP_201_CREATED)
def create_developer(data: DeveloperCreate):
    """Create a new developer node."""
    return GraphService.create_developer(data)

@router.post("/{dev_id}/skills", response_model=Developer)
def update_developer_skills(dev_id: str, skill_ids: List[str]):
    """Update or attach HAS_SKILL relationships for developer."""
    dev = GraphService.update_developer_skills(dev_id, skill_ids)
    if not dev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Developer with ID '{dev_id}' not found.")
    return dev

@router.get("/{dev_id}/recommendations", response_model=List[JobRecommendation])
def get_job_recommendations(dev_id: str):
    """Get job recommendations with match percentages and skill gap analysis."""
    dev = GraphService.get_developer(dev_id)
    if not dev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Developer with ID '{dev_id}' not found.")
    return GraphService.recommend_jobs_for_developer(dev_id)
