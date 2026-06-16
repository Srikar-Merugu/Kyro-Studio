"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useTranslations } from "next-intl";

const EASE = [0.16, 1, 0.3, 1] as const;

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

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const N = items.length;

  return (
    <section id="services" className="relative bg-black">
      <div className="mx-auto max-w-[1400px] px-6 pt-28 text-center md:px-12 md:pt-40">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-6 font-mono text-[10px] uppercase tracking-[0.32em] text-brand-yellow"
        >
          {t("eyebrow")}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="mx-auto max-w-4xl font-display font-medium uppercase leading-[0.95] tracking-[-0.04em] text-[clamp(32px,5.5vw,68px)] text-white"
        >
          {t("headline")} <span className="text-brand-yellow">{t("headline_accent")}</span>
        </motion.h2>
      </div>

      <div ref={trackRef} className="relative" style={{ height: `${N * 100}vh` }}>
        <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
          {items.map((s, i) => (
            <ServiceCard key={i} p={scrollYProgress} index={i} total={N} {...s} />
          ))}
          <Counter p={scrollYProgress} total={N} />
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({
  p,
  index,
  total,
  n,
  title,
  desc,
  icon,
  visual,
}: {
  p: MotionValue<number>;
  index: number;
  total: number;
  n: string;
  title: string;
  desc: string;
  icon: string;
  visual: "web" | "growth" | "network" | "arch";
}) => {
  const w = 1 / total;
  const c = (index + 0.5) * w;

  const scale = useTransform(
    p,
    [Math.max(0, c - w), c, Math.min(1, c + w)],
    [0.8, 1, 0.8]
  );
  const opacity = useTransform(
    p,
    [Math.max(0, c - w * 0.8), c - w * 0.1, c + w * 0.1, Math.min(1, c + w * 0.8)],
    index === 0 ? [1, 1, 1, 0] : index === total - 1 ? [0, 1, 1, 1] : [0, 1, 1, 0]
  );
  const y = useTransform(
    p,
    [Math.max(0, c - w), c, Math.min(1, c + w)],
    [60, 0, -60]
  );
  const blur = useTransform(
    p,
    [Math.max(0, c - w), c, Math.min(1, c + w)],
    [8, 0, 8]
  );
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));

  return (
    <motion.div
      style={{ scale, opacity, y, filter, pointerEvents }}
      className="absolute inset-0 flex items-center justify-center px-6 will-change-transform md:px-12"
    >
      <div
        data-cursor="hover"
        className="group grid w-full max-w-[1140px] grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] transition-colors duration-500 hover:border-brand-yellow/40 lg:grid-cols-2"
      >
        <div className="relative z-10 flex flex-col justify-between p-8 md:p-14">
          <div className="flex items-center justify-between">
            <span className="text-4xl">{icon}</span>
            <span className="font-mono text-xs tracking-[0.2em] text-brand-yellow">
              {n} / 0{total}
            </span>
          </div>
          <div>
            <h3 className="font-display font-medium uppercase leading-[0.95] tracking-[-0.04em] text-[clamp(34px,5vw,72px)] text-white">
              {title}
            </h3>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-400">
              {desc}
            </p>
            <span className="mt-10 inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-brand-yellow">
              Explore
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-yellow/60 transition-transform duration-500 group-hover:rotate-45">
                ↗
              </span>
            </span>
          </div>
        </div>

        <div className="relative flex min-h-[30vh] items-center justify-center overflow-hidden border-t border-white/10 bg-[#0b0b0f] p-6 lg:min-h-0 lg:border-l lg:border-t-0">
          <span className="pointer-events-none absolute select-none font-display text-[30vw] font-bold leading-none text-white/[0.035] lg:text-[15vw]">
            {n}
          </span>
          <Visual kind={visual} />
        </div>
      </div>
    </motion.div>
  );
};

function Counter({ p, total }: { p: MotionValue<number>; total: number }) {
  return (
    <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <Tick key={i} p={p} index={i} total={total} />
      ))}
    </div>
  );
}

function Tick({ p, index, total }: { p: MotionValue<number>; index: number; total: number }) {
  const w = 1 / total;
  const c = (index + 0.5) * w;
  const opacity = useTransform(p, [c - w * 0.5, c, c + w * 0.5], [0.25, 1, 0.25]);
  const width = useTransform(p, [c - w * 0.5, c, c + w * 0.5], ["8px", "30px", "8px"]);
  return <motion.span style={{ opacity, width }} className="h-1.5 rounded-full bg-brand-yellow" />;
}

const Y = "#D4D93F";

function Visual({ kind }: { kind: "web" | "growth" | "network" | "arch" }) {
  return (
    <div className="relative w-[82%] max-w-[460px] [perspective:1200px]">
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
