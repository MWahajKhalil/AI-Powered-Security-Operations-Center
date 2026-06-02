"use client";

import React from "react";

interface SidebarProps {
  activeView: "launchpad" | "radar" | "audits" | "sandbox" | "chat";
  setActiveView: (view: "launchpad" | "radar" | "audits" | "sandbox" | "chat") => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#0D1420]/80 backdrop-blur-md border-r border-white/5 flex flex-col h-full z-10 transition-all duration-300 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#6366F1] to-[#0EA5E9] flex items-center justify-center shadow-[0_4px_12px_rgba(14,165,233,0.15)]">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h2 className="font-bold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            SOC AGENT
          </h2>
          <p className="text-[10px] text-[#8F9CAE] tracking-widest uppercase">Command Deck</p>
        </div>
      </div>

      {/* Nav Menu Links */}
      <nav className="flex-1 p-4 space-y-1.5 mt-4">
        {/* Navigation Option 0: Command Deck Launchpad */}
        <button
          onClick={() => setActiveView("launchpad")}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
            activeView === "launchpad"
              ? "bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/25 shadow-[0_4px_12px_rgba(99,102,241,0.04)]"
              : "text-[#8F9CAE] hover:text-white hover:bg-white/3 border border-transparent"
          }`}
        >
          <span>🎯</span>
          <span>Command Deck</span>
        </button>

        <div className="h-px bg-white/5 my-2 mx-2" />

        {/* Navigation Option 1: Threat Radar */}
        <button
          onClick={() => setActiveView("radar")}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
            activeView === "radar"
              ? "bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/25 shadow-[0_4px_12px_rgba(14,165,233,0.04)]"
              : "text-[#8F9CAE] hover:text-white hover:bg-white/3 border border-transparent"
          }`}
        >
          <span>🌐</span>
          <span>Threat Radar</span>
        </button>

        {/* Navigation Option 2: Sensor Audits */}
        <button
          onClick={() => setActiveView("audits")}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
            activeView === "audits"
              ? "bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/25 shadow-[0_4px_12px_rgba(236,72,153,0.04)]"
              : "text-[#8F9CAE] hover:text-white hover:bg-white/3 border border-transparent"
          }`}
        >
          <span>📑</span>
          <span>Sensor Audits</span>
        </button>

        {/* Navigation Option 3: Secure Sandbox */}
        <button
          onClick={() => setActiveView("sandbox")}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
            activeView === "sandbox"
              ? "bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/25 shadow-[0_4px_12px_rgba(99,102,241,0.04)]"
              : "text-[#8F9CAE] hover:text-white hover:bg-white/3 border border-transparent"
          }`}
        >
          <span>🔬</span>
          <span>Secure Sandbox</span>
        </button>

        {/* Navigation Option 4: AI Threat Hunt */}
        <button
          onClick={() => setActiveView("chat")}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
            activeView === "chat"
              ? "bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/25 shadow-[0_4px_12px_rgba(14,165,233,0.04)]"
              : "text-[#8F9CAE] hover:text-white hover:bg-white/3 border border-transparent"
          }`}
        >
          <span>💬</span>
          <span>AI Threat Hunt</span>
        </button>
      </nav>

      {/* Analyst ID Card Foot */}
      <div className="p-4 border-t border-white/5 bg-black/10">
        <div className="flex items-center gap-3 p-2 bg-white/2 rounded-lg border border-white/5">
          <div className="h-7 w-7 rounded-full bg-[#6366F1]/20 border border-[#6366F1]/40 flex items-center justify-center text-[10px] font-bold text-[#0EA5E9]">
            AN
          </div>
          <div className="overflow-hidden">
            <h4 className="text-[11px] font-semibold text-white/90 truncate">Analyst_Mwahaj</h4>
            <p className="text-[9px] text-[#8F9CAE] uppercase tracking-wider truncate">Tier 2 SecOps</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
