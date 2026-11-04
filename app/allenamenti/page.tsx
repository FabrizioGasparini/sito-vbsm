"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, MapPin, Users, Calendar, User, Dumbbell, School, School2 } from "lucide-react"

const allenamenti = [
  {
    squadra: "S3 White Red Green",
    giorni: ["Lunedì"],
    orario: "16:00 - 19:00",
    palestra: "Palestra Scuole Medie",
    allenatore: "Camilla Gallingani",
    assistente: "Giulia Iotti | Giulia Paterlini",
    descrizione: "Allenamenti ludici per avvicinare i più piccoli alla pallavolo",
    colore: "bg-pink-900",
  },
  {
    squadra: "S3 White Red Green",
    giorni: ["Mercoledì"],
    orario: "16:00 - 19:00",
    palestra: "Palestra Bombonera",
    allenatore: "Camilla Gallingani",
    assistente: "Giulia Iotti | Giulia Paterlini",
    descrizione: "Allenamenti ludici per avvicinare i più piccoli alla pallavolo",
    colore: "bg-pink-900",
  },
  {
    squadra: "Under 12",
    giorni: ["Giovedì"],
    orario: "17:00 - 18:30",
    palestra: "Palestra Scuole Elementari",
    allenatore: "Giulia Iotti",
    assistente: "Nellusco Bonori",
    descrizione: "Allenamenti tecnici per sviluppare le basi della pallavolo",
    colore: "bg-secondary",
  },
  {
    squadra: "Under 13",
    giorni: ["Lunedì"],
    orario: "17:00 - 18:30",
    palestra: "Palestra Scuole Elementari",
    allenatore: "Giorgio Bezzecchi",
    assistente: "Paolo Neviani",
    descrizione: "Allenamenti tecnici per sviluppare le basi della pallavolo",
    colore: "bg-purple-500",
  },
  {
    squadra: "Under 13",
    giorni: ["Martedì"],
    orario: "16:00 - 17:30",
    palestra: "Palestra Scuole Medie",
    allenatore: "Giorgio Bezzecchi",
    assistente: "Paolo Neviani",
    descrizione: "Allenamenti tecnici per sviluppare le basi della pallavolo",
    colore: "bg-purple-500",
  },
  {
    squadra: "Under 13",
    giorni: ["Giovedì"],
    orario: "17:00 - 18:45",
    palestra: "Palestra Bombonera",
    allenatore: "Giorgio Bezzecchi",
    assistente: "Paolo Neviani",
    descrizione: "Allenamenti tecnici per sviluppare le basi della pallavolo",
    colore: "bg-purple-500",
  },
  {
    squadra: "Under 14",
    giorni: ["Lunedì"],
    orario: "16:00 - 17:30",
    palestra: "Palestra Bombonera",
    allenatore: "Federico Monaco",
    assistente: "Nellusco Bonori",
    descrizione: "Allenamenti mirati per migliorare tecnica e tattica di gioco",
    colore: "bg-yellow-700",
  },
  {
    squadra: "Under 14",
    giorni: ["Mercoledì"],
    orario: "17:00 - 18:30",
    palestra: "Palestra Scuole Elementari",
    allenatore: "Federico Monaco",
    assistente: "Nellusco Bonori",
    descrizione: "Allenamenti mirati per migliorare tecnica e tattica di gioco",
    colore: "bg-yellow-700",
  },
  {
    squadra: "Under 14",
    giorni: ["Venerdì"],
    orario: "17:00 - 18:30",
    palestra: "Palestra Scuole Medie",
    allenatore: "Federico Monaco",
    assistente: "Nellusco Bonori",
    descrizione: "Allenamenti mirati per migliorare tecnica e tattica di gioco",
    colore: "bg-yellow-700",
  },
  {
    squadra: "Under 15",
    giorni: ["Martedì"],
    orario: "16:00 - 19:00",
    palestra: "Palestra Bombonera",
    allenatore: "Gianni Fantini",
    assistente: "Alessandro Vezzani",
    descrizione: "Allenamenti intensivi per preparare i ragazzi alle competizioni",
    colore: "bg-red-900",
  },
  {
    squadra: "Under 15",
    giorni: ["Mercoledì"],
    orario: "16:00 - 17:30",
    palestra: "Palestra Scuole Medie",
    allenatore: "Gianni Fantini",
    assistente: "Alessandro Vezzani",
    descrizione: "Allenamenti intensivi per preparare i ragazzi alle competizioni",
    colore: "bg-red-900",
  },
  {
    squadra: "Under 15",
    giorni: ["Venerdì"],
    orario: "16:00 - 18:00",
    palestra: "Palestra Bombonera",
    allenatore: "Gianni Fantini",
    assistente: "Alessandro Vezzani",
    descrizione: "Allenamenti intensivi per preparare i ragazzi alle competizioni",
    colore: "bg-red-900",
  },
  {
    squadra: "Under 16",
    giorni: ["Lunedì"],
    orario: "19:00 - 20:30",
    palestra: "Palestra Bombonera",
    allenatore: "Catia Cattini",
    assistente: "Ilenia Sacchetti",
    descrizione: "Allenamenti avanzati per affinare tecnica e strategia di gioco",
    colore: "bg-muted",
  },
  {
    squadra: "Under 16",
    giorni: ["Mercoledì", "Giovedì"],
    orario: "17:30 - 19:00",
    palestra: "Palestra Scuole Medie",
    allenatore: "Catia Cattini",
    assistente: "Ilenia Sacchetti",
    descrizione: "Allenamenti avanzati per affinare tecnica e strategia di gioco",
    colore: "bg-muted",
  },
  {
    squadra: "Under 18 / Prima Divisione Femminile",
    giorni: ["Lunedì"],
    orario: "17:30 - 19:00",
    palestra: "Palestra Bombonera",
    allenatore: "Catia Cattini",
    assistente: "",
    descrizione: "Allenamenti intensivi per preparare le atlete alle competizioni di alto livello",
    colore: "bg-purple-900",
  },
  {
    squadra: "Under 18 / Prima Divisione Femminile",
    giorni: ["Mercoledì", "Giovedì"],
    orario: "19:00 - 20:30",
    palestra: "Palestra Scuole Medie",
    allenatore: "Catia Cattini",
    assistente: "Ilenia Sacchetti",
    descrizione: "Allenamenti avanzati per affinare tecnica e strategia di gioco",
    colore: "bg-purple-900",
  },
  {
    squadra: "Under 18 CSI",
    giorni: ["Lunedì", "Giovedì"],
    orario: "19:00 - 20:30",
    palestra: "Palestra Scuole Elementari",
    allenatore: "Giorgio Bezzecchi",
    assistente: "Paolo Neviani",
    descrizione: "Allenamenti avanzati per affinare tecnica e strategia di gioco",
    colore: "bg-primary",
  },
  {
    squadra: "Under 18 CSI",
    giorni: ["Martedì"],
    orario: "17:30 - 19:00",
    palestra: "Palestra Scuole Medie",
    allenatore: "Giorgio Bezzecchi",
    assistente: "Paolo Neviani",
    descrizione: "Allenamenti avanzati per affinare tecnica e strategia di gioco",
    colore: "bg-primary",
  },
  {
    squadra: "Under 19",
    giorni: ["Martedì"],
    orario: "19:00 - 20:30",
    palestra: "Palestra Bombonera",
    allenatore: "Alberto Iotti",
    assistente: "Alessandro Vezzani",
    descrizione: "Allenamenti intensivi per preparare i ragazzi alle competizioni",
    colore: "bg-secondary",
  },
  {
    squadra: "Under 19",
    giorni: ["Venerdì"],
    orario: "18:30 - 20:15",
    palestra: "Palestra Scuole Medie",
    allenatore: "Alberto Iotti",
    assistente: "Alessandro Vezzani",
    descrizione: "Allenamenti intensivi per preparare i ragazzi alle competizioni",
    colore: "bg-secondary",
  },
  {
    squadra: "Prima Divisione Maschile",
    giorni: ["Lunedì"],
    orario: "19:00 - 20:30",
    palestra: "Palestra Scuole Medie",
    allenatore: "Claudio Caselli",
    assistente: "Cristian Gasparini",
    descrizione: "Allenamenti serali per giocatori amatoriali che vogliono mantenersi in forma",
    colore: "bg-secondary",
  },
  {
    squadra: "Prima Divisione Maschile",
    giorni: ["Mercoledì"],
    orario: "19:00 - 20:30",
    palestra: "Palestra Bombonera",
    allenatore: "Claudio Caselli",
    assistente: "Cristian Gasparini",
    descrizione: "Allenamenti serali per giocatori amatoriali che vogliono mantenersi in forma",
    colore: "bg-secondary",
  },
  {
    squadra: "Terza Divisione Femminile",
    giorni: ["Martedì"],
    orario: "19:00 - 20:30",
    palestra: "Palestra Scuole Medie",
    allenatore: "Ilenia Sacchetti",
    assistente: "",
    descrizione: "Allenamenti serali per giocatrici amatoriali che vogliono mantenersi in forma",
    colore: "bg-purple-600",
  },
  {
    squadra: "Terza Divisione Femminile",
    giorni: ["Mercoledì"],
    orario: "19:00 - 20:30",
    palestra: "Palestra Scuole Elementari",
    allenatore: "Ilenia Sacchetti",
    assistente: "",
    descrizione: "Allenamenti serali per giocatrici amatoriali che vogliono mantenersi in forma",
    colore: "bg-purple-600",
  },
  {
    squadra: "Misto Amatoriale",
    giorni: ["Martedì"],
    orario: "20:30 - 22:30",
    palestra: "Palestra Scuole Medie",
    allenatore: "Alessandro Vezzani",
    assistente: "",
    descrizione: "Allenamenti serali per adulti di tutti i livelli che vogliono divertirsi giocando a pallavolo",
    colore: "bg-accent",
  },
  {
    squadra: "Misto Amatoriale",
    giorni: ["Giovedì"],
    orario: "20:30 - 22:30",
    palestra: "Palestra Scuole Elementari",
    allenatore: "Alessandro Vezzani",
    assistente: "",
    descrizione: "Allenamenti serali per adulti di tutti i livelli che vogliono divertirsi giocando a pallavolo",
    colore: "bg-accent",
  },
  {
    squadra: "Serie D Femminile",
    giorni: ["Lunedì"],
    orario: "20:30 - 22:30",
    palestra: "Palestra Scuole Elementari",
    allenatore: "Giazzi ?",
    assistente: "",
    descrizione: "Allenamenti serali per atlete competitive che partecipano a campionati di alto livello",
    colore: "bg-secondary",
  },
  {
    squadra: "Serie D Femminile",
    giorni: ["Mercoledì"],
    orario: "20:30 - 22:30",
    palestra: "Palestra Scuole Medie",
    allenatore: "Giazzi ?",
    assistente: "",
    descrizione: "Allenamenti serali per atlete competitive che partecipano a campionati di alto livello",
    colore: "bg-secondary",
  },
  {
    squadra: "Serie D Femminile",
    giorni: ["Giovedì"],
    orario: "18:45 - 20:30",
    palestra: "Palestra Bombonera",
    allenatore: "Giazzi ?",
    assistente: "",
    descrizione: "Allenamenti serali per atlete competitive che partecipano a campionati di alto livello",
    colore: "bg-secondary",
  },
  {
    squadra: "Serie C Femminile",
    giorni: ["Lunedì", "Mercoledì"],
    orario: "20:30 - 22:30",
    palestra: "Palestra Bombonera",
    allenatore: "Antonella ?",
    assistente: "",
    descrizione: "Allenamenti serali per atlete competitive che partecipano a campionati di alto livello",
    colore: "bg-primary",
  },
  {
    squadra: "Serie C Femminile",
    giorni: ["Giovedì"],
    orario: "20:30 - 22:30",
    palestra: "Palestra Scuole Medie",
    allenatore: "Antonella ?",
    assistente: "",
    descrizione: "Allenamenti serali per atlete competitive che partecipano a campionati di alto livello",
    colore: "bg-primary",
  },
  {
    squadra: "Serie C Maschile",
    giorni: ["Lunedì"],
    orario: "20:30 - 22:30",
    palestra: "Palestra Scuole Medie",
    allenatore: "Marco Barozzi",
    assistente: "",
    descrizione: "Allenamenti serali per atleti competitivi che partecipano a campionati di alto livello",
    colore: "bg-primary",
  },
  {
    squadra: "Serie C Maschile",
    giorni: ["Martedì", "Giovedì"],
    orario: "20:30 - 22:30",
    palestra: "Palestra Bombonera",
    allenatore: "Marco Barozzi",
    assistente: "",
    descrizione: "Allenamenti serali per atleti competitivi che partecipano a campionati di alto livello",
    colore: "bg-primary",
  },
]


