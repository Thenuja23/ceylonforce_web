import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { process as processSteps } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

export default function ForceSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section || reduced) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cf-force__heading',
        { yPercent: 60, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.cf-force__heading', start: 'top 85%', once: true },
        },
      )

      gsap.fromTo(
        '.cf-force__body',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.cf-force__body', start: 'top 85%', once: true },
        },
      )

      gsap.fromTo(
        '.cf-force__statement-word',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.035,
          scrollTrigger: { trigger: '.cf-force__statement', start: 'top 82%', once: true },
        },
      )

      gsap.fromTo(
        '.cf-process__item',
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: { trigger: '.cf-process', start: 'top 82%', once: true },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [reduced])

  const statementWords = 'WE DON\'T JUST MAKE WEBSITES. WE BUILD DIGITAL SYSTEMS THAT HELP BUSINESSES GROW.'.split(' ')

  return (
    <section ref={sectionRef} id="about" className="cf-force">
      <div className="cf-force__inner">

        {/* Eyebrow removed */}

        {/* Main heading */}
        <div className="cf-force__heading-wrap">
          <h2 className="cf-force__heading">
            ONE SYSTEM.
          </h2>
        </div>

        {/* Body copy */}
        <p className="cf-force__body">
          CeylonForce combines software, design, automation and immersive technology to create digital experiences that help businesses operate better and sell more.
        </p>

        {/* Large statement */}
        <p className="cf-force__statement" aria-label="We don't just make websites. We build digital systems that help businesses grow.">
          {statementWords.map((word, i) => (
            <span key={i} className="cf-force__statement-word">
              {word}{' '}
            </span>
          ))}
        </p>

        {/* Process steps */}
        <div className="cf-process" aria-label="Our process">
          {processSteps.map((step) => (
            <div key={step.index} className="cf-process__item">
              <span className="cf-process__index">{step.index}</span>
              <div className="cf-process__content">
                <h3 className="cf-process__title">{step.title}</h3>
                <p className="cf-process__body">{step.body}</p>
              </div>
              <span className="cf-process__arrow" aria-hidden="true">↗</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
