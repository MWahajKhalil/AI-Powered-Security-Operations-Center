import asyncio
import os
import sys
from typing import Dict, Any, List, Optional
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class MCPClientManager:
    def __init__(self):
        self.sessions: Dict[str, ClientSession] = {}
        self._exit_stacks = {}

    @property
    def session(self):
        """Backward-compatible property for checking if at least one MCP session is active."""
        if self.sessions:
            return list(self.sessions.values())[0]
        return None

    async def connect_to_server(self, server_script_path: str):
        """
        Launches an MCP server as a background subprocess and establishes a protocol session.
        """
        print(f"[MCP Client] Launching subprocess using: {sys.executable} {server_script_path}")
        
        # Standard MCP subprocess parameters
        server_params = StdioServerParameters(
            command=sys.executable,  # Uses the exact Python virtual environment interpreter
            args=[server_script_path],
            env=os.environ.copy()
        )
        
        # Enter the StdIO connection layer asynchronously
        exit_stack = stdio_client(server_params)
        read_stream, write_stream = await exit_stack.__aenter__()
        
        # Bind the streams to the client session
        session = ClientSession(read_stream, write_stream)
        await session.__aenter__()
        
        # Send the standard initialize handshake (exchanges capabilities)
        await session.initialize()
        
        # Store in dicts
        self.sessions[server_script_path] = session
        self._exit_stacks[server_script_path] = exit_stack
        print(f"[MCP Client] Initialized connection & exchanged capabilities with {os.path.basename(server_script_path)}.")

    async def list_available_tools(self) -> List[Dict[str, Any]]:
        """
        Asks all active MCP servers for a listing of their registered tools and schemas.
        """
        all_tools = []
        for path, session in self.sessions.items():
            try:
                response = await session.list_tools()
                for tool in response.tools:
                    all_tools.append({
                        "name": tool.name,
                        "description": tool.description,
                        "inputSchema": tool.inputSchema
                    })
            except Exception as e:
                print(f"[MCP Client] Failed to list tools for {os.path.basename(path)}: {e}")
        return all_tools

    async def call_tool(self, tool_name: str, arguments: dict) -> str:
        """
        Invokes an MCP tool on the server that implements it, with structural parameters.
        Returns the raw string output returned by the execution block.
        """
        # First, find which server has this tool
        target_session = None
        for path, session in self.sessions.items():
            try:
                response = await session.list_tools()
                if any(tool.name == tool_name for tool in response.tools):
                    target_session = session
                    break
            except Exception:
                pass

        if not target_session:
            raise RuntimeError(f"No active MCP server implements the tool '{tool_name}'.")
            
        print(f"[MCP Client] Calling tool '{tool_name}' with parameters: {arguments}")
        result = await target_session.call_tool(tool_name, arguments)
        
        # Extract and join text blocks from content results
        texts = []
        for item in result.content:
            if hasattr(item, "text"):
                texts.append(item.text)
            else:
                texts.append(str(item))
        return "\n".join(texts)

    async def disconnect(self):
        """
        Gracefully tears down streams and releases sub-process resources for all servers.
        """
        for path, session in list(self.sessions.items()):
            try:
                await session.__aexit__(None, None, None)
            except Exception:
                pass
        self.sessions.clear()

        for path, exit_stack in list(self._exit_stacks.items()):
            try:
                await exit_stack.__aexit__(None, None, None)
            except Exception:
                pass
        self._exit_stacks.clear()
        print("[MCP Client] Severed all connection channels cleanly.")

# App-wide singleton instance
mcp_client_manager = MCPClientManager()
