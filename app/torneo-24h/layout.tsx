import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Torneo 24H",
  description: "Il Torneo 24H della Volleyball San Martino in Piazza V. Carnevali a San Martino in Rio (RE).",
  path: "/torneo-24h",
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
