"use client";

import React from "react";

interface StatusCardProps {
  title: string;
  value: string | number;
  color: "cyan" | "magenta" | "emerald" | "crimson" | "amber";
  statusText: string;
  icon?: React.ReactNode;
}

export default function StatusCard({ title, value, color, statusText, icon }: StatusCardProps) {
  // Map color names to our custom CSS glow classes
  const colorMap = {
    cyan: { text: "glow-text-cyan", border: "rgba(0, 242, 254, 0.15)", bgGlow: "rgba(0, 242, 254, 0.05)" },
    magenta: { text: "glow-text-magenta", border: "rgba(255, 0, 127, 0.15)", bgGlow: "rgba(255, 0, 127, 0.05)" },
    emerald: { text: "glow-text-emerald", border: "rgba(0, 245, 160, 0.15)", bgGlow: "rgba(0, 245, 160, 0.05)" },
    crimson: { text: "glow-text-crimson", border: "rgba(255, 0, 85, 0.15)", bgGlow: "rgba(255, 0, 85, 0.05)" },
    amber: { text: "text-[#FFB300] drop-shadow-[0_0_8px_rgba(255,179,0,0.3)]", border: "rgba(255, 179, 0, 0.15)", bgGlow: "rgba(255, 179, 0, 0.03)" }
  };

  const selectedColor = colorMap[color];

  return (
    <div 
      className="glass-card p-6 flex flex-col justify-between min-h-[140px] border relative overflow-hidden"
      style={{
        borderColor: selectedColor.border,
        boxShadow: `0 8px 32px 0 ${selectedColor.bgGlow}`
      }}
    >
      {/* Background soft color splash */}
      <div 
        className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-30"
        style={{ backgroundColor: color === "amber" ? "#FFB300" : `var(--color-${color})` }}
      />

      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="text-[10px] text-[#8F9CAE] font-bold uppercase tracking-wider">
            {title}
          </h3>
          <p className={`text-2xl font-extrabold mt-2 transition-all duration-300 ${selectedColor.text}`}>
            {value}
          </p>
        </div>
        {icon && <div className="text-white/40">{icon}</div>}
      </div>

      <div className="flex items-center gap-1.5 mt-4 z-10">
        <span 
          className="h-1.5 w-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: color === "amber" ? "#FFB300" : `var(--color-${color})` }}
        />
        <span className="text-[9px] text-[#8F9CAE] uppercase tracking-wider font-semibold">
          {statusText}
        </span>
      </div>
    </div>
  );
}
