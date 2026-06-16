"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STATEMENTS = [
  { line1: "We don't build", line2: "websites.", accent: "websites." },
  { line1: "We build digital", line2: "experiences.", accent: "experiences." },
  { line1: "We build", line2: "automation.", accent: "automation." },
  { line1: "We build growth", line2: "systems.", accent: "systems." },
  { line1: "We build the future", line2: "of your business.", accent: "future" },
];

const STATS = [
  { value: "50+", label: "Projects Delivered" },
  { value: "95%", label: "Client Satisfaction" },
  { value: "24/7", label: "Automation Systems" },
  { value: "3×", label: "Average Lead Growth" },
];

function GrainOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
      }}
    />
  );
}

const WhyKyro = () => {
  const t = useTranslations("why");
  const sectionRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const [activeStatement, setActiveStatement] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const statementEl = statementRef.current;
    if (!section || !statementEl) return;

    const ctx = gsap.context(() => {
      const wordEls = statementEl.querySelectorAll(".sw");
      gsap.set(wordEls, { opacity: 0, y: 50, filter: "blur(6px)" });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "60% bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          const idx = Math.min(Math.floor(p * STATEMENTS.length), STATEMENTS.length - 1);
          setActiveStatement(Math.max(0, idx));
        },
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                wordEls,
                { opacity: 0, y: 50, filter: "blur(6px)" },
                {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  duration: 0.9,
                  stagger: 0.08,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(section);

      return () => observer.disconnect();
    }, section);

    return () => ctx.revert();
  }, []);

  const statement = STATEMENTS[activeStatement];
  const stats = STATS.map((s, i) => ({
    ...s,
    label: t(`stats.${i}.label`),
  }));

  return (
    <section ref={sectionRef} id="why-kyro" className="relative bg-[#08080e]">
      <GrainOverlay />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-brand-navy/6 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-brand-yellow/3 rounded-full blur-[160px]" />
      </div>

      <div
        ref={statementRef}
        className="relative z-10 flex flex-col items-center justify-center py-32 md:py-40 px-6 text-center"
      >
        <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.4em] text-brand-yellow/70">
          {t("eyebrow")}
        </p>
        <h2 className="max-w-6xl font-display font-medium uppercase leading-[0.88] tracking-[-0.05em] text-[clamp(40px,10vw,140px)]">
          <span className="sw inline-block mr-[0.25em] text-white">{statement.line1}</span>
          <br />
          <span className="sw inline-block text-brand-yellow">{statement.line2}</span>
        </h2>

        <div className="mt-12 flex gap-2">
          {STATEMENTS.map((_, i) => (
            <span
              key={i}
              className={`block h-1 rounded-full transition-all duration-500 ${
                i === activeStatement ? "w-8 bg-brand-yellow" : "w-2 bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-24 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((s, i) => (
            <div key={i} className="text-center lg:text-left">
              <span className="block font-display font-medium leading-none tracking-[-0.04em] text-[clamp(48px,8vw,96px)] text-white">
                {s.value}
              </span>
              <span className="mt-3 block font-mono text-[11px] uppercase tracking-[0.25em] text-brand-yellow/70">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 pb-32 md:px-12">
        <h3 className="mb-12 max-w-5xl font-display font-medium uppercase leading-[0.95] tracking-[-0.04em] text-[clamp(28px,5vw,72px)] text-white">
          {t("headline")} <span className="text-brand-yellow">{t("headline_accent")}</span>
        </h3>
        <div className="max-w-4xl">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="overflow-hidden border-b border-white/8 py-5">
              <p className="flex items-center gap-5 font-display text-[clamp(18px,2.5vw,36px)] font-normal leading-[1.2] tracking-[-0.02em] text-neutral-400 transition-colors duration-300 hover:text-white">
                <span className="text-brand-yellow">→</span>
                {t(`bullets.${i}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyKyro;
