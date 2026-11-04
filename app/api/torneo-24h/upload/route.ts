import { NextRequest, NextResponse } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import { randomUUID } from "crypto"
import path from "path"
import sharp from "sharp"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { detectFileType, MAX_UPLOAD_SIZE, sanitizeBaseName, UPLOAD_DIR } from "@/lib/uploads"

// Endpoint pubblico (ricevuta del bonifico in fase di iscrizione): limitato per IP
const UPLOAD_RATE_LIMIT = { windowMs: 60 * 60 * 1000, max: 10 }

export async function POST(req: NextRequest) {
  try {
    const { allowed, retryAfter } = checkRateLimit(`torneo-upload:${getClientIp(req.headers)}`, UPLOAD_RATE_LIMIT)
    if (!allowed) {
      return NextResponse.json(
        { error: `Troppi caricamenti. Riprova tra ${Math.ceil((retryAfter ?? 60) / 60)} minuti.` },
        { status: 429 }
      )
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

    if (!detected) {
      return NextResponse.json({ error: "Tipo di file non supportato" }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    // Nome non indovinabile: la ricevuta contiene dati personali
    const baseName = `${Date.now()}-${randomUUID()}-${sanitizeBaseName(file.name)}`

    let filename: string
    if (detected.mime === "application/pdf") {
      filename = `${baseName}.pdf`
      await writeFile(path.join(UPLOAD_DIR, filename), buffer)
    } else {
      // Le immagini vengono ricodificate: rimuove metadati (EXIF/GPS) ed eventuali payload nascosti
      filename = `${baseName}.webp`
      await sharp(buffer).rotate().webp({ quality: 85 }).toFile(path.join(UPLOAD_DIR, filename))
    }

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (error) {
    console.error("Tournament upload error:", error)
    return NextResponse.json({ error: "Errore durante l'upload" }, { status: 500 })
  }
}
