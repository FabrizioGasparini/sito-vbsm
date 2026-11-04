"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Phone, Mail, Clock, Users, Calendar, Dumbbell, School2, School } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

const contatti = [
  {
    tipo: "Presidente",
    nome: "Roberto Intonti",
    telefono: "+39 3534862102",
    email: "vbsmcampionati@gmail.com",
    icona: Calendar,
  },
  {
    icona: Users,
    tipo: "Segreteria",
    nome: "Rosanna Foglia",
    email: "vbsm@libero.it",
    orari: "Lun: 18.30 - 20.30",
  },
]

export default function ContattiPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefono: "",
    oggetto: "",
    messaggio: "",
  })
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [formStatus, setFormStatus] = useState<{ type: "error" | "success"; message: string } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, oggetto: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!privacyAccepted) return
    if (!formData.oggetto) {
      setFormStatus({ type: "error", message: "Seleziona l'oggetto del messaggio." })
      document.getElementById("oggetto")?.focus()
      return
    }
    // resetta il form
    setFormData({
      nome: "",
      email: "",
      telefono: "",
      oggetto: "",
      messaggio: "",
    })
    setPrivacyAccepted(false)

    // invia mail via mailto (apre il client di posta dell'utente con i campi precompilati)
    const recipient = "vbsmcampionati@gmail.com"
    const subject = `${formData.oggetto || "Contatto"} - Messaggio da ${formData.nome || formData.email}`
    const body = [
      `Nome: ${formData.nome || "-"}`,
      `Email: ${formData.email || "-"}`,
      `Telefono: ${formData.telefono || "-"}`,
      "",
      formData.messaggio || "-",
    ].join("\n")

    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    setFormStatus({
      type: "success",
      message: `Abbiamo aperto il tuo programma di posta con il messaggio già compilato: premi "Invia" per completare. Se non si è aperto, scrivici direttamente a ${recipient}.`,
    })
  }

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
              initial={{ opacity: 1, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm font-medium uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm">
                I nostri contatti
              </Badge>
              <h1 className="font-ethnocentric text-4xl lg:text-6xl mb-4 tracking-tight drop-shadow-lg">
                CONTATTI
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl text-primary-foreground/90 max-w-2xl mx-auto text-pretty font-light"
            >
              Hai domande o vuoi unirti alla nostra famiglia? Contattaci, saremo felici di risponderti
            </motion.p>
          </div>
        </div>
      </section>


      {/* Contact Cards */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-ethnocentric text-3xl lg:text-4xl mb-4 text-primary">COME RAGGIUNGERCI</h2>
            <p className="text-lg text-muted-foreground">Scegli il contatto più adatto alle tue esigenze</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 md:gap-6 justify-center">
            {contatti.map((contatto, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-[350px] ">
                <CardHeader className="text-center">
                  {
                    contatto.icona &&
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <contatto.icona className="h-6 w-6 text-primary" />
                    </div>
                  }
                  <CardTitle className="text-lg">{contatto.tipo}</CardTitle>
                  <CardDescription className="font-medium">{contatto.nome}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {
                    contatto.telefono &&
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${contatto.telefono}`} className="text-sm underline">{contatto.telefono}</a>
                    </div>
                  }
                  {
                    contatto.orari &&
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contatto.orari}</span>
                    </div>}
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${contatto.email}`} className="text-sm break-all underline">{contatto.email}</a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-ethnocentric text-3xl lg:text-4xl mb-4 text-primary">SCRIVICI</h2>
            <p className="text-lg text-muted-foreground">Compila il form e ti risponderemo il prima possibile</p>
          </div>
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome e Cognome *</Label>
                    <Input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      placeholder="Il tuo nome completo"
                      required
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="la-tua-email@esempio.com"
                      required
                      className="bg-secondary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Telefono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      autoComplete="tel"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="+39 123 456 7890"
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oggetto">Oggetto *</Label>
                    <Select value={formData.oggetto} onValueChange={handleSelectChange} >
                      <SelectTrigger id="oggetto" aria-required="true" className="bg-secondary w-full">
                        <SelectValue placeholder="Seleziona l'oggetto" />
                      </SelectTrigger>
                      <SelectContent className="bg-secondary">
                        <SelectItem value="informazioni-generali">Informazioni Generali</SelectItem>
                        <SelectItem value="iscrizione-squadra">Iscrizione a una Squadra</SelectItem>
                        <SelectItem value="prova">Richiesta Prova</SelectItem>
                        <SelectItem value="settore-giovanile">Settore Giovanile</SelectItem>
                        <SelectItem value="squadre-senior">Squadre Senior</SelectItem>
                        <SelectItem value="sponsorizzazioni">Sponsorizzazioni</SelectItem>
                        <SelectItem value="altro">Altro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="messaggio">Messaggio *</Label>
                  <Textarea
                    id="messaggio"
                    name="messaggio"
                    value={formData.messaggio}
                    onChange={handleInputChange}
                    placeholder="Scrivi qui il tuo messaggio..."
                    rows={6}
                    required
                    className="bg-secondary"
                  />
                </div>
                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(event) => setPrivacyAccepted(event.target.checked)}
                    required
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span>
                    Dichiaro di aver letto la <a href="/privacy" className="text-primary underline">privacy policy</a> e acconsento al trattamento dei dati necessari per rispondere alla richiesta.
                  </span>
                </label>
                <div role="status" aria-live="polite">
                  {formStatus && (
                    <p className={formStatus.type === "error" ? "rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" : "rounded-md border border-green-600/30 bg-green-600/10 p-3 text-sm text-green-800"}>
                      {formStatus.message}
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <Button type="submit" size="lg" className="w-full md:w-auto">
                    Invia Messaggio
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-ethnocentric text-3xl lg:text-4xl mb-4 text-primary">LE NOSTRE PALESTRE</h2>
            <p className="text-lg text-muted-foreground">Dove si svolgono i nostri allenamenti e partite casalinghe</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <span>Palestra Bombonera</span>
                </CardTitle>
                <CardDescription>Piazza V. Carnevali, 1</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  La nostra palestra principale, dove si svolgono la maggior parte degli allenamenti e delle partite
                  casalinghe.
                </p>
                <Button variant="outline" size="sm" onClick={() => window.open("https://maps.app.goo.gl/UgC7gkjFung7YARU6", "_blank")}>
                  Vedi Mappa
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <School2 className="h-5 w-5 text-primary" />
                  <span>Palestra Scuole Medie</span>
                </CardTitle>
                <CardDescription>Via Vasco Scaltriti, 13</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Palestra secondaria utilizzata principalmente per gli allenamenti delle categorie giovanili.
                </p>
                <Button variant="outline" size="sm" onClick={() => window.open("https://maps.app.goo.gl/pG8pnKMbBLmZ7yfH7", "_blank")}>
                  Vedi Mappa
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <School className="h-5 w-5 text-primary" />
                  <span>Palestra Scuole Elementari</span>
                </CardTitle>
                <CardDescription>Via Rivone, 23</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  La palestra più piccola, utilizzata per le attività delle categorie giovanili e dalla scuola primaria.
                </p>
                <Button variant="outline" size="sm" onClick={() => window.open("https://maps.app.goo.gl/Dq2NkTaoiiRty1m8A", "_blank")}>
                  Vedi Mappa
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30 hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-ethnocentric text-3xl lg:text-4xl mb-4 text-primary">DOMANDE FREQUENTI</h2>
            <p className="text-lg text-muted-foreground">Le risposte alle domande più comuni</p>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Come posso iscrivermi a una squadra?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Puoi contattare direttamente la segreteria o il responsabile del settore di tuo interesse. Vieni in palestra
                  a provare per valutare il tuo livello e trovare il gruppo più adatto a te.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quali sono i costi di iscrizione?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  I costi variano in base alla categoria e includono tessera federale e assicurazione.
                  Contattaci per informazioni dettagliate sui prezzi delle singole squadre.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Serve esperienza per iniziare?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No, accogliamo atleti di tutti i livelli. Abbiamo programmi specifici per principianti e i nostri
                  allenatori sono specializzati nell’insegnamento delle basi della pallavolo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
