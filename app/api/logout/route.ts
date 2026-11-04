import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })
  // Stessi attributi del cookie di login, così il browser lo sovrascrive ed elimina correttamente
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  return response
}
