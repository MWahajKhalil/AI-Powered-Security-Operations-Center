from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from contextlib import asynccontextmanager
import time
import sys
import os
from typing import List

# Dynamic import routing: Resolve workspace root and inject to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.core.config import settings
from app.models.schemas import HealthCheck, ChatRequest, ChatResponse, ToolExecutionLog, StandardApiResponse
from app.core.mcp_client import mcp_client_manager
from app.database.connection import db_manager
from agent_layer.agent import agent_orchestrator

# Define lifespan event handler to manage database initialization & MCP subprocess lifecycles
@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP: Initialize database and connect to MCP Server
    try:
        print("[Lifespan] Initializing local SQLite database...")
        db_manager.init_db()
    except Exception as db_err:
        print(f"[Lifespan] CRITICAL: Failed to initialize SQLite database: {db_err}")

    try:
        print("[Lifespan] Starting MCP Client and spawning Network Analysis Server subprocess...")
        await mcp_client_manager.connect_to_server(settings.NETWORK_ANALYSIS_SERVER_PATH)
        print("[Lifespan] Spawning Threat Intelligence Server subprocess...")
        await mcp_client_manager.connect_to_server(settings.THREAT_INTEL_SERVER_PATH)
        print("[Lifespan] Spawning Log Analysis Server subprocess...")
        await mcp_client_manager.connect_to_server(settings.LOG_ANALYSIS_SERVER_PATH)
        tools = await mcp_client_manager.list_available_tools()
        print(f"[Lifespan] Discovered MCP Tools: {[t['name'] for t in tools]}")
    except Exception as e:
        print(f"[Lifespan] CRITICAL: Failed to launch MCP Servers on startup: {str(e)}")
        
    yield
    
    # SHUTDOWN: Sever MCP subprocess pipes cleanly
    print("[Lifespan] Server shutting down. Terminating MCP subprocess...")
    await mcp_client_manager.disconnect()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Set up CORS middleware for our Next.js frontend connection later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthCheck, tags=["System"])
async def health_check():
    """
    Checks the status of the server and verifies database and MCP connectivity.
    """
    mcp_status = "connected" if mcp_client_manager.session else "disconnected"
    return HealthCheck(
        status=f"healthy (MCP Server: {mcp_status})",
        timestamp=datetime.utcnow(),
        project_name=settings.PROJECT_NAME,
        version=settings.VERSION
    )

@app.post(f"{settings.API_PREFIX}/chat", response_model=StandardApiResponse, tags=["Agent"])
async def chat_endpoint(request: ChatRequest):
    """
    Processes the chat prompt using the AI Agent Layer.
    Automatically audits and persists all executed tools to the local SQLite database.
    """
    tools_executed = []
    
    try:
        # 1. Fetch available tool definitions from the active MCP Server
        available_tools = await mcp_client_manager.list_available_tools()
        
        # 2. Feed prompt and tools into the Agent Orchestrator to make a decision
        chosen_tool, arguments, explanation = await agent_orchestrator.decide_tool(
            user_message=request.message,
            available_tools=available_tools
        )
        
        agent_final_text = ""
        
        # 3. If the Agent chooses to call an MCP tool, execute it!
        if chosen_tool:
            start_time = time.time()
            
            try:
                # Trigger the live tool call
                tool_output = await mcp_client_manager.call_tool(chosen_tool, arguments)
                duration_ms = round((time.time() - start_time) * 1000, 2)
                
                # REAL LOGIC: Persist successful tool execution to SQLite Audit Log
                db_manager.log_tool_execution(
                    tool_name=chosen_tool,
                    arguments=arguments,
                    result=tool_output,
                    execution_time_ms=duration_ms,
                    status="success"
                )
                
                # Record in response payload
                tools_executed.append(
                    ToolExecutionLog(
                        tool_name=chosen_tool,
                        arguments=arguments,
                        result=tool_output,
                        execution_time_ms=duration_ms,
                        status="success"
                    )
                )
                
                # Synthesize final response
                agent_final_text = (
                    f"### Agent Plan\n{explanation}\n\n"
                    f"### Tool Execution Output (`{chosen_tool}`)\n{tool_output}"
                )
                
            except Exception as tool_error:
                duration_ms = round((time.time() - start_time) * 1000, 2)
                
                # REAL LOGIC: Persist failed tool execution to SQLite Audit Log
                db_manager.log_tool_execution(
                    tool_name=chosen_tool,
                    arguments=arguments,
                    result=f"Tool failed: {str(tool_error)}",
                    execution_time_ms=duration_ms,
                    status="failure"
                )
                
                tools_executed.append(
                    ToolExecutionLog(
                        tool_name=chosen_tool,
                        arguments=arguments,
                        result=f"Tool failed: {str(tool_error)}",
                        execution_time_ms=duration_ms,
                        status="failure"
                    )
                )
                agent_final_text = (
                    f"### Agent Plan\n{explanation}\n\n"
                    f"### Tool Execution Failure\nEncountered an error executing the tool: {str(tool_error)}"
                )
        else:
            # The agent decided no tools were needed to answer this prompt
            agent_final_text = explanation

        chat_resp = ChatResponse(
            response=agent_final_text,
            session_id="session_soc_active",
            tools_executed=tools_executed
        )
        
        return StandardApiResponse(success=True, data=chat_resp, error=None)

    except Exception as e:
        return StandardApiResponse(
            success=False,
            data=None,
            error=f"Agent orchestration error: {str(e)}"
        )

@app.get(f"{settings.API_PREFIX}/logs", response_model=StandardApiResponse, tags=["Auditing"])
async def get_audit_logs(limit: int = Query(default=20, ge=1, le=100)):
    """
    Fetches the historical tool audit logs stored in the local SQLite database.
    Useful for our frontend console dashboard.
    """
    try:
        logs = db_manager.get_tool_logs(limit=limit)
        return StandardApiResponse(success=True, data=logs, error=None)
    except Exception as e:
        return StandardApiResponse(
            success=False,
            data=None,
            error=f"Failed to fetch audit logs: {str(e)}"
        )
