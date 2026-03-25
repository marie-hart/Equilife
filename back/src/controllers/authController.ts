import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getAuthMode, isUserAuthEnabled, signUserToken } from "../middleware/auth";
import userRepository, {
    isValidEmailFormat,
    normalizeEmail,
} from "../repositories/userRepository";
import { validatePasswordPolicy } from "../utils/passwordPolicy";

const BCRYPT_ROUNDS = 12;

export default {
    register(req: Request, res: Response): void {
        if (!isUserAuthEnabled()) {
            res.status(503).json({
                error: "Inscription non disponible sur ce serveur",
            });
            return;
        }
        const emailRaw = typeof req.body?.email === "string" ? req.body.email : "";
        const password =
            typeof req.body?.password === "string" ? req.body.password : "";
        const email = normalizeEmail(emailRaw);
        if (!email || !isValidEmailFormat(email)) {
            res.status(400).json({ error: "Adresse e-mail invalide" });
            return;
        }
        const policyErr = validatePasswordPolicy(password);
        if (policyErr) {
            res.status(400).json({ error: policyErr });
            return;
        }
        void (async () => {
            try {
                const existing = await userRepository.findByEmail(email);
                if (existing) {
                    res.status(409).json({ error: "Cette adresse e-mail est déjà utilisée" });
                    return;
                }
                const passwordHash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
                const user = await userRepository.create(email, passwordHash);
                const token = signUserToken(user.id, user.email);
                res.status(201).json({
                    token,
                    user: { id: user.id, email: user.email },
                });
            } catch (e) {
                console.error("register:", e);
                const detail =
                    e instanceof Error ? e.message : String(e);
                const expose =
                    process.env.NODE_ENV !== "production" ? detail : undefined;
                res.status(500).json({
                    error: expose
                        ? `Inscription impossible (${expose})`
                        : "Inscription impossible",
                });
            }
        })();
    },

    login(req: Request, res: Response): void {
        if (!isUserAuthEnabled()) {
            res.status(503).json({
                error:
                    "Connexion par e-mail non activée (USER_AUTH_ENABLED=true et JWT_SECRET requis)",
            });
            return;
        }
        const emailRaw = typeof req.body?.email === "string" ? req.body.email : "";
        const password =
            typeof req.body?.password === "string" ? req.body.password : "";
        const email = normalizeEmail(emailRaw);
        if (!email || !password) {
            res.status(400).json({ error: "E-mail et mot de passe requis" });
            return;
        }
        void (async () => {
            try {
                const user = await userRepository.findByEmail(email);
                if (!user || !bcrypt.compareSync(password, user.password_hash)) {
                    res.status(401).json({ error: "Identifiants incorrects" });
                    return;
                }
                const token = signUserToken(user.id, user.email);
                res.json({
                    token,
                    user: { id: user.id, email: user.email },
                });
            } catch (e) {
                console.error("login:", e);
                const detail =
                    e instanceof Error ? e.message : String(e);
                const expose =
                    process.env.NODE_ENV !== "production" ? detail : undefined;
                res.status(500).json({
                    error: expose
                        ? `Connexion impossible (${expose})`
                        : "Connexion impossible",
                });
            }
        })();
    },

    status(_req: Request, res: Response): void {
        const mode = getAuthMode();
        res.json({
            authRequired: mode !== "none",
            authMode: mode,
        });
    },

    me(req: Request, res: Response): void {
        if (!isUserAuthEnabled()) {
            res.status(503).json({ error: "Non disponible" });
            return;
        }
        if (!req.userId) {
            res.status(401).json({ error: "Authentification requise" });
            return;
        }
        void (async () => {
            try {
                const user = await userRepository.findById(req.userId!);
                if (!user) {
                    res.status(404).json({ error: "Utilisateur introuvable" });
                    return;
                }
                res.json({ id: user.id, email: user.email });
            } catch (e) {
                console.error("me:", e);
                res.status(500).json({ error: "Erreur serveur" });
            }
        })();
    },

    changePassword(req: Request, res: Response): void {
        if (!isUserAuthEnabled()) {
            res.status(503).json({ error: "Non disponible" });
            return;
        }
        if (!req.userId) {
            res.status(401).json({ error: "Authentification requise" });
            return;
        }
        const currentPassword =
            typeof req.body?.currentPassword === "string"
                ? req.body.currentPassword
                : "";
        const newPassword =
            typeof req.body?.newPassword === "string"
                ? req.body.newPassword
                : "";
        if (!currentPassword || !newPassword) {
            res.status(400).json({
                error: "Mot de passe actuel et nouveau mot de passe requis",
            });
            return;
        }
        const policyErr = validatePasswordPolicy(newPassword);
        if (policyErr) {
            res.status(400).json({ error: policyErr });
            return;
        }
        void (async () => {
            try {
                const user = await userRepository.findById(req.userId!);
                if (
                    !user ||
                    !bcrypt.compareSync(currentPassword, user.password_hash)
                ) {
                    res.status(401).json({
                        error: "Mot de passe actuel incorrect",
                    });
                    return;
                }
                const passwordHash = bcrypt.hashSync(newPassword, BCRYPT_ROUNDS);
                await userRepository.updatePasswordHash(req.userId!, passwordHash);
                res.status(204).send();
            } catch (e) {
                console.error("changePassword:", e);
                res.status(500).json({ error: "Mise à jour impossible" });
            }
        })();
    },
};
