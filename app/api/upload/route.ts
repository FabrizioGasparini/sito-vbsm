import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { isAdmin } from "@/lib/auth"
import { putFile } from "@/lib/storage"
import { detectFileType, MAX_UPLOAD_SIZE, sanitizeBaseName } from "@/lib/uploads"

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nessun file ricevuto" }, { status: 400 })
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: "File troppo grande (max 5 MB)" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const detected = detectFileType(buffer)

    // Solo immagini: il tipo viene verificato sul contenuto, non sul MIME dichiarato
    if (!detected || !detected.mime.startsWith("image/")) {
      return NextResponse.json({ error: "Tipo di file non supportato" }, { status: 400 })
    }

    const filename = `${Date.now()}-${sanitizeBaseName(file.name)}.webp`

    // Conversione automatica in WebP (rimuove anche i metadati EXIF)
    const webp = await sharp(buffer).rotate().webp({ quality: 82 }).toBuffer()
    // Il nome contiene un timestamp: il file non cambia mai, si può mettere in cache per sempre
    await putFile("uploads", filename, webp, { contentType: "image/webp", cacheControl: "public, max-age=31536000, immutable" })

    // Nel database resta sempre "/uploads/<file>": normalizeImageSrc lo traduce nel dominio dei media
    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Errore durante l'upload" }, { status: 500 })
  }
}
