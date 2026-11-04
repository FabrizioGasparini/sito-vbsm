import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Termini di servizio | Volleyball San Martino",
  description: "Termini di utilizzo del sito e dei servizi online di Volleyball San Martino.",
}

export default function TerminiPage() {
  return (
    <LegalPage
      title="Termini di servizio"
      intro="Queste condizioni regolano l&apos;accesso e l&apos;utilizzo del sito e dei moduli online di Volleyball San Martino. Utilizzando il sito accetti queste condizioni."
      sections={[
        { title: "Uso del sito", content: <p>Il sito è destinato a fornire informazioni sulle attività sportive, sulle squadre, sugli eventi e sui servizi della società. L&apos;utente si impegna a usare il sito in modo lecito e a non compromettere sicurezza, disponibilità o corretto funzionamento dei servizi.</p> },
        { title: "Moduli e iscrizioni", content: <p>Le richieste inviate tramite i moduli devono contenere informazioni corrette e aggiornate. L&apos;invio di una richiesta o di un&apos;iscrizione non costituisce automaticamente accettazione: Volleyball San Martino potrà verificare i dati e confermare il servizio separatamente.</p> },
        { title: "Contenuti e disponibilità", content: <p>Informazioni, calendari, risultati e disponibilità dei servizi possono cambiare senza preavviso. La società adotta misure ragionevoli per mantenere il sito aggiornato, senza garantire assenza di errori o continuità assoluta.</p> },
        { title: "Proprietà e link esterni", content: <p>Testi, immagini, loghi e altri materiali appartengono ai rispettivi titolari. I link verso servizi esterni sono soggetti alle condizioni e alle informative dei rispettivi gestori.</p> },
        { title: "Contatti e aggiornamenti", content: <p>Per domande sui termini puoi scrivere a <a className="text-primary underline" href="mailto:info@volleyballsanmartino.it">info@volleyballsanmartino.it</a>. I termini possono essere aggiornati; la versione pubblicata su questa pagina è quella applicabile.</p> },
      ]}
    />
  )
}