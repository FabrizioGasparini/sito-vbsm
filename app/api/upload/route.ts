import { NextRequest, NextResponse } from "next/server"
import { mkdir } from "fs/promises"
import path from "path"
import sharp from "sharp"
import { isAdmin } from "@/lib/auth"
import { detectFileType, MAX_UPLOAD_SIZE, sanitizeBaseName, UPLOAD_DIR } from "@/lib/uploads"

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

    await mkdir(UPLOAD_DIR, { recursive: true })

    const filename = `${Date.now()}-${sanitizeBaseName(file.name)}.webp`

    // Conversione automatica in WebP (rimuove anche i metadati EXIF)
    await sharp(buffer).rotate().webp({ quality: 82 }).toFile(path.join(UPLOAD_DIR, filename))

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Errore durante l'upload" }, { status: 500 })
  }
}
