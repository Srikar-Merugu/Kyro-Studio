"use client";

import { cn } from "@/lib/utils";

/**
 * CityVideo — the cinematic atmosphere layer. A softly-looping, darkened drone
 * shot used purely as a premium backdrop behind typography. Never the subject;
 * always graded down so content leads.
 */
export default function CityVideo({
  dark = 0.55,
  className,
}: {
  dark?: number;
  className?: string;
}) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/city-poster.jpg"
        className="h-full w-full object-cover"
      >
        <source src="/city.mp4" type="video/mp4" />
      </video>
      {/* grade */}
      <div className="absolute inset-0 bg-black" style={{ opacity: dark }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/25" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.5)_0%,transparent_60%)]" />
      <div className="grain-overlay absolute inset-0" />
    </div>
  );
}
