"use client";

import React, { useState } from "react";

interface ControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: "obsidian" | "cyberpunk" | "forest" | "silver";
  onSelectTheme: (theme: "obsidian" | "cyberpunk" | "forest" | "silver") => void;
  activeSimulation: "brute_force" | "sql_injection" | "ransomware" | "none";
  onTriggerSimulation: (type: "brute_force" | "sql_injection" | "ransomware" | "reset") => void;
  riskScore: number;
}

export default function ControlDrawer({
  isOpen,
  onClose,
  activeTheme,
  onSelectTheme,
  activeSimulation,
  onTriggerSimulation,
  riskScore,
}: ControlDrawerProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  const handleSimulate = (type: "brute_force" | "sql_injection" | "ransomware" | "reset") => {
    if (type === "reset") {
      setNotificationMsg("SOC system parameters restored to default.");
    } else {
      const titles = {
        brute_force: "SSH Brute-Force intrusion sequence simulated!",
        sql_injection: "SQL Injection query probe signature injected!",
        ransomware: "Ransomware beacon outbound anomaly triggered!",
      };
      setNotificationMsg(titles[type]);
    }
    onTriggerSimulation(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3500);
  };

  return (
    <>
      {/* 1. Backdrop Overlay (Visible when drawer is open) */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Simulation trigger feedback toast inside drawer */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50 glass-card px-4 py-2.5 border-l-4 border-l-[#EC4899] bg-[#EC4899]/10 backdrop-blur-lg flex items-center gap-2.5 animate-slide-in shadow-xl select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-[#EC4899] animate-ping" />
          <div className="flex flex-col text-[9.5px]">
            <span className="font-bold text-white uppercase tracking-wider">Telemetry Action</span>
            <span className="text-[8.5px] text-[var(--text-muted)] font-mono mt-0.5">{notificationMsg}</span>
          </div>
        </div>
      )}

      {/* 2. Slide-out Control Container */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-[#0E1523]/95 border-l border-white/5 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 select-none flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/10 flex-shrink-0">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-widest">
              SOC Control Console
            </h2>
            <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
              Customization & drills suite
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-white text-sm font-bold bg-white/5 hover:bg-white/10 h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer border border-white/5"
            title="Close Drawer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Section 1: Swatches Theme Engine */}
          <div className="space-y-3">
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-[10px] font-extrabold text-white uppercase tracking-wider">
                Visual Customization
              </h3>
              <p className="text-[7.5px] text-[var(--text-muted)] uppercase mt-0.5">
                Toggle corporate interfaces themes
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              {/* Theme 1: Obsidian */}
              <button
                onClick={() => onSelectTheme("obsidian")}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                  activeTheme === "obsidian"
                    ? "bg-[#0EA5E9]/5 border-[#0EA5E9] shadow-[0_0_8px_rgba(14,165,233,0.15)]"
                    : "bg-white/2 border-white/5 hover:border-white/15 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#0EA5E9]" />
                  <span className="text-[9.5px] font-bold text-white">Obsidian</span>
                </div>
                <span className="text-[7px] text-[var(--text-muted)] uppercase tracking-wider block mt-1">Default Dark</span>
              </button>

              {/* Theme 2: Cyberpunk */}
              <button
                onClick={() => onSelectTheme("cyberpunk")}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                  activeTheme === "cyberpunk"
                    ? "bg-[#EC4899]/5 border-[#EC4899] shadow-[0_0_8px_rgba(236,72,153,0.15)]"
                    : "bg-white/2 border-white/5 hover:border-white/15 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#EC4899]" />
                  <span className="text-[9.5px] font-bold text-white">Cyberpunk</span>
                </div>
                <span className="text-[7px] text-[var(--text-muted)] uppercase tracking-wider block mt-1">Neon Hot</span>
              </button>

              {/* Theme 3: Forest */}
              <button
                onClick={() => onSelectTheme("forest")}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                  activeTheme === "forest"
                    ? "bg-[#10B981]/5 border-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                    : "bg-white/2 border-white/5 hover:border-white/15 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#10B981]" />
                  <span className="text-[9.5px] font-bold text-white">Nord Forest</span>
                </div>
                <span className="text-[7px] text-[var(--text-muted)] uppercase tracking-wider block mt-1">Moss Deep</span>
              </button>

              {/* Theme 4: Silver */}
              <button
                onClick={() => onSelectTheme("silver")}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                  activeTheme === "silver"
                    ? "bg-white/10 border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                    : "bg-white/2 border-white/5 hover:border-white/15 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#888888]" />
                  <span className="text-[9.5px] font-bold text-white">Vercel Silver</span>
                </div>
                <span className="text-[7px] text-[var(--text-muted)] uppercase tracking-wider block mt-1">Matte Carbon</span>
              </button>
            </div>
          </div>

          {/* Section 2: Chaos Simulator Controls */}
          <div className="space-y-3">
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-[10px] font-extrabold text-white uppercase tracking-wider">
                Threat Chaos Simulator
              </h3>
              <p className="text-[7.5px] text-[var(--text-muted)] uppercase mt-0.5">
                Stress-test panels with simulated alerts
              </p>
            </div>
            
            <div className="space-y-2 flex flex-col">
              {/* SSH Brute Force */}
              <button
                onClick={() => handleSimulate("brute_force")}
                className={`w-full p-2.5 rounded-lg border text-left flex justify-between items-center transition-all duration-200 cursor-pointer ${
                  activeSimulation === "brute_force"
                    ? "bg-[#EC4899]/5 border-[#EC4899] shadow-sm"
                    : "bg-white/2 border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-2 text-[9.5px] font-semibold text-white">
                  <span>🔒</span>
                  <span>SSH Brute Force</span>
                </div>
                <span className="text-[7px] uppercase font-bold tracking-widest text-[#EC4899] bg-[#EC4899]/5 px-1.5 py-0.5 rounded border border-[#EC4899]/15">
                  Medium
                </span>
              </button>

              {/* SQL Injection */}
              <button
                onClick={() => handleSimulate("sql_injection")}
                className={`w-full p-2.5 rounded-lg border text-left flex justify-between items-center transition-all duration-200 cursor-pointer ${
                  activeSimulation === "sql_injection"
                    ? "bg-[#F59E0B]/5 border-[#F59E0B] shadow-sm"
                    : "bg-white/2 border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-2 text-[9.5px] font-semibold text-white">
                  <span>🗄️</span>
                  <span>SQL Injection Probe</span>
                </div>
                <span className="text-[7px] uppercase font-bold tracking-widest text-[#F59E0B] bg-[#F59E0B]/5 px-1.5 py-0.5 rounded border border-[#F59E0B]/15">
                  High
                </span>
              </button>

              {/* Ransomware */}
              <button
                onClick={() => handleSimulate("ransomware")}
                className={`w-full p-2.5 rounded-lg border text-left flex justify-between items-center transition-all duration-200 cursor-pointer ${
                  activeSimulation === "ransomware"
                    ? "bg-[#EF4444]/5 border-[#EF4444] shadow-sm"
                    : "bg-white/2 border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-2 text-[9.5px] font-semibold text-white">
                  <span>🚨</span>
                  <span>Ransomware C2</span>
                </div>
                <span className="text-[7px] uppercase font-bold tracking-widest text-[#EF4444] bg-[#EF4444]/5 px-1.5 py-0.5 rounded border border-[#EF4444]/15">
                  Critical
                </span>
              </button>

              {/* Reset simulator parameters */}
              <button
                onClick={() => handleSimulate("reset")}
                disabled={activeSimulation === "none"}
                className="w-full text-center py-2.5 rounded-lg border border-white/10 hover:border-white/25 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed font-extrabold text-[9px] uppercase tracking-wider text-white bg-white/3 transition-all cursor-pointer"
              >
                Reset Live Parameters
              </button>
            </div>
          </div>

          {/* Section 3: Telemetry customization parameters */}
          <div className="space-y-3">
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-[10px] font-extrabold text-white uppercase tracking-wider">
                Telemetry Parameters
              </h3>
              <p className="text-[7.5px] text-[var(--text-muted)] uppercase mt-0.5">
                Adjust live fluctuation indicators
              </p>
            </div>

            <div className="space-y-3 font-mono text-[9px] text-[var(--text-secondary)]">
              <div className="flex justify-between items-center">
                <span>Update Latency</span>
                <span className="text-white font-bold">Fast (2000ms)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Database Sync Rate</span>
                <span className="text-white font-bold">Real-time</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Risk Exposure Dial</span>
                <span className="text-white font-bold">{riskScore.toFixed(0)}% Index</span>
              </div>
            </div>
          </div>

        </div>

        {/* Control Footer */}
        <div className="p-4 border-t border-white/5 bg-black/15 text-[8.5px] text-center text-[var(--text-muted)] uppercase font-semibold flex-shrink-0">
          <span>Command Drawer v1.0.0</span>
        </div>

      </div>
    </>
  );
}
