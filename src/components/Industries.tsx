import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { industries } from '../data/industries'

gsap.registerPlugin(ScrollTrigger)

export default function Industries() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section || reduced) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cf-industries__heading',
        { yPercent: 60, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.cf-industries__heading', start: 'top 85%', once: true },
        },
      )

      gsap.fromTo(
        '.cf-industry-row',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.07,
          scrollTrigger: { trigger: '.cf-industries__list', start: 'top 80%', once: true },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [reduced])

  const toggleExpand = (i: number) => {
    setExpandedIndex((prev) => (prev === i ? null : i))
  }

  return (
    <section ref={sectionRef} id="industries" className="cf-industries">
      <div className="cf-industries__inner">

        <header className="cf-industries__header">
          <div className="cf-industries__heading-wrap">
            <h2 className="cf-industries__heading">
              07<br />
              <em className="cf-serif">Industries.</em>
            </h2>
          </div>
          <div className="cf-industries__header-aside">
            <p className="cf-industries__sub">
              CeylonForce operates across seven distinct industry verticals, delivering tailored digital systems for each.
            </p>
          </div>
        </header>

        <ul
          className={`cf-industries__list ${activeIndex !== null ? 'has-active' : ''}`}
          role="list"
        >
          {industries.map((ind, i) => (
            <li
              key={ind.index}
              className={`cf-industry-row ${activeIndex === i ? 'is-active' : ''} ${expandedIndex === i ? 'is-expanded' : ''}`}
              onMouseEnter={() => !reduced && setActiveIndex(i)}
              onMouseLeave={() => !reduced && setActiveIndex(null)}
            >
              <button
                className="cf-industry-row__trigger"
                aria-expanded={expandedIndex === i}
                onClick={() => toggleExpand(i)}
              >
                <span className="cf-industry-row__index">{ind.index}</span>
                <span className="cf-industry-row__name">{ind.name}</span>
                <span className="cf-industry-row__tag">{ind.description}</span>
                <span className="cf-industry-row__arrow" aria-hidden="true">
                  {expandedIndex === i ? '−' : '+'}
                </span>
              </button>

              {/* Expandable capabilities panel */}
              <div
                className="cf-industry-row__panel"
                aria-hidden={expandedIndex !== i}
              >
                <ul className="cf-industry-row__caps" role="list">
                  {ind.capabilities.map((cap) => (
                    <li key={cap} className="cf-industry-row__cap">{cap}</li>
                  ))}
                </ul>
                <a href="#contact" className="cf-industry-row__cta">
                  START A PROJECT →
                </a>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}
