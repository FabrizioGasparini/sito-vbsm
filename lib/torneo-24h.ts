export type Torneo24hDisciplina = "splash" | "beach"

export interface Torneo24hPlayerInput {
  nome: string
  cognome: string
  data_nascita: string
}

export interface Torneo24hDisciplinaConfig {
  slug: Torneo24hDisciplina
  nome: string
  descrizione: string
  minPlayers: number
  maxPlayers: number
  etaMinima: number
  quota: string
  formula: string
  colore: string
  icona: string
  regolamento: string[]
  iscrizione: string[]
  programma: string[]
}

export const torneo24hEventInfo = {
  titolo: "24 H",
  sottotitolo:
    "Un weekend di sport, musica, bar e momenti da vivere insieme dentro e fuori dal campo.",
  highlights: [
    "Location: Palestra Bombonera, Piazza V. Carnevali, 1 - 42018 San Martino in Rio (RE)",
    "Work in progress: stiamo lavorando per offrirti un'esperienza ancora più completa e coinvolgente.",
    /*"Musica e atmosfera serale",
    "Eventi collaterali e iniziative da organizzare insieme",
    "Accoglienza squadre, pubblico e momenti di festa",*/
  ],
}

export const torneo24hDiscipline: Record<Torneo24hDisciplina, Torneo24hDisciplinaConfig> = {
  splash: {
    slug: "splash",
    nome: "Splash Volley",
    descrizione: "Formula 6 contro 6 con un regolamento pensato per tenere ritmo, spettacolo e inclusione.",
    minPlayers: 6,
    maxPlayers: 10,
    etaMinima: 14,
    quota: "80€ a squadra",
    formula: "3 partite garantite, gironi al meglio di un set a 21, semifinali e finale al meglio dei 3 set.",
    colore: "from-cyan-400 via-blue-500 to-indigo-600",
    icona: "Volleyball",
    programma: [
      "Sabato 12:30: consegna liberatorie e buono consumazione",
      "Sabato 13:00: inizio fase a gironi",
      "Sabato 20:00: fine fase a gironi",
      "Domenica 9:30: semifinale",
      "Domenica 11:30: finalina 3°-4° posto",
      "Domenica 12:00: finale",
    ],
    iscrizione: [
      "Un referente iscrive tutta la squadra.",
      "Tutti i giocatori devono aver compiuto 14 anni.",
      "Serve la liberatoria firmata per ogni atleta, anche minorenne.",
      "Sono ammessi massimo 10 giocatori per squadra.",
      "Limiti di categoria: donne serie D, uomini Prima Divisione; è ammessa una wild card.",
    ],
    regolamento: [
      "Regolamento scaricabile dal PDF allegato.",
    ],
  },
  beach: {
    slug: "beach",
    nome: "Beach Volley",
    descrizione: "Formula rapida e spettacolare, perfetta per vivere il torneo con energia e ritmo.",
    minPlayers: 3,
    maxPlayers: 5,
    etaMinima: 16,
    quota: "15€ a giocatore",
    formula: "Gironi a 1 set, quarti e semifinali al meglio dei 3 set, finale al meglio dei 3 set.",
    colore: "from-amber-300 via-orange-400 to-rose-500",
    icona: "Waves",
    programma: [
      "Sabato 14:00: consegna moduli, pagamento e buono evento",
      "Sabato 14:30: inizio fase a gironi fino alla mattina della domenica",
      "Domenica 9:30: quarti di finale",
      "Domenica 12:30: semifinali",
      "Domenica 14:00: finalina 3°-4° posto",
      "Domenica 14:30: finale",
    ],
    iscrizione: [
      "Un referente iscrive tutta la squadra.",
      "Tutti i giocatori devono aver compiuto 16 anni.",
      "Serve la liberatoria firmata per ogni atleta, anche minorenne.",
      "Sono ammessi massimo 5 giocatori per squadra.",
      "E' previsto uno sconto di 5€ per ogni giocatore tesserato VBSM nella stagione precedente o gia' confermato per la stagione 26-27.",
    ],
    regolamento: [
      "Regolamento scaricabile dal PDF allegato.",
    ],
  },
}

export function getTorneo24hDisciplina(slug?: string | null): Torneo24hDisciplinaConfig {
  return slug === "beach" ? torneo24hDiscipline.beach : torneo24hDiscipline.splash
}

export function calculateAgeFromBirthdate(birthdate: string, referenceDate = new Date()): number | null {
  const parsed = new Date(`${birthdate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return null

  let age = referenceDate.getFullYear() - parsed.getFullYear()
  const monthDiff = referenceDate.getMonth() - parsed.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < parsed.getDate())) {
    age -= 1
  }

  return age
}

export function buildTournamentRegistrationNote(params: {
  disciplina: Torneo24hDisciplinaConfig
  nomeSquadra: string
  nomeReferente: string
  emailReferente: string
  telefonoReferente: string
  bonificoUrl: string
  players: Array<{ nome: string; cognome: string; eta: number }>
}) {
  const playersText = params.players
    .map((player, index) => `${index + 1}. ${player.nome} ${player.cognome} - eta ${player.eta}`)
    .join("\n")

  return [
    `Disciplina: ${params.disciplina.nome}`,
    `Squadra: ${params.nomeSquadra}`,
    `Referente: ${params.nomeReferente}`,
    `Email referente: ${params.emailReferente}`,
    `Telefono referente: ${params.telefonoReferente}`,
    `Bonifico: ${params.bonificoUrl}`,
    `Giocatori:\n${playersText}`,
  ].join("\n\n")
}

function escapePdfText(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
}

function stripAccents(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
}

function createPdfContent(lines: string[]) {
  const commands: string[] = []
  commands.push("BT")
  commands.push("/F1 18 Tf")
  commands.push("50 800 Td")
  commands.push(`(${escapePdfText(stripAccents(lines[0]))}) Tj`)
  commands.push("/F1 11 Tf")
  commands.push("0 -26 Td")

  for (let i = 1; i < lines.length; i += 1) {
    const line = stripAccents(lines[i])
    if (!line) {
      commands.push("0 -14 Td")
      continue
    }
    commands.push(`(${escapePdfText(line)}) Tj`)
    commands.push("0 -14 Td")
  }

  commands.push("ET")
  return commands.join("\n")
}

export function createTournamentRegulationPdf(config: Torneo24hDisciplinaConfig) {
  const lines = [
    `Torneo ${config.nome}`,
    "",
    "Programma",
    ...config.programma,
    "",
    "Iscrizioni",
    ...config.iscrizione,
    "",
    "Regolamento",
    ...config.regolamento,
    "",
    `Quota: ${config.quota}`,
    `Formula: ${config.formula}`,
  ]

  const contentStream = createPdfContent(lines)
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${Buffer.byteLength(contentStream, "ascii")} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ]

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = [0]

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "ascii"))
    pdf += object
  }

  const xrefOffset = Buffer.byteLength(pdf, "ascii")
  pdf += `xref\n0 ${offsets.length}\n`
  pdf += "0000000000 65535 f \n"
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return Buffer.from(pdf, "ascii")
}

export function getTorneo24hRegulationFile(slug?: string | null) {
  if (slug === "beach") {
    return {
      sourceFile: "Beach Volley.pdf",
      filename: "regolamento-beach-volley-24h.pdf",
    }
  }

  if (slug === "liberatoria") {
    return {
      sourceFile: "Liberatoria.pdf",
      filename: "liberatoria-24h.pdf",
    }
  }

  return {
    sourceFile: "Splash.pdf",
    filename: "regolamento-splash-volley-24h.pdf",
  }
}