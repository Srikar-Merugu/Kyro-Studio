"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * SmoothScroll — global cinematic scrolling via Lenis, synced to GSAP's ticker
 * so ScrollTrigger-driven animations stay perfectly in step.
 *
 * Functional guarantees (nothing existing breaks):
 *  - Hash links in the Nav (#services, #why-kyro, …) still scroll to their target.
 *  - window.scrollY keeps updating, so the Nav scroll-spy + glass state keep working.
 *  - Honors prefers-reduced-motion by skipping Lenis entirely (native scroll).
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    // Expose for other components (e.g. CTAs) that may want programmatic scroll.
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    // Drive Lenis from GSAP's RAF loop and notify ScrollTrigger on each frame.
    lenis.on("scroll", ScrollTrigger.update);
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Intercept same-page hash links so they glide via Lenis instead of jumping.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"], a[href*="/#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const raw = anchor.getAttribute("href") || "";
      const hash = raw.includes("#") ? `#${raw.split("#")[1]}` : "";
      if (!hash || hash === "#") return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80, duration: 1.25 });
      history.pushState(null, "", hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(onTick);
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  return <>{children}</>;
}
