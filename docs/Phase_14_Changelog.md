# Phase 14 Changelog: Log Analysis Server & Threat Signature Audits

This document details the modular authentication log analyzer, automated mock syslog seeder, and the sliding-window threat heuristic engines integrated during Phase 14.

---

## 1. What We Did in This Phase

1. **Created Simulated Authentication Log Engine**:
   - Seeded a realistic syslog-style authentication file at `database/auth.log` containing normal system sessions and security anomalies.
   - Built distinct attack signature profiles directly into the log stream:
     - SSH brute-force login loops from a malicious IP address (`198.51.100.42`) targeting the `admin` user within a 30-second window.
     - Successful off-hours late-night system logins (e.g. user `analyst` logging in from `1.1.1.1` at `23:45:10`).
     - Impossible travel session anomalies (e.g. user `chief_officer` registering successful SSH credentials from the USA (`8.8.8.8`) at `14:00:00` and then from Germany (`203.0.113.80`) at `14:05:00`).

2. **Developed Log Analysis MCP Server**:
   - Engineered `mcp_servers/log_analysis/server.py` as an independent FastMCP microservice running dynamically in our Python environment.
   - Programmed high-fidelity log parsing and security analysis tools:
     - `analyze_authentication_logs`: Converts raw syslog rows into clean structured JSON objects, capturing Timestamp, Host, Service, Status (SUCCESS/FAILED/INFO), Username, Source IP, and Message.
     - `detect_brute_force`: Utilizes sliding datetime window analysis to isolate and alert on IPs with $\ge 5$ failed passwords in $\le 10$ minutes.
     - `detect_off_hours_logins`: Flags interactive user sessions initiated during non-working hours (10 PM to 6 AM).
     - `detect_impossible_travel`: Group-correlates user logins, calculates coordinate distances using standard **Haversine formula trigonometry**, profiles chronological time intervals, and flags velocities exceeding a commercial jet speed threshold ($> 900$ km/h).

3. **Integrated Multi-Subprocess Scale**:
   - Declared configuration variables (`LOG_ANALYSIS_SERVER_PATH` and `AUTH_LOG_PATH`) inside `backend/app/core/config.py`.
   - Registered the log analyzer startup call directly in the FastAPI lifespan hook inside `backend/app/main.py`.
   - Leveraged our Phase 13 `MCPClientManager` dictionary scale to automatically launch, list, and dynamically route incoming chat console requests to our new subprocess server.

4. **Upgraded Offline Local Semantic Router**:
   - Extended the rule-based local semantic router inside `agent_layer/agent.py` to support natural language queries for authentication log parsing and brute-force/travel threat signature scans, providing offline capabilities without requiring an active Gemini API key.

---

## 2. What Changed Since the Previous Phase (Phase 13)

In Phase 13, we connected our Threat Intelligence server to real-world cloud APIs and completed multi-subprocess capabilities. However, we lacked capabilities to inspect system logs or detect active threat signatures.

Here are the specific structural changes introduced in Phase 14:

### New Files Created
* `[NEW]` [database/auth.log](file:///Users/mwahajkhalil/Learnings/MCP%20Project/database/auth.log) — Seeding syslog auth logs.
* `[NEW]` [mcp_servers/log_analysis/server.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/mcp_servers/log_analysis/server.py) — Log Analysis FastMCP server.
* `[NEW]` [docs/Phase_14_Changelog.md](file:///Users/mwahajkhalil/Learnings/MCP%20Project/docs/Phase_14_Changelog.md) — This changelog document.

### Files Modified
* `[MODIFY]` [backend/app/core/config.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/app/core/config.py) — Configured log analyzer path settings.
* `[MODIFY]` [backend/app/main.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/backend/app/main.py) — Configured log analyzer startup subprocess launcher.
* `[MODIFY]` [agent_layer/agent.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/agent_layer/agent.py) — Added semantic offline router keywords for logs.

---

## 3. Real Logic vs. Mock/Temporary Logic in this Phase

- **100% Real Log parsing & Threat Heuristics**:
  - Raw syslog reading, regex-based token parsing, datetime timezone window math, Haversine coordinate trigonometry calculations, and multi-subprocess routing are **100% Real**.
  - Direct integration with our keyless IP-API server is live: the impossible travel tool queries real geographical coordinates for external IPs from `ip-api.com` in real time during log sweeps!
- **Mock/Temporary Logic**:
  - The authentication log file is simulated at `database/auth.log` in order to provide a deterministic developer sandbox. In production, this path can be configured in `.env` to point directly to `/var/log/auth.log` or a central SIEM forwarder.
