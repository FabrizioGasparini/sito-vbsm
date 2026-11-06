"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, CalendarDays, Shield } from "lucide-react"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Team } from "@/lib/teams-data"
import { initials } from "@/lib/team-photos"
type ApiMatch = {
    id: number
    data: string
    ora: string
    squadra: string
    avversario: string
    casa: boolean
    palestra: string
    risultato: string | null
    completata: boolean
    campionato: string
    giornata: number | null
}

function slugify(input: string) {
    return input
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\//g, "-")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
}

function normalize(input: string) {
    return input
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
}

function isPlayed(value: boolean) {
    return value === true
}


function parseMatchDate(rawDate: string, rawTime: string) {
    const time = /^\d{1,2}:\d{2}$/.test(rawTime || "") ? rawTime : "20:30"

    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        return new Date(`${rawDate}T${time}:00`)
    }

    const parts = rawDate.split("/")
    if (parts.length === 3) {
        const [day, month, year] = parts
        return new Date(`${year}-${month}-${day}T${time}:00`)
    }

    return new Date()
}

function formatDateShort(rawDate: string, rawTime: string) {
    const date = parseMatchDate(rawDate, rawTime)
    return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
    })
}

function formatDateFull(rawDate: string, rawTime: string) {
    const date = parseMatchDate(rawDate, rawTime)
    return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

/** Foto con segnaposto: se l'immagine non si carica mostra il contenuto alternativo (numero o iniziali) */
function PhotoOrPlaceholder({ src, alt, placeholder }: { src?: string | null; alt: string; placeholder: string }) {
    const [failed, setFailed] = useState(false)

    if (!src || failed) {
        return (
            <div aria-hidden="true" className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(225,29,72,0.35),transparent_60%),linear-gradient(160deg,#111a26,#070b11)]">
                <span className="font-ethnocentric text-5xl text-white/80">{placeholder}</span>
            </div>
        )
    }

    return (
        <img loading="lazy" decoding="async"
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
    )
}

function belongsToTeamMatch(match: ApiMatch, team: Team) {
    const matchTeam = normalize(match.squadra)
    const teamName = normalize(team.categoria)
    const teamChampionship = normalize(team.campionato)
    const teamTokens = teamName.split(/[^a-z0-9]+/).filter((token) => token.length > 1)

    return (
        matchTeam === teamName ||
        matchTeam.includes(teamName) ||
        teamName.includes(matchTeam) ||
        teamTokens.some((token) => matchTeam.includes(token)) ||
        normalize(match.campionato) === teamChampionship ||
        normalize(match.campionato).includes(teamChampionship)
    )
}

function deriveTeamMatches(team: Team, data: ApiMatch[]) {
    return data
        .filter((match) => belongsToTeamMatch(match, team))
        .sort((a, b) => parseMatchDate(b.data, b.ora).getTime() - parseMatchDate(a.data, a.ora).getTime())
}

export default function TeamPage() {
    const params = useParams<{ slug: string }>()
    const slug = useMemo(() => {
        if (!params?.slug) return ""
        return Array.isArray(params.slug) ? params.slug[0] : params.slug
    }, [params])

    const [team, setTeam] = useState<Team | null>(null)
    const [matches, setMatches] = useState<ApiMatch[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let cancelled = false

        async function loadData() {
            setIsLoading(true)
            setError("")

            try {
                const teamsRes = await fetch("/api/teams", { cache: "no-store" })
                if (!teamsRes.ok) {
                    throw new Error("Impossibile recuperare le squadre")
                }

                const allTeams: Team[] = await teamsRes.json()
                const selectedTeam = allTeams.find(
                    (item) => item.id === slug || slugify(item.categoria) === slug
                )

                if (!selectedTeam) {
                    throw new Error("Squadra non trovata")
                }

                let matchesData: ApiMatch[] = []
                try {
                    const matchesRes = await fetch("/api/matches", { cache: "no-store" })
                    if (matchesRes.ok) {
                        matchesData = (await matchesRes.json()) as ApiMatch[]
                    }
                } catch {
                    matchesData = []
                }

                const teamMatches = deriveTeamMatches(selectedTeam, matchesData)

                if (!cancelled) {
                    setTeam(selectedTeam)
                    setMatches(teamMatches)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Errore inatteso")
                    setTeam(null)
                    setMatches([])
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        if (slug) {
            loadData()
        }

        return () => {
            cancelled = true
        }
    }, [slug])

    const roster = useMemo(() => {
        if (!team) return []

        return [...team.players].sort((a, b) => {
            if (a.capitano && !b.capitano) return -1
            if (!a.capitano && b.capitano) return 1

            const aNum = a.numero ?? 999
            const bNum = b.numero ?? 999
            if (aNum !== bNum) return aNum - bNum

            return `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`)
        })
    }, [team])

    const staff = useMemo(() => {
        if (!team) return []
        return [...team.team_coaches].sort((a, b) => (b.ruolo || "").localeCompare(a.ruolo || ""))
    }, [team])

    // Se nessuno ha la foto si usa il layout a elenco, più adatto delle schede con segnaposto
    const rosterHasPhotos = roster.some((player) => Boolean(player.photo))
    const staffHasPhotos = staff.some((member) => Boolean(member.photo))

    const upcomingMatches = useMemo(() => {
        const now = new Date().getTime()

        return [...matches]
            .filter((match) => !isPlayed(match.completata))
            .sort(
                (a, b) =>
                    parseMatchDate(a.data, a.ora).getTime() - parseMatchDate(b.data, b.ora).getTime()
            )
            .filter((m) => parseMatchDate(m.data, m.ora).getTime() >= now - 86400000)
            .slice(0, 3)
    }, [matches])

    const recentResults = useMemo(() => {
        return [...matches]
            .filter((match) => isPlayed(match.completata) && match.risultato)
            .sort(
                (a, b) =>
                    parseMatchDate(b.data, b.ora).getTime() - parseMatchDate(a.data, a.ora).getTime()
            )
            .slice(0, 3)
    }, [matches])


    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#05080d]">
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                    <Skeleton className="h-[420px] rounded-2xl bg-white/10" />
                    <Skeleton className="h-[420px] rounded-2xl bg-white/10" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-[300px] rounded-2xl bg-white/10" />
                        <Skeleton className="h-[300px] rounded-2xl bg-white/10" />
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    if (!team || error) {
        return (
            <div className="min-h-screen bg-[#05080d] text-white">
                <Navigation />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <h1 className="font-ethnocentric text-3xl">Squadra non disponibile</h1>
                    <p className="mt-4 text-slate-300">{error || "Non sono riuscito a trovare la squadra richiesta."}</p>
                    <Button className="mt-8 bg-red-500 hover:bg-red-400" asChild>
                        <Link href="/squadre">Torna a tutte le squadre</Link>
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-[#05080d] text-white">
            <Navigation />

            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(225,29,72,0.14),transparent_38%),radial-gradient(circle_at_85%_0%,rgba(59,130,246,0.1),transparent_32%),linear-gradient(180deg,#070b12_0%,#03060b_100%)]" />

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-8">
                <div>
                    <Link
                        href="/squadre"
                        className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Torna alle squadre
                    </Link>
                </div>

                <article className="relative rounded-2xl overflow-hidden border border-white/10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(225,29,72,0.45),transparent_55%),linear-gradient(135deg,#1a0b12,#05080d)]">
                        {team.photo && (
                            <img fetchPriority="high" decoding="async" src={team.photo} alt={team.categoria} className="h-full w-full object-cover" />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/15" />
                    <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/95 to-transparent" />

                    <div className="relative z-10 p-6 sm:p-10 lg:p-14 min-h-[420px] flex flex-col justify-end">
                        <Badge className="w-fit mb-4 bg-amber-300/90 text-black uppercase tracking-[0.16em] text-[10px]">
                            {team.campionato}
                        </Badge>
                        <h1 className="font-ethnocentric uppercase leading-[1.02] text-4xl sm:text-5xl lg:text-7xl max-w-4xl">
                            {team.categoria}
                        </h1>
                        <p className="mt-4 max-w-2xl text-slate-200 text-sm sm:text-base">
                            {team.descrizione || "Energia, tecnica e passione: il gruppo pronto a ogni nuova sfida."}
                        </p>

                        <div className="mt-6 text-sm text-slate-300 uppercase tracking-[0.14em]">Stagione {team.stagione}</div>
                    </div>
                </article>

                <section className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#0b121c] border border-white/10 p-4">
                        <div className="text-xs uppercase tracking-wider text-slate-400">Atleti</div>
                        <div className="text-3xl font-bold text-red-400 mt-1">{roster.length.toString().padStart(2, "0")}</div>
                    </div>
                    <div className="rounded-xl bg-[#0b121c] border border-white/10 p-4">
                        <div className="text-xs uppercase tracking-wider text-slate-400">Staff</div>
                        <div className="text-3xl font-bold text-slate-100 mt-1">{staff.length.toString().padStart(2, "0")}</div>
                    </div>

                </section>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="mb-6">
                    <h2 className="font-ethnocentric text-3xl uppercase">Il roster</h2>
                    <p className="text-slate-400 mt-2">Chi scende in campo con i colori del San Martino.</p>
                </div>

                {roster.length === 0 ? (
                    <p className="text-sm text-slate-400">Roster non ancora disponibile.</p>
                ) : rosterHasPhotos ? (
                    // Schede con foto (chi non ha la foto mostra il numero al suo posto)
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {roster.map((player) => (
                            <article key={player.id} className="group rounded-xl overflow-hidden border border-white/10 bg-[#0b121c]">
                                <div className="relative aspect-[3/4] overflow-hidden">
                                    <PhotoOrPlaceholder
                                        src={player.photo}
                                        alt={`${player.nome} ${player.cognome}`}
                                        placeholder={player.numero != null ? String(player.numero) : initials(player.nome, player.cognome)}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                                    {player.capitano && (
                                        <Badge className="absolute top-3 left-3 bg-amber-300 text-black text-[10px] uppercase tracking-wider">
                                            Capitano
                                        </Badge>
                                    )}
                                </div>
                                <div className="p-3">
                                    {player.numero != null && (
                                        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">#{player.numero}</p>
                                    )}
                                    <h3 className="text-base sm:text-lg font-semibold mt-1 leading-tight">
                                        {player.nome} {player.cognome}
                                    </h3>
                                    {player.ruolo && <p className="text-sm text-slate-400 mt-1">{player.ruolo}</p>}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    // Nessuna foto individuale: elenco compatto con numero di maglia
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {roster.map((player) => (
                            <li key={player.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#0b121c] p-3 sm:p-4 transition-colors hover:border-red-400/40">
                                <span
                                    aria-hidden="true"
                                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[radial-gradient(circle_at_30%_20%,rgba(225,29,72,0.45),transparent_65%),linear-gradient(160deg,#151f2d,#0a0f17)] font-ethnocentric text-2xl text-white"
                                >
                                    {player.numero ?? initials(player.nome, player.cognome)}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold leading-tight">
                                        <span className="sr-only">{player.numero != null ? `Numero ${player.numero}: ` : ""}</span>
                                        {player.nome} <span className="uppercase">{player.cognome}</span>
                                    </h3>
                                    {player.ruolo && <p className="mt-0.5 text-sm text-slate-400">{player.ruolo}</p>}
                                </div>
                                {player.capitano && (
                                    <Badge className="shrink-0 bg-amber-300 text-black text-[10px] uppercase tracking-wider">
                                        Capitano
                                    </Badge>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="mb-6">
                    <h2 className="font-ethnocentric text-3xl uppercase">Lo staff</h2>
                    <p className="text-slate-400 mt-2">Allenatori e collaboratori della squadra.</p>
                </div>

                {staff.length === 0 ? (
                    <p className="text-sm text-slate-400">Staff tecnico non disponibile.</p>
                ) : staffHasPhotos ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {staff.map((member) => (
                            <article key={member.id} className="group rounded-xl overflow-hidden border border-white/10 bg-[#0b121c]">
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    <PhotoOrPlaceholder
                                        src={member.photo}
                                        alt={`${member.nome} ${member.cognome}`}
                                        placeholder={initials(member.nome, member.cognome)}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                                    <Badge className="absolute top-3 left-3 bg-amber-300 text-black text-[10px] uppercase tracking-wider">
                                        Staff
                                    </Badge>
                                </div>
                                <div className="p-3">
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                                        {member.ruolo || "Staff tecnico"}
                                    </p>
                                    <h3 className="text-base sm:text-lg font-semibold mt-1 leading-tight">
                                        {member.nome} {member.cognome}
                                    </h3>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {staff.map((member) => (
                            <li key={member.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#0b121c] p-3 sm:p-4">
                                <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-amber-300/40 bg-amber-300/10 font-ethnocentric text-lg text-amber-200">
                                    {initials(member.nome, member.cognome)}
                                </span>
                                <div className="min-w-0">
                                    <h3 className="font-semibold leading-tight">
                                        {member.nome} <span className="uppercase">{member.cognome}</span>
                                    </h3>
                                    <p className="mt-0.5 text-sm text-slate-400">{member.ruolo || "Staff tecnico"}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <article className="rounded-2xl border border-white/10 bg-[#0b121c] p-4 sm:p-6">
                        <h2 className="font-ethnocentric text-2xl uppercase mb-5">Prossime sfide</h2>
                        <div className="space-y-3">
                            {upcomingMatches.length > 0 ? (
                                upcomingMatches.map((match) => {
                                    const opponent = match.avversario
                                    const homeAway = match.casa ? "Home" : "Away"

                                    return (
                                        <div key={match.id} className="rounded-lg border border-white/10 bg-black/30 p-3">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold uppercase">vs {opponent}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{homeAway}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold">{formatDateShort(match.data, match.ora)}</p>
                                                    <p className="text-xs text-slate-400 inline-flex items-center gap-1 mt-1">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        {match.ora || "20:30"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-sm text-slate-400">Nessuna prossima partita disponibile.</p>
                            )}
                        </div>
                    </article>

                    <article className="rounded-2xl border border-white/10 bg-[#0b121c] p-4 sm:p-6 hidden">
                        <h2 className="font-ethnocentric text-2xl uppercase mb-5">Ultimi risultati</h2>
                        <div className="space-y-3">
                            {recentResults.length > 0 ? (
                                recentResults.map((match) => (
                                    <div key={match.id} className="rounded-lg border border-white/10 bg-black/30 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-slate-400" />
                                                <span className="text-xs text-slate-300">{match.squadra}</span>
                                            </div>
                                            <p className="text-2xl font-bold text-slate-100">{match.risultato}</p>
                                            <div className="text-xs text-slate-400 uppercase">Finale</div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">{formatDateFull(match.data, match.ora)}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400">Nessun risultato recente disponibile.</p>
                            )}
                        </div>
                    </article>
                </div>
            </section>

            <Footer />
        </div>
    )
}
