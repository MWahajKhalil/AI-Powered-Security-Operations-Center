"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatusCard from "@/components/StatusCard";
import RecentLogs from "@/components/RecentLogs";
import ThreatChart from "@/components/ThreatChart";
import AuditTerminal from "@/components/AuditTerminal";
import ThreatIntelChat from "@/components/ThreatIntelChat";
import CyberGridBackground from "@/components/CyberGridBackground";

export default function Home() {
  const [activeView, setActiveView] = useState<"dashboard" | "chat">("dashboard");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080C14] text-white relative">
      {/* 0. Sci-Fi Holographic Visual HUD Overlays */}
      <CyberGridBackground />
      <div className="hud-scanner" />

      {/* 1. Sidebar Left Dock */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* 2. Content Area Right */}
      <div className="flex-1 flex flex-col h-full overflow-hidden z-10">
        {/* Top Control Header */}
        <Header activeView={activeView} />

        {/* Dynamic Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#080C14]/40 relative">
          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <div className="flex flex-col gap-6 fade-in">
              {/* Glass Header Info Card */}
              <div className="glass-card cyber-card p-6 border-l-4 border-l-[#00F2FE]">
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

          {/* Chat / Investigation View (Dual Pane Terminal Layout) */}
          {activeView === "chat" && (
            <div className="h-[calc(100vh-120px)] flex flex-col gap-6 fade-in overflow-hidden">
              {/* Top Banner Info */}
              <div className="glass-card cyber-card p-4 border-l-4 border-l-[#7F00FF] bg-[#0D1420]/45 flex-shrink-0">
                <h2 className="text-xs font-extrabold tracking-wider text-white">
                  INCIDENT INVESTIGATOR ACTIVE
                </h2>
                <p className="text-[10px] text-[#8F9CAE] mt-1 leading-relaxed">
                  Ask questions about system threats (e.g. <i>&quot;Is 8.8.8.8 safe?&quot;</i>). The AI Agent will dynamically invoke your stdio MCP tools.
                </p>
              </div>

              {/* Core Dual-Pane Layout: Left Chat Console | Right Stdio Terminal */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden min-h-0">
                
                {/* LEFT PANE: Dynamic Threat Investigation Chat */}
                <div className="h-full overflow-hidden">
                  <ThreatIntelChat />
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
