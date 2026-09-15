/**
 * ParticleHero — Scroll-driven logo particle morph
 * ─────────────────────────────────────────────────
 * Architecture:
 *   <ParticleHero>            tall scroll container (200vh)
 *     <ScrollController>      reads scroll progress → uniform
 *     <ParticleField>         Three.js WebGL canvas (sticky)
 *       <LogoParticleMorph>   GLSL particle system
 *
 * Scroll phases (uniform uPhase 0→1):
 *   0.00–0.25  abstract flowing terrain
 *   0.25–0.60  particles attracted toward logo
 *   0.60–0.85  logo crisp and formed
 *   0.85–1.00  logo dissolves, particles disperse
 */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════
   CONFIG — tweak here without touching shader code
═══════════════════════════════════════════════════════════ */
const CONFIG = {
  // Particle counts
  countDesktop: 18000,
  countTablet:  9000,
  countMobile:  4500,

  // Particle base size (px, before DPR)
  baseSizeMin:  1.2,
  baseSizeMax:  3.8,

  // FBM terrain
  noiseStrength:   0.52,  // overall wave height
  noiseSpeed:      0.14,  // idle morph speed
  noiseFrequency:  2.8,   // spatial frequency

  // Logo
  logoAttractionStr: 1.0, // multiplier for logo pull
  logoPadding:        0.1, // fraction of canvas width as padding each side

  // Mouse
  mouseRadius:     0.38,  // normalised screen radius of influence
  mouseStrength:   0.22,  // attraction strength
  mouseVortex:     0.18,  // swirl/tangential strength

  // Scroll
  scrollHeight:    '200vh', // outer section height
  phaseIn:         0.25,    // terrain → logo start
  phaseLogoFull:   0.62,    // logo fully formed
  phaseOut:        0.85,    // logo start dissolving

  // Colours (dark-on-dark: white bg, navy dots)
  bgColor:         0x000000,
  dotColorLow:     new THREE.Color(0.14, 0.16, 0.22),  // dim navy
  dotColorHigh:    new THREE.Color(0.88, 0.90, 0.95),  // near-white at crests
}

