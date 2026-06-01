# Phase 18 Changelog: Interactive Threat Bulletins & AI Investigation Hub

This changelog documents the implementation of the **Interactive Threat Bulletins & CVE Advisory Board**, bridging live CISA security alerts directly with the AI Threat Hunt reasoning agent.

---

## 1. High-Density Advisories Board Component (`components/BulletinsBoard.tsx`)
*   **Structured Security Hub**:
    *   Designed a full-bleed dashboard card displaying live CISA security advisories dynamically parsed from the FastAPI RSS feed endpoint (`http://localhost:8000/api/threat-feed`).
*   **Dynamic Severity Mapping**:
    *   Applies a smart categorization regex model to scanning advisories. Flags critical zero-days, remote code executions (RCEs), and authentication bypasses as `CRITICAL` (magenta badging), administrative escalation warnings as `HIGH` (amber badging), and standard vulnerabilities as `MEDIUM` (cyan badging).
*   **CVE Registry Identifiers**:
    *   Extracts authentic registry codes (e.g. `CVE-2026-3829`) when present, or maps deterministic yearly identifiers dynamically to each incident for clean enterprise-grade referencing.
*   **Interactive Search & Quick Filters**:
    *   Features a live keyword filter input matching titles and vulnerability descriptions instantly.
    *   Added severity categorization toggle pills with real-time numeric indicators matching filter states.

---

## 2. Integrated "Investigate with AI" Routing Ingress (`components/ThreatIntelChat.tsx`)
*   **Direct Ingress Triggers**:
    *   Clicking **"Investigate with AI"** next to any CISA vulnerability on the Bulletins Board launches an instant query trace.
*   **Auto-Submit Prop Pipes**:
    *   Refactored `ThreatIntelChat` to accept `initialQuery` and `onQueryHandled` properties.
    *   When an inquiry is passed down, the chat interface captures the query string, appends it dynamically into the active dialogue stack as an analyst prompt, toggles the thinking animation state, and queries the background FastAPI router `http://localhost:8000/api/chat` directly.
*   **Workspace Seamless Transitions**:
    *   Bridges the two primary workspaces together. The home dashboard coordinates with the chat view, switching views automatically and routing the CISA payload for immediate AI multi-server diagnostics (WHOIS sweeps, logs audits, or geo-correlations) with zero manual double-typing.
