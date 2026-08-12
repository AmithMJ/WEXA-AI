import logging
from app.database.connection import DatabaseConnection

logger = logging.getLogger("skillgraph.schema")

CONSTRAINT_QUERIES = [
    "CREATE CONSTRAINT developer_id_unique IF NOT EXISTS FOR (d:Developer) REQUIRE d.id IS UNIQUE",
    "CREATE CONSTRAINT skill_id_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE",
    "CREATE CONSTRAINT job_id_unique IF NOT EXISTS FOR (j:Job) REQUIRE j.id IS UNIQUE",
    "CREATE CONSTRAINT company_id_unique IF NOT EXISTS FOR (c:Company) REQUIRE c.id IS UNIQUE",
    "CREATE CONSTRAINT resource_id_unique IF NOT EXISTS FOR (r:LearningResource) REQUIRE r.id IS UNIQUE",
]

INDEX_QUERIES = [
    "CREATE INDEX developer_name_idx IF NOT EXISTS FOR (d:Developer) ON (d.name)",
    "CREATE INDEX skill_name_idx IF NOT EXISTS FOR (s:Skill) ON (s.name)",
    "CREATE INDEX job_title_idx IF NOT EXISTS FOR (j:Job) ON (j.title)",
]

def init_schema():
    """Apply uniqueness constraints and indexes to CognoDB."""
    driver = DatabaseConnection.get_driver()
    if not driver:
        logger.warning("Skipping schema initialization - CognoDB driver unavailable.")
        return False

    applied_count = 0
    with driver.session() as session:
        for q in CONSTRAINT_QUERIES + INDEX_QUERIES:
            try:
                session.run(q)
                applied_count += 1
            except Exception as e:
                # Some openCypher DBs support constraint creation differently or ignore IF NOT EXISTS syntax
                logger.info(f"Schema statement note ({q}): {e}")

    logger.info(f"Schema constraints & indexes processed ({applied_count} executed).")
    return True
