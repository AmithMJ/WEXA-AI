from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class GraphNode(BaseModel):
    id: str
    label: str  # Developer, Skill, Job, Company, LearningResource
    name: str   # Display name / title
    category: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str  # HAS_SKILL, REQUIRES, OFFERS, INTERESTED_IN, RELATED_TO, LEARNED_THROUGH
    label: str

class GraphData(BaseModel):
    nodes: List[GraphNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)
