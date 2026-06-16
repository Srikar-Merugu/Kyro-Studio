/**
 * Shape library for the particle engine.
 *
 * Every generator returns a flat Float32Array of length `count * 3` so that any
 * shape can be used interchangeably as a morph target. Parametric shapes emit
 * exactly `count` points; sampled shapes (text / image) are resampled up or
 * down to `count`. This is the contract that lets the Hero — and any future
 * section — morph between sphere ↔ galaxy ↔ wordmark ↔ "stats" etc.
 */

type Vec3 = [number, number, number];

function flatten(points: Vec3[], count: number): Float32Array {
  // Ensure exactly `count` points by random resampling (dup or drop).
  const out = new Float32Array(count * 3);
  const n = points.length;
  if (n === 0) return out;
  for (let i = 0; i < count; i++) {
    const src = i < n ? points[i] : points[(Math.random() * n) | 0];
    out[i * 3] = src[0];
    out[i * 3 + 1] = src[1];
    out[i * 3 + 2] = src[2];
  }
  return out;
}

/** Evenly distributed sphere via the Fibonacci spiral. */
export function sphereCloud(count: number, radius = 1.6): Float32Array {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    out[i * 3] = Math.cos(theta) * r * radius;
    out[i * 3 + 1] = y * radius;
    out[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return out;
}

/** Flattened spiral galaxy disc with arms — reads as "growth / data". */
export function galaxyCloud(count: number, radius = 1.9, arms = 4): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = Math.pow(Math.random(), 0.6);
    const r = t * radius;
    const arm = (i % arms) / arms;
    const angle = arm * Math.PI * 2 + t * 6.0;
    const spread = (1 - t) * 0.5;
    const ox = (Math.random() - 0.5) * spread;
    const oz = (Math.random() - 0.5) * spread;
    out[i * 3] = Math.cos(angle) * r + ox;
    out[i * 3 + 1] = (Math.random() - 0.5) * 0.25 * (0.4 + t);
    out[i * 3 + 2] = Math.sin(angle) * r + oz;
  }
  return out;
}

/** A (p,q) torus knot — an intricate, intelligent-looking flow. */
export function torusKnotCloud(
  count: number,
  scale = 1.0,
  p = 2,
  q = 3
): Float32Array {
  const out = new Float32Array(count * 3);
  const tubeR = 0.32;
  for (let i = 0; i < count; i++) {
    const u = (i / count) * Math.PI * 2 * q;
    const cu = Math.cos(u);
    const su = Math.sin(u);
    const quOverP = (p / q) * u;
    const cs = Math.cos(quOverP);
    const r = 0.9 + 0.4 * Math.cos(quOverP);
    // base curve
    const cx = r * cu;
    const cy = r * su;
    const cz = 0.4 * Math.sin(quOverP);
    // random offset around the tube for volume
    const a = Math.random() * Math.PI * 2;
    const rr = Math.sqrt(Math.random()) * tubeR;
    out[i * 3] = (cx + Math.cos(a) * rr) * scale;
    out[i * 3 + 1] = (cy + Math.sin(a) * rr) * scale;
    out[i * 3 + 2] = (cz + (Math.random() - 0.5) * tubeR) * scale * 1.4 + cs * 0.0;
  }
  return out;
}

/** Concentric ripple field — "signal / automation pulse". */
export function waveFieldCloud(count: number, radius = 1.9): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;
    const y = Math.sin(r * 4.0) * 0.35 * (1 - r / radius);
    out[i * 3] = Math.cos(ang) * r;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = Math.sin(ang) * r;
  }
  return out;
}

/**
 * Sample a string into a centered point cloud (canvas pixel sampling).
 * Browser-only. Returns null on the server or if sampling yields nothing.
 */
export function textCloud(
  text: string,
  count: number,
  opts: { font?: string; spreadZ?: number; scale?: number } = {}
): Float32Array | null {
  if (typeof document === "undefined") return null;
  const W = 1000;
  const H = 320;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = opts.font ?? "900 220px Syne, system-ui, sans-serif";
  ctx.fillText(text, W / 2, H / 2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: Vec3[] = [];
  const step = 3;
  const scale = opts.scale ?? 3.4 / W;
  const spreadZ = opts.spreadZ ?? 0.12;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4 + 3] > 130) {
        pts.push([
          (x - W / 2) * scale,
          -(y - H / 2) * scale,
          (Math.random() - 0.5) * spreadZ,
        ]);
      }
    }
  }
  if (pts.length === 0) return null;
  // shuffle so resampling is unbiased
  for (let i = pts.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  return flatten(pts, count);
}

/** Per-particle random values used for size / phase variation. */
export function randomAttribute(count: number): Float32Array {
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) out[i] = Math.random();
  return out;
}

/**
 * kyroCoreCloud — the signature resting silhouette. A helix-wrapped torus
 * (intelligence / flow) threaded by an ascending growth spiral (momentum) and
 * wrapped in a faint volumetric shell. Distinct and recognizable — not a sphere.
 */
