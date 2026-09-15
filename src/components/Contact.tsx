import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { contact } from '../data/content'
import sriLankaFlag from '../assets/sri-lanka-waving-flag.webp'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section || reduced) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cf-contact__heading .cf-contact__line',
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: '.cf-contact__heading', start: 'top 80%', once: true },
        },
      )

      gsap.fromTo(
        '.cf-contact__links',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.cf-contact__links', start: 'top 85%', once: true },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={sectionRef} id="contact" className="cf-contact">
      <div className="cf-contact__inner">

        <h2 className="cf-contact__heading" aria-label="Let's build what's next">
          <span className="cf-contact__line-wrap">
            <span className="cf-contact__line">LET'S BUILD</span>
          </span>
          <span className="cf-contact__line-wrap cf-contact__line-wrap--indent">
            <span className="cf-contact__line cf-serif">what's next.</span>
          </span>
        </h2>

        <div className="cf-contact__links">
          <a
            href={contact.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="cf-contact__link cf-contact__link--primary"
            aria-label="Chat on WhatsApp"
          >
            <span className="cf-contact__link-label">WHATSAPP</span>
            <span className="cf-contact__link-value">{contact.whatsappDisplay}</span>
            <span className="cf-contact__link-arrow" aria-hidden="true">↗</span>
          </a>

          <a
            href={`mailto:${contact.email}`}
            className="cf-contact__link"
            aria-label="Send an email"
          >
            <span className="cf-contact__link-label">EMAIL</span>
            <span className="cf-contact__link-value">{contact.email}</span>
            <span className="cf-contact__link-arrow" aria-hidden="true">↗</span>
          </a>

          <a
            href={`tel:${contact.phone.replace(/\s/g, '')}`}
            className="cf-contact__link"
            aria-label="Call us"
          >
            <span className="cf-contact__link-label">PHONE</span>
            <span className="cf-contact__link-value">{contact.phone}</span>
            <span className="cf-contact__link-arrow" aria-hidden="true">↗</span>
          </a>
        </div>

        <p className="cf-contact__note">
          Based in Sri Lanka. Working globally.
        </p>
        <span className="cf-contact__flag" role="img" aria-label="Sri Lanka flag">
          <img src={sriLankaFlag} alt="Sri Lanka flag" className="cf-contact__flag-img" />
        </span>

      </div>
    </section>
  )
}
