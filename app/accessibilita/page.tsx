import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Accessibilita | Volleyball San Martino",
  description: "Dichiarazione di accessibilita del sito Volleyball San Martino.",
}

export default function AccessibilitaPage() {
  return (
    <LegalPage
      title="Accessibilita"
      intro="Volleyball San Martino vuole rendere il proprio sito fruibile dal maggior numero possibile di persone, anche con tecnologie assistive."
      sections={[
        { title: "Impegno", content: <p>Lavoriamo per rispettare i principi di percepibilita, utilizzabilita, comprensibilita e robustezza previsti dalle linee guida WCAG e dalla normativa applicabile.</p> },
        { title: "Segnalazioni", content: <p>Se incontri una barriera di accessibilita, indicaci la pagina e il problema scrivendo a <a className="text-primary underline" href="mailto:info@volleyballsanmartino.it">info@volleyballsanmartino.it</a>. Valuteremo la segnalazione e cercheremo di intervenire nel piu breve tempo possibile.</p> },
        { title: "Stato della dichiarazione", content: <p>Questa dichiarazione è stata aggiornata il 3 settembre 2026. Alcuni contenuti di terze parti potrebbero non essere pienamente controllabili dalla societa.</p> },
      ]}
    />
  )
}
