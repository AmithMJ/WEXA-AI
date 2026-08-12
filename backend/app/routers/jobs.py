from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from app.models.job import Job
from app.services.graph_service import GraphService

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

@router.get("", response_model=List[Job])
def get_jobs(remote_only: Optional[bool] = False, exp_level: Optional[str] = None):
    """List open jobs with optional filters."""
    jobs = GraphService.get_jobs()
    if remote_only:
        jobs = [j for j in jobs if j.remote]
    if exp_level:
        jobs = [j for j in jobs if j.experience_level.lower() == exp_level.lower()]
    return jobs

@router.get("/{job_id}", response_model=Job)
def get_job(job_id: str):
    """Get detailed job requirement."""
    job = GraphService.get_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job with ID '{job_id}' not found.")
    return job
