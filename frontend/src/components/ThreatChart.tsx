"use client";

import React, { useState } from "react";

export default function ThreatChart() {
  // Static timeline data representing last 7 days in the SOC Center
  const data = [
    { day: "Mon", scans: 140, blocked: 12, risk: 35 },
    { day: "Tue", scans: 185, blocked: 22, risk: 48 },
    { day: "Wed", scans: 230, blocked: 45, risk: 78 },
    { day: "Thu", scans: 170, blocked: 18, risk: 42 },
    { day: "Fri", scans: 295, blocked: 38, risk: 65 },
    { day: "Sat", scans: 110, blocked: 8,  risk: 20 },
    { day: "Sun", scans: 165, blocked: 14, risk: 30 }
  ];

  // Interactive UI States
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showScans, setShowScans] = useState<boolean>(true);
  const [showRisk, setShowRisk] = useState<boolean>(true);

  // Chart configuration dimensions
  const width = 500;
  const height = 180;
  const padding = 30;

  // Chart limits configuration
  const maxScans = 350;

  // Projections onto SVG Grid
  const getX = (index: number): number => {
    return padding + (index * (width - 2 * padding)) / (data.length - 1);
  };

  const getY = (scans: number): number => {
    return height - padding - (scans * (height - 2 * padding)) / maxScans;
  };

  const getRiskY = (risk: number): number => {
    return height - padding - (risk * (height - 2 * padding)) / 100;
  };

  // Formulate the line path for the Risk Index curve
  const riskPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getRiskY(d.risk)}`).join(" ");

  // Spacing width for hover detection columns
  const colWidth = (width - 2 * padding) / (data.length - 1);

  return (
    <div className="glass-card p-6 flex flex-col h-full min-h-[360px] relative select-none transition-all duration-300">
      {/* Header Controls Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--border-muted)] pb-4 mb-4 flex-shrink-0 transition-colors duration-300">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] transition-colors duration-300">
            Threat Metrics Timeline
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-widest transition-colors duration-300">
            Scan volumes & risk levels (7-Day Cycle)
          </p>
        </div>

        {/* Legend Interactive Buttons */}
        <div className="flex gap-2 text-[9px] text-[var(--text-muted)] font-semibold transition-colors duration-300">
          <button
            type="button"
            onClick={() => setShowScans(!showScans)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all duration-200 cursor-pointer ${
              showScans
                ? "bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/30"
                : "bg-[var(--bg-obsidian)]/20 text-[var(--text-muted)]/40 border-[var(--border-muted)] hover:text-[var(--text-muted)]"
            }`}
          >
            <span className={`h-2 w-2 rounded ${showScans ? "bg-[#0EA5E9]" : "bg-[var(--text-muted)]/30"}`} />
            <span>Network Scans</span>
          </button>
          <button
            type="button"
            onClick={() => setShowRisk(!showRisk)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all duration-200 cursor-pointer ${
              showRisk
                ? "bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/30"
                : "bg-[var(--bg-obsidian)]/20 text-[var(--text-muted)]/40 border-[var(--border-muted)] hover:text-[var(--text-muted)]"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showRisk ? "bg-[#EC4899]" : "bg-[var(--text-muted)]/30"}`} />
            <span>Risk Index (%)</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas for Chart */}
      <div className="flex-1 w-full flex items-center justify-center p-2 overflow-hidden relative">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full max-h-[220px]"
          fill="none"
        >
          {/* Gradients declarations */}
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding + ratio * (height - 2 * padding);
            return (
              <line 
                key={index} 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="var(--border-muted)" 
                strokeDasharray="3 3"
                strokeWidth={1}
                className="transition-colors duration-300"
              />
            );
          })}

          {/* Vertical Mouse Follower Guide Line */}
          {hoveredIndex !== null && (
            <line
              x1={getX(hoveredIndex)}
              y1={padding - 5}
              x2={getX(hoveredIndex)}
              y2={height - padding + 5}
              stroke="#0EA5E9"
              strokeDasharray="2 2"
              strokeWidth={1.2}
              className="opacity-25"
              pointerEvents="none"
            />
          )}

          {/* Bars representation (Scans Volume) */}
          {showScans && data.map((d, index) => {
            const x = getX(index);
            const y = getY(d.scans);
            const barWidth = 10;
            const barHeight = height - padding - y;
            const isHovered = hoveredIndex === index;

            return (
              <g key={index} className="group">
                <rect 
                  x={x - barWidth / 2} 
                  y={y} 
                  width={barWidth} 
                  height={barHeight} 
                  fill="url(#barGrad)" 
                  rx={2.2}
                  className="transition-all duration-200"
                  style={{
                    opacity: hoveredIndex !== null && !isHovered ? 0.35 : 1,
                  }}
                />
                {/* Clean geometric top cap line instead of heavy shadows */}
                <line 
                  x1={x - barWidth / 2} 
                  y1={y} 
                  x2={x + barWidth / 2} 
                  y2={y} 
                  stroke="#0EA5E9" 
                  strokeWidth={1.8}
                  className="transition-opacity duration-200"
                  style={{
                    opacity: isHovered ? 1 : 0.65,
                  }}
                />
              </g>
            );
          })}

          {/* Clean spline curve (Threat Risk Line) */}
          {showRisk && (
            <>
              <path 
                d={riskPath} 
                stroke="url(#lineGlow)" 
                strokeWidth={2.2} 
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#subtleGlow)"
                className="opacity-80 transition-all duration-200"
                style={{
                  opacity: hoveredIndex !== null ? 0.45 : 0.8,
                }}
              />
              <path 
                d={riskPath} 
                stroke="url(#lineGlow)" 
                strokeWidth={1.8} 
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-100"
              />
            </>
          )}

          {/* Data Points on Risk Spline */}
          {showRisk && data.map((d, index) => {
            const x = getX(index);
            const y = getRiskY(d.risk);
            const isHovered = hoveredIndex === index;

            return (
              <circle 
                key={index}
                cx={x}
                cy={y}
                r={isHovered ? 5.2 : 3.8}
                fill="#EC4899"
                stroke="var(--bg-panel)"
                strokeWidth={isHovered ? 2 : 1.5}
                className="transition-all duration-200"
                style={{
                  opacity: hoveredIndex !== null && !isHovered ? 0.35 : 1,
                }}
              />
            );
          })}

          {/* X Axis Labels */}
          {data.map((d, index) => {
            const x = getX(index);
            const isHovered = hoveredIndex === index;
            return (
              <text 
                key={index} 
                x={x} 
                y={height - 8} 
                fill={isHovered ? "var(--text-primary)" : "var(--text-muted)"} 
                fontSize={9} 
                fontFamily="var(--font-inter)"
                fontWeight="bold"
                textAnchor="middle"
                className="transition-all duration-200"
                style={{
                  opacity: isHovered ? 1 : 0.6,
                }}
              >
                {d.day}
              </text>
            );
          })}

          {/* Invisible rect columns to capture mouse hover continuously */}
          {data.map((_, index) => {
            return (
              <rect
                key={`trigger-${index}`}
                x={getX(index) - colWidth / 2}
                y={padding}
                width={colWidth}
                height={height - 2 * padding}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseMove={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip positioned relative to container */}
        {hoveredIndex !== null && (
          <div 
            className="absolute bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-muted)] rounded-lg p-2.5 shadow-2xl text-[10px] text-[var(--text-muted)] pointer-events-none z-30 transition-all duration-100 ease-out flex flex-col gap-1 min-w-[125px]"
            style={{
              left: `${(getX(hoveredIndex) / width) * 100}%`,
              top: "40%",
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="font-bold text-[var(--text-primary)] text-[9px] uppercase tracking-wider border-b border-[var(--border-muted)] pb-1 flex justify-between items-center gap-2 transition-colors duration-300">
              <span>{data[hoveredIndex].day} System Metrics</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9] animate-pulse" />
            </div>
            
            {showScans && (
              <div className="flex items-center justify-between gap-4 mt-0.5 font-mono text-[9px]">
                <span className="text-[var(--text-muted)]/75">Inbound Scans:</span>
                <span className="font-bold text-[#0EA5E9]">{data[hoveredIndex].scans}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between gap-4 font-mono text-[9px]">
              <span className="text-[var(--text-muted)]/75">Blocked Hits:</span>
              <span className="font-bold text-[var(--color-amber)]">{data[hoveredIndex].blocked}</span>
            </div>

            {showRisk && (
              <div className="flex items-center justify-between gap-4 font-mono text-[9px]">
                <span className="text-[var(--text-muted)]/75">Threat Index:</span>
                <span className="font-bold text-[#EC4899]">{data[hoveredIndex].risk}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sensor footer */}
      <div className="border-t border-[var(--border-muted)] pt-3.5 mt-4 text-[9px] text-[var(--text-muted)] flex justify-between items-center transition-colors duration-300 flex-shrink-0">
        <span>SENSOR STATUS: NORMAL SCAN RATES</span>
        <span>RADAR OVERVIEW STABLE</span>
      </div>
    </div>
  );
}
