import { Request, Response } from "express";
import careHistoryRepository from "../repositories/careHistoryRepository";

export class CareHistoryController {
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const horseId = req.query.horseId as string | undefined;
            const entries = await careHistoryRepository.findByHorseId(
                horseId,
                req.userId,
            );
            res.json(entries);
        } catch (error) {
            console.error("Error fetching care history:", error);
            res.status(500).json({ error: "Failed to fetch care history" });
        }
    }
}

export default new CareHistoryController();
