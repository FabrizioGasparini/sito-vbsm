// Archivio dei file: Cloudflare R2 se configurato, altrimenti cartelle locali sul server.
//
// Tre aree:
//  - "uploads": immagini caricate dall'admin. Su R2 nel bucket pubblico con chiave "uploads/<file>";
//    in locale in UPLOAD_DIR. Nel database resta "/uploads/<file>" (vedi lib/media.ts).
//  - "media": i file del sito serviti da public/ (stagioni, loghi, pdf). La chiave è il percorso del sito
//    senza "/" iniziale (es. "images/2025-26/squadre/u18/squadra.webp"); su R2 nel bucket pubblico,
//    in locale in public/. Solo i percorsi riconosciuti da isMediaPath vanno su R2.
//  - "post": dati del generatore di post (configurazione, loghi, cache, token Instagram). Su R2 in un
//    bucket PRIVATO (mai collegato a un dominio pubblico: contiene il token Instagram).
//
// Ogni area passa a R2 solo quando il suo bucket è configurato: senza variabili tutto resta su disco.
import path from "path"
import { promises as fs } from "fs"
import { AwsClient } from "aws4fetch"
import { UPLOAD_DIR } from "@/lib/uploads"
import { isMediaPath } from "@/lib/media"

export type StorageArea = "uploads" | "media" | "post"

/** Cartella dati locale del generatore di post (usata quando R2 non è configurato) */
export const POST_DATA_DIR = process.env.POST_DATA_DIR || path.join(path.dirname(UPLOAD_DIR), "post-generator")

const AREAS: Record<StorageArea, { bucket: string | undefined; prefix: string; localDir: string }> = {
  uploads: { bucket: process.env.R2_PUBLIC_BUCKET, prefix: "uploads/", localDir: UPLOAD_DIR },
  media: { bucket: process.env.R2_PUBLIC_BUCKET, prefix: "", localDir: path.join(process.cwd(), "public") },
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

/**
 * Richiesta firmata verso R2. Si firma e poi si invia con il body originale: aws4fetch.fetch() lo
 * trasformerebbe in uno stream, che dentro Next.js parte senza Content-Length e R2 risponde 411.
 */
async function r2Fetch(url: string, init: { method: "GET" | "PUT"; headers?: Record<string, string>; body?: Uint8Array }) {
  // I tipi DOM non accettano Uint8Array<ArrayBufferLike> come body, ma fetch di Node sì
  const body = init.body as BodyInit | undefined
  const signed = await r2().sign(url, { method: init.method, headers: init.headers, body })
  return fetch(signed.url, { method: init.method, headers: signed.headers, body, cache: "no-store" })
}

/** true se l'area (e, per "media", quel percorso) usa R2 */
export function usesR2(area: StorageArea, key = "") {
  if (!AREAS[area].bucket) return false
  return area !== "media" || isMediaPath(`/${key}`)
}

/** Chiave relativa sicura: niente "..", percorsi assoluti, barre rovesciate o caratteri di controllo */
function checkKey(key: string) {
  const parts = key.split("/")
  if (!key || /[\\\u0000-\u001f]/.test(key) || parts.some((p) => p === "" || p === "." || p === "..")) {
    throw new Error(`Nome file non valido: ${key}`)
  }
  return key
}

const encodeKey = (key: string) => key.split("/").map(encodeURIComponent).join("/")

function objectUrl(area: StorageArea, key: string) {
  const { bucket, prefix } = AREAS[area]
  return `${R2_ENDPOINT}/${bucket}/${encodeKey(prefix + key)}`
}

function localPath(area: StorageArea, key: string) {
  return path.join(AREAS[area].localDir, ...key.split("/"))
}

type PutOptions = { contentType: string; cacheControl?: string }

/** Salva un file nell'area indicata */
export async function putFile(area: StorageArea, key: string, body: Buffer | string, options: PutOptions) {
  checkKey(key)
  const data = typeof body === "string" ? Buffer.from(body, "utf8") : body

  if (!usesR2(area, key)) {
    const file = localPath(area, key)
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, data)
    return
  }

  const headers: Record<string, string> = { "Content-Type": options.contentType }
  if (options.cacheControl) headers["Cache-Control"] = options.cacheControl
  const res = await r2Fetch(objectUrl(area, key), { method: "PUT", body: new Uint8Array(data), headers })
  if (!res.ok) throw new Error(`R2 PUT ${key}: ${res.status} ${await res.text().catch(() => "")}`.trim())
}

