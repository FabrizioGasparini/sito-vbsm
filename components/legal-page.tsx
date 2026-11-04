import Link from "next/link"
import type React from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

type LegalSection = {
  title: string
  content: React.ReactNode
}

export function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation className="relative bg-black" />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-12 border-b border-border pb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Volleyball San Martino</p>
          <h1 className="font-ethnocentric text-3xl uppercase sm:text-5xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">{intro}</p>
        </header>
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-xl font-bold">{section.title}</h2>
              <div className="space-y-3 leading-7 text-muted-foreground">{section.content}</div>
            </section>
          ))}
        </div>
        <nav className="mt-16 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6 text-sm font-medium" aria-label="Pagine legali">
          <Link href="/privacy" className="text-primary hover:underline">Privacy policy</Link>
          <Link href="/cookies" className="text-primary hover:underline">Cookie policy</Link>
          <Link href="/termini" className="text-primary hover:underline">Termini di servizio</Link>
          <Link href="/note-legali" className="text-primary hover:underline">Note legali</Link>
          <Link href="/accessibilita" className="text-primary hover:underline">Accessibilità</Link>
        </nav>
      </main>
      <Footer />
    </div>
  )
}
