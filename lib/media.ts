// Indirizzi dei file serviti dall'archivio (C:\VBSM\storage sul server, oppure il bucket R2 pubblico).
// Utilizzabile anche nei componenti client: nessun accesso al disco.

/**
 * Dominio pubblico del bucket R2 (es. https://media.vbsm.it).
 * È NEXT_PUBLIC_: viene incluso nel codice al momento della build, quindi va impostato prima di `npm run build`.
 */
export const MEDIA_URL = (process.env.NEXT_PUBLIC_MEDIA_URL || "").replace(/\/+$/, "")

/**
 * Percorsi che stanno nell'archivio, con le cartelle corrispondenti in C:\VBSM\storage:
 *   /uploads/…            ← storage\uploads        (immagini caricate dall'admin)
 *   /images/2025-26/…     ← storage\2025-26        (una cartella per stagione)
 *   /images/loghi/…       ← storage\loghi
 *   /pdfs/…               ← storage\pdfs
 */
const MEDIA_PATH = /^\/(?:uploads|pdfs)\/|^\/images\/(?:loghi|\d{4}-\d{2})\//

export function isMediaPath(pathname: string) {
  return MEDIA_PATH.test(pathname)
}

/** Percorso del sito → indirizzo sul dominio dei media (se configurato); gli altri percorsi restano invariati */
export function mediaUrl(pathname: string) {
  return MEDIA_URL && isMediaPath(pathname) ? `${MEDIA_URL}${pathname}` : pathname
}
