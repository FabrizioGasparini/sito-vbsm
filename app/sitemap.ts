import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { gallerySlug } from "@/lib/gallery-data"
import { absoluteUrl } from "@/lib/site"

// Rigenerata al massimo una volta all'ora
export const revalidate = 3600

const staticRoutes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/news", changeFrequency: "daily", priority: 0.9 },
  { path: "/squadre", changeFrequency: "weekly", priority: 0.9 },
  { path: "/calendario", changeFrequency: "daily", priority: 0.8 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.7 },
  { path: "/chi-siamo", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contatti", changeFrequency: "monthly", priority: 0.7 },
  { path: "/sponsor", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.2 },
  { path: "/termini", changeFrequency: "yearly", priority: 0.2 },
  { path: "/note-legali", changeFrequency: "yearly", priority: 0.2 },
  { path: "/accessibilita", changeFrequency: "yearly", priority: 0.2 },
]

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // Le pagine dinamiche si aggiungono solo se il database è raggiungibile:
  // in caso di errore la sitemap resta valida con le sole pagine statiche.
  try {
    const [news, teams, galleries] = await Promise.all([
      prisma.news.findMany({ select: { slug: true, data: true }, orderBy: { data: "desc" } }),
      prisma.teams.findMany({ select: { id: true, categoria: true }, orderBy: { idx: "asc" } }),
      prisma.gallery.findMany({ select: { titolo: true, data: true }, orderBy: { data: "desc" } }),
    ])

    for (const article of news) {
      entries.push({ url: absoluteUrl(`/news/${encodeURIComponent(article.slug)}`), lastModified: article.data, changeFrequency: "monthly", priority: 0.6 })
    }
    for (const team of teams) {
      entries.push({ url: absoluteUrl(`/squadre/${encodeURIComponent(slugify(team.categoria) || team.id)}`), changeFrequency: "weekly", priority: 0.6 })
    }
    for (const gallery of galleries) {
      entries.push({ url: absoluteUrl(`/gallery/${encodeURIComponent(gallerySlug(gallery.titolo))}`), lastModified: gallery.data, changeFrequency: "yearly", priority: 0.4 })
    }
  } catch (error) {
    console.error("Sitemap: impossibile leggere i contenuti dinamici", error)
  }

  return entries
}