/** Legge un file; null se non esiste */
export async function getFile(area: StorageArea, key: string): Promise<{ body: Buffer; contentType: string | null } | null> {
  checkKey(key)

  if (!usesR2(area, key)) {
    try {
      return { body: await fs.readFile(localPath(area, key)), contentType: null }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null
      throw err
    }
  }

  const res = await r2Fetch(objectUrl(area, key), { method: "GET" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`R2 GET ${key}: ${res.status}`)
  return { body: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get("content-type") }
}

/** Legge un file di testo; null se non esiste */
export async function getText(area: StorageArea, key: string) {
  const file = await getFile(area, key)
  return file ? file.body.toString("utf8") : null
}

const decodeXml = (text: string) =>
  text.replace(/&(lt|gt|quot|apos|amp|#\d+|#x[0-9a-f]+);/gi, (_, e: string) => {
    const named: Record<string, string> = { lt: "<", gt: ">", quot: '"', apos: "'", amp: "&" }
    if (named[e.toLowerCase()]) return named[e.toLowerCase()]
    return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
  })

/** Tutte le chiavi R2 che iniziano con `prefix` (con `delimiter` "/" solo il primo livello) */
async function listR2(area: StorageArea, prefix: string, delimiter?: string) {
  const { bucket, prefix: areaPrefix } = AREAS[area]
  const keys: string[] = []
  let token: string | null = null
  do {
    const url = new URL(`${R2_ENDPOINT}/${bucket}`)
    url.searchParams.set("list-type", "2")
    url.searchParams.set("prefix", areaPrefix + prefix)
    if (delimiter) url.searchParams.set("delimiter", delimiter)
    if (token) url.searchParams.set("continuation-token", token)
    const res = await r2Fetch(url.toString(), { method: "GET" })
    if (!res.ok) throw new Error(`R2 LIST ${prefix}: ${res.status}`)
    const xml = await res.text()
    for (const m of xml.matchAll(/<Contents>[\s\S]*?<Key>([\s\S]*?)<\/Key>/g)) keys.push(decodeXml(m[1]).slice(areaPrefix.length))
    token = /<IsTruncated>true<\/IsTruncated>/.test(xml) ? decodeXml(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/.exec(xml)?.[1] || "") || null : null
  } while (token)
  return keys
}

/** Nomi dei file contenuti direttamente in una cartella (come readdir, senza sottocartelle) */
export async function listFiles(area: StorageArea, folder: string): Promise<string[]> {
  const dir = folder.replace(/^\/+|\/+$/g, "")
  checkKey(dir)

  if (!usesR2(area, `${dir}/x`)) {
    try {
      const entries = await fs.readdir(localPath(area, dir), { withFileTypes: true })
      return entries.filter((e) => e.isFile()).map((e) => e.name)
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return []
      throw err
    }
  }

  const keys = await listR2(area, `${dir}/`, "/")
  return keys.map((k) => k.slice(dir.length + 1)).filter((name) => name && !name.includes("/"))
}

// Elenco delle chiavi sotto una cartella, tenuto in memoria per qualche minuto: serve per sapere
// quali foto esistono senza fare una richiesta per ogni file.
const EXISTS_CACHE_MS = 5 * 60 * 1000
const existsCache = new Map<string, { at: number; keys: Promise<Set<string>> }>()

/** true se il file esiste. `scope` è la cartella da elencare (una volta ogni 5 minuti) quando si usa R2 */
export async function fileExists(area: StorageArea, key: string, scope: string) {
  checkKey(key)

  if (!usesR2(area, key)) {
    return fs.access(localPath(area, key)).then(
      () => true,
      () => false
    )
  }

  const cacheKey = `${area}:${scope}`
  let entry = existsCache.get(cacheKey)
  if (!entry || Date.now() - entry.at > EXISTS_CACHE_MS) {
    entry = { at: Date.now(), keys: listR2(area, `${scope.replace(/^\/+|\/+$/g, "")}/`).then((keys) => new Set(keys)) }
    existsCache.set(cacheKey, entry)
    // in caso di errore si riprova alla richiesta successiva
    entry.keys.catch(() => existsCache.delete(cacheKey))
  }
  return (await entry.keys).has(key)
}
