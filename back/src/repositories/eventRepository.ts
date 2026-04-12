import pool from "../config/database";
import { Event, CreateEventDto, UpdateEventDto } from "../types";
import { calculateNextReminderDate } from "../utils/dateUtils";
import cacheService from "../services/cacheService";
import { CacheKeys } from "../services/cacheKeys";

const FORBIDDEN_HORSE_ERROR = "FORBIDDEN_HORSE";
const HORSE_REQUIRED_ERROR = "HORSE_REQUIRED";

export class EventRepository {
    private eventProductsReady = false;

    async findAll(horseId?: string, ownerUserId?: string): Promise<Event[]> {
        await this.ensureEventProductsTable();
        const cacheKey = CacheKeys.eventsListKey(horseId, ownerUserId);
        const cached = await cacheService.get<Event[]>(cacheKey);
        if (cached) return cached;

        const result = ownerUserId
            ? horseId
                ? await pool.query(
                      `
                        SELECT e.*
                        FROM events e
                        INNER JOIN horses h ON h.id = e.horse_id
                        WHERE h.user_id = $1 AND e.horse_id = $2
                        ORDER BY e.event_date DESC
                      `,
                      [ownerUserId, horseId],
                  )
                : await pool.query(
                      `
                        SELECT e.*
                        FROM events e
                        INNER JOIN horses h ON h.id = e.horse_id
                        WHERE h.user_id = $1
                        ORDER BY e.event_date DESC
                      `,
                      [ownerUserId],
                  )
            : horseId
              ? await pool.query(
                    "SELECT * FROM events WHERE horse_id = $1 ORDER BY event_date DESC",
                    [horseId],
                )
              : await pool.query("SELECT * FROM events ORDER BY event_date DESC");

        const events = await this.attachProductIds(result.rows.map(this.mapRowToEvent));
        await cacheService.set(cacheKey, events, 300);
        return events;
    }

    async findById(id: string, ownerUserId?: string): Promise<Event | null> {
        await this.ensureEventProductsTable();
        if (!ownerUserId) {
            const cacheKey = CacheKeys.eventKey(id);
            const cached = await cacheService.get<Event>(cacheKey);
            if (cached) return cached;
        }

        const result = ownerUserId
            ? await pool.query(
                  `
                    SELECT e.*
                    FROM events e
                    INNER JOIN horses h ON h.id = e.horse_id
                    WHERE e.id = $1 AND h.user_id = $2
                  `,
                  [id, ownerUserId],
              )
            : await pool.query("SELECT * FROM events WHERE id = $1", [id]);

        if (result.rows.length === 0) return null;
        const [event] = await this.attachProductIds([this.mapRowToEvent(result.rows[0])]);
        if (!ownerUserId) {
            await cacheService.set(CacheKeys.eventKey(id), event, 600);
        }
        return event;
    }

    async create(data: CreateEventDto, ownerUserId?: string): Promise<Event> {
        await this.ensureEventProductsTable();
        if (ownerUserId && !data.horse_id) {
            throw new Error(HORSE_REQUIRED_ERROR);
        }
        if (ownerUserId && data.horse_id) {
            const isOwner = await this.horseBelongsToUser(data.horse_id, ownerUserId);
            if (!isOwner) throw new Error(FORBIDDEN_HORSE_ERROR);
        }

        const eventDate = new Date(data.event_date);
        let nextReminderDate: Date | null = null;
        if (
            data.reminder_enabled &&
            (data.reminder_interval_days ||
                data.reminder_interval_months ||
                data.reminder_interval_years)
        ) {
            nextReminderDate = calculateNextReminderDate(
                eventDate,
                data.reminder_interval_days,
                data.reminder_interval_months,
                data.reminder_interval_years,
            );
        }

        const result = await pool.query(
            `INSERT INTO events (
                name, description, event_date, horse_id, product_id, is_care, reminder_type,
                activity_type, activity_duration_minutes, activity_intensity, activity_comment,
                reminder_enabled, reminder_interval_days, reminder_interval_months, reminder_interval_years, next_reminder_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *`,
            [
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
            ],
        );

        const event = this.mapRowToEvent(result.rows[0]);
        await this.syncEventProducts(
            event.id,
            this.normalizeProductIds(data.product_ids, data.product_id),
        );
        const [eventWithProducts] = await this.attachProductIds([event]);
        await this.invalidateCache(event.id, event.horse_id, ownerUserId);
        return eventWithProducts;
    }

