// Generatore dei post risultati: dati nell'area "post" dell'archivio (bucket R2 privato o cartella
// locale, vedi lib/storage.ts), fuori dal progetto così sopravvivono ai deploy.
//   config.json, config.json.bak, instagram.json, file/<logo o sponsor>, cache-loghi/<hash>
import path from "path"
import { promises as fs } from "fs"
import { getText, putFile } from "@/lib/storage"

const CONFIG_FILE = "config.json"

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
// Un errore di rete verso l'archivio viene propagato: tornare alla configurazione iniziale farebbe
// rischiare di sovrascrivere quella vera al salvataggio successivo.
export async function readPostConfig(): Promise<unknown> {
  const saved = await getText("post", CONFIG_FILE)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {}
  }
  return JSON.parse(await fs.readFile(DEFAULT_CONFIG_FILE, "utf8"))
}

export async function writePostConfig(config: unknown) {
  const json = { contentType: "application/json" }
  // copia della versione precedente, in caso di errori
  const previous = await getText("post", CONFIG_FILE).catch(() => null)
  if (previous) await putFile("post", `${CONFIG_FILE}.bak`, previous, json)
  await putFile("post", CONFIG_FILE, JSON.stringify(config, null, 2), json)
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
