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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/logs?limit=10", {
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

  return (
    <div className="glass-card cyber-card p-6 flex flex-col h-full border border-white/5 bg-[#0D1420]/45 min-h-[300px]">
      <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Sensor Audit Logs Stream
          </h3>
          <p className="text-[10px] text-[#8F9CAE] mt-0.5 uppercase tracking-widest">
            Real-time SQLite transaction feed
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-[#00F2FE] bg-[#00F2FE]/5 border border-[#00F2FE]/15 px-2.5 py-1 rounded-full font-semibold">
          <span className="h-1 w-1 rounded-full bg-[#00F2FE] shadow-[0_0_6px_#00F2FE] animate-ping" />
          <span>Live Listening</span>
        </div>
      </div>

      {/* Main Logs Stream Container */}
      <div className="flex-1 overflow-y-auto space-y-3 max-h-[380px] pr-1 scroll-smooth">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-[#8F9CAE] py-12 gap-3">
            <div className="wave-container">
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
            </div>
            <span>Reading Audit Databases...</span>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-[#8F9CAE] py-12 text-center">
            <span className="h-2 w-2 rounded-full bg-[#FF0055] shadow-[0_0_8px_#FF0055] mb-2" />
            <span className="font-semibold text-white/90">{error}</span>
            <p className="text-[9px] text-[#8F9CAE]/60 mt-1 max-w-[200px]">
              FastAPI backend is offline. Run uvicorn server on port 8000 to stream live scans.
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-[#8F9CAE] py-12 text-center">
            <svg className="h-8 w-8 text-white/10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium text-white/70">No logs found in SQLite</span>
            <p className="text-[9px] text-[#8F9CAE]/60 mt-1 max-w-[220px]">
              Audit table is initialized. Initiate a Threat Hunt to trigger background tool scans!
            </p>
          </div>
        ) : (
          logs.map((log, index) => {
            const date = new Date(log.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const isSuccess = log.status === "success";

            return (
              <div 
                key={index}
                className="flex flex-col gap-2 p-3 bg-white/2 rounded-lg border border-white/5 hover:border-white/10 transition-colors duration-200 fade-in"
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
                    <span className="font-mono font-bold text-white/95">{log.tool_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#8F9CAE] font-mono text-[9px]">
                    <span>{log.execution_time_ms} ms</span>
                    <span>{timeStr}</span>
                  </div>
                </div>

                {/* Parameters and Result Block */}
                <div className="bg-black/20 border border-white/5 rounded p-2 font-mono text-[9px] text-white/70 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-24">
                  <div>
                    <span className="text-[#00F2FE]">Args:</span> {JSON.stringify(log.arguments)}
                  </div>
                  <div className="mt-1">
                    <span className={isSuccess ? "text-[#00F5A0]" : "text-[#FF0055]"}>
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

      <div className="border-t border-white/5 pt-3.5 mt-4 text-[9px] text-[#8F9CAE] flex justify-between items-center">
        <span>SQLITE AUDITING: soc_dashboard.db</span>
        <span>STREAM FEED STABLE</span>
      </div>
    </div>
  );
}
