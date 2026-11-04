import { NextRequest, NextResponse } from "next/server"
import { getTournamentTeams, createTournamentTeam, updateTournamentTeamPayment, deleteTournamentTeam } from "@/lib/tournament-data"
import { checkRateLimit } from "@/lib/rate-limit"
import { isAdmin, isAuthenticated } from "@/lib/auth"
import {
  buildTournamentRegistrationNote,
  calculateAgeFromBirthdate,
  getTorneo24hDisciplina,
} from "@/lib/torneo-24h"

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  try {
    const teams = await getTournamentTeams()
    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching tournament teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown"

    const { allowed, retryAfter } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { error: `Troppe richieste. Riprova tra ${retryAfter} secondi.` },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Honeypot check: campo nascosto che i bot compilano ma gli umani no
    if (body.website) {
      return NextResponse.json({ error: "Iscrizione non valida" }, { status: 400 })
    }

    // Timestamp check: il form deve impiegare almeno 5 secondi
    if (body._ts) {
      const elapsed = Date.now() - Number(body._ts)
      if (elapsed < 5000) {
        return NextResponse.json({ error: "Compila il form con calma" }, { status: 400 })
      }
    }

    const disciplina = getTorneo24hDisciplina(body.disciplina)
    const { nome_squadra, nome_referente, email_referente, telefono_referente, bonifico_url, giocatori, privacy_consent } = body

    if (privacy_consent !== true) {
      return NextResponse.json({ error: "Devi accettare la privacy policy" }, { status: 400 })
    }

    if (!nome_squadra || !nome_referente || !email_referente || !telefono_referente) {
      return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 })
    }

    if (!bonifico_url) {
      return NextResponse.json({ error: "Foto del bonifico mancante" }, { status: 400 })
    }

    // Validazione email base
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email_referente)) {
      return NextResponse.json({ error: "Email non valida" }, { status: 400 })
    }

    // Validazione telefono base
    const phoneRegex = /^[\d\s]{8,}$/
    if (!phoneRegex.test(telefono_referente)) {
      return NextResponse.json({ error: "Numero di telefono non valido" }, { status: 400 })
    }

    if (!giocatori || giocatori.length < disciplina.minPlayers || giocatori.length > disciplina.maxPlayers) {
      return NextResponse.json({ error: `Sono necessari tra ${disciplina.minPlayers} e ${disciplina.maxPlayers} giocatori` }, { status: 400 })
    }

    // Validazione giocatori
    for (const g of giocatori) {
      if (!g.nome?.trim() || !g.cognome?.trim() || !g.data_nascita) {
        return NextResponse.json({ error: "Ogni giocatore deve avere nome, cognome e data di nascita" }, { status: 400 })
      }

      const age = calculateAgeFromBirthdate(g.data_nascita)
      if (age === null) {
        return NextResponse.json({ error: "Data di nascita non valida" }, { status: 400 })
      }

      if (age < disciplina.etaMinima) {
        return NextResponse.json({ error: `Tutti i giocatori devono avere almeno ${disciplina.etaMinima} anni` }, { status: 400 })
      }
    }

    // No nomi duplicati nella squadra
    const nomi = giocatori.map((g: { nome: string; cognome: string }) => `${g.nome.trim().toLowerCase()} ${g.cognome.trim().toLowerCase()}`)
    const uniqueNomi = new Set(nomi)
    if (uniqueNomi.size !== nomi.length) {
      return NextResponse.json({ error: "Ci sono giocatori duplicati nella lista" }, { status: 400 })
    }

    const team = await createTournamentTeam({
      nome_squadra: nome_squadra.trim(),
      nome_referente: nome_referente.trim(),
      email_referente: email_referente.trim().toLowerCase(),
      telefono_referente: telefono_referente.trim(),
      note: buildTournamentRegistrationNote({
        disciplina,
        nomeSquadra: nome_squadra.trim(),
        nomeReferente: nome_referente.trim(),
        emailReferente: email_referente.trim().toLowerCase(),
        telefonoReferente: telefono_referente.trim(),
        bonificoUrl: bonifico_url,
        players: giocatori.map((g: { nome: string; cognome: string; data_nascita: string }) => ({
          nome: g.nome.trim(),
          cognome: g.cognome.trim(),
          eta: calculateAgeFromBirthdate(g.data_nascita) || 0,
        })),
      }),
      giocatori: giocatori.map((g: { nome: string; cognome: string; data_nascita: string }) => ({
        nome: g.nome.trim(),
        cognome: g.cognome.trim(),
        eta: calculateAgeFromBirthdate(g.data_nascita) || undefined,
      })),
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error("Error creating tournament team:", error)
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthenticated(request)) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const body = await request.json()
    const id = Number(body.id)
    const pagato = Boolean(body.pagato)

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "ID iscrizione non valido" }, { status: 400 })
    }

    const updated = await updateTournamentTeamPayment(id, pagato)
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("Error updating tournament team payment:", error)
    return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = Number(searchParams.get("id"))

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "ID iscrizione non valido" }, { status: 400 })
    }

    await deleteTournamentTeam(id)
    return NextResponse.json({ message: "Iscrizione eliminata" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting tournament team:", error)
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 })
  }
}
