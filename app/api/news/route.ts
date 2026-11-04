import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { NewsArticle } from "@/lib/news-data"

const extractInlineImageUrls = (content: string): string[] => {
  if (!content) return []

  return [...new Set(
    [...content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)]
      .map((match) => match[1].trim())
      .filter(Boolean)
  )]
}

// ✅ Default valori
const emptyArticle: Omit<NewsArticle, "id"> = {
  slug: "",
  titolo: "",
  categoria: "Risultati",
  data: new Date().toISOString(),
  autore: "Redazione VSM",
  immagine: "/volleyball-game.png",
  immagini: [],
  estratto: "",
  contenuto: "",
  tags: [],
  featured: false,
}

// ---------------- GET ----------------
export async function GET() {
  // if (!isAuthenticated(req)) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const news = await prisma.news.findMany({
      orderBy: { data: "desc" },
    })

    const parsed = news.map((row) => {
      const storedImages = row.immagini ? JSON.parse(row.immagini) : []
      const inlineImages = extractInlineImageUrls(row.contenuto || "")

      return {
        ...row,
        immagini: [...new Set([...(Array.isArray(storedImages) ? storedImages : []), ...inlineImages])],
        tags: row.tags ? JSON.parse(row.tags) : [],
      }
    })

    return NextResponse.json(parsed, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore database" }, { status: 500 })
  }
}

// ---------------- POST ----------------
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const body = await req.json()
    const data = { ...emptyArticle, ...body }
    const inlineImageUrls = extractInlineImageUrls(data.contenuto || "")
    const mergedImages = [...new Set([...(data.immagini || []), ...inlineImageUrls])]

    const created = await prisma.news.create({
      data: {
        slug: data.slug,
        titolo: data.titolo,
        categoria: data.categoria,
        data: new Date(data.data),
        autore: data.autore,
        immagine: data.immagine || inlineImageUrls[0] || emptyArticle.immagine,
        immagini: JSON.stringify(mergedImages),
        estratto: data.estratto,
        contenuto: data.contenuto,
        tags: JSON.stringify(data.tags || []),
        featured: data.featured ?? false,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore inserimento news" }, { status: 500 })
  }
}

// ---------------- PUT ----------------
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const body = await req.json()
    const { id, ...rest } = body

    if (!id) return NextResponse.json({ error: "ID mancante per aggiornamento" }, { status: 400 })

    const inlineImageUrls = extractInlineImageUrls(rest.contenuto || "")
    const mergedImages = [...new Set([...(rest.immagini || []), ...inlineImageUrls])]

    const updated = await prisma.news.update({
      where: { id: Number(id) },
      data: {
        ...rest,
        data: new Date(rest.data),
        immagine: rest.immagine || inlineImageUrls[0] || emptyArticle.immagine,
        immagini: JSON.stringify(mergedImages),
        tags: JSON.stringify(rest.tags || []),
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore aggiornamento news" }, { status: 500 })
  }
}

// ---------------- DELETE ----------------
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "ID mancante per cancellazione" }, { status: 400 })

    await prisma.news.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ message: "Articolo cancellato" }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore cancellazione news" }, { status: 500 })
  }
}

// ---------------- OPTIONS ----------------
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "https://volleyballsanmartino.it",
      "Access-Control-Allow-Methods": "GET, OPTIONS, POST, PUT, DELETE",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
