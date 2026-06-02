# Phase 22 Changelog: Sidebar-Routed Command Suite & AI Diagnostic Cockpit

This changelog documents the complete re-architecture of the SOC Command Center layout, shifting from local page tab controls to a fully routed Sidebar Command Suite, alongside a highly advanced dual-pane AI Diagnostic Cockpit.

---

## 1. Sidebar-Routed Command Suite (`Sidebar.tsx` & `page.tsx`)
*   **Decluttered Workspace Division**:
    *   Removed all local dashboard tabs completely. Navigation is now 100% managed by the primary Left Sidebar menu.
    *   Allows seamless clicks to swap between four dedicated full-page security workspaces:
        1.  **🌐 Threat Radar**: Visual coordinate maps (`ThreatMap`) and spline trends (`ThreatChart`) with quick latency checks.
        2.  **📑 Sensor Audits**: CISA Bulletins Board (`BulletinsBoard`) and SQLite logs audit feed (`RecentLogs`).
        3.  **🔬 Secure Sandbox**: SSL/WHOIS cryptographical inspector (`SslInspector`) and markdown brief compiler (`ReportGenerator`).
        4.  **💬 AI Threat Hunt**: The live incident reasoning cockpit.

---

## 2. Dynamic Dual-Pane AI Diagnostics Cockpit (`page.tsx`)
*   **Unified Observability Console**:
    *   Refactored the AI Threat Hunt workspace to display all critical investigation utilities side-by-side.
    *   *Left Column (50% width)*: Integrates the interactive AI Agent dialogue console (`ThreatIntelChat`).
    *   *Right Column (50% width)*: Vertically stacks the monospace developer terminal shell (`AuditTerminal`, top 50%) and the chronological Chain-of-Thought reasoning APM trace timeline (`AgentPipeline`, bottom 50%).
*   **Live Parameter Binding**:
    *   As queries run in the dialogue console, the terminal standard outputs and the vertical reasoning traces update in real-time, providing immediate observability.
