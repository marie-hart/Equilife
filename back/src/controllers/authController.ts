import { Request, Response } from "express";
import { isAuthConfigured, verifyPin, signToken } from "../middleware/auth";

export default {
    login(req: Request, res: Response): void {
        if (!isAuthConfigured()) {
            res.status(503).json({
                error: "Authentification non configurée côté serveur",
            });
            return;
        }
        const pin = typeof req.body?.pin === "string" ? req.body.pin.trim() : "";
        if (!pin) {
            res.status(400).json({ error: "PIN requis" });
            return;
        }
        if (!verifyPin(pin)) {
            res.status(401).json({ error: "PIN incorrect" });
            return;
        }
        const token = signToken();
        res.json({ token });
    },

    status(req: Request, res: Response): void {
        res.json({
            authRequired: isAuthConfigured(),
        });
    },
};
