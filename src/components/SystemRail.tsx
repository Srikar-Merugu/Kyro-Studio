"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

type Station = { id: string; n: string; label: string };

const STATIONS: Station[] = [
  { id: "home-hero", n: "01", label: "SYSTEM" },
  { id: "services", n: "02", label: "SERVICES" },
  { id: "automation", n: "03", label: "AUTOMATION" },
  { id: "why-kyro", n: "04", label: "SIGNALS" },
  { id: "process", n: "05", label: "PROCESS" },
  { id: "contact", n: "06", label: "CONNECT" },
];

/**
 * SystemRail — a fixed "process rail" that turns navigation into an OS readout.
 * A spine line runs down the left edge; a signal fill descends it with scroll;
 * each section is a station that activates as you arrive. Clicking a station
 * routes the Lenis scroll there. Desktop only; hidden under reduced clutter on
 * touch.
 */
export default function SystemRail() {
  const [active, setActive] = useState("home-hero");
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    setMounted(true);
    const observers: IntersectionObserver[] = [];
    STATIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { threshold: 0.35 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  if (!mounted) return null;

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      aria-label="System sections"
      className="fixed left-6 top-1/2 z-[90] hidden -translate-y-1/2 lg:block"
    >
      <div className="relative pl-3">
        {/* spine */}
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/10" />
        <motion.div
          style={{ scaleY: fill }}
          className="absolute left-[5px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-brand-yellow to-brand-navy shadow-[0_0_8px_rgba(212,217,63,0.7)]"
        />

        <ul className="flex flex-col gap-7">
          {STATIONS.map((s) => {
            const on = active === s.id;
            return (
              <li key={s.id} className="relative flex items-center">
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => go(s.id)}
                  className="group flex items-center gap-3"
                  aria-current={on ? "true" : undefined}
                >
                  {/* station node */}
                  <span className="relative -ml-[10px] flex h-3 w-3 items-center justify-center">
                    <motion.span
                      animate={{
                        scale: on ? 1 : 0.55,
                        backgroundColor: on ? "#D4D93F" : "rgba(255,255,255,0.25)",
                        boxShadow: on
                          ? "0 0 12px rgba(212,217,63,0.9)"
                          : "0 0 0 rgba(0,0,0,0)",
                      }}
                      transition={{ duration: 0.3 }}
                      className="h-2.5 w-2.5 rounded-full"
                    />
                  </span>

                  {/* readout */}
                  <span className="flex items-baseline gap-2 font-mono text-[10px] tracking-[0.18em]">
                    <span
                      className={
                        on ? "text-brand-yellow" : "text-neutral-600"
                      }
                    >
                      {s.n}
                    </span>
                    <span
                      className={`uppercase transition-all duration-300 ${
                        on
                          ? "text-white opacity-100"
                          : "text-neutral-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                      }`}
                    >
                      {s.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
