import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoints():
    print("Testing /api/health...")
    res = client.get("/api/health")
    print("Health Status Code:", res.status_code)
    print("Health Data:", res.json())
    assert res.status_code == 200

    print("Testing POST /api/seed...")
    res = client.post("/api/seed")
    print("Seed Status:", res.status_code, res.json())
    assert res.status_code == 200

    print("Testing GET /api/developers...")
    res = client.get("/api/developers")
    print("Developers Count:", len(res.json()))
    assert res.status_code == 200 and len(res.json()) > 0

    print("Testing GET /api/developers/dev-1/recommendations...")
    res = client.get("/api/developers/dev-1/recommendations")
    print("Recommendations:", res.json()[:2])
    assert res.status_code == 200

    print("Testing GET /api/graph...")
    res = client.get("/api/graph")
    graph_data = res.json()
    print("Graph Nodes:", len(graph_data["nodes"]), "Edges:", len(graph_data["edges"]))
    assert res.status_code == 200 and len(graph_data["nodes"]) > 0

    print("\n[SUCCESS] All FastAPI Graph endpoints verified successfully!")

if __name__ == "__main__":
    test_endpoints()
