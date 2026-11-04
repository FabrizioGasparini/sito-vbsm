import Link from "next/link"
import { ArrowRight, BadgeCheck, Newspaper, ShieldCheck, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const adminCards = [
  {
    title: "Iscrizioni 24H",
    description: "Controlla le richieste del torneo, i bonifici e lo stato delle iscrizioni.",
    href: "/admin/torneo-24h",
    label: "Gestisci iscrizioni 24H",
    icon: BadgeCheck,
    bullets: ["Vedi le squadre in attesa", "Apri il bonifico allegato", "Controlla referente e giocatori"],
  },
  {
    title: "Gestione News",
    description: "Aggiungi, modifica ed elimina le notizie pubblicate sul sito.",
    href: "/admin/news",
    label: "Gestisci news",
    icon: Newspaper,
    bullets: ["Aggiungi nuove notizie", "Modifica articoli esistenti", "Elimina contenuti obsoleti"],
  },
  {
    title: "Gestione Giocatori",
    description: "Aggiorna i roster delle squadre e gestisci i dati dei giocatori.",
    href: "/admin/players",
    label: "Gestisci giocatori",
    icon: UsersRound,
    bullets: ["Aggiungi nuovi giocatori", "Aggiorna giocatori esistenti", "Gestisci ruoli e capitani"],
  },
]

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(225,29,72,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.16),transparent_30%),linear-gradient(180deg,#070a10_0%,#03060b_100%)]" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-200">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Area Admin
              </div>
              <h1 className="font-ethnocentric text-3xl uppercase sm:text-4xl lg:text-5xl">Admin Panel</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                Gestisci contenuti, iscrizioni e squadre con gli stessi ritmi visivi del resto del sito.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-slate-300">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Accesso rapido</p>
              <p className="mt-1 font-semibold text-white">Tutto il back office in un unico punto</p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {adminCards.map((card) => {
            const Icon = card.icon

            return (
              <Card key={card.title} className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">{card.title}</CardTitle>
                    <CardDescription className="mt-2 text-sm text-slate-300">{card.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full rounded-full bg-linear-to-r from-primary to-primary/80 px-6 py-5 text-white hover:opacity-95" asChild>
                    <Link href={card.href}>
                      {card.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                    {card.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
