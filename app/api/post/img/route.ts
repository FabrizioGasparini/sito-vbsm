import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"
import { isAuthenticated } from "@/lib/auth"
import { MAX_POST_UPLOAD, POST_CACHE_DIR } from "@/lib/post-generator"

/**
 * Proxy dei loghi delle squadre (es. quelli dei risultati FIPAV): servirli dallo stesso dominio
 * permette di disegnarli sul canvas ed esportare l'immagine. Con cache su disco.
 */
export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })

  let url: URL
  try {
    url = new URL(req.nextUrl.searchParams.get("url") || "")
  } catch {
    return NextResponse.json({ error: "URL non valido" }, { status: 400 })
  }
  // solo https verso nomi di dominio pubblici (niente indirizzi IP o host locali)
  if (url.protocol !== "https:" || /^(localhost|[\d.]+|\[.*\])$/i.test(url.hostname) || !url.hostname.includes(".")) {
    return NextResponse.json({ error: "URL non ammesso" }, { status: 400 })
  }

  const key = createHash("sha1").update(url.href).digest("hex")
  const file = path.join(POST_CACHE_DIR, key)
  try {
    const [body, type] = await Promise.all([readFile(file), readFile(`${file}.type`, "utf8")])
    return new NextResponse(new Uint8Array(body), { headers: { "Content-Type": type, "Cache-Control": "private, max-age=86400" } })
  } catch {}

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000), redirect: "follow" })
    const type = res.headers.get("content-type") || ""
    if (!res.ok || !type.startsWith("image/") || type.includes("svg")) {
      return NextResponse.json({ error: "Logo non disponibile" }, { status: 502 })
    }
    const body = Buffer.from(await res.arrayBuffer())
    if (body.length > MAX_POST_UPLOAD) return NextResponse.json({ error: "Logo troppo grande" }, { status: 502 })
    await mkdir(POST_CACHE_DIR, { recursive: true })
    await Promise.all([writeFile(file, body), writeFile(`${file}.type`, type)])
    return new NextResponse(new Uint8Array(body), { headers: { "Content-Type": type, "Cache-Control": "private, max-age=86400" } })
  } catch {
    return NextResponse.json({ error: "Logo non disponibile" }, { status: 502 })
  }
}
