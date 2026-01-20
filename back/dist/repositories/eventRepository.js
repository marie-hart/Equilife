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
    async findAll(horseId) {
        // Vérifier le cache
        const cacheKey = cacheKeys_1.CacheKeys.eventsListKey(horseId);
        const cached = await cacheService_1.default.get(cacheKey);
        if (cached) {
            return cached;
        }
        // Récupérer depuis la base de données
        const result = horseId
            ? await database_1.default.query("SELECT * FROM events WHERE horse_id = $1 ORDER BY event_date DESC", [horseId])
            : await database_1.default.query("SELECT * FROM events ORDER BY event_date DESC");
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
            (data.reminder_interval_days ||
                data.reminder_interval_months ||
                data.reminder_interval_years)) {
            nextReminderDate = (0, dateUtils_1.calculateNextReminderDate)(eventDate, data.reminder_interval_days, data.reminder_interval_months, data.reminder_interval_years);
        }
        const result = await database_1.default.query(`INSERT INTO events (
        name, description, event_date, horse_id, product_id, is_care, reminder_type,
        activity_type, activity_duration_minutes, activity_intensity, activity_comment,
        reminder_enabled, reminder_interval_days, reminder_interval_months, reminder_interval_years, next_reminder_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`, [
            data.name,
            data.description || null,
            data.event_date,
            data.horse_id || null,
            data.product_id || null,
            data.is_care || false,
            data.reminder_type || null,
            data.activity_type || null,
            data.activity_duration_minutes || null,
            data.activity_intensity || null,
            data.activity_comment || null,
            data.reminder_enabled || false,
            data.reminder_interval_days || null,
            data.reminder_interval_months || null,
            data.reminder_interval_years || null,
            nextReminderDate || null,
        ]);
        const event = this.mapRowToEvent(result.rows[0]);
        // Invalider le cache
        await this.invalidateCache(event.id, event.horse_id);
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
            data.reminder_interval_days !== undefined ||
            data.reminder_interval_months !== undefined ||
            data.reminder_interval_years !== undefined) {
            const eventDate = data.event_date
                ? new Date(data.event_date)
                : existing.event_date;
            const reminderEnabled = data.reminder_enabled !== undefined
                ? data.reminder_enabled
                : existing.reminder_enabled;
            const intervalDays = data.reminder_interval_days !== undefined
                ? data.reminder_interval_days
                : existing.reminder_interval_days || undefined;
            const intervalMonths = data.reminder_interval_months !== undefined
                ? data.reminder_interval_months
                : existing.reminder_interval_months || undefined;
            const intervalYears = data.reminder_interval_years !== undefined
                ? data.reminder_interval_years
                : existing.reminder_interval_years || undefined;
            if (reminderEnabled && (intervalDays || intervalMonths || intervalYears)) {
                nextReminderDate = (0, dateUtils_1.calculateNextReminderDate)(eventDate, intervalDays, intervalMonths, intervalYears);
            }
            else {
                nextReminderDate = null;
            }
        }
        const result = await database_1.default.query(`UPDATE events SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        event_date = COALESCE($3, event_date),
        horse_id = COALESCE($4, horse_id),
        product_id = COALESCE($5, product_id),
        is_care = COALESCE($6, is_care),
        reminder_type = COALESCE($7, reminder_type),
        activity_type = COALESCE($8, activity_type),
        activity_duration_minutes = COALESCE($9, activity_duration_minutes),
        activity_intensity = COALESCE($10, activity_intensity),
        activity_comment = COALESCE($11, activity_comment),
        reminder_enabled = COALESCE($12, reminder_enabled),
        reminder_interval_days = COALESCE($13, reminder_interval_days),
        reminder_interval_months = COALESCE($14, reminder_interval_months),
        reminder_interval_years = COALESCE($15, reminder_interval_years),
        next_reminder_date = $16
      WHERE id = $17
      RETURNING *`, [
            data.name || null,
            data.description !== undefined ? data.description : null,
            data.event_date || null,
            data.horse_id || null,
            data.product_id || null,
            data.is_care !== undefined ? data.is_care : null,
            data.reminder_type || null,
            data.activity_type || null,
            data.activity_duration_minutes !== undefined ? data.activity_duration_minutes : null,
            data.activity_intensity || null,
            data.activity_comment || null,
            data.reminder_enabled !== undefined ? data.reminder_enabled : null,
            data.reminder_interval_days !== undefined ? data.reminder_interval_days : null,
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
        await this.invalidateCache(id, event.horse_id);
        return event;
    }
    async delete(id) {
        const existing = await this.findById(id);
        const result = await database_1.default.query("DELETE FROM events WHERE id = $1", [id]);
        const deleted = result.rowCount !== null && result.rowCount > 0;
        if (deleted) {
            await this.invalidateCache(id, existing?.horse_id);
        }
        return deleted;
    }
    async getReminders(horseId) {
        // Vérifier le cache
        const cacheKey = cacheKeys_1.CacheKeys.eventsRemindersKey(horseId);
        const cached = await cacheService_1.default.get(cacheKey);
        if (cached) {
            return cached;
        }
        // Récupérer depuis la base de données
        const result = horseId
            ? await database_1.default.query(`SELECT * FROM events
           WHERE reminder_enabled = true
           AND horse_id = $1
           ORDER BY event_date ASC`, [horseId])
            : await database_1.default.query(`SELECT * FROM events
           WHERE reminder_enabled = true
           ORDER BY event_date ASC`);
        const events = result.rows.map(this.mapRowToEvent);
        // Mettre en cache (TTL de 1 minute car les rappels peuvent changer rapidement)
        await cacheService_1.default.set(cacheKey, events, 60);
        return events;
    }
    /**
     * Invalide le cache pour un événement
     */
    async invalidateCache(eventId, horseId) {
        await cacheService_1.default.delete(cacheKeys_1.CacheKeys.eventKey(eventId));
        await cacheService_1.default.delete(cacheKeys_1.CacheKeys.eventsListKey());
        await cacheService_1.default.delete(cacheKeys_1.CacheKeys.eventsRemindersKey());
        if (horseId) {
            await cacheService_1.default.delete(cacheKeys_1.CacheKeys.eventsListKey(horseId));
            await cacheService_1.default.delete(cacheKeys_1.CacheKeys.eventsRemindersKey(horseId));
        }
    }
    mapRowToEvent(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            event_date: new Date(row.event_date),
            horse_id: row.horse_id || undefined,
            product_id: row.product_id || undefined,
            reminder_enabled: row.reminder_enabled,
            reminder_type: row.reminder_type || undefined,
            activity_type: row.activity_type || undefined,
            activity_duration_minutes: row.activity_duration_minutes || undefined,
            activity_intensity: row.activity_intensity || undefined,
            activity_comment: row.activity_comment || undefined,
            reminder_interval_days: row.reminder_interval_days,
            reminder_interval_months: row.reminder_interval_months,
            reminder_interval_years: row.reminder_interval_years,
            is_care: row.is_care,
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