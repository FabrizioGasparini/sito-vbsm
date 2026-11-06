import { NextResponse } from "next/server";
import { isVbsmTeam, type CalendarMatch, type CalendarResponse, type RawFipavMatch } from "@/lib/matches-data";

const BASE_URL = "https://www.tuttoincodice.com/livescore/read";
const COMMITTEE_IDS = ["99934", "99908", "1000007"];
const REQUEST_TIMEOUT_MS = 20_000;
// Più parallelismo non accelera (il servizio esterno risponde in sequenza) e oltre ~100 richieste va in timeout
const MAX_PARALLEL_REQUESTS = 6;

/** Esegue `worker` su tutti gli elementi con al massimo `limit` operazioni in parallelo */
async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

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
let cache: { data: CalendarResponse; expires: number } | null = null;

type RawChampionship = { id: string; title: string; eliminato?: string };

// ---------------------------------------------------------------------------
// Pulizia dei dati del servizio esterno
// ---------------------------------------------------------------------------

/**
 * Corregge i difetti di codifica del servizio esterno:
 * - testo codificato due volte in UTF-8 ("1Â°" → "1°")
 * - entità HTML ridotte al solo codice numerico ("NELL39EMILIA" → "NELL'EMILIA", "Libert224" → "Libertà")
 */
function cleanText(value: string | null | undefined) {
  let text = (value || "").trim();

  if (/[ÂÃ]/.test(text)) {
    const decoded = Buffer.from(text, "latin1").toString("utf8");
    if (!decoded.includes("�")) text = decoded;
  }

  const seasonYear = currentSeasonYear();
  const nextYear = seasonYear + 1;

  return text
    .replace(/([A-Za-z])39/g, "$1'")
    .replace(
      /([A-Za-z])(19[2-9]|2[0-4]\d|25[0-5])(?![0-9])/g,
      (_, letter: string, code: string) =>
        letter + String.fromCharCode(Number(code))
    )
    .replace(
      /^Pallavolo\s+\d{4}\/\d{4}\s+(.+?)\s+-\s+\1\s+/i,
      "CSI $1 "
    )
    .replace(/\s+/g, " ");
}

const STREET_WORDS = "VIA|VIALE|PIAZZA|PIAZZALE|STRADA|CORSO|LARGO|VICOLO|LOCALITA|LOC|FRAZIONE|STR"

/**
 * Il campo "palestra" arriva come "Pal Einaudi CORREGGIO REPiazzale 2 Agosto":
 * nome impianto, città in maiuscolo, sigla della provincia attaccata all'indirizzo.
 */
function parseVenue(raw: string | null) {
  const text = cleanText(raw);

  // Caso tipico: nome impianto in minuscolo, città in maiuscolo, "RE" + indirizzo con iniziale maiuscola
  const mixed = text.match(/^(.*?)\s+((?:[A-Z][A-Z']+\s+)*[A-Z][A-Z']+)\s+([A-Z]{2})(?=[A-Z][a-z]|\d|$)(.*)$/);
  if (mixed && /[a-z]/.test(mixed[1])) {
    const [, venue, city, province, address] = mixed;
    return { venue: venue.trim(), city: `${city.trim()} (${province})`, address: address.trim() };
  }

  // Testo tutto in maiuscolo ("PALESTRA COMUNALE CAVEZZO MOVIA ALLENDE"): impianto e città non sono
  // separabili, ma la sigla della provincia è attaccata alla parola che apre l'indirizzo
  const upper = text.match(new RegExp(`^(.*?)\\s+([A-Z]{2})((?:${STREET_WORDS})\\b.*)$`, "i"))
  if (upper && /^[A-Z]{2}$/.test(upper[2])) {
    const [, venueAndCity, province, address] = upper;
    return { venue: `${venueAndCity.trim()} (${province})`, city: "", address: address.trim() };
  }

  return { venue: text, city: "", address: "" };
}

/** "2026-12-04 20:00:00" → { date: "2026-12-04", time: "20:00" } */
function parseDateTime(raw: string | null) {
  const match = (raw || "").match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!match) return null;
  return { date: match[1], time: match[2] ? `${match[2]}:${match[3]}` : "" };
}

function parseScore(raw: string | null) {
  const match = (raw || "").trim().match(/^(\d+)\s*-\s*(\d+)$/);
  if (!match) return null;
  return { home: Number(match[1]), away: Number(match[2]) };
}

function parseSets(raw: string | null) {
  return (raw || "")
    .split(/\s+/)
    .map((set) => set.match(/^(\d+)-(\d+)$/))
    .filter((set): set is RegExpMatchArray => set !== null)
    .map((set) => `${set[1]} - ${set[2]}`);
}

function cleanLogo(url: string | null) {
  if (!url || /no-image/i.test(decodeURIComponent(url))) return null;
  return url.startsWith("https://") ? url : null;
}

function normalizeMatch(raw: RawFipavMatch): CalendarMatch | null {
  const when = parseDateTime(raw.data);
  if (!when) return null;

  const homeTitle = cleanText(raw.sqcasa);
  const awayTitle = cleanText(raw.sqtras);
  const score = parseScore(raw.risultato);
  // "0-0" indica una gara non ancora disputata
  const played = Boolean(score && score.home + score.away > 0);
  const { venue, city, address } = parseVenue(raw.palestra);

  return {
    id: raw.id_real || raw.gara,
    date: when.date,
    time: when.time,
    location: [venue, city, address].filter(Boolean).join(" - "),
    maps_query: [venue, address, city].filter(Boolean).join(", "),
    played,
    result: played && score ? `${score.home}-${score.away}` : null,
    home_setwin: played && score ? score.home : null,
    away_setwin: played && score ? score.away : null,
    sets: played ? parseSets(raw.parziali) : [],
    is_home: isVbsmTeam(homeTitle),
    home_team: { title: homeTitle, logo: cleanLogo(raw.logo1), is_vbsm: isVbsmTeam(homeTitle) },
    away_team: { title: awayTitle, logo: cleanLogo(raw.logo2), is_vbsm: isVbsmTeam(awayTitle) },
  };
}

