"use client";

import React from "react";

interface CommandLaunchpadProps {
  onNavigate: (view: "radar" | "audits" | "sandbox" | "chat") => void;
  riskScore: number;
}

export default function CommandLaunchpad({
  onNavigate,
  riskScore,
}: CommandLaunchpadProps) {
  // Radial Dial calculations
  const radius = 50;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Dynamic fill based on (100 - riskScore)
  const healthPercent = Math.max(0, Math.min(100, 100 - riskScore));
  const strokeDashoffset = circumference - (healthPercent / 100) * circumference;

  return (
    <div className="flex flex-col gap-8 fade-in relative select-none">
      
      {/* 1. Header Overview Banner */}
      <div className="glass-card p-8 border-l-4 border-l-[#6366F1] bg-slate-500/5 relative overflow-hidden transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 z-10 relative">
          <div className="text-center md:text-left">
            <h1 className="text-xl font-extrabold tracking-wider text-[var(--text-primary)] transition-colors duration-300">
              CENTRAL SECURITY COMMAND SUITE
            </h1>
            <p className="text-[12px] text-[var(--text-muted)] mt-2 leading-relaxed max-w-2xl transition-colors duration-300">
              Enterprise security analytics cockpit. Select visual workspaces from the launchers grid below, or click the settings gear at the top right to simulate drills and toggle themes.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-cyan)]/25 bg-[var(--color-cyan)]/5 text-[var(--color-cyan)] text-[9px] font-extrabold uppercase tracking-widest transition-all duration-300 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
            <span>COMMAND CORE SYNCED</span>
          </div>
        </div>
      </div>

      {/* 2. Dial Gauge & Info Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SVG System Health Posture Dial */}
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-muted)] pb-2 mb-4 w-full">
            Posture Diagnostics Dial
          </h3>
          
          <div className="relative flex items-center justify-center h-36 w-36 my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Dial Track Background */}
              <circle
                stroke="var(--border-muted)"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={50}
                cy={50}
                className="opacity-40"
              />
              {/* Dial Progress Overlay */}
              <circle
                stroke={riskScore > 50 ? "var(--color-magenta)" : riskScore > 20 ? "var(--color-amber)" : "var(--color-cyan)"}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={50}
                cy={50}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black font-mono text-[var(--text-primary)]">
                {healthPercent.toFixed(1)}%
              </span>
              <span className="text-[7px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">
                SECURE POSTURE
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1.5 text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${riskScore > 50 ? "bg-[#EC4899]" : "bg-[#0EA5E9]"}`} />
              <span>System Threat Index: <b className="font-mono text-[var(--text-primary)] ml-1">{riskScore.toFixed(0)}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <span>TLS Auditing Strength: <b className="font-mono text-white ml-1">Grade A+</b></span>
            </div>
          </div>
        </div>

        {/* Telemetry Core Details panel */}
        <div className="glass-card p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[var(--border-muted)] pb-2.5 mb-4">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)]">
                  SecOps Command Ingress Feed
                </h3>
                <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                  Core telemetry details and active monitoring indexes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 text-[9.5px]">
              <div className="p-3 bg-white/2 border border-white/5 rounded-lg">
                <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Threat Exposure</span>
                <p className="text-xs font-extrabold text-white mt-1">Low Severity</p>
                <p className="text-[7.5px] text-[var(--text-muted)] mt-0.5">Standard background internet scan vectors.</p>
              </div>
              <div className="p-3 bg-white/2 border border-white/5 rounded-lg">
                <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest font-bold">WAF Filtering</span>
                <p className="text-xs font-extrabold text-[var(--color-cyan)] mt-1">99.8% Efficiency</p>
                <p className="text-[7.5px] text-[var(--text-muted)] mt-0.5">Automated intrusion signature blocks synced.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-muted)] pt-3 text-[8.5px] text-[var(--text-muted)] uppercase font-semibold flex justify-between items-center">
            <span>Database Logging: <b className="font-mono text-white ml-1">SQLITE SYNCED</b></span>
            <span>Auditing Engines: Active</span>
          </div>
        </div>

      </div>

      {/* 3. Launchpad Workspace Launcher Grid */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)]">
          Interactive Workspace Modules Launchers
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Threat Ingress Radar */}
          <button
            onClick={() => onNavigate("radar")}
            className="glass-card p-6 text-left group hover:scale-[1.02] cursor-pointer hover:border-[#0EA5E9]/50 hover:shadow-[0_10px_20px_-8px_rgba(14,165,233,0.15)] transition-all duration-300 flex flex-col justify-between min-h-[170px]"
          >
            <div className="flex justify-between items-start">
              <span className="text-xl">🌐</span>
              <span className="text-[7px] text-[#0EA5E9] bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 px-1.5 py-0.5 rounded font-bold tracking-widest uppercase">
                Active Sweep
              </span>
            </div>
            <div className="mt-4 flex-1 flex flex-col justify-end">
              <h4 className="text-xs font-bold text-white group-hover:text-[#0EA5E9] transition-colors">
                Threat Ingress Radar
              </h4>
              <p className="text-[9px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Visual coordinate maps, 7-day spline trends, and network metrics logs.
              </p>
            </div>
          </button>

          {/* Card 2: Sensor Transactions Audit */}
          <button
            onClick={() => onNavigate("audits")}
            className="glass-card p-6 text-left group hover:scale-[1.02] cursor-pointer hover:border-[#EC4899]/50 hover:shadow-[0_10px_20px_-8px_rgba(236,72,153,0.15)] transition-all duration-300 flex flex-col justify-between min-h-[170px]"
          >
            <div className="flex justify-between items-start">
              <span className="text-xl">📑</span>
              <span className="text-[7px] text-[#EC4899] bg-[#EC4899]/10 border border-[#EC4899]/20 px-1.5 py-0.5 rounded font-bold tracking-widest uppercase">
                SQLite Synced
              </span>
            </div>
            <div className="mt-4 flex-1 flex flex-col justify-end">
              <h4 className="text-xs font-bold text-white group-hover:text-[#EC4899] transition-colors">
                Sensor Audits Log
              </h4>
              <p className="text-[9px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                High-density transactions auditing table with detailed JSON drawers.
              </p>
            </div>
          </button>

          {/* Card 3: Secure Testing Sandbox */}
          <button
            onClick={() => onNavigate("sandbox")}
            className="glass-card p-6 text-left group hover:scale-[1.02] cursor-pointer hover:border-[#6366F1]/50 hover:shadow-[0_10px_20px_-8px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col justify-between min-h-[170px]"
          >
            <div className="flex justify-between items-start">
              <span className="text-xl">🔬</span>
              <span className="text-[7px] text-[#6366F1] bg-[#6366F1]/10 border border-[#6366F1]/20 px-1.5 py-0.5 rounded font-bold tracking-widest uppercase">
                Secure Stack
              </span>
            </div>
            <div className="mt-4 flex-1 flex flex-col justify-end">
              <h4 className="text-xs font-bold text-white group-hover:text-[#6366F1] transition-colors">
                Secure Sandbox
              </h4>
              <p className="text-[9px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Cryptographic TLS expiry checkers and automated MD incident briefly compilers.
              </p>
            </div>
          </button>

          {/* Card 4: AI Incident Cockpit */}
          <button
            onClick={() => onNavigate("chat")}
            className="glass-card p-6 text-left group hover:scale-[1.02] cursor-pointer hover:border-[#0EA5E9]/50 hover:shadow-[0_10px_20px_-8px_rgba(14,165,233,0.15)] transition-all duration-300 flex flex-col justify-between min-h-[170px]"
          >
            <div className="flex justify-between items-start">
              <span className="text-xl">💬</span>
              <span className="text-[7px] text-[#0EA5E9] bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 px-1.5 py-0.5 rounded font-bold tracking-widest uppercase">
                AI Listening
              </span>
            </div>
            <div className="mt-4 flex-1 flex flex-col justify-end">
              <h4 className="text-xs font-bold text-white group-hover:text-[#0EA5E9] transition-colors">
                AI Threat Hunt
              </h4>
              <p className="text-[9px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Stdio MCP chat suite stacked alongside developers shells and CoT APM traces.
              </p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}
