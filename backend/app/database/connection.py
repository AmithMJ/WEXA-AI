import logging
from typing import Optional
from neo4j import GraphDatabase, Driver
from neo4j.exceptions import Neo4jError, ServiceUnavailable, AuthError
from app.config import settings

logger = logging.getLogger("skillgraph.database")

class DatabaseConnection:
    _driver: Optional[Driver] = None

    @classmethod
    def get_driver(cls) -> Optional[Driver]:
        """Lazy creation of Neo4j/CognoDB driver instance."""
        if cls._driver is None:
            try:
                logger.info(f"Connecting to CognoDB at {settings.COGNODB_URI}...")
                cls._driver = GraphDatabase.driver(
                    settings.COGNODB_URI,
                    auth=(settings.COGNODB_USERNAME, settings.COGNODB_PASSWORD),
                    max_connection_lifetime=3600,
                    max_connection_pool_size=50,
                    connection_timeout=15.0
                )
                logger.info("CognoDB driver initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize CognoDB driver: {e}")
                cls._driver = None
        return cls._driver

    @classmethod
    def verify_connection(cls) -> dict:
        """Verify connection to CognoDB database."""
        driver = cls.get_driver()
        if not driver:
            return {
                "status": "offline",
                "connected": False,
                "error": "Driver initialized as None. Check configuration."
            }

        try:
            driver.verify_connectivity()
            # Run a test query
            records, summary, keys = driver.execute_query(
                "RETURN 1 AS ping",
                database_="neo4j"
            )
            return {
                "status": "healthy",
                "connected": True,
                "server_info": summary.server_info.agent if hasattr(summary, 'server_info') else "CognoDB",
                "error": None
            }
        except (ServiceUnavailable, AuthError, Neo4jError) as e:
            logger.error(f"CognoDB connectivity test failed: {str(e)}")
            return {
                "status": "degraded",
                "connected": False,
                "error": str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected connection error: {str(e)}")
            return {
                "status": "error",
                "connected": False,
                "error": str(e)
            }

    @classmethod
    def close_driver(cls):
        """Gracefully close the CognoDB driver pool on shutdown."""
        if cls._driver:
            logger.info("Closing CognoDB connection pool...")
            cls._driver.close()
            cls._driver = None
            logger.info("CognoDB connection pool closed.")

def get_db_driver() -> Optional[Driver]:
    """Dependency helper to retrieve current active driver."""
    return DatabaseConnection.get_driver()
