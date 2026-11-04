import Link from "next/link"
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <h3 className="font-ethnocentric text-2xl text-primary">VOLLEYBALL<br />SAN MARTINO</h3>
            <p className="text-gray-400 leading-relaxed">
              Dal 1984, formiamo atleti e persone attraverso i valori dello sport.
              Passione, impegno e spirito di squadra sono il nostro DNA.
            </p>
            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/VolleyBallSanMartino/" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://www.instagram.com/volley_ball_san_martino/" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://www.youtube.com/@volleyballsanmartino5064" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Esplora</h4>
            <ul className="space-y-4">
              {[
                { name: "Squadre", href: "/squadre" },
                { name: "Calendario", href: "/calendario" },
                { name: "News", href: "/news" },
                { name: "Gallerie", href: "/gallery" },
                { name: "Chi Siamo", href: "/chi-siamo" },
                { name: "Contatti", href: "/contatti" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-primary transition-colors flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6">Contatti</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-1" />
                <a href="https://maps.app.goo.gl/2REvMGqEKRLT2x9Z6" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Piazza V. Carnevali,<br />42018 San Martino in Rio (RE)</a>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href="tel:+393534862102" className="hover:text-white transition-colors">+39 353 486 2102</a>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href="mailto:info@volleyballsanmartino.it" className="hover:text-white transition-colors">info@volleyballsanmartino.it</a>
              </li>
            </ul>
          </div>

          {/* Newsletter (Visual Only) */}
          {/*<div>
            <h4 className="font-bold text-lg mb-6">Newsletter</h4>
            <p className="text-gray-400 mb-4">Iscriviti per ricevere aggiornamenti sulle partite e gli eventi.</p>
            <div className="space-y-3">
              <Input 
                type="email" 
                placeholder="La tua email" 
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary"
              />
              <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                Iscriviti <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>*/}
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Volleyball San Martino. Tutti i diritti riservati.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            <Link href="/termini" className="hover:text-white transition-colors">Termini di servizio</Link>
            <Link href="/note-legali" className="hover:text-white transition-colors">Note legali</Link>
            <Link href="/accessibilita" className="hover:text-white transition-colors">Accessibilita</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Area Riservata</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
