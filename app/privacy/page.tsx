import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Privacy policy",
  description: "Informativa sul trattamento dei dati personali di Volleyball San Martino.",
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="Questa informativa descrive come Volleyball San Martino tratta i dati personali raccolti attraverso questo sito, nel rispetto del Regolamento (UE) 2016/679 (GDPR)."
      sections={[
        { title: "Titolare del trattamento", content: <p>Il titolare è Volleyball San Martino. Per domande sul trattamento dei dati puoi scrivere a <a className="text-primary underline" href="mailto:info@volleyballsanmartino.it">info@volleyballsanmartino.it</a> oppure utilizzare la pagina <a className="text-primary underline" href="/contatti">Contatti</a>.</p> },
        { title: "Dati raccolti e finalità", content: <><p>Il sito può trattare dati forniti volontariamente dall&apos;utente nei moduli di contatto o di registrazione, come nome, recapiti e contenuto della richiesta. I dati sono usati per rispondere, gestire le iscrizioni e fornire i servizi richiesti.</p><p>Per il torneo possono essere richiesti dati anagrafici dei giocatori per verificare i requisiti di età. Il file del bonifico è usato per verificare il pagamento. I dati tecnici necessari al funzionamento del sito possono essere trattati per sicurezza, manutenzione e corretta erogazione del servizio.</p></> },
        { title: "Base giuridica e conservazione", content: <p>Il trattamento si basa sull&apos;esecuzione di una richiesta dell&apos;utente, su obblighi di legge o sul consenso quando richiesto. Conserviamo i dati e i documenti solo per il tempo necessario alla finalità per cui sono stati raccolti e agli eventuali obblighi di legge; le date di nascita non sono conservate nella scheda operativa dopo la verifica dell&apos;età.</p> },
        { title: "Servizi utilizzati", content: <p>Gli analytics Umami vengono attivati solo dopo il consenso e sono usati per statistiche aggregate. I file caricati possono essere salvati nello spazio di hosting del sito. Per conoscere i trattamenti dei servizi esterni eventualmente collegati, consulta anche le loro informative.</p> },
        { title: "Diritti dell'utente", content: <p>Puoi chiedere accesso, rettifica, cancellazione, limitazione o portabilita dei tuoi dati e opporti al trattamento nei casi previsti dalla legge. Puoi inoltre revocare il consenso in qualsiasi momento, senza pregiudicare i trattamenti precedenti. Le richieste vanno inviate a <a className="text-primary underline" href="mailto:info@volleyballsanmartino.it">info@volleyballsanmartino.it</a>.</p> },
        { title: "Aggiornamenti", content: <p>Questa informativa può essere aggiornata per riflettere modifiche normative o tecniche. Ultimo aggiornamento: 3 settembre 2026.</p> },
      ]}
    />
  )
}
