"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * ScrollProgress — a slim brand-yellow bar pinned to the top of the viewport
 * that tracks reading progress through the page. Uses the document scroll, so
 * it stays in sync with Lenis. Decorative and unobtrusive.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[200] h-[2px] w-full origin-left bg-gradient-to-r from-brand-yellow via-brand-yellow to-brand-navy shadow-[0_0_10px_rgba(212,217,63,0.6)]"
    />
  );
}
