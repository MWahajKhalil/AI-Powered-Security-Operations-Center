# Phase 3 Changelog: First MCP Server

This document records the exact progress and code updates introduced in Phase 3, building upon the foundations of Phase 2.

---

## 1. What We Did in This Phase
- Created our very first **Model Context Protocol (MCP) Server**: The Network Analysis Server.
- Utilized the high-level **FastMCP** SDK to implement automatic protocol handshakes and registration.
- Added two functional, production-ready security tools:
  - `dns_lookup(domain: str)`: Resolves hostnames into multiple IP address listings.
  - `ping_host(host: str)`: Uses standard system diagnostics to verify endpoint reachability, implementing security controls to prevent remote shell command injections.
- Documented tool declarations and discovery systems inside the protocol standard.

---

## 2. What Changed Since the Previous Phase (Phase 2)

In Phase 2, we built our central FastAPI backend server with mock data. 

Here are the specific structural and code changes introduced in Phase 3:

### New Files Created
* `[NEW]` [mcp_servers/network_analysis/requirements.txt](file:///Users/mwahajkhalil/Learnings/MCP%20Project/mcp_servers/network_analysis/requirements.txt) — Holds python packages required for the MCP protocol (`mcp`).
* `[NEW]` [mcp_servers/network_analysis/server.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/mcp_servers/network_analysis/server.py) — Declares the MCP tools and handles terminal Stdio JSON-RPC streams.
* `[NEW]` [docs/Phase_3_Changelog.md](file:///Users/mwahajkhalil/Learnings/MCP%20Project/docs/Phase_3_Changelog.md) — This changelog document tracking developments.

### Code Comparison Diffs

#### Directory Structure Diffs
```diff
 /Users/mwahajkhalil/Learnings/MCP Project/
 ├── backend/
 │   └── app/ ...
 ├── mcp_servers/
-│   └── README.md
+│   ├── README.md
+│   └── network_analysis/
+│       ├── requirements.txt
+│       └── server.py
```

#### Operational Diffs
- **Before (Phase 2)**: We had no tools. Our backend simply served a hardcoded mock string about running a DNS query.
- **After (Phase 3)**: We have a fully functional, self-contained MCP tool server. It can be run locally using the `mcp dev` developer inspector, loaded into Claude Desktop, or registered into Cursor.

---

## 3. Real Logic vs. Mock Logic in this Phase
- **Real Logic**: The DNS resolution (`socket.gethostbyname_ex`) and connection execution (`subprocess.run(["ping", ...])`) are 100% real. They interact with your operating system's hardware, standard networking sockets, and live internet routers.
- **Command Sanitization**: We implemented a critical security check in `ping_host`. If we had just passed the raw string to the shell (`shell=True`), a malicious user could enter `8.8.8.8; rm -rf /`, erasing the user's hard drive. By sanitizing inputs and using array-based execution (`subprocess.run`), we prevent command injection entirely.