const squadreOptions = ["Tutte le Squadre", ...allenamenti.map((a) => a.squadra).filter((v, i, a) => a.indexOf(v) === i)]

const giorniSettimana = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"]

export default function AllenamentiPage() {
  const [squadraFiltro, setSquadraFiltro] = useState("Tutte le Squadre")

  const allenamentiFiltrati = allenamenti.filter(
    (allenamento) => squadraFiltro === "Tutte le Squadre" || allenamento.squadra === squadraFiltro,
  )

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-ethnocentric text-3xl md:text-4xl lg:text-5xl mb-4">ORARI ALLENAMENTI</h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto text-pretty">
              Consulta gli orari di allenamento di tutte le nostre squadre e trova il gruppo perfetto per te
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-background border-b hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-2xl font-semibold">Programma Settimanale</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Filtra per squadra:</span>
              <Select value={squadraFiltro} onValueChange={setSquadraFiltro}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {squadreOptions.map((squadra) => (
                    <SelectItem key={squadra} value={squadra}>
                      {squadra}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Training Schedule */}
      <section className="py-16 bg-background hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {allenamentiFiltrati.map((allenamento, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                    {/* Squadra */}
                    <div className="space-y-2">
                      <Badge className={`${allenamento.colore} text-white mb-2`}>{allenamento.squadra}</Badge>
                      <p className="text-sm text-muted-foreground text-pretty">{allenamento.descrizione}</p>
                    </div>

                    {/* Orari */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{allenamento.giorni.join(", ")}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{allenamento.orario}</span>
                      </div>
                    </div>

                    {/* Luogo */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{allenamento.palestra}</span>
                      </div>
                    </div>

                    {/* Staff */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{allenamento.allenatore}</span>
                      </div>
                      {allenamento.assistente && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{allenamento.assistente}</span>
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                        Contatta Staff
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Calendar View */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-ethnocentric text-3xl lg:text-4xl mb-4 text-primary">CALENDARIO SETTIMANALE</h2>
            <p className="text-lg text-muted-foreground">Vista d'insieme di tutti gli allenamenti della settimana divisi per palestra</p>
          </div>

          <div className="overflow-x-auto">
            {/* Raggruppa allenamenti per palestra */}
            {Array.from(
              new Set(allenamenti.map((a) => a.palestra))
            ).sort().map((palestra) => (
              <div key={palestra} className="mb-10">
                <div className="text-xl font-bold text-primary mb-4 text-left">{palestra}</div>
                <div className="min-w-[900px] grid grid-cols-5 gap-4">
                  {giorniSettimana.map((giorno) => {
                    // Filtra allenamenti per giorno e palestra
                    const allenamentiGiorno = allenamenti
                      .filter((a) => a.giorni.includes(giorno) && a.palestra === palestra)
                      .sort((a, b) => {
                        // Ordina per orario di inizio
                        const getStart = (orario: string) => {
                          const match = orario.match(/^(\d{2}):(\d{2})/)
                          return match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0
                        }
                        return getStart(a.orario) - getStart(b.orario)
                      })

                    return (
                      <div key={giorno} className="bg-background rounded-lg shadow p-2 flex flex-col min-h-[200px]">
                        <div className="text-center font-bold text-primary mb-2">{giorno}</div>
                        <div className="flex-1 flex flex-col gap-2">
                          {allenamentiGiorno.length > 0 ? (
                            allenamentiGiorno.map((allenamento, idx) => (
                              <div
                                key={idx}
                                className={`rounded-md p-2 text-xs flex flex-col gap-1 border ${allenamento.colore} border-opacity-30 bg-muted/50`}
                              >
                                <span className="font-semibold">{allenamento.squadra}</span>
                                <span className="text-muted-foreground">{allenamento.orario}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-sm text-muted-foreground py-8">Nessun allenamento</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Vuoi Unirti a Noi?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Cerchi una squadra dove allenarti? Contattaci per una prova e scopri il gruppo più adatto a
                  te!
                </p>
                <Button className="w-full">Richiedi Prova</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Le Nostre Strutture</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Dumbbell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Palestra Bombonera</div>
                      <div className="text-sm text-muted-foreground">Piazza V. Carnevali, 1</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <School2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Palestra Scuole Medie</div>
                      <div className="text-sm text-muted-foreground">Via Vasco Scaltriti, 13</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <School className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Palestra Scuole Elementari</div>
                      <div className="text-sm text-muted-foreground">Via Rivone, 23</div>
                    </div>
                  </div>
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
