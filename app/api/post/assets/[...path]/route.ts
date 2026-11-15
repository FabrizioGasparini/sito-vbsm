import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { isAuthenticated } from "@/lib/auth"
import { mimeOf, POST_ASSETS_DIR, safeJoin } from "@/lib/post-generator"

/** Grafica del template inclusa nel progetto (post-generator/assets) */
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  const { path: parts } = await params
  const valid = parts.every((p) => /^[a-z0-9-]+(\.png)?$/.test(p))
  const file = valid ? safeJoin(POST_ASSETS_DIR, ...parts) : null
  if (!file) return NextResponse.json({ error: "Non trovato" }, { status: 404 })
  try {
    const body = await readFile(file)
    return new NextResponse(new Uint8Array(body), { headers: { "Content-Type": mimeOf(file), "Cache-Control": "private, max-age=86400" } })
  } catch {
    // es. sfondo-femminile.png opzionale: assenza normale
    return NextResponse.json({ error: "Non trovato" }, { status: 404 })
  }
}
