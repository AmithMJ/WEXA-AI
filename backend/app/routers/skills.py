from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from app.models.skill import Skill, SkillDetails
from app.services.graph_service import GraphService

router = APIRouter(prefix="/api/skills", tags=["Skills"])

@router.get("", response_model=List[Skill])
def get_skills(category: Optional[str] = None):
    """List all skills, optionally filtered by category."""
    skills = GraphService.get_skills()
    if category:
        skills = [s for s in skills if s.category.lower() == category.lower()]
    return skills

@router.get("/{skill_id}", response_model=SkillDetails)
def get_skill_details(skill_id: str):
    """Retrieve skill details with related skills and learning resources."""
    details = GraphService.get_skill_details(skill_id)
    if not details:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Skill with ID/Name '{skill_id}' not found.")
    return details
