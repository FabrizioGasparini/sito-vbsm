// Copia una tantum dei file locali su Cloudflare R2 (vedi lib/storage.ts e README).
//
//   node --env-file=.env scripts/migrate-storage-to-r2.mjs --dry-run   (mostra cosa verrebbe copiato)
//   node --env-file=.env scripts/migrate-storage-to-r2.mjs
//
// - UPLOAD_DIR     → bucket R2_PUBLIC_BUCKET,  chiavi "uploads/<file>"
// - POST_DATA_DIR  → bucket R2_PRIVATE_BUCKET, chiavi "post-generator/<file>"
// I file già presenti su R2 con la stessa dimensione vengono saltati: lo script si può rilanciare.
// I file locali NON vengono cancellati.
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
const POST_DATA_DIR = process.env.POST_DATA_DIR || path.join(path.dirname(UPLOAD_DIR), "post-generator")
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
}

const jobs = [
  { dir: UPLOAD_DIR, bucket: process.env.R2_PUBLIC_BUCKET, prefix: "uploads/", cache: "public, max-age=31536000, immutable" },
  { dir: POST_DATA_DIR, bucket: process.env.R2_PRIVATE_BUCKET, prefix: "post-generator/" },
]

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
  const { size } = await fs.stat(file.full)

  const head = await client.fetch(url, { method: "HEAD" })
  if (head.ok && Number(head.headers.get("content-length")) === size) {
    stats.skipped++
    return
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
