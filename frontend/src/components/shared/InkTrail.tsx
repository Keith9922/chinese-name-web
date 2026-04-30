"use client";

import { useEffect, useRef } from "react";

/**
 * A subtle ink-drop cursor trail: small dark spots that follow the cursor and
 * fade away within ~600ms. Renders to a pinned-screen canvas so it never
 * affects layout.
 */
export default function InkTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<{ x: number; y: number; r: number; born: number }[]>([]);
  const lastEmit = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) return; // no cursor on touch devices

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastEmit.current < 18) return; // throttle
      lastEmit.current = now;
      const drops = dropsRef.current;
      drops.push({
        x: e.clientX,
        y: e.clientY,
        r: 2 + Math.random() * 3,
        born: now,
      });
      if (drops.length > 60) drops.splice(0, drops.length - 60);
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const tick = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const drops = dropsRef.current;
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        const age = (now - d.born) / 700;
        if (age >= 1) {
          drops.splice(i, 1);
          continue;
        }
        const alpha = 0.18 * (1 - age);
        const r = d.r * (1 + age * 1.4);
        ctx.beginPath();
        ctx.fillStyle = `rgba(31, 20, 16, ${alpha})`;
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] mix-blend-multiply"
    />
  );
}
