"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  CheckCircle,
  Clock3,
  CloudUpload,
  ChevronRight,
  Info,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Users,
  Volleyball,
  Waves,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  calculateAgeFromBirthdate,
  getTorneo24hDisciplina,
  type Torneo24hDisciplina,
  type Torneo24hPlayerInput,
} from "@/lib/torneo-24h"

type PlayerForm = Torneo24hPlayerInput

const emptyPlayer = (): PlayerForm => ({
  nome: "",
  cognome: "",
  data_nascita: "",
})

const disciplineIcons: Record<Torneo24hDisciplina, typeof Volleyball> = {
  splash: Volleyball,
  beach: Waves,
}

export default function RegistrazionePage() {
  const searchParams = useSearchParams()
  const disciplina = searchParams.get("disciplina")
  const config = useMemo(() => getTorneo24hDisciplina(disciplina), [disciplina])
  const DisciplineIcon = disciplineIcons[config.slug]

  const [formData, setFormData] = useState({
    nome_squadra: "",
    nome_referente: "",
    email_referente: "",
    telefono_referente: "",
  })
  const [players, setPlayers] = useState<PlayerForm[]>(Array.from({ length: config.maxPlayers }, emptyPlayer))
  const [, setBonificoFile] = useState<File | null>(null)
  const [bonificoUrl, setBonificoUrl] = useState("")
  const [bonificoPreview, setBonificoPreview] = useState("")
  const [bonificoPreviewType, setBonificoPreviewType] = useState<"image" | "pdf" | "other" | "">("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [formTimestamp, setFormTimestamp] = useState<number>(0)
  const [honeypot, setHoneypot] = useState("")

  useEffect(() => {
    setFormTimestamp(Date.now())
  }, [])

  useEffect(() => {
    setPlayers(Array.from({ length: config.maxPlayers }, emptyPlayer))
    setBonificoFile(null)
    setBonificoUrl("")
    setBonificoPreview("")
    setBonificoPreviewType("")
    setSubmitResult(null)
  }, [config.maxPlayers, config.slug])

  useEffect(() => {
    return () => {
      if (bonificoPreview) URL.revokeObjectURL(bonificoPreview)
    }
  }, [bonificoPreview])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlayerChange = (index: number, field: keyof PlayerForm, value: string) => {
    setPlayers((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const uploadBonifico = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/torneo-24h/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Errore durante l'upload" }))
        throw new Error(error.error || "Errore durante l'upload")
      }

      const data = await response.json()
      setBonificoUrl(data.url)
      setSubmitResult(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Errore durante l'upload"
      setBonificoUrl("")
      setSubmitResult({ success: false, message })
    } finally {
      setIsUploading(false)
    }
  }

  const handleBonificoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setSubmitResult({ success: false, message: "Carica solo una foto, uno screenshot o un PDF del bonifico." })
      return
    }

    if (bonificoPreview) URL.revokeObjectURL(bonificoPreview)
    const preview = URL.createObjectURL(file)
    setBonificoPreview(preview)
    setBonificoPreviewType(file.type === "application/pdf" ? "pdf" : file.type.startsWith("image/") ? "image" : "other")
    setBonificoFile(file)
    await uploadBonifico(file)
  }

  const validateForm = () => {
    if (!formData.nome_squadra.trim()) return "Inserisci il nome della squadra"
    if (!formData.nome_referente.trim()) return "Inserisci il nome del referente"
    if (!formData.email_referente.trim()) return "Inserisci la mail del referente"
    if (!formData.telefono_referente.trim()) return "Inserisci il numero di telefono del referente"
    if (!privacyAccepted) return "Accetta la privacy policy prima di inviare l'iscrizione"
    if (!bonificoUrl) return "Carica il bonifico prima di inviare l'iscrizione"

    const filledPlayers = players.filter((player) => player.nome.trim() || player.cognome.trim() || player.data_nascita.trim())
    if (filledPlayers.length < config.minPlayers) return `Inserisci almeno ${config.minPlayers} giocatori`
    if (filledPlayers.length > config.maxPlayers) return `Puoi inserire al massimo ${config.maxPlayers} giocatori`

    for (const player of filledPlayers) {
      const age = calculateAgeFromBirthdate(player.data_nascita)
      if (age === null) return "Inserisci una data di nascita valida per ogni giocatore"
      if (age < config.etaMinima) return `Tutti i giocatori devono avere almeno ${config.etaMinima} anni`
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const error = validateForm()
    if (error) {
      setSubmitResult({ success: false, message: error })
      return
    }

    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch("/api/tournament/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disciplina: config.slug,
          nome_squadra: formData.nome_squadra,
          nome_referente: formData.nome_referente,
          email_referente: formData.email_referente,
          telefono_referente: formData.telefono_referente,
          bonifico_url: bonificoUrl,
          privacy_consent: privacyAccepted,
          giocatori: players
            .filter((player) => player.nome.trim() || player.cognome.trim() || player.data_nascita.trim())
            .map((player) => ({
              nome: player.nome.trim(),
              cognome: player.cognome.trim(),
              data_nascita: player.data_nascita,
            })),
          website: honeypot,
          _ts: formTimestamp,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Errore durante l'iscrizione" }))
        setSubmitResult({ success: false, message: data.error || "Errore durante l'iscrizione" })
        return
      }

      setSubmitResult({
        success: true,
        message: "Iscrizione ricevuta. Verificheremo il bonifico e ti confermeremo l'iscrizione via email.",
      })
      setFormData({ nome_squadra: "", nome_referente: "", email_referente: "", telefono_referente: "" })
      setPlayers(Array.from({ length: config.maxPlayers }, emptyPlayer))
      setBonificoFile(null)
      if (bonificoPreview) URL.revokeObjectURL(bonificoPreview)
      setBonificoPreview("")
      setBonificoPreviewType("")
      setBonificoUrl("")
      setPrivacyAccepted(false)
      setFormTimestamp(Date.now())
    } catch {
      setSubmitResult({ success: false, message: "Errore di connessione. Riprova tra poco." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const playerLabel = (index: number) => {
    if (index === 0) return "Giocatore 1 - referente della squadra"
    return `Giocatore ${index + 1}`
  }

  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <Navigation />

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_30%_30%,rgba(225,29,72,0.12),transparent_35%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.08),transparent_30%),linear-gradient(180deg,#070a10_0%,#03060b_100%)]" />

      <section className="relative overflow-hidden pt-24 pb-12 sm:pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="overflow-hidden rounded-4xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <div className={`bg-linear-to-r ${config.colore} px-6 py-10 sm:px-10`}>
              <Link href="/torneo-24h" className="mb-6 inline-flex items-center gap-2 text-sm text-white/90 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Torna alla pagina 24 H
              </Link>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-4">
                  <Badge className="w-fit border border-white/15 bg-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white">
                    Iscrizione {config.nome}
                  </Badge>
                  <h1 className="font-ethnocentric text-4xl uppercase leading-none sm:text-5xl lg:text-6xl">
                    {config.nome}
                  </h1>
                  <p className="max-w-2xl text-sm text-white/90 sm:text-base">
                    Compila il modulo con i dati del referente, almeno i giocatori minimi richiesti e la foto del bonifico.
                    L&apos;iscrizione verrà confermata dopo la verifica manuale via email.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/15 bg-black/20 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">Quota</p>
                    <p className="mt-1 font-semibold text-white">{config.quota}</p>
                  </div>
                  <div className="rounded-3xl border border-white/15 bg-black/20 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">Giocatori</p>
                    <p className="mt-1 font-semibold text-white">Massimo {config.maxPlayers}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="space-y-6">
            {submitResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-4 ${submitResult.success ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-rose-500/30 bg-rose-500/10 text-rose-200"}`}
              >
                <div className="flex items-start gap-3 text-sm">
                  {submitResult.success ? <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <Info className="mt-0.5 h-5 w-5 shrink-0" />}
                  <span>{submitResult.message}</span>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Non compilare</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="h-5 w-5 text-primary" />
                    Dati squadra
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Inserisci i dati principali della squadra che si iscrive.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nome_squadra" className="text-slate-300">Nome squadra *</Label>
                    <Input
                      id="nome_squadra"
                      name="nome_squadra"
                      value={formData.nome_squadra}
                      onChange={handleChange}
                      placeholder="Es. Team VBSM"
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nome_referente" className="text-slate-300">Nome referente squadra *</Label>
                    <Input
                      id="nome_referente"
                      name="nome_referente"
                      value={formData.nome_referente}
                      onChange={handleChange}
                      placeholder="Nome e cognome"
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono_referente" className="text-slate-300">Numero di telefono *</Label>
                    <Input
                      id="telefono_referente"
                      name="telefono_referente"
                      value={formData.telefono_referente}
                      onChange={handleChange}
                      placeholder=""
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email_referente" className="text-slate-300">Mail *</Label>
                    <Input
                      id="email_referente"
                      name="email_referente"
                      type="email"
                      value={formData.email_referente}
                      onChange={handleChange}
                      placeholder="info@volleyballsanmartino.it"
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <BadgeCheck className="h-5 w-5 text-primary" />
                        Giocatori
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Inserisci almeno {config.minPlayers} giocatori per {config.nome}.
                      </CardDescription>
                    </div>
                    <Badge className="border border-white/10 bg-white/10 text-white">
                      Min {config.minPlayers} / Max {config.maxPlayers}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {players.map((player, index) => (
                    <div key={index} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-primary">{playerLabel(index)}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{index + 1}/{config.maxPlayers}</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Nome {index < config.minPlayers ? "*" : "(opzionale)"}</Label>
                          <Input
                            value={player.nome}
                            onChange={(e) => handlePlayerChange(index, "nome", e.target.value)}
                            placeholder="Nome"
                            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Cognome {index < config.minPlayers ? "*" : "(opzionale)"}</Label>
                          <Input
                            value={player.cognome}
                            onChange={(e) => handlePlayerChange(index, "cognome", e.target.value)}
                            placeholder="Cognome"
                            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Data di nascita {index < config.minPlayers ? "*" : "(opzionale)"}</Label>
                          <Input
                            type="date"
                            value={player.data_nascita}
                            onChange={(e) => handlePlayerChange(index, "data_nascita", e.target.value)}
                            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CloudUpload className="h-5 w-5 text-primary" />
                    Bonifico da allegare
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Carica una foto o uno screenshot del pagamento. La conferma arriva dopo la verifica manuale.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-3xl border border-primary/20 bg-primary/10 p-4 text-sm text-slate-200">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> IBAN: <span className="font-semibold text-white">IT92J0200866480000100187840</span></div>
                      <div>Intestatario: <span className="font-semibold text-white">VOLLEY BALL SAN MARTINO</span></div>
                      <div>UniCredit</div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Bonifico (foto/pdf) *</Label>
                      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4">
                        <input
                          id="bonifico"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleBonificoChange}
                          className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
                        />
                      </div>
                      <p className="text-xs text-slate-500">Il file viene salvato e usato solo per verificare l&apos;iscrizione.</p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Anteprima</p>
                      <div className="mt-3 aspect-4/3 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        {bonificoPreview ? (
                          bonificoPreviewType === "pdf" ? (
                            <iframe src={bonificoPreview} title="Anteprima bonifico PDF" className="h-full w-full" />
                          ) : (
                            <img loading="lazy" decoding="async" src={bonificoPreview} alt="Anteprima bonifico" className="h-full w-full object-cover" />
                          )
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-500">
                            Nessun file selezionato
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      Caricamento bonifico in corso...
                    </div>
                  )}
                </CardContent>
              </Card>

              <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(event) => setPrivacyAccepted(event.target.checked)}
                  required
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <span>
                  Dichiaro di aver letto la <a href="/privacy" className="text-primary underline">privacy policy</a> e di essere autorizzato a trasmettere i dati dei giocatori indicati per la gestione dell’iscrizione.
                </span>
              </label>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white">
                      <Clock3 className="h-4 w-4 text-primary" />
                      <p className="font-semibold">Invio iscrizione</p>
                    </div>
                    <p className="text-sm text-slate-300">
                      Verificheremo bonifico e dati, poi confermeremo tutto via email.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="rounded-full bg-primary px-8 py-6 text-white shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Invio in corso...
                      </>
                    ) : (
                      <>
                        Invia iscrizione
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <DisciplineIcon className="h-5 w-5 text-primary" />
                  Riepilogo {config.nome}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Programma</p>
                  <ul className="mt-3 space-y-2">
                    {config.programma.slice(0, 3).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Regole principali</p>
                  <ul className="mt-3 space-y-2">
                    {config.regolamento.slice(0, 3).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Mail className="h-5 w-5 text-primary" />
                  Conferma e verifica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <p>L&apos;iscrizione resta in attesa finche&apos; il bonifico non viene controllato.</p>
                <Separator className="bg-white/10" />
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-primary" />
                  <span>Usa una mail che controlli spesso, cosi&apos; possiamo confermare velocemente.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-primary" />
                  <span>Salva il regolamento PDF e condividilo con la tua squadra.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
