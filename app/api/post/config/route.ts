import { NextRequest, NextResponse } from "next/server"
import { isAdmin, isAuthenticated } from "@/lib/auth"
import { readPostConfig, writePostConfig } from "@/lib/post-generator"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  return NextResponse.json(await readPostConfig(), { headers: { "Cache-Control": "no-store" } })
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  try {
    const config = await req.json()
    const ok =
      config && typeof config === "object" && Array.isArray(config.squadre) && Array.isArray(config.sponsor) && Array.isArray(config.avversari)
    if (!ok) return NextResponse.json({ error: "Configurazione non valida" }, { status: 400 })
    await writePostConfig(config)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Post generator config:", err)
    return NextResponse.json({ error: "Salvataggio non riuscito" }, { status: 500 })
  }
}
