"use client";

import { useEffect, useRef } from "react";

/**
 * ParticleSphere — a GPU-friendly 2D-canvas particle sphere that breathes,
 * auto-rotates and parallax-tilts toward the cursor. No WebGL dependency, so it
 * stays light and reliable while reading as a living, intelligent "core".
 *
 *  - Fibonacci-distributed points → even, organic sphere.
 *  - Additive blending + depth-sorted draw → soft volumetric glow.
 *  - Pauses when the tab is hidden; renders a single static frame under
 *    prefers-reduced-motion.
 */
export default function ParticleSphere({
  className = "",
  count = 720,
}: {
  className?: string;
  count?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    // Build the sphere once (unit vectors via Fibonacci spiral).
    const pts: { x: number; y: number; z: number }[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Pointer parallax (eased toward target).
    let targetRX = 0;
    let targetRY = 0;
    let rotX = 0;
    let rotY = 0;
    const onMove = (e: MouseEvent) => {
      targetRY = (e.clientX / window.innerWidth - 0.5) * 0.9;
      targetRX = (e.clientY / window.innerHeight - 0.5) * 0.9;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let spin = 0;
    let raf = 0;
    let running = true;

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!running) return;

      spin += 0.0016;
      rotX += (targetRX - rotX) * 0.05;
      rotY += (targetRY - rotY) * 0.05;

      const radius = Math.min(w, h) * 0.42;
      const cx = w / 2;
      const cy = h / 2;
      const breathe = reduced ? 1 : 1 + Math.sin(t * 0.0009) * 0.04;

      const ay = spin + rotY;
      const ax = rotX;
      const cosY = Math.cos(ay);
      const sinY = Math.sin(ay);
      const cosX = Math.cos(ax);
      const sinX = Math.sin(ax);

      const proj: { sx: number; sy: number; depth: number; size: number }[] =
        [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        // rotate Y
        let x = p.x * cosY - p.z * sinY;
        let z = p.x * sinY + p.z * cosY;
        // rotate X
        const y = p.y * cosX - z * sinX;
        z = p.y * sinX + z * cosX;
        x *= radius * breathe;
        const yy = y * radius * breathe;
        const persp = 1 / (1.6 - z * 0.6);
        proj.push({
          sx: cx + x * persp,
          sy: cy + yy * persp,
          depth: z,
          size: persp,
        });
      }
      proj.sort((a, b) => a.depth - b.depth);

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < proj.length; i++) {
        const p = proj[i];
        const f = (p.depth + 1) / 2; // 0 (back) → 1 (front)
        const radiusDot = (0.6 + f * 1.9) * p.size;
        const alpha = 0.12 + f * 0.6;
        // brand blend: navy in the back, yellow toward the front
        const cr = Math.round(96 + f * (212 - 96));
        const cg = Math.round(90 + f * (217 - 90));
        const cb = Math.round(214 + f * (63 - 214));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        ctx.arc(p.sx, p.sy, Math.max(0.4, radiusDot), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      if (reduced) running = false; // one static frame only
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      running = !document.hidden && !reduced;
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
