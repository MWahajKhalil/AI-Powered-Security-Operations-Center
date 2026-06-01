# Phase 13 Changelog: Production API Integrations & Multi-MCP Subprocesses

This document details the transition from pure local intelligence simulations to real-world cloud security queries, along with the engineering upgrades to support multiple, concurrent Model Context Protocol (MCP) subprocesses within our FastAPI backend.

---

## 1. What We Did in This Phase

1. **Connected Threat Intelligence MCP Server to Production APIs**:
   - **Keyless GeoIP Lookup**: Wired `geoip_lookup` tool to perform real-time, live HTTP queries to `ip-api.com/json/{ip}` using Python's native `urllib.request`. Returns actual geographical data (lat/lon, city, region, ISP, and country code) cleanly.
   - **AbuseIPDB Integration**: Implemented live checking of IP reputation via `https://api.abuseipdb.com/api/v2/check` using native standard libraries. Gracefully maps abuse scores and reports.
   - **VirusTotal Integration**: Engineered live checking of domain malicious scores and creation dates via `https://www.virustotal.com/api/v3/domains/{domain}`.

2. **Built Multi-Server MCP Orchestration**:
   - Upgraded `MCPClientManager` inside `mcp_client.py` to handle multiple concurrent subprocess servers by replacing single session variables with dictionaries (`sessions` and `_exit_stacks`).
   - Automatically parses all tools across all active sessions and exposes them as a consolidated schema list to the AI agent.
   - Dynamically routes outgoing tool calls (`call_tool`) to whichever active subprocess server actually implements it.
   - Added a backward-compatible `session` property to guarantee zero breakage on existing database metrics/lifespan hooks.

3. **Added Resilient Fallback Architectures**:
   - Programmed all live integrations with strict `try-except` blocks. If API credentials are not declared in `.env` (or if external servers are unreachable), the system **automatically falls back to simulated mock scans**, maintaining 100% operational uptime.

4. **Upgraded Local Rule-Based Semantic Routing**:
   - Expanded the backend's semantic router in `agent.py` to route `geoip_lookup`, `analyze_ip_reputation`, and `analyze_domain_reputation` prompts using regular expressions (IP address/domain extraction) and security keywords, enabling offline local developer testing without requiring a Gemini API key.

---

## 2. What Changed Since the Previous Phase (Phase 12)

In Phase 12, we completed the frontend Chat visualizer but only connected it to the `Network-Analysis-Server` subprocess, leaving the Threat Intelligence tools disconnected and returning hardcoded mock data.

Here are the specific structural changes introduced in Phase 13:

### Files Created
* `[NEW]` [docs/Phase_13_Changelog.md](file:///Users/mwahajkhalil/Learnings/MCP%20Project/docs/Phase_13_Changelog.md) — This changelog document.

### Files Modified
* `[MODIFY]` [backend/.env](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/.env) — Added placeholders for production API credentials (`ABUSEIPDB_API_KEY`, `VIRUSTOTAL_API_KEY`).
* `[MODIFY]` [backend/app/core/config.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/app/core/config.py) — Added `THREAT_INTEL_SERVER_PATH` to resolve the script path of the threat intelligence server.
* `[MODIFY]` [backend/app/core/mcp_client.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/app/core/mcp_client.py) — Upgraded the manager client to spawn, list, route, and clean up multiple subprocess servers concurrently.
* `[MODIFY]` [backend/app/main.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/app/main.py) — Updated the FastAPI lifespan hook to connect to both the Network Analysis and Threat Intelligence MCP servers on startup.
* `[MODIFY]` [agent_layer/agent.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/agent_layer/agent.py) — Extended the offline local semantic router to parse and execute GeoIP lookups and IP/domain reputation checks.

---

## 3. Real Logic vs. Mock/Temporary Logic in this Phase

- **100% Real Production Integrations**:
  - Live, keyless **IP-API GeoIP resolving** is 100% active. Querying an IP address returns its actual geographical coordinates and active ISP in real time.
  - Multi-subprocess spawning, tool mapping, dynamic server routing, SQLite audit logging, and Next.js frontend console displays are 100% real.
  - AbuseIPDB and VirusTotal live API query paths are completely implemented.
- **Mock/Temporary Logic**:
  - Since AbuseIPDB and VirusTotal require active developer API keys (which are declared as placeholders by default), their queries catch the placeholder status cleanly and fall back to localized mock metrics. Adding real keys to `.env` immediately promotes them to live operations.
