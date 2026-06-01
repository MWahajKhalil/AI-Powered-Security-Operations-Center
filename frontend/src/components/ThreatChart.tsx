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

  // Scale calculations helper
  const maxScans = 350;
  const getX = (index: number) => padding + (index * (width - 2 * padding)) / (data.length - 1);
  const getY = (scans: number) => height - padding - (scans * (height - 2 * padding)) / maxScans;
  const getRiskY = (risk: number) => height - padding - (risk * (height - 2 * padding)) / 100;

  // Formulate the line path for the Risk Index curve
  const riskPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getRiskY(d.risk)}`).join(" ");

  // Spacing width for hover detection columns
  const colWidth = (width - 2 * padding) / (data.length - 1);

  return (
    <div className="glass-card p-6 flex flex-col h-full border border-white/5 bg-[#0D1420]/45 min-h-[300px] relative select-none">
      {/* Header controls pane */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4 mb-4 flex-shrink-0">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Threat Metrics Timeline
          </h3>
          <p className="text-[10px] text-[#8F9CAE] mt-0.5 uppercase tracking-widest">
            Scan volumes & risk levels (7-Day Cycle)
          </p>
        </div>

        {/* Legend Interactive Buttons */}
        <div className="flex gap-2 text-[9px] text-[#8F9CAE] font-semibold">
          <button
            onClick={() => setShowScans(!showScans)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all duration-200 cursor-pointer ${
              showScans
                ? "bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/30"
                : "bg-black/15 text-white/30 border-white/5 hover:text-white/50"
            }`}
          >
            <span className={`h-2 w-2 rounded ${showScans ? "bg-[#0EA5E9]" : "bg-white/20"}`} />
            <span>Network Scans</span>
          </button>
          <button
            onClick={() => setShowRisk(!showRisk)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all duration-200 cursor-pointer ${
              showRisk
                ? "bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/30"
                : "bg-black/15 text-white/30 border-white/5 hover:text-white/50"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showRisk ? "bg-[#EC4899]" : "bg-white/20"}`} />
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
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
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
                stroke="rgba(255, 255, 255, 0.03)" 
                strokeDasharray="4 4"
                strokeWidth={1}
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
              stroke="rgba(14, 165, 233, 0.25)"
              strokeDasharray="2 2"
              strokeWidth={1.5}
              pointerEvents="none"
            />
          )}

          {/* Bars representation (Scans Volume) */}
          {showScans && data.map((d, index) => {
            const x = getX(index);
            const y = getY(d.scans);
            const barWidth = 14;
            const barHeight = height - padding - y;
            const isHovered = hoveredIndex === index;

            return (
              <g key={index} className="group">
                {/* Visual glow backdrop for active values */}
                <rect 
                  x={x - barWidth / 2} 
                  y={y} 
                  width={barWidth} 
                  height={barHeight} 
                  fill="url(#barGrad)" 
                  rx={3}
                  className="transition-all duration-200"
                  style={{
                    opacity: hoveredIndex !== null && !isHovered ? 0.35 : 1,
                  }}
                />
                {/* Thin top cap glowing line */}
                <line 
                  x1={x - barWidth / 2} 
                  y1={y} 
                  x2={x + barWidth / 2} 
                  y2={y} 
                  stroke="#0EA5E9" 
                  strokeWidth={2}
                  className="transition-opacity duration-200"
                  style={{
                    opacity: isHovered ? 1 : 0.6,
                  }}
                />
              </g>
            );
          })}

          {/* Glowing spline curve (Threat Risk Line) */}
          {showRisk && (
            <>
              <path 
                d={riskPath} 
                stroke="url(#lineGlow)" 
                strokeWidth={3} 
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glowEffect)"
                className="transition-opacity duration-200"
                style={{
                  opacity: hoveredIndex !== null ? 0.4 : 0.9,
                }}
              />
              <path 
                d={riskPath} 
                stroke="url(#lineGlow)" 
                strokeWidth={2.5} 
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
                r={isHovered ? 5.5 : 4}
                fill="#EC4899"
                stroke="#FFFFFF"
                strokeWidth={isHovered ? 2 : 1.5}
                filter={isHovered ? "url(#glowEffect)" : ""}
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
                fill={isHovered ? "#F8FAFC" : "#8F9CAE"} 
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

        {/* Floating coordinates Tooltip absolute positioned relative to container */}
        {hoveredIndex !== null && (
          <div 
            className="absolute bg-[#0C0E14]/95 backdrop-blur-md border border-white/10 rounded-lg p-2.5 shadow-2xl text-[10px] text-slate-300 pointer-events-none z-30 transition-all duration-100 ease-out flex flex-col gap-1 min-w-[120px]"
            style={{
              left: `${(getX(hoveredIndex) / width) * 100}%`,
              top: "40%",
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="font-extrabold text-white text-[9px] uppercase tracking-wider border-b border-white/5 pb-1 flex justify-between items-center gap-2">
              <span>{data[hoveredIndex].day} System Metrics</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9] animate-pulse" />
            </div>
            
            {showScans && (
              <div className="flex items-center justify-between gap-4 mt-0.5">
                <span className="text-[#8F9CAE]">Inbound Scans:</span>
                <span className="font-mono font-bold text-[#0EA5E9]">{data[hoveredIndex].scans}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#8F9CAE]">Blocked Hits:</span>
              <span className="font-mono font-bold text-[#F59E0B]">{data[hoveredIndex].blocked}</span>
            </div>

            {showRisk && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#8F9CAE]">Threat Index:</span>
                <span className="font-mono font-bold text-[#EC4899]">{data[hoveredIndex].risk}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-white/5 pt-3.5 mt-4 text-[9px] text-[#8F9CAE] flex justify-between items-center flex-shrink-0">
        <span>SENSOR STATUS: NORMAL SCAN RATES</span>
        <span>RADAR OVERVIEW STABLE</span>
      </div>
    </div>
  );
}
