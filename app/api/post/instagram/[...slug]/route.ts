// Pubblicazione dei post su Instagram (Instagram API with Instagram Login).
//
// Instagram non accetta file caricati: scarica l'immagine da un URL pubblico. Durante la pubblicazione
// il JPG viene servito per pochi secondi da questa stessa route, a un indirizzo casuale, poi eliminato.
// Il token resta sul server, nella cartella dati del generatore (mai inviato al browser).
//
//   GET  /api/post/instagram/stato           → { collegato, username }
//   GET  /api/post/instagram/lavoro/<id>     → { fase, permalink, errore }
//   GET  /api/post/instagram/img/<token>.jpg → immagine (pubblica, solo durante la pubblicazione)
//   POST /api/post/instagram/collega         { accessToken }
//   POST /api/post/instagram/scollega
//   POST /api/post/instagram/pubblica        { dataUrl (jpeg), caption } → { id }

import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { isAdmin, isAuthenticated } from "@/lib/auth"
import { SITE_URL } from "@/lib/site"
import { getText, putFile } from "@/lib/storage"
import { decodeDataUrl, MAX_POST_UPLOAD } from "@/lib/post-generator"

export const dynamic = "force-dynamic"

/** Nell'area "post" dell'archivio: con R2 deve stare nel bucket privato */
const IG_FILE = "instagram.json"
const IG_HOST = (process.env.INSTAGRAM_API_HOST || "https://graph.instagram.com").replace(/\/+$/, "")
const IG_VERSION = process.env.INSTAGRAM_API_VERSION || "v26.0"
const TOKEN_REFRESH_AFTER_MS = 7 * 24 * 3600 * 1000
const TIMEOUT_MS = 20_000
/** URL pubblico del sito da cui Instagram scarica l'immagine (in sviluppo si può puntare a un tunnel) */
const PUBLIC_BASE = (process.env.POST_PUBLIC_URL || SITE_URL).replace(/\/+$/, "")

type IgConfig = { accessToken?: string; userId?: string; username?: string; tokenSavedAt?: number }
type Job = { fase: string; permalink: string | null; errore: string | null; creato: number }

/** Immagini esposte durante la pubblicazione: token casuale → JPG */
const publicImages = new Map<string, Buffer>()
const jobs = new Map<string, Job>()

async function readIg(): Promise<IgConfig> {
  try {
    return JSON.parse((await getText("post", IG_FILE)) || "{}")
  } catch {
    return {}
  }
}

async function writeIg(ig: IgConfig) {
  await putFile("post", IG_FILE, JSON.stringify(ig, null, 2), { contentType: "application/json" })
}

async function igRequest(method: "GET" | "POST", pathname: string, params: Record<string, string>, ig: IgConfig) {
  const url = new URL(`${IG_HOST}/${IG_VERSION}/${pathname}`)
  const init: RequestInit = {
    method,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Authorization: `Bearer ${ig.accessToken}` },
  }
  if (method === "GET") for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  else {
    init.headers = { ...init.headers, "Content-Type": "application/json" }
    init.body = JSON.stringify(params)
  }
  const res = await fetch(url, init)
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.error) throw new Error(json.error?.error_user_msg || json.error?.message || `Instagram ha risposto ${res.status}`)
  return json
}

