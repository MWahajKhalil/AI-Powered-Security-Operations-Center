"use client";

import React, { useEffect, useState, useRef } from "react";

interface ToolExecutionLog {
  timestamp: string;
  tool_name: string;
  arguments: Record<string, any>;
  result: any;
  execution_time_ms: number;
  status: "success" | "failure";
}

export default function AuditTerminal() {
  const [logs, setLogs] = useState<ToolExecutionLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/logs?limit=30", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const payload = await response.json();
        if (payload.success && Array.isArray(payload.data)) {
          // Sort chronologically (oldest to newest) to display like a terminal stream
          const sortedLogs = [...payload.data].reverse();
          setLogs(sortedLogs);
          setError(null);
        }
      } else {
        setError("SENSOR DISCONNECTED");
      }
    } catch (err) {
      setError("DAEMON OFFLINE");
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2500);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll to the bottom of the terminal on new logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div className="h-full w-full bg-[#0A0E17] border border-[var(--border-muted)] rounded-lg flex flex-col font-mono shadow-xl overflow-hidden transition-all duration-300">
      {/* Terminal Title Bar (VS Code Console style) */}
      <div className="bg-[var(--bg-panel)] px-4 py-2 border-b border-[var(--border-muted)] flex items-center justify-between transition-colors duration-300 select-none">
        <div className="flex items-center gap-2">
          {/* Flat macOS buttons */}
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-crimson)]/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-amber)]/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-emerald)]/50" />
          <span className="text-[9px] text-[var(--text-muted)] ml-2 tracking-widest font-extrabold uppercase transition-colors duration-300">
            SECURE AUDIT TERMINAL v1.0.0
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] text-[var(--color-cyan)] bg-[var(--color-cyan)]/5 border border-[var(--color-cyan)]/15 px-2 py-0.5 rounded uppercase tracking-wider font-bold transition-all">
          <span className="h-1 w-1 rounded-full bg-[var(--color-cyan)] animate-ping" />
          <span>Tty1 Active</span>
        </div>
      </div>

      {/* Terminal Monospace Stream Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs leading-relaxed text-[var(--text-secondary)] selection:bg-[#0EA5E9]/20 selection:text-white">
        {/* Startup banner */}
        <div className="text-[var(--text-muted)]/50 border-b border-[var(--border-muted)] pb-2 mb-2 text-[10px] transition-colors duration-300 select-none">
          <div>============================================================</div>
          <div>SOC TERMINAL: LISTENING ON StdIO JSON-RPC INGRESS STREAMS</div>
          <div>DAEMON PID: 12576 | SQLite AUDITING TARGET ACTIVE</div>
          <div>============================================================</div>
        </div>

        {/* Dynamic logs streams */}
        {logs.length === 0 ? (
          <div className="text-[var(--text-muted)]/40 text-[10px]">
            {error ? (
              <div className="text-[var(--color-crimson)] font-bold">
                [!] SYSTEM ERROR: {error}. BACKEND CONNECTION BLOCKED.
              </div>
            ) : (
              <div>
                analyst@soc-terminal:~$ [INFO] Waiting for agent tool invocations...
                <br />
                analyst@soc-terminal:~$ _
              </div>
            )}
          </div>
        ) : (
          logs.map((log, index) => {
            const date = new Date(log.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour12: false });
            const isSuccess = log.status === "success";

            return (
              <div key={index} className="space-y-1 fade-in">
                {/* Prompt Row */}
                <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-[var(--text-muted)]">
                  <span className="text-[var(--color-cyan)]">analyst@soc-terminal:~$</span>
                  <span>[{timeStr}]</span>
                  <span className="text-[var(--text-muted)]/80">executing tool:</span>
                  <span className="text-[var(--text-primary)] font-bold transition-colors duration-300">{log.tool_name}</span>
                  <span className="text-[var(--text-muted)]/40">...</span>
                  <span 
                    className={`font-bold transition-colors duration-300 ${isSuccess ? "text-[var(--color-emerald)]" : "text-[var(--color-crimson)]"}`}
                  >
                    {isSuccess ? "SUCCESS" : "FAILED"} ({log.execution_time_ms}ms)
                  </span>
                </div>

                {/* Subprocess JSON arguments */}
                <div className="pl-4 text-[10px] text-[var(--color-purple)] font-semibold transition-colors duration-300">
                  <span>INPUTS:</span> {JSON.stringify(log.arguments)}
                </div>

                {/* Subprocess Output data (Real stdout) */}
                <div 
                  className="pl-4 text-[10px] text-[var(--text-secondary)] font-mono leading-relaxed bg-[var(--bg-obsidian)] border-l py-1.5 px-3 overflow-x-auto max-w-full rounded transition-all duration-300"
                  style={{
                    borderLeftColor: isSuccess ? "var(--color-emerald)" : "var(--color-crimson)"
                  }}
                >
                  <span className="text-[var(--text-muted)]/40 mr-1 select-none">$ stdout &gt;</span>
                  {typeof log.result === "string" ? log.result.trim() : JSON.stringify(log.result, null, 2)}
                </div>
              </div>
            );
          })
        )}

        {/* Cursor indicator */}
        {logs.length > 0 && (
          <div className="text-[10px] text-[var(--text-muted)]/40 pt-1 flex items-center gap-1.5 select-none transition-colors duration-300">
            <span className="text-[var(--color-cyan)]">analyst@soc-terminal:~$</span>
            <span className="h-3 w-1.5 bg-[var(--color-cyan)] animate-pulse" />
          </div>
        )}

        {/* Anchor for auto scroll */}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
