"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const eventRepository_1 = __importDefault(require("../repositories/eventRepository"));
class EventController {
    async getAll(req, res) {
        try {
            const events = await eventRepository_1.default.findAll();
            res.json(events);
        }
        catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({ error: 'Failed to fetch events' });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const event = await eventRepository_1.default.findById(id);
            if (!event) {
                res.status(404).json({ error: 'Event not found' });
                return;
            }
            res.json(event);
        }
        catch (error) {
            console.error('Error fetching event:', error);
            res.status(500).json({ error: 'Failed to fetch event' });
        }
    }
    async create(req, res) {
        try {
            const data = req.body;
            // Validation
            if (!data.name || !data.event_date) {
                res.status(400).json({ error: 'Name and event_date are required' });
                return;
            }
            const event = await eventRepository_1.default.create(data);
            res.status(201).json(event);
        }
        catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json({ error: 'Failed to create event' });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const event = await eventRepository_1.default.update(id, data);
            if (!event) {
                res.status(404).json({ error: 'Event not found' });
                return;
            }
            res.json(event);
        }
        catch (error) {
            console.error('Error updating event:', error);
            res.status(500).json({ error: 'Failed to update event' });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await eventRepository_1.default.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Event not found' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting event:', error);
            res.status(500).json({ error: 'Failed to delete event' });
        }
    }
    async getUpcomingReminders(req, res) {
        try {
            const events = await eventRepository_1.default.getUpcomingReminders();
            res.json(events);
        }
        catch (error) {
            console.error('Error fetching upcoming reminders:', error);
            res.status(500).json({ error: 'Failed to fetch upcoming reminders' });
        }
    }
}
exports.EventController = EventController;
exports.default = new EventController();
//# sourceMappingURL=eventController.js.map