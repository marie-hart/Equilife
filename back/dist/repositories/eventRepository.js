"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
const dateUtils_1 = require("../utils/dateUtils");
const cacheService_1 = __importDefault(require("../services/cacheService"));
const cacheKeys_1 = require("../services/cacheKeys");
class EventRepository {
    async findAll() {
        // Vérifier le cache
        const cacheKey = cacheKeys_1.CacheKeys.eventsListKey();
        const cached = await cacheService_1.default.get(cacheKey);
        if (cached) {
            return cached;
        }
        // Récupérer depuis la base de données
        const result = await database_1.default.query("SELECT * FROM events ORDER BY event_date DESC");
        const events = result.rows.map(this.mapRowToEvent);
        // Mettre en cache (TTL de 5 minutes)
        await cacheService_1.default.set(cacheKey, events, 300);
        return events;
    }
    async findById(id) {
        // Vérifier le cache
        const cacheKey = cacheKeys_1.CacheKeys.eventKey(id);
        const cached = await cacheService_1.default.get(cacheKey);
        if (cached) {
            return cached;
        }
        // Récupérer depuis la base de données
        const result = await database_1.default.query("SELECT * FROM events WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const event = this.mapRowToEvent(result.rows[0]);
        // Mettre en cache (TTL de 10 minutes)
        await cacheService_1.default.set(cacheKey, event, 600);
        return event;
    }
    async create(data) {
        const eventDate = new Date(data.event_date);
        let nextReminderDate = null;
        if (data.reminder_enabled &&
            (data.reminder_interval_months || data.reminder_interval_years)) {
            nextReminderDate = (0, dateUtils_1.calculateNextReminderDate)(eventDate, data.reminder_interval_months, data.reminder_interval_years);
        }
        const result = await database_1.default.query(`INSERT INTO events (
        name, description, event_date, reminder_enabled,
        reminder_interval_months, reminder_interval_years, next_reminder_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`, [
            data.name,
            data.description || null,
            data.event_date,
            data.reminder_enabled || false,
            data.reminder_interval_months || null,
            data.reminder_interval_years || null,
            nextReminderDate || null,
        ]);
        const event = this.mapRowToEvent(result.rows[0]);
        // Invalider le cache
        await this.invalidateCache(event.id);
        return event;
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing) {
            return null;
        }
        // Calculer la nouvelle date de rappel si nécessaire
        let nextReminderDate = existing.next_reminder_date ?? null;
        if (data.reminder_enabled !== undefined ||
            data.event_date ||
            data.reminder_interval_months !== undefined ||
            data.reminder_interval_years !== undefined) {
            const eventDate = data.event_date
                ? new Date(data.event_date)
                : existing.event_date;
            const reminderEnabled = data.reminder_enabled !== undefined
                ? data.reminder_enabled
                : existing.reminder_enabled;
            const intervalMonths = data.reminder_interval_months !== undefined
                ? data.reminder_interval_months
                : existing.reminder_interval_months || undefined;
            const intervalYears = data.reminder_interval_years !== undefined
                ? data.reminder_interval_years
                : existing.reminder_interval_years || undefined;
            if (reminderEnabled && (intervalMonths || intervalYears)) {
                nextReminderDate = (0, dateUtils_1.calculateNextReminderDate)(eventDate, intervalMonths, intervalYears);
            }
            else {
                nextReminderDate = null;
            }
        }
        const result = await database_1.default.query(`UPDATE events SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        event_date = COALESCE($3, event_date),
        reminder_enabled = COALESCE($4, reminder_enabled),
        reminder_interval_months = COALESCE($5, reminder_interval_months),
        reminder_interval_years = COALESCE($6, reminder_interval_years),
        next_reminder_date = $7
      WHERE id = $8
      RETURNING *`, [
            data.name || null,
            data.description !== undefined ? data.description : null,
            data.event_date || null,
            data.reminder_enabled !== undefined ? data.reminder_enabled : null,
            data.reminder_interval_months !== undefined
                ? data.reminder_interval_months
                : null,
            data.reminder_interval_years !== undefined
                ? data.reminder_interval_years
                : null,
            nextReminderDate,
            id,
        ]);
        if (result.rows.length === 0) {
            return null;
        }
        const event = this.mapRowToEvent(result.rows[0]);
        // Invalider le cache
        await this.invalidateCache(id);
        return event;
    }
    async delete(id) {
        const result = await database_1.default.query("DELETE FROM events WHERE id = $1", [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
    async getUpcomingReminders() {
        // Vérifier le cache
        const cacheKey = cacheKeys_1.CacheKeys.eventsRemindersKey();
        const cached = await cacheService_1.default.get(cacheKey);
        if (cached) {
            return cached;
        }
        // Récupérer depuis la base de données
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const result = await database_1.default.query(`SELECT * FROM events
       WHERE reminder_enabled = true
       AND next_reminder_date IS NOT NULL
       AND next_reminder_date <= $1
       ORDER BY next_reminder_date ASC`, [today]);
        const events = result.rows.map(this.mapRowToEvent);
        // Mettre en cache (TTL de 1 minute car les rappels peuvent changer rapidement)
        await cacheService_1.default.set(cacheKey, events, 60);
        return events;
    }
    /**
     * Invalide le cache pour un événement
     */
    async invalidateCache(eventId) {
        await cacheService_1.default.delete(cacheKeys_1.CacheKeys.eventKey(eventId));
        await cacheService_1.default.delete(cacheKeys_1.CacheKeys.eventsListKey());
        await cacheService_1.default.delete(cacheKeys_1.CacheKeys.eventsRemindersKey());
    }
    mapRowToEvent(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            event_date: new Date(row.event_date),
            reminder_enabled: row.reminder_enabled,
            reminder_interval_months: row.reminder_interval_months,
            reminder_interval_years: row.reminder_interval_years,
            last_reminder_date: row.last_reminder_date
                ? new Date(row.last_reminder_date)
                : undefined,
            next_reminder_date: row.next_reminder_date
                ? new Date(row.next_reminder_date)
                : undefined,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
        };
    }
}
exports.EventRepository = EventRepository;
exports.default = new EventRepository();
//# sourceMappingURL=eventRepository.js.map