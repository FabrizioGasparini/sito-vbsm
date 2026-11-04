import type { ReactNode } from "react"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Area riservata",
  description: "Area di amministrazione del sito.",
  path: "/admin",
  noIndex: true,
})

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
