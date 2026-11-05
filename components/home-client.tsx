"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import {
    ArrowRight,
    ArrowUpRight,
    Calendar,
    Shield,
    Users,
    Activity,
    ChevronRight,
    Clock,
    Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NewsArticle } from "@/lib/news-data"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { normalizeImageSrc } from "@/lib/utils"
import { FivePerMille } from "@/components/five-per-mille"
import { FOUNDING_YEAR } from "@/lib/site"

interface HomeClientProps {
    latestNews: NewsArticle[]
}

const tickerItems = [
    "STAGIONE 2026/27",
    "19 SQUADRE",
    "300+ ATLETI TESSERATI",
    "VBSM",
    "DAL 1984",
    "ENTRA IN SQUADRA",
]

const legacyStats = [
    { value: "1984", label: "Fondazione", icon: Calendar },
    { value: "19", label: "Squadre", icon: Shield },
    { value: "300+", label: "Atleti", icon: Users },
    // Calcolato: il valore fisso "41" diventava errato ogni anno
    { value: String(new Date().getFullYear() - FOUNDING_YEAR), label: "Anni di storia", icon: Activity },
]

const newsImage = (value: string) => normalizeImageSrc(value) || "/images/placeholder.svg"

export function HomeClient({ latestNews }: HomeClientProps) {
    const targetRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"],
    })

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
    const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])

    const [heroNews, ...restNews] = latestNews

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Navigation />

            {/* Hero Section — giant headline near the top of a full-bleed action photo,
                text + CTAs bottom-left, inset collage photo + caption bottom-right */}
            <section ref={targetRef} className="relative min-h-screen overflow-hidden">
                <motion.div style={{ opacity, scale, y }} className="absolute inset-0 z-0">
                    <img fetchPriority="high" decoding="async"
                        src="/images/2025-26/pages/societa.webp"
                        alt="Volleyball San Martino"
                        className="h-full w-full object-cover brightness-[0.6]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
                </motion.div>

                <div className="relative z-10 flex min-h-screen flex-col justify-between pt-32 pb-10 lg:pb-14">
                    {/* Headline block — upper area, left-aligned, huge */}
                    <div className="px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 1, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="max-w-6xl"
                        >
                            <Badge
                                variant="outline"
                                className="mb-6 text-white border-white/30 px-4 py-1 text-xs uppercase tracking-[0.25em] backdrop-blur-sm bg-white/5"
                            >
                                Dal 1984
                            </Badge>

                            <h1 className="font-ethnocentric text-[min(calc((100vw-2rem)/9.6),6rem)] leading-[0.92] text-white tracking-tight drop-shadow-2xl">
                                VOLLEYBALL
                                <span className="block text-primary">SAN MARTINO</span>
                            </h1>
                        </motion.div>
                    </div>

                    {/* Bottom split — copy + CTAs (left) / inset photo + caption (right) */}
                    <motion.div
                        initial={{ opacity: 1, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="px-4 sm:px-6 lg:px-8 mt-10"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
                            <div className="max-w-md">
                                <p className="text-gray-200 text-base sm:text-lg mb-6 leading-relaxed drop-shadow-md">
                                    Diventa parte di una grande famiglia dove passione, impegno e spirito di squadra
                                    fanno crescere atleti e persone, dentro e fuori dal campo.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-base shadow-lg shadow-primary/25 transition-transform hover:scale-105" asChild>
                                        <Link href="/squadre">
                                            Le Nostre Squadre <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="border-white text-primary hover:bg-white hover:text-black rounded-full px-8 py-6 text-base backdrop-blur-sm transition-all hover:scale-105" asChild>
                                        <Link href="/contatti">
                                            Unisciti a Noi
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="hidden sm:flex items-end gap-5 shrink-0">
                                <p className="max-w-[11rem] text-sm text-gray-300 leading-relaxed">
                                    Un nuovo modo di vivere lo sport, la squadra e la community VBSM.
                                </p>
                                <div className="relative w-34 h-32 lg:w-44 lg:h-44">
                                    <img loading="lazy" decoding="async"
                                        src="/images/loghi/main.webp"
                                        alt="Volleyball San Martino"
                                        className="h-full w-full object-fill p-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Ticker strip */}
            {/* Decorativo: le stesse informazioni sono presenti nella sezione statistiche */}
            <div aria-hidden="true" className="relative z-20 bg-primary text-primary-foreground overflow-hidden border-y border-black/10">
                <div className="flex whitespace-nowrap py-3 animate-marquee">
                    {[...tickerItems, ...tickerItems].map((item, i) => (
                        <span
                            key={i}
                            className="mx-4 text-sm md:text-base font-bold uppercase tracking-[0.2em] flex items-center gap-4"
                        >
                            {item}
                            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                        </span>
                    ))}
                </div>
            </div>

            {/* Legacy / Stats Section */}
            <section className="relative py-24 bg-[#05080d] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(225,29,68,0.12),transparent_45%)]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex items-center gap-3 mb-14">
                        <h2 className="font-ethnocentric text-white text-2xl md:text-3xl">La Nostra Storia</h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/10">
                        {legacyStats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.12 }}
                                className="lg:px-8 first:lg:pl-0"
                            >
                                <stat.icon className="w-6 h-6 text-primary mb-4" />
                                <p className="font-ethnocentric text-4xl sm:text-5xl lg:text-6xl text-white tracking-tighter">
                                    {stat.value}
                                </p>
                                <p className="text-gray-400 uppercase tracking-widest text-xs mt-2">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Notice Section - Payment Receipts */}
            <section className="relative py-20 bg-primary overflow-hidden hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-foreground">
                    <Badge variant="secondary" className="mb-6 px-4 py-1 text-primary font-bold uppercase tracking-wider bg-white shadow-lg">
                        Avviso Societario
                    </Badge>

                    <h2 className="font-ethnocentric text-2xl md:text-3xl lg:text-4xl mb-6">
                        RITIRO RICEVUTE
                    </h2>

                    <p className="text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed mb-8">
                        Al <span className="font-bold underline underline-offset-4 decoration-2">Martedì</span> la sede è aperta dalle <span className="font-bold">18.30</span> alle <span className="font-bold">20.00</span> per consegnare le ricevute dei pagamenti delle rette per chi non le avesse avute.
                    </p>

                    <div className="inline-flex items-center gap-3 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm border border-white/30 shadow-inner">
                        <Clock className="w-5 h-5 animate-pulse" />
                        <span className="font-semibold tracking-wide">Ogni Martedì • 18:30 - 20:00</span>
                    </div>
                </div>
            </section>

            <FivePerMille />

            {/* In The Spotlight — News, editorial asymmetric layout */}
            <section className="py-20 md:py-28 bg-secondary/30">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl md:text-5xl font-bold font-ethnocentric">In Evidenza</h2>
                        </div>
                        <Button variant="ghost" className="hidden md:flex group" asChild>
                            <Link href="/news">
                                Tutte le news <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>

                    {latestNews.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Large feature card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="lg:col-span-2"
                            >
                                <Link href={`/news/${heroNews.slug}`} className="group block h-full">
                                    <div className="relative h-[22rem] md:h-[28rem] rounded-3xl overflow-hidden">
                                        <img loading="lazy" decoding="async"
                                            src={newsImage(heroNews.immagine)}
                                            alt={heroNews.titolo}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                        <div className="absolute top-6 left-6">
                                            <Badge className="bg-primary text-white hover:bg-primary/90">
                                                {heroNews.categoria}
                                            </Badge>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                            <div className="flex items-center gap-2 text-xs text-gray-300 mb-3">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(heroNews.data).toLocaleDateString('it-IT')}
                                            </div>
                                            <h3 className="font-ethnocentric text-2xl md:text-4xl text-white leading-tight mb-2 group-hover:text-primary transition-colors">
                                                {heroNews.titolo}
                                            </h3>
                                            <p className="text-gray-300 line-clamp-2 max-w-xl">
                                                {heroNews.estratto}
                                            </p>
                                            <div className="mt-4 inline-flex items-center gap-2 text-white font-semibold text-sm">
                                                Leggi tutto <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>

                            {/* Stacked smaller cards */}
                            <div className="flex flex-col gap-6">
                                {restNews.slice(0, 2).map((news, index) => (
                                    <motion.div
                                        key={news.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 + index * 0.1 }}
                                        className="flex-1"
                                    >
                                        <Link href={`/news/${news.slug}`} className="group flex h-full gap-4 bg-card rounded-2xl overflow-hidden border border-border p-3 hover:shadow-xl transition-all">
                                            <div className="relative w-28 sm:w-36 shrink-0 rounded-xl overflow-hidden">
                                                <img loading="lazy" decoding="async"
                                                    src={newsImage(news.immagine)}
                                                    alt={news.titolo}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                            <div className="py-1 pr-2 flex flex-col justify-center">
                                                <Badge variant="secondary" className="w-fit mb-2 text-[10px] uppercase tracking-wider">
                                                    {news.categoria}
                                                </Badge>
                                                <h4 className="font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                                    {news.titolo}
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(news.data).toLocaleDateString('it-IT')}
                                                </p>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {latestNews.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
                            <p className="text-lg font-semibold">Nessuna news disponibile al momento.</p>
                            <p className="mt-2 text-muted-foreground">Seguici sui social per restare aggiornato sulle attività della società.</p>
                        </div>
                    )}

                    <div className="mt-8 text-center md:hidden">
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/news">Vedi tutte le news</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Call to Action — layered with oversized background wordmark */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0 bg-primary">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                </div>
                <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-6 left-1/2 -translate-x-1/2 font-ethnocentric text-white/10 text-[18vw] whitespace-nowrap leading-none">
                    SAN MARTINO
                </span>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <Badge className="mb-6 bg-white/15 text-white border border-white/30 uppercase tracking-[0.2em] text-[10px]">
                            <Award className="h-3 w-3 mr-1 inline" /> Unisciti a noi
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-ethnocentric leading-[0.95]">
                            ENTRA IN SQUADRA
                        </h2>
                        <p className="text-xl text-white/90 mb-8 leading-relaxed">
                            Che tu sia un atleta esperto o alle prime armi, c’è posto per te nella famiglia Volleyball San Martino.
                            Vieni a provare gratuitamente!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-bold" asChild>
                                <Link href="/contatti">
                                    Prenota una prova
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="border-white text-black hover:bg-white/10 rounded-full px-8 py-6 text-lg" asChild>
                                <Link href="/chi-siamo">
                                    Scopri la società
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing giant wordmark strip */}
            <div aria-hidden="true" className="relative bg-black overflow-hidden border-t border-white/5 py-6">
                <div className="flex whitespace-nowrap animate-marquee">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <span
                            key={i}
                            className="font-ethnocentric text-primary text-6xl md:text-8xl mx-8 tracking-tighter"
                        >
                            VBSM
                        </span>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    )
}