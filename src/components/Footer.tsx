import { brand, contact, nav } from '../data/content'

export default function Footer() {
  return (
    <footer className="cf-footer" id="footer">
      <div className="cf-footer__inner">

        <div className="cf-footer__top">
          <div className="cf-footer__brand">
            <a href="#top" className="cf-footer__wordmark" aria-label="CeylonForce home">
              <img src="/ceylonforce-logo.png" alt="CeylonForce" className="cf-footer__logo" />
            </a>
          </div>

          <nav className="cf-footer__nav" aria-label="Footer navigation">
            {nav.map((item) => (
              <a key={item.label} href={item.href} className="cf-footer__nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="cf-footer__contact">
            <a href={`mailto:${contact.email}`} className="cf-footer__contact-link">
              {contact.email}
            </a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="cf-footer__contact-link">
              {contact.whatsappDisplay} (WhatsApp)
            </a>
            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="cf-footer__contact-link">
              {contact.phone}
            </a>
            <div className="cf-footer__socials">
              <a href={contact.instagram} target="_blank" rel="noreferrer" className="cf-footer__social">
                INSTAGRAM ↗
              </a>
              <a href={contact.tiktok} target="_blank" rel="noreferrer" className="cf-footer__social">
                TIKTOK ↗
              </a>
            </div>
          </div>
        </div>

        <div className="cf-footer__bottom">
          <span>{brand.copyright}</span>
          <span>{brand.company}</span>
        </div>

      </div>
    </footer>
  )
}
