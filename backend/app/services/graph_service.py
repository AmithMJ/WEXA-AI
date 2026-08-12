import logging
import uuid
from typing import List, Dict, Any, Optional
from app.database.connection import DatabaseConnection
from app.models.developer import Developer, DeveloperCreate, DeveloperSummary
from app.models.skill import Skill, SkillCreate, SkillDetails, LearningResourceRef
from app.models.job import Job, JobCreate, JobRecommendation
from app.models.company import Company, CompanyCreate
from app.models.learning_resource import LearningResource, LearningResourceCreate
from app.models.graph import GraphNode, GraphEdge, GraphData

logger = logging.getLogger("skillgraph.service")

# Fallback In-Memory Storage in case CognoDB is offline or empty
_in_memory_developers: Dict[str, dict] = {}
_in_memory_skills: Dict[str, dict] = {}
_in_memory_jobs: Dict[str, dict] = {}
_in_memory_companies: Dict[str, dict] = {}
_in_memory_resources: Dict[str, dict] = {}
_in_memory_relationships: List[dict] = []

class GraphService:

    @classmethod
    def seed_data_if_empty(cls):
        """Populate initial seed dataset into CognoDB openCypher and in-memory fallback."""
        driver = DatabaseConnection.get_driver()
        connected = False
        if driver:
            try:
                with driver.session() as session:
                    result = session.run("MATCH (n) RETURN count(n) AS cnt")
                    record = result.single()
                    connected = True
                    if record and record["cnt"] == 0:
                        cls.run_seed_queries(session)
            except Exception as e:
                logger.warning(f"Failed to check/seed CognoDB: {e}. Populating in-memory fallback store.")

        # Always ensure in-memory fallback is populated
        if not _in_memory_skills:
            cls.populate_in_memory_seed()

    @classmethod
    def run_seed_queries(cls, session):
        """Execute openCypher seed queries on CognoDB."""
        logger.info("Executing openCypher seed dataset queries on CognoDB...")
        
        # 1. Clear existing
        session.run("MATCH (n) DETACH DELETE n")
        
        # 2. Companies
        companies = [
            ("comp-1", "TechCorp Global", "Cloud & AI Enterprise", "San Francisco, CA", "https://techcorp.example.com"),
            ("comp-2", "DevFlow Systems", "Developer Tools", "Austin, TX", "https://devflow.example.com"),
            ("comp-3", "DataNode Labs", "Fintech & Data Infrastructure", "New York, NY", "https://datanode.example.com"),
            ("comp-4", "CyberShield Systems", "Cybersecurity", "Boston, MA", "https://cybershield.example.com"),
            ("comp-5", "CloudScale Networks", "SaaS Infrastructure", "Seattle, WA", "https://cloudscale.example.com")
        ]
        for cid, name, ind, loc, web in companies:
            session.run(
                "CREATE (c:Company {id: $id, name: $name, industry: $industry, location: $location, website: $website})",
                id=cid, name=name, industry=ind, location=loc, website=web
            )

        # 3. Skills
        skills = [
            ("skill-python", "Python", "Backend", "High-level programming language for web & AI"),
            ("skill-fastapi", "FastAPI", "Backend", "Modern high-performance web framework for Python"),
            ("skill-react", "React", "Frontend", "Declarative component-based UI library"),
            ("skill-typescript", "TypeScript", "Frontend", "Typed superset of JavaScript"),
            ("skill-node", "Node.js", "Backend", "JavaScript runtime environment"),
            ("skill-opencypher", "openCypher", "Database", "Graph database query language"),
            ("skill-neo4j", "Neo4j / CognoDB", "Database", "Graph database technology engine"),
            ("skill-docker", "Docker", "DevOps", "Containerization platform"),
            ("skill-kubernetes", "Kubernetes", "DevOps", "Container orchestration system"),
            ("skill-aws", "AWS Cloud", "Cloud", "Amazon Web Services cloud platform"),
            ("skill-graphql", "GraphQL", "Backend", "Query language for APIs"),
            ("skill-pytorch", "PyTorch", "AI/ML", "Deep learning machine learning framework")
        ]
        for sid, name, cat, desc in skills:
            session.run(
                "CREATE (s:Skill {id: $id, name: $name, category: $category, description: $description})",
                id=sid, name=name, category=cat, description=desc
            )

        # Skill-to-Skill RELATED_TO relationships
        skill_rels = [
            ("skill-python", "skill-fastapi"),
            ("skill-python", "skill-pytorch"),
            ("skill-typescript", "skill-react"),
            ("skill-node", "skill-typescript"),
            ("skill-opencypher", "skill-neo4j"),
            ("skill-docker", "skill-kubernetes"),
            ("skill-aws", "skill-docker"),
            ("skill-fastapi", "skill-graphql")
        ]
        for s1, s2 in skill_rels:
            session.run(
                "MATCH (a:Skill {id: $s1}), (b:Skill {id: $s2}) CREATE (a)-[:RELATED_TO]->(b)",
                s1=s1, s2=s2
            )

        # 4. Jobs
        jobs = [
            ("job-1", "Senior Python Backend Engineer", "Lead Python microservices and Cypher graph integrations.", "Senior", "Remote", True, 140000, 180000, "comp-1"),
            ("job-2", "Fullstack React & Node Developer", "Build modern cloud web applications with React & TypeScript.", "Mid", "San Francisco, CA", False, 120000, 155000, "comp-2"),
            ("job-3", "Graph Database Specialist", "Design and optimize openCypher graph schemas and queries.", "Senior", "New York, NY", True, 150000, 195000, "comp-3"),
            ("job-4", "DevOps & Kubernetes Architect", "Manage scalable cloud container clusters on AWS.", "Lead", "Seattle, WA", True, 160000, 210000, "comp-5"),
            ("job-5", "AI / PyTorch Engineer", "Develop deep learning models and high-throughput inference APIs.", "Senior", "Boston, MA", False, 145000, 185000, "comp-4")
        ]
        for jid, title, desc, exp, loc, rem, smin, smax, cid in jobs:
            session.run(
                """
                MATCH (c:Company {id: $cid})
                CREATE (j:Job {id: $id, title: $title, description: $description, experience_level: $exp, location: $loc, remote: $rem, salary_min: $smin, salary_max: $smax})
                CREATE (c)-[:OFFERS]->(j)
                """,
                id=jid, title=title, description=desc, exp=exp, loc=loc, rem=rem, smin=smin, smax=smax, cid=cid
            )

        # Job REQUIRES Skill
        job_reqs = [
            ("job-1", ["skill-python", "skill-fastapi", "skill-opencypher", "skill-docker"]),
            ("job-2", ["skill-react", "skill-typescript", "skill-node", "skill-graphql"]),
            ("job-3", ["skill-opencypher", "skill-neo4j", "skill-python", "skill-aws"]),
            ("job-4", ["skill-docker", "skill-kubernetes", "skill-aws", "skill-python"]),
            ("job-5", ["skill-python", "skill-pytorch", "skill-fastapi", "skill-docker"])
        ]
        for jid, sk_ids in job_reqs:
            for sid in sk_ids:
                session.run(
                    "MATCH (j:Job {id: $jid}), (s:Skill {id: $sid}) CREATE (j)-[:REQUIRES]->(s)",
                    jid=jid, sid=sid
                )

        # 5. Developers
        devs = [
            ("dev-1", "Alex Rivera", "alex.rivera@example.com", 6, "Remote", "Senior Fullstack Engineer passionate about Python, FastAPI, and React."),
            ("dev-2", "Sarah Chen", "sarah.chen@example.com", 8, "New York, NY", "Graph Database Architect with deep experience in Cypher and AWS."),
            ("dev-3", "Marcus Vance", "marcus.vance@example.com", 4, "Austin, TX", "Frontend engineer specializing in React, TypeScript, and modern UI systems.")
        ]
        for did, name, email, exp, loc, bio in devs:
            session.run(
                "CREATE (d:Developer {id: $id, name: $name, email: $email, experience_years: $exp, location: $loc, bio: $bio})",
                id=did, name=name, email=email, exp=exp, loc=loc, bio=bio
            )

        dev_skills = [
            ("dev-1", ["skill-python", "skill-fastapi", "skill-docker", "skill-react"]),
            ("dev-2", ["skill-opencypher", "skill-neo4j", "skill-python", "skill-aws", "skill-kubernetes"]),
            ("dev-3", ["skill-react", "skill-typescript", "skill-node"])
        ]
        for did, sk_ids in dev_skills:
            for sid in sk_ids:
                session.run(
                    "MATCH (d:Developer {id: $did}), (s:Skill {id: $sid}) CREATE (d)-[:HAS_SKILL]->(s)",
                    did=did, sid=sid
                )

        # 6. Learning Resources
        resources = [
            ("res-1", "FastAPI Official Interactive Tutorial", "Documentation", "https://fastapi.tiangolo.com/tutorial/", "Beginner", "skill-fastapi"),
            ("res-2", "Mastering openCypher & Graph Queries", "Course", "https://opencypher.org/resources/", "Intermediate", "skill-opencypher"),
            ("res-3", "Deep Learning with PyTorch", "Book", "https://pytorch.org/tutorials/", "Advanced", "skill-pytorch"),
            ("res-4", "Kubernetes Production Patterns", "Course", "https://kubernetes.io/docs/home/", "Advanced", "skill-kubernetes"),
            ("res-5", "React & TypeScript Masterclass", "Video", "https://react.dev/learn", "Intermediate", "skill-react"),
            ("res-6", "AWS Certified Solutions Architect Guide", "Course", "https://aws.amazon.com/training/", "Intermediate", "skill-aws")
        ]
        for rid, title, rtype, url, diff, sid in resources:
            session.run(
                """
                MATCH (s:Skill {id: $sid})
                CREATE (r:LearningResource {id: $id, title: $title, type: $type, url: $url, difficulty: $difficulty})
                CREATE (r)-[:TEACHES]->(s)
                """,
                id=rid, title=title, type=rtype, url=url, difficulty=diff, sid=sid
            )

        logger.info("CognoDB openCypher database seeding complete.")

    @classmethod
    def populate_in_memory_seed(cls):
        """Populate fallback in-memory store."""
        _in_memory_companies.clear()
        _in_memory_skills.clear()
        _in_memory_jobs.clear()
        _in_memory_developers.clear()
        _in_memory_resources.clear()
        _in_memory_relationships.clear()

        comps = [
            {"id": "comp-1", "name": "TechCorp Global", "industry": "Cloud & AI Enterprise", "location": "San Francisco, CA", "website": "https://techcorp.example.com"},
            {"id": "comp-2", "name": "DevFlow Systems", "industry": "Developer Tools", "location": "Austin, TX", "website": "https://devflow.example.com"},
            {"id": "comp-3", "name": "DataNode Labs", "industry": "Fintech & Data Infrastructure", "location": "New York, NY", "website": "https://datanode.example.com"},
            {"id": "comp-4", "name": "CyberShield Systems", "industry": "Cybersecurity", "location": "Boston, MA", "website": "https://cybershield.example.com"},
            {"id": "comp-5", "name": "CloudScale Networks", "industry": "SaaS Infrastructure", "location": "Seattle, WA", "website": "https://cloudscale.example.com"}
        ]
        for c in comps:
            _in_memory_companies[c["id"]] = c

        skills = [
            {"id": "skill-python", "name": "Python", "category": "Backend", "description": "High-level programming language for web & AI", "related_skills": ["skill-fastapi", "skill-pytorch"]},
            {"id": "skill-fastapi", "name": "FastAPI", "category": "Backend", "description": "Modern high-performance web framework for Python", "related_skills": ["skill-python", "skill-graphql"]},
            {"id": "skill-react", "name": "React", "category": "Frontend", "description": "Declarative component-based UI library", "related_skills": ["skill-typescript"]},
            {"id": "skill-typescript", "name": "TypeScript", "category": "Frontend", "description": "Typed superset of JavaScript", "related_skills": ["skill-react", "skill-node"]},
            {"id": "skill-node", "name": "Node.js", "category": "Backend", "description": "JavaScript runtime environment", "related_skills": ["skill-typescript"]},
            {"id": "skill-opencypher", "name": "openCypher", "category": "Database", "description": "Graph database query language", "related_skills": ["skill-neo4j"]},
            {"id": "skill-neo4j", "name": "Neo4j / CognoDB", "category": "Database", "description": "Graph database technology engine", "related_skills": ["skill-opencypher"]},
            {"id": "skill-docker", "name": "Docker", "category": "DevOps", "description": "Containerization platform", "related_skills": ["skill-kubernetes", "skill-aws"]},
            {"id": "skill-kubernetes", "name": "Kubernetes", "category": "DevOps", "description": "Container orchestration system", "related_skills": ["skill-docker"]},
            {"id": "skill-aws", "name": "AWS Cloud", "category": "Cloud", "description": "Amazon Web Services cloud platform", "related_skills": ["skill-docker"]},
            {"id": "skill-graphql", "name": "GraphQL", "category": "Backend", "description": "Query language for APIs", "related_skills": ["skill-fastapi"]},
            {"id": "skill-pytorch", "name": "PyTorch", "category": "AI/ML", "description": "Deep learning machine learning framework", "related_skills": ["skill-python"]}
        ]
        for s in skills:
            _in_memory_skills[s["id"]] = s

        jobs = [
            {"id": "job-1", "title": "Senior Python Backend Engineer", "description": "Lead Python microservices and Cypher graph integrations.", "experience_level": "Senior", "location": "Remote", "remote": True, "salary_min": 140000, "salary_max": 180000, "company_id": "comp-1", "company_name": "TechCorp Global", "required_skills": ["skill-python", "skill-fastapi", "skill-opencypher", "skill-docker"]},
            {"id": "job-2", "title": "Fullstack React & Node Developer", "description": "Build modern cloud web applications with React & TypeScript.", "experience_level": "Mid", "location": "San Francisco, CA", "remote": False, "salary_min": 120000, "salary_max": 155000, "company_id": "comp-2", "company_name": "DevFlow Systems", "required_skills": ["skill-react", "skill-typescript", "skill-node", "skill-graphql"]},
            {"id": "job-3", "title": "Graph Database Specialist", "description": "Design and optimize openCypher graph schemas and queries.", "experience_level": "Senior", "location": "New York, NY", "remote": True, "salary_min": 150000, "salary_max": 195000, "company_id": "comp-3", "company_name": "DataNode Labs", "required_skills": ["skill-opencypher", "skill-neo4j", "skill-python", "skill-aws"]},
            {"id": "job-4", "title": "DevOps & Kubernetes Architect", "description": "Manage scalable cloud container clusters on AWS.", "experience_level": "Lead", "location": "Seattle, WA", "remote": True, "salary_min": 160000, "salary_max": 210000, "company_id": "comp-5", "company_name": "CloudScale Networks", "required_skills": ["skill-docker", "skill-kubernetes", "skill-aws", "skill-python"]},
            {"id": "job-5", "title": "AI / PyTorch Engineer", "description": "Develop deep learning models and high-throughput inference APIs.", "experience_level": "Senior", "location": "Boston, MA", "remote": False, "salary_min": 145000, "salary_max": 185000, "company_id": "comp-4", "company_name": "CyberShield Systems", "required_skills": ["skill-python", "skill-pytorch", "skill-fastapi", "skill-docker"]}
        ]
        for j in jobs:
            _in_memory_jobs[j["id"]] = j

        devs = [
            {"id": "dev-1", "name": "Alex Rivera", "email": "alex.rivera@example.com", "experience_years": 6, "location": "Remote", "bio": "Senior Fullstack Engineer passionate about Python, FastAPI, and React.", "skills": ["skill-python", "skill-fastapi", "skill-docker", "skill-react"], "interested_job_ids": ["job-1", "job-2"]},
            {"id": "dev-2", "name": "Sarah Chen", "email": "sarah.chen@example.com", "experience_years": 8, "location": "New York, NY", "bio": "Graph Database Architect with deep experience in Cypher and AWS.", "skills": ["skill-opencypher", "skill-neo4j", "skill-python", "skill-aws", "skill-kubernetes"], "interested_job_ids": ["job-3"]},
            {"id": "dev-3", "name": "Marcus Vance", "email": "marcus.vance@example.com", "experience_years": 4, "location": "Austin, TX", "bio": "Frontend engineer specializing in React, TypeScript, and modern UI systems.", "skills": ["skill-react", "skill-typescript", "skill-node"], "interested_job_ids": ["job-2"]}
        ]
        for d in devs:
            _in_memory_developers[d["id"]] = d

        resources = [
            {"id": "res-1", "title": "FastAPI Official Interactive Tutorial", "type": "Documentation", "url": "https://fastapi.tiangolo.com/tutorial/", "difficulty": "Beginner", "skill_id": "skill-fastapi", "associated_skill_name": "FastAPI"},
            {"id": "res-2", "title": "Mastering openCypher & Graph Queries", "type": "Course", "url": "https://opencypher.org/resources/", "difficulty": "Intermediate", "skill_id": "skill-opencypher", "associated_skill_name": "openCypher"},
            {"id": "res-3", "title": "Deep Learning with PyTorch", "type": "Book", "url": "https://pytorch.org/tutorials/", "difficulty": "Advanced", "skill_id": "skill-pytorch", "associated_skill_name": "PyTorch"},
            {"id": "res-4", "title": "Kubernetes Production Patterns", "type": "Course", "url": "https://kubernetes.io/docs/home/", "difficulty": "Advanced", "skill_id": "skill-kubernetes", "associated_skill_name": "Kubernetes"},
            {"id": "res-5", "title": "React & TypeScript Masterclass", "type": "Video", "url": "https://react.dev/learn", "difficulty": "Intermediate", "skill_id": "skill-react", "associated_skill_name": "React"},
            {"id": "res-6", "title": "AWS Certified Solutions Architect Guide", "type": "Course", "url": "https://aws.amazon.com/training/", "difficulty": "Intermediate", "skill_id": "skill-aws", "associated_skill_name": "AWS Cloud"}
        ]
        for r in resources:
            _in_memory_resources[r["id"]] = r

    # --- GRAPH DATA METHODS ---
    @classmethod
    def get_full_graph(cls) -> GraphData:
        cls.seed_data_if_empty()
        driver = DatabaseConnection.get_driver()
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []

        if driver:
            try:
                with driver.session() as session:
                    # Nodes
                    result = session.run("MATCH (n) RETURN n, labels(n) AS labels")
                    for rec in result:
                        node_obj = rec["n"]
                        labels = rec["labels"]
                        lbl = labels[0] if labels else "Node"
                        nid = str(node_obj.get("id", rec["n"].id))
                        name = str(node_obj.get("name", node_obj.get("title", nid)))
                        cat = node_obj.get("category", node_obj.get("industry", lbl))
                        
                        nodes.append(GraphNode(
                            id=nid,
                            label=lbl,
                            name=name,
                            category=cat,
                            properties=dict(node_obj)
                        ))

                    # Edges
                    rel_result = session.run("""
                        MATCH (a)-[r]->(b)
                        RETURN a.id AS source, b.id AS target, type(r) AS rel_type, r
                    """)
                    edge_idx = 1
                    for rec in rel_result:
                        src = rec["source"]
                        tgt = rec["target"]
                        rtype = rec["rel_type"]
                        if src and tgt:
                            edges.append(GraphEdge(
                                id=f"edge-{edge_idx}",
                                source=str(src),
                                target=str(tgt),
                                type=rtype,
                                label=rtype.replace("_", " ")
                            ))
                            edge_idx += 1
                    
                    if nodes:
                        return GraphData(nodes=nodes, edges=edges)
            except Exception as e:
                logger.warning(f"Error querying full graph from CognoDB: {e}. Falling back to in-memory store.")

        # Fallback to in-memory graph construction
        # Nodes
        for d in _in_memory_developers.values():
            nodes.append(GraphNode(id=d["id"], label="Developer", name=d["name"], category="Developer", properties=d))
        for s in _in_memory_skills.values():
            nodes.append(GraphNode(id=s["id"], label="Skill", name=s["name"], category=s["category"], properties=s))
        for j in _in_memory_jobs.values():
            nodes.append(GraphNode(id=j["id"], label="Job", name=j["title"], category=j["experience_level"], properties=j))
        for c in _in_memory_companies.values():
            nodes.append(GraphNode(id=c["id"], label="Company", name=c["name"], category=c["industry"], properties=c))
        for r in _in_memory_resources.values():
            nodes.append(GraphNode(id=r["id"], label="LearningResource", name=r["title"], category=r["type"], properties=r))

        # Edges
        edge_idx = 1
        # Developer -> HAS_SKILL -> Skill
        for d in _in_memory_developers.values():
            for sid in d.get("skills", []):
                edges.append(GraphEdge(id=f"e-{edge_idx}", source=d["id"], target=sid, type="HAS_SKILL", label="HAS SKILL"))
                edge_idx += 1

        # Company -> OFFERS -> Job
        for j in _in_memory_jobs.values():
            cid = j.get("company_id")
            if cid:
                edges.append(GraphEdge(id=f"e-{edge_idx}", source=cid, target=j["id"], type="OFFERS", label="OFFERS"))
                edge_idx += 1
            for sid in j.get("required_skills", []):
                edges.append(GraphEdge(id=f"e-{edge_idx}", source=j["id"], target=sid, type="REQUIRES", label="REQUIRES"))
                edge_idx += 1

        # Resource -> TEACHES -> Skill
        for r in _in_memory_resources.values():
            sid = r.get("skill_id")
            if sid:
                edges.append(GraphEdge(id=f"e-{edge_idx}", source=r["id"], target=sid, type="TEACHES", label="TEACHES"))
                edge_idx += 1

        # Skill -> RELATED_TO -> Skill
        for s in _in_memory_skills.values():
            for rsid in s.get("related_skills", []):
                edges.append(GraphEdge(id=f"e-{edge_idx}", source=s["id"], target=rsid, type="RELATED_TO", label="RELATED TO"))
                edge_idx += 1

        return GraphData(nodes=nodes, edges=edges)

    # --- DEVELOPER METHODS ---
    @classmethod
    def get_developers(cls) -> List[DeveloperSummary]:
        cls.seed_data_if_empty()
        driver = DatabaseConnection.get_driver()
        if driver:
            try:
                with driver.session() as session:
                    res = session.run("""
                        MATCH (d:Developer)
                        OPTIONAL MATCH (d)-[:HAS_SKILL]->(s:Skill)
                        RETURN d, count(s) AS skill_count
                    """)
                    devs = []
                    for rec in res:
                        d_node = dict(rec["d"])
                        devs.append(DeveloperSummary(
                            id=d_node["id"],
                            name=d_node["name"],
                            experience_years=int(d_node.get("experience_years", 0)),
                            location=d_node.get("location", "Remote"),
                            skill_count=rec["skill_count"]
                        ))
                    if devs:
                        return devs
            except Exception as e:
                logger.warning(f"Error fetching developers from CognoDB: {e}")

        # Fallback
        res = []
        for d in _in_memory_developers.values():
            res.append(DeveloperSummary(
                id=d["id"],
                name=d["name"],
                experience_years=d["experience_years"],
                location=d["location"],
                skill_count=len(d.get("skills", []))
            ))
        return res

    @classmethod
    def get_developer(cls, dev_id: str) -> Optional[Developer]:
        cls.seed_data_if_empty()
        driver = DatabaseConnection.get_driver()
        if driver:
            try:
                with driver.session() as session:
                    res = session.run("MATCH (d:Developer {id: $id}) RETURN d", id=dev_id)
                    rec = res.single()
                    if rec:
                        d_dict = dict(rec["d"])
                        # Skills
                        s_res = session.run("MATCH (d:Developer {id: $id})-[:HAS_SKILL]->(s:Skill) RETURN s.id AS sid", id=dev_id)
                        skills = [s["sid"] for s in s_res]
                        return Developer(**d_dict, skills=skills)
            except Exception as e:
                logger.warning(f"Error fetching developer {dev_id} from CognoDB: {e}")

        d = _in_memory_developers.get(dev_id)
        if d:
            return Developer(**d)
        return None

    @classmethod
    def create_developer(cls, data: DeveloperCreate) -> Developer:
        dev_dict = data.model_dump()
        dev_id = dev_dict.get("id") or f"dev-{uuid.uuid4().hex[:6]}"
        dev_dict["id"] = dev_id
        dev_dict["skills"] = []
        dev_dict["interested_job_ids"] = []

        _in_memory_developers[dev_id] = dev_dict

        driver = DatabaseConnection.get_driver()
        if driver:
            try:
                with driver.session() as session:
                    session.run(
                        "CREATE (d:Developer {id: $id, name: $name, email: $email, experience_years: $exp, location: $loc, bio: $bio})",
                        id=dev_id, name=dev_dict["name"], email=dev_dict["email"],
                        exp=dev_dict["experience_years"], loc=dev_dict["location"], bio=dev_dict["bio"]
                    )
            except Exception as e:
                logger.warning(f"Failed to create developer in CognoDB: {e}")

        return Developer(**dev_dict)

    @classmethod
    def update_developer_skills(cls, dev_id: str, skill_ids: List[str]) -> Optional[Developer]:
        cls.seed_data_if_empty()
        # Fallback update
        if dev_id in _in_memory_developers:
            _in_memory_developers[dev_id]["skills"] = skill_ids

        driver = DatabaseConnection.get_driver()
        if driver:
            try:
                with driver.session() as session:
                    # Detach old skills
                    session.run("MATCH (d:Developer {id: $id})-[r:HAS_SKILL]->() DELETE r", id=dev_id)
                    # Re-attach
                    for sid in skill_ids:
                        session.run("""
                            MATCH (d:Developer {id: $did}), (s:Skill)
                            WHERE s.id = $sid OR s.name = $sid
                            CREATE (d)-[:HAS_SKILL]->(s)
                        """, did=dev_id, sid=sid)
            except Exception as e:
                logger.warning(f"Failed to update developer skills in CognoDB: {e}")

        return cls.get_developer(dev_id)

    # --- SKILL METHODS ---
    @classmethod
    def get_skills(cls) -> List[Skill]:
        cls.seed_data_if_empty()
        driver = DatabaseConnection.get_driver()
        if driver:
            try:
                with driver.session() as session:
                    res = session.run("MATCH (s:Skill) RETURN s")
                    skills = []
                    for rec in res:
                        s_dict = dict(rec["s"])
                        sid = s_dict["id"]
                        r_res = session.run("MATCH (s:Skill {id: $id})-[:RELATED_TO]->(r:Skill) RETURN r.id AS rsid", id=sid)
                        rel_skills = [r["rsid"] for r in r_res]
                        skills.append(Skill(**s_dict, related_skills=rel_skills))
                    if skills:
                        return skills
            except Exception as e:
                logger.warning(f"Error fetching skills from CognoDB: {e}")

        return [Skill(**s) for s in _in_memory_skills.values()]

    @classmethod
    def get_skill_details(cls, skill_id: str) -> Optional[SkillDetails]:
        cls.seed_data_if_empty()
        all_skills = {s.id: s for s in cls.get_skills()}
        target_skill = all_skills.get(skill_id)
        if not target_skill:
            # Check by name matching
            for s in all_skills.values():
                if s.name.lower() == skill_id.lower():
                    target_skill = s
                    break

        if not target_skill:
            return None

        # Related skills
        related = []
        for rsid in target_skill.related_skills:
            if rsid in all_skills:
                related.append({"id": all_skills[rsid].id, "name": all_skills[rsid].name, "category": all_skills[rsid].category})

        # Learning resources
        resources = []
        for r in _in_memory_resources.values():
            if r.get("skill_id") == target_skill.id or r.get("associated_skill_name").lower() == target_skill.name.lower():
                resources.append(LearningResourceRef(
                    id=r["id"],
                    title=r["title"],
                    type=r["type"],
                    url=r["url"],
                    difficulty=r["difficulty"]
                ))

        return SkillDetails(
            id=target_skill.id,
            name=target_skill.name,
            category=target_skill.category,
            description=target_skill.description,
            related_skills=related,
            learning_resources=resources
        )

    # --- JOB METHODS ---
    @classmethod
    def get_jobs(cls) -> List[Job]:
        cls.seed_data_if_empty()
        driver = DatabaseConnection.get_driver()
        if driver:
            try:
                with driver.session() as session:
                    res = session.run("""
                        MATCH (j:Job)
                        OPTIONAL MATCH (c:Company)-[:OFFERS]->(j)
                        OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
                        RETURN j, c.id AS cid, c.name AS cname, collect(s.id) AS req_skills
                    """)
                    jobs = []
                    for rec in res:
                        j_dict = dict(rec["j"])
                        jobs.append(Job(
                            **j_dict,
                            company_id=rec["cid"],
                            company_name=rec["cname"],
                            required_skills=rec["req_skills"]
                        ))
                    if jobs:
                        return jobs
            except Exception as e:
                logger.warning(f"Error fetching jobs from CognoDB: {e}")

        return [Job(**j) for j in _in_memory_jobs.values()]

    @classmethod
    def get_job(cls, job_id: str) -> Optional[Job]:
        all_jobs = cls.get_jobs()
        for j in all_jobs:
            if j.id == job_id:
                return j
        return None

    # --- COMPANY METHODS ---
    @classmethod
    def get_companies(cls) -> List[Company]:
        cls.seed_data_if_empty()
        driver = DatabaseConnection.get_driver()
        if driver:
            try:
                with driver.session() as session:
                    res = session.run("""
                        MATCH (c:Company)
                        OPTIONAL MATCH (c)-[:OFFERS]->(j:Job)
                        RETURN c, count(j) AS job_count
                    """)
                    comps = []
                    for rec in res:
                        c_dict = dict(rec["c"])
                        comps.append(Company(**c_dict, offered_job_count=rec["job_count"]))
                    if comps:
                        return comps
            except Exception as e:
                logger.warning(f"Error fetching companies from CognoDB: {e}")

        res = []
        for c in _in_memory_companies.values():
            j_count = sum(1 for j in _in_memory_jobs.values() if j.get("company_id") == c["id"])
            res.append(Company(**c, offered_job_count=j_count))
        return res

    # --- RECOMMENDATION ENGINE ---
    @classmethod
    def recommend_jobs_for_developer(cls, dev_id: str) -> List[JobRecommendation]:
        cls.seed_data_if_empty()
        dev = cls.get_developer(dev_id)
        if not dev:
            return []

        dev_skills_set = set(dev.skills)
        # Also map skill names to IDs
        all_skills = cls.get_skills()
        skill_name_to_id = {s.name.lower(): s.id for s in all_skills}
        skill_id_to_name = {s.id: s.name for s in all_skills}

        # Normalize dev skills to IDs
        dev_skill_ids = set()
        for sk in dev_skills_set:
            dev_skill_ids.add(sk)
            if sk.lower() in skill_name_to_id:
                dev_skill_ids.add(skill_name_to_id[sk.lower()])

        all_jobs = cls.get_jobs()
        recommendations: List[JobRecommendation] = []

        for job in all_jobs:
            req_skill_ids = set(job.required_skills)
            matching_ids = dev_skill_ids.intersection(req_skill_ids)
            missing_ids = req_skill_ids.difference(dev_skill_ids)

            total_req = len(req_skill_ids)
            match_pct = round((len(matching_ids) / total_req * 100)) if total_req > 0 else 100

            matching_names = [skill_id_to_name.get(sid, sid) for sid in matching_ids]
            missing_names = [skill_id_to_name.get(sid, sid) for sid in missing_ids]
            req_names = [skill_id_to_name.get(sid, sid) for sid in req_skill_ids]

            recommendations.append(JobRecommendation(
                job_id=job.id,
                title=job.title,
                company_id=job.company_id or "comp-unknown",
                company_name=job.company_name or "Partner Enterprise",
                location=job.location,
                remote=job.remote,
                experience_level=job.experience_level,
                salary_min=job.salary_min,
                salary_max=job.salary_max,
                match_percentage=match_pct,
                matching_skills=matching_names,
                missing_skills=missing_names,
                required_skills=req_names
            ))

        # Sort recommendations by match_percentage descending
        recommendations.sort(key=lambda x: x.match_percentage, reverse=True)
        return recommendations
