# AI-Powered Security Operations Center (SOC) with Model Context Protocol (MCP)

This project is a step-by-step modular build of an AI-Powered Security Operations Center (SOC) Dashboard. It demonstrates the integration of an AI agent with multiple Model Context Protocol (MCP) servers to perform security operations, threat intelligence investigation, log analysis, and incident reporting.

## Project Structure

* `/frontend`: A modern dashboard built with Next.js, displaying a chat interface, real-time tool logs, investigation history, and interactive charts.
* `/backend`: A robust FastAPI server acting as the orchestrator connecting the agent, database, frontend, and MCP clients.
* `/mcp_servers`: Specialized microservices implementing the Model Context Protocol (MCP) to provide domain-specific tools (network analysis, threat intelligence, log parsing, reporting).
* `/agent_layer`: The intelligent agent and multi-agent coordination logic.
* `/database`: Storage for local logs, history, and system configurations.
* `/docs`: Project manuals, guides, and learning journals.
# AI-Powered-Security-Operations-Center
