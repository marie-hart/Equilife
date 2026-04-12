import { Request, Response } from "express";
import rationRepository from "../repositories/rationRepository";
import { CreateRationDto, UpdateRationDto } from "../types";
import {
    FORBIDDEN_HORSE_ERROR,
    HORSE_REQUIRED_ERROR,
} from "../repositories/rationRepository";

export class RationController {
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const horseId = req.query.horseId as string | undefined;
            const rations = await rationRepository.findAll(horseId, req.userId);
            res.json(rations);
        } catch (error) {
            console.error("Error fetching rations:", error);
            res.status(500).json({ error: "Failed to fetch rations" });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const rationId = req.params.id;
            if (!rationId) {
                res.status(400).json({ error: "id is required" });
                return;
            }
            const ration = await rationRepository.findById(rationId, req.userId);
            if (!ration) {
                res.status(404).json({ error: "Ration not found" });
                return;
            }
            res.json(ration);
        } catch (error) {
            console.error("Error fetching ration:", error);
            res.status(500).json({ error: "Failed to fetch ration" });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const data: CreateRationDto = req.body;
            if (!data.horse_id || !data.name) {
                res.status(400).json({
                    error: "horse_id and name are required",
                });
                return;
            }
            if (!Array.isArray(data.items) || data.items.length === 0) {
                res.status(400).json({
                    error: "At least one item is required",
                });
                return;
            }

            const ration = await rationRepository.create(data, req.userId);
            res.status(201).json(ration);
        } catch (error) {
            if (error instanceof Error && error.message === HORSE_REQUIRED_ERROR) {
                res.status(400).json({
                    error: "horse_id est requis pour créer une ration en mode utilisateur",
                });
                return;
            }
            if (error instanceof Error && error.message === FORBIDDEN_HORSE_ERROR) {
                res.status(403).json({ error: "Accès refusé à ce cheval" });
                return;
            }
            console.error("Error creating ration:", error);
            res.status(500).json({ error: "Failed to create ration" });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const rationId = req.params.id;
            if (!rationId) {
                res.status(400).json({ error: "id is required" });
                return;
            }
            const data: UpdateRationDto = req.body;
            if (data.items && !Array.isArray(data.items)) {
                res.status(400).json({ error: "items must be an array" });
                return;
            }
            const updated = await rationRepository.update(rationId, data, req.userId);
            if (!updated) {
                res.status(404).json({ error: "Ration not found" });
                return;
            }
            res.json(updated);
        } catch (error) {
            if (error instanceof Error && error.message === FORBIDDEN_HORSE_ERROR) {
                res.status(403).json({ error: "Accès refusé à cette ration" });
                return;
            }
            console.error("Error updating ration:", error);
            res.status(500).json({ error: "Failed to update ration" });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const rationId = req.params.id;
            if (!rationId) {
                res.status(400).json({ error: "id is required" });
                return;
            }
            const deleted = await rationRepository.delete(rationId, req.userId);
            if (!deleted) {
                res.status(404).json({ error: "Ration not found" });
                return;
            }
            res.status(204).send();
        } catch (error) {
            console.error("Error deleting ration:", error);
            res.status(500).json({ error: "Failed to delete ration" });
        }
    }
}

export default new RationController();
