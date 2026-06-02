"use client";

import React, { useState } from "react";

interface CommandLaunchpadProps {
  onNavigate: (view: "radar" | "audits" | "sandbox" | "chat") => void;
  onTriggerSimulation: (attackType: "brute_force" | "sql_injection" | "ransomware" | "reset") => void;
  activeSimulation: "brute_force" | "sql_injection" | "ransomware" | "none";
  riskScore: number;
}

export default function CommandLaunchpad({
  onNavigate,
  onTriggerSimulation,
  activeSimulation,
  riskScore,
}: CommandLaunchpadProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  const handleSimulate = (type: "brute_force" | "sql_injection" | "ransomware" | "reset") => {
    if (type === "reset") {
      setNotificationMsg("SOC system state parameters restored to default.");
    } else {
      const titles = {
        brute_force: "SSH Brute-Force intrusion sequence synthesized!",
        sql_injection: "SQL Injection database probe signature injected!",
        ransomware: "Ransomware beacon C2 beaconing anomaly simulated!",
      };
      setNotificationMsg(titles[type]);
    }
    onTriggerSimulation(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

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
      {/* Simulation Trigger Toast Banner */}
      {showNotification && (
        <div className="fixed top-20 right-6 z-50 glass-card px-5 py-3 border-l-4 border-l-[#EC4899] bg-[#EC4899]/5 backdrop-blur-lg flex items-center gap-3 animate-slide-in shadow-[0_15px_30px_-5px_rgba(0,0,0,0.5)]">
          <span className="h-2 w-2 rounded-full bg-[#EC4899] animate-ping" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              Simulated Threat Event
            </span>
            <span className="text-[9px] text-[var(--text-muted)] font-mono mt-0.5">
              {notificationMsg}
            </span>
          </div>
        </div>
      )}

      {/* 1. Header Overview Banner */}
      <div className="glass-card p-8 border-l-4 border-l-[#6366F1] bg-slate-500/5 relative overflow-hidden transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 z-10 relative">
          <div className="text-center md:text-left">
            <h1 className="text-xl font-extrabold tracking-wider text-[var(--text-primary)] transition-colors duration-300">
              CENTRAL SECURITY COMMAND SUITE
            </h1>
            <p className="text-[12px] text-[var(--text-muted)] mt-2 leading-relaxed max-w-2xl transition-colors duration-300">
              Enterprise security analytics cockpit. Select visual workspaces from the launchers grid below, or simulate live incident sequences to stress-test your AI reasoning agents.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-cyan)]/25 bg-[var(--color-cyan)]/5 text-[var(--color-cyan)] text-[9px] font-extrabold uppercase tracking-widest transition-all duration-300 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
            <span>COMMAND CORE SYNCED</span>
          </div>
        </div>
      </div>

      {/* 2. Dial Gauge & Simulator Suite Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
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

        {/* SecOps Chaos Simulator Controls Panel */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center border-b border-[var(--border-muted)] pb-2.5 mb-4">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)]">
                SecOps Threat Ingress Chaos Suite
              </h3>
              <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                Trigger mock incident payloads to evaluate workspace dashboards
              </p>
            </div>
            {activeSimulation !== "none" && (
              <span className="text-[7px] font-extrabold bg-[#EC4899]/15 border border-[#EC4899]/30 text-[#EC4899] px-2 py-0.5 rounded-full animate-pulse tracking-widest uppercase">
                Active Simulation
              </span>
            )}
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            
            {/* 1. Brute Force Trigger */}
            <button
              onClick={() => handleSimulate("brute_force")}
              className={`h-full flex flex-col justify-between p-4 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                activeSimulation === "brute_force"
                  ? "bg-[#EC4899]/5 border-[#EC4899] shadow-[0_0_12px_rgba(236,72,153,0.15)]"
                  : "bg-white/2 border-white/5 hover:border-white/15 hover:bg-white/5"
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-base">🔒</span>
                <span className="text-[7px] text-[#EC4899] bg-[#EC4899]/10 border border-[#EC4899]/20 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest">
                  Medium
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-[10px] font-bold text-[var(--text-primary)]">SSH Brute Force</h4>
                <p className="text-[8px] text-[var(--text-muted)] mt-1 leading-relaxed">
                  Injects log entry anomalies & triggers emergency coordinate nodes.
                </p>
              </div>
            </button>

            {/* 2. SQL Injection Trigger */}
            <button
              onClick={() => handleSimulate("sql_injection")}
              className={`h-full flex flex-col justify-between p-4 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                activeSimulation === "sql_injection"
                  ? "bg-[#F59E0B]/5 border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  : "bg-white/2 border-white/5 hover:border-white/15 hover:bg-white/5"
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-base">🗄️</span>
                <span className="text-[7px] text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest">
                  High
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-[10px] font-bold text-[var(--text-primary)]">SQL Injection Probe</h4>
                <p className="text-[8px] text-[var(--text-muted)] mt-1 leading-relaxed">
                  Triggers SQL database transaction alerts and spikes Risk metrics.
                </p>
              </div>
            </button>

            {/* 3. Ransomware Trigger */}
            <button
              onClick={() => handleSimulate("ransomware")}
              className={`h-full flex flex-col justify-between p-4 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                activeSimulation === "ransomware"
                  ? "bg-[#EF4444]/5 border-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                  : "bg-white/2 border-white/5 hover:border-white/15 hover:bg-white/5"
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-base">🚨</span>
                <span className="text-[7px] text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest">
                  Critical
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-[10px] font-bold text-[var(--text-primary)]">Ransomware C2</h4>
                <p className="text-[8px] text-[var(--text-muted)] mt-1 leading-relaxed">
                  Beaconing simulation, spikes threat indices, triggers red pings.
                </p>
              </div>
            </button>

          </div>

          {/* Reset simulation control */}
          <div className="border-t border-[var(--border-muted)] pt-3 mt-4 flex justify-between items-center">
            <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              Currently simulating: <b className="font-mono text-white ml-1">{activeSimulation === "none" ? "NONE (NORMAL OPS)" : activeSimulation.toUpperCase()}</b>
            </span>
            <button
              onClick={() => handleSimulate("reset")}
              disabled={activeSimulation === "none"}
              className="text-[8.5px] font-extrabold uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:border-white/20 px-3 py-1.5 rounded text-white transition-all cursor-pointer"
            >
              Reset Live Parameters
            </button>
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