export function kyroCoreCloud(count: number, scale = 1.0): Float32Array {
  const out = new Float32Array(count * 3);
  const R = 1.15; // torus major radius
  const r = 0.34; // torus minor radius
  for (let i = 0; i < count; i++) {
    const sel = i / count;
    let x: number, y: number, z: number;
    if (sel < 0.6) {
      // helix-wrapped torus ring
      const u = Math.random() * Math.PI * 2;
      const strands = 3;
      const v = u * strands + (Math.floor(Math.random() * strands) / strands) * Math.PI * 2;
      const tube = r * (0.55 + Math.random() * 0.45);
      const cx = (R + tube * Math.cos(v)) * Math.cos(u);
      const cz = (R + tube * Math.cos(v)) * Math.sin(u);
      const cy = tube * Math.sin(v);
      // tilt the ring for a more dynamic silhouette
      x = cx;
      y = cy + Math.sin(u * 2.0) * 0.18;
      z = cz;
    } else if (sel < 0.85) {
      // ascending growth spiral through the core
      const t = Math.random();
      const ang = t * Math.PI * 8.0;
      const rad = 0.12 + t * 0.95;
      const jit = (Math.random() - 0.5) * 0.08;
      x = Math.cos(ang) * rad + jit;
      y = (t - 0.5) * 2.4;
      z = Math.sin(ang) * rad + jit;
    } else {
      // faint volumetric shell for depth
      const ang = Math.random() * Math.PI * 2;
      const yy = (Math.random() * 2 - 1);
      const rr = Math.sqrt(1 - yy * yy) * 1.55;
      x = Math.cos(ang) * rr;
      y = yy * 1.55;
      z = Math.sin(ang) * rr;
    }
    out[i * 3] = x * scale;
    out[i * 3 + 1] = y * scale;
    out[i * 3 + 2] = z * scale;
  }
  return out;
}

/** Hollow shell / dome — slow, dim background layer. */
export function shellCloud(count: number, radius = 3.0): Float32Array {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const jitter = 0.9 + Math.random() * 0.2;
    out[i * 3] = Math.cos(theta) * rad * radius * jitter;
    out[i * 3 + 1] = y * radius * jitter;
    out[i * 3 + 2] = Math.sin(theta) * rad * radius * jitter;
  }
  return out;
}

/** Volumetric atmospheric dust filling a wide box around the core. */
export function dustCloud(count: number, size = 7.0): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    out[i * 3] = (Math.random() - 0.5) * size;
    out[i * 3 + 1] = (Math.random() - 0.5) * size * 0.7;
    out[i * 3 + 2] = (Math.random() - 0.5) * size;
  }
  return out;
}

/** Sparse foreground sparks near the camera. */
export function sparkCloud(count: number, radius = 2.6): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const rad = radius * (0.4 + Math.random() * 0.8);
    out[i * 3] = Math.cos(ang) * rad;
    out[i * 3 + 1] = (Math.random() - 0.5) * radius * 1.2;
    out[i * 3 + 2] = Math.sin(ang) * rad + 1.2; // biased toward camera
  }
  return out;
}

/**
 * imageCloud — sample a (same-origin) image into a centered point cloud.
 * Browser-only, async. Resolves null if the image can't be read.
 */
export function imageCloud(
  src: string,
  count: number,
  opts: { scale?: number; spreadZ?: number; threshold?: number } = {}
): Promise<Float32Array | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    const done = (val: Float32Array | null) => resolve(val);
    const guard = window.setTimeout(() => done(null), 2500);
    img.onload = () => {
      window.clearTimeout(guard);
      try {
        const W = 600;
        const H = Math.max(
          1,
          Math.round((img.height / img.width) * W) || 240
        );
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) return done(null);
        ctx.drawImage(img, 0, 0, W, H);
        const data = ctx.getImageData(0, 0, W, H).data;
        const pts: Vec3[] = [];
        const step = 3;
        const scale = opts.scale ?? 3.2 / W;
        const spreadZ = opts.spreadZ ?? 0.12;
        const threshold = opts.threshold ?? 130;
        for (let y = 0; y < H; y += step) {
          for (let x = 0; x < W; x += step) {
            if (data[(y * W + x) * 4 + 3] > threshold) {
              pts.push([
                (x - W / 2) * scale,
                -(y - H / 2) * scale,
                (Math.random() - 0.5) * spreadZ,
              ]);
            }
          }
        }
        if (pts.length === 0) return done(null);
        for (let i = pts.length - 1; i > 0; i--) {
          const j = (Math.random() * (i + 1)) | 0;
          [pts[i], pts[j]] = [pts[j], pts[i]];
        }
        done(flatten(pts, count));
      } catch {
        done(null);
      }
    };
    img.onerror = () => {
      window.clearTimeout(guard);
      done(null);
    };
    img.src = src;
  });
}
