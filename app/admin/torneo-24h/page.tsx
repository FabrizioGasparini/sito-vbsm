"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Banknote, CheckCircle2, Download, Loader2, Lock, Mail, Phone, Trash2, Unlock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TournamentPlayer {
  id: number
  nome: string
  cognome: string
  eta: number | null
}

interface TournamentTeam {
  id: number
  nome_squadra: string
  nome_referente: string
  email_referente: string
  telefono_referente: string
  note: string | null
  pagato: boolean
  importo: number | null
  creato_il: string
  giocatori: TournamentPlayer[]
}

type RegistrationInfo = {
  disciplina: string
  bonificoUrl: string | null
}

function extractRegistrationInfo(note: string | null): RegistrationInfo {
  if (!note) return { disciplina: "Sconosciuta", bonificoUrl: null }

  const disciplinaMatch = note.match(/Disciplina:\s*(.+)/i)
  const bonificoMatch = note.match(/Bonifico:\s*([^\n]+)/i)

  return {
    disciplina: disciplinaMatch?.[1]?.trim() || "Sconosciuta",
    bonificoUrl: bonificoMatch?.[1]?.trim() || null,
  }
}

export default function AdminTorneo24hPage() {
  const [teams, setTeams] = useState<TournamentTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [maintenanceLoading, setMaintenanceLoading] = useState(true)
  const [isBlocked, setIsBlocked] = useState(false)
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">("unpaid")
  const [activityFilter, setActivityFilter] = useState<"all" | "splash" | "beach">("all")
  const [copiedEmailId, setCopiedEmailId] = useState<number | null>(null)

  useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true)
        const res = await fetch("/api/tournament/teams")
        if (!res.ok) throw new Error("Errore nel caricamento delle iscrizioni")
        const data = await res.json()
        setTeams(data ?? [])
      } catch (err) {
        console.error(err)
        setError("Impossibile caricare le iscrizioni 24H")
      } finally {
        setLoading(false)
      }
    }

    loadTeams()
  }, [])

  useEffect(() => {
    async function loadMaintenanceState() {
      try {
        setMaintenanceLoading(true)
        const response = await fetch("/api/torneo-24h/status", { cache: "no-store" })
        if (!response.ok) throw new Error("Errore nel caricamento dello stato torneo")
        const data = await response.json()
        setIsBlocked(Boolean(data.blocked))
      } catch (err) {
        console.error(err)
      } finally {
        setMaintenanceLoading(false)
      }
    }

    loadMaintenanceState()
  }, [])

  const pendingTeams = useMemo(() => teams.filter((team) => !team.pagato), [teams])
  //const paidTeams = useMemo(() => teams.filter((team) => team.pagato), [teams])
  const visibleTeams = useMemo(() => {
    const parsedTeams = teams.filter((team) => {
      const discipline = extractRegistrationInfo(team.note).disciplina.toLowerCase()
      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "paid" && team.pagato) ||
        (paymentFilter === "unpaid" && !team.pagato)
      const matchesActivity =
        activityFilter === "all" ||
        (activityFilter === "splash" && discipline.includes("splash")) ||
        (activityFilter === "beach" && discipline.includes("beach"))

      return matchesPayment && matchesActivity
    })

    return [...parsedTeams].sort((a, b) => new Date(b.creato_il).getTime() - new Date(a.creato_il).getTime())
  }, [teams, paymentFilter, activityFilter])

  const handleDeleteTeam = async (team: TournamentTeam) => {
    const confirmed = window.confirm(`Eliminare definitivamente l'iscrizione di ${team.nome_squadra}?`)
    if (!confirmed) return

    const response = await fetch(`/api/tournament/teams?id=${team.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      setError("Impossibile eliminare l'iscrizione")
      return
    }

    setTeams((current) => current.filter((item) => item.id !== team.id))
  }

  const handleCopyEmail = async (email: string, id: number) => {
        if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(email)
    } else {
      // Fallback for non-secure contexts (HTTP, LAN IP, etc.)
      const textarea = document.createElement("textarea")
      textarea.value = email
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }
    setCopiedEmailId(id)
    window.setTimeout(() => setCopiedEmailId((current) => (current === id ? null : current)), 1500)
  }

  const handleTogglePaid = async (team: TournamentTeam) => {
    const nextValue = !team.pagato
    const response = await fetch("/api/tournament/teams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: team.id, pagato: nextValue }),
    })

    if (!response.ok) {
      setError("Impossibile aggiornare lo stato del pagamento")
      return
    }

    setTeams((current) => current.map((item) => (item.id === team.id ? { ...item, pagato: nextValue } : item)))
  }

  const handleToggleMaintenance = async () => {
    const nextValue = !isBlocked
    setMaintenanceLoading(true)

    try {
      const response = await fetch("/api/torneo-24h/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: nextValue }),
      })

      if (!response.ok) {
        setError("Impossibile aggiornare il blocco del torneo")
        return
      }

      setIsBlocked(nextValue)
    } finally {
      setMaintenanceLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(225,29,72,0.16),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.16),transparent_30%),linear-gradient(180deg,#070a10_0%,#03060b_100%)]" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Admin Panel
            </Link>
          </Button>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                24 H
              </div>
              <h1 className="font-ethnocentric text-3xl uppercase sm:text-4xl">Iscrizioni torneo</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                Gestisci le richieste dell’evento, verifica i bonifici e tieni sotto controllo lo stato delle squadre.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Stato torneo</p>
                <p className="mt-1 font-semibold text-white">{maintenanceLoading ? "Verifica..." : isBlocked ? "Bloccato" : "Attivo"}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Totale</p>
                <p className="mt-1 font-semibold text-white">{teams.length}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Da verificare</p>
                <p className="mt-1 font-semibold text-white">{pendingTeams.length}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-6 mt-6 flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "Tutte" },
              { key: "paid", label: "Pagate" },
              { key: "unpaid", label: "Non pagate" },
            ].map((item) => (
              <Button
                key={item.key}
                type="button"
                variant={paymentFilter === item.key ? "default" : "outline"}
                onClick={() => setPaymentFilter(item.key as typeof paymentFilter)}
                className={paymentFilter === item.key ? "rounded-full bg-primary text-white hover:bg-primary/90" : "rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "Tutte le attività" },
              { key: "splash", label: "Splash" },
              { key: "beach", label: "Beach" },
            ].map((item) => (
              <Button
                key={item.key}
                type="button"
                variant={activityFilter === item.key ? "default" : "outline"}
                onClick={() => setActivityFilter(item.key as typeof activityFilter)}
                className={activityFilter === item.key ? "rounded-full bg-primary text-white hover:bg-primary/90" : "rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleToggleMaintenance}
            disabled={maintenanceLoading}
            className={`min-w-48 rounded-full ${isBlocked ? "bg-emerald-600 hover:bg-emerald-500" : "bg-primary hover:bg-primary/90"}`}
          >
            {isBlocked ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
            {isBlocked ? "Sblocca torneo" : "Blocca torneo"}
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/5 p-12 text-slate-300 backdrop-blur-xl">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Caricamento iscrizioni...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-[1.5rem] border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200 backdrop-blur-xl">
            {error}
          </div>
        )}

        {!loading && !error && visibleTeams.length === 0 && (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-12 text-center text-slate-300 backdrop-blur-xl">
            Nessuna iscrizione da mostrare.
          </div>
        )}

        {!loading && !error && visibleTeams.length > 0 && (
          <div className="grid gap-5 xl:grid-cols-2">
            {visibleTeams.map((team) => {
              const registrationInfo = extractRegistrationInfo(team.note)

              return (
                <Card key={team.id} className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl">
                  <CardHeader className="border-b border-white/10 bg-black/20">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle className="text-xl text-white">{team.nome_squadra}</CardTitle>
                        <p className="mt-1 text-sm text-slate-300">Referente: {team.nome_referente}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="border border-white/10 bg-white/10 text-slate-200">{registrationInfo.disciplina}</Badge>
                        <Badge className={team.pagato ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300" : "border border-amber-500/30 bg-amber-500/15 text-amber-200"}>
                          {team.pagato ? "Pagato" : "In attesa"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Contatti</p>
                        <div className="mt-3 space-y-2 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            <span className="break-all">{team.email_referente}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" />
                            <span>{team.telefono_referente}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Stato bonifico</p>
                        <div className="mt-3 space-y-2 text-sm text-slate-300">
                          <p>Importo: {team.importo ? `€${team.importo}` : "Non specificato"}</p>
                          <p>Data iscrizione: {new Date(team.creato_il).toLocaleDateString("it-IT")}</p>
                          <p>Giocatori: {team.giocatori.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Bonifico caricato</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="truncate text-sm text-slate-300">
                          {registrationInfo.bonificoUrl ? registrationInfo.bonificoUrl : "Nessun link trovato nel riepilogo"}
                        </div>
                        {registrationInfo.bonificoUrl && (
                          <Button asChild size="sm" variant="outline" className="rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">
                            <Link href={registrationInfo.bonificoUrl} download target="_blank">
                              <Download className="mr-2 h-4 w-4" /> Scarica
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleCopyEmail(team.email_referente, team.id)}
                        className="rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                      >
                        {copiedEmailId === team.id ? "Mail copiata" : "Copia mail referente"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleTogglePaid(team)}
                        className={team.pagato ? "rounded-full bg-emerald-600 hover:bg-emerald-500" : "rounded-full bg-amber-600 hover:bg-amber-500"}
                      >
                        {team.pagato ? "Segna come non pagata" : "Segna come pagata"}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleDeleteTeam(team)}
                        className="rounded-full"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Rimuovi iscrizione
                      </Button>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Giocatori</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {team.giocatori.map((player, index) => (
                          <div key={player.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                            <p className="font-medium text-white">
                              {index + 1}. {player.nome} {player.cognome}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">Età: {player.eta ?? "n/d"}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Riepilogo iscrizione</p>
                      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">
                        {team.note || "Nessuna nota disponibile"}
                      </p>
                    </div>

                    {!team.pagato && (
                      <div className="flex items-center gap-2 text-sm text-amber-200">
                        <Banknote className="h-4 w-4" />
                        In attesa di verifica manuale del bonifico.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Le iscrizioni vengono confermate via email dopo la verifica del pagamento.
        </div>
      </div>
    </div>
  )
}
