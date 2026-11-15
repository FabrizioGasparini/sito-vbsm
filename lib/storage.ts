// Archivio dei file caricati: Cloudflare R2 se configurato, altrimenti cartelle locali sul server.
//
// Due aree:
//  - "uploads": immagini pubbliche caricate dall'admin (news, squadre, giocatori). Su R2 vanno nel
//    bucket pubblico, servito dal dominio NEXT_PUBLIC_MEDIA_URL; gli indirizzi salvati nel database
//    restano "/uploads/<file>" e vengono tradotti da normalizeImageSrc.
//  - "post": dati del generatore di post (configurazione, loghi, cache, token Instagram). Su R2 vanno
//    in un bucket PRIVATO (mai collegato a un dominio pubblico: contiene il token Instagram).
//
// Ogni area passa a R2 solo quando il suo bucket è configurato: senza variabili tutto resta su disco.
import path from "path"
import { promises as fs } from "fs"
import { AwsClient } from "aws4fetch"
import { UPLOAD_DIR } from "@/lib/uploads"

export type StorageArea = "uploads" | "post"

/** Cartella dati locale del generatore di post (usata quando R2 non è configurato) */
export const POST_DATA_DIR = process.env.POST_DATA_DIR || path.join(path.dirname(UPLOAD_DIR), "post-generator")

const AREAS: Record<StorageArea, { bucket: string | undefined; prefix: string; localDir: string }> = {
  uploads: { bucket: process.env.R2_PUBLIC_BUCKET, prefix: "uploads/", localDir: UPLOAD_DIR },
  post: { bucket: process.env.R2_PRIVATE_BUCKET, prefix: "post-generator/", localDir: POST_DATA_DIR },
}

const R2_ENDPOINT = (
  process.env.R2_ENDPOINT || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "")
).replace(/\/+$/, "")

let client: AwsClient | null = null
function r2() {
  if (!client) {
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
    if (!accessKeyId || !secretAccessKey || !R2_ENDPOINT) {
      throw new Error("R2 non configurato: servono R2_ACCOUNT_ID (o R2_ENDPOINT), R2_ACCESS_KEY_ID e R2_SECRET_ACCESS_KEY")
    }
    client = new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" })
  }
  return client
}

/** true se l'area usa R2 */
export function usesR2(area: StorageArea) {
  return Boolean(AREAS[area].bucket)
}

/** Chiave relativa sicura: niente "..", percorsi assoluti o caratteri strani */
function checkKey(key: string) {
  if (!/^[a-zA-Z0-9._-]+(\/[a-zA-Z0-9._-]+)*$/.test(key) || key.split("/").some((p) => p === "." || p === "..")) {
    throw new Error(`Nome file non valido: ${key}`)
  }
  return key
}

function objectUrl(area: StorageArea, key: string) {
  const { bucket, prefix } = AREAS[area]
  const fullKey = (prefix + key).split("/").map(encodeURIComponent).join("/")
  return `${R2_ENDPOINT}/${bucket}/${fullKey}`
}

function localPath(area: StorageArea, key: string) {
  return path.join(AREAS[area].localDir, ...key.split("/"))
}

type PutOptions = { contentType: string; cacheControl?: string }

/** Salva un file nell'area indicata */
export async function putFile(area: StorageArea, key: string, body: Buffer | string, options: PutOptions) {
  checkKey(key)
  const data = typeof body === "string" ? Buffer.from(body, "utf8") : body

  if (!usesR2(area)) {
    const file = localPath(area, key)
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, data)
    return
  }

  const headers: Record<string, string> = { "Content-Type": options.contentType }
  if (options.cacheControl) headers["Cache-Control"] = options.cacheControl
  const res = await r2().fetch(objectUrl(area, key), { method: "PUT", body: new Uint8Array(data), headers })
  if (!res.ok) throw new Error(`R2 PUT ${key}: ${res.status} ${await res.text().catch(() => "")}`.trim())
}

/** Legge un file; null se non esiste */
export async function getFile(area: StorageArea, key: string): Promise<{ body: Buffer; contentType: string | null } | null> {
  checkKey(key)

  if (!usesR2(area)) {
    try {
      return { body: await fs.readFile(localPath(area, key)), contentType: null }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null
      throw err
    }
  }

  const res = await r2().fetch(objectUrl(area, key), { method: "GET" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`R2 GET ${key}: ${res.status}`)
  return { body: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get("content-type") }
}

/** Legge un file di testo; null se non esiste */
export async function getText(area: StorageArea, key: string) {
  const file = await getFile(area, key)
  return file ? file.body.toString("utf8") : null
}
