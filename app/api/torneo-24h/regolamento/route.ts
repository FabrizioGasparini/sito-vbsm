import { readFile } from "fs/promises"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { getTorneo24hRegulationFile } from "@/lib/torneo-24h"

export async function GET(request: NextRequest) {
  const disciplina = request.nextUrl.searchParams.get("disciplina")
  const file = getTorneo24hRegulationFile(disciplina)
  const filePath = path.join(process.cwd(), file.sourceFile)
  const pdfBuffer = await readFile(filePath)

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdfBuffer.byteLength),
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
