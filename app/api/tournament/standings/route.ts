import { NextResponse } from "next/server"
import { getTournamentStandings } from "@/lib/tournament-data"

export async function GET() {
  try {
    const standings = await getTournamentStandings()
    return NextResponse.json(standings)
  } catch (error) {
    console.error("Error fetching tournament standings:", error)
    return NextResponse.json({ error: "Failed to fetch standings" }, { status: 500 })
  }
}
