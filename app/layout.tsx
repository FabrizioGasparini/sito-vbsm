import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import "./globals.css"
import fs from "fs"
import path from "path"
import MaintenancePage from "@/components/maintenance"
import PageTitle from "@/components/page-title"
import CookieConsent from "@/components/cookie-consent"


export const metadata: Metadata = {
  title: "Volleyball San Martino - Società Sportiva",
  description: "Sito ufficiale della società sportiva Volleyball San Martino. Scopri le nostre squadre, calendari, news e molto altro.",
  icons: {
    icon: "/images/loghi/main.png",
    shortcut: "/images/loghi/main.png",
    apple: "/images/loghi/main.png",
    other: { rel: "apple-touch-icon", url: "/images/loghi/main.png" },
  },
  keywords: "volleyball, pallavolo, San Martino, sport, squadre, tornei",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const flagPath = path.join(process.cwd(), "manutenzione.flag")
  const underMaintenance = fs.existsSync(flagPath)

  if (underMaintenance) {
    return (
      <html lang="it">
        <head>
          <title>Manutenzione | Volleyball San Martino</title>
        </head>
        <body>
          <MaintenancePage />
        </body>
      </html>
    )
  }

  return (
    <html lang="it">
      <head />
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased w-full min-w-0 overflow-x-hidden`}>
        <PageTitle />
        <Suspense fallback={null}>{children}</Suspense>
        <CookieConsent />
      </body>
    </html>
  )
}
