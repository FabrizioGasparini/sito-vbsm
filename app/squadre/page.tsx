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
function TeamCover({ team, className, priority }: { team: Team; className: string; priority?: boolean }) {
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
    <div aria-hidden="true" className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_80%_15%,rgba(225,29,72,0.45),transparent_55%),linear-gradient(135deg,#1a0b12,#070b11)] p-6">
      <span className="font-ethnocentric text-center text-2xl uppercase leading-tight text-white/85 sm:text-3xl">{team.categoria}</span>
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

  const topTeam = filteredTeams[0]
  const sideTeams = filteredTeams.slice(1, 3)
  const gridTeams = filteredTeams.slice(3)

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
          <div className="space-y-8">
            <Skeleton className="h-[360px] w-full rounded-2xl bg-white/10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-44 w-full rounded-xl bg-white/10" />
                  <Skeleton className="h-4 w-2/3 bg-white/10" />
                  <Skeleton className="h-4 w-1/2 bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredTeams.length > 0 ? (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {topTeam && (
                <article className="lg:col-span-2 rounded-2xl overflow-hidden border border-white/10 bg-[#09121e] group">
                  <Link href={`/squadre/${slugFromCategoria(topTeam.categoria)}`}>
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <TeamCover team={topTeam} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" priority />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
                      <Badge className="absolute left-4 top-4 bg-red-600 text-white uppercase tracking-[0.15em] text-[10px]">
                        In evidenza
                      </Badge>
                    </div>
                    <div className="p-5 sm:p-6">
                      <h2 className="text-3xl font-bold uppercase tracking-wide text-white group-hover:text-red-400 transition-colors">
                        {topTeam.categoria}
                      </h2>
                      <p className="text-slate-300 mt-2 line-clamp-2">{topTeam.descrizione || "Team ufficiale Volleyball San Martino"}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          {topTeam.players.length} atleti
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <UserCircle2 className="h-4 w-4" />
                          {topTeam.team_coaches.length} staff
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              )}

              <div className="space-y-6">
                {sideTeams.map((squadra) => (
                  <article key={squadra.id} className="rounded-2xl overflow-hidden border border-white/10 bg-[#09121e] group">
                    <Link href={`/squadre/${slugFromCategoria(squadra.categoria)}`}>
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <TeamCover team={squadra} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Team ufficiale</p>
                        <h3 className="text-xl uppercase font-semibold mt-1 text-white group-hover:text-red-400 transition-colors line-clamp-2">
                          {squadra.categoria}
                        </h3>
                        <p className="text-slate-400 text-sm mt-2 line-clamp-2">{squadra.descrizione || "Roster e staff tecnico"}</p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            {gridTeams.length > 0 && (
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {gridTeams.map((squadra) => (
                  <article key={squadra.id} className="rounded-2xl border border-white/10 bg-[#09121e] p-4 group">
                    <Link href={`/squadre/${slugFromCategoria(squadra.categoria)}`}>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Volley</p>
                      <h3 className="mt-1 text-xl uppercase font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                        {squadra.categoria}
                      </h3>
                      <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                        {squadra.descrizione || "Scopri il gruppo, lo staff e il roster completo"}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                        <span>{squadra.players.length} atleti</span>
                        <span className="inline-flex items-center gap-1 text-red-400">
                          Vedi roster <ArrowRight className="h-3.5 w-3.5" />
                        </span>
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
