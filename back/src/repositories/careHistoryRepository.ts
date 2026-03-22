import pool from "../config/database";
import { CareHistoryEntry, CreateCareHistoryDto } from "../types";

export class CareHistoryRepository {
    async insert(data: CreateCareHistoryDto): Promise<CareHistoryEntry> {
        const result = await pool.query(
            `INSERT INTO care_history (
                original_event_id, horse_id, product_id, name, description, event_date, care_status
            ) VALUES ($1, $2, $3, $4, $5, $6, 'done')
            RETURNING *`,
            [
                data.original_event_id,
                data.horse_id,
                data.product_id || null,
                data.name,
                data.description || null,
                data.event_date,
            ],
        );
        return this.mapRow(result.rows[0]);
    }

    async findByHorseId(horseId?: string): Promise<CareHistoryEntry[]> {
        const result = horseId
            ? await pool.query(
                  "SELECT * FROM care_history WHERE horse_id = $1 ORDER BY event_date DESC",
                  [horseId],
              )
            : await pool.query(
                  "SELECT * FROM care_history ORDER BY event_date DESC",
              );
        return result.rows.map(this.mapRow);
    }

    private mapRow(row: any): CareHistoryEntry {
        return {
            id: row.id,
            original_event_id: row.original_event_id || undefined,
            horse_id: row.horse_id,
            product_id: row.product_id || undefined,
            name: row.name,
            description: row.description || undefined,
            event_date: new Date(row.event_date),
            care_status: "done",
            created_at: new Date(row.created_at),
        };
    }
}

export default new CareHistoryRepository();
