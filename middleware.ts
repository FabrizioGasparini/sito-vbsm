import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

async function isTournamentBlocked(req: NextRequest) {
    try {
        const response = await fetch(new URL("/api/torneo-24h/status", req.url), {
            cache: "no-store",
        });

        if (!response.ok) return false;

        const data = await response.json();
        return Boolean(data.blocked);
    } catch {
        return false;
    }
}

export async function middleware(req: NextRequest) {
    // recupera il token dai cookie
    const token = req.cookies.get("token")?.value;

    if (req.nextUrl.pathname.startsWith("/api")) {
        return;
    }

    if (req.nextUrl.pathname.startsWith("/manutenzione")) {
        return NextResponse.next();
    }

    if (req.nextUrl.pathname.startsWith("/torneo-24h")) {
        const blocked = await isTournamentBlocked(req);
        if (blocked) {
            return NextResponse.redirect(new URL("/manutenzione/torneo-24h", req.url));
        }
    }

    // se l'utente prova ad accedere alla pagina di login `/login` con token → redirect alla home
    if (req.nextUrl.pathname == "/login") {
        if (token) return NextResponse.redirect(new URL("/admin", req.url));
        else return NextResponse.next();
    }

    if (!token && req.nextUrl.pathname.startsWith("/admin")) return NextResponse.redirect(new URL("/login", req.url));

    return NextResponse.next();
}

// solo i percorsi /admin/* devono essere protetti, ma escludi anche api e images
export const config = {
    matcher: ["/admin/:path*", "/login", "/api/:path*", "/images/:path*", "/torneo-24h/:path*"],
};
