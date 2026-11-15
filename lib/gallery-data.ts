import { prisma } from "./prisma"
import { listFiles } from "./storage"
import { mediaUrl } from "./media"

export interface Gallery {
  id: number
  titolo: string
  evento: string
  data: Date
  thumbnail: string | null
  media: { url: string; tipo: "foto" | "video"; }[] // 🔹 Ora è un array di file (foto/video)
}

export const emptyGallery: Omit<Gallery, "id"> = {
  titolo: "",
  evento: "",
  data: new Date(),
  thumbnail: null,
  media: [], // 🔹 array, non string
} as const

/**
 * Foto e video nella cartella della galleria (es. "/images/2025-26/gallery/torneo"), letti dall'archivio:
 * bucket R2 se configurato, altrimenti public/ sul server. Gli indirizzi puntano al dominio dei media.
 */
export async function readMediaFiles(folder: string | null): Promise<{ url: string; tipo: "foto" | "video" }[]> {
  const dir = (folder || "").replace(/\\/g, "/").replace(/^\/*(public\/)?/, "").replace(/\/+$/, "")
  if (!dir) return []

  try {
    const files = await listFiles("media", dir)
    return files
      .filter((file) => /\.(jpg|jpeg|png|webp|gif|mp4|mov|avi)$/i.test(file))
      .map((file) => ({
        url: mediaUrl(`/${dir}/${file}`),
        tipo: /\.(mp4|mov|avi)$/i.test(file) ? ("video" as const) : ("foto" as const),
      }))
  } catch (err) {
    console.error(`❌ Errore durante la lettura dei media da ${folder}:`, err)
    return []
  }
}

// ---------------- GET ALL GALLERIES ----------------
export async function getGalleryEvents(): Promise<Gallery[]> {
  const rows = await prisma.gallery.findMany({
    orderBy: { data: "desc" },
  })

  return Promise.all(rows.map(async (row) => ({ ...row, media: await readMediaFiles(row.media) })))
}

// ---------------- GET SINGLE EVENT ----------------
export async function getGalleryEvent(id: string): Promise<Gallery | undefined> {
  const evento = await prisma.gallery.findUnique({
    where: { id: Number(id) },
  })
  if (!evento) return undefined

  return {
    ...evento,
    media: await readMediaFiles(evento.media),
  }
}

// ---------------- METADATI PER SLUG (senza leggere i file media) ----------------
export function gallerySlug(titolo: string) {
  return titolo.replaceAll(" ", "-").toLowerCase()
}

export async function findGalleryMetaBySlug(slug: string) {
  const rows = await prisma.gallery.findMany({
    select: { id: true, titolo: true, evento: true, data: true, thumbnail: true },
  })
  return rows.find((row) => String(row.id) === slug || gallerySlug(row.titolo) === slug)
}