// ---------------------------------------------------------------------------
// Chiamate al servizio esterno
// ---------------------------------------------------------------------------

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${url} ha risposto ${res.status}`);
  return res.json();
}

async function fetchChampionships(committeeId: string, seasonYear: number): Promise<RawChampionship[]> {
  try {
    const json = await fetchJson(`${BASE_URL}/campionati.php?anno=${seasonYear}&comitato=${committeeId}`);
    if (!Array.isArray(json)) return [];
    return json.filter((c): c is RawChampionship => Boolean(c?.id) && c.eliminato !== "1");
  } catch (error) {
    console.error(`FIPAV: campionati del comitato ${committeeId} non disponibili`, error);
    return [];
  }
}

/** Partite di un campionato; `null` se la richiesta è fallita (diverso da "nessuna partita") */
async function fetchMatches(championshipId: string): Promise<RawFipavMatch[] | null> {
  try {
    const json = await fetchJson(`${BASE_URL}/giornate.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campionato: championshipId }),
    });
    return Array.isArray(json) ? json : [];
  } catch (error) {
    console.error(`FIPAV: partite del campionato ${championshipId} non disponibili`, error);
    return null;
  }
}

// Un solo aggiornamento alla volta, condiviso tra le richieste che arrivano nel frattempo
let inflight: Promise<CalendarResponse> | null = null;

function refreshCalendar() {
  if (!inflight) {
    inflight = buildCalendar().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

export async function GET() {
  if (cache) {
    // Dati scaduti: rispondiamo subito con l'ultima versione e aggiorniamo in background
    if (cache.expires <= Date.now()) refreshCalendar().catch((err) => console.error("❌ Errore API FIPAV:", err));
    return NextResponse.json(cache.data, { status: 200, headers: corsHeaders });
  }

  try {
    const data = await refreshCalendar();
    return NextResponse.json(data, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("❌ Errore API FIPAV:", err);
    return NextResponse.json({ error: "Error fetching championships" }, { status: 500 });
  }
}

// Il servizio esterno elabora le richieste in sequenza (~0,2 s ciascuna): scaricare tutti i ~75 campionati
// richiede ~15 s indipendentemente dal parallelismo. Per questo, negli aggiornamenti ordinari si scaricano
// solo i campionati in cui gioca una squadra VBSM (più quelli nuovi), e periodicamente si ripete la scansione completa.
const FULL_SCAN_INTERVAL_MS = 6 * 60 * 60 * 1000;
let lastFullScan = 0;
/** Campionati già controllati almeno una volta */
const scannedChampionships = new Set<string>();
/** Ultime partite VBSM trovate per campionato (solo quelli che ne contengono) */
const vbsmMatchesByChampionship = new Map<string, CalendarMatch[]>();

async function buildCalendar(): Promise<CalendarResponse> {
    const seasonYear = currentSeasonYear();
    const championships = (await Promise.all(COMMITTEE_IDS.map((id) => fetchChampionships(id, seasonYear)))).flat();

    // Se il servizio non ha risposto affatto non sovrascriviamo la cache con una risposta vuota
    if (championships.length === 0) {
      if (cache) return cache.data;
      throw new Error("Nessun campionato ricevuto dal servizio esterno");
    }

    const fullScan = Date.now() - lastFullScan > FULL_SCAN_INTERVAL_MS;
    const toFetch = championships.filter(
      (c) => fullScan || vbsmMatchesByChampionship.has(c.id) || !scannedChampionships.has(c.id)
    );

    let failures = 0;
    await mapWithConcurrency(toFetch, MAX_PARALLEL_REQUESTS, async (championship) => {
        const raw = await fetchMatches(championship.id);
        // Errore di rete: si mantengono i dati precedenti di questo campionato
        if (raw === null) {
          failures++;
          return;
        }
        const matches = raw
          // Solo le gare delle squadre della società ("VBSM" o "VOLLEY BALL SAN MARTINO" nel nome)
          .filter((match) => isVbsmTeam(match.sqcasa) || isVbsmTeam(match.sqtras))
          .map(normalizeMatch)
          .filter((match): match is CalendarMatch => match !== null)
          .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
        scannedChampionships.add(championship.id);
        if (matches.length > 0) vbsmMatchesByChampionship.set(championship.id, matches);
        else vbsmMatchesByChampionship.delete(championship.id);
    });

    if (fullScan && failures === 0) lastFullScan = Date.now();

    const data: CalendarResponse = {};
    for (const championship of championships) {
      const matches = vbsmMatchesByChampionship.get(championship.id);
      if (!matches?.length) continue;
      // Campionati con lo stesso nome in comitati diversi vengono uniti
      const name = cleanText(championship.title);
      data[name] = [...(data[name] ?? []), ...matches];
    }

    cache = { data, expires: Date.now() + CACHE_TTL_MS };
    return data;
}

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://volleyballsanmartino.it",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};
