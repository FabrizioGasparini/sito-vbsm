export interface Championship {
  id: string;
  parent: string;
  title: string;
  "title-short": string;
}

export interface Match {
  id: string;
  day: string;
  date: string;
  time: string;
  stadium: string;
  "lat-stadium": string;
  "lng-stadium": string;
  ng: string;
  played: string;
  "team1-setwin": string;
  "team2-setwin": string;
  "pt_a": string | string[];
  "pt_b": string | string[];
  team1: Team;
  team2: Team;
}

export interface Team {
  id: string;
  title: string;
  nome_societa: string;
  cod_aff_societa: string;
  logo: string;
}

export const SOCIETY_ID = "080410047";
