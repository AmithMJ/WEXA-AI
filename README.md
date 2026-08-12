# SkillGraph (WEXA AI) - Developer Skill & Job Recommendation Platform

![SkillGraph Platform](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![CognoDB](https://img.shields.io/badge/CognoDB-openCypher-41B883.svg?style=for-the-badge)

A full-stack, graph-powered **Developer Skill & Job Recommendation Platform** built with **FastAPI (Python)** and **React + Vite**. **SkillGraph** models developers, skills, jobs, companies, and learning resources as nodes in a unified knowledge graph. It computes set-intersection recommendations, identifies skill gaps, and visualizes real-time entity relationships.

---

## 🚀 Features

- **Interactive Knowledge Graph Canvas**: Visualizes relationships (`HAS_SKILL`, `REQUIRES`, `RELATED_TO`, `OFFERS`, `TEACHES`) in an interactive network view.
- **Smart Job Matcher & Gap Analysis**: Calculates match percentages by intersecting developer skills with open job requirements, providing actionable skill gap recommendations.
- **Skill Taxonomy & Learning Resources**: Explores backend, frontend, DevOps, AI/ML, and cloud skill trees alongside curated learning links.
- **Developer Workbench**: Create developer profiles and attach/detach skills in real time with instant backend graph updates.
- **CognoDB & In-Memory Fallback**: Seamless openCypher graph database integration with automated in-memory store fallback.

---

## 🛠️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT FRONTEND (Vite UI)                        │
│  [GraphCanvas]  [JobMatcher]  [SkillExplorer]  [DeveloperWorkbench]    │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                         REST API Requests (HTTP)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND (Python)                        │
│  Routers: /api/developers, /api/skills, /api/jobs, /api/graph, etc.   │
└────────────────────────────────────────────────────────────────────────┘
                                   │
            ┌──────────────────────┴──────────────────────┐
            ▼ (Primary)                                   ▼ (Fallback)
┌───────────────────────┐                     ┌───────────────────────┐
│   CognoDB Graph DB    │                     │   In-Memory Graph     │
│ (openCypher / Bolt)   │                     │    Fallback Store     │
└───────────────────────┘                     └───────────────────────┘
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### 1. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Install python dependencies
pip install -r requirements.txt

# Launch FastAPI server
uvicorn app.main:app --reload --port 8000
```

- **Backend API**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`

---

### 2. Frontend Setup (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

- **Frontend Application**: `http://localhost:5173`

---

## 🧪 Automated Testing

To run the end-to-end API test suite for backend graph endpoints:

```bash
cd backend
python test_api.py
```

---

## 📁 Repository Structure

```
WEXA AI/
├── backend/
│   ├── app/
│   │   ├── database/     # CognoDB Bolt connection & schema handlers
│   │   ├── models/       # Pydantic data schemas
│   │   ├── routers/      # FastAPI API endpoints
│   │   ├── services/     # Graph recommendation engine & Cypher queries
│   │   └── main.py       # FastAPI application entrypoint
│   ├── requirements.txt  # Python requirements
│   └── test_api.py       # API test runner
├── frontend/
│   ├── src/
│   │   ├── components/   # React components (GraphCanvas, JobMatcher, etc.)
│   │   ├── App.jsx       # Root React application
│   │   └── main.jsx      # Entrypoint
│   ├── package.json      # Dependencies and scripts
│   └── vite.config.js    # Vite configuration
└── README.md
```

---

## 🌐 Deploying to GitHub & Hosted Demo

### Option A: Create GitHub Repository via GitHub CLI (`gh`)

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: SkillGraph full-stack application"

# Create public GitHub repository and push
gh repo create skillgraph-wexa-ai --public --source=. --remote=origin --push
```

### Option B: Manual GitHub Upload

```bash
git init
git add .
git commit -m "Initial commit: SkillGraph full-stack application"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/skillgraph-wexa-ai.git
git push -u origin main
```

### Deployment Recommendations

| Service | Component | Guide |
|---|---|---|
| **Vercel** / **Netlify** | Frontend (`/frontend`) | Deploy standard Vite SPA. Build command: `npm run build`, Output directory: `dist`. Set `VITE_API_URL` environment variable if hosting backend remotely. |
| **Render** / **Railway** | Backend (`/backend`) | Deploy Python Web Service. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. |

---

## 📄 License

Distributed under the MIT License.
