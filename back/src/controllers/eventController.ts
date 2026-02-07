import { Request, Response } from "express";
import eventRepository from "../repositories/eventRepository";
import { CreateEventDto, UpdateEventDto } from "../types";
import { normalizeHorseId } from "../utils/normalizeHorseId";

export class EventController {
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const horseId = req.query.horseId as string | undefined;
            const events = await eventRepository.findAll(horseId);
            res.json(events);
        } catch (error) {
            console.error("Error fetching events:", error);
            res.status(500).json({ error: "Failed to fetch events" });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const event = await eventRepository.findById(id);

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

            const event = await eventRepository.create(data);
            res.status(201).json(event);
        } catch (error) {
            console.error("Error creating event:", error);
            res.status(500).json({ error: "Failed to create event" });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const data: UpdateEventDto = req.body;

            const event = await eventRepository.update(id, data);

            if (!event) {
                res.status(404).json({ error: "Event not found" });
                return;
            }

            res.json(event);
        } catch (error) {
            console.error("Error updating event:", error);
            res.status(500).json({ error: "Failed to update event" });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await eventRepository.delete(id);

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
          const events = await eventRepository.getReminders(horseId);
          res.json(events);
        } catch (error) {
          console.error("Error fetching reminders:", error);
          res.status(500).json({ error: "Failed to fetch reminders" });
        }
    }
      
}

export default new EventController();
