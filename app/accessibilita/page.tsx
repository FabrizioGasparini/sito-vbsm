import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Accessibilità",
  description: "Dichiarazione di accessibilità del sito Volleyball San Martino.",
  path: "/accessibilita",
})

export default function AccessibilitaPage() {
  return (
    <LegalPage
      title="Accessibilità"
      intro="Volleyball San Martino vuole rendere il proprio sito fruibile dal maggior numero possibile di persone, anche con tecnologie assistive."
      sections={[
        { title: "Impegno", content: <p>Lavoriamo per rispettare i principi di percepibilità, utilizzabilità, comprensibilità e robustezza previsti dalle linee guida WCAG e dalla normativa applicabile.</p> },
        { title: "Segnalazioni", content: <p>Se incontri una barriera di accessibilità, indicaci la pagina e il problema scrivendo a <a className="text-primary underline" href="mailto:info@volleyballsanmartino.it">info@volleyballsanmartino.it</a>. Valuteremo la segnalazione e cercheremo di intervenire nel più breve tempo possibile.</p> },
        { title: "Stato della dichiarazione", content: <p>Questa dichiarazione è stata aggiornata il 3 settembre 2026. Alcuni contenuti di terze parti potrebbero non essere pienamente controllabili dalla società.</p> },
      ]}
    />
  )
}
