import Link from "next/link"
import type { Metadata } from "next"
import { Home, Newspaper, Users } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Pagina non trovata",
  robots: { index: false, follow: true },
}

const suggestions = [
  { href: "/", label: "Home", icon: Home },
  { href: "/squadre", label: "Squadre", icon: Users },
  { href: "/news", label: "News", icon: Newspaper },
]

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation className="relative bg-black" />
      <main className="flex-1 flex items-center">
        <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <p className="font-ethnocentric text-7xl sm:text-9xl text-primary leading-none" aria-hidden="true">404</p>
          <h1 className="mt-6 text-3xl sm:text-4xl font-bold">Pagina non trovata</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            La pagina che cerchi non esiste o è stata spostata. Prova a ripartire da una di queste sezioni.
          </p>
          <ul className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
            {suggestions.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Button asChild variant={href === "/" ? "default" : "outline"} size="lg" className="w-full sm:w-auto rounded-full">
                  <Link href={href}>
                    <Icon aria-hidden="true" /> {label}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm text-muted-foreground">
            Pensi sia un errore?{" "}
            <Link href="/contatti" className="font-medium text-primary underline underline-offset-4">
              Contattaci
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
