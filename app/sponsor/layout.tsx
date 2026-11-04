import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Sponsor",
  description: "Gli sponsor e i partner che sostengono la Volleyball San Martino.",
  path: "/sponsor",
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