/* ═══════════════════════════════════════════════════════════
   VERTEX SHADER
═══════════════════════════════════════════════════════════ */
const VERT = /* glsl */`
precision highp float;

// ── per-particle attributes ──────────────────────────────
attribute vec3  aRestPos;    // rest grid position, XY in [-1,1], Z=0
attribute vec3  aLogoPos;    // logo target position, XY in [-1,1], Z=0
attribute float aSeed;       // unique random [0,1]

// ── uniforms ─────────────────────────────────────────────
uniform float uTime;         // seconds
uniform float uPhase;        // scroll phase 0→1
uniform vec2  uMouse;        // normalised [-1,1]
uniform vec2  uResolution;
uniform float uDPR;
uniform float uAspect;

// ── config uniforms (set from JS) ────────────────────────
uniform float uNoiseStr;
uniform float uNoiseFreq;
uniform float uMouseRadius;
uniform float uMouseStr;
uniform float uLogoStr;

varying float vBright;       // 0–1 brightness for frag
varying float vAlpha;

// ── FBM helpers ──────────────────────────────────────────
float hash2(vec2 p){
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash2(i),hash2(i+vec2(1,0)),f.x),
             mix(hash2(i+vec2(0,1)),hash2(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.0, a=0.5;
  mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){v+=a*vnoise(p);p=m*p;a*=0.48;}
  return v;
}

void main(){
  float t    = uTime;
  float phase = uPhase;

  // ── 1. TERRAIN position ───────────────────────────────
  vec2 uv   = aRestPos.xy * 0.5 + 0.5;            // [0,1]
  float nX  = fbm(uv * uNoiseFreq + vec2(t*0.11, t*0.07));
  float nY  = fbm(uv * uNoiseFreq * 1.3 - vec2(t*0.09, t*0.13) + 99.0);
  float nZ  = fbm(uv * uNoiseFreq * 0.8 + vec2(t*0.06, -t*0.08) + 42.0);

  vec3 terrain = aRestPos;
  terrain.x   += (nX - 0.5) * 0.06;
  terrain.y   += (nY - 0.5) * 0.06;
  terrain.z    = (nZ * 2.0 - 1.0) * uNoiseStr;

  float terrainBright = nZ;

  // ── 2. LOGO position ──────────────────────────────────
  vec3 logoPos = aLogoPos;
  // add slight per-particle jitter so logo has texture
  logoPos.x += (hash2(aRestPos.xy + 0.1) - 0.5) * 0.004;
  logoPos.y += (hash2(aRestPos.xy + 0.3) - 0.5) * 0.004;
  logoPos.z  = 0.0;

  // ── Random particle motion — active BEFORE logo forms ────
  // Particles wander freely during the terrain phase.
  // Motion fades away as t2 increases (logo locks in).
  float rFreq1 = 0.9  + aSeed * 2.4;
  float rFreq2 = 1.3  + aSeed * 1.8;
  float rPhase = aSeed * 6.28318;
  float rAmp   = 0.035 + aSeed * 0.045;   // clearly visible wandering

  // Two perpendicular oscillations at incommensurate frequencies = irregular path
  float wanderX = sin(uTime * rFreq1 + rPhase)                     * rAmp
                + sin(uTime * rFreq2 * 1.37 + rPhase * 2.1 + 0.7) * rAmp * 0.5;
  float wanderY = cos(uTime * rFreq1 * 0.79 + rPhase + 1.57)       * rAmp
                + cos(uTime * rFreq2 * 1.61 + rPhase * 1.4 + 2.3) * rAmp * 0.4;

  // ── 3. Phase blend ────────────────────────────────────
  // smoothstep ramps:
  float phaseIn    = 0.25;
  float phaseFull  = 0.62;
  float phaseOut   = 0.85;
  float phaseEnd   = 1.0;

  float attract = 0.0;
  if(phase < phaseIn){
    attract = 0.0;
  } else if(phase < phaseFull){
    attract = smoothstep(phaseIn, phaseFull, phase);
  } else if(phase < phaseOut){
    attract = 1.0;
  } else {
    attract = 1.0 - smoothstep(phaseOut, phaseEnd, phase);
  }
  attract *= uLogoStr;

  // Ease: cubic in+out feel via smoothstep chain
  float t2 = attract * attract * (3.0 - 2.0 * attract);

  vec3 pos = mix(terrain, logoPos, t2);

  // Wander applied to terrain particles only — fades as logo forms
  float preLogoMotion = 1.0 - t2;  // 1 = freely wandering, 0 = locked to logo
  pos.x += wanderX * preLogoMotion;
  pos.y += wanderY * preLogoMotion;

  // ── 4. MOUSE vortex (attraction + swirl) ─────────────
  // Convert to aspect-corrected space
  vec2 posAR   = pos.xy * vec2(uAspect, 1.0);
  vec2 mouseAR = uMouse * vec2(uAspect, 1.0);
  vec2 toMouse = mouseAR - posAR;
  float md     = length(toMouse);
  float mf     = 1.0 - smoothstep(0.0, uMouseRadius * 2.0, md);
  mf           = mf * mf;

  // Radial: pull toward mouse
  vec2 radial   = normalize(toMouse + vec2(0.0001)) * uMouseStr;

  // Tangential: perpendicular swirl (counter-clockwise)
  vec2 tangent  = vec2(-toMouse.y, toMouse.x);
  tangent       = normalize(tangent + vec2(0.0001)) * uMouseStr * 0.7;

  // Blend: close to cursor is more radial, far edge is more swirly
  float radialW  = smoothstep(uMouseRadius * 2.0, 0.0, md);
  vec2 force     = mix(tangent, radial, radialW * 0.6);

  // Logo particles resist more but still shimmer
  pos.xy += force * mf * (0.6 + (1.0 - t2) * 0.4);

  // ── 5. Disperse on scroll exit ────────────────────────
  if(phase > phaseOut){
    float ex = smoothstep(phaseOut, phaseEnd, phase);
    float seed = aSeed;
    pos.y += ex * (0.4 + seed * 0.6);       // fly upward
    pos.x += (seed - 0.5) * ex * 0.3;
    pos.z += ex * 0.3;
  }

  // ── 6. Clip-space output ─────────────────────────────
  // Orthographic: pos.xy already in [-1,1], Z for depth
  gl_Position = vec4(pos.xy / uAspect, pos.z * 0.1, 1.0);
  // Wait — need proper aspect. Let camera handle it.
  gl_Position = vec4(pos.x, pos.y * uAspect, pos.z * 0.08, 1.0);

  // ── 7. Point size ─────────────────────────────────────
  float depthFade = 1.0 - pos.z * 0.3;
  float logoBoost = t2 * 0.8;
  float sz = mix(1.2, 3.8, terrainBright) * depthFade + logoBoost;
  sz *= uDPR;
  sz  = clamp(sz, 0.5, 5.0);
  gl_PointSize = sz;

  // ── 8. Brightness / alpha ─────────────────────────────
  vBright = mix(terrainBright, 1.0, t2 * 0.7);
  vAlpha  = mix(0.5, 1.0, vBright) * depthFade;
  // fade out during disperse
  if(phase > phaseOut){
    vAlpha *= 1.0 - smoothstep(phaseOut, phaseEnd, phase);
  }
}
`

