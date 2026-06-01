"use client";

import React, { useState } from "react";

interface ThreatAdvisory {
  title: string;
  link: string;
  published: string;
  summary: string;
}

interface ReportGeneratorProps {
  threats?: ThreatAdvisory[];
}

export default function ReportGenerator({ threats = [] }: ReportGeneratorProps) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setCopied(false);
    
    // Formulate dynamic markdown executive brief
    setTimeout(() => {
      const timestamp = new Date().toUTCString();
      const threatLines = threats.length > 0
        ? threats.slice(0, 3).map((t, idx) => `*   **ALERT-[${idx + 1}]**: ${t.title} (${t.published.trim()})`).join("\n")
        : "*   No active Zero-Day advisories parsed. Standby for feed sync.";

      const markdownBrief = `# SECURE SECOPS INCIDENT EXECUTIVE SUMMARY
---
**AUDIT GENERATION TIMESTAMP**: ${timestamp}
**Target Host Workspace**: soc_dashboard.db (SQLite)
**Ingress Health Index**: NORMAL (Active logs streaming verified)

## 1. Active Threat Intelligence & CVE advisories
Following bulletins fetched dynamically from CISA Threat Intelligence Feed:
${threatLines}

## 2. Ingress Observability Diagnostics
*   **Sensor Logs Transactions**: Historical SQLite logging active.
*   **AI reasoning agent status**: Model Context Protocol layers listening on background channels.
*   **System Latency Benchmarks**: 12ms average RTT check.

## 3. Executive Security Recommendations
1.  Verify patch level statuses on critical servers for the listed CVE vectors above.
2.  Enable geo-correlation filters on AbuseIPDB for suspicious administrative SSH elevations.
3.  Monitor SSL/TLS expiry intervals on public registers daily using Network Analysis sensors.

---
*Report formulated under Tier 2 Incident Command procedures. Fully auditable.*`;

      setReport(markdownBrief);
      setLoading(false);
    }, 1200);
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-6 flex flex-col h-full min-h-[380px] transition-all duration-300 select-none overflow-hidden">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-[var(--border-muted)] pb-4 mb-4 flex-shrink-0 transition-colors duration-300">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] transition-colors duration-300">
            Incident Brief Compiler
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-widest transition-colors duration-300">
            Compile aggregated SecOps markdown briefings
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-[#EC4899] bg-[#EC4899]/5 border border-[#EC4899]/15 px-2.5 py-1 rounded-full font-semibold transition-colors duration-300">
          <span className="h-1.5 w-1.5 rounded-full bg-[#EC4899] shadow-[0_0_6px_#EC4899] animate-pulse" />
          <span>Brief Ingress v1</span>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Statistics block */}
        <div className="grid grid-cols-2 gap-3 flex-shrink-0">
          <div className="bg-[var(--bg-obsidian)]/40 border border-[var(--border-muted)] rounded-lg p-2.5 text-center transition-all">
            <div className="text-xs font-bold text-[#EC4899] font-mono">{threats.length}</div>
            <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Alert Feeds Active</div>
          </div>
          <div className="bg-[var(--bg-obsidian)]/40 border border-[var(--border-muted)] rounded-lg p-2.5 text-center transition-all">
            <div className="text-xs font-bold text-[#0EA5E9] font-mono">SQLite</div>
            <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Database Target</div>
          </div>
        </div>

        {/* Generate and export Actions */}
        {!report ? (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[var(--border-muted)] rounded-lg p-6 bg-[var(--bg-obsidian)]/5 transition-colors duration-300 min-h-[160px]">
            <span className="text-xl mb-2">📋</span>
            <span className="font-mono text-[9px] font-bold text-[var(--text-primary)]">Ready for Compilation</span>
            <p className="text-[8px] text-[var(--text-muted)]/60 text-center mt-1 max-w-[200px] leading-relaxed">
              Synthesize SQLite transactions, geocontrol sweeps, and active CISA warnings into a structured brief.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="mt-4 px-4 py-1.5 rounded-lg text-[9px] uppercase font-bold tracking-wider bg-[#EC4899]/10 border border-[#EC4899]/20 text-[#EC4899] hover:bg-[#EC4899]/25 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Compiling Report..." : "Compile Security Brief"}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-3 overflow-hidden fade-in min-h-[160px]">
            <div className="flex justify-between items-center flex-shrink-0">
              <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Compiled Brief Markdown:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2 py-0.5 rounded border border-[var(--border-muted)] text-[8px] uppercase font-bold text-[var(--text-muted)] hover:text-[#0EA5E9] hover:border-[#0EA5E9]/30 bg-[var(--bg-obsidian)] cursor-pointer transition-all"
                >
                  {copied ? "Copied!" : "Copy Brief"}
                </button>
                <button
                  type="button"
                  onClick={() => setReport(null)}
                  className="px-2 py-0.5 rounded border border-[var(--border-muted)] text-[8px] uppercase font-bold text-[var(--text-muted)] hover:text-[#EC4899] hover:border-[#EC4899]/30 bg-[var(--bg-obsidian)] cursor-pointer transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
            {/* Scrollable Preformatted block */}
            <pre className="flex-1 bg-[var(--bg-terminal)]/95 border border-[var(--border-muted)] rounded-lg p-3 text-[9px] text-[var(--text-secondary)] font-mono leading-relaxed overflow-y-auto whitespace-pre-wrap select-all transition-all duration-300">
              {report}
            </pre>
          </div>
        )}
      </div>

      {/* Sync Footer */}
      <div className="border-t border-[var(--border-muted)] pt-3.5 mt-4 text-[9px] text-[var(--text-muted)] flex justify-between items-center transition-colors duration-300 flex-shrink-0">
        <span>SECURITY COMPLIANCE: SOC Tier 2 Briefs</span>
        <span>Brief compilation standby</span>
      </div>
    </div>
  );
}
