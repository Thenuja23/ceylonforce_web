import { useEffect, useRef } from 'react'
import gsap from 'gsap'

type LoaderProps = {
  onComplete: () => void
  reducedMotion: boolean
}

/* ── tiny particle system drawn on a 2D canvas ── */
function startParticles(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!
  let raf = 0

  const resize = () => {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const COUNT = 90
  type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; da: number }

  const pts: P[] = Array.from({ length: COUNT }, () => ({
    x:  Math.random() * canvas.width,
    y:  Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r:  Math.random() * 1.4 + 0.4,
    a:  Math.random() * 0.45 + 0.05,
    da: (Math.random() - 0.5) * 0.003,
  }))

  const tick = () => {
    raf = requestAnimationFrame(tick)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of pts) {
      p.x  += p.vx
      p.y  += p.vy
      p.a  += p.da
      if (p.a < 0.04) p.da =  Math.abs(p.da)
      if (p.a > 0.55) p.da = -Math.abs(p.da)
      // wrap edges
      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width)  p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(180,190,220,${p.a.toFixed(3)})`
      ctx.fill()
    }
  }

  tick()
  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
  }
}

export default function Loader({ onComplete, reducedMotion }: LoaderProps) {
  const rootRef   = useRef<HTMLDivElement>(null)
  const logoRef   = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* ── particle canvas ── */
  useEffect(() => {
    if (reducedMotion || !canvasRef.current) return
    return startParticles(canvasRef.current)
  }, [reducedMotion])

  /* ── reveal animation ── */
  useEffect(() => {
    const root = rootRef.current
    const logo = logoRef.current
    if (!root || !logo) return

    logo.style.clipPath = 'inset(0 100% 0 0)'

    if (reducedMotion) {
      logo.style.clipPath = 'inset(0 0% 0 0)'
      setTimeout(onComplete, 300)
      return
    }

    const obj = { val: 0 }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(root, {
          yPercent: -105,
          duration: 0.9,
          ease: 'power3.inOut',
          onComplete,
        })
      },
    })

    tl.to(obj, {
      val: 100,
      duration: 2.2,
      ease: 'none',
      onUpdate() {
        const pct = obj.val
        logo.style.clipPath = `inset(0 ${(100 - pct).toFixed(3)}% 0 0)`
      },
    })

    tl.to({}, { duration: 0.4 })

    return () => { tl.kill() }
  }, [onComplete, reducedMotion])

  return (
    <div ref={rootRef} className="cf-loader" aria-live="polite" aria-label="Loading CeylonForce">

      {/* particle field */}
      <canvas ref={canvasRef} className="cf-loader__particles" aria-hidden="true" />

      {/* radial glow behind logo */}
      <div className="cf-loader__glow" aria-hidden="true" />

      <div className="cf-loader__inner">
        <div className="cf-loader__logo-wrap">
          <img
            src="/ceylonforce-logo.png"
            alt=""
            className="cf-loader__logo cf-loader__logo--ghost"
            aria-hidden="true"
          />
          <img
            ref={logoRef}
            src="/ceylonforce-logo.png"
            alt="CeylonForce"
            className="cf-loader__logo cf-loader__logo--reveal"
          />
        </div>
      </div>

    </div>
  )
}
