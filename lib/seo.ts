import type { Metadata } from "next"
import { DEFAULT_OG_IMAGE, SITE_NAME } from "./site"

type PageMetadataInput = {
  title: string
  description: string
  /** Percorso della pagina, usato per canonical e og:url (es. "/squadre") */
  path: string
  image?: string | null
  type?: "website" | "article"
  publishedTime?: string
  noIndex?: boolean
}

/**
 * Metadata completi per una pagina. Next.js sostituisce (non unisce) gli oggetti
 * openGraph/twitter del layout padre, quindi qui vengono sempre ridefiniti per intero.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  noIndex,
}: PageMetadataInput): Metadata {
  const ogImage = image || DEFAULT_OG_IMAGE
  const fullTitle = title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: "it_IT",
      siteName: SITE_NAME,
      url: path,
      title: fullTitle,
      description,
      images: [{ url: ogImage, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}

/** Testo semplice per meta description: rimuove la sintassi markdown e tronca a ~160 caratteri */
export function toDescription(text: string | null | undefined, fallback: string) {
  const clean = (text || "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\(([^)]+)\)\[[^\]]+\]/g, "$1")
    .replace(/[*_#`>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  if (!clean) return fallback
  return clean.length > 160 ? `${clean.slice(0, 157).trimEnd()}…` : clean
}
