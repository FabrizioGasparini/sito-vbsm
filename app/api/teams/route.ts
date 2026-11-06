import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { existsSync } from "fs";
import path from "path";
import { normalizeImageSrc } from "@/lib/utils";
import { conventionalPersonPhoto, conventionalTeamPhoto } from "@/lib/team-photos";

// Dati anagrafici sensibili degli atleti (spesso minorenni): visibili solo agli amministratori
const PRIVATE_PLAYER_FIELDS = ["eta", "altezza", "peso", "nazionalita", "foto"] as const;

function publicPlayers<T extends Record<string, unknown>>(players: T[], admin: boolean) {
  if (admin) return players;
  return players.map((player) => {
    const copy: Record<string, unknown> = { ...player };
    for (const field of PRIVATE_PLAYER_FIELDS) delete copy[field];
    return copy;
  });
}

// ---------------- FOTO (facoltative) ----------------

/** Restituisce il percorso solo se il file esiste davvero in public/ */
function existingPublicFile(publicPath: string) {
  const file = path.join(process.cwd(), "public", ...publicPath.split("/").filter(Boolean));
  return existsSync(file) ? publicPath : null;
}

/** Foto caricata dall'admin, altrimenti file nella cartella della squadra, altrimenti null */
function resolvePhoto(uploaded: string | null | undefined, conventional: string) {
  const fromAdmin = uploaded ? normalizeImageSrc(uploaded) : "";
  return fromAdmin || existingPublicFile(conventional);
}

type TeamWithRelations = NonNullable<Awaited<ReturnType<typeof findTeams>>[number]>;

function findTeams(where?: { id: string }) {
  return prisma.teams.findMany({
    where,
    orderBy: { idx: "asc" },
    include: {
      players: true,
      team_coaches: { include: { coaches: true } },
    },
  });
}

