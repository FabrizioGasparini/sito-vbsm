import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { readMediaFiles } from "@/lib/gallery-data"

// ✅ Valori di default
const emptyGallery = {
  titolo: "",
  evento: "",
  data: new Date().toISOString(),
  thumbnail: "",
  media: "",
}

// ---------------- GET ----------------
export async function GET() {
  try {
    const galleries = await prisma.gallery.findMany({
      orderBy: { data: "desc" },
    })

    // File di ogni galleria, letti dalla cartella indicata in "media" (archivio R2 o public/)
    const parsed = await Promise.all(galleries.map(async (row) => ({ ...row, media: await readMediaFiles(row.media) })))

    return NextResponse.json(parsed, { status: 200 })
  } catch (err) {
    console.error("❌ Errore GET /gallery:", err)
    return NextResponse.json({ error: "Errore database" }, { status: 500 })
  }
}

// ---------------- POST ----------------
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const body = await req.json()
    const data = { ...emptyGallery, ...body }

    const created = await prisma.gallery.create({
      data: {
        titolo: data.titolo,
        evento: data.evento,
        data: new Date(data.data),
        thumbnail: data.thumbnail,
        media: data.media, // path string
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error("❌ Errore POST /gallery:", err)
    return NextResponse.json({ error: "Errore inserimento evento" }, { status: 500 })
  }
}

// ---------------- PUT ----------------
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const body = await req.json()
    const { id, ...rest } = body

    if (!id) return NextResponse.json({ error: "ID mancante per aggiornamento" }, { status: 400 })

    const updated = await prisma.gallery.update({
      where: { id: Number(id) },
      data: {
        // Solo i campi previsti: evita che il body sovrascriva colonne arbitrarie
        titolo: rest.titolo,
        evento: rest.evento,
        thumbnail: rest.thumbnail,
        media: rest.media,
        data: new Date(rest.data),
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (err) {
    console.error("❌ Errore PUT /gallery:", err)
    return NextResponse.json({ error: "Errore aggiornamento evento" }, { status: 500 })
  }
}

// ---------------- DELETE ----------------
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "ID mancante per cancellazione" }, { status: 400 })

    await prisma.gallery.delete({ where: { id: Number(id) } })

    return NextResponse.json({ message: "Evento cancellato" }, { status: 200 })
  } catch (err) {
    console.error("❌ Errore DELETE /gallery:", err)
    return NextResponse.json({ error: "Errore cancellazione evento" }, { status: 500 })
  }
}

// ---------------- OPTIONS ----------------
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://volleyballsanmartino.it",
        "Access-Control-Allow-Methods": "GET, OPTIONS, POST, PUT, DELETE",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  )
}
