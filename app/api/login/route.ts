import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ success: false, error: "Body non valido" }, { status: 400 });
    }

    const { username, password } = body;

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    const viewerUser = process.env.VIEWER_USERNAME;
    const viewerPass = process.env.VIEWER_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!adminUser || !adminPass || !jwtSecret) {
        console.error("Missing ADMIN_USERNAME, ADMIN_PASSWORD or JWT_SECRET");
        return NextResponse.json({ success: false, error: "Server Configuration Error" }, { status: 500 });
    }

    const matchedProfile =
        username === adminUser && password === adminPass
            ? { username: adminUser, role: "admin" as const }
            : viewerUser && viewerPass && username === viewerUser && password === viewerPass
                ? { username: viewerUser, role: "viewer" as const }
                : null;

    if (matchedProfile) {
        const token = jwt.sign({ username: matchedProfile.username, role: matchedProfile.role }, jwtSecret, { expiresIn: "1h" });

        const response = NextResponse.json({ success: true });
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60,
            path: "/",
        });

        return response;
    }

    return NextResponse.json({ success: false, error: "Credenziali non valide" }, { status: 401 });
}
