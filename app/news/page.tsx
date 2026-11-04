"use client"

import { useEffect, useRef, useState, type SyntheticEvent } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { NewsArticle } from "@/lib/news-data"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import { Calendar, User, ArrowRight, Search, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { normalizeImageSrc } from "@/lib/utils"

export default function NewsPage() {
  const [categoriaFiltro, setCategoriaFiltro] = useState("Tutte")
  const [searchQuery, setSearchQuery] = useState("")
  const [categorie, setCategorie] = useState<string[]>([])
  const [allNews, setAllNews] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [visibleRecentCount, setVisibleRecentCount] = useState(12)
  const [collapsedSeasons, setCollapsedSeasons] = useState<Set<string>>(() => new Set())
  const [failedImagePaths, setFailedImagePaths] = useState<Set<string>>(() => new Set())
  const failedImagePathsRef = useRef(new Set<string>())
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/news");
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const payload: unknown = await response.json();
        const data: NewsArticle[] = Array.isArray(payload) ? payload : [];
        const categories = ["Tutte", ...new Set(data.map((article) => article.categoria))];
        setCategorie(categories);
        setAllNews(data);
      } catch (error) {
        console.error("Failed to fetch news", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData();
  }, []);

  const filteredNews = allNews.filter(article => {
    const matchesCategory = categoriaFiltro === "Tutte" || article.categoria === categoriaFiltro
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch = !query ||
      (article.titolo || "").toLowerCase().includes(query) ||
      (article.estratto || "").toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })

  const orderedNews = [...filteredNews].sort((a, b) => {
    return new Date(b.data).getTime() - new Date(a.data).getTime()
  })

  const featuredNews = orderedNews.filter((article) => article.featured)
  const recentNews = orderedNews.filter((article) => !article.featured)

  const heroArticle = featuredNews[0] || orderedNews[0]
  const editorialLead = featuredNews[1] || recentNews[0]
  const sidebarArticles = featuredNews.slice(2, 4)
  const bottomArticles = orderedNews.slice(0, visibleRecentCount)
  const newsBySeason = bottomArticles.reduce<Record<string, NewsArticle[]>>((groups, article) => {
    const dateParts = article.data.split("-").map(Number)
    const year = dateParts[0]
    const month = dateParts[1]
    const seasonStartYear = month >= 9 ? year : year - 1
    const season = `${seasonStartYear}-${String((seasonStartYear + 1) % 100).padStart(2, "0")}`

    if (!groups[season]) groups[season] = []
    groups[season].push(article)
    return groups
  }, {})
  const seasons = Object.entries(newsBySeason).sort(([seasonA], [seasonB]) => {
    return Number(seasonB.slice(0, 4)) - Number(seasonA.slice(0, 4))
  })

  const formatData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getImagePath = (value: string) => {
    const imagePath = normalizeImageSrc(value)
    return !imagePath || failedImagePaths.has(imagePath) ? "/images/placeholder.svg" : imagePath
  }

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const imagePath = event.currentTarget.dataset.imagePath
    if (!imagePath || imagePath === "/images/placeholder.svg" || failedImagePathsRef.current.has(imagePath)) return

    failedImagePathsRef.current.add(imagePath)
    setFailedImagePaths((current) => new Set(current).add(imagePath))
  }

  useEffect(() => {
    setVisibleRecentCount(12)
  }, [categoriaFiltro, searchQuery])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || visibleRecentCount >= orderedNews.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleRecentCount((current) => Math.min(current + 12, orderedNews.length))
        }
      },
      { rootMargin: "300px 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [visibleRecentCount, orderedNews.length])

  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <Navigation />

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(225,29,72,0.17),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_30%),linear-gradient(180deg,#06090e_0%,#030508_100%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16" aria-busy={isLoading}>
        <h1 className="sr-only">News Volleyball San Martino</h1>
        {isLoading ? (
          <div className="space-y-12">
            <Skeleton className="h-[420px] w-full rounded-2xl bg-white/10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-44 w-full rounded-xl bg-white/10" />
                  <Skeleton className="h-4 w-3/4 bg-white/10" />
                  <Skeleton className="h-4 w-1/2 bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {heroArticle ? (
              <>
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="relative overflow-hidden rounded-2xl border border-white/10 mb-6"
                >
                  <div className="absolute inset-0">
                    <img fetchPriority="high" decoding="async"
                      src={getImagePath(heroArticle.immagine)}
                      data-image-path={normalizeImageSrc(heroArticle.immagine) || "/images/placeholder.svg"}
                      alt={heroArticle.titolo}
                      className="h-full w-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 to-transparent" />

                  <div className="relative z-10 px-6 py-10 sm:p-10 lg:p-14 min-h-[360px] lg:min-h-[430px] flex flex-col justify-end">
                    <div className="max-w-3xl space-y-4">
                      <Badge className="bg-red-600 text-white hover:bg-red-500 uppercase tracking-[0.18em] text-[10px] font-semibold">
                        In evidenza
                      </Badge>
                      <h2 className="font-ethnocentric text-3xl leading-[1.04] sm:text-4xl lg:text-6xl uppercase text-white drop-shadow-xl">
                        {heroArticle.titolo}
                      </h2>
                      <p className="text-slate-200/90 text-sm sm:text-base max-w-2xl line-clamp-3">
                        {heroArticle.estratto}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatData(heroArticle.data)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {heroArticle.autore}
                        </span>
                      </div>
                      <Link href={`/news/${heroArticle.slug}`} className="inline-flex">
                        <Button className="bg-white text-black hover:bg-red-500 hover:text-white transition-colors uppercase tracking-wider text-xs">
                          Leggi articolo
                          <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.section>

                <section className="rounded-2xl border border-white/10 bg-[#070d16]/75 backdrop-blur-md p-3 sm:p-4 mb-10">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {categorie.map((categoria) => {
                        const active = categoriaFiltro === categoria
                        return (
                          <button
                            key={categoria}
                            onClick={() => setCategoriaFiltro(categoria)}
                            className={`shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-widest rounded-full border transition-colors ${
                              active
                                ? "bg-red-600 border-red-500 text-white"
                                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            {categoria}
                          </button>
                        )
                      })}
                    </div>

                    <div className="relative w-full md:w-72">
                      <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="search"
                        aria-label="Cerca tra le news"
                        placeholder="Cerca nelle news..."
                        className="pl-9 bg-black/25 border-white/15 text-slate-200 placeholder:text-slate-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                {featuredNews.length > 0 && (
                  <section className="mb-12">
                    <div className="mb-6 flex items-center gap-3">
                      <span className="text-xs uppercase tracking-[0.22em] text-red-400 font-semibold">In evidenza</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {editorialLead && (
                        <article className="lg:col-span-2 rounded-2xl overflow-hidden border border-white/10 bg-[#09121e] group">
                          <Link href={`/news/${editorialLead.slug}`}>
                            <div className="relative aspect-[16/9] overflow-hidden">
                              <img loading="lazy" decoding="async"
                                src={getImagePath(editorialLead.immagine)}
                                data-image-path={normalizeImageSrc(editorialLead.immagine) || "/images/placeholder.svg"}
                                alt={editorialLead.titolo}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={handleImageError}
                              />
                            </div>
                            <div className="p-5 sm:p-6 space-y-3">
                              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{formatData(editorialLead.data)}</p>
                              <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-white group-hover:text-red-400 transition-colors">
                                {editorialLead.titolo}
                              </h2>
                              <p className="text-slate-300 line-clamp-2">{editorialLead.estratto}</p>
                            </div>
                          </Link>
                        </article>
                      )}

                      <div className="space-y-6">
                        {sidebarArticles.map((articolo) => (
                          <article key={articolo.id} className="rounded-2xl overflow-hidden border border-white/10 bg-[#09121e] group">
                            <Link href={`/news/${articolo.slug}`}>
                              <div className="relative aspect-[16/11] overflow-hidden">
                                <img loading="lazy" decoding="async"
                                  src={getImagePath(articolo.immagine)}
                                  data-image-path={normalizeImageSrc(articolo.immagine) || "/images/placeholder.svg"}
                                  alt={articolo.titolo}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={handleImageError}
                                />
                              </div>
                              <div className="p-4 space-y-2">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{formatData(articolo.data)}</p>
                                <h3 className="text-lg font-semibold leading-snug text-white group-hover:text-red-400 transition-colors line-clamp-3">
                                  {articolo.titolo}
                                </h3>
                              </div>
                            </Link>
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {bottomArticles.length > 0 && (
                  <section className="space-y-12">
                    {seasons.map(([season, seasonArticles]) => (
                      <Collapsible
                        key={season}
                        open={!collapsedSeasons.has(season)}
                        onOpenChange={(open) => {
                          setCollapsedSeasons((current) => {
                            const next = new Set(current)
                            if (open) next.delete(season)
                            else next.add(season)
                            return next
                          })
                        }}
                        className="p-4 sm:p-6"
                      >
                        <CollapsibleTrigger className="group flex w-full items-center gap-3 text-left">
                          <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                          <span className="text-xs uppercase tracking-[0.22em] text-slate-200 font-semibold">
                            Stagione {season}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-slate-500">
                            {seasonArticles.length} {seasonArticles.length === 1 ? "articolo" : "articoli"}
                          </span>
                          <span className="h-px flex-1 bg-gradient-to-r from-red-500/50 via-blue-400/30 to-transparent" />
                        </CollapsibleTrigger>

                        <CollapsibleContent className="pt-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {seasonArticles.map((articolo) => (
                              <article key={articolo.id} className="rounded-2xl overflow-hidden border border-blue-300/15 bg-[#071321] group shadow-lg shadow-black/10">
                                <Link href={`/news/${articolo.slug}`}>
                                  <div className="relative aspect-[16/10] overflow-hidden">
                                    <img loading="lazy" decoding="async"
                                      src={getImagePath(articolo.immagine)}
                                      data-image-path={normalizeImageSrc(articolo.immagine) || "/images/placeholder.svg"}
                                      alt={articolo.titolo}
                                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      onError={handleImageError}
                                    />
                                    {articolo.featured && (
                                      <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-lg">
                                        In evidenza
                                      </span>
                                    )}
                                  </div>
                                  <div className="p-4 space-y-2">
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300/70">{articolo.categoria}</p>
                                    <h3 className="text-base font-semibold leading-snug text-white group-hover:text-red-400 transition-colors line-clamp-2">
                                      {articolo.titolo}
                                    </h3>
                                  </div>
                                </Link>
                              </article>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}

                    {visibleRecentCount < orderedNews.length && (
                      <div ref={sentinelRef} className="h-1" aria-hidden="true" />
                    )}
                  </section>
                )}
              </>
            ) : (
              !isLoading && (
                <div className="text-center py-20">
                  <div className="bg-white/5 rounded-full p-6 w-fit mx-auto mb-4 border border-white/10">
                    <Search className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Nessuna notizia trovata</h3>
                  <p className="text-slate-400">
                    Prova a modificare i filtri o la ricerca per trovare quello che cerchi.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCategoriaFiltro("Tutte")
                      setSearchQuery("")
                    }}
                    className="mt-4 border-white/20 bg-transparent text-slate-200 hover:bg-white/10"
                  >
                    Resetta filtri
                  </Button>
                </div>
              )
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
