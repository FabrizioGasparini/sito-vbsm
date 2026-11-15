import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { mediaUrl } from "@/lib/media"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Indirizzo dell'immagine; i file dell'archivio (upload, stagioni, loghi) puntano al dominio dei media quando è configurato */
export function normalizeImageSrc(value: string) {
  return mediaUrl(normalizeLocalImageSrc(value))
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
