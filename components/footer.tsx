import Link from "next/link"
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react"
import { CONTACTS, FOUNDING_YEAR, SITE_NAME, SOCIAL_LINKS } from "@/lib/site"

const socialIcons = {
  Facebook,
  Instagram,
  YouTube: Youtube,
} as const

const exploreLinks = [
  { name: "Squadre", href: "/squadre" },
  { name: "Calendario", href: "/calendario" },
  { name: "News", href: "/news" },
  { name: "Gallerie", href: "/gallery" },
  { name: "Chi Siamo", href: "/chi-siamo" },
  { name: "Sponsor", href: "/sponsor" },
  { name: "Contatti", href: "/contatti" },
]

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Cookie Policy", href: "/cookies" },
  { name: "Termini di servizio", href: "/termini" },
  { name: "Note legali", href: "/note-legali" },
  { name: "Accessibilità", href: "/accessibilita" },
  { name: "Area Riservata", href: "/admin" },
]

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <p className="font-ethnocentric text-2xl text-primary" aria-label={SITE_NAME}>
              VOLLEYBALL<br />SAN MARTINO
            </p>
            <p className="text-gray-400 leading-relaxed">
              Dal {FOUNDING_YEAR}, formiamo atleti e persone attraverso i valori dello sport.
              Passione, impegno e spirito di squadra sono il nostro DNA.
            </p>
            <ul className="flex gap-4" aria-label="Social network">
              {SOCIAL_LINKS.map((social) => {
                const Icon = socialIcons[social.name]
                return (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${social.name} (si apre in una nuova scheda)`}
                      className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-300"
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Quick Links */}
          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="font-bold text-lg mb-6">Esplora</h2>
            <ul className="space-y-4">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-primary transition-colors flex items-center group">
                    <span aria-hidden="true" className="w-0 group-hover:w-2 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Info */}
          <div>
            <h2 className="font-bold text-lg mb-6">Contatti</h2>
            <address className="not-italic">
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-400">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-1" aria-hidden="true" />
                  <a href={CONTACTS.mapsUrl} className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                    {CONTACTS.address.street},<br />
                    {CONTACTS.address.postalCode} {CONTACTS.address.city} ({CONTACTS.address.province})
                    <span className="sr-only"> (apre Google Maps in una nuova scheda)</span>
                  </a>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Phone className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                  <a href={`tel:${CONTACTS.phone}`} className="hover:text-white transition-colors">{CONTACTS.phoneLabel}</a>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Mail className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                  <a href={`mailto:${CONTACTS.email}`} className="hover:text-white transition-colors break-all">{CONTACTS.email}</a>
                </li>
              </ul>
            </address>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col lg:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-sm text-center lg:text-left">
            © {new Date().getFullYear()} {SITE_NAME}. Tutti i diritti riservati.
          </p>
          <nav aria-label="Link legali">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-gray-400">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
