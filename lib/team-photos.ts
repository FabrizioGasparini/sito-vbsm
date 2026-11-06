// Percorsi convenzionali delle foto di squadra, giocatori e staff in public/images.
// Le foto sono facoltative: l'API /api/teams indica per ognuno se la foto esiste (campo `photo`).

export const TEAM_PHOTOS_BASE = "/images/2025-26/squadre"

/** "Rossi", "Maria Chiara" → "rossi-maria-chiara" (stesso nome file usato finora nella cartella della squadra) */
export function personPhotoFileName(nome: string, cognome: string) {
  return `${cognome}-${nome}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

export function conventionalPersonPhoto(teamId: string, nome: string, cognome: string) {
  return `${TEAM_PHOTOS_BASE}/${teamId}/${personPhotoFileName(nome, cognome)}.webp`
}

export function conventionalTeamPhoto(teamId: string) {
  return `${TEAM_PHOTOS_BASE}/${teamId}/squadra.webp`
}

/** Iniziali per il segnaposto quando manca la foto */
export function initials(nome: string, cognome: string) {
  return `${nome.trim().charAt(0)}${cognome.trim().charAt(0)}`.toUpperCase()
}
