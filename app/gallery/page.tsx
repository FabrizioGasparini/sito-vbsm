"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Calendar, Folder } from "lucide-react"
import { Gallery } from "@/lib/gallery-data"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function GalleriesPage() {
    const [events, setEvents] = useState<Gallery[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const response = await fetch("/api/gallery");
                const data: Gallery[] = await response.json();
                setEvents(data);
            } catch (error) {
                console.error("Failed to fetch gallery", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData();
    }, []);

    const formatDate = (d: string | Date) => {
        const date = new Date(d)
        return date.toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" })
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />

            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img fetchPriority="high" decoding="async"
                        src="/images/2025-26/pages/societa.webp"
                        alt="Gallery Hero"
                        className="h-full w-full object-cover brightness-[0.3]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background" />
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 1, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Badge variant="outline" className="mb-4 text-primary border-primary/50 px-4 py-1 text-sm uppercase tracking-widest backdrop-blur-sm">
                            Gallerie Foto e Video
                        </Badge>
                        <h1 className="font-ethnocentric text-4xl md:text-6xl lg:text-7xl mb-6 text-white tracking-tighter">
                            GALLERIE
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
                            Rivivi i momenti più emozionanti della stagione.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-20 container mx-auto px-4">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-64 w-full rounded-3xl" />
                                <Skeleton className="h-4 w-3/4 mx-auto" />
                                <Skeleton className="h-4 w-1/2 mx-auto" />
                            </div>
                        ))}
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((ev, index) => (
                            <motion.div
                                key={ev.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link href={`/gallery/${ev.titolo.replaceAll(" ", "-").toLowerCase()}`}>
                                    <div className="group relative cursor-pointer">
                                        <div className="relative h-80 w-full overflow-hidden rounded-3xl border border-white/10 bg-card shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                                            <img loading="lazy" decoding="async"
                                                src={ev.thumbnail || "/images/placeholder.svg"}
                                                alt={ev.titolo}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                <div className="rounded-full bg-primary/20 p-4 backdrop-blur-md border border-primary/50">
                                                    <Folder className="h-8 w-8 text-primary" />
                                                </div>
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                                                <Badge className="mb-3 bg-primary text-white hover:bg-primary/90 text-xs">
                                                    {ev.evento}
                                                </Badge>
                                                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1">{ev.titolo}</h3>
                                                <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(ev.data)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-lg">Nessuna galleria disponibile al momento.</p>
                    </div>
                )}
            </section>

            <Footer />
        </div>
    )
}
