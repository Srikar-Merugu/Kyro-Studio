"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";

const EASE = [0.16, 1, 0.3, 1] as const;

const WhyKyro = () => {
  const t = useTranslations("why");
  const stats = [
    { v: "3×", k: t("stats.0.label") },
    { v: "80%", k: t("stats.1.label") },
    { v: "14d", k: t("stats.2.label") },
    { v: "24/7", k: t("stats.3.label") },
  ];
  const bullets = [
    t("bullets.0"),
    t("bullets.1"),
    t("bullets.2"),
    t("bullets.3"),
    t("bullets.4"),
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const seg = 1 / stats.length;

  return (
    <section id="why-kyro" className="relative bg-black">
      {/* Brand highlight — keep KYRO front and centre */}
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-6 font-mono text-[10px] uppercase tracking-[0.32em] text-brand-yellow"
        >
          {t("eyebrow")}
        </motion.p>
        <h2 className="overflow-hidden">
          <motion.span
            initial={{ y: "115%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1.2, ease: EASE }}
            className="block font-display font-medium uppercase leading-[0.85] tracking-[-0.05em] text-[clamp(64px,17vw,260px)]"
          >
            <span className="text-white">Why </span>
            <span className="text-brand-yellow">Kyro</span>
          </motion.span>
        </h2>
      </div>

      {/* Full-screen statistic moments */}
      <div ref={trackRef} className="relative" style={{ height: `${stats.length * 100}vh` }}>
        <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
          <p className="absolute left-6 top-24 font-mono text-[10px] uppercase tracking-[0.32em] text-brand-yellow md:left-12">
            {t("eyebrow")}
          </p>
          {stats.map((s, i) => (
            <StatMoment
              key={i}
              p={scrollYProgress}
              range={[i * seg, (i + 1) * seg]}
              value={s.v}
              label={s.k}
              index={i}
              total={stats.length}
            />
          ))}
          <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-3">
            {stats.map((_, i) => (
              <Dot key={i} p={scrollYProgress} range={[i * seg, (i + 1) * seg]} />
            ))}
          </div>
        </div>
      </div>

      {/* Manifesto */}
      <div className="mx-auto max-w-[1400px] px-6 py-32 md:px-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1, ease: EASE }}
          className="max-w-5xl font-display font-medium uppercase leading-[0.95] tracking-[-0.04em] text-[clamp(32px,6vw,84px)] text-white"
        >
          {t("headline")} <span className="text-brand-yellow">{t("headline_accent")}</span>
        </motion.h2>

        <div className="mt-16 max-w-4xl">
          {bullets.map((b, i) => (
            <Bullet key={i} text={b} index={i} />
          ))}
        </div>
        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
          {t("stats_disclaimer")}
        </p>
      </div>
    </section>
  );
};

function StatMoment({
  p,
  range,
  value,
  label,
  index,
  total,
}: {
  p: MotionValue<number>;
  range: [number, number];
  value: string;
  label: string;
  index: number;
  total: number;
}) {
  const [a, b] = range;
  const pad = (b - a) * 0.3;
  const inA = index === 0 ? a : a + pad;
  const outB = index === total - 1 ? b : b - pad;

  const opacity = useTransform(
    p,
    [a, inA, outB, b],
    [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0]
  );
  const scale = useTransform(p, [a, inA, outB, b], [1.1, 1, 1, 0.92]);
  const y = useTransform(p, [inA, outB], [0, -30]);

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center"
    >
      <span className="font-display font-medium leading-none tracking-[-0.05em] text-[clamp(100px,28vw,380px)] text-white">
        {value}
      </span>
      <span className="mt-5 font-mono text-base uppercase tracking-[0.35em] text-brand-yellow md:text-2xl">
        {label}
      </span>
    </motion.div>
  );
}

function Dot({ p, range }: { p: MotionValue<number>; range: [number, number] }) {
  const [a, b] = range;
  const opacity = useTransform(p, [a, a + 0.001, b - 0.001, b], [0.25, 1, 1, 0.25]);
  const width = useTransform(p, [a, a + 0.001, b - 0.001, b], ["8px", "28px", "28px", "8px"]);
  return (
    <motion.span
      style={{ opacity, width }}
      className="h-1.5 rounded-full bg-brand-yellow"
    />
  );
}

const bulletVariant: Variants = {
  hidden: { y: "110%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { duration: 0.9, ease: EASE, delay: i * 0.08 },
  }),
};

function Bullet({ text, index }: { text: string; index: number }) {
  return (
    <div className="overflow-hidden border-b border-white/8 py-5">
      <motion.p
        variants={bulletVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-12%" }}
        custom={index}
        className="flex items-center gap-5 font-display text-[clamp(20px,3vw,40px)] font-normal leading-[1.2] tracking-[-0.02em] text-neutral-400 transition-colors duration-300 hover:text-white"
      >
        <span className="text-brand-yellow">→</span>
        {text}
      </motion.p>
    </div>
  );
}

export default WhyKyro;
