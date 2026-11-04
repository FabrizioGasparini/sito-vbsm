import { NextRequest, NextResponse } from "next/server"
import { mkdir } from "fs/promises"
import path from "path"
import fs from "fs"
import sharp from "sharp"
import { isAdmin } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "Nessun file ricevuto" },
        { status: 400 }
      )
    }

    const maxFileSize = 5 * 1024 * 1024

    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "File troppo grande" },
        { status: 400 }
      )
    }

    const mimeType = file.type

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ]

    if (!validTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: "Tipo di file non supportato" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Storage esterno al progetto Next.js
    const uploadDir = "C:\\VBSM\\storage\\uploads"

    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Nome sicuro senza estensione originale
    const sanitizedName = path
      .parse(file.name)
      .name
      .replace(/[^a-zA-Z0-9.-]/g, "_")

    const filename = `${Date.now()}-${sanitizedName}.webp`
    const filepath = path.join(uploadDir, filename)

    // Conversione automatica in WebP
    await sharp(buffer)
      .rotate()
      .webp({ quality: 82 })
      .toFile(filepath)

    return NextResponse.json({
      url: `/uploads/${filename}`,
    })
  } catch (err) {
    console.error("Upload error:", err)

    return NextResponse.json(
      { error: "Errore durante l'upload" },
      { status: 500 }
    )
  }
}