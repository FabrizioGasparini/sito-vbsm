import { prisma } from "./prisma";

export interface Evento {
  id: string; // BigInt convertito in stringa
  squadra: string;
  data: string;
  oraInizio: string;
  oraFine: string;
  palestra: string;
  tipo: string;
}

export const palestreOptions = [
  "Tutte le Palestre",
  "Palestra Bombonera",
  "Palestra Scuole Medie",
  "Palestra Scuole Elementari",
];

// Recupera tutti gli eventi
export async function getEventi(): Promise<Evento[]> {
  const rows = await prisma.events.findMany({
    orderBy: [
      { data: "asc" },
      { oraInizio: "asc" },
    ],
  });

  return rows.map((row) => ({
    ...row,
    id: row.id.toString(), // Prisma ti dà BigInt → lo converti in string
    data: row.data.toISOString().split("T")[0],
    oraInizio: row.oraInizio.toISOString().split("T")[1].slice(0, 5),
    oraFine: row.oraFine.toISOString().split("T")[1].slice(0, 5),
  }));
}
// Aggiungi un nuovo evento
export async function addEvento(nuovoEvento: Omit<Evento, "id">): Promise<Evento> {
  const created = await prisma.events.create({
    data: {
      squadra: nuovoEvento.squadra,
      palestra: nuovoEvento.palestra,
      data: new Date(nuovoEvento.data),
      oraInizio: new Date(`${nuovoEvento.data}T${nuovoEvento.oraInizio}`),
      oraFine: new Date(`${nuovoEvento.data}T${nuovoEvento.oraFine}`),
      tipo: nuovoEvento.tipo,
    },
  });

  return {
    ...created,
    id: created.id.toString(),
    data: created.data.toISOString().split("T")[0],
    oraInizio: created.oraInizio.toISOString().split("T")[1].slice(0, 5),
    oraFine: created.oraFine.toISOString().split("T")[1].slice(0, 5),
  };
}
