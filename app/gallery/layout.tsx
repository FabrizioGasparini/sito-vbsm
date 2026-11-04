import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Gallerie",
  description: "Foto e video delle partite, dei tornei e degli eventi della Volleyball San Martino.",
  path: "/gallery",
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
