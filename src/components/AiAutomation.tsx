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
  { id: "lead", label: "Lead", x: 0.3, y: 0.12 },
  { id: "crm", label: "CRM", x: 0.12, y: 0.32 },
  { id: "email", label: "Email", x: 0.5, y: 0.22 },
  { id: "ads", label: "Ads", x: 0.82, y: 0.15 },
  { id: "analytics", label: "Analytics", x: 0.18, y: 0.58 },
  { id: "api", label: "API", x: 0.78, y: 0.55 },
  { id: "slack", label: "Slack", x: 0.42, y: 0.42 },
  { id: "ai", label: "AI Agent", x: 0.6, y: 0.4 },
  { id: "db", label: "Database", x: 0.5, y: 0.72 },
  { id: "webhook", label: "Webhook", x: 0.28, y: 0.78 },
  { id: "reports", label: "Reports", x: 0.72, y: 0.78 },
];

const EDGES: [number, number][] = [
  [0, 2], [0, 1], [1, 6], [2, 6], [2, 7], [3, 7],
  [4, 6], [5, 7], [6, 7], [7, 8], [8, 9], [8, 10],
  [1, 4], [3, 5], [5, 10], [4, 9], [0, 3], [6, 8],
];

const STAGES = [
  { activeNodes: [0], desc: "Leads enter from every channel — ads, forms, organic, referrals." },
  { activeNodes: [0, 1, 2], desc: "Leads are qualified, scored, and routed. Email sequences fire automatically." },
  { activeNodes: [0, 1, 2, 3, 6], desc: "Ad platforms sync data. The team gets real-time Slack notifications." },
  { activeNodes: [0, 1, 2, 3, 4, 5, 6], desc: "Analytics track performance. API integrations keep every tool connected." },
  { activeNodes: [0, 1, 2, 3, 4, 5, 6, 7], desc: "The AI Agent activates. It learns, decides, and optimizes the entire system." },
  { activeNodes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], desc: "Full ecosystem live. Data flows. Reports generate. Everything runs on autopilot." },
];

