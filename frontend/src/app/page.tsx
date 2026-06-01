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

interface ThreatAdvisory {
  title: string;
  link: string;
  published: string;
  summary: string;
}

export default function Home() {
  const [activeView, setActiveView] = useState<"dashboard" | "chat">("dashboard");
  const [threats, setThreats] = useState<ThreatAdvisory[]>([]);
  const [loadingThreats, setLoadingThreats] = useState<boolean>(true);
  const [chatQuery, setChatQuery] = useState("");
  const [dashTab, setDashTab] = useState<"radar" | "audits" | "sandbox">("radar");

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

  useEffect(() => {
    fetchThreats();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-obsidian)] text-[var(--text-primary)] relative transition-colors duration-300">
      {/* 1. Sidebar Left Dock */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* 2. Content Area Right */}
      <div className="flex-1 flex flex-col h-full overflow-hidden z-10">
        {/* Top Control Header */}
        <Header activeView={activeView} />

        {/* Dynamic Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--bg-obsidian)] relative transition-colors duration-300">
          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <div className="flex flex-col gap-6 fade-in">
              {/* Glass Header Info Card with Live CISA Ticker */}
              <div className="glass-card p-6 border-l-4 border-l-[#0EA5E9] bg-slate-500/5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 z-10 relative">
                  <div>
                    <h2 className="text-sm font-extrabold tracking-wider text-[var(--text-primary)] transition-colors duration-300">
                      SOC COMMAND OVERVIEW DECK
                    </h2>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed max-w-2xl transition-colors duration-300">
                      Unified control deck of the security network client. The Model Context Protocol layers are listening on background stdio channels. Switch to **Threat Hunt** to test real-time AI investigations.
                    </p>
                  </div>
                  
                  {/* Premium Live Warning Indicator */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-crimson)]/20 bg-[var(--color-crimson)]/5 text-[var(--color-crimson)] text-[9px] font-bold uppercase tracking-wider self-start md:self-auto transition-all duration-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-crimson)] shadow-[0_0_8px_var(--color-crimson)] animate-ping" />
                    <span>CISA Live Feed</span>
                  </div>
                </div>

                {/* Horizontal Live Advisories Ticker */}
                <div className="mt-5 border-t border-[var(--border-muted)] pt-4 z-10 relative flex flex-col sm:flex-row gap-3 items-start sm:items-center text-[10px]">
                  <span className="text-[9px] text-[var(--color-cyan)] font-extrabold uppercase tracking-widest bg-[var(--color-cyan)]/5 border border-[var(--color-cyan)]/25 px-2 py-0.5 rounded flex-shrink-0 transition-all duration-300">
                    Active Bulletins:
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

              {/* Grid of Glowing Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusCard 
                  title="Severity Alert Index" 
                  value="92.4" 
                  color="crimson" 
                  statusText="Critical Alerts active"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                />
                <StatusCard 
                  title="Active Sensor Networks" 
                  value="2 Connected" 
                  color="cyan" 
                  statusText="Net-Analysis & Threat-Intel"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                />
                <StatusCard 
                  title="Database Log Audits" 
                  value="Online" 
                  color="emerald" 
                  statusText="SQLite Synced & listening"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  }
                />
              </div>

              {/* Premium Sleek Segmented Control Tab Switcher */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[var(--border-muted)] pb-4 mt-2 transition-colors duration-300">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] transition-colors duration-300">
                    SOC Dashboard Workspaces
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-widest transition-colors duration-300">
                    Switch between geolocator maps, logs transactors, or security inspect sandboxes
                  </p>
                </div>

                <div className="flex bg-[var(--bg-panel)] border border-[var(--border-muted)] p-1 rounded-xl gap-1.5 self-start sm:self-auto transition-colors duration-300">
                  <button
                    onClick={() => setDashTab("radar")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all duration-200 ${
                      dashTab === "radar"
                        ? "bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/25 shadow-[0_2px_8px_rgba(14,165,233,0.06)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/3 border border-transparent"
                    }`}
                  >
                    <span>🔍</span>
                    <span>Diagnostic Radar</span>
                  </button>
                  <button
                    onClick={() => setDashTab("audits")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all duration-200 ${
                      dashTab === "audits"
                        ? "bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/25 shadow-[0_2px_8px_rgba(236,72,153,0.06)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/3 border border-transparent"
                    }`}
                  >
                    <span>📋</span>
                    <span>Audit Transactors</span>
                  </button>
                  <button
                    onClick={() => setDashTab("sandbox")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all duration-200 ${
                      dashTab === "sandbox"
                        ? "bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/25 shadow-[0_2px_8px_rgba(99,102,241,0.06)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/3 border border-transparent"
                    }`}
                  >
                    <span>🛡️</span>
                    <span>SecOps Sandbox</span>
                  </button>
                </div>
              </div>

              {/* Tab Content 1: Threat Ingress Map & Network Scans Spline Chart */}
              {dashTab === "radar" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
                  <ThreatMap />
                  <ThreatChart />
                </div>
              )}

              {/* Tab Content 2: Bulletins Board & Recent Logs Table */}
              {dashTab === "audits" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
                  <BulletinsBoard 
                    bulletins={threats}
                    loading={loadingThreats}
                    onInvestigate={handleInvestigateBulletin}
                  />
                  <RecentLogs />
                </div>
              )}

              {/* Tab Content 3: SSL Cryptography Inspector, APM Reasoning Pipeline, and SecOps Report Generator */}
              {dashTab === "sandbox" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
                  <SslInspector />
                  <AgentPipeline lastQuery={chatQuery} />
                  <ReportGenerator threats={threats} />
                </div>
              )}
            </div>
          )}

          {/* Chat / Investigation View (Dual Pane Terminal Layout) */}
          {activeView === "chat" && (
            <div className="h-[calc(100vh-120px)] flex flex-col gap-6 fade-in overflow-hidden">
              {/* Top Banner Info */}
              <div className="glass-card p-4 border-l-4 border-l-[#6366F1] bg-slate-500/5 flex-shrink-0">
                <h2 className="text-xs font-extrabold tracking-wider text-[var(--text-primary)] transition-colors duration-300">
                  INCIDENT INVESTIGATOR ACTIVE
                </h2>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed transition-colors duration-300">
                  Ask questions about system threats (e.g. <i>&quot;Is 8.8.8.8 safe?&quot;</i>). The AI Agent will dynamically invoke your stdio MCP tools.
                </p>
              </div>

              {/* Core Dual-Pane Layout: Left Chat Console | Right Stdio Terminal */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden min-h-0">
                
                {/* LEFT PANE: Dynamic Threat Investigation Chat */}
                <div className="h-full overflow-hidden">
                  <ThreatIntelChat initialQuery={chatQuery} onQueryHandled={() => setChatQuery("")} />
                </div>

                {/* RIGHT PANE: Monospace Security Terminal */}
                <div className="h-full overflow-hidden">
                  <AuditTerminal />
                </div>

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
