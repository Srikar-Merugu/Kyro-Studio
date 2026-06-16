"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * CityExperience — the entire homepage as one cinematic, scroll-scrubbed flight
 * through a European business city. Scroll position drives the drone video's
 * timeline (not a loop), so the camera literally travels deeper into the city as
 * you descend. Typographic "scenes" and service reveals surface from the
 * journey, then it darkens and hands off to the contact climax below.
 *
 * Stack: Lenis (global) for smooth scroll, Framer Motion for the scene
 * choreography, and a rAF-eased video scrub for buttery frame control.
 */
export default function CityExperience() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Scroll → video timeline (eased) — the heart of the experience.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduced) {
      v.muted = true;
      v.loop = true;
      v.play().catch(() => {});
      return;
    }
    v.pause();
    let raf = 0;
    let cur = 0;
    const prime = () => {
      v.play().then(() => v.pause()).catch(() => {});
    };
    v.addEventListener("loadeddata", prime, { once: true });
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const d = v.duration;
      if (!d || Number.isNaN(d)) return;
      const p = Math.min(1, Math.max(0, scrollYProgress.get()));
      const target = p * (d - 0.05);
      cur += (target - cur) * 0.12;
      if (Math.abs(target - cur) > 0.0015) {
        try {
          v.currentTime = cur;
        } catch {
          /* seeking not ready */
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener("loadeddata", prime);
    };
  }, [scrollYProgress, reduced]);

  // Extra depth push + final darkening into the contact climax.
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.32]);
  const darken = useTransform(scrollYProgress, [0.9, 1], [0, 1]);

  return (
    <section id="home-hero" ref={trackRef} className="relative h-[720svh]">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-black">
        {/* Scroll-scrubbed drone footage */}
        <motion.div style={{ scale }} className="absolute inset-0 will-change-transform">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            poster="/city-poster.jpg"
            className="h-full w-full object-cover"
          >
            <source src="/city.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Cinematic grades */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/40" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,transparent_60%)]" />
        <div className="grain-overlay pointer-events-none absolute inset-0" />
        <motion.div style={{ opacity: darken }} className="pointer-events-none absolute inset-0 bg-black" />

        {/* Persistent meta HUD */}
        <Hud progress={scrollYProgress} />

        {/* ---- SCENES (each surfaces at its own depth) ---- */}

        {/* Opening title sequence */}
        <Scene p={scrollYProgress} range={[0.0, 0.07]} align="end">
          <Statement small="Your" big="BUSINESS" />
        </Scene>
        <Scene p={scrollYProgress} range={[0.07, 0.14]} align="end">
          <Statement small="Powered by" big="OUR SYSTEMS" accent />
        </Scene>
        <Scene p={scrollYProgress} range={[0.14, 0.2]} align="center">
          <h2 className="text-center font-display font-medium uppercase leading-[0.85] tracking-[-0.04em] text-[clamp(48px,11vw,150px)] text-white drop-shadow-[0_6px_40px_rgba(0,0,0,0.8)]">
            Automated
            <br />
            <span className="text-transparent [-webkit-text-stroke:1.5px_#D4D93F]">Growth</span>
          </h2>
        </Scene>

        {/* Service discoveries */}
        <Scene p={scrollYProgress} range={[0.22, 0.34]} align="start">
          <ServiceReveal n="01" title="AI Automation" line="Workflows that qualify, route, follow up and convert — 24/7." visual="lines" />
        </Scene>
        <Scene p={scrollYProgress} range={[0.36, 0.47]} align="end">
          <ServiceReveal n="02" title="Web Design" line="High-converting sites — the living front-end to your system." visual="frame" alignRight />
        </Scene>
        <Scene p={scrollYProgress} range={[0.49, 0.6]} align="start">
          <ServiceReveal n="03" title="Performance Marketing" line="Meta & Google pipelines feeding qualified demand." visual="growth" />
        </Scene>
        <Scene p={scrollYProgress} range={[0.62, 0.73]} align="end">
          <ServiceReveal n="04" title="Custom Applications" line="Bespoke tools wired into how your business runs." visual="arch" alignRight />
        </Scene>

        {/* Why Kyro — stats from the city */}
        <Scene p={scrollYProgress} range={[0.75, 0.86]} align="center">
          <div className="w-full max-w-[1400px] px-6 md:px-12">
            <p className="mb-10 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-brand-yellow">
              The city, running on Kyro
            </p>
            <div className="grid grid-cols-2 gap-x-10 gap-y-12 md:grid-cols-4">
              <StatBlock p={scrollYProgress} at={0.77} v="120+" k="Tasks automated" />
              <StatBlock p={scrollYProgress} at={0.79} v="80%" k="Time saved" />
              <StatBlock p={scrollYProgress} at={0.81} v="3×" k="ROI" />
              <StatBlock p={scrollYProgress} at={0.83} v="24/7" k="Systems running" />
            </div>
          </div>
        </Scene>

        {/* Process — the city becomes an OS */}
        <Scene p={scrollYProgress} range={[0.87, 0.95]} align="center">
          <div className="w-full max-w-[1400px] px-6 md:px-12 text-center">
            <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.32em] text-brand-yellow">
              How we build it
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {["Discovery", "Strategy", "Build", "Launch", "Scale"].map((w, i) => (
                <ProcessWord key={w} p={scrollYProgress} at={0.875 + i * 0.012} word={w} last={i === 4} />
              ))}
            </div>
          </div>
        </Scene>

        {/* Destination — mission control handoff */}
        <Scene p={scrollYProgress} range={[0.95, 1.0]} align="center">
          <div className="text-center">
            <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.32em] text-white/50">
              Arrival
            </p>
            <h2 className="font-display font-medium uppercase leading-[0.85] tracking-[-0.04em] text-[clamp(40px,9vw,128px)] text-white">
              Ready to build
              <br />
              <span className="text-brand-yellow">your system?</span>
            </h2>
            <Link
              href="#contact"
              data-cursor="hover"
              className="mt-10 inline-flex items-center gap-4 text-sm font-medium uppercase tracking-[0.1em] text-white"
            >
              Enter mission control
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-yellow text-brand-yellow">
                ↓
              </span>
            </Link>
          </div>
        </Scene>

        {/* Scroll cue (fades after the opening) */}
        <ScrollCue p={scrollYProgress} />
      </div>
    </section>
  );
}

