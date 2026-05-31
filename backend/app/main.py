from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from contextlib import asynccontextmanager
import time
import sys
import os

# Dynamic import routing: Resolve workspace root and inject to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.core.config import settings
from app.models.schemas import HealthCheck, ChatRequest, ChatResponse, ToolExecutionLog, StandardApiResponse
from app.core.mcp_client import mcp_client_manager
from agent_layer.agent import agent_orchestrator

# Define lifespan event handler to manage MCP subprocess lifecycles
@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP: Connect to the Network Analysis MCP Server
    try:
        print("[Lifespan] Starting MCP Client and spawning Network Analysis Server subprocess...")
        await mcp_client_manager.connect_to_server(settings.NETWORK_ANALYSIS_SERVER_PATH)
        tools = await mcp_client_manager.list_available_tools()
        print(f"[Lifespan] Discovered MCP Tools: {[t['name'] for t in tools]}")
    except Exception as e:
        print(f"[Lifespan] CRITICAL: Failed to launch MCP Server on startup: {str(e)}")
        
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
    Checks the status of the server and verifies that the MCP Client is connected.
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
    The agent dynamically reasons about user intent and selects which MCP tool to run.
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
                duration_ms = (time.time() - start_time) * 1000
                
                # Record the audit log
                tools_executed.append(
                    ToolExecutionLog(
                        tool_name=chosen_tool,
                        arguments=arguments,
                        result=tool_output,
                        execution_time_ms=round(duration_ms, 2),
                        status="success"
                    )
                )
                
                # Synthesize final response
                agent_final_text = (
                    f"### Agent Plan\n{explanation}\n\n"
                    f"### Tool Execution Output (`{chosen_tool}`)\n{tool_output}"
                )
                
            except Exception as tool_error:
                duration_ms = (time.time() - start_time) * 1000
                tools_executed.append(
                    ToolExecutionLog(
                        tool_name=chosen_tool,
                        arguments=arguments,
                        result=f"Tool failed: {str(tool_error)}",
                        execution_time_ms=round(duration_ms, 2),
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
