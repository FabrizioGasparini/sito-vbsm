import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Note legali",
  description: "Note legali e condizioni di utilizzo del sito Volleyball San Martino.",
  path: "/note-legali",
})

export default function NoteLegaliPage() {
  return (
    <LegalPage
      title="Note legali"
      intro="Le presenti note regolano l&apos;utilizzo del sito ufficiale di Volleyball San Martino."
      sections={[
        { title: "Contenuti del sito", content: <p>Le informazioni sono pubblicate a scopo informativo e possono cambiare senza preavviso. La società si impegna a mantenerle aggiornate, senza garantire l&apos;assenza di errori o interruzioni.</p> },
        { title: "Proprietà intellettuale", content: <p>Testi, fotografie, loghi e materiali presenti sul sito appartengono ai rispettivi titolari. La riproduzione o il riutilizzo richiede autorizzazione, salvo i casi previsti dalla legge.</p> },
        { title: "Link esterni", content: <p>I collegamenti verso siti di terzi sono forniti per comodità. Volleyball San Martino non controlla i relativi contenuti o pratiche di trattamento dei dati.</p> },
        { title: "Contatti", content: <p>Per segnalazioni o richieste puoi contattarci all&apos;indirizzo <a className="text-primary underline" href="mailto:info@volleyballsanmartino.it">info@volleyballsanmartino.it</a>.</p> },
      ]}
    />
  )
}