/* ---------- scene primitives ---------- */

function Scene({
  p,
  range,
  align = "center",
  children,
}: {
  p: MotionValue<number>;
  range: [number, number];
  align?: "start" | "center" | "end";
  children: React.ReactNode;
}) {
  const [a, b] = range;
  const pad = Math.min(0.025, (b - a) / 3);
  const opacity = useTransform(p, [a - pad, a + pad, b - pad, b + pad], [0, 1, 1, 0]);
  const y = useTransform(p, [a, b], [40, -40]);
  const alignCls =
    align === "start" ? "items-center justify-start" : align === "end" ? "items-end justify-start" : "items-center justify-center";
  return (
    <motion.div
      style={{ opacity, y }}
      className={cn(
        "pointer-events-none absolute inset-0 z-10 flex px-6 pb-[14vh] pt-[14vh] md:px-12",
        alignCls
      )}
    >
      {children}
    </motion.div>
  );
}

function Statement({
  small,
  big,
  accent,
}: {
  small: string;
  big: string;
  accent?: boolean;
}) {
  return (
    <div className="max-w-[1400px]">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-white/60">
        {small}
      </p>
      <h2
        className={cn(
          "font-display font-medium uppercase leading-[0.85] tracking-[-0.04em] text-[clamp(52px,12vw,168px)] drop-shadow-[0_6px_40px_rgba(0,0,0,0.85)]",
          accent ? "text-brand-yellow" : "text-white"
        )}
      >
        {big}
      </h2>
    </div>
  );
}

function ServiceReveal({
  n,
  title,
  line,
  visual,
  alignRight,
}: {
  n: string;
  title: string;
  line: string;
  visual: "lines" | "frame" | "growth" | "arch";
  alignRight?: boolean;
}) {
  return (
    <div className={cn("w-full max-w-[1400px]", alignRight && "text-right")}>
      <div className={cn("mb-5 flex items-center gap-4", alignRight && "justify-end")}>
        <span className="font-mono text-xs tracking-[0.2em] text-brand-yellow">{n}</span>
        <span className="h-px w-16 bg-brand-yellow/50" />
      </div>
      <h3 className="font-display font-medium uppercase leading-[0.9] tracking-[-0.04em] text-[clamp(44px,9vw,128px)] text-white drop-shadow-[0_6px_40px_rgba(0,0,0,0.8)]">
        {title}
      </h3>
      <p className={cn("mt-6 max-w-md text-lg leading-relaxed text-neutral-300", alignRight && "ml-auto")}>
        {line}
      </p>
      <div className={cn("mt-8 opacity-80", alignRight && "flex justify-end")}>
        <ServiceVisual kind={visual} />
      </div>
    </div>
  );
}

