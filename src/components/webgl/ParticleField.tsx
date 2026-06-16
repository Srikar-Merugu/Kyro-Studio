"use client";

import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PARTICLE_VERT, PARTICLE_FRAG } from "@/lib/webgl/shaders";
import { randomAttribute } from "@/lib/webgl/shapes";

export type MorphDriver = "time" | "scroll" | "static";

export type ParticleFieldProps = {
  /** Morph targets, each a Float32Array of length count*3. >=1 required. */
  targets: Float32Array[];
  count: number;
  colorA?: string;
  colorB?: string;
  colorC?: string;
  /**
   * How morphing is driven:
   *  - "time":   auto-cycles through targets on a timer
   *  - "scroll": follows `morphRef` (a continuous index 0..targets.length-1)
   *  - "static": renders targets[0] only (ambient layers)
   */
  driver?: MorphDriver;
  /** Continuous target index for the "scroll" driver. */
  morphRef?: RefObject<number>;
  /** External scroll progress 0..1 for dispersion. */
  scrollRef?: RefObject<number>;
  size?: number;
  noiseAmp?: number;
  noiseFreq?: number;
  spin?: number;
  alphaMul?: number;
  energyBoost?: number;
  mouseStrength?: number;
  mouseRadius?: number;
  morphDuration?: number;
  holdDuration?: number;
  reduced?: boolean;
};

/**
 * ParticleField — reusable core of the WebGL system. One draw call of `count`
 * GPU particles that morph between `targets` (time / scroll / static driven),
 * with fbm-curl turbulence, fresnel rim, morph energy, cursor repulsion and
 * scroll dispersion all computed on the GPU.
 *
 * Fully decoupled from the Hero so any section can mount it with its own target
 * clouds and its own scroll source.
 */
export default function ParticleField({
  targets,
  count,
  colorA = "#1B0E7A",
  colorB = "#D4D93F",
  colorC = "#FFF7DA",
  driver = "time",
  morphRef,
  scrollRef,
  size = 6.0,
  noiseAmp = 0.22,
  noiseFreq = 0.9,
  spin = 0.08,
  alphaMul = 1,
  energyBoost = 1.2,
  mouseStrength = 0.5,
  mouseRadius = 1.1,
  morphDuration = 3.0,
  holdDuration = 1.6,
  reduced = false,
}: ParticleFieldProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const aIdxRef = useRef(0);
  const bIdxRef = useRef(1 % Math.max(1, targets.length));
  const tRef = useRef(0);
  const mouseRef = useRef(new THREE.Vector3(999, 999, 0));

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const a = targets[0];
    const b = targets[1 % targets.length] ?? targets[0];
    g.setAttribute("position", new THREE.BufferAttribute(a.slice(), 3));
    g.setAttribute("aTarget", new THREE.BufferAttribute(b.slice(), 3));
    g.setAttribute("aRandom", new THREE.BufferAttribute(randomAttribute(count), 1));
    g.setDrawRange(0, count);
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets, count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: targets.length > 1 && driver !== "static" ? 0 : 1 },
      uSize: { value: size },
      uScroll: { value: 0 },
      uNoiseAmp: { value: noiseAmp },
      uNoiseFreq: { value: noiseFreq },
      uSpin: { value: spin },
      uAlphaMul: { value: alphaMul },
      uEnergyBoost: { value: energyBoost },
      uMouseStrength: { value: mouseStrength },
      uMouseRadius: { value: mouseRadius },
      uDpr: { value: 1 },
      uMouse: { value: new THREE.Vector3(999, 999, 0) },
      uLightDir: { value: new THREE.Vector3(0.5, 0.8, 0.6) },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uColorC: { value: new THREE.Color(colorC) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Load a specific (A,B) target pair into the GPU buffers (O(N), on demand).
  const loadPair = (aIdx: number, bIdx: number) => {
    const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
    const tar = geometry.getAttribute("aTarget") as THREE.BufferAttribute;
    (pos.array as Float32Array).set(targets[aIdx]);
    (tar.array as Float32Array).set(targets[bIdx]);
    pos.needsUpdate = true;
    tar.needsUpdate = true;
    aIdxRef.current = aIdx;
    bIdxRef.current = bIdx;
  };

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms;
    const dt = Math.min(delta, 0.05);
    u.uTime.value += reduced ? dt * 0.3 : dt;
    u.uDpr.value = state.gl.getPixelRatio();

    // smooth cursor → world position on the z=0 plane
    const target = mouseRef.current.set(
      state.pointer.x * 2.4,
      state.pointer.y * 1.6,
      0
    );
    (u.uMouse.value as THREE.Vector3).lerp(target, 0.08);

    // animated key light (dynamic lighting)
    const lt = u.uTime.value;
    (u.uLightDir.value as THREE.Vector3).set(
      Math.cos(lt * 0.3) * 0.8,
      0.6,
      Math.sin(lt * 0.3) * 0.8
    );

    if (scrollRef) u.uScroll.value = scrollRef.current ?? 0;

    const len = targets.length;
    if (driver === "scroll" && morphRef && len > 1) {
      const m = Math.max(0, Math.min(len - 1, morphRef.current ?? 0));
      const a = Math.floor(m);
      const b = Math.min(a + 1, len - 1);
      const frac = m - a;
      if (a !== aIdxRef.current || b !== bIdxRef.current) loadPair(a, b);
      u.uProgress.value = frac;
    } else if (driver === "time" && len > 1 && !reduced) {
      tRef.current += dt;
      const cycle = morphDuration + holdDuration;
      u.uProgress.value = Math.min(1, tRef.current / morphDuration);
      if (tRef.current >= cycle) {
        const nextA = bIdxRef.current;
        const nextB = (bIdxRef.current + 1) % len;
        loadPair(nextA, nextB);
        tRef.current = 0;
        u.uProgress.value = 0;
      }
    }
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={PARTICLE_VERT}
        fragmentShader={PARTICLE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
