"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { ArrowLeft, ShieldCheck, Save, Trash2, Plus, Pencil, UserPlus } from "lucide-react"
import Link from "next/link"

interface Player {
  id?: number | string
  nome: string
  cognome: string
  ruolo: string
  numero: number | null
  capitano: boolean
  foto?: string | null
}

interface Team {
  id: string
  idx?: number
  categoria: string
  descrizione: string | null
  stagione: string
  campionato: string
  colore: string | null
  immagine?: string | null
  players: Player[]
  team_coaches?: Array<{ id: string; nome: string; cognome: string; ruolo: string | null }>
}

const emptyTeamForm = {
  id: "",
  categoria: "",
  descrizione: "",
  stagione: "2025/26",
  campionato: "",
  colore: "#d62828",
  immagine: "",
}

const emptyPlayerForm = {
  id: undefined as number | string | undefined,
  nome: "",
  cognome: "",
  ruolo: "",
  numero: null as number | null,
  capitano: false,
  foto: "",
}

/** Invio con Enter dai campi di testo/numero (non da checkbox o pulsanti) */
function submitOnEnter(event: React.KeyboardEvent, submit: () => void) {
  const target = event.target as HTMLElement
  if (event.key !== "Enter" || target.tagName !== "INPUT") return
  const type = (target as HTMLInputElement).type
  if (type === "checkbox" || type === "file") return
  event.preventDefault()
  submit()
}

