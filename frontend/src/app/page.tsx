"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatusCard from "@/components/StatusCard";
import RecentLogs from "@/components/RecentLogs";
import ThreatChart from "@/components/ThreatChart";

export default function Home() {
  const [activeView, setActiveView] = useState<"dashboard" | "chat">("dashboard");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080C14] text-white">
      {/* 1. Sidebar Left Dock */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* 2. Content Area Right */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Control Header */}
        <Header activeView={activeView} />

        {/* Dynamic Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#080C14] relative">
          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <div className="flex flex-col gap-6 fade-in">
              {/* Glass Header Info Card */}
              <div className="glass-card p-6 border-l-4 border-l-[#00F2FE]">
                <h2 className="text-sm font-extrabold tracking-wider text-white">
                  SOC COMMAND OVERVIEW DECK
                </h2>
                <p className="text-[11px] text-[#8F9CAE] mt-1.5 leading-relaxed max-w-2xl">
                  Unified control deck of the security network client. The Model Context Protocol layers are listening on background stdio channels. Switch to **Threat Hunt** to test real-time AI investigations.
                </p>
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

              {/* Data Visualization Pane: Spline Chart & SQLite Logs Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ThreatChart />
                <RecentLogs />
              </div>
            </div>
          )}

          {/* Chat / Investigation View (Wired fully in Phase 11 & 12) */}
          {activeView === "chat" && (
            <div className="h-full flex flex-col gap-6 fade-in justify-between">
              {/* Top Banner */}
              <div className="glass-card p-6 border-l-4 border-l-[#7F00FF] bg-[#0D1420]/45">
                <h2 className="text-sm font-extrabold tracking-wider text-white">
                  INCIDENT INVESTIGATOR ACTIVE
                </h2>
                <p className="text-[11px] text-[#8F9CAE] mt-1.5 leading-relaxed max-w-2xl">
                  Ask the intelligence orchestrator questions about system threats (e.g. <i>&quot;Is the domain malicious-tracker.xyz clean?&quot;</i>). 
                  The agent will reason dynamically and execute registered MCP tools.
                </p>
              </div>

              {/* Mid Dialogue Sandbox (Phase 11 & 12 Chat Visuals) */}
              <div className="flex-1 glass-card border border-white/5 bg-black/10 p-6 flex flex-col items-center justify-center min-h-[300px]">
                <div className="text-center max-w-sm">
                  <div className="h-12 w-12 rounded-full bg-[#7F00FF]/15 border border-[#7F00FF]/30 flex items-center justify-center text-[#7F00FF] mx-auto mb-4 animate-pulse">
                    <svg className="h-6 w-6 text-[#00F2FE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold tracking-wider uppercase text-white">Agent Dialogue Interface</h3>
                  <p className="text-[11px] text-[#8F9CAE] mt-2 leading-relaxed">
                    Ready to initiate active checks. Connection to the backend chatbot route will be fully wired in **Phase 12**.
                  </p>
                </div>
              </div>

              {/* Bottom Command Input (Placeholder) */}
              <div className="glass-card p-4 flex gap-3 border border-white/5 bg-[#0D1420]/45">
                <input
                  type="text"
                  placeholder="Enter IP, domain or security question to scan..."
                  disabled
                  className="flex-1 bg-black/20 border border-white/5 rounded-lg px-4 text-xs placeholder:text-white/30 text-white/50 cursor-not-allowed outline-none"
                />
                <button
                  disabled
                  className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#7F00FF]/20 border border-[#7F00FF]/30 text-[#00F2FE]/50 cursor-not-allowed uppercase"
                >
                  Investigate
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
