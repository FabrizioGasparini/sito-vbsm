import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Calendario partite",
  description: "Calendario, orari e risultati delle partite di campionato delle squadre Volleyball San Martino.",
  path: "/calendario",
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
