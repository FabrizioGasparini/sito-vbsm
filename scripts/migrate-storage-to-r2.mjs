// Copia una tantum dei file locali su Cloudflare R2 (vedi lib/storage.ts e README).
//
//   node --env-file=.env scripts/migrate-storage-to-r2.mjs --dry-run   (mostra cosa verrebbe copiato)
//   node --env-file=.env scripts/migrate-storage-to-r2.mjs
//
// Cartelle di STORAGE_DIR (default: la cartella che contiene UPLOAD_DIR, cioè C:\VBSM\storage):
// - uploads         → bucket R2_PUBLIC_BUCKET,  chiavi "uploads/<file>"
// - 2025-26 (e ogni altra cartella stagione AAAA-AA) → R2_PUBLIC_BUCKET, chiavi "images/2025-26/<file>"
// - loghi           → R2_PUBLIC_BUCKET,  chiavi "images/loghi/<file>"
// - pdfs            → R2_PUBLIC_BUCKET,  chiavi "pdfs/<file>"
// - post-generator  → bucket R2_PRIVATE_BUCKET, chiavi "post-generator/<file>"
// Le chiavi coincidono con i percorsi del sito (vedi lib/media.ts). Le altre cartelle vengono segnalate e saltate.
// Un file viene copiato se manca su R2, se ha una dimensione diversa o se è stato modificato dopo l'ultima
// copia: lo script si può rilanciare quante volte si vuole. I file locali NON vengono cancellati.
import path from "node:path"
import { promises as fs } from "node:fs"
import { AwsClient } from "aws4fetch"

const DRY_RUN = process.argv.includes("--dry-run")
const PARALLEL = 8

const env = (name) => {
  const value = process.env[name]
  if (!value) throw new Error(`Variabile mancante nel .env: ${name}`)
  return value
}

const UPLOAD_DIR = process.env.UPLOAD_DIR || "C:\\VBSM\\storage\\uploads"
const STORAGE_DIR = process.env.STORAGE_DIR || path.dirname(UPLOAD_DIR)
const POST_DATA_DIR = process.env.POST_DATA_DIR || path.join(STORAGE_DIR, "post-generator")
const ENDPOINT = (process.env.R2_ENDPOINT || `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`).replace(/\/+$/, "")

const client = new AwsClient({
  accessKeyId: env("R2_ACCESS_KEY_ID"),
  secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
  service: "s3",
  region: "auto",
})

const MIME = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".json": "application/json",
  ".bak": "application/json",
  ".type": "text/plain",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
}

const PUBLIC_BUCKET = process.env.R2_PUBLIC_BUCKET
const PRIVATE_BUCKET = process.env.R2_PRIVATE_BUCKET
// Gli upload hanno un timestamp nel nome e non cambiano mai; gli altri file possono essere sostituiti con lo stesso nome
const IMMUTABLE = "public, max-age=31536000, immutable"
const ONE_DAY = "public, max-age=86400"

async function buildJobs() {
  const jobs = [
    { dir: UPLOAD_DIR, bucket: PUBLIC_BUCKET, prefix: "uploads/", cache: IMMUTABLE },
    { dir: POST_DATA_DIR, bucket: PRIVATE_BUCKET, prefix: "post-generator/" },
  ]
  const known = new Set([path.resolve(UPLOAD_DIR), path.resolve(POST_DATA_DIR)])
  let entries = []
  try {
    entries = await fs.readdir(STORAGE_DIR, { withFileTypes: true })
  } catch (err) {
    if (err.code !== "ENOENT") throw err
  }
  for (const entry of entries) {
    const dir = path.join(STORAGE_DIR, entry.name)
    if (known.has(path.resolve(dir))) continue
    if (!entry.isDirectory()) {
      console.log(`Salto ${dir}: non è una cartella`)
    } else if (/^\d{4}-\d{2}$/.test(entry.name) || entry.name === "loghi") {
      jobs.push({ dir, bucket: PUBLIC_BUCKET, prefix: `images/${entry.name}/`, cache: ONE_DAY })
    } else if (entry.name === "pdfs") {
      jobs.push({ dir, bucket: PUBLIC_BUCKET, prefix: "pdfs/", cache: ONE_DAY })
    } else {
      console.log(`Salto ${dir}: cartella non prevista (vedi lib/media.ts)`)
    }
  }
  return jobs
}

async function listFiles(dir, base = dir) {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch (err) {
    if (err.code === "ENOENT") return []
    throw err
  }
  const out = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await listFiles(full, base)))
    else if (entry.isFile()) out.push({ full, rel: path.relative(base, full).split(path.sep).join("/") })
  }
  return out
}

const objectUrl = (bucket, key) => `${ENDPOINT}/${bucket}/${key.split("/").map(encodeURIComponent).join("/")}`

async function copy(job, file, stats) {
  const key = job.prefix + file.rel
  const url = objectUrl(job.bucket, key)
  const { size, mtimeMs } = await fs.stat(file.full)

  const head = await client.fetch(url, { method: "HEAD" })
  if (head.ok) {
    const sameSize = Number(head.headers.get("content-length")) === size
    const copiedAt = Date.parse(head.headers.get("last-modified") || "")
    if (sameSize && !(mtimeMs > copiedAt)) {
      stats.skipped++
      return
    }
  } else if (head.status !== 404) {
    throw new Error(`controllo su R2 non riuscito (${head.status})`)
  }
  if (DRY_RUN) {
    console.log(`  da copiare: ${job.bucket}/${key} (${(size / 1024).toFixed(0)} KB)`)
    stats.copied++
    return
  }

  const headers = { "Content-Type": MIME[path.extname(file.rel).toLowerCase()] || "application/octet-stream" }
  if (job.cache) headers["Cache-Control"] = job.cache
  const res = await client.fetch(url, { method: "PUT", body: new Uint8Array(await fs.readFile(file.full)), headers })
  if (!res.ok) throw new Error(`${key}: ${res.status} ${await res.text()}`)
  stats.copied++
  stats.bytes += size
}

async function run() {
  const jobs = await buildJobs()
  for (const job of jobs) {
    if (!job.bucket) {
      console.log(`Salto ${job.dir}: bucket non configurato`)
      continue
    }
    const files = await listFiles(job.dir)
    console.log(`${job.dir} → ${job.bucket}/${job.prefix} (${files.length} file)`)
    const stats = { copied: 0, skipped: 0, failed: 0, bytes: 0 }
    let next = 0
    await Promise.all(
      Array.from({ length: PARALLEL }, async () => {
        while (next < files.length) {
          const file = files[next++]
          try {
            await copy(job, file, stats)
          } catch (err) {
            stats.failed++
            console.error(`  ERRORE ${file.rel}: ${err.message}`)
          }
        }
      })
    )
    console.log(
      `  ${DRY_RUN ? "da copiare" : "copiati"}: ${stats.copied}, già presenti: ${stats.skipped}, errori: ${stats.failed}` +
        (DRY_RUN ? "" : `, ${(stats.bytes / 1024 / 1024).toFixed(1)} MB`)
    )
    if (stats.failed) process.exitCode = 1
  }
}

run().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
