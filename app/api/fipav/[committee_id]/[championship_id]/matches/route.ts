import { NextRequest, NextResponse } from "next/server";
import { Match } from "@/lib/matches-data";

export async function GET(req: NextRequest, { params }: { params: Promise<{ committee_id: string; championship_id: string }> }) {
  try {

    const { committee_id, championship_id } = await params

    if (!/^[0-9]{1,10}$/.test(committee_id) || !/^[0-9]{1,10}$/.test(championship_id)) {
      return NextResponse.json({ error: "Parametri non validi" }, { status: 400 })
    }

    const matches = await fetch(`https://app.fipavonline.it/api/v1/calendar/${committee_id}/${championship_id}`).then(
      res => res.json().then(data => data.data.matches.filter((match: Match) => match["team1"]["cod_aff_societa"] === "080410047" || match["team2"]["cod_aff_societa"] === "080410047").map((match: Match) => {
        const totalSets = (parseInt(match["team1-setwin"] || "0") + parseInt(match["team2-setwin"] || "0"));
        const ptA = Array.isArray((match as Match)["pt_a"]) ? (match as Match)["pt_a"] : [(match as Match)["pt_a"]];
        const ptB = Array.isArray((match as Match)["pt_b"]) ? (match as Match)["pt_b"] : [(match as Match)["pt_b"]];
        const sets = totalSets > 0 ? (() => {
          const s: string[] = [];
          for (let i = 0; i < totalSets; i++) {
            const a = ptA[i] ?? "";
            const b = ptB[i] ?? "";
            s.push(`${a} - ${b}`);
          }
          return s;
        })() : null;


        return {
            id: match.id,
            day: match.day,
            date: match.date,
            time: match.time,
            location: match.stadium,
            lat: match["lat-stadium"].replace(",", "."),
            long: match["lng-stadium"].replace(",", "."),
            match_number: match.ng,
            played: match.played,
            home_setwin: match["team1-setwin"],
            away_setwin: match["team2-setwin"],
            result: match["team1-setwin"] != match["team2-setwin"] ? `${match["team1-setwin"]} - ${match["team2-setwin"]}` : null,
            sets: (match["team1-setwin"] != match["team2-setwin"]) ? sets : null,
            home_points: match["pt_a"],
            away_points: match["pt_b"],
            home_team: {
                id: match["team1"]["id"],
                title: match["team1"]["title"],
                society: match["team1"]["nome_societa"],
                society_id: match["team1"]["cod_aff_societa"],
                logo: match["team1"]["logo"],
            },
            away_team: {
                id: match["team2"]["id"],
                title: match["team2"]["title"],
                society: match["team2"]["nome_societa"],
                society_id: match["team2"]["cod_aff_societa"],
                logo: match["team2"]["logo"],
            },
        };
      }))
    );

    return NextResponse.json(matches, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error fetching matches" }, { status: 500 });
  }
}

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://volleyballsanmartino.it",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};
