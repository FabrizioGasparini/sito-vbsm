export interface Championship {
  id: string;
  parent: string;
  title: string;
  "title-short": string;
}

export interface Match {
  id: string;
  day: string;
  date: string;
  time: string;
  stadium: string;
  "lat-stadium": string;
  "lng-stadium": string;
  ng: string;
  played: string;
  "team1-setwin": string;
  "team2-setwin": string;
  "pt_a": string | string[];
  "pt_b": string | string[];
  team1: Team;
  team2: Team;
}

export interface Team {
  id: string;
  title: string;
  nome_societa: string;
  cod_aff_societa: string;
  logo: string;
}

export const SOCIETY_ID = "080410047";

// ---------------------------------------------------------------------------
// Formato attuale di tuttoincodice.com (giornate.php)
// ---------------------------------------------------------------------------

/** Partita così come restituita da https://www.tuttoincodice.com/livescore/read/giornate.php */
export interface RawFipavMatch {
  gara: string;
  id_real: string | null;
  girone: string;
  commettee: string;
  sqcasa: string | null;
  sqtras: string | null;
  risultato: string | null; // "3-1" oppure "-" se non giocata
  parziali: string | null; // "25-19 25-20 25-20"
  data: string | null; // "2026-12-04 20:00:00"
  palestra: string | null;
  latitude: string | null;
  longitude: string | null;
  title: string | null;
  logo1: string | null;
  logo2: string | null;
}

export interface CalendarTeam {
  title: string;
  logo: string | null;
  is_vbsm: boolean;
}

/** Partita normalizzata restituita da /api/fipav */
export interface CalendarMatch {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  /** "Palestra - Città (PR) - Indirizzo": le parti mancanti vengono omesse */
  location: string;
  /** Testo da usare per la ricerca su Google Maps */
  maps_query: string;
  played: boolean;
  result: string | null; // "3-1"
  home_setwin: number | null;
  away_setwin: number | null;
  sets: string[]; // ["25 - 19", ...]
  /** true se la squadra VBSM gioca in casa */
  is_home: boolean;
  home_team: CalendarTeam;
  away_team: CalendarTeam;
}

/** Risposta di /api/fipav: partite raggruppate per nome del campionato */
export type CalendarResponse = Record<string, CalendarMatch[]>;

/**
 * Le squadre della società sono riconoscibili dal nome:
 * contiene "VBSM" oppure "VOLLEY BALL SAN MARTINO" (anche scritto "VOLLEYBALL SAN MARTINO")
 */
export function isVbsmTeam(name: string | null | undefined) {
  return /\bVBSM\b|\bVOLLEY\s*BALL\s+SAN\s+MARTINO\b/i.test(name || "");
}
