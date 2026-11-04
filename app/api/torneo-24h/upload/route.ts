import { NextRequest, NextResponse } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import fs from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Nessun file ricevuto" }, { status: 400 })
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo di file non supportato" }, { status: 400 })
    }

    const maxFileSize = 5 * 1024 * 1024
    if (file.size > maxFileSize) {
      return NextResponse.json({ error: "File troppo grande" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = "C:\\VBSM\\storage\\uploads"
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `${Date.now()}-${sanitizedName}`
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (error) {
    console.error("Tournament upload error:", error)
    return NextResponse.json({ error: "Errore durante l'upload" }, { status: 500 })
  }
}
