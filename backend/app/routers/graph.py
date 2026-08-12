from fastapi import APIRouter
from app.models.graph import GraphData
from app.services.graph_service import GraphService

router = APIRouter(prefix="/api/graph", tags=["Graph Visualizer"])

@router.get("", response_model=GraphData)
def get_graph():
    """Retrieve full network graph dataset (nodes & edges) for visualizer."""
    return GraphService.get_full_graph()
