import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Contatti",
  description: "Contatti, palestre e indirizzo della Volleyball San Martino a San Martino in Rio (RE). Scrivici per informazioni, iscrizioni e prove.",
  path: "/contatti",
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
