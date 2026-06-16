"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Preloader — a one-time intro: particles scatter across a dark veil, then
 * converge to form the Kyro logo, hold for a beat, disperse, and the veil
 * fades away to reveal the page. Shown once per browser session and skipped
 * entirely under prefers-reduced-motion (or if the logo can't be sampled).
 */
export default function Preloader() {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("kyro-intro") === "1";
    } catch {
      /* sessionStorage may be unavailable */
    }
    if (reduced || seen) return;

    setShow(true);
    try {
      sessionStorage.setItem("kyro-intro", "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!show) return;

    // lock scroll for the duration of the intro
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = window.innerWidth;
    let H = window.innerHeight;
    const setSize = () => {
      if (!canvas || !ctx) return;
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();

    type P = {
      x: number;
      y: number;
      tx: number;
      ty: number;
      delay: number;
      vx: number;
      vy: number;
    };
    let particles: P[] = [];

    const buildFromPoints = (pts: { x: number; y: number }[]) => {
      particles = pts.map((p) => {
        const ang = Math.random() * Math.PI * 2;
        const rad = Math.max(W, H) * (0.4 + Math.random() * 0.6);
        return {
          x: W / 2 + Math.cos(ang) * rad,
          y: H / 2 + Math.sin(ang) * rad,
          tx: p.x,
          ty: p.y,
          delay: Math.random() * 0.35,
          vx: Math.cos(ang) * (2 + Math.random() * 3),
          vy: Math.sin(ang) * (2 + Math.random() * 3),
        };
      });
    };

    // Sample target points from an offscreen render (logo, with text fallback).
    const sample = (
      drawTarget: (c: CanvasRenderingContext2D, w: number, h: number) => void
    ): { x: number; y: number }[] => {
      const sw = 600;
      const sh = 240;
      const off = document.createElement("canvas");
      off.width = sw;
      off.height = sh;
      const octx = off.getContext("2d")!;
      drawTarget(octx, sw, sh);
      const data = octx.getImageData(0, 0, sw, sh).data;
      const pts: { x: number; y: number }[] = [];
      const step = 5;
      const scale = Math.min((W * 0.5) / sw, (H * 0.35) / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      const ox = (W - dw) / 2;
      const oy = (H - dh) / 2;
      for (let y = 0; y < sh; y += step) {
        for (let x = 0; x < sw; x += step) {
          if (data[(y * sw + x) * 4 + 3] > 130) {
            pts.push({ x: ox + x * scale, y: oy + y * scale });
          }
        }
      }
      return pts;
    };

    const drawText = (c: CanvasRenderingContext2D, w: number, h: number) => {
      c.clearRect(0, 0, w, h);
      c.fillStyle = "#fff";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.font = "900 170px Syne, system-ui, sans-serif";
      c.fillText("KYRO", w / 2, h / 2 + 8);
    };

    let raf = 0;
    let start = 0;
    const ASSEMBLE = 1300;
    const HOLD = 520;
    const DISPERSE = 650;

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const loop = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      let phase: "assemble" | "hold" | "disperse" = "assemble";
      if (elapsed > ASSEMBLE + HOLD) phase = "disperse";
      else if (elapsed > ASSEMBLE) phase = "hold";

      for (const p of particles) {
        let alpha = 0.9;
        if (phase === "assemble") {
          const local = Math.min(
            1,
            Math.max(0, (elapsed / ASSEMBLE - p.delay) / (1 - p.delay))
          );
          const e = easeOut(local);
          p.x = p.x + (p.tx - p.x) * (0.12 + e * 0.14);
          p.y = p.y + (p.ty - p.y) * (0.12 + e * 0.14);
          alpha = 0.2 + local * 0.75;
        } else if (phase === "hold") {
          p.x += (p.tx - p.x) * 0.25;
          p.y += (p.ty - p.y) * 0.25;
        } else {
          const dp = Math.min(1, (elapsed - ASSEMBLE - HOLD) / DISPERSE);
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 1.02;
          p.vy *= 1.02;
          alpha = 0.9 * (1 - dp);
        }
        ctx.fillStyle = `rgba(212,217,63,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      if (elapsed > ASSEMBLE + HOLD + DISPERSE) {
        finish();
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = prevOverflow;
      setFading(true);
      window.setTimeout(() => setShow(false), 650);
    };

    // Try the brand logo first; fall back to a wordmark if sampling is empty.
    const img = new Image();
    let started = false;
    const begin = (pts: { x: number; y: number }[]) => {
      if (started) return;
      started = true;
      if (pts.length < 30) {
        buildFromPoints(sample(drawText));
      } else {
        buildFromPoints(pts);
      }
      raf = requestAnimationFrame(loop);
    };

    img.onload = () => {
      try {
        const pts = sample((c, w, h) => {
          c.clearRect(0, 0, w, h);
          const r = Math.min(w / img.width, h / img.height);
          const iw = img.width * r;
          const ih = img.height * r;
          c.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
        });
        begin(pts);
      } catch {
        begin([]); // tainted/empty → wordmark fallback
      }
    };
    img.onerror = () => begin([]);
    img.src = "/logo.svg";
    // Safety: never block the page if the image stalls.
    const guard = window.setTimeout(() => begin([]), 1200);

    window.addEventListener("resize", setSize);
    return () => {
      window.clearTimeout(guard);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[10000] bg-[#08080E] transition-opacity duration-[650ms] ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 type-eyebrow text-neutral-500 font-sans text-[11px] font-bold tracking-[0.35em] uppercase">
        Kyro Studio
      </div>
    </div>
  );
}
