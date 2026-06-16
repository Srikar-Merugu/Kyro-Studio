"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
  { n: "01", title: "Discovery", desc: "We audit your current systems, understand your goals, and map the exact path to growth. No guesswork — just data-driven strategy." },
  { n: "02", title: "Strategy", desc: "We design a custom blueprint — automations, funnels, and systems tailored to your business. Every piece has a purpose." },
  { n: "03", title: "Build", desc: "We implement everything — landing pages, email sequences, CRM workflows, AI agents. You don't lift a finger." },
  { n: "04", title: "Launch", desc: "We flip the switch. Your systems go live. Leads start flowing. Automations start running. Day one impact." },
  { n: "05", title: "Optimize", desc: "We monitor, test, and refine. Every week we improve performance — higher conversions, lower costs, better results." },
  { n: "06", title: "Scale", desc: "Once the engine is proven, we pour fuel on it. Scale ad spend, expand automations, grow revenue predictably." },
];

const Process = () => {
  const t = useTranslations("process");
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(cards, { x: "120%", opacity: 0, scale: 0.92, filter: "blur(4px)" });
      gsap.set(cards[0], { x: "0%", opacity: 1, scale: 1, filter: "blur(0px)" });

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${(cards.length - 1) * 100}%`,
          pin: track,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            const idx = Math.min(Math.floor(p * cards.length), cards.length - 1);
            if (counterRef.current) {
              counterRef.current.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
            }
            if (progressRef.current) {
              const dots = progressRef.current.children;
              for (let i = 0; i < dots.length; i++) {
                const dot = dots[i] as HTMLElement;
                if (i <= idx) {
                  dot.style.width = "24px";
                  dot.style.backgroundColor = "#D4D93F";
                } else {
                  dot.style.width = "8px";
                  dot.style.backgroundColor = "rgba(255,255,255,0.15)";
                }
              }
            }
          },
        },
      });

      for (let i = 0; i < cards.length - 1; i++) {
        const exitStart = i * 1;
        const enterStart = exitStart + 0.4;

        master.to(cards[i], {
          x: "-120%",
          opacity: 0,
          scale: 0.92,
          filter: "blur(4px)",
          duration: 0.6,
          ease: "power3.inOut",
        }, exitStart);

        master.to(cards[i + 1], {
          x: "0%",
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.6,
          ease: "power3.inOut",
        }, enterStart);
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="process" className="relative bg-[#050505]">
      <div ref={trackRef} className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-brand-navy/4 rounded-full blur-[160px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-brand-yellow/3 rounded-full blur-[140px]" />
        </div>

        <div className="absolute top-8 left-0 right-0 z-30 flex items-center justify-between px-6 md:px-12">
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.32em] text-brand-yellow">
              {t("eyebrow")}
            </p>
            <h2 className="font-display font-medium uppercase leading-[0.95] tracking-[-0.04em] text-[clamp(24px,4vw,48px)] text-white">
              {t("headline")} <span className="text-brand-yellow">{t("headline_accent")}</span>
            </h2>
          </div>
          <span
            ref={counterRef}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-yellow/70"
          >
            01 / 06
          </span>
        </div>

        {STEPS.map((step, i) => (
          <div
            key={i}
            ref={(el) => { cardsRef.current[i] = el; }}
            className="absolute inset-0 z-20 flex items-center justify-center px-6 md:px-12"
          >
            <div
              data-cursor="hover"
              className="group relative flex h-[55vh] w-full max-w-[800px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-8 md:p-14 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]"
            >
              <span className="pointer-events-none absolute -right-4 top-0 select-none font-display text-[20vw] font-bold leading-none text-white/[0.03]">
                {step.n}
              </span>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs tracking-[0.2em] text-brand-yellow">{step.n}</span>
                  <span className="h-3 w-3 rounded-full bg-brand-yellow shadow-[0_0_16px_rgba(212,217,63,0.8)]" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Step {step.n}
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="font-display font-medium uppercase leading-[0.95] tracking-[-0.04em] text-[clamp(32px,5vw,72px)] text-white transition-colors duration-500 group-hover:text-brand-yellow">
                  {step.title}
                </h3>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
                  {step.desc}
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
          </div>
        ))}

        <div
          ref={progressRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2"
        >
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === 0 ? "24px" : "8px",
                backgroundColor: i === 0 ? "#D4D93F" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
