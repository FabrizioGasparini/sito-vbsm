import type { Metadata } from "next"
import GalleryPageClient from "./client"
import { findGalleryMetaBySlug } from "@/lib/gallery-data"
import { pageMetadata } from "@/lib/seo"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    try {
        const gallery = await findGalleryMetaBySlug(decodeURIComponent(slug))
        if (gallery) {
            return pageMetadata({
                title: `${gallery.titolo} - Galleria`,
                description: `Foto e video: ${gallery.titolo}${gallery.evento ? ` (${gallery.evento})` : ""}.`,
                path: `/gallery/${slug}`,
                image: gallery.thumbnail,
            })
        }
    } catch (error) {
        console.error("Errore metadata galleria:", error)
    }
    return pageMetadata({ title: "Galleria", description: "Galleria fotografica della Volleyball San Martino.", path: `/gallery/${slug}` })
}

export default async function GalleryPage({ params }: Props) {
    const { slug } = await params
    return <GalleryPageClient slug={slug} />
}
