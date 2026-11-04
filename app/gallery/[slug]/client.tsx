"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Play, X } from "lucide-react"
import VideoThumbnail from "@/components/video-thumbnail"
import { Gallery } from "@/lib/gallery-data"

type MediaItem = { tipo: "foto" | "video"; url: string; thumbnail?: string | null }

export default function GalleryPageClient({ slug }: { slug: string }) {
    const [evento, setEvento] = useState<Gallery | null>(null)
    const [media, setMedia] = useState<MediaItem[]>([])
    const [selected, setSelected] = useState<MediaItem | null>(null)
    const router = useRouter()

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/gallery")
                if (!res.ok) return
                const all = await res.json()
                const ev = all.find((e: Gallery) => Number(e.id) === Number(slug) || e.titolo.replaceAll(" ", "-").toLowerCase() === slug)
                if (!ev) {
                    router.push("/gallery")
                    return
                }
                setEvento(ev)
                const parsed = ev.media ? (typeof ev.media === "string" ? JSON.parse(ev.media) : ev.media) : []
                setMedia(parsed)
            } catch (err) {
                console.error("❌ Errore nel caricamento della galleria:", err)
                router.push("/gallery")
            }
        }
        load()
    }, [slug, router])

    useEffect(() => {
        if (!selected) return
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setSelected(null)
        }
        window.addEventListener("keydown", closeOnEscape)
        return () => window.removeEventListener("keydown", closeOnEscape)
    }, [selected])

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" })

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") setSelected(null)
    }, [])
    useEffect(() => {
        if (selected) window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [selected, handleKeyDown])

    if (!evento) {
        return (
            <div className="min-h-screen flex items-center justify-center text-lg text-muted-foreground">
                Caricamento galleria...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation className="bg-transparent absolute" />

            {/* ===== HERO HEADER con blur ===== */}
            <section className="relative min-h-96 sm:min-h-112 py-6 mt-1 flex flex-col justify-center items-center text-center text-white overflow-hidden">
                <img
                    src={evento.thumbnail || "/placeholder.svg"}
                    alt={evento.titolo}
                    className="h-full w-full object-cover blur-[10px] brightness-[0.5]"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" />
                <div className="relative z-10 px-6 flex flex-col items-center">
                    <Button asChild variant="ghost" className="text-white/80 hover:text-white mb-6 mt-12">
                        <Link href="/gallery">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Torna alle Gallerie
                        </Link>
                    </Button>

                    <h1 className="font-ethnocentric text-3xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 drop-shadow-lg">{evento.titolo}</h1>
                    <p className="">
                        {evento.evento}
                    </p>
                    <div className="flex justify-center items-center gap-2 text-white/80">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(evento.data.toString())}</span>
                    </div>
                    <div className="mt-8 text-3xl text-white/80 flex items-center gap-4">
                        <span>{media.filter(m => m.tipo === "foto").length} Foto</span>
                        <span>{media.filter(m => m.tipo === "video").length} Video</span>
                    </div>
                </div>
            </section>

            {/* ===== GRIGLIA MEDIA ===== */}
            <section className="py-16 bg-background">
                <div className="max-w-7xl mx-auto px-6 sm:px-8">
                    {media.length > 0 ? (
                        <>
                            <h2 className="text-2xl font-semibold mb-8 text-foreground text-center font-ethnocentric">Foto</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                                {
                                    media.filter(m => m.tipo === "foto").map((m, idx) => (
                                        <div
                                            key={idx}
                                                role="button"
                                                tabIndex={0}
                                                aria-label={`Apri foto ${idx + 1}`}
                                            className="cursor-pointer relative overflow-hidden rounded-2xl shadow-lg group aspect-video"
                                            onClick={() => setSelected(m)}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter" || event.key === " ") {
                                                        event.preventDefault()
                                                        setSelected(m)
                                                    }
                                                }}
                                        >
                                            <img
                                                src={m.url}
                                                alt={`foto-${idx}`}
                                                className="h-full w-full object-cover filter md:grayscale group-hover:grayscale-0 transition-all duration-300"
                                            />

                                        </div>
                                    ))}

                            </div>
                            <h2 className="text-2xl font-semibold my-8 text-foreground text-center font-ethnocentric">Video</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {media.filter(m => m.tipo === "video").map((m, idx) => (
                                    <div
                                        key={idx}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Apri video ${idx + 1}`}
                                        className="cursor-pointer relative overflow-hidden rounded-2xl shadow-lg group aspect-video"
                                        onClick={() => setSelected(m)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault()
                                                setSelected(m)
                                            }
                                        }}
                                    >
                                        <div className="relative w-full h-full">
                                            <VideoThumbnail url={m.url} width={600} />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <Play className="h-16 w-16 text-white drop-shadow-xl" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>

                    ) : (
                        <p className="text-center text-muted-foreground">Nessun contenuto disponibile.</p>
                    )}
                </div>
            </section>

            <Footer />

            {/* ===== LIGHTBOX PERSONALIZZATA ===== */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={() => setSelected(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Contenuto multimediale"
                >
                    <style>{`body { overflow: hidden !important; }`}</style>
                    {/* Bottone chiusura */}
                    <button
                        onClick={() => setSelected(null)}
                        aria-label="Chiudi contenuto multimediale"
                        className="absolute top-6 right-6 text-white/80 hover:text-white transition"
                    >
                        <X className="h-8 w-8" />
                    </button>

                    {/* Contenuto centrale */}
                    <div
                        className="max-w-[95vw] max-h-[95vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()} // evita chiusura se clicchi dentro
                    >
                        {selected.tipo === "foto" ? (
                            <img
                                src={selected.url}
                                alt="Foto ingrandita"
                                className="w-full max-h-[95vh] object-contain rounded-xl shadow-2xl"
                            />
                        ) : (
                            <video
                                src={selected.url}
                                controls
                                autoPlay
                                className="w-auto max-h-[95vh] bg-black rounded-xl shadow-2xl"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
