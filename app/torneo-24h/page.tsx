"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  Mail,
  Music2,
  Phone,
  Sparkles,
  Volleyball,
  Waves,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  getTorneo24hDisciplina,
  torneo24hEventInfo,
  type Torneo24hDisciplina,
} from "@/lib/torneo-24h"

const sportCards: Array<{
  discipline: Torneo24hDisciplina
  icon: typeof Volleyball
  title: string
  subtitle: string
}> = [
  {
    discipline: "beach",
    icon: Volleyball,
    title: "Beach Volley",
    subtitle: "3x3, formula rapida e 5 slot disponibili.",
  },
  {
    discipline: "splash",
    icon: Waves,
    title: "Splash Volley",
    subtitle: "6 contro 6, ritmo alto e 10 slot disponibili.",
  },
]

export default function Torneo24hPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventConfig = torneo24hEventInfo
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  useEffect(() => {
    const isSuccess = searchParams.get("success") === "1"

    if (!isSuccess) {
      setShowSuccessPopup(false)
      return
    }

    setShowSuccessPopup(true)
    const timer = window.setTimeout(() => {
      router.replace("/torneo-24h")
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <Navigation />

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(225,29,72,0.14),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.10),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(234,179,8,0.08),transparent_30%),linear-gradient(180deg,#070a10_0%,#03060b_100%)]" />

      {showSuccessPopup && (
        <div className="fixed inset-x-0 top-20 z-50 mx-auto w-[min(92vw,36rem)] px-4">
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-emerald-100 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl"
          >
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              <div>
                <p className="font-semibold">Iscrizione inviata con successo</p>
                <p className="mt-1 text-sm text-emerald-50/90">
                  La tua squadra è stata registrata. Verificheremo il bonifico e ti contatteremo via email.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <section className="relative overflow-hidden pt-24 pb-14 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%),radial-gradient(circle_at_top_right,rgba(225,29,72,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_35%)]" />
            <div className="relative grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-14">
              <div className="space-y-6">
                <Badge className="w-fit border border-white/10 bg-white/10 px-4 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-200">
                  Volleyball San Martino
                </Badge>
                <div className="space-y-4">
                  <h1 className="font-ethnocentric text-5xl uppercase leading-none sm:text-7xl lg:text-8xl">
                    TORNEO <span className="text-primary">24H</span>
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                    Piazza V. Carnevali, 1 - 42018 San Martino in Rio (RE) <br />
                  </p>
                  <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                    Una sola voce in menu, tre porte di accesso all&apos;evento: informazioni generali, Splash Volley e Beach Volley.
                    Tutto quello che serve per iscriversi e vivere il weekend.
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-16" id="discipline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="group relative overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-primary/25 via-white/10 to-transparent p-6 text-left shadow-2xl shadow-primary/10 transition-transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_32%)] opacity-70" />
                  <div className="relative flex h-full min-h-70 flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <Badge className="border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white">
                        Evento
                      </Badge>
                      <ExternalLink className="h-5 w-5 text-white/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex h-24 w-24 items-center justify-center rounded-[1.8rem] bg-white/10 text-white backdrop-blur-sm sm:h-28 sm:w-28">
                        <CalendarDays className="h-12 w-12 sm:h-14 sm:w-14" />
                      </div>
                      <div>
                        <h2 className="font-ethnocentric text-3xl uppercase sm:text-4xl">Evento</h2>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                          Il foglio principale con le informazioni che raccontano il torneo: bar, musica, accoglienza,
                          eventi da organizzare e tutto il contorno della 24 H.
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </SheetTrigger>

              <SheetContent side="right" className="w-full border-white/10 bg-[#06101c] text-white sm:max-w-xl">
                <SheetHeader className="p-6 pr-12">
                  <SheetTitle className="font-ethnocentric text-3xl uppercase text-white">
                    Foglio Evento
                  </SheetTitle>
                  <SheetDescription className="text-slate-300">
                    Le informazioni principali dell&apos;evento 24 H, pensate per chi vuole capire subito l&apos;atmosfera del weekend.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-6 pb-6">
                  <Card className="border-white/10 bg-white/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Informazioni evento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-slate-300">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Il weekend</p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">{eventConfig.sottotitolo}</p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          {
                            title: "Location",
                            description: "Palestra Bombonera, Piazza V. Carnevali 1, San Martino in Rio.",
                          },
                          {
                            title: "Iscrizioni",
                            description: "Basta scegliere la disciplina e compilare il modulo del referente.",
                          },
                        ].map((item) => (
                          <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{item.title}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-200">{item.description}</p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Cosa troverai</p>
                        <div className="mt-3 space-y-2">
                          {eventConfig.highlights.map((item) => (
                            <div key={item} className="flex items-start gap-2 text-sm text-slate-200">
                              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-white/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Music2 className="h-4 w-4 text-primary" />
                        Atmosfera e accesso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-300">
                      <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                        Bar, musica e momenti di festa rendono la 24H un evento immersivo e coinvolgente.
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                        Gli accessi sono gestiti in modo semplice: scegli la disciplina, compila il modulo e invia il bonifico.
                      </div>
                    </CardContent>
                  </Card>

                  <Button asChild className="w-full rounded-full bg-cyan-400/15 px-6 py-5 text-white hover:bg-cyan-400/20">
                    <Link href="/torneo-24h/registrazione?disciplina=splash">
                      Vai all&apos;iscrizione Splash <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button asChild className="w-full rounded-full bg-amber-300/15 px-6 py-5 text-white hover:bg-amber-300/20">
                    <Link href="/torneo-24h/registrazione?disciplina=beach">
                      Vai all&apos;iscrizione Beach <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="grid gap-5">
              {sportCards.map((sport) => {
                const config = getTorneo24hDisciplina(sport.discipline)
                const Icon = sport.icon

                return (
                  <motion.div
                    key={sport.discipline}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45 }}
                  >
                    <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl transition-transform hover:-translate-y-1">
                      <CardHeader className="space-y-4 border-b border-white/10 bg-black/15">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${config.colore} text-white shadow-lg shadow-black/20`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <div>
                          <CardTitle className="font-ethnocentric text-2xl uppercase text-white">
                            {sport.title}
                          </CardTitle>
                          <CardDescription className="mt-2 text-sm text-slate-300">
                            {sport.subtitle}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 p-6">
                        <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Regolamento</p>
                            <p className="mt-2">PDF scaricabile e condivisibile con la squadra.</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Iscrizione</p>
                            <p className="mt-2">Modulo semplice con referenti, giocatori e allegato bonifico.</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row justify-center  items-center">
                          <div className="flex flex-col gap-3">
                            <Button asChild variant="outline" className="flex-1 rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">
                              <a href={`/api/torneo-24h/regolamento?disciplina=${sport.discipline}`} download>
                                Regolamento PDF
                              </a>
                            </Button>
                            <Button asChild variant="outline" className="flex-1 rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">
                              <a href={`/api/torneo-24h/regolamento?disciplina=liberatoria`} download>
                                Liberatoria PDF
                              </a>
                            </Button>
                          </div>
                          <Button asChild className={`flex-1 h-full rounded-full bg-linear-to-r ${config.colore} px-6 py-5 text-white shadow-lg shadow-black/20 hover:opacity-95`}>
                            <Link href={`/torneo-24h/registrazione?disciplina=${sport.discipline}`}>
                              Iscriviti
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-4xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Aiuto</p>
                <h2 className="font-ethnocentric text-3xl uppercase text-white sm:text-4xl">
                  Serve supporto?
                </h2>
              </div>
              <div className="hidden h-px flex-1 bg-white/10 lg:block" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <a
                href="mailto:torneo24h@volleyballsanmartino.it"
                className="group rounded-3xl border border-white/10 bg-black/20 p-5 transition-transform hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="flex items-center gap-3 text-primary">
                  <Mail className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-400">Email</span>
                </div>
                <p className="mt-4 text-lg font-semibold text-white">torneo24h@volleyballsanmartino.it</p>
                <p className="mt-2 text-sm text-slate-300">Scrivici per domande sull&apos;iscrizione, regolamento o organizzazione.</p>
              </a>

              <a
                href="tel:+393319181526"
                className="group rounded-3xl border border-white/10 bg-black/20 p-5 transition-transform hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="flex items-center gap-3 text-primary">
                  <Phone className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-400">Telefono</span>
                </div>
                <p className="mt-4 text-lg font-semibold text-white">+39 331 918 1526</p>
                <p className="mt-2 text-sm text-slate-300">Davide - per informazioni immediate sul torneo e sulle iscrizioni.</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}