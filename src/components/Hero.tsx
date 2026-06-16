"use client";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import CityVideo from "@/components/CityVideo";

const EASE = [0.16, 1, 0.3, 1] as const;

const lineMask: Variants = {
  hidden: { y: "115%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { duration: 1.2, ease: EASE, delay: 0.6 + i * 0.18 },
  }),
};

const BigLine = ({
  text,
  i,
  className,
  style,
}: {
  text: string;
  i: number;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <span className="block overflow-hidden">
    <motion.span
      custom={i}
      variants={lineMask}
      initial="hidden"
      animate="visible"
      className={cn("block will-change-transform", className)}
      style={style}
    >
      {text}
    </motion.span>
  </span>
);

const Hero = () => {
  const t = useTranslations("hero");
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const overlay = useTransform(scrollYProgress, [0, 1], [0, 0.65]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const contentFade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      id="home-hero"
      ref={ref}
      className="relative flex h-[100svh] max-h-[100svh] w-full items-end overflow-hidden"
    >
      {/* Atmospheric city backdrop */}
      <motion.div style={{ scale }} className="absolute inset-0 will-change-transform">
        <CityVideo dark={0.5} />
      </motion.div>
      <motion.div
        style={{ opacity: overlay }}
        className="pointer-events-none absolute inset-0 bg-black"
      />

      {/* Foreground — typography dominates */}
      <motion.div
        style={{ y: contentY, opacity: contentFade }}
        className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-[12vh] md:px-12"
      >
        <h1 className="font-display font-medium uppercase leading-[0.85] tracking-[-0.04em] text-[clamp(48px,11vw,150px)] drop-shadow-[0_6px_40px_rgba(0,0,0,0.8)]">
          <BigLine text={t("headline_1")} i={0} className="text-white" />
          <BigLine text={t("headline_2")} i={1} className="text-brand-yellow" />
          <BigLine
            text={t("headline_3")}
            i={2}
            className="text-transparent"
            style={{ WebkitTextStroke: "1.5px rgba(212,217,63,0.9)" }}
          />
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 1.6 }}
          className="mt-9 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-md text-base leading-relaxed text-neutral-300">
            {t("tagline_primary")}
          </p>
          <Link
            href="https://calendar.app.google/SkMr99BXaF5DhGn98"
            target="_blank"
            data-cursor="hover"
            className="group flex items-center gap-4 text-sm font-medium uppercase tracking-[0.1em] text-white"
          >
            <span className="relative">
              {t("cta_primary")}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand-yellow transition-all duration-500 group-hover:w-full" />
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 transition-all duration-500 group-hover:border-brand-yellow group-hover:bg-brand-yellow group-hover:text-black">
              →
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 right-6 z-10 flex flex-col items-center gap-2 md:right-12"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">
          Scroll
        </span>
        <div className="h-12 w-px overflow-hidden bg-white/15">
          <motion.div
            animate={{ y: [-48, 48] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="h-1/2 w-full bg-brand-yellow"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
