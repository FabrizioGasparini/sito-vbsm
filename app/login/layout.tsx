import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Accesso riservato",
  description: "Accesso all'area riservata di Volleyball San Martino.",
  path: "/login",
  noIndex: true,
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
