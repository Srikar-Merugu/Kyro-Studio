"use client";

import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import Magnetic from "@/components/Magnetic";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CAPABILITIES = [
  { icon: "◉", title: "Lead Qualification & CRM Automation" },
  { icon: "⚡", title: "Email Sequences & Follow-up Flows" },
  { icon: "⬡", title: "Cross-platform Data Synchronization" },
  { icon: "△", title: "AI-Powered Content Pipelines" },
  { icon: "◈", title: "Custom Reporting Dashboards" },
  { icon: "⬢", title: "Webhook & API Integrations" },
];

const NETWORK_NODES = [
  { x: 50, y: 30, label: "Lead" },
  { x: 25, y: 50, label: "CRM" },
  { x: 75, y: 50, label: "Email" },
  { x: 15, y: 75, label: "Data" },
  { x: 50, y: 70, label: "Analytics" },
  { x: 85, y: 75, label: "API" },
  { x: 50, y: 50, label: "AI Agent" },
];

const CONNECTIONS = [
  [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  [0, 1], [0, 2], [3, 4], [4, 5], [1, 3], [2, 5],
];

function NetworkBackground() {
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
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes = NETWORK_NODES.map((n) => ({
      ...n,
      px: 0,
      py: 0,
      ox: n.x,
      oy: n.y,
      phase: Math.random() * Math.PI * 2,
    }));

    const particles: { sx: number; sy: number; tx: number; ty: number; t: number; speed: number; from: number; to: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const from = Math.floor(Math.random() * CONNECTIONS.length);
      const [a, b] = CONNECTIONS[from];
      particles.push({
        sx: 0, sy: 0, tx: 0, ty: 0,
        t: Math.random(),
        speed: 0.002 + Math.random() * 0.003,
        from: a, to: b,
      });
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, W, H);

      const t = time * 0.001;

      nodes.forEach((n) => {
        const floatX = Math.sin(t * 0.4 + n.phase) * 1.5;
        const floatY = Math.cos(t * 0.3 + n.phase) * 1.5;
        n.px = (n.ox + floatX) * W * 0.01;
        n.py = (n.oy + floatY) * H * 0.01;
      });

      CONNECTIONS.forEach(([a, b]) => {
        const na = nodes[a];
        const nb = nodes[b];
        ctx.beginPath();
        ctx.moveTo(na.px, na.py);
        ctx.lineTo(nb.px, nb.py);
        ctx.strokeStyle = "rgba(212,217,63,0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      particles.forEach((p) => {
        p.t += p.speed;
        if (p.t > 1) {
          p.t = 0;
          const candidates = CONNECTIONS.filter((c) => c[0] === p.from || c[1] === p.from);
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          p.from = pick[0];
          p.to = pick[1];
        }
        const na = nodes[p.from];
        const nb = nodes[p.to];
        p.sx = na.px;
        p.sy = na.py;
        p.tx = nb.px;
        p.ty = nb.py;
        const cx = p.sx + (p.tx - p.sx) * p.t;
        const cy = p.sy + (p.ty - p.sy) * p.t;

        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 6);
        glow.addColorStop(0, "rgba(212,217,63,0.7)");
        glow.addColorStop(1, "rgba(212,217,63,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#D4D93F";
        ctx.beginPath();
        ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      nodes.forEach((n) => {
        const glow = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, 20);
        glow.addColorStop(0, "rgba(212,217,63,0.12)");
        glow.addColorStop(1, "rgba(212,217,63,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.px, n.py, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(212,217,63,0.5)";
        ctx.beginPath();
        ctx.arc(n.px, n.py, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(212,217,63,0.35)";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.px, n.py + 18);
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      dur: 15 + Math.random() * 20,
      delay: Math.random() * -20,
      opacity: 0.1 + Math.random() * 0.2,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-brand-yellow"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `floatParticle ${p.dur}s ${p.delay}s linear infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes floatParticle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) translateX(40px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const AiAutomation = () => {
  const t = useTranslations("ai_automation");
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const outroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const headline = headlineRef.current;
    const network = networkRef.current;
    const outro = outroRef.current;
    if (!section || !track || !headline || !network || !outro) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];

      const headlineWords = headline.querySelectorAll(".hw");
      gsap.set(headlineWords, { opacity: 0, y: 40, filter: "blur(8px)" });
      gsap.set(cards, { opacity: 0, scale: 0.8, y: 100, filter: "blur(12px)" });
      gsap.set(outro, { opacity: 0, y: 60 });

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${(cards.length + 3) * 100}%`,
          pin: track,
          scrub: 0.7,
          anticipatePin: 1,
        },
      });

      headlineWords.forEach((word, i) => {
        master.to(
          word,
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: "power3.out" },
          i * 0.15
        );
      });

      const headlineEnd = headlineWords.length * 0.15 + 0.6;
      master.to(headline, { opacity: 0, y: -80, duration: 0.6, ease: "power2.in" }, headlineEnd);

      const netStart = headlineEnd + 0.3;
      master.to(network, { opacity: 1, duration: 0.8, ease: "power2.out" }, netStart);

      const cardStart = netStart + 0.8;
      const cardDur = 1;

      cards.forEach((card, i) => {
        const enter = cardStart + i * cardDur;
        const peak = enter + 0.3;
        const settle = peak + 0.15;
        const exit = settle + 0.3;

        master.to(card, { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 0.3, ease: "power3.out" }, enter);
        master.to(card, { scale: 1.04, duration: 0.2, ease: "power2.inOut" }, peak);
        master.to(card, { scale: 1, duration: 0.1, ease: "power2.out" }, settle);
        master.to(card, { opacity: 0, scale: 0.85, y: -60, filter: "blur(8px)", duration: 0.3, ease: "power2.in" }, exit);
      });

      const outroStart = cardStart + cards.length * cardDur;
      master.to(outro, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, outroStart);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="automation" className="relative bg-[#06060a]">
      <div ref={trackRef} className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-navy/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-yellow/5 rounded-full blur-[180px]" />
        </div>

        <FloatingParticles />

        <div
          ref={headlineRef}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center pointer-events-none"
        >
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.4em] text-brand-yellow/70">
            {t("eyebrow")}
          </p>
          <h2 className="max-w-5xl font-display font-medium uppercase leading-[0.92] tracking-[-0.04em] text-[clamp(36px,6vw,80px)] text-white">
            <span className="hw inline-block mr-[0.3em]">Automate</span>
            <span className="hw inline-block mr-[0.3em]">the</span>
            <span className="hw inline-block mr-[0.3em] text-brand-yellow">work.</span>
            <br />
            <span className="hw inline-block mr-[0.3em]">Focus</span>
            <span className="hw inline-block mr-[0.3em]">on</span>
            <span className="hw inline-block mr-[0.3em]">the</span>
            <span className="hw inline-block text-brand-yellow">growth.</span>
          </h2>
        </div>

        <div
          ref={networkRef}
          className="absolute inset-0 z-10 opacity-0 pointer-events-none"
        >
          <NetworkBackground />
        </div>

        {CAPABILITIES.map((cap, i) => (
          <div
            key={i}
            ref={(el) => { cardsRef.current[i] = el; }}
            className="absolute inset-0 z-20 flex items-center justify-center px-6 md:px-12"
          >
            <div className="w-full max-w-[900px] rounded-[28px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_0_80px_-20px_rgba(212,217,63,0.08)] overflow-hidden">
              <div className="relative p-8 md:p-14 lg:p-16">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/[0.04] via-transparent to-brand-navy/[0.04] pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-yellow/20 to-transparent" />

                <div className="relative z-10 flex flex-col md:flex-row items-start gap-8 md:gap-12">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl border border-brand-yellow/20 bg-brand-yellow/[0.06] flex items-center justify-center text-brand-yellow text-2xl font-light">
                    {cap.icon}
                  </div>
                  <div className="flex-1">
                    <span className="inline-block mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-yellow/60">
                      Capability {String(i + 1).padStart(2, "0")} / {String(CAPABILITIES.length).padStart(2, "0")}
                    </span>
                    <h3 className="font-display font-medium uppercase leading-[1] tracking-[-0.03em] text-[clamp(28px,4vw,56px)] text-white mb-5">
                      {cap.title}
                    </h3>
                    <p className="max-w-lg text-base leading-relaxed text-neutral-400 lg:text-lg">
                      {t(`capabilities.${i}`)}
                    </p>
                    <div className="mt-8 flex items-center gap-3">
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-yellow/30 bg-brand-yellow/[0.06] font-mono text-[11px] uppercase tracking-[0.15em] text-brand-yellow transition-colors hover:bg-brand-yellow/10">
                        Learn more
                        <span className="text-sm">→</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              </div>
            </div>
          </div>
        ))}

        <div
          ref={outroRef}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
        >
          <h2 className="max-w-4xl font-display font-medium uppercase leading-[0.92] tracking-[-0.04em] text-[clamp(32px,5.5vw,72px)] text-white mb-6">
            Your business should not
            <br />
            depend on <span className="text-brand-yellow">manual work.</span>
          </h2>
          <p className="max-w-xl mb-12 text-lg text-neutral-400">
            Let AI handle the repetition. You focus on strategy, growth, and the work that actually matters.
          </p>
          <Magnetic strength={0.4}>
            <a
              href="https://calendar.app.google/SkMr99BXaF5DhGn98"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="group relative inline-flex items-center gap-2 overflow-hidden bg-brand-yellow text-brand-bg font-display font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full transition-shadow shadow-[0_0_30px_rgba(212,217,63,0.25)] hover:shadow-[0_0_60px_rgba(212,217,63,0.5)]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-700 group-hover:translate-x-[200%]" />
              Book a Discovery Call
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
};

export default AiAutomation;
