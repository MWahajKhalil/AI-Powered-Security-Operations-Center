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

interface ThreatIntelChatProps {
  initialQuery?: string;
  onQueryHandled?: () => void;
  onNavigate?: (view: "launchpad" | "radar" | "audits" | "sandbox" | "chat") => void;
}

export default function ThreatIntelChat({ initialQuery, onQueryHandled, onNavigate }: ThreatIntelChatProps = {}) {
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

  const submitQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    setMessages((prev) => [...prev, { sender: "analyst", text: queryText }]);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: queryText }),
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload.success && payload.data) {
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

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    await submitQuery(userMessage);
  };

  // Effect to handle incoming initial queries (e.g. from Bulletins Board)
  useEffect(() => {
    if (initialQuery) {
      submitQuery(initialQuery);
      onQueryHandled?.();
    }
  }, [initialQuery]);

  // Helper: Click-to-investigate security badges
  const handleTokenInvestigate = (token: string) => {
    const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(token);
    const isHash = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{64}$/.test(token);
    let query = "";

    if (isIP) {
      query = `Summarize malicious activity for IP ${token}`;
    } else if (isHash) {
      query = `Scan file hash ${token}`;
    } else {
      query = `Check domain ${token}`;
    }
    
    setInput(query);
  };

  // Helper: Parse inline backtick code format
  const renderInlineCode = (text: string) => {
    const parts = text.split(/`([^`]+)`/g);
    if (parts.length === 1) return text;

    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return (
          <code 
            key={idx} 
            className="font-mono text-[9px] font-semibold bg-[var(--bg-obsidian)] border border-[var(--border-muted)] px-1 rounded mx-0.5 text-[#EC4899] select-all transition-colors duration-300"
          >
            {part}
          </code>
        );
      }
      return part;
    });
  };

  // Helper: Detect and split security tokens inside message lines
  const processInlineBadges = (line: string) => {
    const tokenRegex = /(\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b)|(\b[a-fA-F0-9]{64}\b|\b[a-fA-F0-9]{32}\b)|(\b[a-zA-Z0-9.-]+\.(?:com|org|net|xyz|top|cc|info|edu)\b)/gi;
    const parts = line.split(tokenRegex);
    if (parts.length === 1) return renderInlineCode(line);

    return parts.map((part, pIdx) => {
      if (!part) return null;

      const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(part);
      const isHash = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{64}$/.test(part);
      const isDomain = /^[a-zA-Z0-9.-]+\.(?:com|org|net|xyz|top|cc|info|edu)$/i.test(part);

      if (isIP || isHash || isDomain) {
        const typeLabel = isIP ? "IP" : isHash ? "Hash" : "Domain";
        const colorClass = isIP 
          ? "border-[#0EA5E9]/30 text-[#0EA5E9] bg-[#0EA5E9]/5 hover:bg-[#0EA5E9]/20" 
          : isHash 
            ? "border-[#EC4899]/30 text-[#EC4899] bg-[#EC4899]/5 hover:bg-[#EC4899]/20" 
            : "border-[#6366F1]/30 text-[#6366F1] bg-[#6366F1]/5 hover:bg-[#6366F1]/20";

        return (
          <span 
            key={pIdx} 
            onClick={() => handleTokenInvestigate(part)}
            className={`inline-flex items-center gap-1 cursor-pointer border rounded px-1.5 py-0.5 mx-0.5 font-mono text-[9px] font-bold select-all transition-all duration-200 ${colorClass}`}
            title={`Investigate ${typeLabel}: ${part}`}
          >
            <span className="text-[7px]">🔎</span>
            <span>{part}</span>
          </span>
        );
      }

      return renderInlineCode(part);
    });
  };

  // Main custom markdown-like renderer
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, lIdx) => {
      // Code block delimiters
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const fullCode = codeBlockContent.join("\n");
          codeBlockContent = [];
          
          elements.push(
            <div 
              key={`code-${lIdx}`} 
              className="my-3 border border-[var(--border-muted)] bg-[var(--bg-terminal)]/95 rounded-lg p-3.5 font-mono text-[9px] text-[var(--text-secondary)] relative group transition-all duration-300"
            >
              <button 
                type="button"
                onClick={() => navigator.clipboard.writeText(fullCode)}
                className="absolute right-2 top-2 px-2 py-1 rounded text-[8px] font-bold bg-[var(--bg-obsidian)] border border-[var(--border-muted)] hover:text-[var(--color-cyan)] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider"
              >
                Copy
              </button>
              <pre className="overflow-x-auto max-w-full leading-relaxed whitespace-pre">{fullCode}</pre>
            </div>
          );
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headers ###
      if (line.startsWith("###")) {
        elements.push(
          <h4 
            key={lIdx} 
            className="text-[11px] font-black uppercase tracking-wider text-[var(--color-cyan)] mt-4 mb-2 border-b border-[var(--border-muted)] pb-1 transition-colors duration-300"
          >
            {line.replace("###", "").trim()}
          </h4>
        );
        return;
      }

      // Headers ##
      if (line.startsWith("##")) {
        elements.push(
          <h3 
            key={lIdx} 
            className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] mt-5 mb-2.5 transition-colors duration-300"
          >
            {line.replace("##", "").trim()}
          </h3>
        );
        return;
      }

      // Bullet Lists
      if (line.trim().startsWith("*") || line.trim().startsWith("-")) {
        const cleanedLine = line.replace(/^[\s*-]+/, "").trim();
        elements.push(
          <div key={lIdx} className="flex gap-2 items-start pl-2 py-0.5 text-[11px]">
            <span className="text-[var(--color-cyan)] mt-1">•</span>
            <span className="flex-1 leading-relaxed text-[var(--text-secondary)]">{processInlineBadges(cleanedLine)}</span>
          </div>
        );
        return;
      }

      // Plain line
      if (!line.trim()) {
        elements.push(<div key={lIdx} className="h-1.5" />);
        return;
      }

      elements.push(
        <p key={lIdx} className="leading-relaxed py-0.5 text-[11px] text-[var(--text-secondary)]">
          {processInlineBadges(line)}
        </p>
      );
    });

    return elements;
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
              className={`flex gap-3 max-w-[95%] fade-in ${isAgent ? "" : "ml-auto justify-end"}`}
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
                  className={`border p-4 text-[var(--text-primary)] leading-relaxed overflow-x-auto whitespace-pre-wrap transition-colors duration-300 ${
                    isAgent 
                      ? "bg-[var(--bg-obsidian)]/20 border-[var(--border-muted)] rounded-2xl rounded-tl-none" 
                      : "bg-[var(--color-purple)]/10 border-[var(--color-purple)]/25 rounded-2xl rounded-tr-none"
                  }`}
                >
                  {isAgent ? renderMessageContent(msg.text) : msg.text}
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
                                className="h-1.5 w-1.5 rounded-full"
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

                {/* Dynamic Map Pivot Shortcut Button */}
                {isAgent && msg.toolsExecuted && msg.toolsExecuted.some(t => t.tool_name === "geoip_lookup" || t.tool_name === "detect_privilege_escalation" || t.tool_name === "summarize_malicious_activities") && onNavigate && (
                  <div className="mt-2.5 flex px-1">
                    <button
                      type="button"
                      onClick={() => onNavigate("radar")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 text-[#0EA5E9] hover:bg-[#0EA5E9]/15 hover:border-[#0EA5E9]/45 text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 hover:shadow-[0_0_8px_rgba(14,165,233,0.2)]"
                    >
                      <span>🗺️</span>
                      <span>Pivot to Threat Ingress Radar Map</span>
                    </button>
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
