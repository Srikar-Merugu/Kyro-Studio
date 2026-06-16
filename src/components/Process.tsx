"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useTranslations } from "next-intl";

const EASE = [0.16, 1, 0.3, 1] as const;
const CARD_W = 56; // vw per card slot
const PAD = (100 - CARD_W) / 2;

const Process = () => {
  const t = useTranslations("process");
  const steps = [0, 1, 2, 3].map((i) => ({
    n: `0${i + 1}`,
    title: t(`steps.${i}.title`),
    desc: t(`steps.${i}.description`),
  }));
  const N = steps.length;

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0vw", `-${(N - 1) * CARD_W}vw`]);
  const lineW = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" className="relative bg-black">
      <div ref={trackRef} className="relative" style={{ height: `${N * 100}vh` }}>
        <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
          {/* header */}
          <div className="absolute left-0 right-0 top-[10vh] z-10 px-6 text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, ease: EASE }}
              className="mb-4 font-mono text-[10px] uppercase tracking-[0.32em] text-brand-yellow"
            >
              {t("eyebrow")}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
              className="font-display font-medium uppercase leading-[0.95] tracking-[-0.04em] text-[clamp(30px,5vw,64px)] text-white"
            >
              {t("headline")} <span className="text-brand-yellow">{t("headline_accent")}</span>
            </motion.h2>
            <div className="relative mx-auto mt-10 h-px w-[60%] max-w-2xl bg-white/10">
              <motion.div style={{ width: lineW }} className="absolute left-0 top-0 h-px bg-brand-yellow shadow-[0_0_10px_rgba(212,217,63,0.7)]" />
            </div>
          </div>

          {/* horizontal sliding cards */}
          <motion.div style={{ x }} className="flex items-center">
            <div style={{ width: `${PAD}vw` }} className="shrink-0" />
            {steps.map((s, i) => (
              <Step key={i} p={scrollYProgress} i={i} N={N} {...s} />
            ))}
            <div style={{ width: `${PAD}vw` }} className="shrink-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

function Step({
  p,
  i,
  N,
  n,
  title,
  desc,
}: {
  p: MotionValue<number>;
  i: number;
  N: number;
  n: string;
  title: string;
  desc: string;
}) {
  const c = N > 1 ? i / (N - 1) : 0;
  const step = 1 / (N - 1);

  const safe = (v: number) => Math.max(0, Math.min(1, v));

  const scale = useTransform(
    p,
    [safe(c - step * 1.2), safe(c), safe(c + step * 1.2)],
    [0.82, 1, 0.82]
  );
  const opacity = useTransform(
    p,
    [safe(c - step * 0.8), safe(c - step * 0.1), safe(c + step * 0.1), safe(c + step * 0.8)],
    i === 0 ? [1, 1, 1, 0.2] : i === N - 1 ? [0.2, 1, 1, 1] : [0.2, 1, 1, 0.2]
  );
  const blur = useTransform(
    p,
    [safe(c - step * 1.2), safe(c), safe(c + step * 1.2)],
    [8, 0, 8]
  );
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.div
      style={{ scale, opacity, filter }}
      className="shrink-0 px-[2vw]"
      data-cursor="hover"
    >
      <div className="group relative flex h-[58vh] w-[52vw] max-w-[700px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-10 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] transition-colors duration-500 hover:border-brand-yellow/40 md:p-16">
        <span className="pointer-events-none absolute -right-4 top-0 select-none font-display text-[24vw] font-bold leading-none text-white/[0.03]">
          {n}
        </span>
        <div className="relative z-10 flex items-center gap-4">
          <span className="font-mono text-xs tracking-[0.2em] text-brand-yellow">{n}</span>
          <span className="h-3 w-3 rounded-full bg-brand-yellow shadow-[0_0_16px_rgba(212,217,63,0.8)]" />
        </div>
        <div className="relative z-10">
          <h3 className="font-display font-medium uppercase leading-[0.95] tracking-[-0.04em] text-[clamp(32px,5vw,80px)] text-white transition-colors duration-500 group-hover:text-brand-yellow">
            {title}
          </h3>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
            {desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default Process;
