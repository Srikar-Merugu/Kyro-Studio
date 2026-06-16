"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Services = () => {
  const t = useTranslations("services");
  const items = [
    { icon: "🌐", visual: "web" as const },
    { icon: "📡", visual: "growth" as const },
    { icon: "⚡", visual: "network" as const },
    { icon: "🛠", visual: "arch" as const },
  ].map((m, i) => ({
    ...m,
    n: `0${i + 1}`,
    title: t(`items.${i}.title`),
    desc: t(`items.${i}.description`),
  }));

  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const heading = headingRef.current;
    const label = labelRef.current;
    if (!section || !track || !heading || !label) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
      const totalCards = cards.length;
      if (totalCards === 0) return;

      gsap.set(cards, { opacity: 0, scale: 0.7, y: 80 });
      gsap.set(label, { opacity: 0, y: 20 });

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${(totalCards + 1) * 100}%`,
          pin: track,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      master.to(
        heading,
        {
          opacity: 0,
          y: -60,
          duration: 0.8,
          ease: "power2.in",
        },
        0
      );

      master.to(
        label,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        0.3
      );

      const cardStart = 1;

      cards.forEach((card, i) => {
        const enter = cardStart + i * 1;
        const peak = enter + 0.3;
        const settle = peak + 0.2;
        const exit = settle + 0.3;

        master.to(
          card,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "power3.out",
          },
          enter
        );

        master.to(
          card,
          {
            scale: 1.06,
            duration: 0.25,
            ease: "power2.inOut",
          },
          peak
        );

        master.to(
          card,
          {
            scale: 1,
            duration: 0.15,
            ease: "power2.out",
          },
          settle
        );

        master.to(
          card,
          {
            opacity: 0,
            scale: 0.8,
            y: -50,
            duration: 0.3,
            ease: "power2.in",
          },
          exit
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="services" className="relative bg-black">
      <div
        ref={trackRef}
        className="relative h-screen overflow-hidden"
      >
        <div
          ref={headingRef}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center md:px-12"
        >
          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.32em] text-brand-yellow">
            {t("eyebrow")}
          </p>
          <h2 className="mx-auto max-w-4xl font-display font-medium uppercase leading-[0.95] tracking-[-0.04em] text-[clamp(32px,5.5vw,68px)] text-white">
            {t("headline")}{" "}
            <span className="text-brand-yellow">{t("headline_accent")}</span>
          </h2>
        </div>

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
          <div
            ref={labelRef}
            className="mb-6 pointer-events-none md:mb-8"
          >
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-brand-yellow/80">
              Services
            </span>
          </div>

          <div className="relative w-full flex-1 flex items-center justify-center">
            {items.map((s, i) => (
              <div
                key={i}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="absolute inset-0 flex items-center justify-center px-6 md:px-12"
              >
                <div
                  data-cursor="hover"
                  className="group grid w-full max-w-[1100px] grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] lg:grid-cols-[1fr_1fr]"
                >
                  <div className="relative z-10 flex flex-col justify-between p-8 md:p-12 lg:p-14">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl">{s.icon}</span>
                      <span className="font-mono text-xs tracking-[0.2em] text-brand-yellow">
                        {s.n} / 0{items.length}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display font-medium uppercase leading-[0.95] tracking-[-0.04em] text-[clamp(28px,4vw,64px)] text-brand-yellow">
                        {s.title}
                      </h3>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-400 lg:text-lg">
                    {s.desc}
                  </p>
                  <span className="mt-8 inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-brand-yellow">
                    Explore
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-yellow/60 transition-transform duration-500 group-hover:rotate-45">
                      ↗
                    </span>
                  </span>
                </div>
              </div>

              <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden border-t border-white/10 bg-[#0b0b0f] p-6 lg:min-h-0 lg:border-l lg:border-t-0">
                <span className="pointer-events-none absolute select-none font-display text-[25vw] font-bold leading-none text-white/[0.035] lg:text-[12vw]">
                  {s.n}
                </span>
                <Visual kind={s.visual} />
              </div>
            </div>
          </div>
        ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Y = "#D4D93F";

function Visual({ kind }: { kind: "web" | "growth" | "network" | "arch" }) {
  return (
    <div className="relative w-[80%] max-w-[420px] [perspective:1200px]">
      <div className="transition-transform duration-700 ease-out will-change-transform group-hover:[transform:rotateX(6deg)_rotateY(-7deg)_translateY(-6px)]">
        {kind === "web" && <WebVisual />}
        {kind === "growth" && <GrowthVisual />}
        {kind === "network" && <NetworkVisual />}
        {kind === "arch" && <ArchVisual />}
      </div>
      <div className="pointer-events-none absolute inset-0 -translate-x-[130%] skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-[1100ms] ease-out group-hover:translate-x-[130%]" />
    </div>
  );
}

function WebVisual() {
  return (
    <svg viewBox="0 0 460 300" className="w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]" aria-hidden>
      <defs>
        <linearGradient id="webHero" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={Y} stopOpacity="0.35" />
          <stop offset="1" stopColor="#200F8C" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <rect x="14" y="18" width="432" height="264" rx="16" fill="#0e0e13" stroke="rgba(255,255,255,0.14)" />
      <rect x="14" y="18" width="432" height="46" rx="16" fill="rgba(255,255,255,0.05)" />
      <rect x="14" y="46" width="432" height="18" fill="rgba(255,255,255,0.02)" />
      <circle cx="38" cy="41" r="4" fill={Y} /><circle cx="54" cy="41" r="4" fill="rgba(255,255,255,0.25)" /><circle cx="70" cy="41" r="4" fill="rgba(255,255,255,0.25)" />
      <rect x="150" y="35" width="160" height="12" rx="6" fill="rgba(255,255,255,0.08)" />
      <rect x="40" y="92" width="240" height="150" rx="10" fill="url(#webHero)" className="transition-all duration-700 group-hover:opacity-90" />
      <rect x="58" y="116" width="150" height="16" rx="4" fill="#fff" fillOpacity="0.85" />
      <rect x="58" y="142" width="120" height="10" rx="4" fill="#fff" fillOpacity="0.35" />
      <rect x="58" y="190" width="92" height="26" rx="13" fill={Y} className="origin-left transition-transform duration-500 group-hover:scale-x-110" />
      <g className="transition-transform duration-700 group-hover:translate-y-[-4px]">
        <rect x="300" y="92" width="120" height="70" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
        <rect x="300" y="172" width="120" height="70" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
        <rect x="316" y="112" width="60" height="8" rx="4" fill={Y} fillOpacity="0.6" />
        <rect x="316" y="192" width="60" height="8" rx="4" fill={Y} fillOpacity="0.6" />
      </g>
    </svg>
  );
}

function GrowthVisual() {
  return (
    <svg viewBox="0 0 460 300" className="w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]" aria-hidden>
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={Y} stopOpacity="0.35" />
          <stop offset="1" stopColor={Y} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="14" y="18" width="432" height="264" rx="16" fill="#0e0e13" stroke="rgba(255,255,255,0.14)" />
      <text x="40" y="62" fill="#fff" fillOpacity="0.5" fontSize="12" fontFamily="monospace" letterSpacing="2">CAMPAIGN PERFORMANCE</text>
      <g className="origin-bottom transition-transform duration-700 group-hover:scale-y-110" style={{ transformOrigin: "0px 250px" }}>
        {[70, 140, 210, 280, 350].map((x, i) => (
          <rect key={i} x={x} y={250 - (i + 1) * 30} width="32" height={(i + 1) * 30} rx="4" fill={Y} fillOpacity={0.12 + i * 0.14} />
        ))}
      </g>
      <path d="M50 210 L120 180 L190 150 L270 110 L400 56" fill="none" stroke={Y} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 210 L120 180 L190 150 L270 110 L400 56 L400 250 L50 250 Z" fill="url(#area)" opacity="0.7" />
      <circle cx="400" cy="56" r="6" fill={Y} className="transition-all duration-500 group-hover:r-[9]" />
      <g className="opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <rect x="350" y="76" width="84" height="34" rx="8" fill="#0e0e13" stroke={Y} strokeOpacity="0.6" />
        <text x="392" y="98" fill={Y} fontSize="16" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">+240%</text>
      </g>
    </svg>
  );
}

function NetworkVisual() {
  const nodes: [number, number][] = [[70, 90], [230, 50], [400, 100], [120, 220], [330, 230], [230, 150]];
  return (
    <svg viewBox="0 0 460 300" className="w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]" aria-hidden>
      <rect x="14" y="18" width="432" height="264" rx="16" fill="#0e0e13" stroke="rgba(255,255,255,0.14)" />
      <path d="M70 90 L230 150 L400 100 M230 150 L230 50 M230 150 L120 220 M230 150 L330 230" stroke={Y} strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="3 7">
        <animate attributeName="stroke-dashoffset" from="40" to="0" dur="2.4s" repeatCount="indefinite" />
      </path>
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === 5 ? 9 : 6} fill={Y}>
            <animate attributeName="opacity" values="0.5;1;0.5" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={x} cy={y} r={i === 5 ? 16 : 11} fill="none" stroke={Y} strokeOpacity="0.25" className="opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </g>
      ))}
      <circle r="3.5" fill="#fff">
        <animateMotion dur="2.6s" repeatCount="indefinite" path="M70 90 L230 150 L400 100" />
      </circle>
    </svg>
  );
}

function ArchVisual() {
  return (
    <svg viewBox="0 0 460 300" className="w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]" aria-hidden>
      <rect x="14" y="18" width="432" height="264" rx="16" fill="#0e0e13" stroke="rgba(255,255,255,0.14)" />
      <path d="M150 90 L230 90 M270 150 L330 150 M230 130 L230 200" stroke={Y} strokeOpacity="0.5" strokeWidth="1.5" />
      {[
        { x: 70, y: 70, label: "APP" },
        { x: 230, y: 70, label: "API" },
        { x: 330, y: 130, label: "DB" },
        { x: 230, y: 190, label: "AUTH" },
      ].map((b, i) => (
        <g key={i} className="transition-transform duration-500" style={{ transitionDelay: `${i * 80}ms` }}>
          <rect x={b.x} y={b.y} width="92" height="56" rx="8" fill="rgba(255,255,255,0.03)" stroke={Y} strokeOpacity="0.6" className="group-hover:[stroke-opacity:1]" />
          <rect x={b.x + 14} y={b.y + 16} width="22" height="22" rx="5" fill={Y} fillOpacity="0.7" />
          <text x={b.x + 44} y={b.y + 33} fill="#fff" fillOpacity="0.7" fontSize="12" fontFamily="monospace">{b.label}</text>
        </g>
      ))}
      <circle r="3" fill={Y}>
        <animateMotion dur="3s" repeatCount="indefinite" path="M116 126 L230 118 L376 158 L276 218 Z" />
      </circle>
    </svg>
  );
}

export default Services;
