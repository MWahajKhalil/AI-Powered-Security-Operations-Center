"use client";

import React from "react";

interface NetworkTopologyProps {
  activeSimulation?: "brute_force" | "sql_injection" | "ransomware" | "none";
  backendOnline: boolean | null;
  publicIp: string;
}

export default function NetworkTopology({ 
  activeSimulation = "none",
  backendOnline,
  publicIp
}: NetworkTopologyProps) {
  const isOffline = backendOnline === false;

  // SVG Dimensions
  const width = 500;
  const height = 220;

  // Node Positions
  const nodes = {
    gateway: { x: 80, y: 110, label: "Ingress Gateway", ip: isOffline ? "OFFLINE" : (publicIp && publicIp !== "Resolving..." ? publicIp : "192.168.1.1") },
    database: { x: 250, y: 50, label: "Auth Database", ip: isOffline ? "OFFLINE" : "192.168.1.5" },
    syslog: { x: 250, y: 170, label: "Syslog Daemon", ip: isOffline ? "OFFLINE" : "192.168.1.3" },
    aiCore: { x: 420, y: 110, label: "AI Threat Hunt", ip: isOffline ? "OFFLINE" : "192.168.1.10" }
  };

  // Node health/alert computations
  const isGwAlarm = !isOffline && (activeSimulation === "brute_force" || activeSimulation === "ransomware");
  const isDbAlarm = !isOffline && activeSimulation === "sql_injection";
  const isSyslogAlarm = !isOffline && activeSimulation === "brute_force";
  const isAiAlarm = !isOffline && activeSimulation === "ransomware";

  return (
    <div className="glass-card p-6 flex flex-col h-full min-h-[360px] relative select-none transition-all duration-300 overflow-hidden">
      
      {/* Header telemetry area */}
      <div className="flex justify-between items-center border-b border-[var(--border-muted)] pb-4 mb-4 flex-shrink-0 transition-colors duration-300">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] transition-colors duration-300">
            Enterprise Asset Topology Map
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-widest transition-colors duration-300">
            Live internal infrastructure routing & status mapping
          </p>
        </div>
        <div className={`flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-full font-semibold transition-colors duration-300 ${
          isOffline 
            ? "text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/15" 
            : "text-[#10B981] bg-[#10B981]/5 border border-[#10B981]/15"
        }`}>
          <span className={`h-1 w-1 rounded-full ${
            isOffline 
              ? "bg-[#EF4444] shadow-[0_0_6px_#EF4444]" 
              : "bg-[#10B981] shadow-[0_0_6px_#10B981]"
          } animate-pulse`} />
          <span>{isOffline ? "SYSTEM OFFLINE" : "ASSETS SCANNING"}</span>
        </div>
      </div>

      {/* SVG Asset Layout canvas */}
      <div className="flex-1 w-full flex items-center justify-center p-2 relative overflow-hidden bg-[var(--bg-obsidian)]/20 rounded-lg border border-[var(--border-muted)] min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full max-h-[260px]"
          fill="none"
        >
          {/* 1. Connection Link Lines (Standard SVG paths) */}
          
          {/* Link: Gateway -> Database */}
          <path
            id="link-gw-db"
            d={`M ${nodes.gateway.x} ${nodes.gateway.y} L ${nodes.database.x} ${nodes.database.y}`}
            stroke={isOffline ? "var(--color-crimson)" : (isDbAlarm ? "var(--color-crimson)" : "var(--border-muted)")}
            strokeWidth={1.5}
            className={`transition-colors duration-300 ${isOffline ? "opacity-20" : "opacity-60"}`}
          />
          {/* Link: Gateway -> Syslog */}
          <path
            id="link-gw-sys"
            d={`M ${nodes.gateway.x} ${nodes.gateway.y} L ${nodes.syslog.x} ${nodes.syslog.y}`}
            stroke={isOffline ? "var(--color-crimson)" : (isGwAlarm ? "var(--color-crimson)" : "var(--border-muted)")}
            strokeWidth={1.5}
            className={`transition-colors duration-300 ${isOffline ? "opacity-20" : "opacity-60"}`}
          />
          {/* Link: Database -> AI Core */}
          <path
            id="link-db-ai"
            d={`M ${nodes.database.x} ${nodes.database.y} L ${nodes.aiCore.x} ${nodes.aiCore.y}`}
            stroke={isOffline ? "var(--color-crimson)" : (isDbAlarm ? "var(--color-crimson)" : "var(--border-muted)")}
            strokeWidth={1.5}
            className={`transition-colors duration-300 ${isOffline ? "opacity-20" : "opacity-60"}`}
          />
          {/* Link: Syslog -> AI Core */}
          <path
            id="link-sys-ai"
            d={`M ${nodes.syslog.x} ${nodes.syslog.y} L ${nodes.aiCore.x} ${nodes.aiCore.y}`}
            stroke={isOffline ? "var(--color-crimson)" : (isGwAlarm ? "var(--color-crimson)" : "var(--border-muted)")}
            strokeWidth={1.5}
            className={`transition-colors duration-300 ${isOffline ? "opacity-20" : "opacity-60"}`}
          />

          {/* 2. Animated Flowing Packets (Native SVG animateMotion) */}
          {!isOffline && !isGwAlarm && !isDbAlarm && !isAiAlarm && (
            <>
              {/* Normal packets flowing to DB */}
              <circle r={2} fill="var(--color-cyan)" className="opacity-80">
                <animateMotion dur="3s" repeatCount="indefinite" path={`M ${nodes.gateway.x} ${nodes.gateway.y} L ${nodes.database.x} ${nodes.database.y}`} />
              </circle>
              {/* Normal packets flowing to Syslog */}
              <circle r={2} fill="var(--color-cyan)" className="opacity-80">
                <animateMotion dur="2.5s" repeatCount="indefinite" path={`M ${nodes.gateway.x} ${nodes.gateway.y} L ${nodes.syslog.x} ${nodes.syslog.y}`} />
              </circle>
              {/* Normal packets from DB to AI */}
              <circle r={2} fill="var(--color-cyan)" className="opacity-80">
                <animateMotion dur="3.5s" repeatCount="indefinite" path={`M ${nodes.database.x} ${nodes.database.y} L ${nodes.aiCore.x} ${nodes.aiCore.y}`} />
              </circle>
              {/* Normal packets from Syslog to AI */}
              <circle r={2} fill="var(--color-cyan)" className="opacity-80">
                <animateMotion dur="2.8s" repeatCount="indefinite" path={`M ${nodes.syslog.x} ${nodes.syslog.y} L ${nodes.aiCore.x} ${nodes.aiCore.y}`} />
              </circle>
            </>
          )}

          {/* Alarm packets flows (Red and faster) */}
          {!isOffline && isGwAlarm && (
            <circle r={2.5} fill="var(--color-crimson)" className="opacity-90">
              <animateMotion dur="1s" repeatCount="indefinite" path={`M ${nodes.gateway.x} ${nodes.gateway.y} L ${nodes.syslog.x} ${nodes.syslog.y}`} />
            </circle>
          )}
          {!isOffline && isDbAlarm && (
            <circle r={2.5} fill="var(--color-crimson)" className="opacity-90">
              <animateMotion dur="0.8s" repeatCount="indefinite" path={`M ${nodes.gateway.x} ${nodes.gateway.y} L ${nodes.database.x} ${nodes.database.y}`} />
            </circle>
          )}
          {!isOffline && isAiAlarm && (
            <circle r={2.5} fill="var(--color-crimson)" className="opacity-90 animate-pulse">
              <animateMotion dur="0.8s" repeatCount="indefinite" path={`M ${nodes.aiCore.x} ${nodes.aiCore.y} L ${nodes.gateway.x} ${nodes.gateway.y}`} />
            </circle>
          )}

          {/* 3. Infrastructure Server Nodes Rendering */}
          
          {/* Node 1: Ingress Gateway */}
          <g transform={`translate(${nodes.gateway.x - 20}, ${nodes.gateway.y - 20})`} className="cursor-pointer group">
            <circle
              cx={20}
              cy={20}
              r={18}
              fill="var(--bg-panel)"
              stroke={isOffline || isGwAlarm ? "var(--color-crimson)" : "var(--border-muted)"}
              strokeWidth={1.5}
              className="transition-all duration-300 group-hover:stroke-[var(--color-cyan)]"
            />
            {(isOffline || isGwAlarm) && (
              <circle
                cx={20}
                cy={20}
                r={22}
                fill="transparent"
                stroke="var(--color-crimson)"
                strokeWidth={1}
                className="animate-ping opacity-60"
              />
            )}
            <text x={20} y={24} fontSize={10} textAnchor="middle" fill={isOffline || isGwAlarm ? "var(--color-crimson)" : "var(--text-secondary)"}>
              🚪
            </text>
          </g>

          {/* Node 2: Database */}
          <g transform={`translate(${nodes.database.x - 20}, ${nodes.database.y - 20})`} className="cursor-pointer group">
            <circle
              cx={20}
              cy={20}
              r={18}
              fill="var(--bg-panel)"
              stroke={isOffline || isDbAlarm ? "var(--color-crimson)" : "var(--border-muted)"}
              strokeWidth={1.5}
              className="transition-all duration-300 group-hover:stroke-[var(--color-cyan)]"
            />
            {(isOffline || isDbAlarm) && (
              <circle
                cx={20}
                cy={20}
                r={22}
                fill="transparent"
                stroke="var(--color-crimson)"
                strokeWidth={1}
                className="animate-ping opacity-60"
              />
            )}
            <text x={20} y={24} fontSize={10} textAnchor="middle" fill={isOffline || isDbAlarm ? "var(--color-crimson)" : "var(--text-secondary)"}>
              🗄️
            </text>
          </g>

          {/* Node 3: Syslog */}
          <g transform={`translate(${nodes.syslog.x - 20}, ${nodes.syslog.y - 20})`} className="cursor-pointer group">
            <circle
              cx={20}
              cy={20}
              r={18}
              fill="var(--bg-panel)"
              stroke={isOffline || isSyslogAlarm ? "var(--color-crimson)" : "var(--border-muted)"}
              strokeWidth={1.5}
              className="transition-all duration-300 group-hover:stroke-[var(--color-cyan)]"
            />
            {(isOffline || isSyslogAlarm) && (
              <circle
                cx={20}
                cy={20}
                r={22}
                fill="transparent"
                stroke="var(--color-crimson)"
                strokeWidth={1}
                className="animate-ping opacity-60"
              />
            )}
            <text x={20} y={24} fontSize={10} textAnchor="middle" fill={isOffline || isSyslogAlarm ? "var(--color-crimson)" : "var(--text-secondary)"}>
              📑
            </text>
          </g>

          {/* Node 4: AI Core */}
          <g transform={`translate(${nodes.aiCore.x - 20}, ${nodes.aiCore.y - 20})`} className="cursor-pointer group">
            <circle
              cx={20}
              cy={20}
              r={18}
              fill="var(--bg-panel)"
              stroke={isOffline || isAiAlarm ? "var(--color-crimson)" : "var(--border-muted)"}
              strokeWidth={1.5}
              className="transition-all duration-300 group-hover:stroke-[var(--color-cyan)]"
            />
            {(isOffline || isAiAlarm) && (
              <circle
                cx={20}
                cy={20}
                r={22}
                fill="transparent"
                stroke="var(--color-crimson)"
                strokeWidth={1}
                className="animate-ping opacity-60"
              />
            )}
            <text x={20} y={24} fontSize={10} textAnchor="middle" fill={isOffline || isAiAlarm ? "var(--color-crimson)" : "var(--text-secondary)"}>
              🤖
            </text>
          </g>

          {/* 4. Labels Texts Rendering */}
          <text x={nodes.gateway.x} y={nodes.gateway.y + 32} fontSize={7} textAnchor="middle" fill={isOffline ? "var(--color-crimson)" : "var(--text-primary)"} fontWeight="bold">{nodes.gateway.label}</text>
          <text x={nodes.gateway.x} y={nodes.gateway.y + 40} fontSize={6} textAnchor="middle" fill={isOffline ? "var(--color-crimson)" : "var(--text-muted)"} fontFamily="monospace">{nodes.gateway.ip}</text>

          <text x={nodes.database.x} y={nodes.database.y - 12} fontSize={7} textAnchor="middle" fill={isOffline ? "var(--color-crimson)" : "var(--text-primary)"} fontWeight="bold">{nodes.database.label}</text>
          <text x={nodes.database.x} y={nodes.database.y - 4} fontSize={6} textAnchor="middle" fill={isOffline ? "var(--color-crimson)" : "var(--text-muted)"} fontFamily="monospace">{nodes.database.ip}</text>

          <text x={nodes.syslog.x} y={nodes.syslog.y + 32} fontSize={7} textAnchor="middle" fill={isOffline ? "var(--color-crimson)" : "var(--text-primary)"} fontWeight="bold">{nodes.syslog.label}</text>
          <text x={nodes.syslog.x} y={nodes.syslog.y + 40} fontSize={6} textAnchor="middle" fill={isOffline ? "var(--color-crimson)" : "var(--text-muted)"} fontFamily="monospace">{nodes.syslog.ip}</text>

          <text x={nodes.aiCore.x} y={nodes.aiCore.y + 32} fontSize={7} textAnchor="middle" fill={isOffline ? "var(--color-crimson)" : "var(--text-primary)"} fontWeight="bold">{nodes.aiCore.label}</text>
          <text x={nodes.aiCore.x} y={nodes.aiCore.y + 40} fontSize={6} textAnchor="middle" fill={isOffline ? "var(--color-crimson)" : "var(--text-muted)"} fontFamily="monospace">{nodes.aiCore.ip}</text>

          {/* Active alerts markers details text inside SVG */}
          {isOffline ? (
            <g transform="translate(180, 100)" className="fade-in">
              <rect x={0} y={0} width={140} height={20} rx={4} fill="var(--bg-obsidian)" stroke="var(--color-crimson)" strokeWidth={0.8} opacity={0.9} />
              <text x={70} y={12} fill="var(--color-crimson)" fontSize={7.5} fontWeight="bold" textAnchor="middle" fontFamily="monospace" className="animate-pulse">
                ⚠️ SYSTEM DAEMON OFFLINE
              </text>
            </g>
          ) : activeSimulation !== "none" && (
            <g transform="translate(180, 100)" className="fade-in">
              <rect x={0} y={0} width={140} height={20} rx={4} fill="var(--bg-obsidian)" stroke="var(--color-crimson)" strokeWidth={0.8} opacity={0.9} />
              <text x={70} y={12} fill="var(--color-crimson)" fontSize={7.5} fontWeight="bold" textAnchor="middle" fontFamily="monospace" className="animate-pulse">
                {activeSimulation === "brute_force" && "⚠️ SSH BRUTE FORCE BLOCKED"}
                {activeSimulation === "sql_injection" && "⚠️ DATABASE PROBE INTERCEPTED"}
                {activeSimulation === "ransomware" && "⚠️ OUTBOUND C2 ANOMALY"}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Telemetry Footer */}
      <div className="border-t border-[var(--border-muted)] pt-3.5 mt-4 text-[9px] text-[var(--text-muted)] flex justify-between items-center transition-colors duration-300 flex-shrink-0">
        <span>{isOffline ? "Active Routing: 0/4 Nodes Online" : "Active Routing: 4/4 Nodes Healthy"}</span>
        <span>{isOffline ? "SYSTEM DISCONNECTED" : "SYSTEM DIAGNOSTICS ACTIVE"}</span>
      </div>
    </div>
  );
}
