# Phase 5 Changelog: Simple AI Agent

This document outlines the detailed improvements, reasoning models, and controller updates made during Phase 5, introducing LLM reasoning into our threat investigation cycle.

---

## 1. What We Did in This Phase
- Created the **AI Agent Layer** in `agent_layer/agent.py`.
- Built the `SecurityAgentOrchestrator` class which interacts with Google's **Gemini 1.5 Flash** LLM to perform natural language intent parsing and dynamic tool selection.
- Designed a structured system prompt that converts MCP tool schemas into contextual instructions for the LLM and requests validation outputs in strict JSON format.
- Implemented a robust **Rule-Based Fallback Parser** (semantic keyword router) so that if no `GEMINI_API_KEY` is present, the app continues to operate flawlessly using local matching heuristics.
- Connected the FastAPI backend's `/api/chat` route to the agent layer, letting the AI autonomously decide which tools to execute and summarize their outputs.

---

## 2. What Changed Since the Previous Phase (Phase 4)

In Phase 4, the backend executed tools based on a simple regex check for keywords ("dns" or "ping") in the main routing file.

Here are the specific structural and code changes implemented in Phase 5:

### New Files Created
* `[NEW]` [agent_layer/agent.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/agent_layer/agent.py) — Defines system prompts, loads Gemini SDK configurations, and models decision logic.
* `[NEW]` [docs/Phase_5_Changelog.md](file:///Users/mwahajkhalil/Learnings/MCP%20Project/docs/Phase_5_Changelog.md) — This changelog document tracking developments.

### Files Modified
* `[MODIFY]` [backend/requirements.txt](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/requirements.txt) — Added `google-generativeai` and `python-dotenv` packages.
* `[MODIFY]` [backend/app/main.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/app/main.py) — Set up dynamic python importing and routed incoming chat traffic straight through `agent_orchestrator.decide_tool`.

### Code Comparison Diffs

#### Router Execution Diffs
```diff
-    # REAL LOGIC: Exposing direct tool routing when keywords are present
-    try:
-        if "dns" in prompt or "resolve" in prompt:
-            result = await mcp_client_manager.call_tool("dns_lookup", {"domain": target})
-            ...
+    try:
+        # 1. Fetch available tool definitions from active MCP Server
+        available_tools = await mcp_client_manager.list_available_tools()
+        
+        # 2. Feed prompt and tools into the Agent Orchestrator to make a decision
+        chosen_tool, arguments, explanation = await agent_orchestrator.decide_tool(
+            user_message=request.message,
+            available_tools=available_tools
+        )
```

---

## 3. Real Logic vs. Mock Logic in this Phase
- **Real Logic**: All tool definitions, schema mappings, subprocess standard I/O calls, and rule-based keyword fallbacks are **100% Real**. If you configure a `GEMINI_API_KEY` in the environment, the **LLM reasoning loop is 100% Real**, using live generative AI content generation.
- **Production-Style Practices**: Instead of hardcoding tool mappings, the agent processes the MCP tool dictionary *dynamically*. This means if you add a new tool to the MCP server in the future, the LLM will discover and learn how to use it **instantly** without changing any code in `agent.py`!
- **Simplified Elements**: This agent performs one single reasoning step (Single-Tool orchestration). It does not yet perform multi-step planning (e.g., calling tool A, looking at output, then calling tool B based on that output). That will be implemented in Phase 11.
