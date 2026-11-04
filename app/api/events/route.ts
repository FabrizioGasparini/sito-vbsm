import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin, isAuthenticated } from "@/lib/auth"

// ---------------- OPTIONS ----------------
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "https://volleyballsanmartino.it",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

// ---------------- GET ----------------
export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const rows = await prisma.events.findMany({
      orderBy: [
        { data: 'asc' },
        { oraInizio: 'asc' },
      ],
    })

    // Converti BigInt in stringa
    const events = rows.map(event => ({
      ...event,
      id: event.id.toString(),  // <-- qui
    }))

    return NextResponse.json(events, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://volleyballsanmartino.it",
        "Access-Control-Allow-Credentials": "true",
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Errore database' }, { status: 500 })
  }
}

// ---------------- POST ----------------
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const body = await req.json()
    const { squadra, palestra, data, oraInizio, oraFine, tipo } = body

    if (!squadra || !palestra || !data || !oraInizio || !oraFine || !tipo) {
      return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 })
    }

    const created = await prisma.events.create({
      data: {
        squadra,
        palestra,
        data: new Date(data),
        oraInizio: new Date(oraInizio),
        oraFine: new Date(oraFine),
        tipo,
      },
    })

    return NextResponse.json(created, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://volleyballsanmartino.it",
        "Access-Control-Allow-Credentials": "true",
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore durante l'inserimento" }, { status: 500 })
  }
}
