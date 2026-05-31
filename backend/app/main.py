from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from contextlib import asynccontextmanager
import time
import re

from app.core.config import settings
from app.models.schemas import HealthCheck, ChatRequest, ChatResponse, ToolExecutionLog, StandardApiResponse
from app.core.mcp_client import mcp_client_manager

# Define lifespan event handler to manage MCP subprocess lifecycles
@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP: Connect to the Network Analysis MCP Server
    try:
        print("[Lifespan] Starting MCP Client and spawning Network Analysis Server subprocess...")
        await mcp_client_manager.connect_to_server(settings.NETWORK_ANALYSIS_SERVER_PATH)
        # Log active tools
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
    debug=settings.DEBUG,
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
    Processes the chat prompt from the user.
    If it detects hostname/ip keywords, it invokes real tools from the Network Analysis MCP Server!
    """
    prompt = request.message.lower()
    tools_executed = []
    agent_response = ""

    # REAL LOGIC: Exposing direct tool routing when keywords are present
    try:
        # 1. Check for DNS Lookup request
        if "dns" in prompt or "resolve" in prompt:
            # Extract domain name using simple regex (matches google.com, test.xyz, etc.)
            domains = re.findall(r'[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', prompt)
            target = domains[0] if domains else "google.com"
            
            start_time = time.time()
            # CALL REAL TOOL via MCP Client
            result = await mcp_client_manager.call_tool("dns_lookup", {"domain": target})
            duration_ms = (time.time() - start_time) * 1000
            
            # Log the execution
            tools_executed.append(
                ToolExecutionLog(
                    tool_name="dns_lookup",
                    arguments={"domain": target},
                    result=result,
                    execution_time_ms=round(duration_ms, 2),
                    status="success"
                )
            )
            agent_response = f"I invoked my real DNS Lookup tool to resolve '{target}'. Here are the findings:\n\n{result}"

        # 2. Check for Ping request
        elif "ping" in prompt or "reach" in prompt:
            # Extract IP or domain (e.g. 8.8.8.8 or google.com)
            ips_or_domains = re.findall(r'[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+', prompt)
            # Remove any words that match 'ping' or other commands
            ips_or_domains = [x for x in ips_or_domains if x not in ["ping", "resolve", "reach"]]
            target = ips_or_domains[0] if ips_or_domains else "8.8.8.8"
            
            start_time = time.time()
            # CALL REAL TOOL via MCP Client
            result = await mcp_client_manager.call_tool("ping_host", {"host": target})
            duration_ms = (time.time() - start_time) * 1000
            
            # Log the execution
            tools_executed.append(
                ToolExecutionLog(
                    tool_name="ping_host",
                    arguments={"host": target},
                    result=result,
                    execution_time_ms=round(duration_ms, 2),
                    status="success"
                )
            )
            agent_response = f"I invoked my real Host Ping tool to inspect reachability of '{target}'. Here is the command output:\n\n{result}"

        # Default response (Mock Agent routing)
        else:
            agent_response = (
                "Hello! I am your AI SOC Assistant. I can interact with real network security tools.\n"
                "Try asking me: \n"
                "1. 'DNS lookup for google.com'\n"
                "2. 'Ping 8.8.8.8'"
            )

        chat_resp = ChatResponse(
            response=agent_response,
            session_id="session_soc_active",
            tools_executed=tools_executed
        )
        
        return StandardApiResponse(success=True, data=chat_resp, error=None)

    except Exception as e:
        return StandardApiResponse(
            success=False,
            data=None,
            error=f"Error executing security workflow: {str(e)}"
        )
