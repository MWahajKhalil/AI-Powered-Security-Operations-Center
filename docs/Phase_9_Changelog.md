# Phase 9 Changelog: Shell Layout & Live Health Monitor

This document details the layout shell, reactive navigation tabs, and live background API monitoring systems introduced during Phase 9.

---

## 1. What We Did in This Phase
- Engineered a modular glassmorphic sidebar dock in `/frontend/src/components/Sidebar.tsx` displaying unified navigation links (Threat Ingress, Threat Hunt), clean active SVG icons, and a Tier 2 analyst ID badge.
- Engineered a top controller header in `/frontend/src/components/Header.tsx` displaying the active command title and connection socket configurations.
- Integrated a live **API Health Monitor** in the Header: runs an automated background polling script (`fetch` check) querying your FastAPI backend (`GET /health`) every 5 seconds.
  *   *Glow Indicators*: Displays a glowing emerald **"FastAPI Online"** badge when the server is active, and switches to a flashing crimson **"API Offline"** badge if the backend process is stopped.
- Integrated the sidebar and header shells inside the main page router `/frontend/src/app/page.tsx` supporting active state swappings.
- Hardcoded a strict **2GB Node memory limit** (`NODE_OPTIONS='--max-old-space-size=2048'`) directly inside `/frontend/package.json` dev scripts, making RAM protection completely automatic for the user.

---

## 2. What Changed Since the Previous Phase (Phase 8)

In Phase 8, we scaffolded the Next.js app, leaving the homepage as a single greeting diagnostic card.

Here are the specific structural changes introduced in Phase 9:

### New Files Created
* `[NEW]` [frontend/src/components/Sidebar.tsx](file:///Users/mwahajkhalil/Learnings/MCP%20Project/frontend/src/components/Sidebar.tsx) — Modular sidebar nav panels.
* `[NEW]` [frontend/src/components/Header.tsx](file:///Users/mwahajkhalil/Learnings/MCP%20Project/frontend/src/components/Header.tsx) — Top command header with polling health status checks.
* `[NEW]` [docs/Phase_9_Changelog.md](file:///Users/mwahajkhalil/Learnings/MCP%20Project/docs/Phase_9_Changelog.md) — This changelog document tracking developments.

### Files Modified
* `[MODIFY]` [frontend/package.json](file:///Users/mwahajkhalil/Learnings/MCP%20Project/frontend/package.json) — Automated the 2GB Node memory cap.
* `[MODIFY]` [frontend/src/app/page.tsx](file:///Users/mwahajkhalil/Learnings/MCP%20Project/frontend/src/app/page.tsx) — Integrated components into a unified command shell.

### Code Comparison Diffs

#### Directory Structure Diffs
```diff
  /Users/mwahajkhalil/Learnings/MCP Project/
  ├── frontend/
  │   └── src/
+ │       ├── components/
+ │       │   ├── Sidebar.tsx
+ │       │   └── Header.tsx
  │       └── app/
  │           └── page.tsx (Modified)
  └── docs/
+     └── Phase_9_Changelog.md
```

---

## 3. Real Logic vs. Mock/Temporary Logic in this Phase
- **Real Logic**: Navigation tabs state, sidebar visual rendering, package.json dev scripts, and automated header health polling to port 8000 are **100% Real**.
- **Temporary Logic**: Content panes for the Ingress Dashboard (active scan status grids) and the Threat Hunt (Dialogue console) render styled placeholders until fully wired in subsequent phases.
