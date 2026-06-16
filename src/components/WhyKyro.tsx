"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CARDS = [
  { icon: "◆", title: "Strategy", desc: "We don't guess. Every decision is backed by data, research, and a clear growth framework." },
  { icon: "◇", title: "Design", desc: "Premium visual systems that communicate trust, authority, and attention to detail." },
  { icon: "◈", title: "Automation", desc: "Intelligent systems that work while you sleep. Leads, emails, reports — all on autopilot." },
];

const WhyKyro = () => {
  const t = useTranslations("why");
  const heroRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const kyroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const why = whyRef.current;
    const kyro = kyroRef.current;
    if (!hero || !why || !kyro) return;

    const ctx = gsap.context(() => {
      const whyChars = why.querySelectorAll(".wc");
      const kyroChars = kyro.querySelectorAll(".wc");

      gsap.set(whyChars, { opacity: 0, y: 80, rotateX: -40 });
      gsap.set(kyroChars, { opacity: 0, y: 80, rotateX: -40 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top 80%",
          end: "top 20%",
          scrub: 0.5,
        },
      });

      whyChars.forEach((char, i) => {
        tl.to(char, { opacity: 1, y: 0, rotateX: 0, duration: 0.3, ease: "power3.out" }, i * 0.06);
      });

      kyroChars.forEach((char, i) => {
        tl.to(char, { opacity: 1, y: 0, rotateX: 0, duration: 0.3, ease: "power3.out" }, whyChars.length * 0.06 + i * 0.06);
      });
    }, hero);

    return () => ctx.revert();
  }, []);

  const stats = [
    { value: "50+", label: t("stats.0.label") },
    { value: "95%", label: t("stats.1.label") },
    { value: "24/7", label: t("stats.2.label") },
    { value: "3×", label: t("stats.3.label") },
  ];

  return (
    <section id="why-kyro" className="relative bg-[#08080e] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-navy/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-yellow/3 rounded-full blur-[160px]" />
      </div>

      <div
        ref={heroRef}
        className="relative z-10 flex flex-col items-center justify-center py-32 md:py-44 px-6"
      >
        <p className="mb-10 font-mono text-[11px] uppercase tracking-[0.4em] text-brand-yellow/60">
          {t("eyebrow")}
        </p>

        <div className="overflow-hidden">
          <div ref={whyRef} className="flex justify-center" style={{ perspective: "600px" }}>
            {"WHY".split("").map((char, i) => (
              <span
                key={i}
                className="wc inline-block font-display font-medium uppercase text-white"
                style={{
                  fontSize: "clamp(60px, 18vw, 220px)",
                  lineHeight: "0.85",
                  letterSpacing: "-0.03em",
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-hidden mt-2">
          <div ref={kyroRef} className="flex justify-center" style={{ perspective: "600px" }}>
            {"KYRO".split("").map((char, i) => (
              <span
                key={i}
                className="wc inline-block font-display font-medium uppercase text-brand-yellow"
                style={{
                  fontSize: "clamp(60px, 18vw, 220px)",
                  lineHeight: "0.85",
                  letterSpacing: "-0.03em",
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-20 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((card, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-500 hover:border-brand-yellow/20 hover:bg-white/[0.04]"
            >
              <span className="block mb-5 text-brand-yellow text-2xl">{card.icon}</span>
              <h3 className="mb-3 font-display font-medium text-xl text-white uppercase tracking-[-0.02em]">
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-400">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-16 md:px-12">
        <h3 className="mb-10 max-w-5xl font-display font-medium uppercase leading-[0.95] tracking-[-0.04em] text-[clamp(24px,4vw,56px)] text-white">
          {t("headline")} <span className="text-brand-yellow">{t("headline_accent")}</span>
        </h3>
        <div className="max-w-4xl">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="overflow-hidden border-b border-white/8 py-4">
              <p className="flex items-center gap-4 font-display text-[clamp(16px,2vw,30px)] font-normal leading-[1.2] tracking-[-0.02em] text-neutral-400 transition-colors duration-300 hover:text-white">
                <span className="text-brand-yellow">→</span>
                {t(`bullets.${i}`)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-20 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((s, i) => (
            <div key={i} className="text-center lg:text-left">
              <span className="block font-display font-medium leading-none tracking-[-0.04em] text-[clamp(40px,7vw,80px)] text-white">
                {s.value}
              </span>
              <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.25em] text-brand-yellow/60">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyKyro;
