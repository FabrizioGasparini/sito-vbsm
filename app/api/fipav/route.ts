import { NextResponse } from "next/server";
import { Championship, Match, SOCIETY_ID } from "@/lib/matches-data";

const COMMITTEE_IDS = ["99934", "99908"];

// La stagione sportiva inizia ad agosto: da agosto a dicembre vale l'anno corrente, altrimenti il precedente.
// Sovrascrivibile con FIPAV_SEASON_YEAR se il servizio esterno usa una convenzione diversa.
function currentSeasonYear() {
  const override = Number(process.env.FIPAV_SEASON_YEAR);
  if (Number.isInteger(override) && override > 2000) return override;
  const now = new Date();
  return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}

// Cache in memoria: evita decine di richieste al servizio esterno per ogni visita al calendario
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { data: unknown; expires: number } | null = null;

export async function GET() {
  if (cache && cache.expires > Date.now()) {
    return NextResponse.json(cache.data, { status: 200, headers: corsHeaders });
  }

  try {
    const seasonYear = currentSeasonYear();
    const allChampionships = await Promise.all(
      COMMITTEE_IDS.map(async (id) => {
        // post api to get championships for a specific committee https://www.tuttoincodice.com/livescore/read/campionati.php?anno=2026
        const res = await fetch(`https://www.tuttoincodice.com/livescore/read/campionati.php?anno=${seasonYear}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comitato: id }),
        });
        if (!res.ok) {
          console.error(`FIPAV committee ${id} returned ${res.status}`);
          return [];
        }

        const json: { data?: unknown } = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];

        return data.map((championship: Championship) => ({
          id: championship.id,
          parent: championship.title,
          title: championship.title,
          name: championship.title,
        }));
      })
    );

    const championships = allChampionships.flat();

    const results = await Promise.all(
      championships.map(async (championship) => {
        const res = await fetch(`https://www.tuttoincodice.com/livescore/read/giornate.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ campionato: championship.id }),
          next: { revalidate: 300 },
        });
        if (!res.ok) return { [championship.name]: [] };

        const json: { data?: { matches?: unknown } } = await res.json();

        const matches = (json.data && Array.isArray(json.data.matches) ? json.data.matches : [])
          .filter(
            (match: Match) =>
              match.team1.cod_aff_societa === SOCIETY_ID ||
              match.team2.cod_aff_societa === SOCIETY_ID
          )
          .map((match: Match) => {
            const totalSets =
              parseInt(match["team1-setwin"] || "0") +
              parseInt(match["team2-setwin"] || "0");

            const ptA = Array.isArray(match.pt_a) ? match.pt_a : [match.pt_a];
            const ptB = Array.isArray(match.pt_b) ? match.pt_b : [match.pt_b];
            const sets =
              totalSets > 0
                ? Array.from({ length: totalSets }, (_, i) => `${ptA[i] ?? ""} - ${ptB[i] ?? ""}`)
                : null;

            return {
              id: match.id,
              day: match.day,
              date: match.date,
              time: match.time,
              location: match.stadium,
              lat: match["lat-stadium"]?.replace(",", "."),
              long: match["lng-stadium"]?.replace(",", "."),
              match_number: match.ng,
              played: match.played,
              home_setwin: match["team1-setwin"],
              away_setwin: match["team2-setwin"],
              result:
                match["team1-setwin"] !== match["team2-setwin"]
                  ? `${match["team1-setwin"]} - ${match["team2-setwin"]}`
                  : null,
              sets: match["team1-setwin"] !== match["team2-setwin"] ? sets : null,
              home_team: {
                id: match.team1.id,
                title: match.team1.title,
                society: match.team1.nome_societa,
                society_id: match.team1.cod_aff_societa,
                logo: match.team1.logo,
              },
              away_team: {
                id: match.team2.id,
                title: match.team2.title,
                society: match.team2.nome_societa,
                society_id: match.team2.cod_aff_societa,
                logo: match.team2.logo,
              },
            };
          });

        return { [championship.name]: matches };
      })
    );

    const data = Object.assign({}, ...results.filter(obj => Object.values(obj)[0].length > 0));
    cache = { data, expires: Date.now() + CACHE_TTL_MS };

    return NextResponse.json(data, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("❌ Errore API:", err);
    return NextResponse.json({ error: "Error fetching championships" }, { status: 500 });
  }
}

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://volleyballsanmartino.it",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};