"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STATS = [
  { value: "3×", label: "Average ROI Target", numVal: 3, suffix: "×", prefix: "" },
  { value: "80%", label: "Tasks Automated", numVal: 80, suffix: "%", prefix: "" },
  { value: "14d", label: "To First Results", numVal: 14, suffix: "d", prefix: "" },
  { value: "24/7", label: "Systems Running", numVal: 24, suffix: "/7", prefix: "", display: "24" },
];

const StatsShowcase = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const label = labelRef.current;
    if (!section || !track || !label) return;

    const stats = statsRef.current.filter(Boolean) as HTMLDivElement[];
    if (stats.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(label, { opacity: 0, y: 20 });
      gsap.set(stats, { opacity: 0, scale: 0.85, y: 50 });

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${(stats.length + 1) * 100}%`,
          pin: track,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      master.to(label, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0);

      const statStart = 0.6;
      const statDur = 1;

      stats.forEach((stat, i) => {
        const enter = statStart + i * statDur;
        const peak = enter + 0.3;
        const settle = peak + 0.15;
        const exit = settle + 0.3;

        master.to(stat, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power3.out" }, enter);
        master.to(stat, { scale: 1.03, duration: 0.2, ease: "power2.inOut" }, peak);
        master.to(stat, { scale: 1, duration: 0.1, ease: "power2.out" }, settle);
        master.to(stat, { opacity: 0, scale: 0.9, y: -40, duration: 0.3, ease: "power2.in" }, exit);
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-[#050505]">
      <div ref={trackRef} className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-brand-navy/4 rounded-full blur-[180px]" />
          <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-brand-yellow/3 rounded-full blur-[160px]" />
        </div>

        <div
          ref={labelRef}
          className="absolute top-8 left-0 right-0 z-10 flex justify-center px-6 pointer-events-none"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-yellow/60">
            Statistics
          </span>
        </div>

        {STATS.map((stat, i) => (
          <div
            key={i}
            ref={(el) => { statsRef.current[i] = el; }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
          >
            <span
              className="block font-display font-medium leading-none tracking-[-0.05em] text-white"
              style={{ fontSize: "clamp(80px, 22vw, 320px)" }}
            >
              {stat.display || stat.numVal}{stat.suffix}
            </span>
            <span className="mt-6 font-mono text-[11px] uppercase tracking-[0.35em] text-brand-yellow/70">
              {stat.label}
            </span>
          </div>
        ))}

        <div
          ref={dotsRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3"
        >
          {STATS.map((_, i) => (
            <span
              key={i}
              className="block h-1.5 rounded-full bg-brand-yellow transition-all duration-500"
              style={{ width: "8px" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsShowcase;
