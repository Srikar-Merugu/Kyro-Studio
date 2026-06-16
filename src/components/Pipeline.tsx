"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import {
  UserPlus,
  Filter,
  Database,
  Mail,
  RefreshCw,
  Trophy,
} from "lucide-react";

const STAGES = [
  { label: "Lead", icon: UserPlus },
  { label: "Qualify", icon: Filter },
  { label: "CRM", icon: Database },
  { label: "Email", icon: Mail },
  { label: "Nurture", icon: RefreshCw },
  { label: "Convert", icon: Trophy },
];

/**
 * Pipeline — a scroll-driven automation workflow. A glowing energy line draws
 * itself as the section scrolls into view and each stage ignites in sequence,
 * turning a static feature list into a living process. Purely decorative.
 */
export default function Pipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "center 55%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <div ref={ref} aria-hidden className="relative w-full py-6">
      {/* ---- Desktop: horizontal flow ---- */}
      <div className="relative hidden md:block">
        <div className="absolute left-0 right-0 top-7 h-[2px] -translate-y-1/2 bg-white/8" />
        <motion.div
          style={{ scaleX: progress }}
          className="absolute left-0 right-0 top-7 h-[2px] -translate-y-1/2 origin-left bg-gradient-to-r from-brand-yellow via-brand-yellow to-brand-yellow shadow-[0_0_14px_rgba(212,217,63,0.8)]"
        />
        <div className="relative flex items-start justify-between">
          {STAGES.map((s, i) => (
            <Stage
              key={s.label}
              progress={progress}
              threshold={i / (STAGES.length - 1)}
              icon={<s.icon className="h-5 w-5" />}
              label={s.label}
            />
          ))}
        </div>
      </div>

      {/* ---- Mobile: vertical flow ---- */}
      <div className="relative md:hidden pl-2">
        <div className="absolute left-[27px] top-3 bottom-3 w-[2px] bg-white/8" />
        <motion.div
          style={{ scaleY: progress }}
          className="absolute left-[27px] top-3 bottom-3 w-[2px] origin-top bg-gradient-to-b from-brand-yellow to-brand-yellow shadow-[0_0_14px_rgba(212,217,63,0.8)]"
        />
        <div className="flex flex-col gap-7">
          {STAGES.map((s, i) => (
            <Stage
              key={s.label}
              progress={progress}
              threshold={i / (STAGES.length - 1)}
              icon={<s.icon className="h-5 w-5" />}
              label={s.label}
              horizontal={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stage({
  progress,
  threshold,
  icon,
  label,
  horizontal = true,
}: {
  progress: MotionValue<number>;
  threshold: number;
  icon: React.ReactNode;
  label: string;
  horizontal?: boolean;
}) {
  const lit = useTransform(
    progress,
    [Math.max(0, threshold - 0.08), threshold + 0.02],
    [0, 1]
  );
  const scale = useTransform(lit, [0, 1], [0.85, 1]);
  const bg = useTransform(
    lit,
    [0, 1],
    ["rgba(12,12,20,0.9)", "rgba(212,217,63,1)"]
  );
  const color = useTransform(lit, [0, 1], ["#9a9a9a", "#08080E"]);
  const border = useTransform(
    lit,
    [0, 1],
    ["rgba(255,255,255,0.12)", "rgba(212,217,63,1)"]
  );
  const glow = useTransform(
    lit,
    [0, 1],
    ["0 0 0 rgba(212,217,63,0)", "0 0 22px rgba(212,217,63,0.65)"]
  );
  const labelOpacity = useTransform(lit, [0, 1], [0.45, 1]);

  return (
    <div
      className={
        horizontal
          ? "flex flex-col items-center gap-3 text-center"
          : "flex items-center gap-4"
      }
    >
      <motion.div
        style={{
          scale,
          background: bg,
          color,
          borderColor: border,
          boxShadow: glow,
        }}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border"
      >
        {icon}
      </motion.div>
      <motion.span
        style={{ opacity: labelOpacity }}
        className="font-display text-xs font-bold uppercase tracking-[0.12em] text-white"
      >
        {label}
      </motion.span>
    </div>
  );
}
