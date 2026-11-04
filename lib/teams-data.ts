import { prisma } from "./prisma";

export interface Player {
  id: number; 
  nome: string;
  cognome: string;
  ruolo: string | null; 
  numero: number | null;
  capitano: boolean;
}

export interface Coach {
  id: string; 
  nome: string;
  cognome: string;
  ruolo: string | null; 
}

export interface Team {
  idx: number; 
  id: string;
  categoria: string;
  descrizione: string | null;
  stagione: string;
  campionato: string;
  colore: string | null;
  immagine?: string | null;
  players: Player[];
  team_coaches: Coach[];
}

// Recupera tutti i team con players e coaches
export async function getTeamsData(): Promise<Team[]> {
  const teams = await prisma.teams.findMany({
    include: {
      players: true,
      team_coaches: {
        include: { coaches: true }
      }
    },
    orderBy: { idx: "asc" }
  });

  return teams.map(team => ({
    idx: team.idx,
    id: team.id,
    categoria: team.categoria,
    descrizione: team.descrizione,
    stagione: team.stagione,
    campionato: team.campionato,
    colore: team.colore,
    immagine: team.immagine ?? null,
    players: team.players.map(p => ({
      id: p.id,
      nome: p.nome,
      cognome: p.cognome,
      ruolo: p.ruolo ?? null,
      numero: p.numero ?? null,
      capitano: !!p.capitano
    })),
    team_coaches: team.team_coaches
      .filter(tc => tc.coaches !== null) // scarta i null
      .map(tc => ({
        id: tc.coach_id,
        nome: tc.coaches!.nome,
        cognome: tc.coaches!.cognome,
        ruolo: tc.ruolo ?? null
      }))
  }));
}


// Recupera un team per ID
export async function getTeamById(id: string): Promise<Team | undefined> {
  const teams = await getTeamsData();
  return teams.find((team) => team.id === id);
}