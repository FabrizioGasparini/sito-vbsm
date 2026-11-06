"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, ArrowRight, UserCircle2 } from "lucide-react"
import Link from "next/link"
import { Team } from "@/lib/teams-data"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

/** Foto di squadra se disponibile, altrimenti un riquadro grafico con il nome della squadra */
const coverTextSize = {
  lg: "text-2xl sm:text-4xl",
  md: "text-xl sm:text-2xl",
  sm: "text-sm sm:text-base",
} as const

function TeamCover({ team, className, priority, size = "md" }: { team: Team; className: string; priority?: boolean; size?: keyof typeof coverTextSize }) {
  if (team.photo) {
    return (
      <img
        {...(priority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
        decoding="async"
        src={team.photo}
        alt={`Squadra ${team.categoria}`}
        className={className}
      />
    )
  }
  return (
    <div aria-hidden="true" className={`flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_80%_15%,rgba(225,29,72,0.45),transparent_55%),linear-gradient(135deg,#1a0b12,#070b11)] ${size === "sm" ? "p-3" : "p-6"} ${className.includes("absolute") ? "absolute inset-0" : ""}`}>
      <span className={`font-ethnocentric text-center uppercase leading-tight text-white/85 ${coverTextSize[size]}`}>{team.categoria}</span>
    </div>
  )
}

export default function SquadrePage() {
  const [teamsData, setTeamsData] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/teams");
        const data: Team[] = await response.json();
        setTeamsData(data);
      } catch (error) {
        console.error("Failed to fetch teams", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData();
  }, []);

  const sortedTeams = [...teamsData].sort((a, b) => b.idx - a.idx)
  const filteredTeams = sortedTeams

  // Layout a tre livelli: 2 squadre grandi, 2 medie, tutte le altre piccole
  const largeTeams = filteredTeams.slice(0, 2)
  const mediumTeams = filteredTeams.slice(2, 4)
  const smallTeams = filteredTeams.slice(4)

  const totalAthletes = teamsData.reduce((sum, team) => sum + team.players.length, 0)
  const totalStaff = teamsData.reduce((sum, team) => sum + team.team_coaches.length, 0)

  const slugFromCategoria = (categoria: string) =>
    categoria
      .toLowerCase()
      .replace(" / ", "-")
      .replace(/\s+/g, "-")
      .replace("à", "a")
      .replace("è", "e")


  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <Navigation />

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_15%,rgba(225,29,72,0.16),transparent_38%),radial-gradient(circle_at_75%_0%,rgba(59,130,246,0.12),transparent_32%),linear-gradient(180deg,#070a10_0%,#03060b_100%)]" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-20">
        <motion.div
          initial={{ opacity: 1, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-[#08111d]/70 backdrop-blur-sm p-6 sm:p-8 lg:p-10 mb-8"
        >
          <Badge className="mb-4 bg-white/10 text-slate-200 border border-white/10 uppercase tracking-[0.18em] text-[10px]">
            Settore Agonistico
          </Badge>
          <h1 className="font-ethnocentric text-4xl sm:text-5xl lg:text-7xl uppercase leading-[1.03] text-slate-100">
            LE NOSTRE <span className="text-red-400">SQUADRE</span>
          </h1>
          <div className="h-px w-full bg-gradient-to-r from-red-500/80 via-red-400/30 to-transparent mt-6" />
          <p className="mt-6 text-slate-300 max-w-3xl text-sm sm:text-base">
            Dalle categorie giovanili alle formazioni competitive: ogni gruppo rappresenta identità, impegno e crescita sportiva della Volleyball San Martino.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6" aria-busy="true">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => <Skeleton key={i} className="aspect-[16/12] w-full rounded-2xl bg-white/10" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => <Skeleton key={i} className="h-44 w-full rounded-2xl bg-white/10" />)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="aspect-[16/14] w-full rounded-xl bg-white/10" />)}
            </div>
          </div>
        ) : filteredTeams.length > 0 ? (
          <>
            {/* Livello 1: due squadre in grande */}
            {largeTeams.length > 0 && (
              <section aria-label="Squadre in evidenza" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {largeTeams.map((squadra, index) => (
                  <article key={squadra.id} className="rounded-2xl overflow-hidden border border-white/10 bg-[#09121e] group">
                    <Link href={`/squadre/${slugFromCategoria(squadra.categoria)}`} className="flex h-full flex-col">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <TeamCover team={squadra} size="lg" priority={index === 0} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                        <Badge className="absolute left-4 top-4 bg-red-600 text-white uppercase tracking-[0.15em] text-[10px]">
                          In evidenza
                        </Badge>
                      </div>
                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white group-hover:text-red-400 transition-colors">
                          {squadra.categoria}
                        </h2>
                        <p className="text-slate-300 mt-2 line-clamp-2">{squadra.descrizione || "Team ufficiale Volleyball San Martino"}</p>
                        <div className="mt-auto pt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-4 w-4" aria-hidden="true" />
                            {squadra.players.length} atleti
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <UserCircle2 className="h-4 w-4" aria-hidden="true" />
                            {squadra.team_coaches.length} staff
                          </span>
                          <span className="ml-auto inline-flex items-center gap-1 text-red-400">
                            Vedi squadra <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </section>
            )}

            {/* Livello 2: due squadre in formato medio (foto a sinistra, dettagli a destra) */}
            {mediumTeams.length > 0 && (
              <section aria-label="Altre squadre principali" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {mediumTeams.map((squadra) => (
                  <article key={squadra.id} className="rounded-2xl overflow-hidden border border-white/10 bg-[#09121e] group">
                    <Link href={`/squadre/${slugFromCategoria(squadra.categoria)}`} className="flex h-full flex-col sm:flex-row">
                      <div className="relative aspect-[16/10] sm:aspect-auto sm:w-2/5 sm:min-h-[11rem] shrink-0 overflow-hidden">
                        <TeamCover team={squadra} size="md" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Team ufficiale</p>
                        <h3 className="text-xl uppercase font-semibold mt-1 text-white group-hover:text-red-400 transition-colors line-clamp-2">
                          {squadra.categoria}
                        </h3>
                        <p className="text-slate-400 text-sm mt-2 line-clamp-2">{squadra.descrizione || "Roster e staff tecnico"}</p>
                        <div className="mt-auto pt-3 flex items-center justify-between text-sm text-slate-300">
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-4 w-4" aria-hidden="true" />
                            {squadra.players.length} atleti
                          </span>
                          <ArrowRight className="h-4 w-4 text-red-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </section>
            )}

            {/* Livello 3: tutte le altre squadre in piccolo */}
            {smallTeams.length > 0 && (
              <section aria-label="Tutte le altre squadre" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {smallTeams.map((squadra) => (
                  <article key={squadra.id} className="rounded-xl overflow-hidden border border-white/10 bg-[#09121e] group">
                    <Link href={`/squadre/${slugFromCategoria(squadra.categoria)}`} className="flex h-full flex-col">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <TeamCover team={squadra} size="sm" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex flex-1 flex-col p-3">
                        <h3 className="text-sm sm:text-base uppercase font-semibold leading-tight text-white group-hover:text-red-400 transition-colors line-clamp-2">
                          {squadra.categoria}
                        </h3>
                        <p className="mt-auto pt-2 text-xs text-slate-400">{squadra.players.length} atleti</p>
                      </div>
                    </Link>
                  </article>
                ))}
              </section>
            )}

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 rounded-2xl border border-white/10 bg-[#070d16]/85 p-5">
              <div className="lg:col-span-7 grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-black/30 border border-white/10 p-4 text-center">
                  <div className="text-3xl font-bold text-red-400">{teamsData.length}</div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-1">Squadre attive</div>
                </div>
                <div className="rounded-xl bg-black/30 border border-white/10 p-4 text-center">
                  <div className="text-3xl font-bold text-slate-200">{totalAthletes}+</div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-1">Atleti iscritti</div>
                </div>
                <div className="rounded-xl bg-black/30 border border-white/10 p-4 text-center">
                  <div className="text-3xl font-bold text-amber-300">{totalStaff}</div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-1">Allenatori staff</div>
                </div>
              </div>
              <div className="lg:col-span-5 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-ethnocentric text-xl leading-tight text-slate-100">DIVENTA UN <span className="text-red-400">SAN MARTINO</span></p>
                  <p className="text-sm text-slate-400 mt-2">Vuoi entrare nelle nostre squadre? Contattaci per una prova.</p>
                </div>
                <Button className="bg-red-500 hover:bg-red-400 text-white uppercase tracking-wider text-xs" asChild>
                  <Link href="/contatti">Unisciti a noi</Link>
                </Button>
              </div>
            </section>
          </>
        ) : (
          <div className="text-center py-20 border border-white/10 rounded-2xl bg-[#09121e]">
            <h3 className="text-2xl font-semibold text-white">Nessuna squadra trovata</h3>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
