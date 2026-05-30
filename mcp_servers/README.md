# Model Context Protocol (MCP) Servers

This directory contains our suite of specialized, self-contained MCP servers. Each server runs as an independent process and exposes a strict set of security tools that can be invoked via the Model Context Protocol.

## Planned MCP Servers
1. **Network Analysis Server**: Tools for basic networking actions (ping, DNS lookup, WHOIS checks).
2. **Threat Intelligence Server**: Reputation scores for IPs/domains, geo-location lookups.
3. **Log Analysis Server**: Parsing authentication logs, identifying access patterns.
4. **Incident Report Server**: Generating timeline JSONs and formatted incident summaries.
5. **RAG Knowledge Server**: Retrieving security playbooks and internal documentation.
