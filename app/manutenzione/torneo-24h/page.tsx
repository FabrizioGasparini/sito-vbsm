import Link from "next/link"
import { ChevronRight, LockKeyhole } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function Torneo24hMaintenancePage() {
  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <Navigation />

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(225,29,72,0.14),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.10),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(234,179,8,0.08),transparent_30%),linear-gradient(180deg,#070a10_0%,#03060b_100%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-300 backdrop-blur-sm">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Iscrizioni ancora chiuse
            </div>

            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">24 H</p>
              <h1 className="font-ethnocentric text-4xl uppercase leading-tight sm:text-5xl lg:text-7xl">
                Iscrizioni <span className="text-primary">chiuse</span>
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Le pagine del torneo 24H sono momentaneamente chiuse. Ti invitiamo a tornare più tardi per completare la tua iscrizione.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full bg-primary px-6 py-5 text-white hover:bg-primary/90">
                <Link href="/">
                  Torna alla home <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/5 px-6 py-5 text-white hover:bg-white/10 hover:text-white">
                <a href="mailto:vbsmcampionati@gmail.com">Contattaci</a>
              </Button>
            </div>

        </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
