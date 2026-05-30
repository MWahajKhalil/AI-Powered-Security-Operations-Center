# Backend Orchestration Layer

This directory will contain our primary backend application built with **FastAPI**. The backend acts as the central hub of our system, coordinating requests from the frontend, storing data, communicating with the AI Agent Layer, and initiating client-side connections to the MCP servers.

## Key Components
- **API Endpoints**: Interfaces for the chat, audit logs, and investigation list.
- **MCP Client Manager**: Establishes connections to available MCP servers and retrieves capabilities/tools.
- **Agent Orchestrator Interface**: Handles the integration with the LLM and processes agent loops.
- **Database Connector**: Connects to the database layer to store logs and state.
