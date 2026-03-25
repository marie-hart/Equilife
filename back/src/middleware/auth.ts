import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";
const USER_AUTH_ENABLED =
    process.env.USER_AUTH_ENABLED === "true" || process.env.USER_AUTH_ENABLED === "1";

export const isUserAuthEnabled = (): boolean =>
    USER_AUTH_ENABLED && Boolean(JWT_SECRET);

const UUID_SUB_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidSub(sub: string | undefined): boolean {
    return Boolean(sub && UUID_SUB_RE.test(sub));
}

export const signUserToken = (userId: string, email: string): string => {
    if (!JWT_SECRET) throw new Error("JWT_SECRET not configured");
    return jwt.sign(
        {
            sub: userId,
            email,
            typ: "user",
            iat: Math.floor(Date.now() / 1000),
        },
        JWT_SECRET,
        { expiresIn: "7d" },
    );
};

/** Mode d’auth exposé au client : uniquement comptes e-mail / mot de passe. */
export function getAuthMode(): "none" | "user" {
    return isUserAuthEnabled() ? "user" : "none";
}

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    if (!isUserAuthEnabled()) {
        next();
        return;
    }
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) {
        res.status(401).json({ error: "Authentification requise" });
        return;
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET, {
            algorithms: ["HS256"],
        }) as jwt.JwtPayload;
        const sub = typeof payload.sub === "string" ? payload.sub : undefined;

        if (!isUuidSub(sub)) {
            res.status(401).json({ error: "Token invalide ou expiré" });
            return;
        }
        req.userId = sub;
        next();
    } catch {
        res.status(401).json({ error: "Token invalide ou expiré" });
    }
};
