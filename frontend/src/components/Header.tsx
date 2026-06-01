"use client";

import React, { useEffect, useState } from "react";

interface HeaderProps {
  activeView: "dashboard" | "chat";
}

export default function Header({ activeView }: HeaderProps) {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("http://localhost:8000/health", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      } catch (err) {
        setBackendOnline(false);
      }
    };

    // Initial check
    checkHealth();

    // Check every 5 seconds
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0D1420]/40 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between z-10">
      {/* Title Area */}
      <div>
        <h1 className="text-sm font-semibold tracking-wider text-white">
          {activeView === "dashboard"
            ? "THREAT INGRESS OPERATIONS OVERVIEW"
            : "INCIDENT INVESTIGATION COMMAND CENTER"}
        </h1>
        <p className="text-[9px] text-[#8F9CAE] uppercase tracking-widest mt-0.5">
          Real-Time Security intelligence
        </p>
      </div>

      {/* Health Monitor Lights */}
      <div className="flex items-center gap-4">
        {/* Core FastAPI status indicator */}
        <div className="flex items-center gap-2 p-1.5 px-3 rounded-full bg-white/2 border border-white/5 text-[10px] font-semibold tracking-wide">
          {backendOnline === null ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFB300] animate-pulse" />
              <span className="text-[#FFB300] uppercase">API Syncing...</span>
            </>
          ) : backendOnline ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-[#00F5A0] shadow-[0_0_8px_#00F5A0] animate-pulse" />
              <span className="text-[#00F5A0] uppercase">FastAPI Online</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF0055] shadow-[0_0_8px_#FF0055] animate-pulse" />
              <span className="text-[#FF0055] uppercase">API Offline</span>
            </>
          )}
        </div>

        {/* Audit Target */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#8F9CAE] p-1.5 px-3 rounded-full bg-black/20 border border-white/5">
          <span>Active Targets:</span>
          <span className="text-[#00F2FE] font-mono">127.0.0.1:8000</span>
        </div>
      </div>
    </header>
  );
}
