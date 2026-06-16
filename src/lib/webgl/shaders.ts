/**
 * GLSL for the Kyro particle engine (v2 — signature identity).
 *
 * Vertex: morphs each particle between two point clouds (`position` = A,
 * `aTarget` = B) by `uProgress`, then layers fbm-curl turbulence, floating,
 * rotation, cursor repulsion and scroll dispersion. It also computes a fresnel
 * rim term (silhouette glow), a morph-velocity "energy" term (heat + size swell
 * = motion-blur feel) and an animated gradient mix.
 *
 * Fragment: soft additive glow disc with hot core, rim light, energy heat and a
 * navy→yellow→white dynamic gradient.
 *
 * Plain template strings — no GLSL loader needed in Next + Turbopack.
 */

const NOISE = /* glsl */ `
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

vec3 snoiseVec3(vec3 x){
  float s  = snoise(x);
  float s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
  float s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
  return vec3(s, s1, s2);
}

vec3 curlNoise(vec3 p){
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  vec3 p_x0 = snoiseVec3(p - dx); vec3 p_x1 = snoiseVec3(p + dx);
  vec3 p_y0 = snoiseVec3(p - dy); vec3 p_y1 = snoiseVec3(p + dy);
  vec3 p_z0 = snoiseVec3(p - dz); vec3 p_z1 = snoiseVec3(p + dz);
  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
  const float divisor = 1.0 / (2.0 * e);
  return normalize(vec3(x, y, z) * divisor);
}

// 2-octave fractal curl for richer, more organic turbulence.
vec3 fbmCurl(vec3 p, float t){
  vec3 c = curlNoise(p + t * 0.05);
  c += 0.5 * curlNoise(p * 2.1 - t * 0.08);
  return c / 1.5;
}
`;

export const PARTICLE_VERT = /* glsl */ `
precision highp float;

attribute vec3 aTarget;
attribute float aRandom;

uniform float uTime;
uniform float uProgress;
uniform float uSize;
uniform float uScroll;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uMouseStrength;
uniform float uMouseRadius;
uniform float uDpr;
uniform float uAlphaMul;
uniform float uEnergyBoost;
uniform float uSpin;
uniform vec3  uMouse;
uniform vec3  uLightDir;

varying float vMix;
varying float vAlpha;
varying float vLight;
varying float vRim;
varying float vEnergy;

${NOISE}

mat3 rotY(float a){
  float c = cos(a); float s = sin(a);
  return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
}

void main(){
  float prog = smoothstep(0.0, 1.0, uProgress);
  vec3 base = mix(position, aTarget, prog);

  // morph-velocity "energy": peaks mid-transition → heat, swell, brightness
  float energy = length(aTarget - position) * (1.0 - abs(2.0 * prog - 1.0));
  vEnergy = clamp(energy * uEnergyBoost, 0.0, 1.5);

  // organic fbm-curl turbulence
  vec3 curl = fbmCurl(base * uNoiseFreq, uTime);
  base += curl * uNoiseAmp * (0.6 + 0.6 * aRandom);

  // gentle floating
  base.y += sin(uTime * 0.6 + aRandom * 6.2831) * 0.06;

  // slow auto rotation + scroll twist
  base = rotY(uTime * uSpin + uScroll * 1.2) * base;

  // cursor repulsion
  vec3 toM = base - uMouse;
  float d = length(toM);
  float infl = smoothstep(uMouseRadius, 0.0, d);
  base += normalize(toM + 0.0001) * infl * uMouseStrength;

  // scroll dispersion (bloom outward as the hero leaves)
  base *= (1.0 + uScroll * 0.5);

  vec4 worldPos = modelMatrix * vec4(base, 1.0);
  vec4 mv = modelViewMatrix * vec4(base, 1.0);

  // fresnel rim → silhouette glow gives the cloud a volumetric edge
  vec3 nrm = normalize(base + 0.0001);
  vec3 viewDir = normalize(cameraPosition - worldPos.xyz);
  vRim = pow(1.0 - clamp(dot(viewDir, nrm), 0.0, 1.0), 2.0);

  // pseudo dynamic lighting from a moving key light
  vLight = clamp(dot(nrm, normalize(uLightDir)) * 0.5 + 0.5, 0.0, 1.0);

  // animated dynamic gradient (depth + noise + slow time drift)
  vMix = clamp(0.5 + base.y * 0.22 + curl.x * 0.25 + sin(uTime * 0.2) * 0.08, 0.0, 1.0);
  vAlpha = (1.0 - uScroll) * (0.45 + 0.55 * aRandom) * uAlphaMul;

  // size: depth attenuation + energy swell (motion-blur feel)
  float sz = uSize * (0.4 + aRandom) * (1.0 + vEnergy * 1.6);
  gl_PointSize = sz * uDpr * (8.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

export const PARTICLE_FRAG = /* glsl */ `
precision highp float;

uniform vec3 uColorA;   // deep navy
uniform vec3 uColorB;   // brand yellow
uniform vec3 uColorC;   // hot highlight

varying float vMix;
varying float vAlpha;
varying float vLight;
varying float vRim;
varying float vEnergy;

void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  if (dist > 0.5) discard;

  float soft = smoothstep(0.5, 0.0, dist);
  float core = smoothstep(0.16, 0.0, dist);

  vec3 col = mix(uColorA, uColorB, vMix);
  col *= 0.6 + 0.6 * vLight;        // dynamic lighting
  col += uColorB * vRim * 0.8;      // rim / silhouette glow
  col += uColorC * core * 0.9;      // hot glowing core
  col += uColorC * vEnergy * 0.7;   // morph energy heat

  float alpha = soft * vAlpha * (0.85 + vRim * 0.6);
  gl_FragColor = vec4(col, alpha);
}
`;
