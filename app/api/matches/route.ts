import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ---------------- OPTIONS ----------------
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "https://volleyballsanmartino.it",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

// ---------------- GET ----------------
export async function GET() {
  try {
    const matches = await prisma.matches.findMany({
      orderBy: {
        data: "desc",
      },
    })

    // Parsing arbitri e booleani
    const parsedMatches = matches.map(match => {
      let arbitri: string[] = []

      try {
        if (match.arbitri) {
          arbitri = JSON.parse(match.arbitri)
          if (!Array.isArray(arbitri)) arbitri = []
        }
      } catch {
        arbitri = match.arbitri ? String(match.arbitri).split(",").map(s => s.trim()) : []
      }

      return {
        ...match,
        arbitri,
        casa: Boolean(match.casa),
        completata: Boolean(match.completata),
      }
    })

    return NextResponse.json(parsedMatches, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://volleyballsanmartino.it",
        "Access-Control-Allow-Credentials": "true",
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore database" }, { status: 500 })
  }
}
