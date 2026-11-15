import { NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { getFile } from "@/lib/storage"
import { mimeOf } from "@/lib/post-generator"

/** Loghi e sponsor caricati dal generatore */
export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  const { name } = await params
  if (!/^[a-z0-9-]+\.(png|jpg|webp|gif)$/.test(name)) return NextResponse.json({ error: "Non trovato" }, { status: 404 })
  try {
    const file = await getFile("post", `file/${name}`)
    if (!file) return NextResponse.json({ error: "Non trovato" }, { status: 404 })
    return new NextResponse(new Uint8Array(file.body), {
      headers: { "Content-Type": mimeOf(name), "Cache-Control": "private, max-age=31536000, immutable" },
    })
  } catch (err) {
    console.error("Post generator file:", err)
    return NextResponse.json({ error: "File non disponibile" }, { status: 502 })
  }
}
