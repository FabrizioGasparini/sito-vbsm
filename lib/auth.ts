import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type AuthRole = "admin" | "viewer"

type AuthPayload = {
    username?: string
    role?: AuthRole
}

export type AuthContext = {
    authenticated: boolean
    username: string | null
    role: AuthRole | null
}

export function getAuthContext(req: NextRequest): AuthContext {
    try {
        const token = req.cookies.get("token")?.value;
        const jwtSecret = process.env.JWT_SECRET;

        if (!token || !jwtSecret) return { authenticated: false, username: null, role: null };

        try {
            const payload = jwt.verify(token, jwtSecret) as AuthPayload;
            return {
                authenticated: true,
                username: payload.username ?? null,
                role: payload.role ?? "admin",
            }
        } catch {
            return { authenticated: false, username: null, role: null }
        }
    } catch {
        return { authenticated: false, username: null, role: null }
    }
}

export function isAuthenticated(req: NextRequest) {
    return getAuthContext(req).authenticated
}

export function isAdmin(req: NextRequest) {
    return getAuthContext(req).role === "admin"
}

export function canManageTorneo24h(req: NextRequest) {
    const role = getAuthContext(req).role
    return role === "admin" || role === "viewer"
}