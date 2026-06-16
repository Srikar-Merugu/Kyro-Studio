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

  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      /* ── Heading entrance ── */
      const headingTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top 85%",
          end: "top 50%",
          toggleActions: "play none none reverse",
        },
      });

      headingTl
        .fromTo(eyebrowRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        )
        .fromTo(line1Ref.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
          "-=0.5"
        )
        .fromTo(line2Ref.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
          "-=0.85"
        );

      /* ── Card slide ── */
      gsap.set(cards, { x: "40%", opacity: 0, scale: 0.97, filter: "blur(2px)" });
      gsap.set(cards[0], { x: "0%", opacity: 1, scale: 1, filter: "blur(0px)" });

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: `+=${(cards.length - 1) * 100}%`,
          pin: track,
          scrub: 0.8,
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
        master.to(cards[i], {
          x: "-40%",
          opacity: 0,
          scale: 0.97,
          filter: "blur(2px)",
          duration: 0.5,
          ease: "power3.inOut",
        }, i);

        master.to(cards[i + 1], {
          x: "0%",
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.5,
          ease: "power3.inOut",
        }, i + 0.5);
      }
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <section id="process" className="relative bg-[#050505]">
      <div ref={wrapperRef} className="relative pt-[20vh]">
        <div ref={trackRef} className="relative">
          {/* ── Heading ── */}
          <div className="relative flex flex-col items-center pb-8 md:pb-12">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-brand-navy/4 rounded-full blur-[140px]" />
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-brand-yellow/3 rounded-full blur-[120px]" />
            </div>

            <p
              ref={eyebrowRef}
              className="mb-4 font-mono text-[11px] uppercase tracking-[0.35em] text-brand-yellow"
            >
              {t("eyebrow")}
            </p>

            <div className="text-center">
              <div ref={line1Ref} className="overflow-hidden">
                <h2 className="font-display font-medium uppercase leading-[0.92] tracking-[-0.04em] text-[clamp(28px,5vw,60px)] text-white">
                  {t("headline")}
                </h2>
              </div>
              <div ref={line2Ref} className="overflow-hidden mt-1">
                <h2 className="font-display font-medium uppercase leading-[0.92] tracking-[-0.04em] text-[clamp(28px,5vw,60px)] text-brand-yellow">
                  {t("headline_accent")}
                </h2>
              </div>
            </div>
          </div>

          {/* ── Cards ── */}
          <div className="relative h-[70vh] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-brand-navy/3 rounded-full blur-[140px]" />
              <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-brand-yellow/3 rounded-full blur-[120px]" />
            </div>

            <div className="absolute top-4 right-6 md:top-6 md:right-12 z-30 flex items-center gap-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-brand-yellow/60">
                {t("eyebrow")}
              </p>
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
                  className="group relative flex h-[52vh] w-[80vw] max-w-[1100px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-8 md:p-12 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]"
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
                    <h3 className="font-display font-medium uppercase leading-[0.95] tracking-[-0.04em] text-[clamp(28px,4.5vw,64px)] text-white transition-colors duration-500 group-hover:text-brand-yellow">
                      {step.title}
                    </h3>
                    <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-400">
                      {step.desc}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>
              </div>
            ))}

            <div
              ref={progressRef}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2"
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
        </div>
      </div>
    </section>
  );
};

export default Process;