/* ═══════════════════════════════════════════════════════════
   FRAGMENT SHADER
═══════════════════════════════════════════════════════════ */
const FRAG = /* glsl */`
precision highp float;
varying float vBright;
varying float vAlpha;

void main(){
  vec2  uv  = gl_PointCoord - 0.5;
  float d   = length(uv) * 2.0;
  float dot = 1.0 - smoothstep(0.55, 1.0, d);
  if(dot < 0.01) discard;

  // navy → white based on brightness
  vec3 low  = vec3(0.14, 0.16, 0.24);
  vec3 high = vec3(0.86, 0.88, 0.94);
  vec3 col  = mix(low, high, vBright);

  gl_FragColor = vec4(col, dot * vAlpha);
}
`

/* ═══════════════════════════════════════════════════════════
   LOGO PIXEL SAMPLER
   Draws the logo onto an offscreen canvas and returns an
   array of [x, y] positions (normalised –1 to +1) for every
   dark pixel above a density threshold.
═══════════════════════════════════════════════════════════ */
function sampleLogoPositions(
  img: HTMLImageElement,
  targetCount: number,
  padding: number,
): Float32Array {
  // Render at a fixed resolution for consistent sampling
  const W = 512
  const H = Math.round(W * (img.naturalHeight / img.naturalWidth))

  const cv = document.createElement('canvas')
  cv.width  = W
  cv.height = H
  const cx  = cv.getContext('2d')!

  // White background so dark logo pixels stand out
  cx.fillStyle = '#fff'
  cx.fillRect(0, 0, W, H)
  cx.drawImage(img, 0, 0, W, H)

  const { data } = cx.getImageData(0, 0, W, H)

  // Collect pixel positions where the pixel is sufficiently dark
  const candidates: [number, number][] = []
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      const r = data[i] / 255
      const g = data[i + 1] / 255
      const b = data[i + 2] / 255
      const a = data[i + 3] / 255
      const lum = r * 0.299 + g * 0.587 + b * 0.114
      if (lum < 0.55 && a > 0.4) {
        candidates.push([x, y])
      }
    }
  }

  // Subsample or expand to exactly targetCount
  const out = new Float32Array(targetCount * 3)
  const padX = padding
  const padY = padding * (H / W)

  for (let i = 0; i < targetCount; i++) {
    let x: number, y: number
    if (candidates.length === 0) {
      // fallback: random scatter if logo has no dark pixels
      x = Math.random() * W
      y = Math.random() * H
    } else {
      const src = candidates[Math.floor((i / targetCount) * candidates.length)]
      x = src[0]
      y = src[1]
    }
    // normalise to [-1, 1] with padding
    const nx = (x / W) * (2 - padX * 2) - (1 - padX)
    const ny = -((y / H) * (2 - padY * 2) - (1 - padY))  // flip Y

    // Scale down and shift to right half of screen
    const scale   = 0.58   // bigger logo (was 0.42)
    const offsetX =  0.38  // shift right
    const offsetY =  0.05  // slight upward nudge

    out[i * 3]     = nx * scale + offsetX
    out[i * 3 + 1] = ny * scale + offsetY
    out[i * 3 + 2] = 0
  }

  return out
}

