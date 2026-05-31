from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class HealthCheck(BaseModel):
    status: str = Field(..., example="healthy")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    project_name: str
    version: str

class ChatRequest(BaseModel):
    message: str = Field(..., description="The security analysis request or prompt from the user")

class ToolExecutionLog(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tool_name: str
    arguments: dict
    result: Any
    execution_time_ms: float
    status: str = Field(..., description="success or failure")

class ChatResponse(BaseModel):
    response: str = Field(..., description="The natural language summary from the AI agent")
    session_id: Optional[str] = None
    tools_executed: List[ToolExecutionLog] = Field(default_factory=list)

class StandardApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
