"use client";

import React from "react";

interface ToolExecutionLog {
  timestamp: string;
  tool_name: string;
  arguments: Record<string, any>;
  result: any;
  execution_time_ms: number;
  status: "success" | "failure";
}

interface AgentPipelineProps {
  lastQuery?: string;
  executedTools?: ToolExecutionLog[];
  loading?: boolean;
}

export default function AgentPipeline({ lastQuery = "", executedTools = [], loading = false }: AgentPipelineProps) {
  // Safe default mock traces for visual presentation when idle
  const mockTools: ToolExecutionLog[] = [
    {
      timestamp: new Date().toISOString(),
      tool_name: "geoip_lookup",
      arguments: { ip: "1.1.1.1" },
      result: { success: true, city: "Brisbane", country: "Australia", lat: -27.47, lon: 153.02 },
      execution_time_ms: 124,
      status: "success"
    },
    {
      timestamp: new Date().toISOString(),
      tool_name: "scan_common_ports",
      arguments: { ip: "1.1.1.1" },
      result: { success: true, open_ports: [80, 8080], scanned_ports: 10 },
      execution_time_ms: 285,
      status: "success"
    }
  ];

  const activeQuery = lastQuery || "Summarize malicious activity for IP 1.1.1.1";
  const activeTools = executedTools.length > 0 ? executedTools : (lastQuery ? [] : mockTools);

  return (
    <div className="glass-card p-6 flex flex-col h-full min-h-[380px] transition-all duration-300 select-none overflow-hidden">
      {/* Header section */}
      <div className="flex justify-between items-center border-b border-[var(--border-muted)] pb-4 mb-4 flex-shrink-0 transition-colors duration-300">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] transition-colors duration-300">
            AI Agent Reasoning Trace Pipeline
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-widest transition-colors duration-300">
            Real-time Chain-of-Thought Auditing (APM Trace)
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-[#6366F1] bg-[#6366F1]/5 border border-[#6366F1]/15 px-2.5 py-1 rounded-full font-semibold transition-colors duration-300">
          <span className="h-1 w-1 rounded-full bg-[#6366F1] animate-ping" />
          <span>Ingress Observability</span>
        </div>
      </div>

      {/* Main Timeline Stream */}
      <div className="flex-1 overflow-y-auto max-h-[360px] pr-2 space-y-4 font-mono text-[10px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-xs text-[var(--text-muted)] py-20 gap-3">
            <div className="wave-container">
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider">AI AGENT REASONING IN PROGRESS...</span>
          </div>
        ) : (
          <div className="relative border-l-2 border-[var(--border-muted)] ml-3 pl-6 space-y-6">
            
            {/* Step 1: Inbound Prompt Prompt Ingress */}
            <div className="relative fade-in">
              {/* Dot marker */}
              <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border border-[#0EA5E9] bg-[var(--bg-panel)] flex items-center justify-center shadow-[0_0_8px_#0EA5E9]/30">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9]" />
              </span>
              <div className="space-y-1">
                <span className="text-[8px] uppercase font-black text-[#0EA5E9] tracking-wider">01. INBOUND WORKSPACE PROMPT</span>
                <div className="bg-[var(--bg-obsidian)]/40 border border-[var(--border-muted)] rounded-lg p-2.5 text-[10px] text-[var(--text-secondary)] leading-relaxed">
                  &quot;{activeQuery}&quot;
                </div>
              </div>
            </div>

            {/* Step 2: Intent semantic Router Analysis */}
            <div className="relative fade-in">
              <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border border-[#6366F1] bg-[var(--bg-panel)] flex items-center justify-center shadow-[0_0_8px_#6366F1]/30">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6366F1]" />
              </span>
              <div className="space-y-1">
                <span className="text-[8px] uppercase font-black text-[#6366F1] tracking-wider">02. SEMANTIC INTENT ROUTING</span>
                <div className="bg-[var(--bg-obsidian)]/40 border border-[var(--border-muted)] rounded-lg p-2.5 text-[9px] text-[var(--text-muted)] space-y-1">
                  <div><span className="text-[var(--text-secondary)] font-bold">Vector Intent:</span> Security Diagnostics & Correlation</div>
                  <div><span className="text-[var(--text-secondary)] font-bold">Subprocess Pipeline:</span> Local semantic rule mapping triggered</div>
                </div>
              </div>
            </div>

            {/* Step 3: MCP Tool executions Trace */}
            <div className="relative fade-in">
              <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border border-[#EC4899] bg-[var(--bg-panel)] flex items-center justify-center shadow-[0_0_8px_#EC4899]/30">
                <span className="h-1.5 w-1.5 rounded-full bg-[#EC4899]" />
              </span>
              <div className="space-y-2">
                <span className="text-[8px] uppercase font-black text-[#EC4899] tracking-wider">03. MCP DEPLOYED DIAGNOSTICS ({activeTools.length})</span>
                
                {activeTools.length === 0 ? (
                  <div className="text-[9px] text-[var(--text-muted)]/50 italic pl-1">
                    No active MCP tool sweeps invoked. The agent resolved this query without external subprocess calls.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeTools.map((tool, idx) => {
                      const isSuccess = tool.status === "success";
                      return (
                        <div key={idx} className="border border-[var(--border-muted)] bg-[var(--bg-obsidian)]/60 rounded-lg p-2.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[var(--text-primary)]">{tool.tool_name}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${isSuccess ? "text-[var(--color-emerald)] bg-[var(--color-emerald)]/5" : "text-[var(--color-crimson)] bg-[var(--color-crimson)]/5"}`}>
                              {isSuccess ? "SUCCESS" : "FAILED"}
                            </span>
                          </div>
                          {/* Args */}
                          <div className="text-[8px] text-[var(--color-purple)]">
                            <span className="font-bold text-[var(--text-muted)]">ARGS:</span> {JSON.stringify(tool.arguments)}
                          </div>
                          {/* Latency */}
                          <div className="text-[8px] text-[var(--text-muted)]">
                            <span>RTT LATENCY:</span> <span className="text-[var(--text-secondary)] font-semibold">{tool.execution_time_ms} ms</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Executive synthesis */}
            <div className="relative fade-in">
              <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border border-[#10B981] bg-[var(--bg-panel)] flex items-center justify-center shadow-[0_0_8px_#10B981]/30">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              </span>
              <div className="space-y-1">
                <span className="text-[8px] uppercase font-black text-[#10B981] tracking-wider">04. SUMMARY SYNTHESIS & REPORT</span>
                <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-lg p-2.5 text-[9px] text-[var(--text-secondary)] leading-relaxed">
                  Reasoning complete. Generated unified threat profile, highlighted active risk levels, and output logs details correctly.
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--border-muted)] pt-3.5 mt-4 text-[9px] text-[var(--text-muted)] flex justify-between items-center transition-colors duration-300 flex-shrink-0">
        <span>TRACE PROTOCOL: STDIO JSON-RPC INGRESS</span>
        <span>AUDIT TRACE STABLE</span>
      </div>
    </div>
  );
}
