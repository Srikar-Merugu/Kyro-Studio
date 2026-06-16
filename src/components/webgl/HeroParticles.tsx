"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ParticleField from "@/components/webgl/ParticleField";
import {
  kyroCoreCloud,
  textCloud,
  imageCloud,
  shellCloud,
  dustCloud,
  sparkCloud,
} from "@/lib/webgl/shapes";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Particle budget for the (main) midground layer, tuned per device. */
function pickCount(reduced: boolean) {
  if (typeof window === "undefined") return 40000;
  if (reduced) return 9000;
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 8;
  if (w < 768) return 16000;
  if (cores <= 4) return 34000;
  return 60000; // within the 20k–100k band, tuned for 60fps
}

/** A parallax-separated depth layer. */
function Layer({
  z = 0,
  factor = 1,
  children,
}: {
  z?: number;
  factor?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y +=
      (state.pointer.x * 0.35 * factor - ref.current.rotation.y) * 0.04;
    ref.current.rotation.x +=
      (-state.pointer.y * 0.25 * factor - ref.current.rotation.x) * 0.04;
  });
  return (
    <group ref={ref} position={[0, 0, z]}>
      {children}
    </group>
  );
}

export default function HeroParticles({
  sectionId = "home-hero",
}: {
  sectionId?: string;
}) {
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const scrollRef = useRef(0) as RefObject<number>;
  const morphRef = useRef(0) as RefObject<number>;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setReady(true);
  }, []);

  const count = useMemo(() => pickCount(reduced), [reduced]);
  const bgCount = Math.round(count * 0.28);
  const dustCount = Math.round(count * 0.18);
  const fgCount = Math.min(2200, Math.round(count * 0.04));

  // Midground morph sequence: signature core → brand → AI → automation →
  // growth → stat placeholder → services placeholder.
  const baseTargets = useMemo(() => {
    const fallback = () => kyroCoreCloud(count, 1.0);
    const T = (text: string, font: string) =>
      textCloud(text, count, { font }) ?? fallback();
    return [
      kyroCoreCloud(count, 1.0),
      T("KYRO", "900 220px Syne, system-ui, sans-serif"),
      T("AI", "900 260px Syne, system-ui, sans-serif"),
      T("AUTOMATION", "900 120px Syne, system-ui, sans-serif"),
      T("GROWTH", "900 175px Syne, system-ui, sans-serif"),
      T("3×", "900 250px Syne, system-ui, sans-serif"),
      T("WEB · ADS · AI", "900 105px Syne, system-ui, sans-serif"),
    ];
  }, [count]);

  // Upgrade the "KYRO" slot to the sampled logo once it loads.
  const [logoTargets, setLogoTargets] = useState<Float32Array[] | null>(null);
  useEffect(() => {
    let mounted = true;
    imageCloud("/logo.svg", count).then((logo) => {
      if (mounted && logo) {
        const next = [...baseTargets];
        next[1] = logo;
        setLogoTargets(next);
      }
    });
    return () => {
      mounted = false;
    };
  }, [baseTargets, count]);

  const targets = logoTargets ?? baseTargets;
  const seqLen = targets.length;

  // Ambient layers (stable across renders).
  const bgTargets = useMemo(() => [shellCloud(bgCount, 3.2)], [bgCount]);
  const dustTargets = useMemo(() => [dustCloud(dustCount, 8.0)], [dustCount]);
  const fgTargets = useMemo(() => [sparkCloud(fgCount, 2.6)], [fgCount]);

  // Scroll: morph through the sequence first, then disperse as the hero exits.
  useEffect(() => {
    if (!ready) return;
    const el = document.getElementById(sectionId);
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        morphRef.current = p * (seqLen - 1);
        scrollRef.current = Math.max(0, Math.min(1, (p - 0.6) / 0.4));
      },
    });
    return () => st.kill();
  }, [ready, sectionId, seqLen, scrollRef, morphRef]);

  if (!ready) return null;

  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 5], fov: 50 }}
      dpr={[1, reduced ? 1 : 1.75]}
      frameloop={reduced ? "demand" : "always"}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
    >
      {/* Background shell — slow, dim, deep */}
      <Layer z={-2.5} factor={0.3}>
        <ParticleField
          targets={bgTargets}
          count={bgCount}
          driver="static"
          reduced={reduced}
          colorA="#160B66"
          colorB="#3B2FA0"
          size={2.6}
          noiseAmp={0.14}
          noiseFreq={0.6}
          spin={0.02}
          alphaMul={0.5}
          energyBoost={0}
          mouseStrength={0}
        />
      </Layer>

      {/* Atmospheric dust volume */}
      <Layer z={-1} factor={0.15}>
        <ParticleField
          targets={dustTargets}
          count={dustCount}
          driver="static"
          reduced={reduced}
          colorA="#2A2566"
          colorB="#9A8Cff"
          size={1.8}
          noiseAmp={0.45}
          noiseFreq={0.4}
          spin={0.01}
          alphaMul={0.22}
          energyBoost={0}
          mouseStrength={0}
        />
      </Layer>

      {/* Midground — the signature morphing field */}
      <Layer z={0} factor={1}>
        <ParticleField
          targets={targets}
          count={count}
          driver={reduced ? "static" : "scroll"}
          morphRef={morphRef}
          scrollRef={scrollRef}
          reduced={reduced}
          size={6.5}
          noiseAmp={0.24}
          noiseFreq={0.85}
          spin={0.08}
          alphaMul={1}
          energyBoost={1.3}
          mouseStrength={0.6}
          mouseRadius={1.2}
        />
      </Layer>

      {/* Foreground sparks — bright, near camera */}
      <Layer z={1.2} factor={1.8}>
        <ParticleField
          targets={fgTargets}
          count={fgCount}
          driver="static"
          reduced={reduced}
          colorA="#D4D93F"
          colorB="#FFF7DA"
          size={11}
          noiseAmp={0.3}
          noiseFreq={0.5}
          spin={0.05}
          alphaMul={0.9}
          energyBoost={0}
          mouseStrength={0.2}
        />
      </Layer>
    </Canvas>
  );
}
