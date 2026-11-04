import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Iscrizione Torneo 24H",
  description: "Modulo di iscrizione delle squadre al Torneo 24H della Volleyball San Martino.",
  path: "/torneo-24h/registrazione",
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
