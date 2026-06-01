from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Security Operations Center"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = True
    
    # Path to our standard MCP servers
    NETWORK_ANALYSIS_SERVER_PATH: str = "/Users/mwahajkhalil/Learnings/MCP Project/mcp_servers/network_analysis/server.py"
    THREAT_INTEL_SERVER_PATH: str = "/Users/mwahajkhalil/Learnings/MCP Project/mcp_servers/threat_intel/server.py"
    LOG_ANALYSIS_SERVER_PATH: str = "/Users/mwahajkhalil/Learnings/MCP Project/mcp_servers/log_analysis/server.py"
    AUTH_LOG_PATH: str = "/Users/mwahajkhalil/Learnings/MCP Project/database/auth.log"

    # Path to local SQLite database
    DATABASE_PATH: str = "/Users/mwahajkhalil/Learnings/MCP Project/database/soc_dashboard.db"

    GEMINI_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()

