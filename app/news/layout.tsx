import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "News",
  description: "Notizie, risultati, comunicati ed eventi della Volleyball San Martino.",
  path: "/news",
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
