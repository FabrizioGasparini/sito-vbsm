"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Trophy, Info, Home, Plane, MapPinHouse, Share2 } from "lucide-react"
import { SOCIETY_ID } from "@/lib/matches-data"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

type APIMatch = {
  id: string
  date: string
  time: string
  location: string
  lat: string
  long: string
  played: boolean
  result: string | null
  sets: string[] | null
  home_setwin: string
  away_setwin: string
  home_team: { title: string; society_id: string; society: string; logo: string; }
  away_team: { title: string; society_id: string; society: string; logo: string; }
}

type APIResponse = Record<string, APIMatch[]>

export default function CalendarioPage() {
  const [data, setData] = useState<APIResponse>({})
  const [campionatoFiltro, setCampionatoFiltro] = useState("Tutti i Campionati")
  const [settimanaFiltro, setSettimanaFiltro] = useState("Tutte le Settimane")
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setApiError(null)
    fetch("/api/fipav")
      .then(async res => {
        const payload: unknown = await res.json()
        if (!res.ok || !payload || typeof payload !== "object" || Array.isArray(payload)) {
          throw new Error("Impossibile caricare il calendario")
        }
        const safeData = Object.fromEntries(
          Object.entries(payload).filter(([, matches]) => Array.isArray(matches))
        ) as APIResponse
        setData(safeData)
      })
      .catch(error => {
        console.error(error)
        setData({})
        setApiError("Il calendario FIPAV non è momentaneamente disponibile.")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const getWeekRange = (dateStr: string) => {
    const parts = dateStr.split("/")
    let date: Date

    if (parts.length === 3 && /^\d{1,4}$/.test(parts[0]) && /^\d{1,4}$/.test(parts[1]) && /^\d{2,4}$/.test(parts[2])) {
      const [day, month, year] = parts
      date = new Date(Number(year), Number(month) - 1, Number(day))
    } else if (parts.length === 2 && /^\d{1,2}$/.test(parts[0]) && /^\d{1,2}$/.test(parts[1])) {
      // se manca l'anno, assume l'anno corrente
      const [day, month] = parts
      const year = new Date().getFullYear()
      date = new Date(Number(year), Number(month) - 1, Number(day))
    } else {
      date = new Date(dateStr)
    }

    if (isNaN(date.getTime())) return dateStr

    // calcola lunedì (1) .. domenica (7)
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay()
    const monday = new Date(date)
    monday.setDate(date.getDate() - (dayOfWeek - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const pad2 = (n: number) => n.toString().padStart(2, "0")
    const fmt = (d: Date) => `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`

    return `${fmt(monday)} - ${fmt(sunday)}`
  }

  const allMatches = Object.entries(data).flatMap(([campionato, matches]) =>
    matches.map(match => ({ ...match, campionato }))
  )


  const filteredMatchesByCampionato =
    campionatoFiltro === "Tutti i Campionati"
      ? allMatches
      : allMatches.filter(m => m.campionato === campionatoFiltro)

  const filteredMatches =
    settimanaFiltro === "Tutte le Settimane"
      ? filteredMatchesByCampionato
      : filteredMatchesByCampionato.filter(m => getWeekRange(m.date) === settimanaFiltro)


  const prossime = filteredMatches.filter(m => !m.played)
  const giocate = filteredMatches.filter(m => m.played)

  const groupedByWeek = prossime.reduce((acc, match) => {
    const week = getWeekRange(match.date)
    if (!acc[week]) acc[week] = []
    acc[week].push(match)
    return acc
  }, {} as Record<string, (APIMatch & { campionato: string })[]>)

  const giocateGroupedByWeek = giocate.reduce((acc, match) => {
    const week = getWeekRange(match.date)
    if (!acc[week]) acc[week] = []
    acc[week].push(match)
    return acc
  }, {} as Record<string, (APIMatch & { campionato: string })[]>)

  const settimaneDisponibili = Array.from(
    new Set(filteredMatchesByCampionato.map(m => getWeekRange(m.date)))
  )
    .filter(Boolean)
    .sort((a, b) => {
      const [aStart] = a.split(" - ")
      const [bStart] = b.split(" - ")
      const [ad, am, ay] = aStart.split("/").map(Number)
      const [bd, bm, by] = bStart.split("/").map(Number)
      return new Date(ay, am - 1, ad).getTime() - new Date(by, bm - 1, bd).getTime()
    })

  const formatDate = (date: string) => {
    const parts = date.split("/")
    let dt: Date

    if (parts.length === 3 && /^\d{1,4}$/.test(parts[0]) && /^\d{1,4}$/.test(parts[1]) && /^\d{2,4}$/.test(parts[2])) {
      // assume format giorno/mese/anno
      const [day, month, year] = parts
      dt = new Date(Number(year), Number(month) - 1, Number(day))
    } else {
      // fallback to JS Date parsing (ISO etc.)
      dt = new Date(date)
    }

    if (isNaN(dt.getTime())) return date // se non valido, ritorna la stringa originale
    return dt.toLocaleDateString("it-IT", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).slice(0, 1).toUpperCase() + dt.toLocaleDateString("it-IT", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).slice(1)
  }

  const MatchCard = ({ match }: { match: APIMatch & { campionato: string } }) => {
    const isHome = match.home_team.society_id === SOCIETY_ID
    const isWin =
      match.played &&
      ((match.result?.startsWith("3") && isHome) ||
        (match.result?.endsWith("3") && !isHome))

    const colorClasses = match.played
      ? isWin
        ? "from-green-300/10 to-green-300/10 border-green-500"
        : "from-red-300/10 to-red-300/10 border-red-500"
      : "from-background/90 to-background/60 border-primary"

    const glowColor = match.played
      ? isWin
        ? "bg-green-400"
        : "bg-red-400"
      : "bg-primary/20"

    const badgeColor = match.played
      ? isWin
        ? "border-green-500 text-green-700"
        : "border-red-500 text-red-700"
      : "border-primary text-primary"

    return (
      <div
        className={`
        relative overflow-hidden w-full
        rounded-4xl border-2 shadow-lg
        transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl
        bg-linear-to-br ${colorClasses}
        before:absolute before:inset-0 before:opacity-5
        before:bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]
      `}
      >

        {/* Glow */}
        <div
          className={`absolute inset-0 blur-3xl opacity-0 hover:opacity-30 transition-opacity duration-700 ${glowColor}`}
        />

        {/* Contenuto */}
        <CardContent className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 font-medium" >
          {/* Data / Ora */}
          <div className="space-y-2 text-sm w-full md:w-1/5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(match.date)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {match.time}
            </div>
          </div>

          {/* Squadre */}
          <div className="text-center space-y-1 flex-1 mx-2 flex flex-col items-center">
            <Badge
              variant="default"
              className={`top-0 mb-3 text-xs font-semibold ${badgeColor}`}
            >
              <span className="text-gray-200">{match.campionato}</span>
            </Badge>
            <div className="text-lg font-semibold leading-tight flex items-center justify-center w-full gap-0 md:gap-10 px-1">
              <span className="flex-1 inline-block max-w-40 overflow-hidden text-ellipsis wrap-break-word [word-break:break-word] whitespace-normal text-right md:text-center">{match.home_team.title.toUpperCase()}</span>
              {match.result ? (
                <div className="text-sm">
                  <span className={`font-bold text-lg`}><span className={`${match.home_setwin > match.away_setwin ? "text-green-600" : "text-red-600"} mx-2 md:ml-0`}>{match.home_setwin}</span> - <span className={`${match.away_setwin > match.home_setwin ? "text-green-600" : "text-red-600"} mx-2 md:mr-0`}>{match.away_setwin}</span></span>
                </div>
              ) : <span className="mx-2 text-muted-foreground w-4">vs</span>}
              <span className="flex-1 inline-block max-w-40 overflow-hidden text-ellipsis wrap-break-word [word-break:break-word] whitespace-normal text-left md:text-center">{match.away_team.title.toUpperCase()}</span>
            </div>
            <div className="text-xs font-light text-gray-400 leading-tight flex items-center justify-center w-full gap-0 md:gap-10 px-1">
              <span className="flex-1 inline-block max-w-40 overflow-hidden text-ellipsis wrap-break-word [word-break:break-word] whitespace-normal text-right md:text-center">{match.home_team.society.toUpperCase()}</span>
              <span className="mx-5" />
              <span className="flex-1 inline-block max-w-40 overflow-hidden text-ellipsis wrap-break-word [word-break:break-word] whitespace-normal text-left md:text-center">{match.away_team.society.toUpperCase()}</span>
            </div>
          </div>

          {/* Luogo e Azioni */}
          <div className="flex flex-col items-end justify-between text-sm gap-3 w-full md:w-1/5">
            <div className="space-y-1 text-right">
              <div className="flex items-center gap-2 justify-end">
                {isHome ? (
                  <Home className="h-4 w-4 text-yellow-300" />
                ) : (
                  <Plane className="h-4 w-4 text-blue-600" />
                )}
                <span>{match.location.split(" - ")[0]}</span>
              </div>
              {match.location.split(" - ")[1] && (
                <div className="flex items-center gap-2 justify-end text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{match.location.split(" - ")[1]}</span>
                </div>
              )}
              {match.location.split(" - ")[2] && (
                <div className="flex items-center gap-2 justify-end text-muted-foreground">
                  <MapPinHouse className="h-4 w-4" />
                  <span>{match.location.split(" - ")[2]}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!match.played ? (
                <Button variant="default" className="flex items-center gap-1" asChild>
                  <MatchDetailsModal match={match} />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className={`flex items-center gap-1 ${isWin
                    ? "border-red-500 text-red-600 hover:bg-red-100/40"
                    : "border-green-500 text-green-600 hover:bg-green-100/40"
                    }`}
                  asChild
                >
                  <MatchRecapModal match={match} />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    )
  }



  const MatchDetailsModal = ({ match }: { match: APIMatch & { campionato: string } }) => {
    const parts = match.location.split(" - ").map(p => p.trim()).filter(Boolean)
    const venue = parts[0] ?? match.location
    const address = parts.slice(1).join(", ")

    const parseToDate = (date: string, time: string) => {
      const parts = date.split("/")
      let dt: Date
      if (parts.length === 3 && /^\d{1,4}$/.test(parts[0])) {
        const [day, month, year] = parts
        const [h = "0", m = "0"] = (time || "").split(":")
        dt = new Date(Number(year), Number(month) - 1, Number(day), Number(h), Number(m))
      } else {
        dt = new Date(`${date} ${time}`)
      }
      return dt
    }

    const pad = (n: number) => n.toString().padStart(2, "0")

    const toCalendarString = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`

    const startDate = parseToDate(match.date, match.time)
    const endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * 2) // durata stimata 2h
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `${match.home_team.title} vs ${match.away_team.title}`
    )}&details=${encodeURIComponent(`${match.campionato} — ${venue}${address ? " — " + address : ""}`)}&location=${encodeURIComponent(
      match.location
    )}&dates=${toCalendarString(startDate)}/${toCalendarString(endDate)}`



    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            aria-label={`Dettagli partita ${match.home_team.title} vs ${match.away_team.title}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 transition-all text-sm font-medium"
          >
            <Info className="h-4 w-4" />
            Dettagli
          </button>
        </DialogTrigger>

        <DialogContent className="backdrop-blur-md bg-background/90 border border-primary/10 shadow-2xl rounded-2xl max-w-xl w-full">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-2 text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                <span className="text-xl">Dettagli Partita</span>
              </div>

              <div className="flex-1 text-ellipsis truncate text-center">{match.home_team.title}</div>
              <div className="mx-2 text-muted-foreground">vs</div>
              <div className="flex-1 text-ellipsis truncate text-center">{match.away_team.title}</div>
            </DialogTitle>
            <div className="w-full flex items-center justify-center mt-2">
              <Badge variant="default" className="text-xs font-semibold">
                <span className="text-gray-200">{match.campionato}</span>
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4 text-sm overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1" />
                <div>
                  <div className="text-xs text-muted-foreground">Data</div>
                  <div className="font-medium">{formatDate(match.date)}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1" />
                <div>
                  <div className="text-xs text-muted-foreground">Luogo</div>
                  <div className="font-medium">{venue}</div>
                  {address ? <div className="text-xs text-muted-foreground">{address}</div> : null}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-1" />
                <div>
                  <div className="text-xs text-muted-foreground">Orario</div>
                  <div className="font-medium">{match.time}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Share2 className="h-4 w-4 mt-1" />
                <div>
                  <div className="text-xs text-muted-foreground">Coordinate</div>
                  <div className="font-medium truncate">{match.lat}, {match.long}</div>
                </div>
              </div>
            </div>

            <div className="flex items-start justify-center gap-2 w-full">
              <div className="w-4" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${match.lat},${match.long}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary/10">
                    <MapPin className="h-4 w-4" />
                    Vedi su Google Maps
                  </Button>
                </a>

                <a href={calendarUrl} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  <Button variant="default" size="sm" className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90">
                    <Calendar className="h-4 w-4" />
                    Aggiungi al calendario
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const MatchRecapModal = ({ match }: { match: APIMatch & { campionato: string } }) => {
    const isHome = match.home_team.society_id === SOCIETY_ID
    const isWin =
      match.result &&
      ((match.result.startsWith("3") && isHome) ||
        (match.result.endsWith("3") && !isHome))

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            aria-label={`Resoconto partita ${match.home_team.title} vs ${match.away_team.title}`}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 transition-all text-sm font-medium
              ${isWin ? "border-green-500 text-green-600 hover:bg-green-50/60" : "border-red-500 text-red-600 hover:bg-red-50/60"}`}
            type="button"
          >
            <Trophy className="h-4 w-4" />
            Resoconto
          </button>
        </DialogTrigger>

        <DialogContent
          className={`backdrop-blur-md bg-background/90 shadow-2xl border rounded-2xl max-w-2xl w-full`}
        >
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-2 text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Trophy className={`h-5 w-5 ${isWin ? "text-green-500" : "text-red-500"}`} />
                <span className="text-xl">Resoconto Partita</span>
              </div>

              <span className="text-ellipsis truncate text-center">{match.home_team.title}</span>
              <span className="mx-2 text-muted-foreground">vs</span>
              <span className="text-ellipsis truncate text-center">{match.away_team.title}</span>

              <p className="text-sm text-muted-foreground mt-1 text-center">{match.campionato}</p>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4 text-sm">
            <div className="flex items-center gap-2 justify-center">
              <Trophy className={`h-4 w-4 ${isWin ? "text-green-500" : "text-red-500"}`} />
              <div>
                <div className="text-xs text-muted-foreground">Risultato</div>
                <div className={`font-bold ${isWin ? "text-green-600" : "text-red-600"}`}>{match.result ?? "N/A"}</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">

              {match.sets && match.sets.length > 0 && (
                <div className="w-full">
                  <div className="text-xs text-muted-foreground text-center mb-2">Set</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 justify-center">
                    {match.sets.map((s, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-3xl border ${isWin ? "border-green-200 bg-green-50/20" : "border-red-200 bg-red-50/20"} text-sm`}
                        aria-label={`Set ${idx + 1}`}
                      >
                        <span className="font-semibold">S{idx + 1}</span>
                        <span className="text-muted-foreground">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }


  return (
    <div className="min-h-screen bg-background">
      <Navigation />


      <section className="relative bg-primary text-primary-foreground py-20 overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-primary/50 to-primary"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 1, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm font-medium uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm">
                Partite e Risultati
              </Badge>
              <h1 className="font-ethnocentric text-4xl lg:text-6xl mb-4 tracking-tight drop-shadow-lg">
                CALENDARIO PARTITE
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl text-primary-foreground/90 max-w-2xl mx-auto text-pretty font-light"
            >
              Segui tutte le partite delle nostre squadre e vivi l’emozione del Volleyball San Martino
            </motion.p>
          </div>
        </div>
      </section>

      {/* Filtro */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Calendario Completo
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm">Filtra per settimana:</span>
            <Select value={settimanaFiltro} onValueChange={setSettimanaFiltro}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tutte le Settimane">Tutte le Settimane</SelectItem>
                {settimaneDisponibili.map(week => (
                  <SelectItem key={week} value={week}>{week}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Filtra per campionato:</span>
            <Select value={campionatoFiltro} onValueChange={setCampionatoFiltro}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tutti i Campionati">Tutti i Campionati</SelectItem>
                {Object.keys(data).sort((a, b) => a.localeCompare(b)).map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Tabs Partite */}
      <section className="py-12 bg-background">
        {isLoading ? (
          (
            <div className="max-w-7xl mx-auto px-4" >
              {
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto mb-6" />
                  </div>
                ))
              }
            </div>
          )
        ) : <>
          <div className="max-w-7xl mx-auto px-4">
            {apiError && (
              <Card className="mb-6 border-amber-500/50">
                <CardContent className="p-6 text-center">
                  <Info className="mx-auto mb-3 h-8 w-8 text-amber-500" />
                  <p className="font-medium">{apiError}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Riprova più tardi per visualizzare le partite.</p>
                </CardContent>
              </Card>
            )}
            <Tabs defaultValue="prossime" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="prossime" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Prossime Partite ({prossime.length})</span>
                </TabsTrigger>
                <TabsTrigger value="risultati" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>Risultati ({giocate.length})</span>
                </TabsTrigger>
              </TabsList>

              {/* Prossime Partite */}
              <TabsContent value="prossime" className="space-y-6">
                {
                  prossime.length > 0 ? (
                    Object.entries(groupedByWeek).map(([week, matches]) => (
                      <div key={week} className="space-y-4">
                        <h3 className="text-lg font-semibold mt-8 mb-4 flex items-center justify-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" /> {week}
                        </h3>
                        {matches.sort((a, b) => {
                          const parseDMY = (d: string) => {
                            const parts = d.split("/")
                            if (parts.length === 3 && /^\d{1,4}$/.test(parts[0])) {
                              const [day, month, year] = parts
                              return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
                            }
                            return new Date(d).getTime()
                          }
                          return parseDMY(a.date) - parseDMY(b.date)
                        }).map(match => (
                          <MatchCard key={match.id} match={match} />
                        ))}
                      </div>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nessuna partita in programma</h3>
                        <p className="text-muted-foreground">Non ci sono partite programmate per il campionato selezionato.</p>
                      </CardContent>
                    </Card>
                  )}
              </TabsContent>

              {/* Risultati */}
              <TabsContent value="risultati" className="space-y-6">
                {giocate.length > 0 ? (
                  Object.entries(giocateGroupedByWeek).map(([week, matches]) => (
                    <div key={week} className="space-y-4">
                      <h3 className="text-lg font-semibold mt-8 mb-4 flex items-center justify-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" /> {week}
                      </h3>
                      {matches.sort((a, b) => {
                        const parseDMY = (d: string) => {
                          const parts = d.split("/")
                          if (parts.length === 3 && /^\d{1,4}$/.test(parts[0])) {
                            const [day, month, year] = parts
                            return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
                          }
                          return new Date(d).getTime()
                        }
                        return parseDMY(a.date) - parseDMY(b.date)
                      }).map(match => (
                        <MatchCard key={match.id} match={match} />
                      ))}
                    </div>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nessun risultato disponibile</h3>
                      <p className="text-muted-foreground">Non ci sono risultati disponibili per il campionato selezionato.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </>
        }
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}