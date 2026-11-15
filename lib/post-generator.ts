// Generatore dei post risultati: dati salvati su disco (fuori dal progetto, sopravvivono ai deploy)
import path from "path"
import { promises as fs } from "fs"
import { UPLOAD_DIR } from "@/lib/uploads"

/** Cartella dati: configurazione, loghi/sponsor caricati, cache loghi, token Instagram */
export const POST_DATA_DIR = process.env.POST_DATA_DIR || path.join(path.dirname(UPLOAD_DIR), "post-generator")
export const POST_FILES_DIR = path.join(POST_DATA_DIR, "file")
export const POST_CACHE_DIR = path.join(POST_DATA_DIR, "cache-loghi")
const CONFIG_FILE = path.join(POST_DATA_DIR, "config.json")

/** Grafica inclusa nel progetto (sfondo, strisce, loghi e sponsor iniziali) */
export const POST_ASSETS_DIR = path.join(process.cwd(), "post-generator", "assets")
const DEFAULT_CONFIG_FILE = path.join(process.cwd(), "post-generator", "default-config.json")

export const MAX_POST_UPLOAD = 8 * 1024 * 1024

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
}

export function mimeOf(file: string) {
  return MIME[path.extname(file).toLowerCase()] || "application/octet-stream"
}

/** Configurazione (squadre, sponsor, archivio avversari, colori): al primo avvio parte da quella inclusa */
export async function readPostConfig(): Promise<unknown> {
  try {
    return JSON.parse(await fs.readFile(CONFIG_FILE, "utf8"))
  } catch {
    return JSON.parse(await fs.readFile(DEFAULT_CONFIG_FILE, "utf8"))
  }
}

export async function writePostConfig(config: unknown) {
  await fs.mkdir(POST_DATA_DIR, { recursive: true })
  // copia della versione precedente, in caso di errori
  await fs.copyFile(CONFIG_FILE, `${CONFIG_FILE}.bak`).catch(() => {})
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2))
}

/** Risolve un percorso dentro una cartella, rifiutando "../" e simili */
export function safeJoin(base: string, ...parts: string[]) {
  const full = path.resolve(base, ...parts)
  return full.startsWith(path.resolve(base) + path.sep) ? full : null
}

export function slug(text: string) {
  return (
    String(text || "file")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "file"
  )
}

/** "data:image/png;base64,…" → Buffer */
export function decodeDataUrl(dataUrl: unknown) {
  const m = /^data:image\/(png|jpeg|webp);base64,(.+)$/.exec(typeof dataUrl === "string" ? dataUrl : "")
  return m ? Buffer.from(m[2], "base64") : null
}
