import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import { useReducedMotion } from '../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const LogoScene = lazy(() => import('./LogoScene'))

const INDUSTRY_NAMES = [
  'TECHNOLOGY',
  'REAL ESTATE',
  'AUTOMOBILE',
  'DIGITAL ASSETS',
  'MEDIA & CREATIVE',
  'ELECTRONICS',
  'RETAIL',
]

type LogoExperienceProps = {
  scrollReady?: boolean
}

export default function LogoExperience({ scrollReady = true }: LogoExperienceProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const targetRotation = useRef(new THREE.Euler(0.06, -0.12, 0))
  const scrollProgress = useRef(0)
  const industryIdxRef = useRef(0)
  const [isHovered, setIsHovered] = useState(false)
  // 0-based index — displays as "01 / 07" through "07 / 07"
  const [industryIdx, setIndustryIdx] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    const heading = headingRef.current
    if (!section || !scrollReady) return

    const triggers: ScrollTrigger[] = []

    // Heading reveal — use the section as trigger (heading sits inside sticky layout)
    if (heading && !reduced) {
      gsap.set(heading, { yPercent: 50, opacity: 0 })
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(heading, {
            yPercent: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
          })
        },
      })
      triggers.push(st)
    }

    if (reduced) {
      ScrollTrigger.refresh()
      return () => triggers.forEach((t) => t.kill())
    }

    // Scroll-driven logo motion — the outer section is the scroll container
    const st2 = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const p = self.progress
        scrollProgress.current = p
        targetRotation.current.set(
          0.04 + p * 0.14,
          -0.12 + p * Math.PI * 0.55,
          Math.sin(p * Math.PI * 2) * 0.025,
        )
        section.style.setProperty('--logo-progress', `${p}`)

        const nextIdx = Math.min(6, Math.floor(p * 7))
        if (nextIdx !== industryIdxRef.current) {
          industryIdxRef.current = nextIdx
          setIndustryIdx(nextIdx)
        }
      },
    })
    triggers.push(st2)

    ScrollTrigger.refresh()

    return () => triggers.forEach((t) => t.kill())
  }, [reduced, scrollReady])

  return (
    <section ref={sectionRef} className="cf-logo-exp" aria-label="CeylonForce system">
      <div className="cf-logo-exp__inner">

        {/* Top bar */}
        <div className="cf-logo-exp__topbar">
          <span className="cf-eyebrow">CEYLONFORCE ◯ SEVEN INDUSTRIES ONE FORCE</span>
          <span className="cf-eyebrow cf-logo-exp__counter" aria-live="polite">
            {String(industryIdx + 1).padStart(2, '0')} / 07
          </span>
        </div>

        {/* 3D canvas — fills remaining height */}
        <div
          className="cf-logo-exp__canvas-wrap"
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          data-cursor="explore"
          aria-hidden="true"
        >
          <div className="cf-logo-exp__fallback" />
          <Suspense fallback={<div className="cf-logo-exp__loading" />}>
            <LogoScene
              targetRotation={targetRotation}
              scrollProgress={scrollProgress}
              isHovered={isHovered}
              reducedMotion={reduced}
            />
          </Suspense>
        </div>

        {/* Bottom — heading + industry list */}
        <div className="cf-logo-exp__bottom">
          <div className="cf-logo-exp__heading-wrap">
            <h2 ref={headingRef} className="cf-logo-exp__heading">
              THE FORCE<br />
              <em className="cf-serif">In Motion.</em>
            </h2>
          </div>

          <ul className="cf-logo-exp__industries" aria-label="Active industry">
            {INDUSTRY_NAMES.map((name, i) => (
              <li
                key={name}
                className={`cf-logo-exp__industry ${i === industryIdx ? 'is-active' : ''}`}
              >
                {name}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  )
}
