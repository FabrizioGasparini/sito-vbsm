import { prisma } from "./prisma"
import fs from "fs"
import path from "path"

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

// 🧠 Funzione di utilità per leggere i file dentro una cartella
function readMediaFiles(folder: string | null): { url: string; tipo: "foto" | "video"; }[] {
  if (!folder) return []

  try {
    // Path assoluto nel progetto (es. /public/gallery/torneo-under18)
    const folderPath = path.join(process.cwd(), "public", folder)
    if (!fs.existsSync(folderPath)) return []

    // Filtra solo immagini e video
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => /\.(jpg|jpeg|png|webp|gif|mp4|mov|avi)$/i.test(file))
      .map((file) => ({
        url: path.join("/", folder, file).replace(/\\/g, "/"),
        tipo: /\.(mp4|mov|avi)$/i.test(file) ? "video" : "foto",
      } as const))

    return files
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

  return rows.map((row) => ({
    ...row,
    media: readMediaFiles(row.media).map(({ url, tipo }) => ({
      url,
      tipo,
    })),
  }))
}

// ---------------- GET SINGLE EVENT ----------------
export async function getGalleryEvent(id: string): Promise<Gallery | undefined> {
  const evento = await prisma.gallery.findUnique({
    where: { id: Number(id) },
  })
  if (!evento) return undefined

  return {
    ...evento,
    media: readMediaFiles(evento.media), // 🔹 legge i file dal path
  }
}