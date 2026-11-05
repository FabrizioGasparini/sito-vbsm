import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    // recupera il token dai cookie
    const token = req.cookies.get("token")?.value;

    // se l'utente prova ad accedere alla pagina di login `/login` con token → redirect all'area riservata
    if (req.nextUrl.pathname == "/login") {
        if (token) return NextResponse.redirect(new URL("/admin", req.url));
        else return NextResponse.next();
    }

    if (!token && req.nextUrl.pathname.startsWith("/admin")) return NextResponse.redirect(new URL("/login", req.url));

    return NextResponse.next();
}

// Il middleware gira solo dove serve: area riservata e login.
// Le API verificano autonomamente il JWT (lib/auth.ts).
export const config = {
    matcher: ["/admin/:path*", "/login"],
};
