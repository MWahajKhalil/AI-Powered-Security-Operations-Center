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

  // Theme states
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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

  /**
   * INTERVIEW HELPER: Persistent Dark/Light Theme Manager
   * 
   * Explains how you handle local preferences without triggering screen-flashes.
   * Toggles the '.light-mode' CSS class on document element and stores the state.
   */
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light-mode");
    } else {
      document.documentElement.classList.remove("light-mode");
    }
  };

  // Sync theme with system localStorage on mounting
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") {
        document.documentElement.classList.add("light-mode");
      } else {
        document.documentElement.classList.remove("light-mode");
      }
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

        {/* Sun/Moon Theme Toggle Switch */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-obsidian)]/20 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer flex items-center justify-center min-w-8 h-8 hover:bg-[var(--bg-obsidian)]/40"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          )}
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
