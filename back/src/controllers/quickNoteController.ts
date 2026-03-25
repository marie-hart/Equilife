import { Request, Response } from "express";
import quickNoteRepository from "../repositories/quickNoteRepository";

function getUserId(req: Request): string | undefined {
    return req.userId;
}

export default {
    async list(req: Request, res: Response): Promise<void> {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({ error: "Authentification requise" });
            return;
        }
        try {
            const rows = await quickNoteRepository.findAllByUserId(userId);
            res.json(
                rows.map((r) => ({
                    id: r.id,
                    content: r.content,
                    created_at: r.created_at.toISOString(),
                    updated_at: r.updated_at.toISOString(),
                })),
            );
        } catch (e) {
            console.error("quick notes list:", e);
            res.status(500).json({ error: "Échec du chargement des notes" });
        }
    },

    async create(req: Request, res: Response): Promise<void> {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({ error: "Authentification requise" });
            return;
        }
        const content =
            typeof req.body?.content === "string" ? req.body.content.trim() : "";
        if (!content) {
            res.status(400).json({ error: "Contenu requis" });
            return;
        }
        try {
            const row = await quickNoteRepository.create(userId, content);
            res.status(201).json({
                id: row.id,
                content: row.content,
                created_at: row.created_at.toISOString(),
                updated_at: row.updated_at.toISOString(),
            });
        } catch (e) {
            console.error("quick note create:", e);
            res.status(500).json({ error: "Échec de la création" });
        }
    },

    async update(req: Request, res: Response): Promise<void> {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({ error: "Authentification requise" });
            return;
        }
        const { id } = req.params;
        const content =
            typeof req.body?.content === "string" ? req.body.content.trim() : "";
        if (!content) {
            res.status(400).json({ error: "Contenu requis" });
            return;
        }
        try {
            const row = await quickNoteRepository.update(id, userId, content);
            if (!row) {
                res.status(404).json({ error: "Note introuvable" });
                return;
            }
            res.json({
                id: row.id,
                content: row.content,
                created_at: row.created_at.toISOString(),
                updated_at: row.updated_at.toISOString(),
            });
        } catch (e) {
            console.error("quick note update:", e);
            res.status(500).json({ error: "Échec de la mise à jour" });
        }
    },

    async remove(req: Request, res: Response): Promise<void> {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({ error: "Authentification requise" });
            return;
        }
        const { id } = req.params;
        try {
            const deleted = await quickNoteRepository.delete(id, userId);
            if (!deleted) {
                res.status(404).json({ error: "Note introuvable" });
                return;
            }
            res.status(204).send();
        } catch (e) {
            console.error("quick note delete:", e);
            res.status(500).json({ error: "Échec de la suppression" });
        }
    },
};
