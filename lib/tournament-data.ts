import { prisma } from "./prisma"

export interface TournamentTeam {
  id: number
  nome_squadra: string
  nome_referente: string
  email_referente: string
  telefono_referente: string
  citta: string | null
  note: string | null
  pagato: boolean
  importo: number | null
  creato_il: Date
  giocatori: TournamentPlayer[]
}

export interface TournamentPlayer {
  id: number
  team_id: number
  nome: string
  cognome: string
  numero: number | null
  ruolo: string | null
  eta: number | null
}

export interface TournamentMatch {
  id: number
  turno: number
  campo: number
  ora: string
  home_team_id: number
  away_team_id: number
  home_punteggio: number | null
  away_punteggio: number | null
  set_home: string | null
  set_away: string | null
  fase: string
  completata: boolean
  data: Date
  home_team?: TournamentTeam | null
  away_team?: TournamentTeam | null
}

export async function getTournamentTeams(): Promise<TournamentTeam[]> {
  const teams = await prisma.tournament_teams.findMany({
    include: { giocatori: true },
    orderBy: { nome_squadra: "asc" },
  })
  return teams as TournamentTeam[]
}

export async function getTournamentTeamById(id: number): Promise<TournamentTeam | null> {
  const team = await prisma.tournament_teams.findUnique({
    where: { id },
    include: { giocatori: true },
  })
  return team as TournamentTeam | null
}

export async function createTournamentTeam(data: {
  nome_squadra: string
  nome_referente: string
  email_referente: string
  telefono_referente: string
  citta?: string
  note?: string
  giocatori: { nome: string; cognome: string; numero?: number; ruolo?: string; eta?: number }[]
}) {
  return prisma.tournament_teams.create({
    data: {
      nome_squadra: data.nome_squadra,
      nome_referente: data.nome_referente,
      email_referente: data.email_referente,
      telefono_referente: data.telefono_referente,
      citta: data.citta || null,
      note: data.note || null,
      giocatori: {
        create: data.giocatori,
      },
    },
    include: { giocatori: true },
  })
}

export async function updateTournamentTeamPayment(id: number, pagato: boolean) {
  return prisma.tournament_teams.update({
    where: { id },
    data: { pagato },
  })
}

export async function deleteTournamentTeam(id: number) {
  return prisma.tournament_teams.delete({
    where: { id },
  })
}

export async function getTournamentMatches(): Promise<TournamentMatch[]> {
  const matches = await prisma.tournament_matches.findMany({
    include: { home_team: true, away_team: true },
    orderBy: [{ fase: "asc" }, { turno: "asc" }, { campo: "asc" }],
  })
  return matches as TournamentMatch[]
}

export async function updateTournamentMatch(
  id: number,
  data: {
    home_punteggio?: number
    away_punteggio?: number
    set_home?: string
    set_away?: string
    completata?: boolean
    home_team_id?: number
    away_team_id?: number
  }
) {
  return prisma.tournament_matches.update({
    where: { id },
    data,
  })
}

export async function createTournamentMatch(data: {
  turno: number
  campo: number
  ora: string
  home_team_id: number
  away_team_id: number
  fase: string
  data: Date
}) {
  return prisma.tournament_matches.create({ data })
}

export async function getTournamentStandings() {
  const teams = await prisma.tournament_teams.findMany({
    include: { giocatori: true },
  })

  const matches = await prisma.tournament_matches.findMany({
    where: { completata: true, fase: "girone" },
  })

  const standings = teams.map((team) => {
    const teamMatches = matches.filter(
      (m) => m.home_team_id === team.id || m.away_team_id === team.id
    )

    let vinte = 0
    let perse = 0
    let puntiFatti = 0
    let puntiSubiti = 0
    let setVinti = 0
    let setPersi = 0

    teamMatches.forEach((m) => {
      if (m.home_team_id === team.id) {
        puntiFatti += m.home_punteggio || 0
        puntiSubiti += m.away_punteggio || 0
        if (m.set_home) {
          const sets = m.set_home.split("-").map(Number)
          setVinti += sets[0] || 0
          setPersi += sets[1] || 0
        }
        if (m.home_punteggio !== null && m.away_punteggio !== null) {
          if (m.home_punteggio > m.away_punteggio) vinte++
          else perse++
        }
      } else {
        puntiFatti += m.away_punteggio || 0
        puntiSubiti += m.home_punteggio || 0
        if (m.set_away) {
          const sets = m.set_away.split("-").map(Number)
          setVinti += sets[0] || 0
          setPersi += sets[1] || 0
        }
        if (m.home_punteggio !== null && m.away_punteggio !== null) {
          if (m.away_punteggio > m.home_punteggio) vinte++
          else perse++
        }
      }
    })

    return {
      ...team,
      partite_giocate: teamMatches.length,
      vinte,
      perse,
      punti_campionato: vinte * 3,
      punti_fatti: puntiFatti,
      punti_subiti: puntiSubiti,
      set_vinti: setVinti,
      set_persi: setPersi,
      differenza_set: setVinti - setPersi,
    }
  })

  return standings.sort((a, b) => {
    if (b.punti_campionato !== a.punti_campionato) return b.punti_campionato - a.punti_campionato
    if (b.differenza_set !== a.differenza_set) return b.differenza_set - a.differenza_set
    return b.punti_fatti - a.punti_fatti
  })
}
