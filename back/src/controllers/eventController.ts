import { Request, Response } from "express";
import eventRepository from "../repositories/eventRepository";
import careHistoryRepository from "../repositories/careHistoryRepository";
import { CreateEventDto, UpdateEventDto } from "../types";
import { normalizeHorseId } from "../utils/normalizeHorseId";
import { calculateNextReminderDate } from "../utils/dateUtils";

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

    async markCareDone(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { event_date: doneDateStr } = req.body as { event_date: string };

            if (!doneDateStr) {
                res.status(400).json({ error: "event_date is required" });
                return;
            }

            const event = await eventRepository.findById(id);
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
                    event_date: formattedNext,
                    reminder_enabled: true,
                });
            } else {
                await eventRepository.delete(id);
            }

            res.status(201).json(entry);
        } catch (error) {
            console.error("Error marking care done:", error);
            res.status(500).json({ error: "Failed to mark care done" });
        }
    }
}

export default new EventController();
