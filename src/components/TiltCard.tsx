"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * TiltCard — perspective 3D tilt that follows the cursor, with a soft radial
 * "spotlight" tracking the pointer. Falls back to a plain container on touch
 * devices and under prefers-reduced-motion. Children render above the spotlight.
 */
export default function TiltCard({
  children,
  className,
  max = 8,
  spotlight = true,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  spotlight?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), {
    stiffness: 150,
    damping: 18,
  });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), {
    stiffness: 150,
    damping: 18,
  });
  const glowX = useTransform(px, (v) => `${v * 100}%`);
  const glowY = useTransform(py, (v) => `${v * 100}%`);
  const spotlightBg = useTransform(
    [glowX, glowY],
    ([x, y]: string[]) =>
      `radial-gradient(380px circle at ${x} ${y}, rgba(212,217,63,0.16), transparent 70%)`
  );

  const fine =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: fine)").matches;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !fine || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        reduced
          ? undefined
          : { rotateX: rx, rotateY: ry, transformPerspective: 900 }
      }
      className={cn("relative [transform-style:preserve-3d]", className)}
      {...(rest as Record<string, unknown>)}
    >
      {spotlight && !reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 [.group:hover_&]:opacity-100"
          style={{ background: spotlightBg }}
        />
      )}
      {children}
    </motion.div>
  );
}
