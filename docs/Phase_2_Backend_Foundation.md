# Phase 2: Backend Foundation

This document details the configuration, schema architecture, and execution details established during Phase 2 of our custom AI-Powered Security Operations Center (SOC) project.

---

## 1. Goal of Phase 2

The goal of this phase was to build a robust, modular **FastAPI** backend that acts as our central orchestration API. It sets up our core settings systems, defines request/response Pydantic models for clean data validation, and structures a standard JSON API format to communicate with our future dashboard frontend.

---

## 3. Directory Layout

The backend directory contains:
```bash
backend/
├── requirements.txt         # Package dependencies (FastAPI, Uvicorn, Pydantic)
└── app/
    ├── __init__.py          # Marks this folder as a Python module
    ├── main.py              # Main app initiator, CORS middleware, API endpoints
    ├── core/
    │   └── config.py        # Environment variables and configurations
    └── models/
        └── schemas.py       # Pydantic validation schemas
```

---

## 4. Key Architectural Insights

### The Connection to MCP & AI Agent
At this foundation stage, we've designed our **response schemas** to anticipate MCP and Agent outputs:
- **`ChatRequest`**: Standard input representing what the human analyst types into the Next.js UI.
- **`ToolExecutionLog`**: Captures vital information about each tool run: the time it happened, name of the tool (e.g., `dns_lookup`), user inputs (`arguments`), outputs (`result`), execution duration (`execution_time_ms`), and execution state. This ensures that every tool call executed by the AI can be audited.
- **`ChatResponse`**: Bundles the natural language explanation synthesized by the AI along with a list of the exact tools called to produce that explanation.
- **`StandardApiResponse`**: Uniform structure (`{success: bool, data: Any, error: str}`) returning consistent packages to the frontend, regardless of whether a call succeeded or hit a traceback.

### Real Logic vs. Mock Logic
- **Real Logic**: The settings management (Pydantic Settings), the FastAPI app routing, validation logic, API version prefixes, CORS configuration, and structure are completely production-ready.
- **Mock Logic**: Inside `POST /api/chat`, we are currently simulating the LLM's thought loop and the MCP tool execution. This allows us to verify our pipeline's end-to-end data contract without incurring AI costs or requiring complex integrations.

---

## 5. How to Test the API

To launch this step locally:
1. Navigate to `/backend`.
2. Install the required dependencies.
3. Run the development server using Uvicorn.
4. Interact using FastAPI's automatic swagger UI (`http://127.0.0.1:8000/docs`).
