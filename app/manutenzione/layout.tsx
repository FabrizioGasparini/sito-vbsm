import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Manutenzione",
  description: "Pagina temporaneamente in manutenzione.",
  path: "/manutenzione",
  noIndex: true,
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
