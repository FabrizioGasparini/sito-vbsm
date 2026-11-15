import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { isAuthenticated } from "@/lib/auth"
import { mimeOf, POST_FILES_DIR, safeJoin } from "@/lib/post-generator"

/** Loghi e sponsor caricati dal generatore */
export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  const { name } = await params
  const file = /^[a-z0-9-]+\.(png|jpg|webp|gif)$/.test(name) ? safeJoin(POST_FILES_DIR, name) : null
  if (!file) return NextResponse.json({ error: "Non trovato" }, { status: 404 })
  try {
    const body = await readFile(file)
    return new NextResponse(new Uint8Array(body), {
      headers: { "Content-Type": mimeOf(file), "Cache-Control": "private, max-age=31536000, immutable" },
    })
  } catch {
    return NextResponse.json({ error: "Non trovato" }, { status: 404 })
  }
}
