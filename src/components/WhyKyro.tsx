"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const WhyKyro = () => {
  const t = useTranslations("why");
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const text = textRef.current;
    if (!hero || !text) return;

    const ctx = gsap.context(() => {
      const chars = text.querySelectorAll(".wc");

      gsap.set(chars, { opacity: 0, y: 80, rotateX: -40 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top 80%",
          end: "top 20%",
          scrub: 0.5,
        },
      });

      chars.forEach((char, i) => {
        tl.to(char, { opacity: 1, y: 0, rotateX: 0, duration: 0.3, ease: "power3.out" }, i * 0.05);
      });
    }, hero);

    return () => ctx.revert();
  }, []);

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
          <div ref={textRef} className="flex justify-center items-baseline gap-[0.3em]" style={{ perspective: "600px" }}>
            {"WHY".split("").map((char, i) => (
              <span
                key={`why-${i}`}
                className="wc inline-block font-display font-bold uppercase text-white"
                style={{
                  fontSize: "clamp(60px, 18vw, 260px)",
                  lineHeight: "0.85",
                  letterSpacing: "-0.03em",
                }}
              >
                {char}
              </span>
            ))}
            {"KYRO".split("").map((char, i) => (
              <span
                key={`kyro-${i}`}
                className="wc inline-block font-display font-bold uppercase text-brand-yellow"
                style={{
                  fontSize: "clamp(60px, 18vw, 260px)",
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
    </section>
  );
};

export default WhyKyro;
