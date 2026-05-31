from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Security Operations Center"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = True
    
    # Path to our standard MCP servers
    NETWORK_ANALYSIS_SERVER_PATH: str = "/Users/mwahajkhalil/Learnings/MCP Project/mcp_servers/network_analysis/server.py"

    # Path to local SQLite database
    DATABASE_PATH: str = "/Users/mwahajkhalil/Learnings/MCP Project/database/soc_dashboard.db"

    class Config:

        env_file = ".env"
        case_sensitive = True

settings = Settings()
