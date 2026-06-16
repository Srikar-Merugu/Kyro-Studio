"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import Magnetic from "@/components/Magnetic";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const NODES = [
  { id: "lead", label: "Lead", x: 0.5, y: 0.15, desc: "Capture leads from every channel — forms, ads, organic, referrals — into a single unified pipeline." },
  { id: "crm", label: "CRM", x: 0.2, y: 0.35, desc: "Automatically qualify, score, and route leads. No lead falls through the cracks." },
  { id: "email", label: "Email", x: 0.8, y: 0.35, desc: "Trigger personalized sequences based on behavior. Follow up at the perfect moment, every time." },
  { id: "analytics", label: "Analytics", x: 0.15, y: 0.65, desc: "Real-time dashboards tracking every metric that matters. Know what's working instantly." },
  { id: "api", label: "API", x: 0.85, y: 0.65, desc: "Connect any tool, any platform. Webhooks, REST, GraphQL — your stack stays connected." },
  { id: "ai", label: "AI Agent", x: 0.5, y: 0.5, desc: "The brain. Decides, learns, optimizes. Turns raw data into intelligent action." },
  { id: "db", label: "Database", x: 0.5, y: 0.82, desc: "Unified data layer. Every system reads and writes from one source of truth." },
];

const EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 5], [2, 5], [3, 5], [4, 5], [5, 6],
  [1, 3], [2, 4], [0, 5], [3, 6], [4, 6],
];

const STAGES = [
  { activeNodes: [0], tooltip: 0 },
  { activeNodes: [0, 1], tooltip: 1 },
  { activeNodes: [0, 1, 2], tooltip: 2 },
  { activeNodes: [0, 1, 2, 3], tooltip: 3 },
  { activeNodes: [0, 1, 2, 3, 4], tooltip: 4 },
  { activeNodes: [0, 1, 2, 3, 4, 5], tooltip: 5 },
  { activeNodes: [0, 1, 2, 3, 4, 5, 6], tooltip: 6 },
];

