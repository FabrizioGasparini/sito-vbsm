import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeImageSrc(value: string) {
  if (!value) return ""

  const src = value.replace(/\\/g, "/")

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
