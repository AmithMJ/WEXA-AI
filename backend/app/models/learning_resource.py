from pydantic import BaseModel, Field

class LearningResourceBase(BaseModel):
    id: str = Field(..., description="Unique learning resource identifier")
    title: str = Field(..., description="Resource title")
    type: str = Field(..., description="Course, Documentation, Video, Book")
    url: str = Field(..., description="Resource URL")
    difficulty: str = Field(..., description="Beginner, Intermediate, Advanced")

class LearningResourceCreate(LearningResourceBase):
    skill_id: str

class LearningResource(LearningResourceBase):
    associated_skill_name: str = ""
