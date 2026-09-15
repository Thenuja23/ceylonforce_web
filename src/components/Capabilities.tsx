import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { services } from '../data/services'

gsap.registerPlugin(ScrollTrigger)

export default function Capabilities() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section || reduced) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cf-cap__heading',
        { yPercent: 50, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.cf-cap__heading', start: 'top 85%', once: true },
        },
      )

      gsap.fromTo(
        '.cf-service-row',
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.06,
          scrollTrigger: { trigger: '.cf-services-list', start: 'top 80%', once: true },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={sectionRef} id="capabilities" className="cf-cap">
      <div className="cf-cap__inner">

        <header className="cf-cap__header">
          <h2 className="cf-cap__heading">
            EIGHT<br />
            <em className="cf-serif">Capabilities.</em>
          </h2>
        </header>

        <ul className="cf-services-list" role="list" aria-label="Our services">
          {services.map((svc) => (
            <li key={svc.number} className="cf-service-row">
              <span className="cf-service-row__num">{svc.number}</span>
              <div className="cf-service-row__body">
                <h3 className="cf-service-row__title">
                  {svc.title.replace(/\n/g, ' ')}
                </h3>
                <p className="cf-service-row__desc">{svc.description}</p>
                <ul className="cf-service-row__caps" aria-label={`${svc.title} capabilities`}>
                  {svc.capabilities.map((cap) => (
                    <li key={cap}>{cap}</li>
                  ))}
                </ul>
              </div>
              <span className="cf-service-row__arrow" aria-hidden="true">↗</span>
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}
