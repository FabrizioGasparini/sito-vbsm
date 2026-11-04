"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

const titles: Record<string, string> = {
  "/": "Home",
  "/squadre": "Squadre",
  "/calendario": "Calendario",
  "/news": "News",
  "/gallery": "Gallerie",
  "/chi-siamo": "Chi siamo",
  "/contatti": "Contatti",
  "/sponsor": "Sponsor",
  "/allenamenti": "Allenamenti",
  "/torneo-24h": "Torneo 24H",
  "/torneo-24h/registrazione": "Registrazione Torneo 24H",
  "/login": "Accesso riservato",
  "/privacy": "Privacy policy",
  "/termini": "Termini di servizio",
  "/cookies": "Cookie policy",
  "/note-legali": "Note legali",
  "/accessibilita": "Accessibilita",
  "/admin": "Area riservata",
  "/admin/news": "Gestione news",
  "/admin/players": "Gestione giocatori",
  "/admin/torneo-24h": "Gestione Torneo 24H",
  "/manutenzione/torneo-24h": "Torneo 24H in manutenzione",
}

function labelFromPath(pathname: string) {
  const exactTitle = titles[pathname]
  if (exactTitle) return exactTitle

  const section = pathname.split("/").filter(Boolean)[0]
  if (section === "news") return "Articolo news"
  if (section === "squadre") return "Squadra"
  if (section === "gallery") return "Galleria"
  if (section === "admin") return "Amministrazione"
  return "Volleyball San Martino"
}

export default function PageTitle() {
  const pathname = usePathname()

  useEffect(() => {
    document.title = `${labelFromPath(pathname)} | Volleyball San Martino`
  }, [pathname])

  return null
}