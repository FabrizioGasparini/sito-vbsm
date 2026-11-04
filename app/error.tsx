"use client"

import { useEffect } from "react"
import Link from "next/link"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

// Error boundary globale: mostra un messaggio comprensibile invece della pagina di errore generica
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-[#05080d] text-white px-4">
      <div className="max-w-xl text-center">
        <p className="font-ethnocentric text-primary text-2xl" aria-hidden="true">VBSM</p>
        <h1 className="mt-6 text-3xl sm:text-4xl font-bold">Si è verificato un problema</h1>
        <p className="mt-4 text-lg text-gray-300">
          Non è stato possibile caricare la pagina. Riprova tra qualche istante: se il problema persiste, contattaci.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button onClick={reset} size="lg" className="rounded-full">
            <RefreshCw aria-hidden="true" /> Riprova
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full text-foreground">
            <Link href="/">Torna alla home</Link>
          </Button>
        </div>
        {error.digest && <p className="mt-8 text-xs text-gray-400">Codice errore: {error.digest}</p>}
      </div>
    </main>
  )
}