export default function AdminSquadrePage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [teamForm, setTeamForm] = useState(emptyTeamForm)
  const [editingTeam, setEditingTeam] = useState(false)
  const [playerForm, setPlayerForm] = useState(emptyPlayerForm)
  const [editingPlayerId, setEditingPlayerId] = useState<number | string | null>(null)
  const [coachForm, setCoachForm] = useState({ id: "", nome: "", cognome: "", ruolo: "" })
  const [editingCoachId, setEditingCoachId] = useState<string | null>(null)
  // Messaggi mostrati accanto ai pulsanti (il banner in alto non è visibile quando si è scesi nella pagina)
  type Feedback = { type: "success" | "error"; text: string } | null
  const [playerFeedback, setPlayerFeedback] = useState<Feedback>(null)
  const [coachFeedback, setCoachFeedback] = useState<Feedback>(null)
  const [savingPlayer, setSavingPlayer] = useState(false)
  const [savingCoach, setSavingCoach] = useState(false)
  const playerNomeRef = useRef<HTMLInputElement>(null)
  const coachNomeRef = useRef<HTMLInputElement>(null)

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? null,
    [teams, selectedTeamId]
  )

  // Lo schermo di caricamento compare solo al primo avvio (loading parte da true):
  // gli aggiornamenti dopo un salvataggio sostituiscono i dati sul posto, senza perdere la posizione nella pagina
  const loadTeams = async () => {
    try {
      const res = await fetch("/api/teams", { cache: "no-store" })
      if (!res.ok) throw new Error("Errore nel caricamento delle squadre")
      const data = await res.json()
      const nextTeams = data ?? []
      setTeams(nextTeams)
      if (!selectedTeamId && nextTeams[0]) setSelectedTeamId(nextTeams[0].id)
      if (selectedTeamId && !nextTeams.some((team: Team) => team.id === selectedTeamId)) {
        setSelectedTeamId(nextTeams[0]?.id ?? null)
      }
    } catch (err) {
      console.error(err)
      setError("Impossibile caricare le squadre")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeams()
  }, [])

  // I messaggi di conferma si riferiscono alla squadra corrente
  useEffect(() => {
    setPlayerFeedback(null)
    setCoachFeedback(null)
  }, [selectedTeamId])

  useEffect(() => {
    if (!selectedTeam) return
    setTeamForm({
      id: selectedTeam.id,
      categoria: selectedTeam.categoria,
      descrizione: selectedTeam.descrizione ?? "",
      stagione: selectedTeam.stagione,
      campionato: selectedTeam.campionato ?? "",
      colore: selectedTeam.colore ?? "#d62828",
      immagine: selectedTeam.immagine ?? "",
    })
  }, [selectedTeam])

  const handleTeamSave = async () => {
    if (!teamForm.categoria.trim()) {
      setError("La categoria della squadra è obbligatoria")
      return
    }

    try {
      const payload = {
        ...teamForm,
        type: "team",
        idx: teams.find((team) => team.id === teamForm.id)?.idx ?? 0,
      }

      const method = teamForm.id && teams.some((team) => team.id === teamForm.id) ? "PUT" : "POST"
      const res = await fetch("/api/teams", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Errore salvataggio squadra")
      }

      setError(null)
      setEditingTeam(false)
      await loadTeams()
    } catch (err) {
      console.error(err)
      setError("Errore durante il salvataggio della squadra")
    }
  }

  const handleTeamDelete = async (teamId: string) => {
    if (!teamId || !confirm("Eliminare questa squadra e tutti i giocatori associati?")) return

    try {
      const res = await fetch(`/api/teams?teamId=${encodeURIComponent(teamId)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Errore cancelazione squadra")
      setSelectedTeamId((current) => current === teamId ? null : current)
      await loadTeams()
    } catch (err) {
      console.error(err)
      setError("Errore durante la cancellazione della squadra")
    }
  }

  const handleCreateNewTeam = () => {
    const id = crypto.randomUUID().slice(0, 8)
    setSelectedTeamId(id)
    setEditingTeam(true)
    setTeamForm({
      id,
      categoria: "",
      descrizione: "",
      stagione: "2025/26",
      campionato: "",
      colore: "#d62828",
      immagine: "",
    })
  }

  const handlePlayerSave = async () => {
    if (!selectedTeamId) return
    if (savingPlayer) return
    if (!playerForm.nome.trim() || !playerForm.cognome.trim()) {
      setPlayerFeedback({ type: "error", text: "Nome e cognome del giocatore sono obbligatori" })
      return
    }
    if (playerForm.numero == null || !Number.isInteger(playerForm.numero) || playerForm.numero < 0 || playerForm.numero > 99) {
      setPlayerFeedback({ type: "error", text: "Inserisci il numero di maglia (da 0 a 99)" })
      return
    }
    const wasEditing = editingPlayerId != null
    const savedName = `${playerForm.nome.trim()} ${playerForm.cognome.trim()}`
    setSavingPlayer(true)

    try {
      const payload = {
        ...playerForm,
        teamId: selectedTeamId,
        numero: playerForm.numero ?? null,
      }

      const res = await fetch("/api/teams", {
        method: editingPlayerId != null ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Errore salvataggio giocatore")
      }

      setPlayerForm(emptyPlayerForm)
      setEditingPlayerId(null)
      setPlayerFeedback({ type: "success", text: wasEditing ? `${savedName} aggiornato` : `${savedName} aggiunto al roster` })
      await loadTeams()
      // Pronto per inserire subito il giocatore successivo
      playerNomeRef.current?.focus()
    } catch (err) {
      console.error(err)
      setPlayerFeedback({ type: "error", text: "Errore durante il salvataggio del giocatore" })
    } finally {
      setSavingPlayer(false)
    }
  }

  const handlePlayerDelete = async (playerId: number | string) => {
    if (!playerId || !confirm("Eliminare questo giocatore?")) return

    try {
      const res = await fetch(`/api/teams?playerId=${encodeURIComponent(String(playerId))}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Errore cancellazione giocatore")
      await loadTeams()
    } catch (err) {
      console.error(err)
      setError("Errore durante la cancellazione del giocatore")
    }
  }

  const handleCoachSave = async () => {
    if (!selectedTeamId) return
    if (savingCoach) return
    if (!coachForm.nome.trim() || !coachForm.cognome.trim()) {
      setCoachFeedback({ type: "error", text: "Nome e cognome sono obbligatori" })
      return
    }
    const wasEditingCoach = Boolean(editingCoachId)
    const savedCoachName = `${coachForm.nome.trim()} ${coachForm.cognome.trim()}`
    setSavingCoach(true)

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "coach",
          teamId: selectedTeamId,
          coachId: editingCoachId || undefined,
          nome: coachForm.nome,
          cognome: coachForm.cognome,
          ruolo: coachForm.ruolo,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Errore salvataggio allenatore")
      }

      setCoachForm({ id: "", nome: "", cognome: "", ruolo: "" })
      setEditingCoachId(null)
      setCoachFeedback({ type: "success", text: wasEditingCoach ? `${savedCoachName} aggiornato` : `${savedCoachName} aggiunto allo staff` })
      await loadTeams()
      coachNomeRef.current?.focus()
    } catch (err) {
      console.error(err)
      setCoachFeedback({ type: "error", text: "Errore durante il salvataggio dello staff" })
    } finally {
      setSavingCoach(false)
    }
  }

  const handleCoachDelete = async (coachId: string) => {
    if (!selectedTeamId || !coachId || !confirm("Eliminare questo allenatore dal team?")) return

    try {
      const res = await fetch(`/api/teams?coachId=${encodeURIComponent(coachId)}&team=${encodeURIComponent(selectedTeamId)}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Errore cancellazione allenatore")
      await loadTeams()
    } catch (err) {
      console.error(err)
      setError("Errore durante la cancellazione dell'allenatore")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080d] text-white">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(225,29,72,0.16),transparent_35%),linear-gradient(180deg,#070a10_0%,#03060b_100%)]" />
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 text-slate-300 backdrop-blur-xl">
            Caricamento editor squadre...
          </div>
        </div>
      </div>
    )
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
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-200">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Squadre
              </div>
              <h1 className="font-ethnocentric text-3xl uppercase sm:text-4xl">Editor squadre e roster</h1>
              <p className="mt-3 text-sm text-slate-300 sm:text-base">Crea, modifica, carica immagini e gestisci i giocatori direttamente in database.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCreateNewTeam} className="rounded-full bg-primary px-5 py-4 text-white hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Nuova squadra
              </Button>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Elenco squadre</h2>
                <Badge className="bg-white/5 text-slate-300 border border-white/10">{teams.length}</Badge>
              </div>

              <div className="space-y-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 transition ${selectedTeamId === team.id ? "border-primary/60 bg-primary/10" : "border-white/10 bg-black/10 hover:bg-white/5"}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedTeamId(team.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <img loading="lazy" decoding="async"
                        src={team.immagine || `/images/2025-26/squadre/${team.id}/squadra.webp` || "/images/placeholder.svg"}
                        alt={team.categoria}
                        className="h-12 w-12 rounded-xl object-cover"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.onerror = null
                          target.src = "/images/placeholder.svg"
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">{team.categoria}</p>
                        <p className="text-xs text-slate-400">{team.campionato || "Campionato"}</p>
                      </div>
                    </button>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTeamDelete(team.id)}
                      className="rounded-full border-rose-500/20 bg-rose-500/5 text-rose-200 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {selectedTeam && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Anteprima</h3>
                  <Button size="sm" variant="outline" onClick={() => setEditingTeam(true)} className="rounded-full border-white/10 bg-transparent text-white hover:bg-white/10">
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Modifica
                  </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/10">
                  <img loading="lazy" decoding="async"
                    src={selectedTeam.immagine || `/images/2025-26/squadre/${selectedTeam.id}/squadra.webp` || "/images/placeholder.svg"}
                    alt={selectedTeam.categoria}
                    className="h-40 w-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget
                      target.onerror = null
                      target.src = "/images/placeholder.svg"
                    }}
                  />
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p><span className="text-slate-500">Categoria:</span> {selectedTeam.categoria}</p>
                  <p><span className="text-slate-500">Campionato:</span> {selectedTeam.campionato}</p>
                  <p><span className="text-slate-500">Stagione:</span> {selectedTeam.stagione}</p>
                  <p className="text-slate-400">{selectedTeam.descrizione || "Nessuna descrizione"}</p>
                </div>
              </div>
            )}
          </aside>

          <main className="space-y-8">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">
                  {editingTeam ? "Dettagli squadra" : selectedTeam ? `Squadra: ${selectedTeam.categoria}` : "Seleziona una squadra"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-slate-300">ID squadra</Label>
                    <Input
                      value={teamForm.id}
                      onChange={(e) => setTeamForm({ ...teamForm, id: e.target.value })}
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      placeholder="es. serie-c-maschile"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Categoria</Label>
                    <Input
                      value={teamForm.categoria}
                      onChange={(e) => setTeamForm({ ...teamForm, categoria: e.target.value })}
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      placeholder="es. Serie C Maschile"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Campionato</Label>
                    <Input
                      value={teamForm.campionato}
                      onChange={(e) => setTeamForm({ ...teamForm, campionato: e.target.value })}
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      placeholder="es. Serie C"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Stagione</Label>
                    <Input
                      value={teamForm.stagione}
                      onChange={(e) => setTeamForm({ ...teamForm, stagione: e.target.value })}
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      placeholder="2025/26"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Colore</Label>
                    <Input
                      type="color"
                      value={teamForm.colore || "#d62828"}
                      onChange={(e) => setTeamForm({ ...teamForm, colore: e.target.value })}
                      className="h-11 border-white/10 bg-white/5 text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageUpload
                      label="Immagine squadra"
                      value={teamForm.immagine}
                      onChange={(url) => setTeamForm({ ...teamForm, immagine: url })}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Descrizione</Label>
                  <Textarea
                    value={teamForm.descrizione}
                    onChange={(e) => setTeamForm({ ...teamForm, descrizione: e.target.value })}
                    className="min-h-28 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                    placeholder="Descrizione della squadra, obiettivi e caratteristiche..."
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleTeamSave} className="rounded-full bg-primary px-6 py-5 text-white hover:bg-primary/90">
                    <Save className="mr-2 h-4 w-4" />
                    Salva squadra
                  </Button>
                  {selectedTeam && (
                    <Button onClick={() => handleTeamDelete(selectedTeam.id)} variant="outline" className="rounded-full border-rose-500/30 bg-rose-500/5 text-rose-200 hover:bg-rose-500/10">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Elimina squadra
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedTeam && (
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Gestione staff</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-3" onKeyDown={(e) => submitOnEnter(e, handleCoachSave)}>
                    <div>
                      <Label htmlFor="coach-nome" className="text-slate-300">Nome *</Label>
                      <Input
                        id="coach-nome"
                        ref={coachNomeRef}
                        value={coachForm.nome}
                        onChange={(e) => setCoachForm({ ...coachForm, nome: e.target.value })}
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coach-cognome" className="text-slate-300">Cognome *</Label>
                      <Input
                        id="coach-cognome"
                        value={coachForm.cognome}
                        onChange={(e) => setCoachForm({ ...coachForm, cognome: e.target.value })}
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coach-ruolo" className="text-slate-300">Ruolo <span className="text-slate-500">(facoltativo)</span></Label>
                      <Input
                        id="coach-ruolo"
                        value={coachForm.ruolo}
                        onChange={(e) => setCoachForm({ ...coachForm, ruolo: e.target.value })}
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                        placeholder="Allenatore, Staff, etc."
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCoachSave} disabled={savingCoach} className="rounded-full bg-primary px-6 py-5 text-white hover:bg-primary/90">
                      {savingCoach ? "Salvataggio..." : editingCoachId ? "Salva staff" : "Aggiungi staff"}
                    </Button>
                    {editingCoachId && (
                      <Button variant="outline" onClick={() => { setEditingCoachId(null); setCoachForm({ id: "", nome: "", cognome: "", ruolo: "" }) }} className="rounded-full border-white/10 bg-transparent text-white hover:bg-white/10">
                        Annulla
                      </Button>
                    )}
                  </div>
                  <p role="status" aria-live="polite" className={`min-h-5 text-sm ${coachFeedback?.type === "error" ? "text-rose-300" : "text-emerald-300"}`}>
                    {coachFeedback?.text}
                  </p>

                  <div className="space-y-3">
                    {(selectedTeam.team_coaches ?? []).map((coach) => (
                      <div key={coach.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 p-4">
                        <div>
                          <p className="font-medium text-white">{coach.nome} {coach.cognome}</p>
                          <p className="text-sm text-slate-400">{coach.ruolo || "Ruolo non definito"}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => {
                            setEditingCoachId(coach.id)
                            setCoachForm({ id: coach.id, nome: coach.nome, cognome: coach.cognome, ruolo: coach.ruolo ?? "" })
                          }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="rounded-full border-rose-500/20 bg-rose-500/5 text-rose-200 hover:bg-rose-500/10" onClick={() => handleCoachDelete(coach.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTeam && (
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Gestione roster</CardTitle>
                  <p className="text-sm text-slate-400">
                    Bastano nome, cognome e numero. Ruolo, capitano e foto sono facoltativi: se nessun giocatore ha la foto,
                    sul sito il roster viene mostrato come elenco con i numeri di maglia.
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onKeyDown={(e) => submitOnEnter(e, handlePlayerSave)}>
                    <div>
                      <Label htmlFor="player-nome" className="text-slate-300">Nome *</Label>
                      <Input
                        id="player-nome"
                        ref={playerNomeRef}
                        value={playerForm.nome}
                        onChange={(e) => setPlayerForm({ ...playerForm, nome: e.target.value })}
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="player-cognome" className="text-slate-300">Cognome *</Label>
                      <Input
                        id="player-cognome"
                        value={playerForm.cognome}
                        onChange={(e) => setPlayerForm({ ...playerForm, cognome: e.target.value })}
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="player-ruolo" className="text-slate-300">Ruolo <span className="text-slate-500">(facoltativo)</span></Label>
                      <Input
                        id="player-ruolo"
                        value={playerForm.ruolo}
                        onChange={(e) => setPlayerForm({ ...playerForm, ruolo: e.target.value })}
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                        placeholder="Palleggiatore"
                      />
                    </div>
                    <div>
                      <Label htmlFor="player-numero" className="text-slate-300">Numero *</Label>
                      <Input
                        id="player-numero"
                        type="number"
                        min={0}
                        max={99}
                        required
                        value={playerForm.numero ?? ""}
                        onChange={(e) => setPlayerForm({ ...playerForm, numero: e.target.value === "" ? null : Number(e.target.value) })}
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="md:col-span-2 xl:col-span-3">
                      <ImageUpload
                        label="Foto giocatore (facoltativa)"
                        value={playerForm.foto ?? ""}
                        onChange={(url) => setPlayerForm({ ...playerForm, foto: url })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="player-capitano"
                      type="checkbox"
                      checked={playerForm.capitano}
                      onChange={(e) => setPlayerForm({ ...playerForm, capitano: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary"
                    />
                    <Label htmlFor="player-capitano" className="text-slate-300">Capitano <span className="text-slate-500">(facoltativo)</span></Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handlePlayerSave} disabled={savingPlayer} className="rounded-full bg-primary px-6 py-5 text-white hover:bg-primary/90">
                      <UserPlus className="mr-2 h-4 w-4" />
                      {savingPlayer ? "Salvataggio..." : editingPlayerId != null ? "Salva modifiche" : "Aggiungi giocatore"}
                    </Button>
                    {editingPlayerId != null && (
                      <Button variant="outline" onClick={() => { setEditingPlayerId(null); setPlayerForm(emptyPlayerForm) }} className="rounded-full border-white/10 bg-transparent text-white hover:bg-white/10">
                        Annulla
                      </Button>
                    )}
                  </div>
                  <p role="status" aria-live="polite" className={`min-h-5 text-sm ${playerFeedback?.type === "error" ? "text-rose-300" : "text-emerald-300"}`}>
                    {playerFeedback?.text}
                  </p>

                  <div className="space-y-3">
                    {selectedTeam?.players?.map((player) => (
                      <div key={String(player.id ?? `${player.nome}-${player.cognome}`)} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <img loading="lazy" decoding="async"
                            src={player.foto || "/images/placeholder.svg"}
                            alt={`${player.nome} ${player.cognome}`}
                            className="h-12 w-12 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget
                              target.onerror = null
                              target.src = "/images/placeholder.svg"
                            }}
                          />
                          <div>
                            <p className="font-medium text-white">{player.nome} {player.cognome}</p>
                            <p className="text-sm text-slate-400">{player.ruolo || "Ruolo non definito"} {player.numero ? `• #${player.numero}` : ""}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => {
                            setEditingPlayerId(player.id ?? null)
                            setPlayerForm({
                              id: player.id,
                              nome: player.nome,
                              cognome: player.cognome,
                              ruolo: player.ruolo ?? "",
                              numero: player.numero ?? null,
                              capitano: player.capitano ?? false,
                              foto: player.foto ?? "",
                            })
                          }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="rounded-full border-rose-500/20 bg-rose-500/5 text-rose-200 hover:bg-rose-500/10" onClick={() => handlePlayerDelete(player.id ?? "")}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
