import path from "path"

// Cartella esterna al progetto in cui vengono salvati gli upload (servita su /uploads dal server web).
export const UPLOAD_DIR = process.env.UPLOAD_DIR || "C:\\VBSM\\storage\\uploads"

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024

type DetectedType = { mime: string; ext: string }

/**
 * Riconosce il tipo reale del file dai "magic bytes", senza fidarsi di
 * nome o MIME dichiarati dal client (evita upload di HTML/SVG/script camuffati).
 */
export function detectFileType(buffer: Buffer): DetectedType | null {
  if (buffer.length < 12) return null

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" }
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mime: "image/png", ext: "png" }
  }
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return { mime: "image/webp", ext: "webp" }
  }
  if (buffer.subarray(0, 6).toString("ascii") === "GIF87a" || buffer.subarray(0, 6).toString("ascii") === "GIF89a") {
    return { mime: "image/gif", ext: "gif" }
  }
  if (buffer.subarray(0, 5).toString("ascii") === "%PDF-") return { mime: "application/pdf", ext: "pdf" }

  return null
}

/** Nome file sicuro: solo caratteri alfanumerici, trattini e underscore, lunghezza limitata */
export function sanitizeBaseName(fileName: string) {
  const base = path.parse(fileName).name.replace(/[^a-zA-Z0-9-]/g, "_").replace(/_+/g, "_")
  return base.slice(0, 80) || "file"
}
