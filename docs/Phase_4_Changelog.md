# Phase 4 Changelog: MCP Client Layer

This document details the incremental changes, class structures, and integration updates made during Phase 4, transitioning our backend from static mock endpoints to a dynamic MCP Client Orchestrator.

---

## 1. What We Did in This Phase
- Created the **MCP Client Layer** inside `/backend/app/core/mcp_client.py`.
- Built the `MCPClientManager` class that dynamically spawns, manages, and communicates with MCP servers as quiet background subprocesses using Standard I/O.
- Integrated the MCP client lifecycle directly into FastAPI's startup and shutdown lifecycle via `lifespan` context events, automatically spinning up and shutting down subprocesses cleanly.
- Upgraded the `/api/chat` route to inspect input strings. If the text mentions "dns" or "ping", the backend client dynamically executes the **actual** tools registered on our Network Analysis Server, and logs the execution latency.

---

## 2. What Changed Since the Previous Phase (Phase 3)

In Phase 3, we built our standalone Network Analysis server which run completely independently.

Here are the specific structural and code changes implemented in Phase 4:

### New Files Created
* `[NEW]` [backend/app/core/mcp_client.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/app/core/mcp_client.py) — Spawns the MCP subprocess, parses tool definitions, and wraps call logic.
* `[NEW]` [docs/Phase_4_Changelog.md](file:///Users/mwahajkhalil/Learnings/MCP%20Project/docs/Phase_4_Changelog.md) — This changelog document tracking developments.

### Files Modified
* `[MODIFY]` [backend/requirements.txt](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/requirements.txt) — Installed the official `mcp` SDK package as a backend dependency.
* `[MODIFY]` [backend/app/core/config.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/app/core/config.py) — Added the configurability for `NETWORK_ANALYSIS_SERVER_PATH`.
* `[MODIFY]` [backend/app/main.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/app/main.py) — Added FastAPI lifespan event bindings to open/close subprocesses and mapped live keywords in chat routes to execute real MCP tools.

### Code Comparison Diffs

#### Main Application Lifespan Diffs
```diff
+from contextlib import asynccontextmanager
+from app.core.mcp_client import mcp_client_manager
 
-app = FastAPI(
-    title=settings.PROJECT_NAME,
-    version=settings.VERSION,
-    debug=settings.DEBUG
-)
+@asynccontextmanager
+async def lifespan(app: FastAPI):
+    # Connect to the Network Analysis MCP Server on startup
+    await mcp_client_manager.connect_to_server(settings.NETWORK_ANALYSIS_SERVER_PATH)
+    yield
+    # Disconnect from the MCP Server on shutdown
+    await mcp_client_manager.disconnect()
+
+app = FastAPI(
+    title=settings.PROJECT_NAME,
+    version=settings.VERSION,
+    debug=settings.DEBUG,
+    lifespan=lifespan
+)
```

---

## 3. Real Logic vs. Mock Logic in this Phase
- **Real Logic**: Subprocess creation, JSON-RPC schema handshake (`ClientSession.initialize`), and tool calls to the Network Analysis Server are **100% Real**. When you type "ping 8.8.8.8", the backend actually communicates over Standard I/O to the Network Server, which runs a physical ping and returns the live string output!
- **Mock/Temporary Logic**: The keyword matching parser in `/api/chat` (detecting `dns` or `ping` via simple regex) is a temporary gateway. It acts as our basic manual router, which will be completely replaced by the **AI Agent Layer** in the next phase.
