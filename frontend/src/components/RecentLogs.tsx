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

export default function RecentLogs() {
  const [logs, setLogs] = useState<ToolExecutionLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failure">("all");

  const fetchLogs = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/logs?limit=30", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const payload = await response.json();
        if (payload.success && Array.isArray(payload.data)) {
          setLogs(payload.data);
          setError(null);
        } else {
          setError("Malformed data package");
        }
      } else {
        setError("Failed to query log database");
      }
    } catch (err) {
      setError("Database Offline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLogs();

    // Poll every 3.5 seconds for live logs feed
    const interval = setInterval(fetchLogs, 3500);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.tool_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          JSON.stringify(log.arguments).toLowerCase().includes(searchQuery.toLowerCase()) ||
                          JSON.stringify(log.result).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="glass-card p-6 flex flex-col h-full min-h-[300px] transition-all duration-300 select-none">
      <div className="flex justify-between items-center border-b border-[var(--border-muted)] pb-4 mb-4 transition-colors duration-300">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] transition-colors duration-300">
            Sensor Audit Logs Stream
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-widest transition-colors duration-300">
            Real-time SQLite transaction feed
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-[#0EA5E9] bg-[#0EA5E9]/5 border border-[#0EA5E9]/15 px-2.5 py-1 rounded-full font-semibold">
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
          className="flex-1 bg-[var(--bg-obsidian)]/30 border border-[var(--border-muted)] rounded-lg px-3 py-1.5 text-[10px] placeholder:text-[var(--text-muted)]/40 text-[var(--text-primary)] outline-none focus:border-[#0EA5E9]/40 transition-all duration-300"
        />
        <div className="flex items-center gap-1.5">
          <button
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

      {/* Main Logs Stream Container */}
      <div className="flex-1 overflow-y-auto space-y-3 max-h-[280px] pr-1 scroll-smooth">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-[var(--text-muted)] py-12 gap-3 transition-colors duration-300">
            <div className="wave-container">
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
            </div>
            <span>Reading Audit Databases...</span>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-[var(--text-muted)] py-12 text-center transition-colors duration-300">
            <span className="h-2 w-2 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444] mb-2" />
            <span className="font-semibold text-[var(--text-primary)] transition-colors duration-300">{error}</span>
            <p className="text-[9px] text-[var(--text-muted)]/60 mt-1 max-w-[200px] transition-colors duration-300">
              FastAPI backend is offline. Run uvicorn server on port 8000 to stream live scans.
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-[var(--text-muted)] py-12 text-center transition-colors duration-300">
            <svg className="h-8 w-8 text-[var(--text-muted)]/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium text-[var(--text-primary)] transition-colors duration-300">No matching logs found</span>
            <p className="text-[9px] text-[var(--text-muted)]/60 mt-1 max-w-[220px] transition-colors duration-300">
              Adjust your search text or status severity filters.
            </p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const date = new Date(log.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const isSuccess = log.status === "success";

            return (
              <div 
                key={index}
                className="flex flex-col gap-2 p-3 bg-[var(--bg-obsidian)]/10 rounded-lg border border-[var(--border-muted)] hover:border-[var(--text-muted)]/20 transition-all duration-200 fade-in"
              >
                {/* Header Row */}
                <div className="flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`h-1.5 w-1.5 rounded-full`}
                      style={{ 
                        backgroundColor: isSuccess ? "var(--color-emerald)" : "var(--color-crimson)",
                        boxShadow: `0 0 6px ${isSuccess ? "var(--color-emerald)" : "var(--color-crimson)"}`
                      }}
                    />
                    <span className="font-mono font-bold text-[var(--text-primary)] transition-colors duration-300">{log.tool_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[var(--text-muted)] font-mono text-[9px] transition-colors duration-300">
                    <span>{log.execution_time_ms} ms</span>
                    <span>{timeStr}</span>
                  </div>
                </div>

                {/* Parameters and Result Block */}
                <div className="bg-[var(--bg-obsidian)]/30 border border-[var(--border-muted)] rounded p-2 font-mono text-[9px] text-[var(--text-primary)]/80 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-24 transition-all duration-300">
                  <div>
                    <span className="text-[#0EA5E9]">Args:</span> {JSON.stringify(log.arguments)}
                  </div>
                  <div className="mt-1">
                    <span className={isSuccess ? "text-[#10B981]" : "text-[#EF4444]"}>
                      {isSuccess ? "Result:" : "Error:"}
                    </span>{" "}
                    {typeof log.result === "string" ? log.result.trim() : JSON.stringify(log.result)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-[var(--border-muted)] pt-3.5 mt-4 text-[9px] text-[var(--text-muted)] flex justify-between items-center transition-colors duration-300 flex-shrink-0">
        <span>SQLITE AUDITING: soc_dashboard.db</span>
        <span>STREAM FEED STABLE</span>
      </div>
    </div>
  );
}