    async update(
        id: string,
        data: UpdateEventDto,
        ownerUserId?: string,
    ): Promise<Event | null> {
        await this.ensureEventProductsTable();
        const existing = await this.findById(id, ownerUserId);
        if (!existing) return null;
        if (ownerUserId && data.horse_id) {
            const isOwner = await this.horseBelongsToUser(data.horse_id, ownerUserId);
            if (!isOwner) throw new Error(FORBIDDEN_HORSE_ERROR);
        }

        let nextReminderDate: Date | null = existing.next_reminder_date ?? null;
        if (
            data.reminder_enabled !== undefined ||
            data.event_date ||
            data.reminder_interval_days !== undefined ||
            data.reminder_interval_months !== undefined ||
            data.reminder_interval_years !== undefined
        ) {
            const eventDate = data.event_date
                ? new Date(data.event_date)
                : existing.event_date;
            const reminderEnabled =
                data.reminder_enabled !== undefined
                    ? data.reminder_enabled
                    : existing.reminder_enabled;
            const intervalDays =
                data.reminder_interval_days !== undefined
                    ? data.reminder_interval_days
                    : existing.reminder_interval_days || undefined;
            const intervalMonths =
                data.reminder_interval_months !== undefined
                    ? data.reminder_interval_months
                    : existing.reminder_interval_months || undefined;
            const intervalYears =
                data.reminder_interval_years !== undefined
                    ? data.reminder_interval_years
                    : existing.reminder_interval_years || undefined;

            if (reminderEnabled && (intervalDays || intervalMonths || intervalYears)) {
                nextReminderDate = calculateNextReminderDate(
                    eventDate,
                    intervalDays,
                    intervalMonths,
                    intervalYears,
                );
            } else {
                nextReminderDate = null;
            }
        }

        const result = await pool.query(
            `UPDATE events SET
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
            RETURNING *`,
            [
                data.name || null,
                data.description !== undefined ? data.description : null,
                data.event_date || null,
                data.horse_id || null,
                data.product_id || null,
                data.is_care !== undefined ? data.is_care : null,
                data.reminder_type || null,
                data.activity_type || null,
                data.activity_duration_minutes !== undefined
                    ? data.activity_duration_minutes
                    : null,
                data.activity_intensity || null,
                data.activity_comment || null,
                data.reminder_enabled !== undefined ? data.reminder_enabled : null,
                data.reminder_interval_days !== undefined
                    ? data.reminder_interval_days
                    : null,
                data.reminder_interval_months !== undefined
                    ? data.reminder_interval_months
                    : null,
                data.reminder_interval_years !== undefined
                    ? data.reminder_interval_years
                    : null,
                nextReminderDate,
                id,
            ],
        );

        if (result.rows.length === 0) return null;
        const event = this.mapRowToEvent(result.rows[0]);
        if (data.product_ids !== undefined || data.product_id !== undefined) {
            await this.syncEventProducts(
                id,
                this.normalizeProductIds(data.product_ids, data.product_id),
            );
        }
        const [eventWithProducts] = await this.attachProductIds([event]);
        await this.invalidateCache(id, event.horse_id, ownerUserId);
        return eventWithProducts;
    }

    async delete(id: string, ownerUserId?: string): Promise<boolean> {
        await this.ensureEventProductsTable();
        const existing = await this.findById(id, ownerUserId);
        if (!existing) return false;
        const result = await pool.query("DELETE FROM events WHERE id = $1", [id]);
        const deleted = (result.rowCount ?? 0) > 0;
        if (deleted) {
            await this.invalidateCache(id, existing.horse_id, ownerUserId);
        }
        return deleted;
    }

