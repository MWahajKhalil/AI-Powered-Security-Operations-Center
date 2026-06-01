"use client";

import React, { useEffect, useRef } from "react";

export default function CyberGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Grid details
    const points: Array<{ x: number; y: number; originX: number; originY: number; rx: number; ry: number; speed: number; angle: number }> = [];
    const spacing = 75; // px distance between dots
    const mouse = { x: -1000, y: -1000, radius: 140 };

    // Generate grid points with slight orbital movement
    const columns = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;

    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * spacing;
        const y = r * spacing;
        points.push({
          x: x,
          y: y,
          originX: x,
          originY: y,
          rx: Math.random() * 4 - 2, // Orbit radius X
          ry: Math.random() * 4 - 2, // Orbit radius Y
          speed: 0.02 + Math.random() * 0.02,
          angle: Math.random() * Math.PI * 2
        });
      }
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Frame rendering loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint cybernetic background grid lines
      ctx.strokeStyle = "rgba(0, 242, 254, 0.015)";
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render points and dynamic pointer-link lasers
      points.forEach((p) => {
        // Orbital slow rotation
        p.angle += p.speed;
        p.x = p.originX + Math.cos(p.angle) * p.rx;
        p.y = p.originY + Math.sin(p.angle) * p.ry;

        // Calculate distance to mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let alpha = 0.12;

        // Dynamic link lines from mouse pointer
        if (dist < mouse.radius) {
          const strength = (mouse.radius - dist) / mouse.radius;
          alpha = 0.12 + strength * 0.35;

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          // Fades from electric cyan to deep purple
          const grad = ctx.createLinearGradient(p.x, p.y, mouse.x, mouse.y);
          grad.addColorStop(0, `rgba(0, 242, 254, ${strength * 0.15})`);
          grad.addColorStop(1, `rgba(127, 0, 255, ${strength * 0.05})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2 * strength;
          ctx.stroke();
        }

        // Draw glowing grid dots
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
