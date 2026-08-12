from pydantic import BaseModel, Field
from typing import List, Optional

class CompanyBase(BaseModel):
    id: str = Field(..., description="Unique company identifier")
    name: str = Field(..., description="Company name")
    industry: str = Field(..., description="Primary industry sector")
    location: str = Field(..., description="Headquarters location")
    website: str = Field(..., description="Company website URL")

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    offered_job_count: int = 0
