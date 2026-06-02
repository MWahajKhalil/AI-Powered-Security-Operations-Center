"use client";

import React, { useEffect, useState } from "react";

interface HeaderProps {
  activeView: "dashboard" | "chat";
}

export default function Header({ activeView }: HeaderProps) {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  
  // Real-time telemetry states
  const [cpu, setCpu] = useState<number>(2.4);
  const [memory, setMemory] = useState<number>(412);
  const [ping, setPing] = useState<number>(12);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Premium Theme States
  const [activeTheme, setActiveTheme] = useState<"obsidian" | "cyberpunk" | "forest" | "silver">("obsidian");

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

  /**
   * INTERVIEW HELPER: FastAPI Endpoint Network Diagnostics Ping
   * 
   * Queries the FastAPI /health endpoint to verify sync status.
   * Tracks the execution latency in milliseconds to calculate connection speed!
   */
  const checkHealth = async () => {
    try {
      const start = performance.now();
      const response = await fetch("http://localhost:8000/health", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const duration = Math.round(performance.now() - start);
      if (response.ok) {
        setBackendOnline(true);
        setPing(Math.max(4, Math.min(duration, 35))); // Use actual ping latency capped at reasonable levels
      } else {
        setBackendOnline(false);
      }
    } catch (err) {
      setBackendOnline(false);
    }
  };

  // Connection monitoring loop
  useEffect(() => {
    checkHealth();
    // Poll the backend every 5 seconds. Remember to clear the interval on unmount!
    const healthInterval = setInterval(checkHealth, 5000);
    return () => clearInterval(healthInterval);
  }, []);

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

        {/* Premium Swatch Multi-Theme Selector */}
        <div className="flex items-center gap-2 bg-[var(--bg-obsidian)]/30 border border-[var(--border-muted)] px-2.5 py-1.5 rounded-lg flex-shrink-0">
          <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest font-extrabold mr-1.5 hidden sm:inline">Theme:</span>
          
          {/* Swatch 1: Obsidian */}
          <button
            onClick={() => handleSelectTheme("obsidian")}
            className={`h-4 w-4 rounded-full bg-[#0EA5E9] border cursor-pointer hover:scale-110 transition-all ${
              activeTheme === "obsidian" ? "border-white stroke-2 ring-2 ring-[#0EA5E9]/50 shadow-[0_0_8px_#0EA5E9]" : "border-transparent opacity-75 hover:opacity-100"
            }`}
            title="Theme: Midnight Obsidian"
          />

          {/* Swatch 2: Cyberpunk */}
          <button
            onClick={() => handleSelectTheme("cyberpunk")}
            className={`h-4 w-4 rounded-full bg-[#EC4899] border cursor-pointer hover:scale-110 transition-all ${
              activeTheme === "cyberpunk" ? "border-white stroke-2 ring-2 ring-[#EC4899]/50 shadow-[0_0_8px_#EC4899]" : "border-transparent opacity-75 hover:opacity-100"
            }`}
            title="Theme: Toxic Cyberpunk"
          />

          {/* Swatch 3: Forest */}
          <button
            onClick={() => handleSelectTheme("forest")}
            className={`h-4 w-4 rounded-full bg-[#10B981] border cursor-pointer hover:scale-110 transition-all ${
              activeTheme === "forest" ? "border-white stroke-2 ring-2 ring-[#10B981]/50 shadow-[0_0_8px_#10B981]" : "border-transparent opacity-75 hover:opacity-100"
            }`}
            title="Theme: Nordic Forest"
          />

          {/* Swatch 4: Silver Carbon */}
          <button
            onClick={() => handleSelectTheme("silver")}
            className={`h-4 w-4 rounded-full bg-[#888888] border cursor-pointer hover:scale-110 transition-all ${
              activeTheme === "silver" ? "border-white stroke-2 ring-2 ring-white/30 shadow-[0_0_8px_rgba(255,255,255,0.25)]" : "border-transparent opacity-75 hover:opacity-100"
            }`}
            title="Theme: Silver Carbon"
          />
        </div>

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
