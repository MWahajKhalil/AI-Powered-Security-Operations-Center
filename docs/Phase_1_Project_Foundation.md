# Phase 1: Project Foundation & Folder Structure

This document records the design decisions, architecture patterns, and directory structures established during Phase 1 of our custom AI-Powered Security Operations Center (SOC) project.

---

## 1. Goal of Phase 1

The goal of this phase was to establish the comprehensive directory layout for our enterprise-grade AI architecture, ensuring strict segregation of concerns between our web app interface, backend logic, AI orchestrators, database layers, and tool integrations.

---

## 2. Why it Matters

In standard architectures, tools and prompt systems are often tightly coupled to the application code, making them hard to test, scale, or reuse. By decoupling the architecture at the directory level, we achieve:
- **Clean Segregation of Concerns**: Frontend handles only visual presentation; backend handles REST APIs and routing; agent handles reasoning; database handles records; and MCP servers handle functional tools.
- **Protocol-First Modularity**: Because the security tools are built as independent microservices in `/mcp_servers`, they can be imported directly into other environments (like Cursor or Claude Desktop) without modifying a single line of frontend or backend code.

---

## 3. Directory Layout

The workspace has been initialized with the following structure:

```bash
/Users/mwahajkhalil/Learnings/MCP Project/
├── README.md               # Root overview documenting the high-level architecture
├── frontend/
│   └── README.md           # Dashboard and client-side chat UI
├── backend/
│   └── README.md           # FastAPI routing and orchestration server
├── mcp_servers/
│   └── README.md           # Decoupled MCP tool servers (e.g., network analysis)
├── agent_layer/
│   └── README.md           # AI reasoning, prompt templates, and agent orchestration
├── database/
│   └── README.md           # Persistence for tool audits, session history, and incident logs
└── docs/
    ├── README.md           # Directory structure overview
    └── Phase_1_Project_Foundation.md # This learning journal
```

---

## 4. Key Architectural Insights

### The Connection to MCP & AI Agent
- **The MCP Server** is a pure utility. It exposes capabilities (tools) using the standardized Model Context Protocol. It is completely unaware of the LLM or frontend.
- **The AI Agent** is the reasoning core. It handles language, takes user questions, identifies user intents, and determines which tools are needed to fulfill the request.
- **The Backend (MCP Client)** acts as the connector. It connects to active MCP Servers, gathers their tool list schemas, passes the schemas to the Agent, invokes the physical tool requested by the Agent, records the transaction in the database, and returns the result to the Agent.

### Data Flow Diagram (The SOC Threat Hunt)

```
[User Input: "Is 8.8.8.8 safe?"]
          │
          ▼
   ┌─────────────┐
   │  Frontend   │ (Next.js Chat Input UI)
   └──────┬──────┘
          │ (POST /api/chat)
          ▼
   ┌─────────────┐
   │   Backend   │ (FastAPI Router)
   └──────┬──────┘
          │ (Forwards query to the Agent)
          ▼
   ┌─────────────┐
   │ Agent Layer │ (Uses LLM to select tool: "analyze_ip_reputation")
   └──────┬──────┘
          │ (Returns tool call request to Client)
          ▼
   ┌─────────────┐
   │ MCP Client  │ (Backend module - formats JSON-RPC command)
   └──────┬──────┘
          │ (StdIO/SSE pipe communication)
          ▼
   ┌─────────────┐
   │ MCP Server  │ (Executes custom script & returns JSON data)
   └──────┬──────┘
          │ (Returns JSON: {"reputation": "clean"})
          ▼
   ┌─────────────┐
   │ Database    │ (Backend logs audit trace: timestamp, tool, arguments)
   └─────────────┘
          │
          ▼
[Agent writes final explanation: "8.8.8.8 belongs to Google and is safe."]
          │
          ▼
   ┌─────────────┐
   │  Frontend   │ (Renders chat bubble + live execution audit log)
   └─────────────┘
```

---

## 5. Summary of Phase 1 Learning

We learned that building an enterprise AI platform is not just about writing scripts; it is about establishing solid boundary systems. The Model Context Protocol allows us to write standalone tool microservices, making our code infinitely reusable across custom applications, IDEs (Cursor), and official chat clients (Claude Desktop).
