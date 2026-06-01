"use client";

import React from "react";

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

  return (
    <div className="glass-card p-6 flex flex-col h-full border border-white/5 bg-[#0D1420]/45 min-h-[300px]">
      <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Threat Metrics Timeline
          </h3>
          <p className="text-[10px] text-[#8F9CAE] mt-0.5 uppercase tracking-widest">
            Scan volumes & risk levels (7-Day Cycle)
          </p>
        </div>
        <div className="flex gap-4 text-[9px] text-[#8F9CAE] font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded bg-gradient-to-t from-[#00F2FE]/40 to-[#00F2FE]" />
            <span>Network Scans</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#FF007F] shadow-[0_0_6px_#FF007F]" />
            <span>Risk Index (%)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas for Chart */}
      <div className="flex-1 w-full flex items-center justify-center p-2 overflow-hidden">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full max-h-[220px]"
          fill="none"
        >
          {/* Gradients declarations */}
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7F00FF" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF007F" />
              <stop offset="50%" stopColor="#7F00FF" />
              <stop offset="100%" stopColor="#00F2FE" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
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

          {/* Bars representation (Scans Volume) */}
          {data.map((d, index) => {
            const x = getX(index);
            const y = getY(d.scans);
            const barWidth = 14;
            const barHeight = height - padding - y;

            return (
              <g key={index} className="group cursor-pointer">
                {/* Visual glow backdrop for active values */}
                <rect 
                  x={x - barWidth / 2} 
                  y={y} 
                  width={barWidth} 
                  height={barHeight} 
                  fill="url(#barGrad)" 
                  rx={3}
                />
                {/* Thin top cap glowing line */}
                <line 
                  x1={x - barWidth / 2} 
                  y1={y} 
                  x2={x + barWidth / 2} 
                  y2={y} 
                  stroke="#00F2FE" 
                  strokeWidth={2}
                  className="opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </g>
            );
          })}

          {/* Glowing spline curve (Threat Risk Line) */}
          <path 
            d={riskPath} 
            stroke="url(#lineGlow)" 
            strokeWidth={3} 
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowEffect)"
            className="opacity-90"
          />

          {/* Data Points on Risk Spline */}
          {data.map((d, index) => {
            const x = getX(index);
            const y = getRiskY(d.risk);

            return (
              <circle 
                key={index}
                cx={x}
                cy={y}
                r={4}
                fill="#FF007F"
                stroke="#FFFFFF"
                strokeWidth={1.5}
                filter="url(#glowEffect)"
                className="cursor-pointer hover:scale-125 transition-transform"
              />
            );
          })}

          {/* X Axis Labels */}
          {data.map((d, index) => {
            const x = getX(index);
            return (
              <text 
                key={index} 
                x={x} 
                y={height - 8} 
                fill="#8F9CAE" 
                fontSize={9} 
                fontFamily="var(--font-inter)"
                fontWeight="bold"
                textAnchor="middle"
                opacity={0.6}
              >
                {d.day}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="border-t border-white/5 pt-3.5 mt-4 text-[9px] text-[#8F9CAE] flex justify-between items-center">
        <span>SENSOR STATUS: NORMAL SCAN RATES</span>
        <span>RADAR OVERVIEW STABLE</span>
      </div>
    </div>
  );
}
