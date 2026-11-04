"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Handshake } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion } from "framer-motion"

const sponsorPrincipali = [
  {
    nome: "AMA",
    categoria: "",
    logo: "ama-logo.svg",
    descrizione: "",
    contributo: ""
  },
  {
    nome: "Sea di Ladurini",
    categoria: "",
    logo: "sea-di-ladurini-logo.svg",
    descrizione: "",
    contributo: ""
  },
  {
    nome: "Pizzeria La Regina",
    categoria: "",
    logo: "pizzeria-la-regina-logo.webp",
    descrizione: "",
  },
  {
    nome: "Pizzeria 280 Grammi",
    categoria: "",
    logo: "pizzeria-280-grammi-logo.webp",
    descrizione: "",
  },
  {
    nome: "Pizzeria Blu Notte",
    categoria: "",
    logo: "pizzeria-blu-notte-logo.svg",
    descrizione: "",
  },
  {
    nome: "Dallari Volley",
    categoria: "",
    logo: "dallari-volley-logo.webp",
    descrizione: "",
  },
  {
    nome: "Bar Black or White",
    categoria: "",
    logo: "black-or-white-logo.svg",
    descrizione: "",
  },
  {
    nome: "R.D.F Rettifica",
    categoria: "",
    logo: "rdf-rettifica-logo.webp",
    descrizione: "",
  },
  {
    nome: "MonkeyDu",
    categoria: "",
    logo: "monkeydu-logo.webp",
    descrizione: "",
  },
  {
    nome: "Doc-LineaMed",
    categoria: "",
    logo: "doc-lineamed-logo.webp",
    descrizione: "",
  },
  {
    nome: "PaglianiGroup",
    categoria: "",
    logo: "paglianigroup-logo.webp",
    descrizione: "",
  },
  {
    nome: "OCL Lavanderia",
    categoria: "",
    logo: "ocl-lavanderia-logo.webp",
    descrizione: "",
  },
  {
    nome: "Panificio Melli",
    categoria: "",
    logo: "panificio-melli-logo.webp",
    descrizione: "",
  },
  {
    nome: "Salumificio San Martino",
    categoria: "",
    logo: "salumificio-san-martino-logo.webp",
    descrizione: "",
  },
  {
    nome: "Cartolibreria Punto e Virgola",
    categoria: "",
    logo: "cartolibreria-punto-e-virgola-logo.webp",
    descrizione: "",
  },
  {
    nome: "didiemme",
    categoria: "",
    logo: "didiemme-logo.webp",
    descrizione: "",
  },
  {
    nome: "Forti & Forti",
    categoria: "",
    logo: "forti-logo.webp",
    descrizione: "",
  },
  {
    nome: "Legali in Villa",
    categoria: "",
    logo: "legali-in-villa-logo.webp",
    descrizione: "",
  },
]

export default function SponsorPage() {
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
                I partners del Volleyball San Martino
              </Badge>
              <h1 className="font-ethnocentric text-4xl lg:text-6xl mb-4 tracking-tight drop-shadow-lg">
                I NOSTRI SPONSOR
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl text-primary-foreground/90 max-w-2xl mx-auto text-pretty font-light"
            >
              Grazie ai nostri partner che credono nei valori dello sport e sostengono la crescita del Volleyball San Martino
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Sponsors */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-ethnocentric text-3xl lg:text-4xl mb-4 text-primary">SPONSOR PRINCIPALI</h2>
            <p className="text-lg text-muted-foreground">I partner che ci accompagnano nel nostro percorso</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sponsorPrincipali.map((sponsor, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative">
                  <img loading="lazy" decoding="async"
                    src={`/images/2025-26/sponsors/${sponsor.logo}`}
                    alt={`Logo ${sponsor.nome}`}
                    className="w-full h-32 object-contain bg-muted/30 p-4"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-3xl">{sponsor.nome}</CardTitle>
                  <CardDescription className="text-primary font-medium">{sponsor.categoria}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-pretty">{sponsor.descrizione}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Handshake className="mx-auto h-16 w-16 mb-6" />
          <h2 className="font-ethnocentric text-3xl lg:text-4xl mb-4">UNISCITI AI NOSTRI PARTNER</h2>
          <p className="text-xl mb-8 text-pretty">
            Diventa parte del famiglia Volleyball San Martino e sostieni lo sport nel nostro territorio. Insieme
            possiamo crescere e raggiungere nuovi traguardi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contatti">
              <Button size="lg" variant="secondary" >
                Richiedi Informazioni
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