/** I token durano 60 giorni: si rinnovano da soli quando hanno più di una settimana */
async function freshIg() {
  const ig = await readIg()
  if (!ig.accessToken || !ig.userId) throw new Error("Instagram non è collegato")
  if (Date.now() - (ig.tokenSavedAt || 0) > TOKEN_REFRESH_AFTER_MS) {
    try {
      const url = `${IG_HOST}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(ig.accessToken)}`
      const json = await (await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })).json()
      if (json.access_token) {
        ig.accessToken = json.access_token
        ig.tokenSavedAt = Date.now()
        await writeIg(ig)
      }
    } catch (err) {
      console.error("Instagram: rinnovo token non riuscito", err)
    }
  }
  return ig
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function publish(job: Job, jpeg: Buffer, caption: string) {
  const ig = await freshIg()
  const token = randomBytes(24).toString("hex")
  publicImages.set(token, jpeg)
  try {
    job.fase = "caricamento"
    const container = await igRequest(
      "POST",
      `${ig.userId}/media`,
      { image_url: `${PUBLIC_BASE}/api/post/instagram/img/${token}.jpg`, caption },
      ig
    )

    // per le immagini di solito è subito pronto, ma meglio controllare
    for (let i = 0; i < 20; i++) {
      const st = await igRequest("GET", container.id, { fields: "status_code" }, ig).catch(() => ({}))
      if (st.status_code === "FINISHED" || !st.status_code) break
      if (st.status_code === "ERROR") throw new Error("Instagram non è riuscito a elaborare l'immagine")
      await sleep(1500)
    }

    job.fase = "pubblicazione"
    const published = await igRequest("POST", `${ig.userId}/media_publish`, { creation_id: container.id }, ig)
    const info = await igRequest("GET", published.id, { fields: "permalink" }, ig).catch(() => ({}))
    job.permalink = info.permalink || null
    job.fase = "fatto"
  } finally {
    publicImages.delete(token)
  }
}

/** I lavori vecchi non servono più */
function pruneJobs() {
  const limit = Date.now() - 60 * 60 * 1000
  for (const [id, job] of jobs) if (job.creato < limit) jobs.delete(id)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const [action, arg] = slug

  // immagine in pubblicazione: l'unico endpoint senza login (Instagram la scarica da qui)
  if (action === "img" && arg) {
    const jpeg = publicImages.get(arg.replace(/\.jpg$/, ""))
    if (!jpeg) return NextResponse.json({ error: "Non trovato" }, { status: 404 })
    return new NextResponse(new Uint8Array(jpeg), {
      headers: { "Content-Type": "image/jpeg", "Content-Length": String(jpeg.length), "Cache-Control": "no-store" },
    })
  }

  if (!isAuthenticated(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })

  if (action === "stato") {
    const ig = await readIg()
    return NextResponse.json({ collegato: Boolean(ig.accessToken && ig.userId), username: ig.username || null })
  }

  if (action === "lavoro" && arg) {
    const job = jobs.get(arg)
    return job ? NextResponse.json(job) : NextResponse.json({ error: "Lavoro non trovato" }, { status: 404 })
  }

  return NextResponse.json({ error: "Non trovato" }, { status: 404 })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  const { slug } = await params
  const action = slug[0]

  try {
    if (action === "collega") {
      const { accessToken } = await req.json()
      if (typeof accessToken !== "string" || !accessToken.trim()) {
        return NextResponse.json({ error: "Token mancante" }, { status: 400 })
      }
      const ig: IgConfig = { ...(await readIg()), accessToken: accessToken.trim(), tokenSavedAt: Date.now() }
      const me = await igRequest("GET", "me", { fields: "user_id,username" }, ig)
      ig.userId = me.user_id || me.id
      ig.username = me.username
      await writeIg(ig)
      return NextResponse.json({ username: ig.username })
    }

    if (action === "scollega") {
      await writeIg({})
      return NextResponse.json({ ok: true })
    }

    if (action === "pubblica") {
      const { dataUrl, caption } = await req.json()
      const jpeg = decodeDataUrl(dataUrl)
      if (!jpeg || !String(dataUrl).startsWith("data:image/jpeg") || jpeg.length > MAX_POST_UPLOAD) {
        return NextResponse.json({ error: "Serve un'immagine JPG" }, { status: 400 })
      }
      pruneJobs()
      const id = randomBytes(8).toString("hex")
      const job: Job = { fase: "preparazione", permalink: null, errore: null, creato: Date.now() }
      jobs.set(id, job)
      // la pubblicazione continua in background: il browser legge lo stato con GET lavoro/<id>
      publish(job, jpeg, String(caption || "").slice(0, 2200)).catch((err: Error) => {
        job.fase = "errore"
        job.errore = err.message
        console.error("Instagram:", err.message)
      })
      return NextResponse.json({ id })
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Errore" }, { status: 400 })
  }

  return NextResponse.json({ error: "Non trovato" }, { status: 404 })
}
