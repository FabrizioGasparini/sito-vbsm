"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Save, X, ArrowLeft, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Team } from "@/lib/teams-data"

export interface Player {
    id: string
    nome: string
    cognome: string
    ruolo: string | null
    numero: number | null
    capitano: boolean
}

export default function GestioneSquadraClient({ id }: { id: string }) {
    const [squadra, setSquadra] = useState<Team | null>(null)
    const [players, setPlayers] = useState<Player[]>([])
    const [formData, setFormData] = useState<Player>({
        id: "",
        nome: "",
        cognome: "",
        ruolo: null,
        numero: null,
        capitano: false,
    })
    const [isCreating, setIsCreating] = useState(false)
    const [editing, setEditing] = useState<Player | null>(null)
    const [message, setMessage] = useState("")

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/teams?id=${id}`)
                if (!res.ok) throw new Error("Errore nel fetch della squadra")
                const data = await res.json()
                setSquadra(data)
                setPlayers(data.players)
            } catch (error) {
                console.error(error)
                setMessage("Errore nel caricamento dei dati della squadra")
            }
        }
        fetchData()
    }, [id])

    const handleSave = async () => {
        if (!formData.nome || !formData.cognome) {
            setMessage("Nome e cognome sono obbligatori")
            return
        }

        if (isCreating) {
            const newPlayer = { ...formData }

            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newPlayer, teamId: id }),
            })

            if (!res.ok) {
                setMessage("Errore durante la creazione del giocatore")
                return
            }

            setPlayers((prev) => [...prev, newPlayer])
            setMessage("Giocatore aggiunto con successo!")
        } else if (editing) {
            const res = await fetch("/api/teams", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            if (!res.ok) {
                setMessage("Errore durante l'aggiornamento del giocatore")
                return
            }

            setPlayers((prev) => prev.map((p) => (p.id === editing.id ? formData : p)))
            setMessage("Giocatore aggiornato con successo!")
        }

        setFormData({ id: "", nome: "", cognome: "", ruolo: null, numero: null, capitano: false })
        setIsCreating(false)
        setEditing(null)
    }

    const handleEdit = (player: Player) => {
        setEditing(player)
        setFormData(player)
    }

    const handleDelete = (id: string) => {
        if (confirm("Vuoi davvero eliminare questo giocatore?")) {
            setPlayers((prev) => prev.filter((p) => p.id !== id))
            setMessage("Giocatore eliminato")
        }
    }

    const handleCancel = () => {
        setEditing(null)
        setIsCreating(false)
        setFormData({ id: "", nome: "", cognome: "", ruolo: null, numero: null, capitano: false })
    }

    if (!squadra) {
        return (
            <div className="min-h-screen bg-[#05080d] text-white">
                <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(225,29,72,0.16),transparent_35%),linear-gradient(180deg,#070a10_0%,#03060b_100%)]" />
                <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4">
                    <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 text-slate-300 backdrop-blur-xl">
                        Caricamento squadra...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#05080d] text-white">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(225,29,72,0.16),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.16),transparent_30%),linear-gradient(180deg,#070a10_0%,#03060b_100%)]" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Button variant="ghost" size="sm" asChild className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                            <Link href="/admin/players">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Torna alle squadre
                            </Link>
                        </Button>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-200">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            Squadra
                        </div>
                        <h1 className="mt-3 font-ethnocentric text-3xl uppercase sm:text-4xl">{squadra.categoria}</h1>
                        <p className="mt-2 text-sm text-slate-300">Gestione giocatori e dati della rosa</p>
                    </div>
                    <Button onClick={() => setIsCreating(true)} className="rounded-full bg-primary px-6 py-5 text-white hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuovo giocatore
                    </Button>
                </div>

                {message && (
                    <Alert className="mb-6 border-white/10 bg-white/5 text-white backdrop-blur-xl">
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                {(isCreating || editing) && (
                    <Card className="mb-8 border-white/10 bg-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white">
                                {isCreating ? "Aggiungi Giocatore" : "Modifica Giocatore"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-slate-300">Nome *</Label>
                                <Input
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-300">Cognome *</Label>
                                <Input
                                    value={formData.cognome}
                                    onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-300">Ruolo</Label>
                                <Input
                                    value={formData.ruolo || ""}
                                    onChange={(e) => setFormData({ ...formData, ruolo: e.target.value || null })}
                                    placeholder="Es: Palleggiatore"
                                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-300">Numero</Label>
                                <Input
                                    type="number"
                                    value={formData.numero ?? ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            numero: e.target.value ? parseInt(e.target.value) : null,
                                        })
                                    }
                                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="capitano"
                                    checked={formData.capitano}
                                    onChange={(e) =>
                                        setFormData({ ...formData, capitano: e.target.checked })
                                    }
                                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary"
                                />
                                <Label htmlFor="capitano" className="text-slate-300">Capitano</Label>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button onClick={handleSave} className="rounded-full bg-primary px-6 py-5 text-white hover:bg-primary/90">
                                    <Save className="mr-2 h-4 w-4" /> Salva
                                </Button>
                                <Button variant="outline" onClick={handleCancel} className="rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">
                                    <X className="mr-2 h-4 w-4" /> Annulla
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4">
                    {players.map((player) => (
                        <Card key={player.id} className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-semibold text-white">
                                        {player.nome} {player.cognome}{" "}
                                        {player.capitano && (
                                            <span className="ml-2 rounded-full bg-primary/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-primary">
                                                Capitano
                                            </span>
                                        )}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-300">
                                        {player.ruolo || "Ruolo non specificato"} —{" "}
                                        {player.numero ? `#${player.numero}` : "Senza numero"}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(player)} className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full border-white/10 bg-white/5 text-rose-300 hover:bg-white/10"
                                        onClick={() => handleDelete(player.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
