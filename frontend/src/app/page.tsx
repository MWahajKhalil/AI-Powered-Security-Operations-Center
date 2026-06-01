"use client";

import React from "react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#080C14] text-white">
      {/* Premium Glassmorphic Welcome Card */}
      <div className="glass-card max-w-xl w-full p-8 text-center fade-in pulse-glow-cyan">
        {/* Glow Header */}
        <h1 className="text-2xl font-bold tracking-wider glow-text-cyan mb-2">
          AI-POWERED SOC CENTER
        </h1>
        <p className="text-sm text-[#8F9CAE] uppercase tracking-widest mb-6">
          Phase 8: Scaffolding Completed
        </p>

        {/* Status Section */}
        <div className="border border-white/5 bg-white/2 rounded-lg p-5 mb-6 text-left text-sm leading-relaxed">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-[#00F5A0] shadow-[0_0_8px_#00F5A0]" />
            <span className="font-semibold text-[#00F5A0]">System Scaffolding Online</span>
          </div>
          <p className="text-[#8F9CAE] mb-3">
            The Next.js framework has been successfully initialized and converted to the high-performance **pnpm** package manager.
          </p>
          <ul className="space-y-1.5 text-xs text-white/70">
            <li className="flex items-center gap-2">
              <span className="text-[#00F2FE]">✓</span> Next.js App Router & TypeScript Active
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#00F2FE]">✓</span> pnpm Virtual Content-Addressable Store Linked
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#00F2FE]">✓</span> Custom Cyber-Obsidian CSS Tokens Configured
            </li>
          </ul>
        </div>

        {/* Micro-Animation Previews */}
        <div className="flex items-center justify-between border-t border-white/5 pt-6 text-xs text-[#8F9CAE]">
          <div className="flex items-center gap-2">
            <span>Terminal pulse:</span>
            <span className="h-2 w-2 rounded-full bg-[#00F2FE] pulse-glow-cyan" />
          </div>
          <div className="flex items-center gap-2">
            <span>Agent stream wave:</span>
            <div className="wave-container">
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-[#8F9CAE]/60 tracking-wider">
        PREPARED FOR PHASE 9 LAYOUT & SERVER HEALTH INTEGRATION
      </p>
    </div>
  );
}