function serializeTeam(team: TeamWithRelations, admin: boolean) {
  return {
    ...team,
    photo: resolvePhoto(team.immagine, conventionalTeamPhoto(team.id)),
    players: publicPlayers(
      team.players.map((player) => ({
        ...player,
        photo: resolvePhoto(player.foto, conventionalPersonPhoto(team.id, player.nome, player.cognome)),
      })),
      admin
    ),
    team_coaches: team.team_coaches
      .filter((tc) => tc.coaches !== null)
      .map((tc) => ({
        id: tc.coach_id,
        nome: tc.coaches!.nome,
        cognome: tc.coaches!.cognome,
        ruolo: tc.ruolo,
        photo: existingPublicFile(conventionalPersonPhoto(team.id, tc.coaches!.nome, tc.coaches!.cognome)),
      })),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const admin = isAdmin(req);

    if (id) {
      const [team] = await findTeams({ id });

      if (!team) {
        return NextResponse.json({ error: "Squadra non trovata" }, { status: 404 });
      }

      const safeTeam = serializeTeam(team, admin);

      return NextResponse.json(safeTeam, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const teams = await findTeams();
    const safeTeams = teams.map((team) => serializeTeam(team, admin));

    return NextResponse.json(safeTeams, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Errore database" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const body = await req.json();

    if (body.type === "team" || body.categoria) {
      const teamId = String(body.id || body.teamId || body.slug || body.categoria.toLowerCase().replace(/\s+/g, "-")).trim();

      if (!body.categoria || !teamId) {
        return NextResponse.json({ error: "Categoria e identificativo squadra sono obbligatori" }, { status: 400 });
      }

      const team = await prisma.teams.upsert({
        where: { id: teamId },
        update: {
          categoria: body.categoria,
          descrizione: body.descrizione ?? null,
          stagione: body.stagione || "2025/26",
          campionato: body.campionato || "",
          colore: body.colore || null,
          idx: Number(body.idx ?? 0),
          immagine: body.immagine || null,
        },
        create: {
          id: teamId,
          categoria: body.categoria,
          descrizione: body.descrizione ?? null,
          stagione: body.stagione || "2025/26",
          campionato: body.campionato || "",
          colore: body.colore || null,
          idx: Number(body.idx ?? 0),
          immagine: body.immagine || null,
        },
      });

      return NextResponse.json(team, {
        status: 201,
        headers: corsHeaders,
      });
    }

    if (body.type === "coach") {
      const { teamId, coachId, nome, cognome, ruolo } = body;
      if (!teamId || !nome || !cognome) {
        return NextResponse.json({ error: "TeamId, nome e cognome allenatore sono obbligatori" }, { status: 400 });
      }

      const normalizedCoachId = String(coachId || `${teamId}-${nome.trim().toLowerCase()}-${cognome.trim().toLowerCase()}`);
      const coach = await prisma.coaches.upsert({
        where: { id: normalizedCoachId },
        update: { nome, cognome },
        create: { id: normalizedCoachId, nome, cognome },
      });

      const relation = await prisma.team_coaches.upsert({
        where: { team_id_coach_id: { team_id: teamId, coach_id: coach.id } },
        update: { ruolo: ruolo || "" },
        create: { team_id: teamId, coach_id: coach.id, ruolo: ruolo || "" },
      });

      return NextResponse.json({ ...coach, ruolo: relation.ruolo }, {
        status: 201,
        headers: corsHeaders,
      });
    }

    const { teamId, nome, cognome, ruolo, numero, capitano, foto, eta, altezza, peso, nazionalita } = body;

    if (!teamId || !nome || !cognome) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti: teamId, nome, cognome" },
        { status: 400 }
      );
    }

    const team = await prisma.teams.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ error: "Squadra non trovata" }, { status: 404 });
    }

    const player = await prisma.players.create({
      data: {
        nome,
        cognome,
        ruolo: ruolo || "",
        numero: numero ? Number(numero) : null,
        capitano: !!capitano,
        foto: foto || null,
        eta: eta ? Number(eta) : null,
        altezza: altezza || null,
        peso: peso || null,
        nazionalita: nazionalita || null,
        teams: { connect: { id: teamId } },
      },
    });

    return NextResponse.json(player, {
      status: 201,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Errore durante il salvataggio" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const body = await req.json();

    if (body.type === "team" || body.categoria) {
      const teamId = String(body.id || body.teamId || body.slug || body.categoria.toLowerCase().replace(/\s+/g, "-")).trim();

      const team = await prisma.teams.update({
        where: { id: teamId },
        data: {
          categoria: body.categoria,
          descrizione: body.descrizione ?? null,
          stagione: body.stagione || "2025/26",
          campionato: body.campionato || "",
          colore: body.colore || null,
          idx: Number(body.idx ?? 0),
          immagine: body.immagine || null,
        },
      });

      return NextResponse.json(team, { status: 200, headers: corsHeaders });
    }

    if (body.type === "coach") {
      const { teamId, coachId, nome, cognome, ruolo } = body;
      if (!teamId || !nome || !cognome) {
        return NextResponse.json({ error: "TeamId, nome e cognome allenatore sono obbligatori" }, { status: 400 });
      }

      const normalizedCoachId = String(coachId || `${teamId}-${nome.trim().toLowerCase()}-${cognome.trim().toLowerCase()}`);
      const coach = await prisma.coaches.upsert({
        where: { id: normalizedCoachId },
        update: { nome, cognome },
        create: { id: normalizedCoachId, nome, cognome },
      });

      const relation = await prisma.team_coaches.upsert({
        where: { team_id_coach_id: { team_id: teamId, coach_id: coach.id } },
        update: { ruolo: ruolo || "" },
        create: { team_id: teamId, coach_id: coach.id, ruolo: ruolo || "" },
      });

      return NextResponse.json({ ...coach, ruolo: relation.ruolo }, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const { id, nome, cognome, ruolo, numero, capitano, foto, eta, altezza, peso, nazionalita } = body;
    if (!id) {
      return NextResponse.json({ error: "ID giocatore mancante" }, { status: 400 });
    }

    const updatedPlayer = await prisma.players.update({
      where: { id: Number(id) },
      data: {
        nome,
        cognome,
        ruolo: ruolo || "",
        numero: numero ? Number(numero) : null,
        capitano: !!capitano,
        foto: foto || null,
        eta: eta ? Number(eta) : null,
        altezza: altezza || null,
        peso: peso || null,
        nazionalita: nazionalita || null,
      },
    });

    return NextResponse.json(updatedPlayer, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Errore durante l'aggiornamento" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const playerId = searchParams.get("playerId");
    const coachId = searchParams.get("coachId");

    if (teamId) {
      await prisma.players.deleteMany({ where: { team_id: teamId } });
      await prisma.team_coaches.deleteMany({ where: { team_id: teamId } });
      await prisma.teams.delete({ where: { id: teamId } });
      return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
    }

    if (playerId) {
      await prisma.players.delete({ where: { id: Number(playerId) } });
      return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
    }

    if (coachId) {
      const team = searchParams.get("team")
      if (!team) {
        return NextResponse.json({ error: "Team mancante per la rimozione allenatore" }, { status: 400 });
      }
      await prisma.team_coaches.delete({ where: { team_id_coach_id: { team_id: team, coach_id: coachId } } });
      return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
    }

    return NextResponse.json({ error: "Nessun id valido specificato" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Errore durante la cancellazione" }, { status: 500 });
  }
}

// ⚙️ Preflight per CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: corsHeaders,
  });
}

// 🔧 Header riutilizzabile
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://volleyballsanmartino.it",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};
