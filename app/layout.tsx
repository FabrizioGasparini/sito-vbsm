import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import "./globals.css"
import fs from "fs"
import path from "path"
import MaintenancePage from "@/components/maintenance"
import CookieConsent from "@/components/cookie-consent"
import { MotionProvider } from "@/components/motion-provider"
import {
  CONTACTS,
  DEFAULT_OG_IMAGE,
  FOUNDING_YEAR,
  LOGO_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
  absoluteUrl,
} from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Società di pallavolo a San Martino in Rio`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // canonical e og:url sono definiti pagina per pagina (lib/seo.ts), per non ereditare quelli della home
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: LOGO_IMAGE,
    shortcut: LOGO_IMAGE,
    apple: LOGO_IMAGE,
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: "#e11d48",
  width: "device-width",
  initialScale: 1,
}

// Dati strutturati Schema.org basati sulle informazioni di contatto già pubblicate nel sito
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: SITE_NAME,
  sport: "Volleyball",
  url: SITE_URL,
  logo: absoluteUrl(LOGO_IMAGE),
  foundingDate: String(FOUNDING_YEAR),
  email: CONTACTS.email,
  telephone: CONTACTS.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACTS.address.street,
    postalCode: CONTACTS.address.postalCode,
    addressLocality: CONTACTS.address.city,
    addressRegion: CONTACTS.address.province,
    addressCountry: CONTACTS.address.country,
  },
  sameAs: SOCIAL_LINKS.map((link) => link.href),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // NB: per le pagine statiche il flag viene letto al momento della build/rivalidazione
  const flagPath = path.join(process.cwd(), "manutenzione.flag")
  const underMaintenance = fs.existsSync(flagPath)

  if (underMaintenance) {
    return (
      <html lang="it">
        <head>
          <title>{`Manutenzione | ${SITE_NAME}`}</title>
          <meta name="robots" content="noindex" />
        </head>
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
          <MaintenancePage />
        </body>
      </html>
    )
  }

  return (
    <html lang="it">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased w-full min-w-0 overflow-x-hidden`}>
        <a href="#main-content" className="skip-link">
          Salta al contenuto principale
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
        />
        <MotionProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </MotionProvider>
        <CookieConsent />
      </body>
    </html>
  )
}
