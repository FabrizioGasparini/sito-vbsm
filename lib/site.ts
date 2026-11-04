// Dati anagrafici e di contatto della società, usati da metadata SEO, dati strutturati e footer.
// Tutti i valori provengono dai contenuti già presenti nel sito.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://volleyballsanmartino.it").replace(/\/+$/, "")

export const SITE_NAME = "Volleyball San Martino"

export const SITE_DESCRIPTION =
  "Sito ufficiale della società sportiva Volleyball San Martino di San Martino in Rio (RE): squadre, calendario partite, news, gallerie e contatti."

export const FOUNDING_YEAR = 1984

export const CONTACTS = {
  phone: "+393534862102",
  phoneLabel: "+39 353 486 2102",
  email: "info@volleyballsanmartino.it",
  address: {
    street: "Piazza V. Carnevali, 1",
    postalCode: "42018",
    city: "San Martino in Rio",
    province: "RE",
    country: "IT",
  },
  mapsUrl: "https://maps.app.goo.gl/2REvMGqEKRLT2x9Z6",
} as const

export const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/VolleyBallSanMartino/" },
  { name: "Instagram", href: "https://www.instagram.com/volley_ball_san_martino/" },
  { name: "YouTube", href: "https://www.youtube.com/@volleyballsanmartino5064" },
] as const

export const SHOP_URL = "https://sanmartino.ninesquared.club"

export const DEFAULT_OG_IMAGE = "/images/2025-26/pages/societa.webp"

export const LOGO_IMAGE = "/images/loghi/main.png"

export function absoluteUrl(pathname = "/") {
  if (/^https?:\/\//i.test(pathname)) return pathname
  return `${SITE_URL}${pathname.startsWith("/") ? "" : "/"}${pathname}`
}