/* ═══════════════════════════════════════════════════════════
   HOOK — determines particle count by device
═══════════════════════════════════════════════════════════ */
function useParticleCount(): number {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1440
  if (w < 480)  return CONFIG.countMobile
  if (w < 1024) return CONFIG.countTablet
  return CONFIG.countDesktop
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ParticleHero() {
  const outerRef   = useRef<HTMLDivElement>(null)
  const stickyRef  = useRef<HTMLDivElement>(null)
  const mountRef   = useRef<HTMLDivElement>(null)
  const reduced    = useReducedMotion()
  const count      = useParticleCount()

  // Shared uniforms ref — mutated from scroll/mouse callbacks, read in RAF
  const phaseRef   = useRef(0)
  const mouseRef   = useRef(new THREE.Vector2(0, 0))
  const easedMouse = useRef(new THREE.Vector2(0, 0))

  const [logoReady, setLogoReady] = useState(false)
  const logoPosRef = useRef<Float32Array | null>(null)

  /* ── 1. Load logo and sample pixel positions ─────────── */
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      logoPosRef.current = sampleLogoPositions(img, count, CONFIG.logoPadding)
      setLogoReady(true)
    }
    img.onerror = () => {
      // Fallback: circle of points
      const arr = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2
        const r = 0.3 + (i % 7) / 7 * 0.25
        arr[i * 3]     = Math.cos(a) * r
        arr[i * 3 + 1] = Math.sin(a) * r
        arr[i * 3 + 2] = 0
      }
      logoPosRef.current = arr
      setLogoReady(true)
    }
    img.src = '/ceylonforce-logo.png'
  }, [count])

  /* ── 2. GSAP ScrollTrigger for phase ─────────────────── */
  useLayoutEffect(() => {
    const outer = outerRef.current
    if (!outer) return

    const st = ScrollTrigger.create({
      trigger: outer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      onUpdate: (self) => {
        phaseRef.current = self.progress
      },
    })

    return () => st.kill()
  }, [])

  /* ── 3. WebGL engine ─────────────────────────────────── */
  useEffect(() => {
    if (!logoReady || !mountRef.current) return

    const mount     = mountRef.current
    const logoPos   = logoPosRef.current!

    /* renderer */
    const renderer = new THREE.WebGLRenderer({
      alpha:            true,
      antialias:        false,
      powerPreference:  'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(mount.offsetWidth, mount.offsetHeight)
    mount.appendChild(renderer.domElement)

    /* scene — orthographic so world units = clip units */
    const scene    = new THREE.Scene()
    const aspect   = mount.offsetWidth / mount.offsetHeight
    const camera   = new THREE.OrthographicCamera(
      -aspect, aspect, 1, -1, 0.1, 10
    )
    camera.position.z = 1

    /* ── Build geometry ─────────────────────────────── */
    const restPositions = new Float32Array(count * 3)
    const seeds         = new Float32Array(count)

    // Sunflower/poisson-ish distribution for rest positions
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const r  = Math.sqrt((i + 0.5) / count)
      const th = i * goldenAngle
      restPositions[i * 3]     = Math.cos(th) * r * aspect
      restPositions[i * 3 + 1] = Math.sin(th) * r
      restPositions[i * 3 + 2] = 0
      seeds[i] = Math.random()
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geo.setAttribute('aRestPos', new THREE.BufferAttribute(restPositions, 3))
    geo.setAttribute('aLogoPos', new THREE.BufferAttribute(logoPos, 3))
    geo.setAttribute('aSeed',    new THREE.BufferAttribute(seeds, 1))

    /* ── Material ────────────────────────────────────── */
    const uniforms = {
      uTime:        { value: 0 },
      uPhase:       { value: 0 },
      uMouse:       { value: new THREE.Vector2(0, 0) },
      uResolution:  { value: new THREE.Vector2(mount.offsetWidth, mount.offsetHeight) },
      uDPR:         { value: renderer.getPixelRatio() },
      uAspect:      { value: aspect },
      uNoiseStr:    { value: CONFIG.noiseStrength },
      uNoiseFreq:   { value: CONFIG.noiseFrequency },
      uMouseRadius: { value: CONFIG.mouseRadius },
      uMouseStr:    { value: CONFIG.mouseStrength },
      uLogoStr:     { value: CONFIG.logoAttractionStr },
    }

    const mat = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent:    true,
      depthWrite:     false,
      blending:       THREE.NormalBlending,
    })

    const points = new THREE.Points(geo, mat)
    scene.add(points)

    /* ── Ambient floating particles ──────────────────── */
    // ~300 slow-drifting luminous dots spread across the entire canvas.
    // They use a simple time-based position shader — no logo morph.
    const AMB_COUNT = reduced ? 0 : (count < 9000 ? 120 : 280)

    const ambVert = /* glsl */`
      precision highp float;
      attribute float aSeedA;
      attribute float aSeedB;
      attribute float aSeedC;
      uniform float uTime;
      uniform float uAspect;
      uniform float uDPR;
      varying float vAlphaA;

      void main(){
        // Each particle drifts on its own Lissajous-like path
        float spd = 0.18 + aSeedA * 0.28;
        float ox  = (aSeedA * 2.0 - 1.0) * uAspect;
        float oy  = aSeedB * 2.0 - 1.0;
        float rx  = 0.06 + aSeedC * 0.18;
        float ry  = 0.04 + aSeedA * 0.14;
        float px  = ox + sin(uTime * spd + aSeedB * 6.28) * rx;
        float py  = oy + cos(uTime * spd * 0.7 + aSeedC * 6.28) * ry;
        // slow vertical drift
        float drift = mod(uTime * (0.04 + aSeedA * 0.03) + aSeedB, 2.0) - 1.0;
        py += drift * 0.5;

        gl_Position  = vec4(px / uAspect, py, 0.0, 1.0);
        float sz     = (1.2 + aSeedC * 2.2) * uDPR;
        gl_PointSize = clamp(sz, 0.8, 4.0);
        vAlphaA      = 0.15 + aSeedB * 0.5;
      }
    `
    const ambFrag = /* glsl */`
      precision highp float;
      varying float vAlphaA;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv) * 2.0;
        float c = 1.0 - smoothstep(0.4, 1.0, d);
        if(c < 0.01) discard;
        gl_FragColor = vec4(0.82, 0.86, 0.95, c * vAlphaA);
      }
    `

    const ambUniforms = {
      uTime:   { value: 0 },
      uAspect: { value: aspect },
      uDPR:    { value: renderer.getPixelRatio() },
    }

    const ambGeo = new THREE.BufferGeometry()
    const aPos   = new Float32Array(AMB_COUNT * 3)
    const aSA    = new Float32Array(AMB_COUNT)
    const aSB    = new Float32Array(AMB_COUNT)
    const aSC    = new Float32Array(AMB_COUNT)

    for (let i = 0; i < AMB_COUNT; i++) {
      aSA[i] = Math.random()
      aSB[i] = Math.random()
      aSC[i] = Math.random()
    }

    ambGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3))
    ambGeo.setAttribute('aSeedA',   new THREE.BufferAttribute(aSA, 1))
    ambGeo.setAttribute('aSeedB',   new THREE.BufferAttribute(aSB, 1))
    ambGeo.setAttribute('aSeedC',   new THREE.BufferAttribute(aSC, 1))

    const ambMat = new THREE.ShaderMaterial({
      vertexShader:   ambVert,
      fragmentShader: ambFrag,
      uniforms:       ambUniforms,
      transparent:    true,
      depthWrite:     false,
      blending:       THREE.AdditiveBlending,
    })

    const ambPoints = new THREE.Points(ambGeo, ambMat)
    if (AMB_COUNT > 0) scene.add(ambPoints)

    /* ── Resize ──────────────────────────────────────── */
    const resize = () => {
      const w = mount.offsetWidth
      const h = mount.offsetHeight
      const a = w / h
      renderer.setSize(w, h)
      uniforms.uResolution.value.set(w, h)
      uniforms.uAspect.value = a
      ambUniforms.uAspect.value = a
      camera.left   = -a
      camera.right  =  a
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    /* ── Mouse ───────────────────────────────────────── */
    const onMove = (e: MouseEvent) => {
      const r = mount.getBoundingClientRect()
      mouseRef.current.x =  ((e.clientX - r.left) / r.width)  * 2 - 1
      mouseRef.current.y = -((e.clientY - r.top)  / r.height) * 2 + 1
    }
    const onTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return
      const r = mount.getBoundingClientRect()
      mouseRef.current.x =  ((e.touches[0].clientX - r.left) / r.width)  * 2 - 1
      mouseRef.current.y = -((e.touches[0].clientY - r.top)  / r.height) * 2 + 1
    }
    window.addEventListener('mousemove', onMove,  { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })

    /* ── Render loop ─────────────────────────────────── */
    let raf = 0
    const clock = new THREE.Clock()

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const t  = clock.getElapsedTime() * CONFIG.noiseSpeed

      // spring-ease mouse — snappier for vortex feel
      const lf = 0.10
      easedMouse.current.x += (mouseRef.current.x - easedMouse.current.x) * lf
      easedMouse.current.y += (mouseRef.current.y - easedMouse.current.y) * lf

      uniforms.uTime.value  = t
      uniforms.uPhase.value = phaseRef.current
      uniforms.uMouse.value.copy(easedMouse.current)

      // Ambient layer time (raw elapsed, not scaled)
      ambUniforms.uTime.value   = clock.getElapsedTime()
      ambUniforms.uAspect.value = uniforms.uAspect.value

      // Subtle camera drift from mouse (restrained)
      camera.position.x += (-easedMouse.current.x * 0.02 - camera.position.x) * 0.02
      camera.position.y += ( easedMouse.current.y * 0.01 - camera.position.y) * 0.02

      renderer.render(scene, camera)
    }

    if (reduced) {
      uniforms.uTime.value  = 0.5
      uniforms.uPhase.value = 0
      renderer.render(scene, camera)
    } else {
      tick()
    }

    /* ── Cleanup ─────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouch)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      ambGeo.dispose()
      ambMat.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [logoReady, count, reduced])

  /* ── Render ──────────────────────────────────────────── */
  return (
    <section
      ref={outerRef}
      id="top"
      className="ph-outer"
      aria-label="CeylonForce hero"
    >
      {/* Sticky viewport */}
      <div ref={stickyRef} className="ph-sticky">

        {/* WebGL canvas mount */}
        <div ref={mountRef} className="ph-canvas" aria-hidden="true" />

        {/* UI overlay — sits above the canvas */}
        <div className="ph-ui">
          <div className="ph-ui__inner">
            <h1 className="ph-title" aria-label="CeylonForce Holdings">
              <span className="ph-title__line ph-title__line--1">CEYLON</span>
              <span className="ph-title__line ph-title__line--2">FORCE</span>
              <span className="ph-title__line ph-title__line--3 ph-serif">Holdings</span>
            </h1>

            <p className="ph-sub">
              Technology that moves<br />businesses forward.
            </p>

            <div className="ph-actions">
              <a href="#contact" className="cf-btn cf-btn--primary">
                START A PROJECT
              </a>
              <a href="#about" className="cf-btn cf-btn--ghost">
                EXPLORE
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="ph-scroll-hint" aria-hidden="true">
            <div className="ph-scroll-hint__line" />
            <span>SCROLL</span>
          </div>

        </div>
      </div>
    </section>
  )
}
