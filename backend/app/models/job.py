from pydantic import BaseModel, Field
from typing import List, Optional

class JobBase(BaseModel):
    id: str = Field(..., description="Unique job identifier")
    title: str = Field(..., description="Job position title")
    description: str = Field(..., description="Detailed role summary")
    experience_level: str = Field(..., description="Junior, Mid, Senior, Lead")
    location: str = Field(..., description="City or Remote")
    remote: bool = Field(default=False, description="Whether full remote is allowed")
    salary_min: int = Field(..., ge=0, description="Minimum annual compensation USD")
    salary_max: int = Field(..., ge=0, description="Maximum annual compensation USD")

class JobCreate(JobBase):
    company_id: str

class Job(JobBase):
    company_id: Optional[str] = None
    company_name: Optional[str] = None
    required_skills: List[str] = Field(default_factory=list)

class JobRecommendation(BaseModel):
    job_id: str
    title: str
    company_id: str
    company_name: str
    location: str
    remote: bool
    experience_level: str
    salary_min: int
    salary_max: int
    match_percentage: int
    matching_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    required_skills: List[str] = Field(default_factory=list)