    async getReminders(horseId?: string, ownerUserId?: string): Promise<Event[]> {
        await this.ensureEventProductsTable();
        const safeHorseId = horseId && horseId.length > 0 ? horseId : undefined;
        const cacheKey = CacheKeys.eventsRemindersKey(safeHorseId, ownerUserId);
        const cached = await cacheService.get<Event[]>(cacheKey);
        if (cached) return cached;

        const result = ownerUserId
            ? safeHorseId
                ? await pool.query(
                      `
                        SELECT e.*
                        FROM events e
                        INNER JOIN horses h ON h.id = e.horse_id
                        WHERE e.reminder_enabled = true
                          AND h.user_id = $1
                          AND e.horse_id = $2
                        ORDER BY e.event_date ASC
                      `,
                      [ownerUserId, safeHorseId],
                  )
                : await pool.query(
                      `
                        SELECT e.*
                        FROM events e
                        INNER JOIN horses h ON h.id = e.horse_id
                        WHERE e.reminder_enabled = true
                          AND h.user_id = $1
                        ORDER BY e.event_date ASC
                      `,
                      [ownerUserId],
                  )
            : safeHorseId
              ? await pool.query(
                    `
                        SELECT * FROM events
                        WHERE reminder_enabled = true
                          AND horse_id = $1
                        ORDER BY event_date ASC
                    `,
                    [safeHorseId],
                )
              : await pool.query(
                    `
                        SELECT * FROM events
                        WHERE reminder_enabled = true
                        ORDER BY event_date ASC
                    `,
                );

        const events = await this.attachProductIds(result.rows.map(this.mapRowToEvent));
        await cacheService.set(cacheKey, events, 60);
        return events;
    }

    private async invalidateCache(
        eventId: string,
        horseId?: string,
        ownerUserId?: string,
    ): Promise<void> {
        await cacheService.delete(CacheKeys.eventKey(eventId));
        await cacheService.delete(CacheKeys.eventsListKey(undefined, ownerUserId));
        await cacheService.delete(
            CacheKeys.eventsRemindersKey(undefined, ownerUserId),
        );
        if (horseId) {
            await cacheService.delete(CacheKeys.eventsListKey(horseId, ownerUserId));
            await cacheService.delete(
                CacheKeys.eventsRemindersKey(horseId, ownerUserId),
            );
        }
    }

    private async horseBelongsToUser(
        horseId: string,
        ownerUserId: string,
    ): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1 FROM horses WHERE id = $1 AND user_id = $2`,
            [horseId, ownerUserId],
        );
        return (result.rowCount ?? 0) > 0;
    }

    private mapRowToEvent(row: any): Event {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            event_date: new Date(row.event_date),
            horse_id: row.horse_id || undefined,
            product_id: row.product_id || undefined,
            product_ids: Array.isArray(row.product_ids)
                ? row.product_ids.map(String)
                : undefined,
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

    private normalizeProductIds(
        productIds?: string[] | null,
        productId?: string | null,
    ): string[] {
        const ids = (productIds && productIds.length > 0 ? productIds : productId ? [productId] : [])
            .map((id) => String(id).trim())
            .filter(Boolean);
        return Array.from(new Set(ids));
    }

    private async ensureEventProductsTable(): Promise<void> {
        if (this.eventProductsReady) return;
        await pool.query(`
            CREATE TABLE IF NOT EXISTS event_products (
                event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
                product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (event_id, product_id)
            );
        `);
        this.eventProductsReady = true;
    }

    private async syncEventProducts(
        eventId: string,
        productIds: string[],
    ): Promise<void> {
        await pool.query(`DELETE FROM event_products WHERE event_id = $1`, [eventId]);
        if (!productIds.length) return;
        await pool.query(
            `
                INSERT INTO event_products (event_id, product_id)
                SELECT $1::uuid, unnest($2::uuid[])
                ON CONFLICT DO NOTHING
            `,
            [eventId, productIds],
        );
    }

    private async attachProductIds(events: Event[]): Promise<Event[]> {
        if (!events.length) return events;
        const ids = events.map((event) => event.id);
        const result = await pool.query(
            `
                SELECT event_id::text, array_agg(product_id::text) AS product_ids
                FROM event_products
                WHERE event_id = ANY($1::uuid[])
                GROUP BY event_id
            `,
            [ids],
        );
        const map = new Map<string, string[]>(
            result.rows.map((row) => [
                String(row.event_id),
                Array.isArray(row.product_ids) ? row.product_ids.map(String) : [],
            ]),
        );
        return events.map((event) => {
            const merged = this.normalizeProductIds(
                map.get(event.id) ?? [],
                event.product_id,
            );
            return { ...event, product_ids: merged.length ? merged : undefined };
        });
    }
}

export { FORBIDDEN_HORSE_ERROR, HORSE_REQUIRED_ERROR };
export default new EventRepository();