function ServiceVisual({ kind }: { kind: "lines" | "frame" | "growth" | "arch" }) {
  const stroke = "#D4D93F";
  if (kind === "lines") {
    return (
      <svg width="300" height="90" viewBox="0 0 300 90" fill="none" aria-hidden>
        {[[10, 20], [120, 70], [200, 25], [285, 60], [150, 15]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill={stroke} />
        ))}
        <path d="M10 20 L120 70 L200 25 L285 60" stroke={stroke} strokeWidth="1" strokeDasharray="4 6">
          <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1.4s" repeatCount="indefinite" />
        </path>
        <path d="M120 70 L150 15 L200 25" stroke={stroke} strokeOpacity="0.5" strokeWidth="1" />
      </svg>
    );
  }
  if (kind === "growth") {
    return (
      <svg width="280" height="90" viewBox="0 0 280 90" fill="none" aria-hidden>
        <path d="M5 85 L60 70 L120 55 L180 35 L260 8" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M260 8 L244 14 M260 8 L254 24" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        {[5, 60, 120, 180, 260].map((x, i) => (
          <circle key={i} cx={x} cy={[85, 70, 55, 35, 8][i]} r="2.5" fill={stroke} />
        ))}
      </svg>
    );
  }
  if (kind === "arch") {
    return (
      <svg width="280" height="90" viewBox="0 0 280 90" fill="none" aria-hidden>
        {[20, 120, 220].map((x, i) => (
          <rect key={i} x={x} y={20} width="56" height="46" rx="3" stroke={stroke} strokeOpacity="0.7" />
        ))}
        <path d="M76 43 L120 43 M176 43 L220 43" stroke={stroke} strokeWidth="1" />
        <path d="M48 20 L48 8 L248 8 L248 20" stroke={stroke} strokeOpacity="0.5" />
      </svg>
    );
  }
  return (
    <svg width="240" height="90" viewBox="0 0 240 90" fill="none" aria-hidden>
      <rect x="2" y="2" width="236" height="86" rx="4" stroke={stroke} strokeOpacity="0.6" />
      <path d="M2 22 L238 22" stroke={stroke} strokeOpacity="0.4" />
      <circle cx="14" cy="12" r="2" fill={stroke} />
      <circle cx="24" cy="12" r="2" fill={stroke} />
    </svg>
  );
}

function StatBlock({
  p,
  at,
  v,
  k,
}: {
  p: MotionValue<number>;
  at: number;
  v: string;
  k: string;
}) {
  const opacity = useTransform(p, [at - 0.015, at], [0, 1]);
  const y = useTransform(p, [at - 0.015, at], [24, 0]);
  return (
    <motion.div style={{ opacity, y }} className="text-center">
      <div className="font-display font-medium leading-none tracking-[-0.04em] text-[clamp(40px,7vw,92px)] text-brand-yellow">
        {v}
      </div>
      <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
        {k}
      </div>
    </motion.div>
  );
}

function ProcessWord({
  p,
  at,
  word,
  last,
}: {
  p: MotionValue<number>;
  at: number;
  word: string;
  last?: boolean;
}) {
  const opacity = useTransform(p, [at - 0.012, at], [0.15, 1]);
  return (
    <motion.span
      style={{ opacity }}
      className={cn(
        "font-display font-medium uppercase leading-none tracking-[-0.03em] text-[clamp(28px,5vw,72px)]",
        last ? "text-brand-yellow" : "text-white"
      )}
    >
      {word}
      {!last && <span className="mx-3 text-brand-yellow/40">/</span>}
    </motion.span>
  );
}

function Hud({ progress }: { progress: MotionValue<number> }) {
  const depth = useTransform(progress, (v) => `${Math.round(v * 100)}%`);
  return (
    <div className="pointer-events-none absolute left-6 top-24 z-20 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 md:left-12">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow shadow-[0_0_8px_#D4D93F]" />
      <span>Depth</span>
      <motion.span className="text-brand-yellow">{depth}</motion.span>
    </div>
  );
}

function ScrollCue({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, [0, 0.06], [1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute bottom-8 right-6 z-20 flex flex-col items-center gap-2 md:right-12"
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/45">
        Scroll to fly in
      </span>
      <div className="h-12 w-px overflow-hidden bg-white/15">
        <motion.div
          animate={{ y: [-48, 48] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="h-1/2 w-full bg-brand-yellow"
        />
      </div>
    </motion.div>
  );
}
