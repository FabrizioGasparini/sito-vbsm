import { NextRequest, NextResponse } from "next/server"
import { getTournamentMatches, updateTournamentMatch } from "@/lib/tournament-data"

export async function GET() {
  try {
    const matches = await getTournamentMatches()
    return NextResponse.json(matches)
  } catch (error) {
    console.error("Error fetching tournament matches:", error)
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "ID partita mancante" }, { status: 400 })
    }

    const match = await updateTournamentMatch(id, data)
    return NextResponse.json(match)
  } catch (error) {
    console.error("Error updating tournament match:", error)
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 })
  }
}
