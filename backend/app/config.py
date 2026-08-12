import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Locate backend root directory (.env file location)
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"

load_dotenv(dotenv_path=ENV_FILE)

class Settings(BaseSettings):
    COGNODB_URI: str = os.getenv("COGNODB_URI", "bolt+s://db-95c32593.databases.cognodb.com")
    COGNODB_USERNAME: str = os.getenv("COGNODB_USERNAME", "cognodb")
    COGNODB_PASSWORD: str = os.getenv("COGNODB_PASSWORD", "")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = str(ENV_FILE)
        extra = "ignore"

settings = Settings()
