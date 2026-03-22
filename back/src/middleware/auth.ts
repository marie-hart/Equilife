import { timingSafeEqual } from "crypto";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";
const APP_PIN = process.env.APP_PIN || "";
const AUTH_ENABLED = process.env.AUTH_ENABLED === "true" || process.env.AUTH_ENABLED === "1";

export const isAuthConfigured = (): boolean =>
    AUTH_ENABLED && Boolean(JWT_SECRET && APP_PIN);

/**
 * Vérifie le PIN via comparaison à temps constant
 */
export const verifyPin = (input: string): boolean => {
    if (!APP_PIN) return false;
    const a = Buffer.from(input, "utf8");
    const b = Buffer.from(APP_PIN, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
};

/**
 * Génère un JWT pour une session authentifiée
 */
export const signToken = (): string => {
    if (!JWT_SECRET) throw new Error("JWT_SECRET not configured");
    return jwt.sign(
        { sub: "user", iat: Math.floor(Date.now() / 1000) },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
};

/**
 * Middleware : exige un JWT valide. Si auth non configurée, laisse passer.
 */
export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!isAuthConfigured()) {
        next();
        return;
    }
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ")
        ? header.slice(7)
        : undefined;
    if (!token) {
        res.status(401).json({ error: "Authentification requise" });
        return;
    }
    try {
        jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
        next();
    } catch {
        res.status(401).json({ error: "Token invalide ou expiré" });
    }
};
