import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Dominio pubblico del bucket R2 con gli upload (es. https://media.vbsm.it).
 * È NEXT_PUBLIC_: viene incluso nel codice al momento della build, quindi va impostato prima di `npm run build`.
 */
const MEDIA_URL = (process.env.NEXT_PUBLIC_MEDIA_URL || "").replace(/\/+$/, "")

/** Indirizzo dell'immagine; gli upload ("/uploads/...") puntano al dominio dei media quando è configurato */
export function normalizeImageSrc(value: string) {
  const src = normalizeLocalImageSrc(value)
  return MEDIA_URL && src.startsWith("/uploads/") ? `${MEDIA_URL}${src}` : src
}

function normalizeLocalImageSrc(value: string) {
  if (!value) return ""

  // Normalizza separatori e prefissi duplicati salvati per errore (es. "/images/images/uploads/...")
  const src = value.replace(/\\/g, "/").replace(/^\/?(images\/)+(?=images\/)/, "/")

  if (
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  ) {
    return src
  }

  if (src.startsWith("/images/uploads/")) {
    return src.replace(/^\/images/, "")
  }

  if (src.startsWith("/upload/")) {
    return src.replace(/^\/upload\//, "/uploads/")
  }

  if (src.startsWith("upload/")) {
    return `/uploads/${src.slice("upload/".length)}`
  }

  if (src.startsWith("/uploads/")) {
    return src
  }

  if (src.startsWith("uploads/")) {
    return `/${src}`
  }

  if (src.startsWith("/public/images/")) {
    return src.replace(/^\/public/, "")
  }

  if (src.startsWith("public/images/")) {
    return `/${src}`
  }

  if (src.startsWith("images/")) {
    return `/${src}`
  }

  return src.startsWith("/") ? src : `/${src}`
}
