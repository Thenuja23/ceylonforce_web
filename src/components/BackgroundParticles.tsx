import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

/**
 * BackgroundParticles
 * ───────────────────
 * A fixed, full-viewport canvas that renders a subtle ambient particle
 * system behind all page content. Particles drift slowly, pulse in
 * opacity, and occasionally connect with faint lines when close.
 *
 * Designed to be unobtrusive — low opacity, slow movement, dark palette.
 */

const PARTICLE_COUNT = 80
const CONNECTION_DIST = 140   // px — max distance for connecting lines
const MAX_SPEED       = 0.28
const LINE_ALPHA_MAX  = 0.07  // very faint connections

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
  dAlpha: number
}

function makeParticle(w: number, h: number): Particle {
  return {
    x:      Math.random() * w,
    y:      Math.random() * h,
    vx:     (Math.random() - 0.5) * MAX_SPEED * 2,
    vy:     (Math.random() - 0.5) * MAX_SPEED * 2,
    r:      Math.random() * 1.2 + 0.4,
    alpha:  Math.random() * 0.3 + 0.05,
    dAlpha: (Math.random() - 0.5) * 0.0015,
  }
}

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced   = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    let raf = 0
    let w = 0
    let h = 0
    let pts: Particle[] = []

    const resize = () => {
      w = window.innerWidth
      h = document.documentElement.scrollHeight
      canvas.width  = w
      canvas.height = h
      // rebuild particles mapped to new dims — keep existing ones but recount
      while (pts.length < PARTICLE_COUNT) pts.push(makeParticle(w, h))
      if (pts.length > PARTICLE_COUNT) pts = pts.slice(0, PARTICLE_COUNT)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(document.documentElement)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      ctx.clearRect(0, 0, w, h)

      // update
      for (const p of pts) {
        p.x += p.vx
        p.y += p.vy
        p.alpha += p.dAlpha
        if (p.alpha < 0.03) { p.alpha = 0.03; p.dAlpha = Math.abs(p.dAlpha) }
        if (p.alpha > 0.40) { p.alpha = 0.40; p.dAlpha = -Math.abs(p.dAlpha) }
        // wrap
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
      }

      // draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < CONNECTION_DIST) {
            const lineAlpha = LINE_ALPHA_MAX * (1 - d / CONNECTION_DIST)
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(160,170,210,${lineAlpha.toFixed(4)})`
            ctx.lineWidth   = 0.6
            ctx.stroke()
          }
        }
      }

      // draw dots
      for (const p of pts) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(170,180,220,${p.alpha.toFixed(4)})`
        ctx.fill()
      }
    }

    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reduced])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      className="bg-particles"
      aria-hidden="true"
    />
  )
}
