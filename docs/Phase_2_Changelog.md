# Phase 2 Changelog: Backend Foundation

This document details the precise changes introduced in Phase 2, comparing them directly to the baseline established in Phase 1.

---

## 1. What We Did in This Phase
- Created the core API skeleton using the FastAPI web framework.
- Built configuration management using Pydantic Settings (`app/core/config.py`).
- Formulated the exact request/response data models (`app/models/schemas.py`) for the entire application, anticipating tool log inputs for the Model Context Protocol.
- Exposed a `/health` endpoint for diagnostics.
- Implemented a mock `/api/chat` router representing a completed agent call and tool audit trail.

---

## 2. What Changed Since the Previous Phase (Phase 1)

In Phase 1, the workspace was empty except for basic, non-functional directory READMEs. 

Here are the specific structural and code changes implemented in Phase 2:

### New Files Created
* `[NEW]` [requirements.txt](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/requirements.txt) — Holds python requirements for FastAPI, Uvicorn, and Pydantic.
* `[NEW]` [app/__init__.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/app/__init__.py) — Declares the application folder as an importable module.
* `[NEW]` [app/main.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/app/main.py) — Configures CORS headers, initial FastAPI application state, and routers.
* `[NEW]` [app/core/config.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/app/core/config.py) — Declares and loads configuration schemas.
* `[NEW]` [app/models/schemas.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/app/models/schemas.py) — Declares data schemas for `HealthCheck`, `ChatRequest`, `ToolExecutionLog`, `ChatResponse`, and `StandardApiResponse`.
* `[NEW]` [docs/Phase_2_Changelog.md](file:///Users/mwahajkhalil/Learnings/MCP%20Project/docs/Phase_2_Changelog.md) — This changelog document tracking incremental developments.

### Code Comparison Diffs

#### Directory Structure Diffs
```diff
 /Users/mwahajkhalil/Learnings/MCP Project/
-├── backend/
-│   └── README.md
+├── backend/
+│   ├── README.md
+│   ├── requirements.txt
+│   └── app/
+│       ├── __init__.py
+│       ├── main.py
+│       ├── core/
+│       │   └── config.py
+│       └── models/
+│           └── schemas.py
```

#### Operational Diffs
- **Before (Phase 1)**: No local processes could run. Directory existed only as a concept on disk.
- **After (Phase 2)**: FastAPI can be run locally using `uvicorn app.main:app --reload`. It dynamically validates schemas and serves interactive OpenAPI specs (`/docs`).

---

## 3. Verified Architecture Status
Our data flow contract is now officially locked down:
`Frontend` -> sends JSON payload conforming to `ChatRequest` to `/api/chat` -> `Backend` validates it -> runs mock tools -> returns data conforming to `StandardApiResponse`.
