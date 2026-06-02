"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";

interface MapPin {
  ip: string;
  lat: number;
  lon: number;
  locationName: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  timestamp: string;
  isLatest?: boolean;
}

interface ThreatMapProps {
  activePins?: MapPin[];
}

// Google Maps script loader helper
const loadGoogleMapsScript = (apiKey: string, callback: () => void) => {
  if (typeof window === "undefined") return;
  if ((window as any).google && (window as any).google.maps) {
    callback();
    return;
  }
  
  const existingScript = document.getElementById("google-maps-script");
  if (existingScript) {
    existingScript.addEventListener("load", callback);
    return;
  }

  const script = document.createElement("script");
  script.id = "google-maps-script";
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
  script.async = true;
  script.defer = true;
  
  script.onload = () => {
    callback();
  };
  
  script.onerror = () => {
    console.warn("Failed to load Google Maps SDK script.");
  };
  
  document.head.appendChild(script);
};

// Premium Midnight dark-mode style configurations for Google Maps
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0B0E14" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0B0E14" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8A94A6" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#EC4899" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6366F1" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1B2230" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1E293B" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0F172A" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748B" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#07090E" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38BDF8" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#07090E" }],
  },
];

export default function ThreatMap({ activePins = [] }: ThreatMapProps) {
  const [pulse, setPulse] = useState(true);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const googleMapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse(p => !p);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Attempt to load Google Maps SDK
  useEffect(() => {
    if (apiKey) {
      loadGoogleMapsScript(apiKey, () => {
        setMapsLoaded(true);
      });
    }
  }, [apiKey]);

  // Standard Dimensions for the SVG world grid fallback
  const width = 500;
  const height = 240;

  // Equirectangular Projection formula to convert lat/lon to X/Y on our canvas
  const getXY = (lat: number, lon: number) => {
    const x = 30 + ((lon + 180) * (width - 60)) / 360;
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
        if (lat > 60 && lon < -10) continue;
        dots.push({ lat, lon });
      }
    }
    
    // Asia & Middle East
    for (let lat = 8; lat <= 75; lat += 6) {
      for (let lon = 45; lon <= 180; lon += 7) {
        if (lat < 22 && lon < 78) continue;
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

  // Seed standard fallback coordinates
  const defaultPins: MapPin[] = [
    { ip: "8.8.8.8", lat: 37.751, lon: -122.42, locationName: "California, US", severity: "MEDIUM", timestamp: "Active Target" },
    { ip: "1.1.1.1", lat: -27.47, lon: 153.02, locationName: "Brisbane, AU", severity: "HIGH", timestamp: "Audited IP" },
    { ip: "185.190.140.9", lat: 52.37, lon: 4.89, locationName: "Amsterdam, NL", severity: "CRITICAL", timestamp: "Intrusion Blocked" }
  ];

  const displayPins = activePins.length > 0 ? activePins : defaultPins;

  // Sync Google Map instance with updates
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || typeof window === "undefined" || !(window as any).google) return;

    if (!googleMapInstance.current) {
      googleMapInstance.current = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 25, lng: 0 },
        zoom: 1.8,
        styles: darkMapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        backgroundColor: "#07090E"
      });

      infoWindowRef.current = new (window as any).google.maps.InfoWindow();
    }

    const map = googleMapInstance.current;

    // Clear previous markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Add markers for current pins
    displayPins.forEach(pin => {
      const isLatest = pin.isLatest === true;
      const color = isLatest
        ? "#10B981" // Vibrant Emerald Green for the latest threat dot
        : (pin.severity === "CRITICAL" 
          ? "#EC4899" 
          : pin.severity === "HIGH" 
            ? "#F59E0B" 
            : "#0EA5E9");

      const marker = new (window as any).google.maps.Marker({
        position: { lat: pin.lat, lng: pin.lon },
        map,
        title: isLatest ? `[LATEST DETECTED] ${pin.ip}` : pin.ip,
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1.0,
          strokeColor: isLatest ? "#FFFFFF" : "#05080C",
          strokeWeight: isLatest ? 2.2 : 1.8,
          scale: isLatest ? 8.5 : 6
        },
        zIndex: isLatest ? 1000 : 1
      });

      marker.addListener("click", () => {
        const contentString = `
          <div style="background-color: #0A0C10; color: #F1F5F9; font-family: monospace; font-size: 10px; padding: 6px; border-radius: 4px; border: 1px solid #1E293B;">
            <div style="font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 3px; margin-bottom: 4px; color: ${color};">
              🚨 ${pin.ip} (${pin.severity})
            </div>
            <div style="margin-bottom: 2px;"><strong>Location:</strong> ${pin.locationName}</div>
            <div><strong>Time:</strong> ${pin.timestamp}</div>
          </div>
        `;
        infoWindowRef.current.setContent(contentString);
        infoWindowRef.current.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  }, [mapsLoaded, displayPins]);

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
          <span>{apiKey && mapsLoaded ? "GOOGLE MAPS SYNCHRONIZED" : "RADAR SWEEP ACTIVE"}</span>
        </div>
      </div>

      {/* World Map Container */}
      <div className="flex-1 w-full flex items-center justify-center p-2 relative overflow-hidden bg-[var(--bg-obsidian)]/20 rounded-lg border border-[var(--border-muted)] min-h-[220px]">
        {apiKey && mapsLoaded ? (
          <div ref={mapRef} className="w-full h-full min-h-[240px] rounded-lg overflow-hidden border border-[var(--border-muted)]" />
        ) : (
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
              const isLatest = pin.isLatest === true;
              const isCritical = pin.severity === "CRITICAL";
              const isHigh = pin.severity === "HIGH";
              
              const color = isLatest
                ? "#10B981" // Vibrant Emerald Green for the latest threat dot
                : (isCritical 
                  ? "var(--color-magenta)" 
                  : isHigh 
                    ? "var(--color-amber)" 
                    : "var(--color-cyan)");
              
              const radius = isLatest ? 5.5 : 3.2;
              
              return (
                <g key={index} className="group cursor-pointer">
                  {/* Outward pulsing radar ring */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={pulse ? (isLatest ? 18 : 12) : 4} 
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
                    r={isLatest ? 9 : 6} 
                    fill={color} 
                    className="opacity-15 animate-ping"
                    pointerEvents="none"
                  />

                  {/* Core target dot */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={radius} 
                    fill={color} 
                    stroke={isLatest ? "#FFFFFF" : "var(--bg-obsidian)"}
                    strokeWidth={isLatest ? 1.5 : 1}
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
        )}

        {/* Floating Side Info Overlay (Standard Enterprise SaaS Map Legend) */}
        <div className="absolute bottom-3 left-3 bg-[var(--bg-panel)]/80 backdrop-blur-md border border-[var(--border-muted)] rounded-lg p-2 text-[8px] font-semibold text-[var(--text-muted)] space-y-1 select-none z-10">
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
        <span>{apiKey && mapsLoaded ? "MERCATOR projection: Google Maps" : "MERCATOR projection: GPS standard"}</span>
        <span>{apiKey && mapsLoaded ? "INTERACTIVE ROTATION LOCKED" : "AUDIT POSITIONING ACTIVE"}</span>
      </div>
    </div>
  );
}
