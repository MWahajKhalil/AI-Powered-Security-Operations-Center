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
    <div className="glass-panel flex flex-col h-full overflow-hidden border border-white/5 bg-[#0D1420]/25 cyber-card">
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
                <div className="h-6 w-6 rounded-full bg-[#7F00FF]/15 border border-[#7F00FF]/40 flex items-center justify-center text-[10px] text-[#00F2FE] font-bold flex-shrink-0">
                  AI
                </div>
              )}

              {/* Message Bubble Block */}
              <div className="space-y-3 flex-1 max-w-full overflow-hidden">
                <div 
                  className={`border p-3 text-white/90 leading-relaxed overflow-x-auto whitespace-pre-wrap ${
                    isAgent 
                      ? "bg-white/2 border-white/5 rounded-2xl rounded-tl-none" 
                      : "bg-[#7F00FF]/10 border-[#7F00FF]/25 rounded-2xl rounded-tr-none"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Nested Tool Execution Logs Cards */}
                {isAgent && msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                  <div className="space-y-2 pl-2 border-l-2 border-[#00F2FE]/20">
                    <p className="text-[9px] uppercase tracking-wider text-[#8F9CAE] font-bold">
                      Audited Tool Interactions:
                    </p>
                    {msg.toolsExecuted.map((tool, tIdx) => {
                      const isSuccess = tool.status === "success";
                      return (
                        <div 
                          key={tIdx}
                          className="border border-white/5 bg-white/2 rounded-lg p-2.5 text-[10px] flex flex-col gap-2 hover:border-[#00F2FE]/20 transition-colors"
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
                              <span className="font-mono font-bold text-white/90">{tool.tool_name}</span>
                            </div>
                            <span 
                              className={`font-bold font-mono text-[9px] ${isSuccess ? "text-[#00F5A0]" : "text-[#FF0055]"}`}
                            >
                              {isSuccess ? "SUCCESS" : "FAILED"} ({tool.execution_time_ms}ms)
                            </span>
                          </div>
                          <div className="bg-black/25 p-1.5 rounded font-mono text-[9px] text-[#8F9CAE] leading-relaxed overflow-x-auto max-h-16">
                            <div><span className="text-[#00F2FE]">Args:</span> {JSON.stringify(tool.arguments)}</div>
                            <div className="mt-0.5"><span className="text-white/80">Resp &gt;</span> {typeof tool.result === "string" ? tool.result.trim() : JSON.stringify(tool.result)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Logo Badge (Analyst) */}
              {!isAgent && (
                <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/70 font-bold flex-shrink-0">
                  AN
                </div>
              )}
            </div>
          );
        })}

        {/* Loading / Agent thinking wave */}
        {loading && (
          <div className="flex gap-3 max-w-[80%] fade-in">
            <div className="h-6 w-6 rounded-full bg-[#7F00FF]/15 border border-[#7F00FF]/40 flex items-center justify-center text-[10px] text-[#00F2FE] font-bold flex-shrink-0 animate-pulse">
              AI
            </div>
            <div className="bg-white/2 border border-white/5 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-3 text-xs text-[#8F9CAE]">
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
      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-black/10 flex gap-3 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={loading ? "Agent is reasoning about logs..." : "Ask secure diagnostics check (e.g. 'Is domain malicious-tracker.xyz safe?')..."}
          disabled={loading}
          className="flex-1 bg-black/25 border border-white/5 rounded-lg px-4 text-xs placeholder:text-white/30 text-white outline-none focus:border-[#00F2FE]/40 transition-colors disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#7F00FF]/20 border border-[#7F00FF]/30 text-[#00F2FE] hover:bg-[#7F00FF]/35 transition-colors uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Scanning..." : "Investigate"}
        </button>
      </form>
    </div>
  );
}
