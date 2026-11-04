import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"

const FLAG_PATH = path.join(process.cwd(), "torneo-24h.flag")

function readBlockedState() {
  return existsSync(FLAG_PATH)
}

function writeBlockedState(blocked: boolean) {
  if (blocked) {
    if (!existsSync(path.dirname(FLAG_PATH))) {
      mkdirSync(path.dirname(FLAG_PATH), { recursive: true })
    }
    writeFileSync(FLAG_PATH, JSON.stringify({ blocked: true, updatedAt: new Date().toISOString() }, null, 2), "utf8")
    return
  }

  if (existsSync(FLAG_PATH)) {
    unlinkSync(FLAG_PATH)
  }
}

export async function GET() {
  return NextResponse.json({ blocked: readBlockedState() }, { status: 200 })
}

export async function PATCH(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const body = await req.json().catch(() => ({}))
    const blocked = Boolean(body.blocked)
    writeBlockedState(blocked)

    return NextResponse.json({ blocked }, { status: 200 })
  } catch (error) {
    console.error("Error updating tournament maintenance state:", error)
    return NextResponse.json({ error: "Impossibile aggiornare lo stato del torneo" }, { status: 500 })
  }
}
