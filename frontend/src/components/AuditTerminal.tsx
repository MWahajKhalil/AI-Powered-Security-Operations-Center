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

    // Fast polling (every 2.5 seconds) for real-time terminal updates
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
    <div className="h-full w-full bg-[#05080C] border border-white/5 rounded-lg flex flex-col font-mono shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="bg-[#0C121A] px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mac style control bullets */}
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF0055]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFB300]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#00F5A0]/70" />
          <span className="text-[10px] text-[#8F9CAE] ml-2 tracking-wider font-bold">
            SECURE AUDIT TERMINAL v1.0.0
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] text-[#00F5A0] bg-[#00F5A0]/5 border border-[#00F5A0]/15 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
          <span className="h-1 w-1 rounded-full bg-[#00F5A0] animate-ping" />
          <span>Tty1 Active</span>
        </div>
      </div>

      {/* Terminal Monospace Stream Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs leading-relaxed text-[#00F5A0] selection:bg-[#00F5A0]/20 selection:text-white">
        {/* Startup banner */}
        <div className="text-white/40 border-b border-white/5 pb-2 mb-2 text-[10px]">
          <div>============================================================</div>
          <div>SOC TERMINAL: LISTENING ON StdIO JSON-RPC INGRESS STREAMS</div>
          <div>DAEMON PID: 12576 | SQLite AUDITING TARGET ACTIVE</div>
          <div>============================================================</div>
        </div>

        {/* Dynamic logs streams */}
        {logs.length === 0 ? (
          <div className="text-white/30 text-[10px]">
            {error ? (
              <div className="text-[#FF0055] font-bold">
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
                <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-white/50">
                  <span className="text-[#00F2FE]">analyst@soc-terminal:~$</span>
                  <span>[{timeStr}]</span>
                  <span className="text-white/80">executing tool:</span>
                  <span className="text-white font-bold">{log.tool_name}</span>
                  <span className="text-white/40">...</span>
                  <span 
                    className={`font-bold ${isSuccess ? "text-[#00F5A0]" : "text-[#FF0055]"}`}
                  >
                    {isSuccess ? "SUCCESS" : "FAILED"} ({log.execution_time_ms}ms)
                  </span>
                </div>

                {/* Subprocess JSON arguments */}
                <div className="pl-4 text-[10px] text-[#00F2FE]/80 font-mono">
                  <span>INPUTS:</span> {JSON.stringify(log.arguments)}
                </div>

                {/* Subprocess Output data */}
                <div className="pl-4 text-[10px] text-white/95 font-mono leading-relaxed bg-[#080C14]/50 border-l border-[#00F5A0]/25 py-1 px-2 overflow-x-auto max-w-full">
                  <span className="text-white/40 mr-1">$ stdout &gt;</span>
                  {typeof log.result === "string" ? log.result.trim() : JSON.stringify(log.result, null, 2)}
                </div>
              </div>
            );
          })
        )}

        {/* Cursor indicator */}
        {logs.length > 0 && (
          <div className="text-[10px] text-white/30 pt-1 flex items-center gap-1.5">
            <span className="text-[#00F2FE]">analyst@soc-terminal:~$</span>
            <span className="h-3 w-1.5 bg-[#00F5A0] animate-pulse" />
          </div>
        )}

        {/* Anchor for auto scroll */}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
