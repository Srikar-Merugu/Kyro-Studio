"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ZagrebHero — a cinematic, full-bleed establishing shot of Zagreb at dusk.
 *
 * It renders a procedural, parallax skyline (depth layers, twinkling windows,
 * the cathedral twin-spires, drifting haze and "data arcs" of light running
 * across the city) so the hero looks like a slow, living aerial shot with zero
 * external assets. Drop a real clip at `/public/zagreb.mp4` and it fades in on
 * top automatically. Honors prefers-reduced-motion (renders a calm static
 * frame and skips video autoplay drift).
 */
export default function ZagrebHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setReduced(prefersReduced);

    let W = 0;
    let H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Win = { x: number; y: number; w: number; h: number; phase: number };
    type Bldg = { x: number; y: number; w: number; h: number; c: string; wins: Win[] };
    type LayerCfg = {
      baseY: number;
      color: string;
      minH: number;
      maxH: number;
      parallax: number;
      litProb: number;
      win: string;
    };
    type Layer = { cfg: LayerCfg; bldgs: Bldg[] };
    type Cloud = { x: number; y: number; r: number; s: number; a: number };
    type Arc = { x1: number; y1: number; x2: number; y2: number; cx: number; cy: number; o: number; s: number };

    let layers: Layer[] = [];
    let clouds: Cloud[] = [];
    let stars: { x: number; y: number; p: number }[] = [];
    let arcs: Arc[] = [];

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    const buildLayer = (cfg: LayerCfg): Layer => {
      const bldgs: Bldg[] = [];
      const startX = -W * 0.3;
      const endX = W * 1.3;
      let x = startX;
      while (x < endX) {
        const w = rnd(W * 0.03, W * 0.075);
        const h = rnd(cfg.minH, cfg.maxH);
        const y = cfg.baseY - h;
        const wins: Win[] = [];
        const pad = Math.max(3, w * 0.12);
        const cw = Math.max(2.5, w * 0.07);
        const gapX = cw * 2.1;
        const gapY = cw * 2.6;
        for (let wy = y + pad; wy < cfg.baseY - pad; wy += gapY) {
          for (let wx = x + pad; wx < x + w - pad; wx += gapX) {
            if (Math.random() < cfg.litProb) {
              wins.push({ x: wx, y: wy, w: cw, h: cw * 1.3, phase: Math.random() * 6.28 });
            }
          }
        }
        bldgs.push({ x, y, w, h, c: cfg.color, wins });
        x += w + rnd(2, w * 0.25);
      }
      return { cfg, bldgs };
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      layers = [
        buildLayer({ baseY: H * 0.66, color: "#14122c", minH: H * 0.06, maxH: H * 0.2, parallax: 0.05, litProb: 0.1, win: "rgba(180,190,255,0.6)" }),
        buildLayer({ baseY: H * 0.74, color: "#0c0a1f", minH: H * 0.12, maxH: H * 0.34, parallax: 0.12, litProb: 0.16, win: "rgba(255,224,150,0.85)" }),
        buildLayer({ baseY: H * 0.86, color: "#050509", minH: H * 0.2, maxH: H * 0.5, parallax: 0.22, litProb: 0.24, win: "rgba(255,210,120,0.95)" }),
      ];

      clouds = Array.from({ length: 6 }, () => ({
        x: rnd(0, W),
        y: rnd(H * 0.1, H * 0.42),
        r: rnd(W * 0.12, W * 0.28),
        s: rnd(2, 6) * (Math.random() < 0.5 ? -1 : 1),
        a: rnd(0.03, 0.08),
      }));
      stars = Array.from({ length: 90 }, () => ({
        x: rnd(0, W),
        y: rnd(0, H * 0.5),
        p: Math.random() * 6.28,
      }));
      // light "data arcs" running across the rooftops
      arcs = Array.from({ length: 6 }, () => {
        const x1 = rnd(W * 0.05, W * 0.5);
        const x2 = x1 + rnd(W * 0.12, W * 0.32);
        const y1 = rnd(H * 0.4, H * 0.6);
        const y2 = rnd(H * 0.4, H * 0.6);
        return { x1, y1, x2, y2, cx: (x1 + x2) / 2, cy: Math.min(y1, y2) - rnd(H * 0.08, H * 0.2), o: Math.random(), s: rnd(0.05, 0.12) };
      });
    };
    build();
    window.addEventListener("resize", build);

    let mx = 0;
    let my = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let t = 0;
    let raf = 0;
    let running = true;

    const drawSky = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#06060f");
      g.addColorStop(0.45, "#0c0a22");
      g.addColorStop(0.66, "#241a3f");
      g.addColorStop(0.74, "#43284f");
      g.addColorStop(0.82, "#1a1330");
      g.addColorStop(1, "#08080e");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // warm dusk sun glow low on the horizon
      const sx = W * 0.68;
      const sy = H * 0.66;
      const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.5);
      sun.addColorStop(0, "rgba(212,217,63,0.30)");
      sun.addColorStop(0.25, "rgba(255,140,60,0.16)");
      sun.addColorStop(0.6, "rgba(80,40,90,0.05)");
      sun.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, W, H);
    };

    const render = () => {
      raf = requestAnimationFrame(render);
      if (!running) return;
      t += prefersReduced ? 0 : 0.016;

      ctx.clearRect(0, 0, W, H);
      drawSky();

      // stars
      ctx.globalCompositeOperation = "lighter";
      for (const s of stars) {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + s.p));
        ctx.fillStyle = `rgba(220,225,255,${0.5 * tw})`;
        ctx.fillRect(s.x, s.y, 1.2, 1.2);
      }
      ctx.globalCompositeOperation = "source-over";

      // drifting clouds / haze
      for (const c of clouds) {
        c.x += prefersReduced ? 0 : c.s * 0.06;
        if (c.x - c.r > W) c.x = -c.r;
        if (c.x + c.r < 0) c.x = W + c.r;
        const gr = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        gr.addColorStop(0, `rgba(120,110,160,${c.a})`);
        gr.addColorStop(1, "rgba(120,110,160,0)");
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.r, c.r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const pan = prefersReduced ? 0 : Math.sin(t * 0.04) * 26;

      // skyline layers (back → front)
      layers.forEach((layer, li) => {
        const off = (pan + mx * 60) * layer.cfg.parallax;
        const bob = prefersReduced ? 0 : Math.sin(t * 0.3 + li) * my * 14 * layer.cfg.parallax;
        ctx.save();
        ctx.translate(off, bob);

        for (const b of layer.bldgs) {
          ctx.fillStyle = b.c;
          ctx.fillRect(b.x, b.y, b.w, b.h);
          // faint rim light on the sun-facing edge
          ctx.fillStyle = "rgba(212,217,63,0.05)";
          ctx.fillRect(b.x + b.w - 1.5, b.y, 1.5, b.h);
        }

        // cathedral twin spires on the mid layer (Zagreb signature)
        if (li === 1) {
          const baseY = layer.cfg.baseY;
          const sxp = W * 0.30;
          drawSpire(ctx, sxp, baseY, H * 0.34);
          drawSpire(ctx, sxp + W * 0.035, baseY, H * 0.32);
        }

        // lit windows (only lit ones are drawn — cheap)
        for (const b of layer.bldgs) {
          for (const w of b.wins) {
            const fl = prefersReduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * 2 + w.phase);
            ctx.fillStyle = layer.cfg.win.replace(/[\d.]+\)$/, `${(0.85 * fl).toFixed(2)})`);
            ctx.fillRect(w.x, w.y, w.w, w.h);
          }
        }
        ctx.restore();
      });

      // data arcs of light running over the city
      ctx.globalCompositeOperation = "lighter";
      for (const a of arcs) {
        ctx.strokeStyle = "rgba(212,217,63,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x1, a.y1);
        ctx.quadraticCurveTo(a.cx, a.cy, a.x2, a.y2);
        ctx.stroke();
        const p = ((t * a.s + a.o) % 1 + 1) % 1;
        const mt = 1 - p;
        const px = mt * mt * a.x1 + 2 * mt * p * a.cx + p * p * a.x2;
        const py = mt * mt * a.y1 + 2 * mt * p * a.cy + p * p * a.y2;
        const fade = Math.sin(p * Math.PI);
        ctx.fillStyle = `rgba(212,217,63,${0.85 * fade})`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(212,217,63,${0.2 * fade})`;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      if (prefersReduced) running = false;
    };
    raf = requestAnimationFrame(render);

    const onVis = () => (running = !document.hidden && !prefersReduced);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />

      {/* Real footage takes over if you add /public/zagreb.mp4 */}
      <video
        aria-hidden
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onCanPlay={() => setVideoReady(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          videoReady ? "opacity-100" : "opacity-0"
        } ${reduced ? "" : "animate-kenburns"}`}
      >
        <source src="/zagreb.webm" type="video/webm" />
        <source src="/zagreb.mp4" type="video/mp4" />
      </video>

      {/* Legibility + brand grade */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08080E] via-[#08080E]/35 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#08080E]/80 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,14,0.55)_0%,transparent_45%)]" />
      <div className="absolute inset-0 mix-blend-overlay bg-brand-navy/10" />
      <div className="grain-overlay absolute inset-0" />
    </div>
  );
}

function drawSpire(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  h: number
) {
  const w = h * 0.12;
  ctx.fillStyle = "#070710";
  // tower body
  ctx.fillRect(x - w / 2, baseY - h * 0.62, w, h * 0.62);
  // spire
  ctx.beginPath();
  ctx.moveTo(x - w / 2, baseY - h * 0.62);
  ctx.lineTo(x, baseY - h);
  ctx.lineTo(x + w / 2, baseY - h * 0.62);
  ctx.closePath();
  ctx.fill();
  // rim light
  ctx.fillStyle = "rgba(212,217,63,0.10)";
  ctx.fillRect(x + w / 2 - 1, baseY - h * 0.62, 1, h * 0.62);
}
