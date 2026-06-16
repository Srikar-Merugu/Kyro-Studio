"use client";

import { useEffect, useRef } from "react";

/**
 * SystemBackdrop — the "Kyro OS" substrate.
 *
 * A single fixed canvas living behind the entire page: a structured grid of
 * nodes wired by *directed* edges (flow goes left→right and top→down, like an
 * automation pipeline) with luminous data packets travelling continuously
 * along every edge. Because it spans the whole viewport and every section above
 * it is transparent, the same living system is visible from the hero all the
 * way to the footer — the page reads as one operating system, not stacked
 * slides.
 *
 * This intentionally replaces the earlier random particle fields: motion here
 * is meaningful (data moving through a system), not decorative twinkle.
 */
export default function SystemBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let W = 0;
    let H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Node = { x: number; y: number; r: number; pulse: number };
    type Edge = { a: number; b: number; offset: number; speed: number };
    let nodes: Node[] = [];
    let edges: Edge[] = [];

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // structured grid (reads as architecture, not noise)
      const cell = W < 768 ? 150 : 200;
      const cols = Math.max(3, Math.round(W / cell) + 1);
      const rows = Math.max(4, Math.round(H / cell) + 1);
      const gx = W / (cols - 1);
      const gy = H / (rows - 1);

      nodes = [];
      const idx = (c: number, r: number) => c * rows + r;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          nodes.push({
            x: c * gx + (Math.random() - 0.5) * gx * 0.5,
            y: r * gy + (Math.random() - 0.5) * gy * 0.5,
            r: Math.random() < 0.18 ? 2.6 : 1.4, // a few "hub" nodes
            pulse: Math.random() * Math.PI * 2,
          });
        }
      }

      edges = [];
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          // flow right
          if (c < cols - 1 && Math.random() > 0.18) {
            edges.push({
              a: idx(c, r),
              b: idx(c + 1, r),
              offset: Math.random(),
              speed: 0.06 + Math.random() * 0.08,
            });
          }
          // flow down
          if (r < rows - 1 && Math.random() > 0.45) {
            edges.push({
              a: idx(c, r),
              b: idx(c, r + 1),
              offset: Math.random(),
              speed: 0.05 + Math.random() * 0.07,
            });
          }
          // occasional diagonal branch (automation fan-out)
          if (c < cols - 1 && r < rows - 1 && Math.random() > 0.82) {
            edges.push({
              a: idx(c, r),
              b: idx(c + 1, r + 1),
              offset: Math.random(),
              speed: 0.05 + Math.random() * 0.06,
            });
          }
        }
      }
    };
    build();
    window.addEventListener("resize", build);

    let raf = 0;
    let t = 0;
    let running = true;

    const render = () => {
      raf = requestAnimationFrame(render);
      if (!running) return;
      t += reduced ? 0 : 0.016;
      ctx.clearRect(0, 0, W, H);

      // edges
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        ctx.strokeStyle = "rgba(212,217,63,0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // travelling data packets (the "in motion" part)
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const p = ((t * e.speed + e.offset) % 1 + 1) % 1;
        const x = a.x + (b.x - a.x) * p;
        const y = a.y + (b.y - a.y) * p;
        const fade = Math.sin(p * Math.PI); // bright in the middle of the run
        ctx.beginPath();
        ctx.fillStyle = `rgba(212,217,63,${0.5 * fade})`;
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        // faint trailing glow
        ctx.beginPath();
        ctx.fillStyle = `rgba(212,217,63,${0.12 * fade})`;
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // nodes
      for (const n of nodes) {
        const breathe = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(t * 1.2 + n.pulse);
        ctx.beginPath();
        ctx.fillStyle = `rgba(160,170,210,${0.18 + breathe * 0.12})`;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        if (n.r > 2) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(212,217,63,${0.1 + breathe * 0.12})`;
          ctx.lineWidth = 1;
          ctx.arc(n.x, n.y, n.r + 4 + breathe * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (reduced) running = false; // one static frame
    };
    raf = requestAnimationFrame(render);

    const onVis = () => (running = !document.hidden && !reduced);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "#08080E" }}
    >
      <canvas ref={ref} className="h-full w-full opacity-50" />
      {/* deep vignette — keep the system subliminal so typography leads */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_8%,_rgba(8,8,14,0.92)_85%)]" />
    </div>
  );
}