function NetworkCanvas({ progress }: { progress: number }) {
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

    const particles: {
      t: number;
      speed: number;
      from: number;
      to: number;
      brightness: number;
    }[] = [];

    for (let i = 0; i < 30; i++) {
      particles.push({
        t: Math.random(),
        speed: 0.002 + Math.random() * 0.004,
        from: 0,
        to: 0,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, W, H);
      const t = time * 0.001;

      const stageIdx = Math.min(Math.floor(progress * STAGES.length), STAGES.length - 1);
      const activeSet = new Set(STAGES[Math.max(0, stageIdx)].activeNodes);

      const activeEdges = EDGES.filter(([a, b]) => activeSet.has(a) && activeSet.has(b));

      const gridSize = 50;
      ctx.strokeStyle = "rgba(212,217,63,0.025)";
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
        const na = NODES[a];
        const nb = NODES[b];
        const ax = na.x * W;
        const ay = na.y * H;
        const bx = nb.x * W;
        const by = nb.y * H;

        const isActive = activeSet.has(a) && activeSet.has(b);
        const alpha = isActive ? 0.08 + Math.sin(t * 2 + a + b) * 0.03 : 0.02;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = `rgba(212,217,63,${alpha})`;
        ctx.lineWidth = isActive ? 1.5 : 0.5;
        ctx.stroke();
      });

      if (activeEdges.length > 0) {
        particles.forEach((p) => {
          if (p.t > 1 || !activeEdges.length) {
            p.t = 0;
            const ei = Math.floor(Math.random() * activeEdges.length);
            [p.from, p.to] = activeEdges[ei];
          }
          p.t += p.speed;

          const na = NODES[p.from];
          const nb = NODES[p.to];
          const cx = (na.x + (nb.x - na.x) * p.t) * W;
          const cy = (na.y + (nb.y - na.y) * p.t) * H;

          const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 6);
          glow.addColorStop(0, `rgba(212,217,63,${0.7 * p.brightness})`);
          glow.addColorStop(1, "rgba(212,217,63,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(212,217,63,${p.brightness})`;
          ctx.beginPath();
          ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      NODES.forEach((n, i) => {
        const nx = n.x * W;
        const ny = n.y * H;
        const isActive = activeSet.has(i);
        const isCurrent = isActive && i === STAGES[stageIdx].activeNodes[STAGES[stageIdx].activeNodes.length - 1];
        const floatX = Math.sin(t * 0.5 + i * 1.7) * 2;
        const floatY = Math.cos(t * 0.4 + i * 2.1) * 2;
        const fx = nx + floatX;
        const fy = ny + floatY;

        if (!isActive) {
          ctx.fillStyle = "rgba(212,217,63,0.04)";
          ctx.beginPath();
          ctx.arc(fx, fy, 3, 0, Math.PI * 2);
          ctx.fill();
          return;
        }

        const outerR = isCurrent ? 30 : 20;
        const pulse = Math.sin(t * 3 + i) * 3;

        const outerGlow = ctx.createRadialGradient(fx, fy, 0, fx, fy, outerR + pulse);
        outerGlow.addColorStop(0, isCurrent ? "rgba(212,217,63,0.18)" : "rgba(212,217,63,0.06)");
        outerGlow.addColorStop(1, "rgba(212,217,63,0)");
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(fx, fy, outerR + pulse, 0, Math.PI * 2);
        ctx.fill();

        if (isCurrent) {
          const ringR = outerR + 10 + Math.sin(t * 2.5) * 5;
          ctx.beginPath();
          ctx.arc(fx, fy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(212,217,63,${0.12 + Math.sin(t * 3) * 0.08})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.fillStyle = isCurrent ? "#D4D93F" : "rgba(212,217,63,0.55)";
        ctx.beginPath();
        ctx.arc(fx, fy, isCurrent ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isCurrent ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)";
        ctx.font = `${isCurrent ? "bold " : ""}${isCurrent ? 11 : 9}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(n.label, fx, fy + (isCurrent ? 20 : 16));
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [progress]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

const AiAutomation = () => {
  const t = useTranslations("ai_automation");
  const sectionRef = useRef<HTMLDivElement>(null);
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const idx = Math.min(Math.floor(p * STAGES.length), STAGES.length - 1);
          setStageIdx(Math.max(0, idx));
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const stage = STAGES[stageIdx];

  return (
    <section
      ref={sectionRef}
      id="automation"
      className="relative bg-[#06060a] py-24 md:py-32"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-brand-navy/6 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] bg-brand-yellow/4 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
        <div className="order-2 lg:order-1">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.4em] text-brand-yellow/70">
            {t("eyebrow")}
          </p>
          <h2 className="mb-6 font-display font-medium uppercase leading-[0.92] tracking-[-0.04em] text-[clamp(30px,4.5vw,60px)] text-white">
            Automate the work.
            <br />
            <span className="text-brand-yellow">Focus on the growth.</span>
          </h2>
          <p className="mb-8 max-w-lg text-base leading-relaxed text-neutral-400 lg:text-lg">
            {t("description")}
          </p>

          <div className="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 transition-all duration-500">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-yellow/60">
                Stage {stageIdx + 1} / {STAGES.length}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-300">
              {stage.desc}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 mb-8">
            {["Make", "Zapier", "n8n"].map((tool) => (
              <span
                key={tool}
                className="px-4 py-1.5 rounded-full border border-brand-yellow/20 text-brand-yellow/70 font-mono text-[10px] uppercase tracking-[0.12em]"
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

        <div className="order-1 lg:order-2 relative h-[45vh] lg:h-[65vh] rounded-3xl border border-white/[0.04] bg-white/[0.01] overflow-hidden">
          <NetworkCanvas progress={stageIdx / Math.max(STAGES.length - 1, 1)} />
        </div>
      </div>
    </section>
  );
};

export default AiAutomation;
