# Phase 7 Changelog: Threat Intelligence MCP Server

This document records the incremental progress, directory changes, and newly registered tools introduced in Phase 7.

---

## 1. What We Did in This Phase
- Created our second independent **Model Context Protocol (MCP) Server**: The Threat Intelligence Server.
- Configured a new server folder tree at `mcp_servers/threat_intel/`.
- Exposed three powerful threat assessment tools:
  - `analyze_ip_reputation(ip: str)`: Inspects IP addresses against mock datasets representing AbuseIPDB and VirusTotal to return threat indicators.
  - `analyze_domain_reputation(domain: str)`: Detects typosquatting, phishing keywords, domain age, and blacklist status.
  - `geoip_lookup(ip: str)`: Resolves structural geological details (ISP, country, coordinates) simulating MaxMind databases.
- Included documented reference points inside tool outputs explaining how to transition from local mock data to real, live HTTPS API endpoints.

---

## 2. What Changed Since the Previous Phase (Phase 6)

In Phase 6, we finalized our backend's logging capabilities using SQLite, but we only had a single network analysis server active.

Here are the specific structural and code changes introduced in Phase 7:

### New Files Created
* `[NEW]` [mcp_servers/threat_intel/requirements.txt](file:///Users/mwahajkhalil/Learnings/MCP%20Project/mcp_servers/threat_intel/requirements.txt) — Holds `mcp` SDK library settings.
* `[NEW]` [mcp_servers/threat_intel/server.py](file:///Users/mwahajkhalil/Learnings/MCP%20Project/mcp_servers/threat_intel/server.py) — Declares three threat intel tools, complete with format validation.
* `[NEW]` [docs/Phase_7_Changelog.md](file:///Users/mwahajkhalil/Learnings/MCP%20Project/docs/Phase_7_Changelog.md) — This changelog document tracking developments.

### Code Comparison Diffs

#### Directory Structure Diffs
```diff
 /Users/mwahajkhalil/Learnings/MCP Project/
 ├── mcp_servers/
 │   ├── network_analysis/ ...
+│   └── threat_intel/
+│       ├── requirements.txt
+│       └── server.py
```

---

## 3. Real Logic vs. Mock/Temporary Logic in this Phase
- **Real Logic**: Data format validations (IP regex matching, domain string structures) and output JSON serializations are **100% Real**.
- **Mock/Temporary Logic**: The threat data returned by these intelligence tools is simulated. It has been structured deterministically (e.g. mapping specific IPs to threat scores, or flagging domain age based on suspicious login keywords), looking highly realistic.
- **Production API Mapping**: In real enterprise SOC environments, you would replace this local scanning logic with active HTTP request calls (using libraries like `httpx` or `requests` in Python) querying live cloud endpoints:
  - **AbuseIPDB**: `https://api.abuseipdb.com/api/v2/check` (Checking malicious reports).
  - **VirusTotal**: `https://www.virustotal.com/api/v3/ip_addresses/{ip}` (Multi-engine antivirus checks).
  - **IP-API**: `http://ip-api.com/json/{ip}` (Free GeoIP resolver).
