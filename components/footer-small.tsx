import Link from "next/link"
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react"

export function FooterSmall() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrizione */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-ethnocentric text-xl text-volleyball-coral mb-4">VOLLEYBALL SAN MARTINO</h3>
            <p className="text-secondary-foreground mb-4 leading-relaxed">
              La società sportiva che promuove i valori del volleyball attraverso passione, impegno e spirito di
              squadra. Unisciti alla nostra famiglia!
            </p>
            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/VolleyBallSanMartino/" target="_blank" className="text-secondary-foreground hover:text-volleyball-coral transition-colors">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="https://www.instagram.com/volley_ball_san_martino/" target="_blank" className="text-secondary-foreground hover:text-volleyball-coral transition-colors">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="https://www.youtube.com/@volleyballsanmartino5064" target="_blank" className="text-secondary-foreground hover:text-volleyball-coral transition-colors">
                <Youtube className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Contatti */}
          <div>
            <h4 className="font-semibold text-volleyball-coral mb-4">Contatti</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+393534862102" className="underline underline-offset-3"><span className="">+39</span>3534862102</a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:vbsmcampionati@gmail.com" className="underline underline-offset-3">vbsmcampionati@gmail.com</a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <a href="https://maps.app.goo.gl/UgC7gkjFung7YARU6" target="_blank" className="underline underline-offset-3">Piazza V. Carnevali, 1<br />42018 San Martino In Rio RE</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-volleyball-coral/20 mt-8 pt-8 text-center text-sm text-secondary-foreground/80 md:text-md">
          <p>&copy; 2025 Volleyball San Martino. Tutti i diritti riservati. <br /> Sito realizzato da <a href="https://www.instagram.com/fabri.gaspa_/" className="text-volleyball-coral underline hover:text-primary underline-offset-3">Fabrizio Gasparini</a></p>
        </div>
      </div>
    </footer>
  )
}
