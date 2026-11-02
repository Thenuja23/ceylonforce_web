import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const team = [
  {
    name: 'Thenuja Vilothmin Ganganath',
    role: 'Chief Executive Officer',
    image: '/thenuja.png',
    description:
      'Sets the company vision and strategic direction, leading client partnerships and ensuring every digital system delivers measurable business growth.',
  },
  {
    name: 'Kaveesha Thejan Disanayaka',
    role: 'Chief Operating Officer',
    image: '/kaveesha.png',
    description:
      'Oversees day-to-day operations, delivery workflows and cross-functional teams to keep every engagement seamless, on schedule and built to standard.',
  },
  {
    name: 'Chamith Shaminda De Silva',
    role: 'Chief Technology Officer',
    image: '/chamith.png',
    description:
      'Directs technical architecture and engineering execution across custom software, AI automation and immersive web experiences.',
  },
]

export default function Leadership() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section || reduced) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cf-lead__heading',
        { yPercent: 50, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.cf-lead__heading', start: 'top 85%', once: true },
        },
      )

      gsap.fromTo(
        '.cf-lead__card',
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: { trigger: '.cf-lead__grid', start: 'top 82%', once: true },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={sectionRef} id="leadership" className="cf-lead">
      <div className="cf-lead__inner">
        <header className="cf-lead__header">
          <h2 className="cf-lead__heading">
            LEADER<em className="cf-serif">ship.</em>
          </h2>
        </header>

        <ul className="cf-lead__grid" role="list" aria-label="Leadership team">
          {team.map((m) => (
            <li key={m.name} className="cf-lead__card">
              <div className="cf-lead__photo">
                <img src={m.image} alt={m.name} loading="lazy" />
              </div>
              <h3 className="cf-lead__name">{m.name}</h3>
              <p className="cf-lead__role">{m.role}</p>
              <p className="cf-lead__desc">{m.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
