import GestioneSquadraClient from "./client"

export default async function GestioneSquadraPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    return <GestioneSquadraClient id={slug} />
}
