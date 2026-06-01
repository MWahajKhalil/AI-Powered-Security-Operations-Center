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
    cyan: { text: "text-[var(--color-cyan)]", border: "rgba(14, 165, 233, 0.15)", bgGlow: "rgba(14, 165, 233, 0.04)" },
    magenta: { text: "text-[var(--color-magenta)]", border: "rgba(236, 72, 153, 0.15)", bgGlow: "rgba(236, 72, 153, 0.04)" },
    emerald: { text: "text-[var(--color-emerald)]", border: "rgba(16, 185, 129, 0.15)", bgGlow: "rgba(16, 185, 129, 0.04)" },
    crimson: { text: "text-[var(--color-crimson)]", border: "rgba(239, 68, 68, 0.15)", bgGlow: "rgba(239, 68, 68, 0.04)" },
    amber: { text: "text-[var(--color-amber)]", border: "rgba(245, 158, 11, 0.15)", bgGlow: "rgba(245, 158, 11, 0.04)" }
  };

  const selectedColor = colorMap[color];

  return (
    <div 
      className="glass-card p-6 flex flex-col justify-between min-h-[140px] border relative overflow-hidden transition-all duration-300"
      style={{
        borderColor: selectedColor.border,
        boxShadow: `0 8px 32px 0 ${selectedColor.bgGlow}`
      }}
    >
      {/* Background soft color splash */}
      <div 
        className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-20 transition-all duration-300"
        style={{ backgroundColor: `var(--color-${color})` }}
      />

      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider transition-colors duration-300">
            {title}
          </h3>
          <p className={`text-2xl font-extrabold mt-2 transition-all duration-300 ${selectedColor.text}`}>
            {value}
          </p>
        </div>
        {icon && <div className="text-[var(--text-muted)]/50 transition-colors duration-300">{icon}</div>}
      </div>

      <div className="flex items-center gap-1.5 mt-4 z-10">
        <span 
          className="h-1.5 w-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: `var(--color-${color})` }}
        />
        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold transition-colors duration-300">
          {statusText}
        </span>
      </div>
    </div>
  );
}
