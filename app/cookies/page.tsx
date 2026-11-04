import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Cookie policy | Volleyball San Martino",
  description: "Informazioni sui cookie e sugli strumenti di misurazione usati dal sito Volleyball San Martino.",
}

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie policy"
      intro="Qui trovi informazioni sui cookie e sugli strumenti simili utilizzati dal sito Volleyball San Martino. Puoi modificare la tua scelta cancellando i dati del sito dal browser e visitando nuovamente questa pagina."
      sections={[
        { title: "Cookie tecnici", content: <p>Sono necessari per il funzionamento del sito, la sicurezza e la gestione delle sessioni dell&apos;area riservata. Non richiedono il consenso dell&apos;utente quando sono usati esclusivamente per queste finalita.</p> },
        { title: "Analytics", content: <p>Con il consenso dell&apos;utente viene caricato Umami Analytics, usato per statistiche aggregate sulle visite. Il servizio è attivato solo scegliendo “Accetta” nel banner e non viene caricato in caso di rifiuto.</p> },
        { title: "Gestione del consenso", content: <p>Al primo accesso puoi accettare o rifiutare gli analytics e scegliere solo i cookie necessari. La scelta viene conservata localmente nel browser con la chiave <strong>vbsm-cookie-consent</strong>. Puoi riaprire in qualsiasi momento il pannello tramite il pulsante &quot;Gestisci cookie&quot; e modificare o revocare la scelta.</p> },
        { title: "Cookie di terze parti", content: <p>Collegamenti o contenuti incorporati da servizi esterni, come social network o mappe, possono applicare le proprie tecnologie quando vengono utilizzati. Consulta le rispettive informative prima di interagire con tali servizi.</p> },
        { title: "Aggiornamenti", content: <p>La policy può cambiare insieme agli strumenti utilizzati dal sito. Ultimo aggiornamento: 3 settembre 2026.</p> },
      ]}
    />
  )
}
