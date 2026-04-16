import { Request, Response } from "express";
import eventRepository from "../repositories/eventRepository";
import careHistoryRepository from "../repositories/careHistoryRepository";
import careTypeRepository from "../repositories/careTypeRepository";
import {
    CreateCareTypeDto,
    CreateEventDto,
    ToggleCareTypeFavoriteDto,
    UpdateEventDto,
} from "../types";
import { normalizeHorseId } from "../utils/normalizeHorseId";
import { calculateNextReminderDate } from "../utils/dateUtils";
import path from "path";
import fs from "fs";
import { documentsUploadDirPath } from "../config/documentUpload";
import {
    FORBIDDEN_HORSE_ERROR,
    HORSE_REQUIRED_ERROR,
} from "../repositories/eventRepository";

export class EventController {
    async getCareTypes(req: Request, res: Response): Promise<void> {
        try {
            if (!req.userId) {
                // In authMode "none", no userId is attached; return no custom types.
                res.json([]);
                return;
            }
            const careTypes = await careTypeRepository.findAllByUser(req.userId);
            res.json(careTypes);
        } catch (error) {
            console.error("Error fetching care types:", error);
            res.status(500).json({ error: "Failed to fetch care types" });
        }
    }

    async createCareType(req: Request, res: Response): Promise<void> {
        try {
            if (!req.userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const data = req.body as CreateCareTypeDto;
            const name = data.name?.trim();
            const category = data.category?.trim();

            if (!name || !category) {
                res.status(400).json({ error: "name and category are required" });
                return;
            }

            const result = await careTypeRepository.createForUser(req.userId, {
                name,
                category,
            });

            res.status(result.created ? 201 : 200).json(result.careType);
        } catch (error) {
            console.error("Error creating care type:", error);
            res.status(500).json({ error: "Failed to create care type" });
        }
    }

    async toggleCareTypeFavorite(req: Request, res: Response): Promise<void> {
        try {
            if (!req.userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }

            const data = req.body as ToggleCareTypeFavoriteDto;
            const name = data.name?.trim();
            const category = data.category?.trim();
            const isFavorite = Boolean(data.is_favorite);

            if (!name || !category) {
                res.status(400).json({ error: "name and category are required" });
                return;
            }

            const careType = await careTypeRepository.setFavoriteForUser(req.userId, {
                name,
                category,
                is_favorite: isFavorite,
            });
            res.json(careType);
        } catch (error) {
            console.error("Error toggling care type favorite:", error);
            res.status(500).json({ error: "Failed to update favorite status" });
        }
    }

    async deleteCareType(req: Request, res: Response): Promise<void> {
        try {
            if (!req.userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const name = (req.params.name || "").trim();
            if (!name) {
                res.status(400).json({ error: "name is required" });
                return;
            }
            const deleted = await careTypeRepository.deleteByName(req.userId, decodeURIComponent(name));
            if (!deleted) {
                res.status(404).json({ error: "Care type not found" });
                return;
            }
            res.status(204).send();
        } catch (error) {
            console.error("Error deleting care type:", error);
            res.status(500).json({ error: "Failed to delete care type" });
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const horseId = req.query.horseId as string | undefined;
            const events = await eventRepository.findAll(horseId, req.userId);
            res.json(events);
        } catch (error) {
            console.error("Error fetching events:", error);
            res.status(500).json({ error: "Failed to fetch events" });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const event = await eventRepository.findById(id, req.userId);

            if (!event) {
                res.status(404).json({ error: "Event not found" });
                return;
            }

            res.json(event);
        } catch (error) {
            console.error("Error fetching event:", error);
            res.status(500).json({ error: "Failed to fetch event" });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const data: CreateEventDto = req.body;

            // Validation
            if (!data.name || !data.event_date) {
                res.status(400).json({
                    error: "Name and event_date are required",
                });
                return;
            }

            const event = await eventRepository.create(data, req.userId);
            res.status(201).json(event);
        } catch (error) {
            if (error instanceof Error && error.message === HORSE_REQUIRED_ERROR) {
                res.status(400).json({
                    error: "horse_id est requis pour créer un événement en mode utilisateur",
                });
                return;
            }
            if (error instanceof Error && error.message === FORBIDDEN_HORSE_ERROR) {
                res.status(403).json({ error: "Accès refusé à ce cheval" });
                return;
            }
            console.error("Error creating event:", error);
            res.status(500).json({ error: "Failed to create event" });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const data: UpdateEventDto = req.body;

            const event = await eventRepository.update(id, data, req.userId);

            if (!event) {
                res.status(404).json({ error: "Event not found" });
                return;
            }

            res.json(event);
        } catch (error) {
            if (error instanceof Error && error.message === FORBIDDEN_HORSE_ERROR) {
                res.status(403).json({ error: "Accès refusé à ce cheval" });
                return;
            }
            console.error("Error updating event:", error);
            res.status(500).json({ error: "Failed to update event" });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await eventRepository.delete(id, req.userId);

            if (!deleted) {
                res.status(404).json({ error: "Event not found" });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error("Error deleting event:", error);
            res.status(500).json({ error: "Failed to delete event" });
        }
    }

    async getReminders(req: Request, res: Response) {
        try {
          const horseId = normalizeHorseId(req.query.horseId);
          const events = await eventRepository.getReminders(horseId, req.userId);
          res.json(events);
        } catch (error) {
          console.error("Error fetching reminders:", error);
          res.status(500).json({ error: "Failed to fetch reminders" });
        }
    }

    async markCareDone(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { event_date: doneDateStr } = req.body as { event_date: string };

            if (!doneDateStr) {
                res.status(400).json({ error: "event_date is required" });
                return;
            }

            const event = await eventRepository.findById(id, req.userId);
            if (!event) {
                res.status(404).json({ error: "Event not found" });
                return;
            }

            if (!event.is_care) {
                res.status(400).json({ error: "Event is not a care" });
                return;
            }

            const isRecurring =
                event.reminder_enabled &&
                Boolean(
                    event.reminder_interval_days ||
                        event.reminder_interval_months ||
                        event.reminder_interval_years,
                );

            const entry = await careHistoryRepository.insert({
                original_event_id: id,
                horse_id: event.horse_id!,
                product_id: event.product_id,
                category: event.category,
                name: event.name,
                description: event.description,
                event_date: doneDateStr,
            });

            if (isRecurring) {
                const doneDate = new Date(doneDateStr);
                const nextDate = calculateNextReminderDate(
                    doneDate,
                    event.reminder_interval_days,
                    event.reminder_interval_months,
                    event.reminder_interval_years,
                );
                const formattedNext =
                    nextDate?.toISOString().split("T")[0] ?? doneDateStr;
                await eventRepository.update(id, {
                    name: event.name,
                    description: "",
                    event_date: formattedNext,
                    reminder_enabled: true,
                }, req.userId);
                const previousAttachment = await eventRepository.getEventAttachment(
                    id,
                    req.userId,
                );
                if (previousAttachment?.file_path) {
                    const attachmentPath = path.join(
                        documentsUploadDirPath,
                        path.basename(previousAttachment.file_path),
                    );
                    if (fs.existsSync(attachmentPath)) {
                        fs.unlinkSync(attachmentPath);
                    }
                }
                await eventRepository.removeAttachment(id, req.userId);
            } else {
                await eventRepository.delete(id, req.userId);
            }

            res.status(201).json(entry);
        } catch (error) {
            console.error("Error marking care done:", error);
            res.status(500).json({ error: "Failed to mark care done" });
        }
    }

    async uploadAttachment(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!req.file) {
                res.status(400).json({ error: "No file uploaded" });
                return;
            }
            const existingAttachment = await eventRepository.getEventAttachment(
                id,
                req.userId,
            );
            const filePath = `/uploads/documents/${req.file.filename}`;
            const updated = await eventRepository.setAttachment(
                id,
                filePath,
                req.file.originalname,
                req.userId,
            );
            if (!updated) {
                res.status(404).json({ error: "Event not found" });
                return;
            }
            if (existingAttachment?.file_path) {
                const oldFilePath = path.join(
                    documentsUploadDirPath,
                    path.basename(existingAttachment.file_path),
                );
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            res.json(updated);
        } catch (error) {
            console.error("Error uploading event attachment:", error);
            res.status(500).json({ error: "Failed to upload attachment" });
        }
    }

    async deleteAttachment(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const existingAttachment = await eventRepository.getEventAttachment(
                id,
                req.userId,
            );
            const removed = await eventRepository.removeAttachment(id, req.userId);
            if (!removed) {
                res.status(404).json({ error: "Attachment not found" });
                return;
            }
            if (existingAttachment?.file_path) {
                const oldFilePath = path.join(
                    documentsUploadDirPath,
                    path.basename(existingAttachment.file_path),
                );
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            res.status(204).send();
        } catch (error) {
            console.error("Error deleting event attachment:", error);
            res.status(500).json({ error: "Failed to delete attachment" });
        }
    }
}

export default new EventController();
