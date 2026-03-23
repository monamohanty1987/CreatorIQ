"""
Backend Configuration
Loads settings from .env file and environment variables
"""

from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # API Configuration
    API_TITLE: str = "CreatorIQ API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "Full-stack automation for creator monetization"

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # CORS Configuration
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Database Configuration
    DATABASE_URL: str = "sqlite:///./creatoriq.db"
    DATABASE_ECHO: bool = False  # Set to True for SQL logging

    # n8n Configuration
    N8N_BASE_URL: str = "http://localhost:5678"
    N8N_WEBHOOK_BRAND_DEAL: str = "http://localhost:5678/webhook/brand-deal-check"
    N8N_WEBHOOK_CONTRACT: str = "http://localhost:5678/webhook/analyse-contract"
    N8N_WEBHOOK_CAMPAIGN: str = "http://localhost:5678/webhook/product-launch"
    N8N_WEBHOOK_CHECKOUT: str = "http://localhost:5678/webhook/checkout-abandoned"
    N8N_TIMEOUT: int = 30  # seconds

    # Claude API Configuration
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20241022"
    CLAUDE_TIMEOUT: int = 60  # seconds

    # RAG Configuration
    CHROMADB_PATH: str = "./rag_system/chromadb"
    EMBEDDINGS_MODEL: str = "all-MiniLM-L6-v2"  # Free HuggingFace model
    CHROMADB_COLLECTION_NAME: str = "creatoriq_knowledge_base"

    # LangSmith Configuration
    LANGCHAIN_API_KEY: str = ""
    LANGCHAIN_TRACING_V2: str = "false"
    LANGCHAIN_PROJECT: str = "CreatorIQ"
    LANGCHAIN_ENDPOINT: str = "https://eu.api.smith.langchain.com"
    LANGSMITH_ENDPOINT: str = "https://eu.api.smith.langchain.com"  # alias used in .env

    # n8n Configuration (alternate)
    N8N_WEBHOOK_BASE_URL: str = "http://localhost:5678/webhook"

    # File Paths
    PROJECT_ROOT: str = str(Path(__file__).parent.parent)
    RAG_DATA_PATH: str = str(Path(__file__).parent.parent / "rag_system")
    DATA_RAW: str = ""
    DATA_PROCESSED: str = ""

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env

# Create singleton settings instance
settings = Settings()
