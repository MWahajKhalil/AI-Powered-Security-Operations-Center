"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatusCard from "@/components/StatusCard";
import RecentLogs from "@/components/RecentLogs";
import ThreatChart from "@/components/ThreatChart";
import AuditTerminal from "@/components/AuditTerminal";
import ThreatIntelChat from "@/components/ThreatIntelChat";
import BulletinsBoard from "@/components/BulletinsBoard";
import ThreatMap from "@/components/ThreatMap";
import AgentPipeline from "@/components/AgentPipeline";
import SslInspector from "@/components/SslInspector";
import ReportGenerator from "@/components/ReportGenerator";
import CommandLaunchpad from "@/components/CommandLaunchpad";
import NetworkScanner from "@/components/NetworkScanner";
import ControlDrawer from "@/components/ControlDrawer";
import NetworkTopology from "@/components/NetworkTopology";


interface ThreatAdvisory {
  title: string;
  link: string;
  published: string;
  summary: string;
}

export default function Home() {
  const [activeView, setActiveView] = useState<"launchpad" | "radar" | "audits" | "sandbox" | "chat">("launchpad");
  const [threats, setThreats] = useState<ThreatAdvisory[]>([]);
  const [loadingThreats, setLoadingThreats] = useState<boolean>(true);
  const [chatQuery, setChatQuery] = useState("");

  // Control Drawer overlay state
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<"obsidian" | "cyberpunk" | "forest" | "silver">("obsidian");

  // Live Attack Simulation parameters
  const [activeSimulation, setActiveSimulation] = useState<"brute_force" | "sql_injection" | "ransomware" | "none">("none");
  const [riskScore, setRiskScore] = useState<number>(16.5);
  const [simulatedPins, setSimulatedPins] = useState<any[]>([]);
  const [simulatedLogs, setSimulatedLogs] = useState<any[]>([]);
  const [simulatedTerminalLogs, setSimulatedTerminalLogs] = useState<any[]>([]);

  // Sandbox tabs routing switcher
  const [sandboxTab, setSandboxTab] = useState<"ssl" | "network">("ssl");

  // Real-Time Health & Public IP resolution state
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [publicIp, setPublicIp] = useState<string>("Resolving...");

  // SQLite historical logs state
  const [dbLogs, setDbLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(true);
  const [ipGeoCache, setIpGeoCache] = useState<Record<string, any>>({});

  const applyTheme = (themeName: "obsidian" | "cyberpunk" | "forest" | "silver") => {
    const classes = ["theme-obsidian", "theme-cyberpunk", "theme-forest", "theme-silver"];
    classes.forEach(c => document.documentElement.classList.remove(c));
    document.documentElement.classList.add(`theme-${themeName}`);
  };

  const handleSelectTheme = (themeName: "obsidian" | "cyberpunk" | "forest" | "silver") => {
    setActiveTheme(themeName);
    localStorage.setItem("soc-theme", themeName);
    applyTheme(themeName);
  };

  // Sync theme with system localStorage on mounting
  useEffect(() => {
    const savedTheme = localStorage.getItem("soc-theme") as any;
    if (savedTheme && ["obsidian", "cyberpunk", "forest", "silver"].includes(savedTheme)) {
      setActiveTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const handleInvestigateBulletin = (query: string) => {
    setChatQuery(query);
    setActiveView("chat");
  };

  // Fetch live CISA Advisories on mount for homepage ticker
  const fetchThreats = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/threat-feed");
      if (response.ok) {
        const payload = await response.json();
        if (payload.success && payload.data && Array.isArray(payload.data.advisories)) {
          setThreats(payload.data.advisories);
        }
      }
    } catch (err) {
      console.warn("FastAPI offline or threat-feed endpoint unavailable.");
    } finally {
      setLoadingThreats(false);
    }
  };

  // Check backend health and status
  const checkHealth = async () => {
    try {
      const response = await fetch("http://localhost:8000/health", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch (err) {
      setBackendOnline(false);
    }
  };

  // Fetch actual database logs from SQLite
  const fetchDbLogs = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/logs?limit=50");
      if (response.ok) {
        const payload = await response.json();
        if (payload.success && Array.isArray(payload.data)) {
          setDbLogs(payload.data);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch SQLite database logs from backend.");
    } finally {
      setLoadingLogs(false);
    }
  };

  // Extract public IPs from database logs
  const extractIpsFromLogs = (logs: any[]): string[] => {
    const ips = new Set<string>();
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;

    logs.forEach(log => {
      // 1. Scan arguments stringified
      try {
        const argsStr = JSON.stringify(log.arguments);
        const matches = argsStr.match(ipRegex);
        if (matches) matches.forEach(ip => ips.add(ip));
      } catch (_) {}

      // 2. Scan result stringified
      try {
        const resStr = typeof log.result === "string" ? log.result : JSON.stringify(log.result);
        const matches = resStr.match(ipRegex);
        if (matches) matches.forEach(ip => ips.add(ip));
      } catch (_) {}
    });

    const isPublicIp = (ip: string) => {
      if (ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.")) return false;
      if (ip.startsWith("172.")) {
        const parts = ip.split(".");
        const secondPart = parseInt(parts[1], 10);
        if (secondPart >= 16 && secondPart <= 31) return false;
      }
      return true;
    };

    return Array.from(ips).filter(isPublicIp);
  };

  // Geolocate newly discovered IPs with rate-limiting
  useEffect(() => {
    const publicIps = extractIpsFromLogs(dbLogs);
    const uncachedIps = publicIps.filter(ip => !ipGeoCache[ip]);
    
    if (uncachedIps.length === 0) return;

    const geolocateIps = async () => {
      const newCache = { ...ipGeoCache };
      let updated = false;

      for (const ip of uncachedIps) {
        try {
          const res = await fetch(`http://ip-api.com/json/${ip}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "success") {
              newCache[ip] = {
                ip,
                lat: data.lat ?? 0.0,
                lon: data.lon ?? 0.0,
                locationName: `${data.city || "Unknown City"}, ${data.countryCode || data.country || "Unknown Country"}`,
                severity: "MEDIUM" as const,
                timestamp: "Real-Time Trace"
              };
              updated = true;
            }
          }
        } catch (err) {
          console.warn(`Failed to geolocate IP: ${ip}`, err);
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (updated) {
        setIpGeoCache(newCache);
      }
    };

    geolocateIps();
  }, [dbLogs, ipGeoCache]);

  // Compute map pins from geolocated database logs
  const parsedPins = React.useMemo(() => {
    const pins: any[] = [];
    const publicIps = extractIpsFromLogs(dbLogs);
    publicIps.forEach(ip => {
      if (ipGeoCache[ip]) {
        pins.push({ ...ipGeoCache[ip] });
      }
    });
    return pins;
  }, [dbLogs, ipGeoCache]);

  // Combine simulated pins and geolocated logs pins
  const combinedPins = React.useMemo(() => {
    const list = parsedPins.map(p => ({ ...p, isLatest: false }));
    if (activeSimulation !== "none") {
      simulatedPins.forEach(simPin => {
        if (!list.some(p => p.ip === simPin.ip)) {
          list.push({ ...simPin, isLatest: false });
        }
      });
      // Set the active simulation intrusion pin as the latest
      list.forEach(p => {
        if (p.timestamp === "SIMULATED INTRUSION") {
          p.isLatest = true;
        }
      });
    } else if (list.length > 0) {
      // First parsed pin represents the newest database log event
      list[0].isLatest = true;
    }
    return list;
  }, [activeSimulation, simulatedPins, parsedPins]);

  useEffect(() => {
    fetchThreats();

    // Fetch analyst public IP address
    const fetchPublicIp = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        if (response.ok) {
          const data = await response.json();
          if (data.ip) {
            setPublicIp(data.ip);
          }
        }
      } catch (err) {
        console.warn("Failed to retrieve public IP, setting fallback.");
        setPublicIp("192.168.1.1");
      }
    };

    fetchPublicIp();

    checkHealth();
    fetchDbLogs();

    const healthInterval = setInterval(checkHealth, 5000);
    const logsInterval = setInterval(fetchDbLogs, 4000);

    return () => {
      clearInterval(healthInterval);
      clearInterval(logsInterval);
    };
  }, []);

  // Handler to inject simulated attacks globally across all workspace views
  const handleTriggerSimulation = (attackType: "brute_force" | "sql_injection" | "ransomware" | "reset") => {
    if (attackType === "reset") {
      setActiveSimulation("none");
      setRiskScore(16.5);
      setSimulatedPins([]);
      setSimulatedLogs([]);
      setSimulatedTerminalLogs([]);
      return;
    }

    setActiveSimulation(attackType);
    const timestamp = new Date().toISOString();

    if (attackType === "brute_force") {
      setRiskScore(65.8);
      // Eastern Europe/Moscow Target Ingress
      setSimulatedPins([
        { ip: "185.156.74.12", lat: 55.75, lon: 37.61, locationName: "Moscow, RU", severity: "HIGH", timestamp: "SIMULATED INTRUSION" }
      ]);
      const mockLog = {
        timestamp,
        tool_name: "detect_privilege_escalation",
        arguments: { username: "admin", target_ip: "185.156.74.12" },
        result: "[WARNING] Auth failures burst. SSH repeated login bypass blocks triggered on root account from source IP 185.156.74.12.",
        execution_time_ms: 420,
        status: "failure" as const
      };
      setSimulatedLogs([mockLog]);
      setSimulatedTerminalLogs([mockLog]);
    } else if (attackType === "sql_injection") {
      setRiskScore(82.4);
      // East Asia/Beijing Target Ingress
      setSimulatedPins([
        { ip: "203.0.113.50", lat: 39.90, lon: 116.40, locationName: "Beijing, CN", severity: "CRITICAL", timestamp: "SIMULATED INTRUSION" }
      ]);
      const mockLog = {
        timestamp,
        tool_name: "summarize_malicious_activities",
        arguments: { scope: "sqlite_auth_db", query_fingerprint: "SELECT * FROM users WHERE username = 'admin' OR '1'='1'" },
        result: "[ALERT] SQL injection pattern match: admin bypass union statement blocked inside SQLite auth logger.",
        execution_time_ms: 680,
        status: "failure" as const
      };
      setSimulatedLogs([mockLog]);
      setSimulatedTerminalLogs([mockLog]);
    } else if (attackType === "ransomware") {
      setRiskScore(98.1);
      // Eastern Europe/Kyiv Target Ingress
      setSimulatedPins([
        { ip: "198.51.100.80", lat: 50.45, lon: 30.52, locationName: "Kyiv, UA", severity: "CRITICAL", timestamp: "SIMULATED INTRUSION" }
      ]);
      const mockLog = {
        timestamp,
        tool_name: "check_ssl_expiry",
        arguments: { target_host: "secure-beacon.c2server.net", port: 443 },
        result: "[CRITICAL] Outbound TLS heartbeat anomaly detected to beacon.c2server.net. Suspected active corporate ransomware beacon payload.",
        execution_time_ms: 950,
        status: "failure" as const
      };
      setSimulatedLogs([mockLog]);
      setSimulatedTerminalLogs([mockLog]);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-obsidian)] text-[var(--text-primary)] relative transition-colors duration-300">
      {/* 1. Sidebar Left Dock */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* 2. Content Area Right */}
      <div className="flex-1 flex flex-col h-full overflow-hidden z-10">
        {/* Top Control Header */}
        <Header 
          activeView={activeView === "chat" ? "chat" : "dashboard"} 
          onToggleControls={() => setIsControlsOpen(true)} 
          backendOnline={backendOnline}
        />

        {/* Dynamic Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--bg-obsidian)] relative transition-colors duration-300">
          
          {/* Global Running Live Alerts Ticker */}
          {activeView !== "chat" && (
            <div className="glass-card px-4 py-2 border-l-4 border-l-[#EF4444] bg-slate-500/5 mb-6 relative overflow-hidden flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center text-[10px]">
                <span className="text-[9px] text-[var(--color-crimson)] font-extrabold uppercase tracking-widest bg-[var(--color-crimson)]/5 border border-[var(--color-crimson)]/25 px-2 py-0.5 rounded flex-shrink-0 transition-all duration-300">
                  CISA Active Bulletins:
                </span>
                
                <div className="flex-1 w-full overflow-hidden relative h-5 flex items-center">
                  {loadingThreats ? (
                    <span className="text-[var(--text-muted)]/60 animate-pulse font-mono text-[9px] uppercase tracking-wider">
                      Synchronizing global security ingest advisories...
                    </span>
                  ) : threats.length === 0 ? (
                    <span className="text-[var(--text-muted)] font-mono text-[9px]">
                      Feed offline. Launch uvicorn daemon to stream real-time cybersecurity campaign warnings.
                    </span>
                  ) : (
                    <div className="absolute w-full whitespace-nowrap animate-marquee flex items-center gap-8 text-[10px]">
                      {threats.map((t, idx) => (
                        <a 
                          key={idx}
                          href={t.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--text-secondary)] hover:text-[var(--color-cyan)] transition-colors inline-flex items-center gap-1.5 group"
                        >
                          <span className="text-[var(--color-crimson)] font-extrabold">🚨 [ALERT]</span>
                          <span className="font-bold underline decoration-dotted decoration-[var(--border-muted)] group-hover:decoration-[var(--color-cyan)]">{t.title}</span>
                          <span className="text-[9px] text-[var(--text-muted)] font-mono">({t.published.split(" ")[1]} {t.published.split(" ")[2]})</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Workspace 0: Central Command Launchpad Overview */}
          {activeView === "launchpad" && (
            <CommandLaunchpad
              onNavigate={(view) => setActiveView(view)}
              riskScore={riskScore}
            />
          )}

          {/* Workspace 1: Threat Radar Visual Mappings */}
          {activeView === "radar" && (
            <div className="flex flex-col gap-6 fade-in">
              {/* Glass Header Info Card */}
              <div className="glass-card p-6 border-l-4 border-l-[#0EA5E9] bg-slate-500/5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 z-10 relative">
                  <div>
                    <h2 className="text-sm font-extrabold tracking-wider text-[var(--text-primary)] transition-colors duration-300">
                      THREAT INGRESS SPATIAL RADAR
                    </h2>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed max-w-2xl transition-colors duration-300">
                      Visualizing real-time coordinate lookups mapped from live SQLite database logs side-by-side with 7-day scan timelines.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5 text-[var(--color-cyan)] text-[9px] font-bold uppercase tracking-wider self-start md:self-auto transition-all duration-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_8px_var(--color-cyan)] animate-pulse" />
                    <span>Radar Sweep Synced</span>
                  </div>
                </div>
              </div>

              {/* Grid of Glowing Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusCard 
                  title="Severity Alert Index" 
                  value={activeSimulation !== "none" ? riskScore.toFixed(1) : "16.5"} 
                  color={activeSimulation !== "none" ? "crimson" : "cyan"} 
                  statusText={activeSimulation !== "none" ? `${activeSimulation.toUpperCase()} Active` : "Normal Operations"}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                />
                <StatusCard 
                  title="Active Sensor Networks" 
                  value={activeSimulation !== "none" ? "Ingress Warning" : "2 Connected"} 
                  color={activeSimulation !== "none" ? "crimson" : "cyan"} 
                  statusText="Net-Analysis & Threat-Intel"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                />
                <StatusCard 
                  title="Database Log Audits" 
                  value={activeSimulation !== "none" ? "Alert Logged" : "Online"} 
                  color={activeSimulation !== "none" ? "crimson" : "emerald"} 
                  statusText="SQLite Synced & listening"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  }
                />
              </div>

              {/* Threat Radar Visual Elements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Geolocator Map */}
                <ThreatMap activePins={combinedPins} />
                
                {/* Right Column: Stacked Topology Infrastructure and Trend Chart */}
                <div className="flex flex-col gap-6">
                  <NetworkTopology 
                    activeSimulation={activeSimulation} 
                    backendOnline={backendOnline}
                    publicIp={publicIp}
                  />
                  <ThreatChart riskScore={riskScore} logs={dbLogs} />
                </div>
              </div>
            </div>
          )}

          {/* Workspace 2: Sensor Audits logs & bulletins */}
          {activeView === "audits" && (
            <div className="flex flex-col gap-6 fade-in">
              {/* Glass Header Info Card */}
              <div className="glass-card p-6 border-l-4 border-l-[#EC4899] bg-slate-500/5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 z-10 relative">
                  <div>
                    <h2 className="text-sm font-extrabold tracking-wider text-[var(--text-primary)] transition-colors duration-300">
                      SENSOR TRANSACTIONS AUDITING STATION
                    </h2>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed max-w-2xl transition-colors duration-300">
                      Audit incoming SQLite subprocess diagnostics chronologically, backed by live security warning feeds dynamically parsed from the CISA bulletins board.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-magenta)]/20 bg-[var(--color-magenta)]/5 text-[var(--color-magenta)] text-[9px] font-bold uppercase tracking-wider self-start md:self-auto transition-all duration-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)] shadow-[0_0_8px_var(--color-magenta)] animate-pulse" />
                    <span>Sensor Logs Connected</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BulletinsBoard 
                  bulletins={threats}
                  loading={loadingThreats}
                  onInvestigate={handleInvestigateBulletin}
                />
                <RecentLogs simulatedLogs={simulatedLogs} logs={dbLogs} loading={loadingLogs} />
              </div>
            </div>
          )}

          {/* Workspace 3: Secure Sandbox Cryptography & brief compilers */}
          {activeView === "sandbox" && (
            <div className="flex flex-col gap-6 fade-in">
              {/* Glass Header Info Card */}
              <div className="glass-card p-6 border-l-4 border-l-[#6366F1] bg-slate-500/5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 z-10 relative">
                  <div>
                    <h2 className="text-sm font-extrabold tracking-wider text-[var(--text-primary)] transition-colors duration-300">
                      SECURE DIAGNOSTIC TESTING SANDBOX
                    </h2>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed max-w-2xl transition-colors duration-300">
                      Inspect remote TLS socket cryptographic expiries or compile detailed incident brief markdown summaries easily.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-purple)]/20 bg-[var(--color-purple)]/5 text-[var(--color-purple)] text-[9px] font-bold uppercase tracking-wider self-start md:self-auto transition-all duration-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-purple)] shadow-[0_0_8px_var(--color-purple)] animate-pulse" />
                    <span>Sandbox Auditing Ready</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-6">
                  {/* Glassmorphic Vercel-style Sandbox Switcher */}
                  <div className="grid grid-cols-2 gap-2 bg-[var(--bg-obsidian)]/40 p-1.5 rounded-lg border border-[var(--border-muted)] max-w-xs select-none flex-shrink-0">
                    <button
                      onClick={() => setSandboxTab("ssl")}
                      className={`py-1.5 rounded text-[8.5px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                        sandboxTab === "ssl"
                          ? "bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/20 shadow-sm"
                          : "text-[var(--text-muted)] hover:text-white border border-transparent"
                      }`}
                    >
                      🔒 TLS SSL Auditor
                    </button>
                    <button
                      onClick={() => setSandboxTab("network")}
                      className={`py-1.5 rounded text-[8.5px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                        sandboxTab === "network"
                          ? "bg-[#0EA5E9]/15 text-[#0EA5E9] border border-[#0EA5E9]/20 shadow-sm"
                          : "text-[var(--text-muted)] hover:text-white border border-transparent"
                      }`}
                    >
                      🌐 Port Scanner
                    </button>
                  </div>

                  {sandboxTab === "ssl" ? <SslInspector /> : <NetworkScanner />}
                </div>
                
                <ReportGenerator threats={threats} />
              </div>
            </div>
          )}

          {/* Workspace 4: AI Incident Investigator Dialogue Cockpit */}
          {activeView === "chat" && (
            <div className="h-[calc(100vh-120px)] flex flex-col gap-6 fade-in overflow-hidden">
              {/* Top Banner Info */}
              <div className="glass-card p-4 border-l-4 border-l-[#6366F1] bg-slate-500/5 flex-shrink-0">
                <h2 className="text-xs font-extrabold tracking-wider text-[var(--text-primary)] transition-colors duration-300">
                  INCIDENT INVESTIGATOR COCKPIT ACTIVE
                </h2>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed transition-colors duration-300">
                  Ask questions about system threats (e.g. <i>&quot;Is 8.8.8.8 safe?&quot;</i>). The AI Agent will dynamically invoke your stdio MCP tools.
                </p>
              </div>

              {/* Core Cockpit Layout */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden min-h-0">
                
                {/* LEFT COLUMN: Dynamic Dialogue Console */}
                <div className="h-full overflow-hidden">
                  <ThreatIntelChat 
                    initialQuery={chatQuery} 
                    onQueryHandled={() => setChatQuery("")} 
                    onNavigate={(view) => setActiveView(view)}
                  />
                </div>

                {/* RIGHT COLUMN: Terminal Shell & APM Trace Pipeline vertically stacked */}
                <div className="h-full overflow-hidden flex flex-col gap-6">
                  {/* Top Stack: Monospace Developer Terminal */}
                  <div className="flex-1 min-h-[50%] overflow-hidden">
                    <AuditTerminal 
                      simulatedLogs={simulatedTerminalLogs} 
                      logs={dbLogs} 
                      error={backendOnline === false ? "DAEMON OFFLINE" : null}
                    />
                  </div>
                  
                  {/* Bottom Stack: Chain-of-Thought APM Trace */}
                  <div className="flex-1 min-h-[50%] overflow-hidden">
                    <AgentPipeline lastQuery={chatQuery} />
                  </div>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. Control Panel overlay drawer */}
      <ControlDrawer
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
        activeTheme={activeTheme}
        onSelectTheme={handleSelectTheme}
        activeSimulation={activeSimulation}
        onTriggerSimulation={handleTriggerSimulation}
        riskScore={riskScore}
      />
    </div>
  );
}
