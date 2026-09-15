import { useEffect, useRef, useState } from 'react'
import { nav } from '../data/content'

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Animate menu open/close
  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return
    if (open) {
      menu.style.clipPath = 'inset(0 0 0 0)'
      menu.style.pointerEvents = 'auto'
    } else {
      menu.style.clipPath = 'inset(0 0 100% 0)'
      menu.style.pointerEvents = 'none'
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <header
        ref={navRef}
        className={`cf-nav ${scrolled ? 'cf-nav--scrolled' : ''}`}
        role="banner"
      >
        <div className="cf-nav__inner">
          {/* Brand */}
          <a href="#top" className="cf-nav__brand" aria-label="CeylonForce home" onClick={close}>
            <img src="/ceylonforce-logo.png" alt="CeylonForce" className="cf-nav__logo" />
          </a>

          {/* Desktop nav */}
          <nav className="cf-nav__links" aria-label="Main navigation">
            {nav.map((item) => (
              <a key={item.label} href={item.href} className="cf-nav__link">
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA + Hamburger */}
          <div className="cf-nav__actions">
            <a href="#contact" className="cf-nav__cta">
              LET'S TALK
            </a>
            <button
              className={`cf-nav__toggle ${open ? 'is-open' : ''}`}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="cf-nav__toggle-bar" />
              <span className="cf-nav__toggle-bar" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className="cf-mobile-menu"
        aria-hidden={!open}
        role="dialog"
        aria-label="Navigation menu"
      >
        <nav className="cf-mobile-menu__nav" aria-label="Mobile navigation">
          {nav.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className="cf-mobile-menu__item"
              style={{ transitionDelay: open ? `${i * 60 + 120}ms` : '0ms' }}
              onClick={close}
            >
              <span className="cf-mobile-menu__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="cf-mobile-menu__label">
                {item.label.replace(/^\d+ /, '')}
              </span>
            </a>
          ))}
          <a
            href="#contact"
            className="cf-mobile-menu__cta"
            onClick={close}
            style={{ transitionDelay: open ? `${nav.length * 60 + 120}ms` : '0ms' }}
          >
            LET'S TALK →
          </a>
        </nav>

        <div className="cf-mobile-menu__foot">
          <span>ceylonforce.holdings@gmail.com</span>
          <span>© 2026 CEYLONFORCE</span>
        </div>
      </div>
    </>
  )
}
