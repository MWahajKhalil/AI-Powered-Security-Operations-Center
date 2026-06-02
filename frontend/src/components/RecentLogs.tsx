"use client";

import React, { useEffect, useState } from "react";

interface ToolExecutionLog {
  timestamp: string;
  tool_name: string;
  arguments: Record<string, any>;
  result: any;
  execution_time_ms: number;
  status: "success" | "failure";
}

interface RecentLogsProps {
  simulatedLogs?: ToolExecutionLog[];
  logs?: ToolExecutionLog[];
  loading?: boolean;
  error?: string | null;
}

export default function RecentLogs({ 
  simulatedLogs = [],
  logs = [],
  loading = false,
  error = null
}: RecentLogsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failure">("all");
  
  // Track which log row is currently expanded (Datadog accordions)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const displayLogs = [...simulatedLogs, ...logs];

  const filteredLogs = displayLogs.filter((log) => {
    const matchesSearch = log.tool_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          JSON.stringify(log.arguments).toLowerCase().includes(searchQuery.toLowerCase()) ||
                          JSON.stringify(log.result).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="glass-card p-6 flex flex-col h-full min-h-[360px] transition-all duration-300 select-none overflow-hidden">
      {/* Header Info Block */}
      <div className="flex justify-between items-center border-b border-[var(--border-muted)] pb-4 mb-4 transition-colors duration-300 flex-shrink-0">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] transition-colors duration-300">
            Sensor Audit Logs Stream
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-widest transition-colors duration-300">
            Real-time SQLite transaction feed
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-[#0EA5E9] bg-[#0EA5E9]/5 border border-[#0EA5E9]/15 px-2.5 py-1 rounded-full font-semibold transition-colors duration-300">
          <span className="h-1 w-1 rounded-full bg-[#0EA5E9] shadow-[0_0_6px_#0EA5E9] animate-ping" />
          <span>Live Listening</span>
        </div>
      </div>

      {/* Dynamic Search & Severity Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter logs (e.g. ping, 8.8.8.8)..."
          className="flex-1 bg-[var(--bg-obsidian)]/30 border border-[var(--border-muted)] rounded-lg px-3 py-1.5 text-[10px] placeholder:text-[var(--text-muted)]/40 text-[var(--text-primary)] outline-none focus:border-[#0EA5E9]/45 transition-all duration-300"
        />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/30"
                : "bg-[var(--bg-obsidian)]/20 text-[var(--text-muted)] border border-[var(--border-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            All ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("success")}
            className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1 ${
              statusFilter === "success"
                ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                : "bg-[var(--bg-obsidian)]/20 text-[var(--text-muted)] border border-[var(--border-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span className="h-1 w-1 rounded-full bg-[#10B981]" />
            Ok ({logs.filter(l => l.status === "success").length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("failure")}
            className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1 ${
              statusFilter === "failure"
                ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30"
                : "bg-[var(--bg-obsidian)]/20 text-[var(--text-muted)] border border-[var(--border-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span className="h-1 w-1 rounded-full bg-[#EF4444]" />
            Fail ({logs.filter(l => l.status === "failure").length})
          </button>
        </div>
      </div>

      {/* Main Table Stream Layout */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[320px] border border-[var(--border-muted)] rounded-lg bg-[var(--bg-obsidian)]/10 transition-colors duration-300">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-xs text-[var(--text-muted)] py-20 gap-3">
            <div className="wave-container">
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider">Syncing relational databases...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-xs text-[var(--text-muted)] py-20 text-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444] mb-2 animate-pulse" />
            <span className="font-bold text-[var(--text-primary)] transition-colors duration-300">{error}</span>
            <p className="text-[9px] text-[var(--text-muted)]/60 mt-1 max-w-[200px] leading-relaxed transition-colors duration-300">
              FastAPI backend is offline. Run uvicorn server on port 8000 to stream live audits.
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-xs text-[var(--text-muted)] py-20 text-center">
            <span className="text-lg mb-2">🔍</span>
            <span className="font-bold text-[var(--text-primary)] transition-colors duration-300">No matching audit logs found</span>
            <p className="text-[9px] text-[var(--text-muted)]/60 mt-1 transition-colors duration-300">
              Refine your text parameters or status filters.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-mono text-[10px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-[var(--border-muted)] bg-[var(--bg-panel)]/50 text-[var(--text-muted)] uppercase tracking-wider font-extrabold text-[8px] transition-colors duration-300 select-none">
                <th className="py-2.5 px-4 w-[8%] text-center">STATUS</th>
                <th className="py-2.5 px-4 w-[42%]">DIAGNOSTIC VECTOR (TOOL)</th>
                <th className="py-2.5 px-4 w-[15%] text-right">LATENCY</th>
                <th className="py-2.5 px-4 w-[20%] text-right">TIMESTAMP</th>
                <th className="py-2.5 px-4 w-[15%] text-center">ACTIONS</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {filteredLogs.map((log, index) => {
                const date = new Date(log.timestamp);
                const timeStr = date.toLocaleTimeString([], { hour12: false });
                const isSuccess = log.status === "success";
                const isExpanded = expandedIndex === index;

                return (
                  <React.Fragment key={index}>
                    {/* Collapsible Click Row */}
                    <tr 
                      onClick={() => toggleExpand(index)}
                      className={`border-b border-[var(--border-muted)] hover:bg-[var(--text-primary)]/3 cursor-pointer transition-all duration-200 select-none ${
                        isExpanded ? "bg-[var(--border-muted)]/15" : ""
                      }`}
                    >
                      {/* 1. Status Indicator Pillar */}
                      <td className="py-3 px-4 text-center">
                        <span 
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ 
                            backgroundColor: isSuccess ? "var(--color-emerald)" : "var(--color-crimson)",
                            boxShadow: `0 0 6px ${isSuccess ? "var(--color-emerald)" : "var(--color-crimson)"}`
                          }}
                        />
                      </td>

                      {/* 2. Tool Name Column */}
                      <td className="py-3 px-4 font-bold text-[var(--text-primary)] transition-colors duration-300">
                        {log.tool_name}
                      </td>

                      {/* 3. Latency benchmarks */}
                      <td className="py-3 px-4 text-right text-[var(--text-secondary)] font-semibold transition-colors duration-300">
                        {log.execution_time_ms} ms
                      </td>

                      {/* 4. Timestamp */}
                      <td className="py-3 px-4 text-right text-[var(--text-muted)] transition-colors duration-300">
                        {timeStr}
                      </td>

                      {/* 5. Actions / Expand icon */}
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] text-[#0EA5E9] font-bold uppercase transition-all duration-200 ${isExpanded ? "rotate-90" : ""}`}>
                          {isExpanded ? "▼" : "▶"}
                        </span>
                      </td>
                    </tr>

                    {/* Accordion expand block */}
                    {isExpanded && (
                      <tr className="bg-[var(--bg-obsidian)]/20 transition-all duration-300">
                        <td colSpan={5} className="py-4 px-6 border-b border-[var(--border-muted)]">
                          <div className="flex flex-col gap-3.5 fade-in">
                            {/* Input Parameters Tag Section */}
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] font-extrabold transition-colors duration-300">
                                Inbound Input Parameters:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(log.arguments).length === 0 ? (
                                  <span className="px-2 py-0.5 rounded border border-[var(--border-muted)] text-[8px] text-[var(--text-muted)] bg-[var(--bg-obsidian)]/40 transition-colors duration-300">
                                    None (Void params)
                                  </span>
                                ) : (
                                  Object.entries(log.arguments).map(([key, val]) => (
                                    <span 
                                      key={key} 
                                      className="px-2 py-0.5 rounded border border-[#0EA5E9]/15 text-[8px] text-[#0EA5E9] bg-[#0EA5E9]/5 font-semibold transition-colors duration-300"
                                    >
                                      {key}: <span className="text-[var(--text-secondary)] font-normal">{String(val)}</span>
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Raw Structured Output Block */}
                            <div className="flex flex-col gap-1.5 relative group">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] font-extrabold transition-colors duration-300">
                                  Outbound subprocess trace (stdout):
                                </span>
                                <button
                                  type="button"
                                  onClick={() => navigator.clipboard.writeText(
                                    typeof log.result === "string" ? log.result : JSON.stringify(log.result, null, 2)
                                  )}
                                  className="px-2 py-0.5 rounded border border-[var(--border-muted)] text-[8px] uppercase font-bold text-[var(--text-muted)] hover:text-[#0EA5E9] hover:border-[#0EA5E9]/30 bg-[var(--bg-obsidian)]/60 cursor-pointer transition-all"
                                >
                                  Copy JSON
                                </button>
                              </div>
                              
                              <pre className="bg-[var(--bg-terminal)]/95 border border-[var(--border-muted)] rounded-lg p-3 text-[9px] text-[var(--text-secondary)] max-h-36 overflow-y-auto leading-relaxed overflow-x-auto whitespace-pre-wrap transition-all duration-300">
                                {typeof log.result === "string" 
                                  ? log.result.trim() 
                                  : JSON.stringify(log.result, null, 2)
                                }
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Database sync footer */}
      <div className="border-t border-[var(--border-muted)] pt-3.5 mt-4 text-[9px] text-[var(--text-muted)] flex justify-between items-center transition-colors duration-300 flex-shrink-0">
        <span>SQLITE AUDITING: soc_dashboard.db</span>
        <span>STREAM FEED STABLE</span>
      </div>
    </div>
  );
}
