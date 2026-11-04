"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, ShoppingBag } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { SHOP_URL } from "@/lib/site"

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Squadre", href: "/squadre" },
  { name: "Calendario", href: "/calendario" },
  { name: "News", href: "/news" },
  { name: "Gallerie", href: "/gallery" },
  { name: "Chi Siamo", href: "/chi-siamo" },
  { name: "Sponsor", href: "/sponsor" },
  { name: "Contatti", href: "/contatti" },
]

const highlightItems: { name: string; href: string }[] = [
  //{ name: "24 H", href: "/torneo-24h" },
]

export function Navigation({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`))

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflowY = "hidden"
    } else {
      document.body.style.overflowY = ""
    }
    return () => {
      document.body.style.overflowY = ""
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const toggle = menuButtonRef.current
    // Sposta il focus nel menu all'apertura e lo riporta sul pulsante alla chiusura
    const focusTimer = window.setTimeout(() => {
      document.querySelector<HTMLElement>("#mobile-navigation a")?.focus()
    }, 50)
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener("keydown", closeOnEscape)
      toggle?.focus()
    }
  }, [isOpen])

  return (
    <>
      <nav
        aria-label="Navigazione principale"
        className={cn(
          // Header fisso: trasparente sopra l'hero, scuro e compatto dopo lo scroll (nessuno spostamento del layout)
          "fixed top-0 left-0 right-0 z-50 transition-[background-color,padding,box-shadow] duration-300 px-4 sm:px-6 lg:px-8",
          scrolled || isOpen ? "bg-[#05080d]/90 backdrop-blur-md border-b border-white/10 shadow-lg py-2" : "bg-transparent py-4",
          className
        )}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex items-center" onClick={() => setIsOpen(false)}>
            <img decoding="async"
              src="/images/loghi/lungo-bianco.webp"
              alt="Volleyball San Martino"
              className={cn("w-auto transition-all duration-300", scrolled ? "h-8" : "h-10 sm:h-12")}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className={cn(
            "hidden lg:flex items-center space-x-1 px-2 py-1 rounded-full border transition-all duration-300",
            scrolled ? "bg-white/5 border-white/10" : "bg-black/20 backdrop-blur-md border-white/10"
          )}>
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/10 group",
                  "text-white/90 hover:text-white",
                  isActive(item.href) && "text-white"
                )}
              >
                {item.name}
                <span aria-hidden="true" className={cn("absolute inset-x-3 bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left", isActive(item.href) && "scale-x-100")} />
              </Link>
            ))}
            {highlightItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-4 py-2 text-sm font-bold transition-colors rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-white border border-primary/30"
              >
                {item.name}
              </Link>
            ))}
            <Button asChild variant="default" size="sm" className="ml-2 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <a href={SHOP_URL} target="_blank" rel="noopener noreferrer">
                <ShoppingBag className="w-4 h-4 mr-2" aria-hidden="true" /> Shop
                <span className="sr-only"> (si apre in una nuova scheda)</span>
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden z-50">
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
              className={cn(
                "transition-colors text-white hover:bg-white/10 hover:text-white"
              )}
            >
              {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </nav>
      {/* Destinazione del link "Salta al contenuto" (app/layout.tsx) */}
      <div id="main-content" tabIndex={-1} className="outline-none" />

      {/* Mobile Navigation Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Menu di navigazione"
              className="fixed inset-0 z-40 bg-[#05080d] text-white pt-24 px-6 pb-8 overflow-y-auto lg:hidden flex flex-col"
            >
              <div className="flex flex-col space-y-6 mt-4">
                {navigationItems.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn("block text-2xl font-bold hover:text-primary transition-colors py-2 border-b border-white/10", isActive(item.href) ? "text-primary" : "text-white")}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                {highlightItems.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (navigationItems.length + idx) * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block text-2xl font-bold text-primary hover:text-primary/80 transition-colors py-2 border-b border-primary/30"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-6"
                >
                  <Button asChild size="lg" className="w-full rounded-full text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <a href={SHOP_URL} target="_blank" rel="noopener noreferrer">
                      <ShoppingBag className="w-5 h-5 mr-2" aria-hidden="true" /> Shop Online
                      <span className="sr-only"> (si apre in una nuova scheda)</span>
                    </a>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
