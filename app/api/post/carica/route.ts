import { NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { detectFileType } from "@/lib/uploads"
import { putFile } from "@/lib/storage"
import { decodeDataUrl, MAX_POST_UPLOAD, slug } from "@/lib/post-generator"

/** Logo o sponsor caricato dal generatore: { tipo: "loghi" | "sponsor", nome, dataUrl } */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  try {
    const { tipo, nome, dataUrl } = await req.json()
    if (tipo !== "loghi" && tipo !== "sponsor") return NextResponse.json({ error: "Tipo non valido" }, { status: 400 })

    const buffer = decodeDataUrl(dataUrl)
    if (!buffer || buffer.length > MAX_POST_UPLOAD) return NextResponse.json({ error: "Immagine non valida o troppo grande" }, { status: 400 })
    // il tipo si verifica sul contenuto, non su quello dichiarato
    const detected = detectFileType(buffer)
    if (!detected || !detected.mime.startsWith("image/")) return NextResponse.json({ error: "Tipo di file non supportato" }, { status: 400 })

    const fileName = `${tipo}-${slug(nome)}-${Date.now().toString(36)}.${detected.ext}`
    await putFile("post", `file/${fileName}`, buffer, { contentType: detected.mime })
    return NextResponse.json({ file: `/api/post/file/${fileName}` })
  } catch (err) {
    console.error("Post generator upload:", err)
    return NextResponse.json({ error: "Caricamento non riuscito" }, { status: 500 })
  }
}
