"use client";

import React, { useState, useRef, useEffect } from "react";

interface ToolExecutionLog {
  timestamp: string;
  tool_name: string;
  arguments: Record<string, any>;
  result: any;
  execution_time_ms: number;
  status: "success" | "failure";
}

interface Message {
  sender: "analyst" | "agent";
  text: string;
  toolsExecuted?: ToolExecutionLog[];
}

export default function ThreatIntelChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "agent",
      text: "System secure connection verified. The Model Context Protocol layers are listening on background stdio channels.\n\nI can execute reputation scans, WHOIS domain registers, GeoIP checks, and system diagnostics. What target shall we investigate?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat log to bottom
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Append Analyst query to chat list
    setMessages((prev) => [...prev, { sender: "analyst", text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload.success && payload.data) {
          // Append dynamic AI Response
          setMessages((prev) => [
            ...prev,
            {
              sender: "agent",
              text: payload.data.response,
              toolsExecuted: payload.data.tools_executed,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "agent",
              text: `### Agent Error\nFailed to complete reasoning: ${payload.error || "Unknown API response structural error"}`,
            },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "agent",
            text: "### Daemon Connection Error\nFastAPI orchestrator failed to respond. Check if your backend server is running on port 8000.",
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: "### Network Ingress Blocked\nFailed to establish connection to backend daemon. Please verify that the uvicorn process is listening on `127.0.0.1:8000`.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden select-none transition-all duration-300">
      {/* Dialogue Stream Container */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
        {messages.map((msg, index) => {
          const isAgent = msg.sender === "agent";

          return (
            <div 
              key={index}
              className={`flex gap-3 max-w-[90%] fade-in ${isAgent ? "" : "ml-auto justify-end"}`}
            >
              {/* Left Logo Badge (Agent) */}
              {isAgent && (
                <div className="h-6 w-6 rounded-full bg-[var(--color-purple)]/15 border border-[var(--color-purple)]/30 text-[var(--color-cyan)] flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors duration-300">
                  AI
                </div>
              )}

              {/* Message Bubble Block */}
              <div className="space-y-3 flex-1 max-w-full overflow-hidden">
                <div 
                  className={`border p-3 text-[var(--text-primary)] leading-relaxed overflow-x-auto whitespace-pre-wrap transition-colors duration-300 ${
                    isAgent 
                      ? "bg-[var(--bg-obsidian)]/20 border-[var(--border-muted)] rounded-2xl rounded-tl-none" 
                      : "bg-[var(--color-purple)]/10 border-[var(--color-purple)]/25 rounded-2xl rounded-tr-none"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Nested Tool Execution Logs Cards */}
                {isAgent && msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                  <div className="space-y-2 pl-2 border-l-2 border-[var(--color-cyan)]/25 transition-colors duration-300">
                    <p className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-bold transition-colors duration-300">
                      Audited Tool Interactions:
                    </p>
                    {msg.toolsExecuted.map((tool, tIdx) => {
                      const isSuccess = tool.status === "success";
                      return (
                        <div 
                          key={tIdx}
                          className="border border-[var(--border-muted)] bg-[var(--bg-obsidian)]/10 rounded-lg p-2.5 text-[10px] flex flex-col gap-2 hover:border-[var(--color-cyan)]/20 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span 
                                className={`h-1.5 w-1.5 rounded-full`}
                                style={{ 
                                  backgroundColor: isSuccess ? "var(--color-emerald)" : "var(--color-crimson)",
                                  boxShadow: `0 0 6px ${isSuccess ? "var(--color-emerald)" : "var(--color-crimson)"}`
                                }}
                              />
                              <span className="font-mono font-bold text-[var(--text-primary)] transition-colors duration-300">{tool.tool_name}</span>
                            </div>
                            <span 
                              className={`font-bold font-mono text-[9px] transition-colors duration-300 ${isSuccess ? "text-[var(--color-emerald)]" : "text-[var(--color-crimson)]"}`}
                            >
                              {isSuccess ? "SUCCESS" : "FAILED"} ({tool.execution_time_ms}ms)
                            </span>
                          </div>
                          <div className="bg-[var(--bg-obsidian)]/30 p-1.5 rounded font-mono text-[9px] text-[var(--text-muted)] leading-relaxed overflow-x-auto max-h-16 transition-colors duration-300">
                            <div><span className="text-[var(--color-cyan)] transition-colors duration-300">Args:</span> {JSON.stringify(tool.arguments)}</div>
                            <div className="mt-0.5"><span className="text-[var(--text-primary)]/80 transition-colors duration-300">Resp &gt;</span> {typeof tool.result === "string" ? tool.result.trim() : JSON.stringify(tool.result)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Logo Badge (Analyst) */}
              {!isAgent && (
                <div className="h-6 w-6 rounded-full bg-[var(--bg-obsidian)]/10 border border-[var(--border-muted)] flex items-center justify-center text-[10px] text-[var(--text-muted)] font-bold flex-shrink-0 transition-colors duration-300">
                  AN
                </div>
              )}
            </div>
          );
        })}

        {/* Loading / Agent thinking wave */}
        {loading && (
          <div className="flex gap-3 max-w-[80%] fade-in">
            <div className="h-6 w-6 rounded-full bg-[var(--color-purple)]/15 border border-[var(--color-purple)]/30 text-[var(--color-cyan)] flex items-center justify-center text-[10px] font-bold flex-shrink-0 animate-pulse transition-colors duration-300">
              AI
            </div>
            <div className="bg-[var(--bg-obsidian)]/20 border border-[var(--border-muted)] rounded-2xl rounded-tl-none p-3.5 flex items-center gap-3 text-xs text-[var(--text-muted)] transition-colors duration-300">
              <span>Agent Thinking</span>
              <div className="wave-container">
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Unified Input Control Bar */}
      <form onSubmit={handleSend} className="p-4 border-t border-[var(--border-muted)] bg-[var(--bg-obsidian)]/20 flex gap-3 flex-shrink-0 transition-all duration-300">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={loading ? "Agent is reasoning about logs..." : "Ask secure diagnostics check (e.g. 'Is domain malicious-tracker.xyz safe?')..."}
          disabled={loading}
          className="flex-1 bg-[var(--bg-obsidian)]/30 border border-[var(--border-muted)] rounded-lg px-4 text-xs placeholder:text-[var(--text-muted)]/30 text-[var(--text-primary)] outline-none focus:border-[var(--color-cyan)]/45 transition-all duration-300 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[var(--color-purple)]/20 border border-[var(--color-purple)]/30 text-[var(--color-cyan)] hover:bg-[var(--color-purple)]/35 transition-all duration-200 uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Scanning..." : "Investigate"}
        </button>
      </form>
    </div>
  );
}
