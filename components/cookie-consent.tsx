"use client"

import Link from "next/link"
import { Cookie } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

const CONSENT_KEY = "vbsm-cookie-consent"
const OPEN_PREFERENCES_EVENT = "vbsm-open-cookie-preferences"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false)
  const [hasDecision, setHasDecision] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  useEffect(() => {
    const consent = window.localStorage.getItem(CONSENT_KEY)
    if (consent === "accepted") {
      setAnalyticsAllowed(true)
    }
    setHasDecision(Boolean(consent))
    setVisible(!consent)

    const openPreferences = () => setPreferencesOpen(true)
    window.addEventListener(OPEN_PREFERENCES_EVENT, openPreferences)
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, openPreferences)
  }, [])

  useEffect(() => {
    if (!analyticsAllowed || document.querySelector("script[data-vbsm-analytics]")) return
    const script = document.createElement("script")
    script.defer = true
    script.src = "https://cloud.umami.is/script.js"
    script.dataset.websiteId = "2af7ad24-51e6-4eb9-a352-085bcec1a03c"
    script.dataset.vbsmAnalytics = "true"
    document.head.appendChild(script)
  }, [analyticsAllowed])

  const saveConsent = (accepted: boolean) => {
    window.localStorage.setItem(CONSENT_KEY, accepted ? "accepted" : "rejected")
    setAnalyticsAllowed(accepted)
    setHasDecision(true)
    setVisible(false)
    setPreferencesOpen(false)
  }

  if (!visible && !preferencesOpen && !hasDecision) return null

  return (
    <>
      {(visible || preferencesOpen) && (
        <aside className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-xl border border-border bg-background p-5 shadow-2xl" aria-label="Preferenze cookie" aria-live="polite">
          <div className="space-y-4 text-sm">
            <div className="space-y-1">
              <h2 className="font-semibold">Preferenze cookie</h2>
              <p className="text-muted-foreground">
                Usiamo cookie tecnici necessari e, solo con il tuo consenso, analytics anonimi. <Link href="/cookies" className="font-medium text-primary underline underline-offset-4">Scopri di piu</Link>.
              </p>
            </div>
            <label className="flex items-start gap-3 rounded-md border border-border p-3">
              <input
                type="checkbox"
                checked={analyticsAllowed}
                onChange={(event) => setAnalyticsAllowed(event.target.checked)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block font-medium">Analytics</span>
                <span className="block text-muted-foreground">Statistiche aggregate e non necessarie al funzionamento del sito.</span>
              </span>
            </label>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => saveConsent(false)}>Solo necessari</Button>
              <Button onClick={() => saveConsent(analyticsAllowed)}>Salva preferenze</Button>
            </div>
          </div>
        </aside>
      )}
      {!visible && !preferencesOpen && hasDecision && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPreferencesOpen(true)}
          aria-label="Gestisci preferenze cookie"
          title="Gestisci preferenze cookie"
          className="fixed bottom-4 left-4 z-[99] size-8 rounded-full bg-background p-0 shadow-lg"
        >
          <Cookie className="size-4" aria-hidden="true" />
        </Button>
      )}
    </>
  )
}