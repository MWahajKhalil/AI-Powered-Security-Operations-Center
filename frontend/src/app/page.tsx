"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

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
            <div className="h-full flex flex-col gap-6 fade-in">
              {/* Glass Header Info Card */}
              <div className="glass-card p-6 border-l-4 border-l-[#00F2FE]">
                <h2 className="text-lg font-bold tracking-wider text-white">
                  SOC OVERVIEW CONTROLLERS
                </h2>
                <p className="text-xs text-[#8F9CAE] mt-1 leading-relaxed max-w-2xl">
                  Welcome to Tier 2 Security Operations. The system has completed initialization. 
                  Currently connecting to background MCP subprocesses. Use the sidebar to initiate a threat investigation hunt.
                </p>
              </div>

              {/* Grid Placeholder for Phase 10 Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border border-white/5 bg-white/2 min-h-[140px] flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs text-[#8F9CAE] uppercase tracking-wider">Severity Alert Score</h3>
                    <p className="text-3xl font-extrabold text-[#FF0055] mt-2 glow-text-crimson">92.4</p>
                  </div>
                  <span className="text-[10px] text-white/50 tracking-wider">CRITICAL NET INTEL ACTIVE</span>
                </div>
                <div className="glass-card p-6 border border-white/5 bg-white/2 min-h-[140px] flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs text-[#8F9CAE] uppercase tracking-wider">Active Tool Sensors</h3>
                    <p className="text-3xl font-extrabold text-[#00F2FE] mt-2 glow-text-cyan">2 Active</p>
                  </div>
                  <span className="text-[10px] text-white/50 tracking-wider">NETWORK & THREAT INTEL ONLINE</span>
                </div>
                <div className="glass-card p-6 border border-white/5 bg-white/2 min-h-[140px] flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs text-[#8F9CAE] uppercase tracking-wider">Audit Log Trace</h3>
                    <p className="text-3xl font-extrabold text-[#00F5A0] mt-2 glow-text-emerald">Auditing On</p>
                  </div>
                  <span className="text-[10px] text-white/50 tracking-wider">SQLITE DATABASE SYNCD</span>
                </div>
              </div>

              {/* Chart Placeholder for Phase 10 Radar */}
              <div className="flex-1 glass-card p-6 min-h-[300px] flex flex-col justify-between border border-white/5 bg-[#0D1420]/45">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Active Sensor Matrix Radar</h3>
                  <p className="text-[11px] text-[#8F9CAE] mt-1">Simulated metrics overview map for active SOC sensors.</p>
                </div>
                
                {/* SVG Mock Radar Graphic */}
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="relative h-44 w-44 rounded-full border border-[#00F2FE]/20 flex items-center justify-center pulse-glow-cyan">
                    <div className="h-28 w-28 rounded-full border border-[#00F2FE]/25 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full border border-[#00F2FE]/30 flex items-center justify-center">
                        <span className="h-2 w-2 rounded-full bg-[#00F2FE] shadow-[0_0_10px_#00F2FE]" />
                      </div>
                    </div>
                    {/* Rotating sweeping sensor overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#00F2FE]/10 to-transparent rounded-full animate-spin [animation-duration:6s] pointer-events-none" />
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 text-[10px] text-[#8F9CAE] flex justify-between items-center">
                  <span>SYSTEM MATRIX STABLE</span>
                  <span>PHASE 10 THREAT DASHBOARD COMPONENT ATTACHING NEXT</span>
                </div>
              </div>
            </div>
          )}

          {/* Chat / Investigation View */}
          {activeView === "chat" && (
            <div className="h-full flex flex-col gap-6 fade-in justify-between">
              {/* Top Banner */}
              <div className="glass-card p-6 border-l-4 border-l-[#7F00FF] bg-[#0D1420]/45">
                <h2 className="text-lg font-bold tracking-wider text-white">
                  INCIDENT INVESTIGATOR ACTIVE
                </h2>
                <p className="text-xs text-[#8F9CAE] mt-1 leading-relaxed max-w-2xl">
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
                  <h3 className="text-sm font-semibold tracking-wider text-white">Agent Dialogue Interface</h3>
                  <p className="text-xs text-[#8F9CAE] mt-2 leading-relaxed">
                    Ready to initiate investigation checks. Connection to the backend chatbot route will be fully wired in **Phase 12**.
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
