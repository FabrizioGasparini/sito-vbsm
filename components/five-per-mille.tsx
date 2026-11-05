"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy, FileSignature, HeartHandshake, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TAX_CODE } from "@/lib/site"

const steps = [
  {
    icon: FileSignature,
    title: "Nella dichiarazione dei redditi",
    text: "Nel modello 730 o Redditi Persone Fisiche trova la sezione “Scelta per la destinazione del 5 per mille”.",
  },
  {
    icon: HeartHandshake,
    title: "Firma nel riquadro",
    text: "Metti la tua firma nel riquadro della categoria dedicata.",
  },
  {
    icon: Hash,
    title: "Scrivi il nostro codice fiscale",
    text: "Indica sotto la firma il codice fiscale di Volleyball San Martino.",
  },
]

/** Sezione per invitare a destinare il 5 per mille all'associazione */
export function FivePerMille() {
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLSpanElement>(null)
  const resetTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(TAX_CODE)
    } catch {
      // Clipboard non disponibile (es. HTTP o permessi): seleziona il testo così l'utente può copiarlo a mano
      const selection = window.getSelection()
      if (codeRef.current && selection) {
        const range = document.createRange()
        range.selectNodeContents(codeRef.current)
        selection.removeAllRanges()
        selection.addRange(range)
      }
      return
    }
    setCopied(true)
    window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setCopied(false), 2500)
  }

  return (
    <section id="cinque-per-mille" aria-labelledby="five-per-mille-title" className="relative overflow-hidden bg-[#05080d] py-20 md:py-28 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(225,29,72,0.28),transparent_45%),radial-gradient(circle_at_10%_90%,rgba(225,29,72,0.14),transparent_40%)]" />
      <span aria-hidden="true" className="pointer-events-none select-none absolute -right-6 top-1/2 -translate-y-1/2 font-ethnocentric text-[34vw] lg:text-[22rem] leading-none text-white/[0.04]">
        5‰
      </span>

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Messaggio */}
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <HeartHandshake className="h-4 w-4" aria-hidden="true" /> 5 per mille
            </p>
            <h2 id="five-per-mille-title" className="font-ethnocentric text-3xl leading-[1.05] sm:text-4xl lg:text-5xl">
              Il tuo 5 per mille vale <span className="text-primary">più di quanto immagini</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
              A te non costa nulla, ma per noi è un aiuto concreto per continuare a crescere, organizzare attività e
              sostenere i nostri ragazzi, dentro e fuori dal campo.
            </p>
            <p className="mt-3 max-w-xl text-sm text-gray-400">
              Se non effettui alcuna scelta, quella quota resta allo Stato.
            </p>

            {/* Codice fiscale */}
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Codice fiscale</p>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <span
                  ref={codeRef}
                  className="font-mono text-3xl font-bold tracking-[0.12em] text-white sm:text-4xl select-all"
                  aria-label={`Codice fiscale ${TAX_CODE.split("").join(" ")}`}
                >
                  {TAX_CODE}
                </span>
                <Button
                  type="button"
                  size="lg"
                  onClick={copyCode}
                  className="rounded-full px-6 shadow-lg shadow-primary/25"
                >
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {copied ? "Copiato!" : "Copia codice"}
                </Button>
              </div>
              <p role="status" aria-live="polite" className="sr-only">
                {copied ? "Codice fiscale copiato negli appunti" : ""}
              </p>
            </div>
          </div>

          {/* Come fare */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">Come fare, in 3 passi</h3>
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary font-ethnocentric text-lg">
                    {index + 1}
                  </span>
                  <div>
                    <p className="flex items-center gap-2 font-semibold">
                      <step.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-300">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-gray-400">
              Grazie a chi vorrà darci fiducia e camminare insieme a noi anche fuori dal campo! ❤️
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
