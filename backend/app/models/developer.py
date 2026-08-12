from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional

class DeveloperBase(BaseModel):
    id: str = Field(..., description="Unique developer identifier")
    name: str = Field(..., description="Full name")
    email: str = Field(..., description="Email address")
    experience_years: int = Field(..., ge=0, description="Years of experience")
    location: str = Field(..., description="City, Country or Remote")
    bio: str = Field(..., description="Short professional bio")

class DeveloperCreate(DeveloperBase):
    pass

class Developer(DeveloperBase):
    skills: List[str] = Field(default_factory=list, description="List of skill names or IDs possessed")
    interested_job_ids: List[str] = Field(default_factory=list, description="List of interested job IDs")

class DeveloperSummary(BaseModel):
    id: str
    name: str
    experience_years: int
    location: str
    skill_count: int = 0
