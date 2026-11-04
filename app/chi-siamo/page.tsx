"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { motion } from "framer-motion"

const storia = [
  {
    anno: "1984",
    evento: "Fondazione della Società",
    descrizione: "Nasce il Volleyball San Martino con l'obiettivo di promuovere la pallavolo nel territorio",
  },
  {
    anno: "Giugno 2025",
    evento: "Serie B",
    descrizione: "La Serie C Maschile ottiene la promozione in Serie B, diventando la seconda Serie B Maschile a San Martino",
  },
  {
    anno: "Agosto 2025",
    evento: "Cambio di Presidenza",
    descrizione: "Cambio al vertice della società con l'elezione di un nuovo presidente, Roberto Intonti",
  },
  {
    anno: "2025",
    evento: "Oggi",
    descrizione: "17 squadre attive, oltre 220 atleti e una grande famiglia sportiva",
  },
]

const staff = [
  {
    nome: "Roberto Intonti",
    ruolo: "Presidente / Direttore Sportivo",
    descrizione: "Guida la società con passione e dedizione",
    immagine: "/images/2025-26/pages/chi-siamo/presidente.webp",
    large: true,
  },
  {
    nome: "Enrico Ruozzi",
    ruolo: "Vice Presidente",
    descrizione: "Supporta il presidente nelle decisioni strategiche",
    immagine: "/images/2025-26/pages/chi-siamo/vice-presidente.webp",
    large: true,
  },
  {
    nome: "Alberto Iotti",
    ruolo: "Direttore Tecnico Maschile",
    descrizione: "Coordina l'attività delle squadre maschili",
    immagine: "/images/2025-26/pages/chi-siamo/direttore-tecnico-maschile.webp",
  },
  {
    nome: "Catia Cattini",
    ruolo: "Direttrice Tecnica Femminile",
    descrizione: "Coordina l'attività delle squadre femminili",
    immagine: "/images/2025-26/pages/chi-siamo/direttore-tecnico-femminile.webp",
  },
  {
    nome: "Erio Cavazzoni",
    ruolo: "Dirigente Maschile",
    descrizione: "Assiste il direttore tecnico maschile nella gestione delle squadre",
    immagine: "/images/2025-26/pages/chi-siamo/dirigente-maschile.webp",
  },
  {
    nome: "Antonella Iannicello",
    ruolo: "Dirigente Femminile",
    descrizione: "Assiste il direttore tecnico femminile nella gestione delle squadre",
    immagine: "/images/2025-26/pages/chi-siamo/dirigente-femminile.webp",
  },
]

/*const valori = [
  {
    icona: Heart,
    titolo: "Passione",
    descrizione: "L'amore per la pallavolo è il motore che ci spinge ogni giorno a dare il massimo",
  },
  {
    icona: Users,
    titolo: "Famiglia",
    descrizione: "Creiamo un ambiente accogliente dove ogni atleta si sente parte di una grande famiglia",
  },
  {
    icona: Target,
    titolo: "Crescita",
    descrizione: "Puntiamo allo sviluppo completo della persona, non solo dell'atleta",
  },
  {
    icona: Trophy,
    titolo: "Eccellenza",
    descrizione: "Cerchiamo sempre di migliorare e raggiungere nuovi traguardi sportivi",
  },
]
*/

const pdfUrl = "/pdfs/nuovo-logo-vbsm.pdf"

export default function ChiSiamoPage() {
  return (
    <div className="min-h-screen">
      <Navigation />


      {/* Hero Section */}
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
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm font-medium uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm">
                La Nostra Storia e il Nostro Team
              </Badge>
              <h1 className="font-ethnocentric text-4xl lg:text-6xl mb-4 tracking-tight drop-shadow-lg">
                CHI SIAMO
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl text-primary-foreground/90 max-w-2xl mx-auto text-pretty font-light"
            >
              Scopri la storia, i valori e le persone che rendono speciale il Volleyball San Martino
            </motion.p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-ethnocentric text-3xl lg:text-4xl mb-6 text-primary">LA NOSTRA MISSIONE</h2>
              <p className="text-lg text-muted-foreground mb-6 text-pretty">
                Il Volleyball San Martino è molto più di una società sportiva: siamo una comunità che crede nel potere
                educativo e formativo dello sport. Dal 1984 promuoviamo i valori della pallavolo, creando opportunità di
                crescita per atleti di tutte le età.
              </p>
              <p className="text-lg text-muted-foreground mb-8 text-pretty">
                Il nostro obiettivo è formare non solo campioni sul campo, ma anche persone migliori nella vita,
                attraverso l'insegnamento del rispetto, della disciplina e dello spirito di squadra.
              </p>
              <Button size="lg">Unisciti a Noi</Button>
            </div>
            <div className="relative">
              <img
                src="/images/2025-26/pages/promozione.webp"
                alt="La famiglia Volleyball San Martino"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>


      {/* History Timeline */}
      <section className="py-16 bg-background hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-ethnocentric text-3xl lg:text-4xl mb-4 text-primary">LA NOSTRA STORIA</h2>
            <p className="text-lg text-muted-foreground">Un percorso di crescita lungo quasi 40 anni</p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary/20"></div>
            <div className="space-y-12">
              {storia.map((evento, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-primary text-primary-foreground">{evento.anno}</Badge>
                          <CardTitle className="text-lg">{evento.evento}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-pretty">{evento.descrizione}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Staff */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-ethnocentric text-3xl lg:text-4xl mb-4 text-primary">IL NOSTRO STAFF</h2>
            <p className="text-lg text-muted-foreground">Le persone che guidano la nostra società</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {staff.map((membro, index) => (
              <Card
                key={index}
                className={`text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 py-0 ${membro.large ? "md:col-span-2 lg:col-span-2" : ""}`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
                  <img
                    src={membro.immagine || "/placeholder.svg"}
                    alt={membro.nome}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{membro.nome}</CardTitle>
                  <CardDescription className="text-primary font-medium">{membro.ruolo}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground text-pretty">{membro.descrizione}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PDF Section */}
      <section className="py-16 bg-background flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                <FileText className="h-6 w-6" />
                Documento Ufficiale – Nuovo Logo VBSM
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-pretty leading-relaxed">
                In questo documento troverai la spiegazione completa del nuovo logo della società, realizzato da Nicolò Bertolotti (<a href="https://www.instagram.com/nb.comics/" target="_blank" className="text-volleyball-coral underline hover:text-primary">NB comics</a>):
                il suo significato simbolico, la scelta cromatica e il legame con i valori e la storia
                del Volleyball San Martino.
              </p>

              {/* Visualizzatore PDF */}
              <div className="border rounded-lg overflow-hidden shadow-inner hidden md:block">
                <iframe
                  src={pdfUrl}
                  className="w-full h-[800px]"
                  title="Spiegazione Nuovo Logo VBSM"
                ></iframe>
              </div>

              <div className="flex justify-center pt-6">
                <Button asChild className="flex items-center gap-2">
                  <a href={pdfUrl} download>
                    <Download className="h-4 w-4" />
                    Scarica il PDF
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-ethnocentric text-3xl lg:text-4xl mb-4 text-primary">I NOSTRI NUMERI</h2>
            <p className="text-lg text-muted-foreground">Quello che abbiamo costruito insieme</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">41</div>
              <div className="text-sm text-muted-foreground">Anni di Storia</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">300</div>
              <div className="text-sm text-muted-foreground">Atleti Attivi</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">19</div>
              <div className="text-sm text-muted-foreground">Campionati</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">25</div>
              <div className="text-sm text-muted-foreground">Trofei Vinti</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
