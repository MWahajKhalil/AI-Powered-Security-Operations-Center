import asyncio
import os
import sys
from typing import Dict, Any, List, Optional
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class MCPClientManager:
    def __init__(self):
        self.session: Optional[ClientSession] = None
        self._exit_stack = None

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
        self._exit_stack = stdio_client(server_params)
        read_stream, write_stream = await self._exit_stack.__aenter__()
        
        # Bind the streams to the client session
        self.session = ClientSession(read_stream, write_stream)
        await self.session.__aenter__()
        
        # Send the standard initialize handshake (exchanges capabilities)
        await self.session.initialize()
        print("[MCP Client] Initialized connection & exchanged capabilities.")

    async def list_available_tools(self) -> List[Dict[str, Any]]:
        """
        Asks the MCP server for a listing of all registered tools and their schemas.
        """
        if not self.session:
            raise RuntimeError("MCP Client is not connected to a server.")
        
        response = await self.session.list_tools()
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "inputSchema": tool.inputSchema
            }
            for tool in response.tools
        ]

    async def call_tool(self, tool_name: str, arguments: dict) -> str:
        """
        Invokes an MCP tool on the server with structural parameters.
        Returns the raw string output returned by the execution block.
        """
        if not self.session:
            raise RuntimeError("MCP Client is not connected to a server.")
            
        print(f"[MCP Client] Calling tool '{tool_name}' with parameters: {arguments}")
        result = await self.session.call_tool(tool_name, arguments)
        
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
        Gracefully tears down streams and releases sub-process resources.
        """
        if self.session:
            await self.session.__aexit__(None, None, None)
            self.session = None
        if self._exit_stack:
            await self._exit_stack.__aexit__(None, None, None)
            self._exit_stack = None
        print("[MCP Client] Severed connection channels cleanly.")

# App-wide singleton instance
mcp_client_manager = MCPClientManager()
