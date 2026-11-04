import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Squadre",
  description: "Le squadre della Volleyball San Martino: dalle categorie giovanili alle formazioni senior, con roster, staff tecnico e risultati.",
  path: "/squadre",
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
