import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Orari allenamenti",
  description: "Orari di allenamento settimanali delle squadre Volleyball San Martino.",
  path: "/allenamenti",
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
