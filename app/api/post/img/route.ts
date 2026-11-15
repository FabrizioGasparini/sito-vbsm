import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { isAuthenticated } from "@/lib/auth"
import { getFile, getText, putFile } from "@/lib/storage"
import { MAX_POST_UPLOAD } from "@/lib/post-generator"

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

  const key = `cache-loghi/${createHash("sha1").update(url.href).digest("hex")}`
  try {
    const [cached, type] = await Promise.all([getFile("post", key), getText("post", `${key}.type`)])
    if (cached && type) {
      return new NextResponse(new Uint8Array(cached.body), { headers: { "Content-Type": type, "Cache-Control": "private, max-age=86400" } })
    }
  } catch {}

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000), redirect: "follow" })
    const type = res.headers.get("content-type") || ""
    if (!res.ok || !type.startsWith("image/") || type.includes("svg")) {
      return NextResponse.json({ error: "Logo non disponibile" }, { status: 502 })
    }
    const body = Buffer.from(await res.arrayBuffer())
    if (body.length > MAX_POST_UPLOAD) return NextResponse.json({ error: "Logo troppo grande" }, { status: 502 })
    // la cache è un di più: se il salvataggio non riesce il logo viene servito lo stesso
    await Promise.all([
      putFile("post", key, body, { contentType: type }),
      putFile("post", `${key}.type`, type, { contentType: "text/plain" }),
    ]).catch((err) => console.error("Cache loghi:", err))
    return new NextResponse(new Uint8Array(body), { headers: { "Content-Type": type, "Cache-Control": "private, max-age=86400" } })
  } catch {
    return NextResponse.json({ error: "Logo non disponibile" }, { status: 502 })
  }
}
