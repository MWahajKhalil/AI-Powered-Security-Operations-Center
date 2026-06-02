"use client";

import React, { useEffect, useState } from "react";

interface HeaderProps {
  activeView: "dashboard" | "chat";
  onToggleControls: () => void;
  backendOnline: boolean | null;
}

export default function Header({ activeView, onToggleControls, backendOnline }: HeaderProps) {
  // Real-time telemetry states
  const [cpu, setCpu] = useState<number>(2.4);
  const [memory, setMemory] = useState<number>(412);
  const [ping, setPing] = useState<number>(12);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  /**
   * INTERVIEW HELPER: Telemetry Value Fluctuation Simulator
   * 
   * In a real technical interview, explaining how you simulate data is key.
   * This helper applies a "Random Walk" algorithm. It takes the previous state,
   * adds a constrained delta step, bounds the value within a safe min/max window,
   * and normalizes the decimal precision. This prevents erratic visual jumps!
   */
  const calculateFluctuation = (
    prev: number, 
    min: number, 
    max: number, 
    maxStep: number,
    decimalPlaces: number = 0
  ): number => {
    // Generate a step offset between -maxStep and +maxStep
    const step = (Math.random() - 0.5) * 2 * maxStep;
    const next = prev + step;
    
    // Clamp the next value within limits
    const bounded = Math.max(min, Math.min(max, next));
    return Number(bounded.toFixed(decimalPlaces));
  };

  // Telemetry fluctuation loop running on a separate timer (every 2s)
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. CPU fluctuations: 1.2% - 5.8%
      setCpu(prev => calculateFluctuation(prev, 1.2, 5.8, 0.4, 1));

      // 2. Memory fluctuations: 408MB - 428MB
      setMemory(prev => Math.round(calculateFluctuation(prev, 408, 428, 1.5, 0)));

      // 3. Ping fluctuations (only if backend is active)
      if (backendOnline) {
        setPing(prev => Math.round(calculateFluctuation(prev, 6, 25, 1, 0)));
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [backendOnline]);

  const triggerScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      await fetch("http://localhost:8000/health");
    } catch (e) {
      console.warn("Backend connection offline during ingress scan check.");
    } finally {
      setTimeout(() => {
        setIsScanning(false);
      }, 1500);
    }
  };

  return (
    <header className="h-16 bg-[var(--bg-panel)] border-b border-[var(--border-muted)] px-6 flex items-center justify-between z-10 select-none flex-shrink-0 transition-colors duration-300">
      {/* Title Area */}
      <div>
        <h1 className="text-sm font-bold tracking-wider text-[var(--text-primary)] transition-colors duration-300">
          {activeView === "dashboard"
            ? "THREAT INGRESS OPERATIONS OVERVIEW"
            : "INCIDENT INVESTIGATION COMMAND CENTER"}
        </h1>
        <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5 transition-colors duration-300">
          Real-Time Security Intelligence
        </p>
      </div>

      {/* Health & Live Telemetry Monitor */}
      <div className="flex items-center gap-5">
        
        {/* Telemetry Sparks Column Grid */}
        <div className="hidden md:flex items-center gap-5 text-[10px]">
          {/* CPU Spark */}
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest font-semibold transition-colors duration-300">CPU INGRESS</span>
            <span className="font-mono font-bold text-[var(--text-primary)] mt-0.5 text-[10px] transition-colors duration-300">{cpu}%</span>
          </div>

          <div className="h-6 w-px bg-[var(--border-muted)] transition-colors duration-300" />

          {/* Memory Spark */}
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest font-semibold transition-colors duration-300">RAM TARGET</span>
            <span className="font-mono font-semibold text-[var(--text-primary)] mt-0.5 text-[10px] transition-colors duration-300">{memory}MB / 2048MB</span>
          </div>

          <div className="h-6 w-px bg-[var(--border-muted)] transition-colors duration-300" />

          {/* Sync Latency Spark */}
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest font-semibold transition-colors duration-300">SYNC RTT</span>
            <span className={`font-mono font-bold mt-0.5 text-[10px] transition-colors duration-300 ${backendOnline ? "text-[#0EA5E9]" : "text-[var(--text-muted)]/40"}`}>
              {backendOnline ? `${ping}ms` : "N/A"}
            </span>
          </div>
        </div>

        <div className="hidden md:block h-6 w-px bg-[var(--border-muted)] transition-colors duration-300" />

        {/* Command Control Panel Gear Button */}
        <button
          onClick={onToggleControls}
          className="p-1.5 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-obsidian)]/20 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[#0EA5E9]/45 hover:shadow-[0_0_8px_rgba(14,165,233,0.15)] transition-all cursor-pointer flex items-center justify-center min-w-8 h-8 hover:bg-[var(--bg-obsidian)]/40"
          title="Open Control Panel Drawer"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <div className="h-6 w-px bg-[var(--border-muted)] transition-colors duration-300" />

        {/* Run Manual Security Scan Button */}
        <button
          onClick={triggerScan}
          disabled={isScanning}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] uppercase font-bold tracking-wider transition-all duration-200 cursor-pointer ${
            isScanning
              ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]"
              : "bg-[#0EA5E9]/10 border-[#0EA5E9]/20 text-[#0EA5E9] hover:bg-[#0EA5E9]/25 hover:border-[#0EA5E9]/45"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isScanning ? "bg-[#F59E0B] animate-ping" : "bg-[#0EA5E9]"}`} />
          <span>{isScanning ? "Checking..." : "Run Security Scan"}</span>
        </button>

        <div className="h-6 w-px bg-[var(--border-muted)] transition-colors duration-300" />

        {/* FastAPI Status Light */}
        <div className="flex items-center gap-2 p-1.5 px-3 rounded-full bg-[var(--bg-obsidian)]/20 border border-[var(--border-muted)] text-[9px] font-bold uppercase tracking-wider transition-colors duration-300">
          {backendOnline === null ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-[#F59E0B]">API SYNCING</span>
            </>
          ) : backendOnline ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
              <span className="text-[#10B981]">FastAPI Online</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444] animate-pulse" />
              <span className="text-[#EF4444]">API Offline</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
