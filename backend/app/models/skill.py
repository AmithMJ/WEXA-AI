from pydantic import BaseModel, Field
from typing import List, Optional

class SkillBase(BaseModel):
    id: str = Field(..., description="Unique skill identifier")
    name: str = Field(..., description="Skill name e.g. React, Python")
    category: str = Field(..., description="Category e.g. Frontend, Backend, Cloud, AI")
    description: str = Field(..., description="Brief skill overview")

class SkillCreate(SkillBase):
    pass

class Skill(SkillBase):
    related_skills: List[str] = Field(default_factory=list, description="IDs or names of related skills")

class LearningResourceRef(BaseModel):
    id: str
    title: str
    type: str
    url: str
    difficulty: str

class SkillDetails(SkillBase):
    related_skills: List[dict] = Field(default_factory=list)
    learning_resources: List[LearningResourceRef] = Field(default_factory=list)
