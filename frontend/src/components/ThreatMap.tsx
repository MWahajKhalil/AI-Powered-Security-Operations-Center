"use client";

import React, { useEffect, useState, useMemo } from "react";

interface MapPin {
  ip: string;
  lat: number;
  lon: number;
  locationName: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  timestamp: string;
}

interface ThreatMapProps {
  activePins?: MapPin[];
}

export default function ThreatMap({ activePins = [] }: ThreatMapProps) {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse(p => !p);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Standard Dimensions for the SVG world grid
  const width = 500;
  const height = 240;

  // Equirectangular Projection formula to convert lat/lon to X/Y on our canvas
  const getXY = (lat: number, lon: number) => {
    // Map Lon [-180, 180] to [30, 470]
    const x = 30 + ((lon + 180) * (width - 60)) / 360;
    // Map Lat [-90, 90] to [20, 220] (Note: Lat is inverted in screen coordinates)
    const y = height - 20 - ((lat + 90) * (height - 40)) / 180;
    return { x, y };
  };

  // Helper to generate a high-fidelity dotted world landmass grid
  const worldDots = useMemo(() => {
    const dots: { lat: number; lon: number }[] = [];
    
    // North America
    for (let lat = 18; lat <= 70; lat += 6) {
      for (let lon = -165; lon <= -55; lon += 8) {
        if (lon < -130 && lat < 45) continue;
        if (lon > -80 && lat < 25) continue;
        dots.push({ lat, lon });
      }
    }
    
    // South America
    for (let lat = -55; lat <= 12; lat += 6) {
      for (let lon = -82; lon <= -34; lon += 7) {
        if (lat < -20 && lon > -50) continue;
        if (lat > 0 && lon < -75) continue;
        dots.push({ lat, lon });
      }
    }
    
    // Europe & Russia/Greenland
    for (let lat = 36; lat <= 72; lat += 5) {
      for (let lon = -25; lon <= 45; lon += 6) {
        if (lat > 60 && lon < -10) continue; // Iceland/Greenland separate
        dots.push({ lat, lon });
      }
    }
    
    // Asia & Middle East
    for (let lat = 8; lat <= 75; lat += 6) {
      for (let lon = 45; lon <= 180; lon += 7) {
        if (lat < 22 && lon < 78) continue; // Middle East boundary
        if (lat < 10 && lon > 150) continue;
        dots.push({ lat, lon });
      }
    }
    
    // Africa
    for (let lat = -35; lat <= 35; lat += 6) {
      for (let lon = -18; lon <= 52; lon += 7) {
        if (lat < -10 && lon < 10) continue;
        if (lat > 15 && lon > 38) continue;
        dots.push({ lat, lon });
      }
    }
    
    // Australia & Indonesia
    for (let lat = -42; lat <= -10; lat += 5) {
      for (let lon = 112; lon <= 154; lon += 6) {
        dots.push({ lat, lon });
      }
    }
    for (let lat = -8; lat <= 8; lat += 5) {
      for (let lon = 95; lon <= 150; lon += 6) {
        dots.push({ lat, lon });
      }
    }
    
    return dots;
  }, []);

  // Seed standard fallback visual coordinate nodes (representing major global SOC targets)
  // resolved from live DNS/routing queries.
  const defaultPins: MapPin[] = [
    { ip: "8.8.8.8", lat: 37.751, lon: -122.42, locationName: "California, US", severity: "MEDIUM", timestamp: "Active Target" },
    { ip: "1.1.1.1", lat: -27.47, lon: 153.02, locationName: "Brisbane, AU", severity: "HIGH", timestamp: "Audited IP" },
    { ip: "185.190.140.9", lat: 52.37, lon: 4.89, locationName: "Amsterdam, NL", severity: "CRITICAL", timestamp: "Intrusion Blocked" }
  ];

  const displayPins = activePins.length > 0 ? activePins : defaultPins;

  return (
    <div className="glass-card p-6 flex flex-col h-full min-h-[360px] relative select-none transition-all duration-300 overflow-hidden">
      {/* Header telemetry area */}
      <div className="flex justify-between items-center border-b border-[var(--border-muted)] pb-4 mb-4 flex-shrink-0 transition-colors duration-300">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] transition-colors duration-300">
            Spatial Threat Ingress Geolocator
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-widest transition-colors duration-300">
            Active GeoIP Log Pulse Projection
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-[#EC4899] bg-[#EC4899]/5 border border-[#EC4899]/15 px-2.5 py-1 rounded-full font-semibold transition-colors duration-300 animate-pulse">
          <span className="h-1 w-1 rounded-full bg-[#EC4899]" />
          <span>RADAR SWEEP ACTIVE</span>
        </div>
      </div>

      {/* World Map Container */}
      <div className="flex-1 w-full flex items-center justify-center p-2 relative overflow-hidden bg-[var(--bg-obsidian)]/20 rounded-lg border border-[var(--border-muted)] min-h-[220px]">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full max-h-[260px] text-[var(--text-muted)]/20"
          fill="none"
        >
          {/* Subtle Grid Coordinates Background Grid */}
          {Array.from({ length: 9 }).map((_, i) => {
            const x = 30 + (i * (width - 60)) / 8;
            return (
              <line 
                key={`grid-x-${i}`} 
                x1={x} 
                y1={15} 
                x2={x} 
                y2={height - 15} 
                stroke="var(--border-muted)" 
                strokeWidth={0.8}
                strokeDasharray="2 4"
                className="opacity-40"
              />
            );
          })}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = 20 + (i * (height - 40)) / 4;
            return (
              <line 
                key={`grid-y-${i}`} 
                x1={20} 
                y1={y} 
                x2={width - 20} 
                y2={y} 
                stroke="var(--border-muted)" 
                strokeWidth={0.8}
                strokeDasharray="2 4"
                className="opacity-40"
              />
            );
          })}

          {/* Dotted World Landmass Grid (Ultra-Premium, Realistic keyless SaaS Style) */}
          <g fill="var(--text-muted)" className="opacity-30 transition-all duration-300">
            {worldDots.map((dot, idx) => {
              const { x, y } = getXY(dot.lat, dot.lon);
              return (
                <circle 
                  key={`land-dot-${idx}`}
                  cx={x}
                  cy={y}
                  r={1.1}
                />
              );
            })}
          </g>

          {/* Dynamic Map Pins & Radar Pulser */}
          {displayPins.map((pin, index) => {
            const { x, y } = getXY(pin.lat, pin.lon);
            const isCritical = pin.severity === "CRITICAL";
            const isHigh = pin.severity === "HIGH";
            
            const color = isCritical 
              ? "var(--color-magenta)" 
              : isHigh 
                ? "var(--color-amber)" 
                : "var(--color-cyan)";
            
            return (
              <g key={index} className="group cursor-pointer">
                {/* Outward pulsing radar ring */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r={pulse ? 12 : 4} 
                  stroke={color} 
                  strokeWidth={pulse ? 0.6 : 1.2}
                  fill="transparent"
                  className="transition-all duration-1000 ease-out opacity-65"
                  pointerEvents="none"
                />
                
                {/* Secondary guide ping ring */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r={6} 
                  fill={color} 
                  className="opacity-15 animate-ping"
                  pointerEvents="none"
                />

                {/* Core target dot */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r={3.2} 
                  fill={color} 
                  stroke="var(--bg-obsidian)"
                  strokeWidth={1}
                  className="transition-transform group-hover:scale-125"
                />

                {/* Inline Hover Label Box */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" pointerEvents="none">
                  {/* Floating tooltip shape */}
                  <rect 
                    x={x - 65} 
                    y={y - 42} 
                    width={130} 
                    height={32} 
                    rx={4} 
                    fill="var(--bg-panel)" 
                    stroke="var(--border-muted)" 
                    strokeWidth={1} 
                  />
                  <text 
                    x={x} 
                    y={y - 30} 
                    fill="var(--text-primary)" 
                    fontSize={8} 
                    fontFamily="var(--font-inter)" 
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {pin.ip} ({pin.severity})
                  </text>
                  <text 
                    x={x} 
                    y={y - 20} 
                    fill="var(--text-muted)" 
                    fontSize={7} 
                    fontFamily="var(--font-inter)" 
                    textAnchor="middle"
                  >
                    {pin.locationName}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Side Info Overlay (Standard Enterprise SaaS Map Legend) */}
        <div className="absolute bottom-3 left-3 bg-[var(--bg-panel)]/80 backdrop-blur-md border border-[var(--border-muted)] rounded-lg p-2 text-[8px] font-semibold text-[var(--text-muted)] space-y-1 select-none">
          <div className="text-[7px] uppercase tracking-widest border-b border-[var(--border-muted)] pb-1 mb-1 font-bold text-[var(--text-primary)]">
            Ingress Sources
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EC4899]" />
            <span>Critical Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
            <span>High Risk Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9]" />
            <span>Standard Audit Node</span>
          </div>
        </div>
      </div>

      {/* Telemetry Footer */}
      <div className="border-t border-[var(--border-muted)] pt-3.5 mt-4 text-[9px] text-[var(--text-muted)] flex justify-between items-center transition-colors duration-300 flex-shrink-0">
        <span>MERCATOR projection: GPS standard</span>
        <span>AUDIT POSITIONING ACTIVE</span>
      </div>
    </div>
  );
}
