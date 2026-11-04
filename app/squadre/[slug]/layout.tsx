import type { Metadata } from "next"
import type { ReactNode } from "react"
import { prisma } from "@/lib/prisma"
import { pageMetadata, toDescription } from "@/lib/seo"

type Props = { params: Promise<{ slug: string }> }

// Stessa logica di slugify in ./page.tsx, così metadata e pagina trovano la stessa squadra
function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\//g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const teams = await prisma.teams.findMany({
      select: { id: true, categoria: true, campionato: true, descrizione: true, stagione: true },
    })
    const team = teams.find((item) => item.id === slug || slugify(item.categoria) === slug)
    if (team) {
      const fallback = `Roster, staff e partite della squadra ${team.categoria}${team.campionato ? ` - ${team.campionato}` : ""}, stagione ${team.stagione}.`
      return pageMetadata({
        title: team.categoria,
        description: toDescription(team.descrizione, fallback),
        // canonical sullo slug della categoria, lo stesso usato dai link interni
        path: `/squadre/${slugify(team.categoria) || slug}`,
        image: `/images/2025-26/squadre/${team.id}/squadra.webp`,
      })
    }
  } catch (error) {
    console.error("Errore metadata squadra:", error)
  }
  return pageMetadata({ title: "Squadra", description: "Squadra della Volleyball San Martino.", path: `/squadre/${slug}` })
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
