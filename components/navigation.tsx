"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ShoppingBag } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

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

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
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
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [isOpen])

  const showDark = scrolled || isOpen

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          " top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 lg:px-8 py-4",
          scrolled ? "bg-background/80 backdrop-blur-md border-b border-white/10 shadow-lg py-2" : "bg-transparent absolute",
          className
        )}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex items-center" onClick={() => setIsOpen(false)}>
            <img
              src="/images/loghi/lungo-bianco.webp"
              alt="Volleyball San Martino"
              className={cn("w-auto transition-all duration-300", scrolled ? "h-8" : "h-10 sm:h-12")}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className={cn(
            "hidden lg:flex items-center space-x-1 px-2 py-1 rounded-full border transition-all duration-300",
            scrolled
              ? "bg-background/50 backdrop-blur-sm border-border/50"
              : "bg-black/20 backdrop-blur-md border-white/10"
          )}>
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/10 group",
                  scrolled ? "text-foreground/80 hover:text-primary" : "text-white/90 hover:text-white"
                )}
              >
                {item.name}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
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
              <Link href="https://sanmartino.ninesquared.club" target="_blank">
                <ShoppingBag className="w-4 h-4 mr-2" /> Shop
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
              className={cn(
                "hover:bg-black/5 transition-colors",
                showDark ? "text-foreground" : "text-white hover:bg-white/10"
              )}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </motion.nav>

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
              aria-label="Navigazione principale"
              className="fixed inset-0 z-40 bg-background pt-24 px-6 pb-8 overflow-y-auto lg:hidden flex flex-col"
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
                      className="block text-2xl font-bold text-foreground hover:text-primary transition-colors py-2 border-b border-border/50"
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
                    <Link href="https://sanmartino.ninesquared.club" target="_blank">
                      <ShoppingBag className="w-5 h-5 mr-2" /> Shop Online
                    </Link>
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