function AutomationCanvas({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const stageIndex = Math.min(
      Math.floor(progress * STAGES.length),
      STAGES.length - 1
    );
    const stage = STAGES[Math.max(0, stageIndex)];
    const activeSet = new Set(stage.activeNodes);

    const particles: {
      t: number;
      speed: number;
      from: number;
      to: number;
      brightness: number;
    }[] = [];

    const activeEdges = EDGES.filter(
      ([a, b]) => activeSet.has(a) && activeSet.has(b)
    );

    for (let i = 0; i < 20; i++) {
      const ei = Math.floor(Math.random() * Math.max(activeEdges.length, 1));
      const edge = activeEdges[ei % activeEdges.length] || [0, 5];
      particles.push({
        t: Math.random(),
        speed: 0.003 + Math.random() * 0.005,
        from: edge[0],
        to: edge[1],
        brightness: 0.4 + Math.random() * 0.6,
      });
    }

    const nodePositions = NODES.map((n) => ({
      px: n.x * W,
      py: n.y * H,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = (time: number) => {
      ctx.clearRect(0, 0, W, H);
      const t = time * 0.001;

      const gridSize = 40;
      ctx.strokeStyle = "rgba(212,217,63,0.02)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      EDGES.forEach(([a, b]) => {
        if (!activeSet.has(a) || !activeSet.has(b)) return;
        const na = nodePositions[a];
        const nb = nodePositions[b];

        const pulse = 0.04 + Math.sin(t * 2 + a + b) * 0.02;
        ctx.beginPath();
        ctx.moveTo(na.px, na.py);
        ctx.lineTo(nb.px, nb.py);
        ctx.strokeStyle = `rgba(212,217,63,${pulse})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const grad = ctx.createLinearGradient(na.px, na.py, nb.px, nb.py);
        grad.addColorStop(0, "rgba(212,217,63,0.06)");
        grad.addColorStop(0.5, "rgba(212,217,63,0.12)");
        grad.addColorStop(1, "rgba(212,217,63,0.06)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      particles.forEach((p) => {
        if (!activeEdges.length) return;
        p.t += p.speed;
        if (p.t > 1) {
          p.t = 0;
          const ei = Math.floor(Math.random() * activeEdges.length);
          const [a, b] = activeEdges[ei];
          p.from = a;
          p.to = b;
        }
        const na = nodePositions[p.from];
        const nb = nodePositions[p.to];
        const cx = na.px + (nb.px - na.px) * p.t;
        const cy = na.py + (nb.py - na.py) * p.t;

        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
        glow.addColorStop(0, `rgba(212,217,63,${0.8 * p.brightness})`);
        glow.addColorStop(1, "rgba(212,217,63,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(212,217,63,${p.brightness})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      NODES.forEach((n, i) => {
        const pos = nodePositions[i];
        const floatX = Math.sin(t * 0.5 + pos.phase) * 3;
        const floatY = Math.cos(t * 0.4 + pos.phase) * 3;
        const nx = pos.px + floatX;
        const ny = pos.py + floatY;

        if (!activeSet.has(i)) {
          ctx.fillStyle = "rgba(212,217,63,0.06)";
          ctx.beginPath();
          ctx.arc(nx, ny, 4, 0, Math.PI * 2);
          ctx.fill();
          return;
        }

        const isActive = i === stage.tooltip;
        const baseR = isActive ? 28 : 18;
        const pulseR = baseR + Math.sin(t * 3 + i) * 3;

        const outerGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, pulseR * 2);
        outerGlow.addColorStop(0, isActive ? "rgba(212,217,63,0.2)" : "rgba(212,217,63,0.08)");
        outerGlow.addColorStop(1, "rgba(212,217,63,0)");
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(nx, ny, pulseR * 2, 0, Math.PI * 2);
        ctx.fill();

        if (isActive) {
          const ringR = pulseR + 12 + Math.sin(t * 2) * 4;
          ctx.beginPath();
          ctx.arc(nx, ny, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(212,217,63,${0.15 + Math.sin(t * 3) * 0.1})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        const nodeGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, pulseR);
        nodeGlow.addColorStop(0, isActive ? "rgba(212,217,63,0.9)" : "rgba(212,217,63,0.5)");
        nodeGlow.addColorStop(1, isActive ? "rgba(212,217,63,0.3)" : "rgba(212,217,63,0.1)");
        ctx.fillStyle = nodeGlow;
        ctx.beginPath();
        ctx.arc(nx, ny, pulseR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isActive ? "#D4D93F" : "rgba(212,217,63,0.7)";
        ctx.beginPath();
        ctx.arc(nx, ny, isActive ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)";
        ctx.font = `${isActive ? "bold " : ""}${isActive ? 12 : 10}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(n.label, nx, ny + pulseR + 18);
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: "auto" }}
    />
  );
}

const AiAutomation = () => {
  const t = useTranslations("ai_automation");
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeTooltip, setActiveTooltip] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          setProgress(p);
          const stageIdx = Math.min(Math.floor(p * STAGES.length), STAGES.length - 1);
          setActiveTooltip(Math.max(0, stageIdx));
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const tooltipNode = NODES[STAGES[activeTooltip].tooltip];

  return (
    <section
      ref={sectionRef}
      id="automation"
      className="relative bg-[#06060a]"
      style={{ height: `${(STAGES.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-brand-navy/6 rounded-full blur-[160px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-brand-yellow/4 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.4em] text-brand-yellow/70">
              {t("eyebrow")}
            </p>
            <h2 className="mb-6 font-display font-medium uppercase leading-[0.92] tracking-[-0.04em] text-[clamp(32px,5vw,64px)] text-white">
              Automate the work.
              <br />
              <span className="text-brand-yellow">Focus on the growth.</span>
            </h2>
            <p className="mb-8 max-w-lg text-base leading-relaxed text-neutral-400 lg:text-lg">
              {t("description")}
            </p>

            <div className="mb-10 transition-all duration-500 min-h-[120px]">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-yellow/70">
                    System Active — Stage {activeTooltip + 1} / {STAGES.length}
                  </span>
                </div>
                <h4 className="font-display font-medium text-lg text-white mb-2">
                  {tooltipNode.label}
                </h4>
                <p className="text-sm leading-relaxed text-neutral-400">
                  {tooltipNode.desc}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {["Make", "Zapier", "n8n"].map((tool) => (
                <span
                  key={tool}
                  className="px-5 py-2 rounded-full border border-brand-yellow/20 text-brand-yellow/80 font-mono text-[11px] uppercase tracking-[0.12em]"
                >
                  {tool}
                </span>
              ))}
            </div>

            <Magnetic strength={0.4}>
              <a
                href="https://calendar.app.google/SkMr99BXaF5DhGn98"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="hover"
                className="group relative inline-flex items-center gap-2 overflow-hidden bg-brand-yellow text-brand-bg font-display font-bold text-sm uppercase tracking-wider px-7 py-3.5 rounded-full transition-shadow shadow-[0_0_25px_rgba(212,217,63,0.2)] hover:shadow-[0_0_50px_rgba(212,217,63,0.5)]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-700 group-hover:translate-x-[200%]" />
                {t("cta_text")} →
              </a>
            </Magnetic>
            <span className="ml-4 text-neutral-500 text-sm">{t("cta_sub")}</span>
          </div>

          <div className="order-1 lg:order-2 relative h-[50vh] lg:h-[70vh]">
            <AutomationCanvas progress={progress} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiAutomation;
