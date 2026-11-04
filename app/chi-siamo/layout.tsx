import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Chi siamo",
  description: "La storia, la missione e lo staff della Volleyball San Martino, società di pallavolo di San Martino in Rio dal 1984.",
  path: "/chi-siamo",
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
