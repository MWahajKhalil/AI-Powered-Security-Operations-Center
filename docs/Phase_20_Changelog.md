# Phase 20 Changelog: Dashboard Layout Decluttering & Sub-Tab Architecture

This changelog documents the implementation of the **Dashboard Sub-Tab Architecture**, eliminating dashboard "information overload" by logically grouping our 8 telemetry components into three high-density, focused sub-workspaces.

---

## 1. High-Density Layout Switcher (`page.tsx`)
*   **Decluttered Sub-Navigation**:
    *   Replaced the massive vertical stacking of all widgets with an elegant, low-contrast Vercel-style sub-tab navigation bar at the top of the dashboard main deck.
    *   Tracks state dynamically using `dashTab` ("radar" | "audits" | "sandbox") with smooth, high-fidelity HSL visual transition highlights.

---

## 2. Structured Telemetry Sub-Views (3 Key Domains)

### A. 🔍 Diagnostic Radar Map View (`radar`)
*   *Purpose*: Houses visual geometric and spatial geolocator maps.
*   *Components*:
    *   **SVG Threat Ingress Map (`ThreatMap.tsx`)**: Pulsing coordinates geolocator.
    *   **Threat Metrics Timeline (`ThreatChart.tsx`)**: smoothed Risk Index spline charting.

### B. 📋 Audit Transactions View (`audits`)
*   *Purpose*: Houses active lists, transaction streams, and security catalogs.
*   *Components*:
    *   **CISA Advisories Board (`BulletinsBoard.tsx`)**: Dynamic severity badged alerts with auto-investigation prompts.
    *   **SQLite Audit Logs Table (`RecentLogs.tsx`)**: Collapsible accordions with raw subprocess tracing.

### C. 🛡️ SecOps Sandbox Inspectors View (`sandbox`)
*   *Purpose*: Houses diagnostic sandboxes, trace timelines, and executive briefing builders.
*   *Components*:
    *   **SSL Cryptography Inspector (`SslInspector.tsx`)**: Domain registry and trust scanner.
    *   **AI Agent Reasoning APM Pipeline (`AgentPipeline.tsx`)**: Chain-of-thought timeline tracing.
    *   **SecOps Report Generator (`ReportGenerator.tsx`)**: Dynamic markdown brief compiler.
