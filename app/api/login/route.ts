import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { createHash, timingSafeEqual } from "crypto"
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rate-limit"

const LOGIN_RATE_LIMIT = { windowMs: 15 * 60 * 1000, max: 10 }

// Confronto a tempo costante: evita di rivelare informazioni tramite timing
function safeEqual(a: unknown, b: string) {
  if (typeof a !== "string") return false
  const ha = createHash("sha256").update(a).digest()
  const hb = createHash("sha256").update(b).digest()
  return timingSafeEqual(ha, hb)
}

export async function POST(req: Request) {
  const rateKey = `login:${getClientIp(req.headers)}`
  const { allowed, retryAfter } = checkRateLimit(rateKey, LOGIN_RATE_LIMIT)
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: `Troppi tentativi. Riprova tra ${Math.ceil((retryAfter ?? 60) / 60)} minuti.` },
      { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } }
    )
  }

  let body: { username?: unknown; password?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Body non valido" }, { status: 400 })
  }

  const { username, password } = body

  const adminUser = process.env.ADMIN_USERNAME
  const adminPass = process.env.ADMIN_PASSWORD
  const viewerUser = process.env.VIEWER_USERNAME
  const viewerPass = process.env.VIEWER_PASSWORD
  const jwtSecret = process.env.JWT_SECRET

  if (!adminUser || !adminPass || !jwtSecret) {
    console.error("Missing ADMIN_USERNAME, ADMIN_PASSWORD or JWT_SECRET")
    return NextResponse.json({ success: false, error: "Errore di configurazione del server" }, { status: 500 })
  }

  // Valutiamo entrambi i confronti per non creare differenze di tempo tra i rami
  const isAdminMatch = safeEqual(username, adminUser) && safeEqual(password, adminPass)
  const isViewerMatch =
    Boolean(viewerUser && viewerPass) &&
    safeEqual(username, viewerUser ?? "") &&
    safeEqual(password, viewerPass ?? "")

  const matchedProfile = isAdminMatch
    ? { username: adminUser, role: "admin" as const }
    : isViewerMatch
      ? { username: viewerUser as string, role: "viewer" as const }
      : null

  if (!matchedProfile) {
    return NextResponse.json({ success: false, error: "Credenziali non valide" }, { status: 401 })
  }

  resetRateLimit(rateKey)

  const token = jwt.sign({ username: matchedProfile.username, role: matchedProfile.role }, jwtSecret, {
    expiresIn: "1h",
    algorithm: "HS256",
  })

  const response = NextResponse.json({ success: true })
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  })

  return response
}
